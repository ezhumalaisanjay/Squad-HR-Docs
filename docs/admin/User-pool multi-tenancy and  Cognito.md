
# Multi-Tenant Cognito User Pool Setup

## Overview

This AWS Lambda function dynamically creates a Cognito User Pool for each tenant and registers an admin user. It also stores tenant details in DynamoDB for easy management.

## Prerequisites

- AWS Account with necessary IAM permissions
- DynamoDB table named `Tenants-6hbgc3slffcnpd6s73dlmt5fcm-NONE`
- AWS Lambda configured with access to Cognito and DynamoDB

## Functionality

1. Validates input parameters.
2. Checks if the tenant already exists in DynamoDB.
3. Creates a new Cognito User Pool for the tenant.
4. Generates a Cognito App Client for authentication.
5. Stores tenant details in DynamoDB.
6. Registers the admin user with the created User Pool.

## Lambda Function Code

```python
import boto3
import json
import logging
from datetime import datetime

# Configure logging
logger = logging.getLogger()
logger.setLevel(logging.INFO)

# Initialize AWS clients
cognito_client = boto3.client("cognito-idp")
dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table("Tenants-6hbgc3slffcnpd6s73dlmt5fcm-NONE")
timestamp = datetime.utcnow().isoformat() + "Z"

def lambda_handler(event, context):
    try:
        # Extract input parameters
        tenant_name = event.get("tenant_name")
        admin_email = event.get("admin_email")
        admin_password = event.get("admin_password")
        admin_name = event.get("admin_name")
        phone_number = event.get("phone_number", "")

        # Validate required parameters
        if not all([tenant_name, admin_email, admin_password, admin_name]):
            return {"statusCode": 400, "body": json.dumps({"message": "Missing required parameters"})}

        logger.info(f"Processing tenant: {tenant_name}")

        # Check if Tenant already exists
        existing_tenant = table.get_item(Key={"id": tenant_name})
        if "Item" in existing_tenant:
            logger.warning(f"Tenant '{tenant_name}' already exists.")
            return {"statusCode": 400, "body": json.dumps({"message": "Tenant already exists!"})}

        # Create a new Cognito User Pool
        user_pool_response = cognito_client.create_user_pool(
            PoolName=f"{tenant_name}-user-pool",
            AutoVerifiedAttributes=["email"],
            UsernameAttributes=["email"],
            Schema=[
                {"Name": "email", "AttributeDataType": "String", "Required": True},
                {"Name": "name", "AttributeDataType": "String", "Required": True},
                {"Name": "phone_number", "AttributeDataType": "String", "Mutable": True},
                {"Name": "custom:tenant_name", "AttributeDataType": "String", "Required": False},
            ]
        )

        user_pool_id = user_pool_response["UserPool"]["Id"]
        logger.info(f"Created Cognito User Pool: {user_pool_id}")

        # Create an App Client for the User Pool
        client_response = cognito_client.create_user_pool_client(
            UserPoolId=user_pool_id,
            ClientName=f"{tenant_name}-client",
            GenerateSecret=False,
            ExplicitAuthFlows=["ALLOW_USER_PASSWORD_AUTH", "ALLOW_REFRESH_TOKEN_AUTH"],
        )

        client_id = client_response["UserPoolClient"]["ClientId"]
        logger.info(f"Created Cognito App Client: {client_id}")

        # Store Tenant Details in DynamoDB
        table.put_item(Item={
            "id": tenant_name,
            "user_pool_id": user_pool_id,
            "tenant_name": tenant_name,
            "client_id": client_id,
            "admin_email": admin_email,
            "admin_name": admin_name,
            "phone_number": phone_number,
            "createdAt": timestamp,
            "updatedAt": timestamp
        })
        logger.info(f"Stored tenant {tenant_name} in DynamoDB")

        # Register Admin User in Cognito
        cognito_client.admin_create_user(
            UserPoolId=user_pool_id,
            Username=admin_email,
            UserAttributes=[
                {"Name": "email", "Value": admin_email},
                {"Name": "name", "Value": admin_name},
                {"Name": "phone_number", "Value": phone_number}
            ],
            TemporaryPassword=admin_password,
            MessageAction="SUPPRESS",
        )

        cognito_client.admin_set_user_password(
            UserPoolId=user_pool_id,
            Username=admin_email,
            Password=admin_password,
            Permanent=True
        )

        logger.info(f"Admin user '{admin_email}' registered successfully.")

        return {
            "statusCode": 200,
            "body": json.dumps({
                "message": "Tenant Created & Admin Registered",
                "user_pool_id": user_pool_id,
                "client_id": client_id
            })
        }

    except Exception as e:
        logger.error(f"Error: {str(e)}", exc_info=True)
        return {
            "statusCode": 500,
            "body": json.dumps({"message": "Internal Server Error", "error": str(e)})
        }
```

## Expected Event JSON

```json
{
  "tenant_name": "Sixty One Steps",
  "admin_email": "ezhumalaisanjay05@gmail.com",
  "admin_password": "Passw0rd@2023",
  "admin_name": "Admin User",
  "phone_number": "+917806980137"
}
```

## Response

On success:

```json
{
  "statusCode": 200,
  "body": "{\"message\": \"Tenant Created & Admin Registered\", \"user_pool_id\": \"us-east-1_abcdefg\", \"client_id\": \"xyz12345\"}"
}
```

On failure:

```json
{
  "statusCode": 500,
  "body": "{\"message\": \"Internal Server Error\", \"error\": \"error details\"}"
}
```

## Notes

- Ensure the IAM role assigned to Lambda has the necessary permissions to create Cognito user pools and modify DynamoDB.
- The function suppresses the Cognito default welcome email (`MessageAction="SUPPRESS"`).
- The admin user is created with a permanent password.

