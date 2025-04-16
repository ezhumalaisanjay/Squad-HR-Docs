# 📂 Multi-Tenant Employee Leave Management System — Data Model & Lambda Flow

---

## 🌟 Purpose

This document outlines the schema and functional design for managing **Employee Onboarding, Leave Policies, Leave Balances, and Leave Requests** in a **multi-tenant architecture**.

The system is designed for scalability across tenants and ensures separation of tenant data through explicit attributes:

- `identity_pool_id`
- `user_pool_id`
- `client_id`
- `tenant_name`

---

## 🌍 Multi-Tenant Architecture Consideration

Each table will include:

| Attribute           | Purpose                                           |
|----------------------|---------------------------------------------------|
| `identity_pool_id`   | Identifies the Cognito Identity Pool for the tenant |
| `user_pool_id`       | Identifies the Cognito User Pool for the tenant    |
| `client_id`          | Application Client ID for the tenant               |
| `tenant_name`        | Human-readable tenant identifier                   |

These attributes ensure data isolation, easy filtering, and tenant-based querying.

---

## 🏢 Table Schemas

---

### 🔹 1️⃣ Employee Table (Onboarding)

| Field Name               | Type           | Description                                  |
|---------------------------|----------------|----------------------------------------------|
| `employeeId`              | String         | Unique Employee Identifier                   |
| `firstName`               | String         | Employee’s First Name                        |
| `lastName`                | String         | Employee’s Last Name                         |
| `email`                   | String         | Personal Email                               |
| `officialEmail`           | String         | Company Provided Email                       |
| `phoneCountryCode`        | String         | Phone Country Code                           |
| `phoneNumber`             | String         | Contact Number                               |
| `uanNumber`, `aadharNumber`, `panNumber` | String | Regulatory Identifications (India)          |
| `joiningDate`             | String         | Joining Date                                 |
| `probationEndDate`        | String         | Calculated Date for Probation End            |
| `status`                  | String         | Current Employment Status                    |
| `client_id`               | String         | Multi-tenant Client ID                       |
| `identity_pool_id`        | String         | Multi-tenant Identity Pool                   |
| `user_pool_id`            | String         | Multi-tenant User Pool                       |
| `tenant_name`             | String         | Tenant/Organization Name                    |

---

### 🔹 2️⃣ Leave Policy Table

| Field Name            | Type           | Description                                  |
|------------------------|----------------|----------------------------------------------|
| `name`                 | String         | Leave Name (e.g. Annual Leave)               |
| `code`                 | String         | Short code (e.g. AL)                         |
| `type`                 | String         | Paid / Unpaid / Compensatory                 |
| `unit`                 | String         | Days / Hours                                 |
| `creditDays`           | Integer        | Days granted                                 |
| `creditPeriod`         | String         | Yearly / Monthly / Custom                    |
| `resetPeriod`          | String         | When to reset leave balance                  |
| `policyType`           | String         | fixed / experience / grant                   |
| `status`               | Boolean        | Active or Inactive                           |
| `identity_pool_id`     | String         | Multi-tenant Identity Pool                   |
| `user_pool_id`         | String         | Multi-tenant User Pool                       |
| `client_id`            | String         | Multi-tenant Client ID                       |
| `tenant_name`          | String         | Tenant/Organization Name                    |

---

### 🔹 3️⃣ Leave Balance Table

| Field Name            | Type           | Description                                  |
|------------------------|----------------|----------------------------------------------|
| `employeeId`           | String         | Reference to Employee                        |
| `leaveType`            | String         | Leave Type (aligned with LeavePolicy)        |
| `availableBalance`     | Integer        | Current Available Balance                    |
| `usedBalance`          | Integer        | Total Leaves Used                            |
| `identity_pool_id`     | String         | Multi-tenant Identity Pool                   |
| `user_pool_id`         | String         | Multi-tenant User Pool                       |
| `client_id`            | String         | Multi-tenant Client ID                       |
| `tenant_name`          | String         | Tenant/Organization Name                    |

---

### 🔹 4️⃣ Leave Request Table

