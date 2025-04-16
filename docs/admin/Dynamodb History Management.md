# DynamoDB Change History Management — CloudTrail, CloudWatch, and S3 Archival Strategy

## Overview

To maintain a reliable and auditable history of changes in our HRMS application's DynamoDB tables, we are adopting a hybrid logging and archival strategy using:

- **AWS CloudTrail** for event tracking.
- **DynamoDB Streams + CloudWatch Logs** for real-time data change images.
- **S3 Archival** for long-term storage.

This approach ensures traceability, accountability, and compliance with both operational and audit requirements.

---

## Logging Overview

| Component         | Purpose                                                     | Retention         | Notes                                  |
|--------------------|-------------------------------------------------------------|--------------------|----------------------------------------|
| **CloudTrail**     | Logs DynamoDB API calls: `PutItem`, `DeleteItem`, `UpdateItem` | Default: 90 days  | Can be exported to S3 for long-term storage. |
| **CloudWatch Logs**| Logs DynamoDB Streams (Old Image / New Image)               | Current: 24 hours | Used for short-term debugging and monitoring. |
| **S3 (Archival)**  | Stores CloudTrail event logs as JSON files                  | Custom (User-defined) | Recommended before the 90-day expiry of CloudTrail logs. |

---

## CloudTrail Setup for DynamoDB — Step-by-Step Guide

### Step 1: Open CloudTrail Console
- Navigate to **AWS Console**.
- Search for **CloudTrail** and open the service.

---

### Step 2: Create or Select a Trail
- If you don’t have an existing trail:
  1. Click **Create trail**.
  2. Enter a **Trail name** (e.g., `HRMS-DynamoDB-Logs`).
  3. Select **Apply trail to all regions** — ensures consistency across environments.

- If you already have a trail:
  - Choose the trail you want to configure for DynamoDB.

---

### Step 3: Enable Data Event Logging
1. In the **Create trail** wizard or existing trail settings, scroll to **Event type**.
2. Under **Data events**, select **Add data event**.
3. Choose:
    - **Data event type:** `DynamoDB`
    - **Specify DynamoDB tables:** Choose specific tables or **All current and future DynamoDB tables**.

---

### Step 4: S3 Bucket for Log Storage
1. Specify the S3 bucket where CloudTrail will deliver logs.
    - Create a new S3 bucket or use an existing one.
    - Ensure the bucket has the right **access policy** to allow CloudTrail delivery.

Example bucket policy:
```json
{
  "Effect": "Allow",
  "Principal": { "Service": "cloudtrail.amazonaws.com" },
  "Action": "s3:PutObject",
  "Resource": "arn:aws:s3:::your-bucket-name/AWSLogs/your-account-id/*",
  "Condition": { "StringEquals": { "s3:x-amz-acl": "bucket-owner-full-control" } }
}
```

---

### Step 5: Log File Validation (Optional)
- Enable **Log file validation** to ensure logs are not tampered with.

---

### Step 6: Review and Create
- Review all the configurations.
- Click **Create trail** or **Update trail**.

CloudTrail will now start logging all DynamoDB table activity, including:
- `PutItem`
- `DeleteItem`
- `UpdateItem`
- `BatchWriteItem`
- `DescribeTable`
- `CreateTable`
- and other relevant actions.

---

## Archival Best Practice: Exporting CloudTrail Logs to S3

1. **Before the 90-day retention limit is reached**, export CloudTrail logs from the S3 bucket to a designated **long-term archival S3 bucket**.
2. Logs can be stored in **JSON format** for easy retrieval and analysis.
3. Consider setting **Object Lifecycle Policies** on the archival bucket for automated cost-optimization:
    - Move to **S3 Glacier** or **Glacier Deep Archive** after a defined period.

---

## CloudWatch Logs — DynamoDB Streams

- If **DynamoDB Streams** are enabled, CloudWatch captures:
    - `OldImage` (data before change)
    - `NewImage` (data after change)

This is useful for:
- Short-term debugging.
- Triggering downstream Lambda functions.
- Viewing granular before-and-after record changes.

> **Note:** CloudWatch retention must be configured manually; the default is often 24 hours or more depending on the setup.

---

## Summary

- **CloudTrail** gives a high-level audit trail of actions on DynamoDB tables for up to 90 days.
- **CloudWatch Logs** (via Streams) allow you to inspect record-level before and after states but are meant for short-term usage.
- **S3 Archival** ensures long-term retention and cost-efficient storage beyond CloudTrail's 90-day window.

---

✅ Make sure to periodically review your CloudTrail and S3 setup to ensure compliance with your audit and security policies.