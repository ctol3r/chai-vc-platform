# Cost Optimizer Lambda

This Terraform module provisions a Lambda function used to right-size EKS node

The function runs once a month via an EventBridge cron schedule. It currently
contains placeholder logic that simply logs when it is executed.
