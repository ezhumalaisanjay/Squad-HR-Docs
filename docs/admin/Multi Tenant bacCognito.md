# Multi-Tenant Cognito User Pool Setup

## 1. Overview

In this setup, each tenant will have its **own Cognito User Pool**, and users will authenticate based on their **tenant-specific** credentials. This ensures **data isolation** and **scalability**.

---

## 2. Backend Setup (AWS Lambda + DynamoDB)

### Step 1: Create a New Cognito User Pool for Each Tenant

When a new tenant registers, a **new Cognito User Pool** should be created dynamically.

### Lambda Function to Create a Cognito User Pool

```python
import boto3
import json
import uuid

cognito_client = boto3.client("cognito-idp")

def lambda_handler(event, context):
    tenant_name = event["tenant_name"]
    admin_email = event["admin_email"]

    user_pool_name = f"{tenant_name}-user-pool"
    client_name = f"{tenant_name}-client"

    # Create a new Cognito User Pool
    response = cognito_client.create_user_pool(
        PoolName=user_pool_name,
        AutoVerifiedAttributes=["email"],
        UsernameAttributes=["email"],
        Schema=[
            {"Name": "email", "AttributeDataType": "String", "Required": True},
            {"Name": "custom:tenant_id", "AttributeDataType": "String", "Mutable": False},
        ]
    )
    
    user_pool_id = response["UserPool"]["Id"]

    # Create an App Client for this user pool
    client_response = cognito_client.create_user_pool_client(
        UserPoolId=user_pool_id,
        ClientName=client_name,
        GenerateSecret=False,
        ExplicitAuthFlows=["ALLOW_USER_PASSWORD_AUTH", "ALLOW_REFRESH_TOKEN_AUTH"]
    )

    client_id = client_response["UserPoolClient"]["ClientId"]

    # Store Tenant Details in DynamoDB
    dynamodb = boto3.resource("dynamodb")
    table = dynamodb.Table("Tenants")
    table.put_item(Item={
        "tenant_id": str(uuid.uuid4()),
        "tenant_name": tenant_name,
        "user_pool_id": user_pool_id,
        "client_id": client_id,
        "admin_email": admin_email
    })

    return {
        "statusCode": 200,
        "body": json.dumps({"message": "Tenant Created", "user_pool_id": user_pool_id, "client_id": client_id})
    }
```

---

## 3. Sign Up a Tenant User

Once the user pool is created, users should be **registered under their specific tenant**.

### Lambda Function to Sign Up a User

```python
def register_user(event, context):
    user_pool_id = event["user_pool_id"]
    email = event["email"]
    password = event["password"]
    tenant_id = event["tenant_id"]

    response = cognito_client.sign_up(
        ClientId=event["client_id"],
        Username=email,
        Password=password,
        UserAttributes=[
            {"Name": "email", "Value": email},
            {"Name": "custom:tenant_id", "Value": tenant_id},
        ],
    )

    return {"statusCode": 200, "body": json.dumps({"message": "User Registered"})}
```

---

## 4. Frontend Integration (Next.js + Cognito)

### Update `auth.js`

```javascript
import * as AmazonCognitoIdentity from "amazon-cognito-identity-js";
import axios from "axios";

export const signUp = async (tenant, email, password, name) => {
  try {
    // Fetch Tenant Details from Backend
    const tenantResponse = await axios.get(`/api/getTenant?tenant=${tenant}`);
    const { userPoolId, clientId } = tenantResponse.data;

    const poolData = { UserPoolId: userPoolId, ClientId: clientId };
    const userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);

    return new Promise((resolve, reject) => {
      const attributeList = [
        new AmazonCognitoIdentity.CognitoUserAttribute({ Name: "email", Value: email }),
        new AmazonCognitoIdentity.CognitoUserAttribute({ Name: "name", Value: name }),
        new AmazonCognitoIdentity.CognitoUserAttribute({ Name: "custom:tenant_id", Value: tenant })
      ];

      userPool.signUp(email, password, attributeList, null, (err, result) => {
        if (err) reject(err);
        else resolve(result.user);
      });
    });
  } catch (err) {
    console.error("Tenant fetch error:", err);
    throw new Error("Tenant does not exist.");
  }
};
```

---

## 5. API Route (`pages/api/getTenant.ts`)

Create a backend API to fetch tenant details.

```typescript
import { NextApiRequest, NextApiResponse } from 'next';
import AWS from 'aws-sdk';

const dynamoDB = new AWS.DynamoDB.DocumentClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ message: 'Method Not Allowed' });

  const { tenant } = req.query;
  const params = {
    TableName: 'Tenants',
    Key: { tenant_name: tenant },
  };

  try {
    const { Item } = await dynamoDB.get(params).promise();
    if (!Item) return res.status(404).json({ message: 'Tenant not found' });

    res.status(200).json({ userPoolId: Item.user_pool_id, clientId: Item.client_id });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching tenant details', error: err });
  }
}
```

---

## 6. Summary

✅ **Dynamically create Cognito User Pools**\
✅ **Store Tenant details in DynamoDB**\
✅ **Dynamically fetch User Pool details for sign-in**\
✅ **Scalable multi-tenant authentication**

Let me know if you need further enhancements! 🚀
