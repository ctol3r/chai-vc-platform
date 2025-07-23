import boto3


def lambda_handler(event, context):
    """Placeholder EKS cost optimizer.

    In a real implementation this would analyze cluster metrics and
    right-size managed node groups. Here we simply log a message so
    the monthly schedule can be verified.
    """
    print("Running EKS cost optimizer")
    return {"status": "success"}