| Field Name            | Type           | Description                                  |
|------------------------|----------------|----------------------------------------------|
| `leaveType`            | String         | Type of leave                                |
| `startDate`            | String         | Leave Start Date                             |
| `endDate`              | String         | Leave End Date                               |
| `reason`               | String         | Reason for leave                             |
| `attachment`           | String         | Proof or document attachment                 |
| `name`                 | String         | Employee Name                                |
| `email`                | String         | Employee Email                               |
| `userid`               | String         | Cognito User ID                              |
| `identity_pool_id`     | String         | Multi-tenant Identity Pool                   |
| `user_pool_id`         | String         | Multi-tenant User Pool                       |
| `client_id`            | String         | Multi-tenant Client ID                       |
| `tenant_name`          | String         | Tenant/Organization Name                    |

---

### 🔹 5️⃣ TenantEmployeeSequence Table

| Field Name            | Type           | Description                                  |
|------------------------|----------------|----------------------------------------------|
| `client_id`            | String         | Multi-tenant Client ID                       |
| `identity_pool_id`     | String         | Multi-tenant Identity Pool                   |
| `user_pool_id`         | String         | Multi-tenant User Pool                       |
| `tenant_name`          | String         | Tenant/Organization Name                    |
| `series_number`        | Integer        | Current running number for employee IDs      |

---

## ⚡ Lambda Flow: Set Initial Leave Balance on Onboarding

### 🧐 Logic Overview

When a new employee is onboarded:

1. Lambda triggers on the `Onboarding` table `INSERT` event.
2. Fetches active leave policies for the tenant (`client_id`, `user_pool_id`, `identity_pool_id`, `tenant_name`).
3. If the employee is under **probation**:
    - Assigns `0` or partial balance as per business rule.
4. If probation is complete:
    - Assigns full balance from `LeavePolicy`.
5. Inserts leave balances into the `LeaveBalance` table.

### 🐉 Sample Python Lambda Function

```python
import boto3
from boto3.dynamodb.conditions import Key

dynamodb = boto3.resource('dynamodb')
leave_policy_table = dynamodb.Table('LeavePolicy')
leave_balance_table = dynamodb.Table('LeaveBalance')

def lambda_handler(event, context):
    for record in event['Records']:
        if record['eventName'] == 'INSERT':
            new_employee = record['dynamodb']['NewImage']
            employee_id = new_employee['employeeId']['S']
            tenant_keys = {
                'identity_pool_id': new_employee['identity_pool_id']['S'],
                'user_pool_id': new_employee['user_pool_id']['S'],
                'client_id': new_employee['client_id']['S'],
                'tenant_name': new_employee['tenant_name']['S']
            }

            response = leave_policy_table.scan(
                FilterExpression=(
                    Key('identity_pool_id').eq(tenant_keys['identity_pool_id']) &
                    Key('user_pool_id').eq(tenant_keys['user_pool_id']) &
                    Key('client_id').eq(tenant_keys['client_id']) &
                    Key('tenant_name').eq(tenant_keys['tenant_name']) &
                    Key('status').eq(True)
                )
            )

            policies = response.get('Items', [])
            for policy in policies:
                balance = 0
                if new_employee.get('status', {}).get('S') != 'Probation':
                    balance = policy.get('creditDays', 0)

                leave_balance_table.put_item(
                    Item={
                        'employeeId': employee_id,
                        'leaveType': policy['code'],
                        'availableBalance': balance,
                        'usedBalance': 0,
                        **tenant_keys
                    }
                )
    return {"status": "Leave balance initialized for onboarded employee."}
```

---

## ✅ Pros

- **Multi-Tenant Ready:** Clear tenant separation via shared attributes.
- **Scalable & Modular:** Easily extendable across organizations.
- **Automation:** Leave balance assignment automated during onboarding.
- **Policy Driven:** Any change to LeavePolicy instantly affects future onboarding.
- **Auditable:** Employee-specific data tied with policy and tenant metadata.

---

## ⚠️ Cons

- **Tenant Attribute Overhead:** Every table requires filtering on 4 identifiers.
- **Lambda Cold Start:** If not properly optimized, first-run latency for onboarding.
- **Policy Synchronization:** If policies are updated frequently, newly onboarded balances can mismatch unless carefully versioned.
- **Data Redundancy:** Tenant attributes repeated in every record for multitenancy enforcement.

---

## 💡 Summary

This design ensures tenant isolation, clean data modeling, and efficient onboarding flow that automatically syncs an employee's leave balance with their status (probation or confirmed) while following company policies.

---