provider "aws" {
  region = var.aws_region
}

resource "aws_iam_role" "cost_optimizer_role" {
  name = "cost-optimizer-lambda-role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17",
    Statement = [{
      Action = "sts:AssumeRole",
      Effect = "Allow",
      Principal = { Service = "lambda.amazonaws.com" }
    }]
  })
}

data "aws_iam_policy_document" "cost_optimizer_policy" {
  statement {
    actions   = ["eks:DescribeNodegroup", "eks:UpdateNodegroupConfig", "ec2:DescribeInstances"]
    resources = ["*"]
  }
}

resource "aws_iam_policy" "cost_optimizer_policy" {
  name   = "cost-optimizer-policy"
  policy = data.aws_iam_policy_document.cost_optimizer_policy.json
}

resource "aws_iam_role_policy_attachment" "attach_policy" {
  role       = aws_iam_role.cost_optimizer_role.name
  policy_arn = aws_iam_policy.cost_optimizer_policy.arn
}

resource "aws_lambda_function" "cost_optimizer" {
  function_name = "eks-cost-optimizer"
  role          = aws_iam_role.cost_optimizer_role.arn
  handler       = "cost_optimizer.lambda_handler"
  runtime       = "python3.11"

  filename         = "${path.module}/cost_optimizer.zip"
  source_code_hash = filebase64sha256("${path.module}/cost_optimizer.zip")
}

resource "aws_cloudwatch_event_rule" "monthly" {
  name                = "eks-cost-optimizer-monthly"
  schedule_expression = "cron(0 0 1 * ? *)"
}

resource "aws_cloudwatch_event_target" "trigger" {
  rule      = aws_cloudwatch_event_rule.monthly.name
  target_id = "cost-optimizer"
  arn       = aws_lambda_function.cost_optimizer.arn
}

resource "aws_lambda_permission" "allow_events" {
  statement_id  = "AllowExecutionFromCloudWatch"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.cost_optimizer.function_name
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.monthly.arn
}
