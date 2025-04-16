# Lambda Function for Employee ID Sequence Generation

```
import boto3
import json
import logging
from datetime import datetime

# Configure logging
logger = logging.getLogger()
logger.setLevel(logging.INFO)

# Initialize AWS clients
cognito_client = boto3.client("cognito-idp")
identity_client = boto3.client("cognito-identity")
dynamodb = boto3.resource("dynamodb")
tenant_table = dynamodb.Table("Tenants-x7kpaqah6vbgxmc5vdr4eda22m-NONE")
sequence_table = dynamodb.Table("TenantEmployeeSequence-x7kpaqah6vbgxmc5vdr4eda22m-NONE")
timestamp = datetime.utcnow().isoformat() + "Z"

def create_cognito_group(user_pool_id, group_name):
    """Creates a group in the Cognito user pool."""
    try:
        response = cognito_client.create_group(
            GroupName=group_name,
            UserPoolId=user_pool_id,
            Description=f"Group for {group_name}"
        )
        logger.info(f"Created Cognito group: {group_name}")
        return response["Group"]["GroupName"]
    except cognito_client.exceptions.GroupExistsException:
        logger.warning(f"Group {group_name} already exists.")
        return group_name
    except Exception as e:
        logger.error(f"Error creating group: {str(e)}", exc_info=True)
        return None

def add_user_to_group(user_pool_id, admin_email, group_name):
    """Adds the user to the Cognito group."""
    try:
        cognito_client.admin_add_user_to_group(
            UserPoolId=user_pool_id,
            Username=admin_email,
            GroupName=group_name
        )
        logger.info(f"Added {admin_email} to group {group_name}")
        return True
    except Exception as e:
        logger.error(f"Error adding user to group: {str(e)}", exc_info=True)
        return False

def sign_up_user(user_pool_id, client_id, admin_email, admin_password, admin_name, phone_number, tenant_name, identity_pool_id):
    """Signs up a user in Cognito."""
    try:
        response = cognito_client.sign_up(
            ClientId=client_id,
            Username=admin_email,
            Password=admin_password,
            UserAttributes=[
                {"Name": "email", "Value": admin_email},
                {"Name": "name", "Value": admin_name},
                {"Name": "phone_number", "Value": phone_number},
                {"Name": "custom:tenant_name", "Value": tenant_name},
                {"Name": "custom:user_pool_id", "Value": user_pool_id},
                {"Name": "custom:client_id", "Value": client_id},
                {"Name": "custom:identity_pool_id", "Value": identity_pool_id}                
            ]
        )
        logger.info(f"Confirmation code sent to {admin_email}")
        return response["UserSub"]
    except Exception as e:
        logger.error(f"Error signing up user: {str(e)}", exc_info=True)
        return None

def confirm_user_sign_up(client_id, admin_email, confirmation_code):
    """Confirms a user sign-up using a confirmation code."""
    try:
        cognito_client.confirm_sign_up(
            ClientId=client_id,
            Username=admin_email,
            ConfirmationCode=confirmation_code
        )
        logger.info(f"User {admin_email} confirmed successfully.")
        return True
    except Exception as e:
        logger.error(f"Error confirming user: {str(e)}", exc_info=True)
        return False

def initialize_sequence_for_tenant(tenant_name):
    """Initializes a sequence for the tenant in the TenantEmployeeSequence table."""
    try:
        response = sequence_table.put_item(
            Item={
                "tenant_name": tenant_name,
                "series_number": 1 # Initializing sequence number for the tenant
            }
        )
        logger.info(f"Initialized sequence for tenant {tenant_name}.")
        return True
    except Exception as e:
        logger.error(f"Error initializing sequence for tenant {tenant_name}: {str(e)}", exc_info=True)
        return False

def get_next_sequence_for_tenant(tenant_name):
    """Fetches the next sequence number for the tenant."""
    try:
        response = sequence_table.get_item(
            Key={"tenant_name": tenant_name}
        )
        if 'Item' in response:
            series_number = response['Item']['series_number']
            # Incrementing the series number
            new_series_number = series_number + 1
            # Updating the sequence number in the table
            sequence_table.update_item(
                Key={"tenant_name": tenant_name},
                UpdateExpression="SET series_number = :val",
                ExpressionAttributeValues={":val": new_series_number}
            )
            logger.info(f"Next sequence for tenant {tenant_name}: {new_series_number}")
            return new_series_number
        else:
            # If no sequence is found, initialize the sequence
            initialize_sequence_for_tenant(tenant_name)
            return 1  # Returning the first sequence number
    except Exception as e:
        logger.error(f"Error getting next sequence for tenant {tenant_name}: {str(e)}", exc_info=True)
        return None

def lambda_handler(event, context):
    try:
        logger.info(f"Received event: {json.dumps(event)}")
        action = event.get("action")

        if action == "sign_up":
            tenant_name = event.get("tenant_name")
            admin_email = event.get("admin_email")
            admin_password = event.get("admin_password")
            admin_name = event.get("admin_name")
            phone_number = event.get("phone_number", "")

            if not all([tenant_name, admin_email, admin_password, admin_name]):
                return {"statusCode": 400, "body": json.dumps({"message": "Missing required parameters"})}

            logger.info(f"Processing tenant: {tenant_name}")

            existing_tenant = tenant_table.get_item(Key={"id": tenant_name})
            if "Item" in existing_tenant:
                return {"statusCode": 400, "body": json.dumps({"message": "Tenant already exists!"})}

            # Create Cognito User Pool
            user_pool_response = cognito_client.create_user_pool(
                PoolName=f"{tenant_name}-user-pool",
                AutoVerifiedAttributes=["email"],
                UsernameAttributes=["email"],
                Schema=[
                    {"Name": "email", "AttributeDataType": "String", "Required": True},
                    {"Name": "name", "AttributeDataType": "String", "Required": True},
                    {"Name": "phone_number", "AttributeDataType": "String", "Mutable": True},
                    {"Name": "tenant_name", "AttributeDataType": "String", "Required": False},
                    {"Name": "user_pool_id", "AttributeDataType": "String", "Required": False},
                    {"Name": "onboarding_id", "AttributeDataType": "String", "Required": False},
                    {"Name": "client_id", "AttributeDataType": "String", "Required": False},
                    {"Name": "identity_pool_id", "AttributeDataType": "String", "Required": False},
                    {"Name": "employment_type", "AttributeDataType": "String", "Required": False},
                    {"Name": "designation", "AttributeDataType": "String", "Required": False},
                    {"Name": "department", "AttributeDataType": "String", "Required": False},
                    {"Name": "role", "AttributeDataType": "String", "Required": False},
                    {"Name": "date_of_joining", "AttributeDataType": "String", "Required": False},  
                    {"Name": "employeeId", "AttributeDataType": "String", "Required": False},                   
                ]
            )
            user_pool_id = user_pool_response["UserPool"]["Id"]

            client_response = cognito_client.create_user_pool_client(
                UserPoolId=user_pool_id,
                ClientName=f"{tenant_name}-client",
                GenerateSecret=False,
                ExplicitAuthFlows=["ALLOW_USER_PASSWORD_AUTH", "ALLOW_REFRESH_TOKEN_AUTH"],
            )
            client_id = client_response["UserPoolClient"]["ClientId"]

            response_identity = identity_client.create_identity_pool(
                IdentityPoolName=f"{tenant_name}-identity-pool",
                AllowUnauthenticatedIdentities=False,
                CognitoIdentityProviders=[
                    {
                        'ProviderName': f'cognito-idp.us-east-1.amazonaws.com/{user_pool_id}',
                        'ClientId': client_id,
                        'ServerSideTokenCheck': True
                    }
                ]
            )
            identity_pool_id = response_identity['IdentityPoolId']

            # Create Group
            group_name = create_cognito_group(user_pool_id, "tenant")

            # User Signup
            user_id = sign_up_user(
                user_pool_id=user_pool_id,
                client_id=client_id,
                admin_email=admin_email,
                admin_password=admin_password,
                admin_name=admin_name,
                phone_number=phone_number,
                tenant_name=tenant_name,
                identity_pool_id=identity_pool_id
            )

            if not user_id:
                return {"statusCode": 500, "body": json.dumps({"message": "User sign-up failed"})}

            # Initialize the sequence for the tenant
            next_sequence = get_next_sequence_for_tenant(tenant_name)

            return {
                "statusCode": 200,
                "body": json.dumps({
                    "message": "Sign-up initiated. Check email for confirmation code.",
                    "user_pool_id": user_pool_id,
                    "client_id": client_id,
                    "identity_pool_id": identity_pool_id,
                    "UserId": user_id,
                    "next_sequence": next_sequence
                })
            }

        elif action == "confirm_sign_up":
            admin_email = event.get("admin_email")
            confirmation_code = event.get("confirmationCode")
            client_id = event.get("client_id")
            user_pool_id = event.get("user_pool_id")
            identity_pool_id = event.get("identity_pool_id")
            tenant_name = event.get("tenant_name")

            if not all([admin_email, client_id, confirmation_code, user_pool_id, identity_pool_id]):
                return {"statusCode": 400, "body": json.dumps({"message": "Missing required parameters"})}

            confirmed = confirm_user_sign_up(client_id, admin_email, confirmation_code)

            if not confirmed:
                return {"statusCode": 400, "body": json.dumps({"message": "User confirmation failed"})}

            # Add user to the group
            added_to_group = add_user_to_group(user_pool_id, admin_email, "tenant")

            if not added_to_group:
                return {"statusCode": 500, "body": json.dumps({"message": "Failed to add user to group"})}

            tenant_table.put_item(Item={
                "id": tenant_name,
                "user_pool_id": user_pool_id,
                "tenant_name": tenant_name,
                "identity_pool_id": identity_pool_id,
                "client_id": client_id,
                "admin_email": admin_email,
                "admin_name": event.get("admin_name"),
                "phone_number": event.get("phone_number", ""),
                "group_name": "tenant",  # Storing group name
                "createdAt": timestamp,
                "updatedAt": timestamp,
                "UserID": event.get("UserId")
            })

            return {
                "statusCode": 200,
                "body": json.dumps({"message": "User confirmed, added to group, and stored in DynamoDB"})
            }

        else:
            return {"statusCode": 400, "body": json.dumps({"message": "Invalid action"})}

    except Exception as e:
        logger.error(f"Error: {str(e)}", exc_info=True)
        return {
            "statusCode": 500,
            "body": json.dumps({"message": "Internal Server Error", "error": str(e)})
        }
```
---        

