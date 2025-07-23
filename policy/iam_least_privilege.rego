package terraform.leastprivilege

deny[msg] {
  resource := input.resource_changes[_]
  resource.type == "aws_iam_policy"
  contains(resource.change.after.policy, "*")
  msg := sprintf("IAM policy '%s' uses wildcard privileges", [resource.address])
}
