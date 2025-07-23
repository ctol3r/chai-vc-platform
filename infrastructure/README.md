# Infrastructure

This folder contains Terraform code for optional AWS components.

## Cost Optimizer Lambda

The `cost-optimizer` module provisions a Lambda function that runs monthly to
right-size EKS node groups. The function is scheduled using an EventBridge cron
expression so that it executes on the first day of each month.

To deploy:

```bash
cd cost-optimizer
terraform init
terraform apply
```

Before applying, package the Lambda source into `cost_optimizer.zip`:

```bash
zip cost_optimizer.zip cost_optimizer.py
```

Adjust `variables.tf` for your AWS region as needed.