This document explains how the Lambda function is designed to generate and manage the sequence number for the `employeeId` of each tenant in the system.

## Overview

The Lambda function performs various operations for tenant management, including the generation of sequence numbers for employee IDs. This functionality ensures that each employee within a tenant has a unique employee ID by generating sequential numbers for each new employee added to the tenant.

## Key Steps Involved

### 1. **Initialization of Sequence for Tenant**
   - When a new tenant is created, the Lambda function initializes a sequence for employee IDs specific to the tenant.
   - This sequence is stored in the DynamoDB table `TenantEmployeeSequence-x7kpaqah6vbgxmc5vdr4eda22m-NONE`.
   - The initial value for the sequence number is set to `1` for the tenant.

### 2. **Fetching the Next Sequence Number**
   - For each new employee added to a tenant, the function retrieves the current sequence number for the tenant from the `TenantEmployeeSequence` table.
   - If a sequence is found, it increments the number by 1 and returns the next available sequence number for the new employee.
   - If no sequence is found for the tenant, it initializes the sequence by setting the value to `1`.

### 3. **Assigning Employee ID**
   - The sequence number retrieved or initialized is used to assign a unique `employeeId` to the new employee.
   - This ensures that each employee within a tenant has a unique ID, which is crucial for identification and management within the system.

