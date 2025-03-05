# Multi-Tenant User Management with AWS Cognito

## Overview

This document outlines the implementation of a multi-tenant authentication system using multiple Cognito User Pools per tenant. Each tenant will have its own user pool, ensuring strict data isolation and access control. The architecture involves AWS Lambda functions to automate user pool creation, user registration, and tenant mapping.

---

## Architecture

- Each tenant has a dedicated Cognito User Pool.
- A centralized DynamoDB table maintains tenant-to-user pool mappings.
- AWS Lambda functions handle tenant registration, user sign-up, and authentication.
- API Gateway serves as the entry point for authentication requests.

---

## AWS Services Used

- **Amazon Cognito** (User Pools for authentication)
- **AWS Lambda** (Backend logic for tenant and user management)
- **Amazon DynamoDB** (Stores tenant-to-user pool mapping)
- **Amazon API Gateway** (Exposes authentication endpoints)

---

## Step 1: Create a Cognito User Pool Per Tenant

### Lambda Function: `create_tenant_user_pool`

```python
import boto3
import json

def create_cognito_user_pool(tenant_id):
    client = boto3.client('cognito-idp')
    response = client.create_user_pool(
        PoolName=f'Tenant-{tenant_id}',
        Policies={
            'PasswordPolicy': {
                'MinimumLength': 8,
                'RequireUppercase': True,
                'RequireLowercase': True,
                'RequireNumbers': True,
                'RequireSymbols': True
            }
        },
        Schema=[
            {'Name': 'email', 'AttributeDataType': 'String', 'Mutable': True, 'Required': True}
        ]
    )
    return response['UserPool']['Id']

def lambda_handler(event, context):
    tenant_id = event['tenant_id']
    user_pool_id = create_cognito_user_pool(tenant_id)
    return {
        'statusCode': 200,
        'body': json.dumps({'UserPoolId': user_pool_id})
    }
```

---

## Step 2: Store Tenant to User Pool Mapping

### DynamoDB Table Schema

| Tenant ID | User Pool ID     |
| --------- | ---------------- |
| tenant\_1 | us-east-1\_XXXXX |
| tenant\_2 | us-east-1\_YYYYY |

### Lambda Function: `store_tenant_mapping`

```python
import boto3
import json

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('TenantUserPoolMapping')

def lambda_handler(event, context):
    tenant_id = event['tenant_id']
    user_pool_id = event['user_pool_id']
    table.put_item(Item={'TenantId': tenant_id, 'UserPoolId': user_pool_id})
    return {'statusCode': 200, 'body': json.dumps('Mapping stored successfully')}
```

---

## Step 3: Sign Up a New User in a Tenant-Specific User Pool

### Lambda Function: `signup_user`

```python
import boto3
import json

def get_user_pool_id(tenant_id):
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table('TenantUserPoolMapping')
    response = table.get_item(Key={'TenantId': tenant_id})
    return response['Item']['UserPoolId']

def lambda_handler(event, context):
    tenant_id = event['tenant_id']
    user_pool_id = get_user_pool_id(tenant_id)
    client = boto3.client('cognito-idp')
    response = client.admin_create_user(
        UserPoolId=user_pool_id,
        Username=event['email'],
        UserAttributes=[{'Name': 'email', 'Value': event['email']}],
        TemporaryPassword='Temp@1234'
    )
    return {'statusCode': 200, 'body': json.dumps('User created successfully')}
```

---

## Step 4: Authenticate Users with the Correct User Pool

### Lambda Function: `authenticate_user`

```python
import boto3
import json

def get_user_pool_id(tenant_id):
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table('TenantUserPoolMapping')
    response = table.get_item(Key={'TenantId': tenant_id})
    return response['Item']['UserPoolId']

def lambda_handler(event, context):
    tenant_id = event['tenant_id']
    user_pool_id = get_user_pool_id(tenant_id)
    client = boto3.client('cognito-idp')
    response = client.initiate_auth(
        ClientId=event['client_id'],
        AuthFlow='USER_PASSWORD_AUTH',
        AuthParameters={
            'USERNAME': event['email'],
            'PASSWORD': event['password']
        }
    )
    return {'statusCode': 200, 'body': json.dumps(response['AuthenticationResult'])}
```

---

## Step 5: API Gateway Integration

Create API Gateway endpoints:

- `POST /createTenant` → Invokes `create_tenant_user_pool`
- `POST /registerUser` → Invokes `signup_user`
- `POST /login` → Invokes `authenticate_user`

---

## Step 6: Frontend Implementation

### `signin.tsx`

```tsx
import { signIn } from "../auth";

export default function SignIn() {
  const handleSignIn = async (event) => {
    event.preventDefault();
    const email = event.target.email.value;
    const password = event.target.password.value;
    await signIn(email, password);
  };

  return (
    <form onSubmit={handleSignIn}>
      <input type="email" name="email" placeholder="Email" required />
      <input type="password" name="password" placeholder="Password" required />
      <button type="submit">Sign In</button>
    </form>
  );
}
```

### `signup.tsx`

```tsx
import { signUp } from "../auth";

export default function SignUp() {
  const handleSignUp = async (event) => {
    event.preventDefault();
    const email = event.target.email.value;
    const password = event.target.password.value;
    await signUp(email, password);
  };

  return (
    <form onSubmit={handleSignUp}>
      <input type="email" name="email" placeholder="Email" required />
      <input type="password" name="password" placeholder="Password" required />
      <button type="submit">Sign Up</button>
    </form>
  );
}
```

### `auth.js`

```javascript
import * as AmazonCognitoIdentity from "amazon-cognito-identity-js";

const poolData = {
  UserPoolId: process.env.NEXT_PUBLIC_USER_POOL_ID,
  ClientId: process.env.NEXT_PUBLIC_CLIENT_ID,
};

const userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);

export const signIn = (email, password) => {
  // Cognito sign-in logic
};

export const signUp = (email, password) => {
  // Cognito sign-up logic
};
```

---

## Summary

This setup includes backend authentication, tenant isolation, and a frontend login/signup UI.