### 4. **Updating Sequence Number**
   - After assigning the employee ID to the new employee, the Lambda function updates the sequence number in the DynamoDB table.
   - This ensures that the next employee added to the tenant receives the correct sequence number.

## Sequence Table Structure

The sequence for each tenant is stored in a DynamoDB table called `TenantEmployeeSequence-x7kpaqah6vbgxmc5vdr4eda22m-NONE`. The table has the following structure:

| Attribute         | Description                      |
|-------------------|----------------------------------|
| **tenant_name**    | The name of the tenant           |
| **series_number**  | The current sequence number for employee IDs |

## Example Usage Flow

1. A new tenant is created, and the Lambda function initializes the sequence number for the tenant to `1`.
2. An employee is added to the tenant, and the Lambda function retrieves the next available sequence number, assigns it as the employee's ID, and updates the sequence to the next number (e.g., `2`).
3. The sequence continues to increment for each new employee added to the tenant.

## Error Handling

- If any error occurs while fetching or updating the sequence number, the function logs the error and returns an appropriate error message.
- If a sequence number cannot be initialized for a new tenant, the function returns an error response.

## Conclusion

The Lambda function ensures that each employee within a tenant has a unique and sequential `employeeId`, making it easier to manage employee data and avoid duplication. The function handles the initialization, retrieval, and updating of sequence numbers for employee IDs, ensuring smooth operation for tenant-based employee management.

---