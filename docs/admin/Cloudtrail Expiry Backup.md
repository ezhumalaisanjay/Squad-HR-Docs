# 🗃️ CloudTrail Log Expiry Backup — Scheduled Lambda to S3

## 🎯 Goal
Automatically back up CloudTrail logs to an S3 bucket **before the 90-day expiration window** — by scanning and copying logs based on their last modified date.

---

## 🏗️ Architecture

| Component             | Purpose                                                              |
|------------------------|----------------------------------------------------------------------|
| **CloudTrail**         | Tracks API events and stores them in an S3 bucket for 90 days.       |
| **Lambda (Scheduled)** | Runs daily (or weekly) to check for logs nearing expiration.         |
| **S3 Backup Bucket**   | Stores copied logs for long-term archival beyond CloudTrail limits.  |

---

## 🕰️ Flow Summary

1. CloudTrail logs are continuously written to your primary S3 bucket.
2. A **Lambda function** is scheduled (via EventBridge rule) to:
   - List objects in the CloudTrail log S3 bucket.
   - Identify objects older than `X` days (typically 85 days).
   - Copy them to a **Backup S3 bucket** before the 90-day deletion.

---

## 💡 IAM Role for Lambda

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": ["s3:ListBucket"],
            "Resource": "arn:aws:s3:::your-source-cloudtrail-bucket"
        },
        {
            "Effect": "Allow",
            "Action": ["s3:GetObject", "s3:PutObject"],
            "Resource": [
                "arn:aws:s3:::your-source-cloudtrail-bucket/*",
                "arn:aws:s3:::your-backup-s3-bucket/*"
            ]
        },
        {
            "Effect": "Allow",
            "Action": ["logs:*"],
            "Resource": "*"
        }
    ]
}
```

---

## 🐍 Lambda Python Code — Backup Expiring CloudTrail Logs

```python
import boto3
import datetime
import logging

s3 = boto3.client('s3')
source_bucket = 'your-source-cloudtrail-bucket'
backup_bucket = 'your-backup-s3-bucket'
threshold_days = 85

logger = logging.getLogger()
logger.setLevel(logging.INFO)

def lambda_handler(event, context):
    today = datetime.datetime.now(datetime.timezone.utc)
    paginator = s3.get_paginator('list_objects_v2')
    
    for page in paginator.paginate(Bucket=source_bucket):
        if 'Contents' in page:
            for obj in page['Contents']:
                key = obj['Key']
                last_modified = obj['LastModified']
                age = (today - last_modified).days

                if age >= threshold_days:
                    destination_key = f'cloudtrail-backup/{key}'
                    try:
                        copy_source = {'Bucket': source_bucket, 'Key': key}
                        s3.copy_object(
                            Bucket=backup_bucket,
                            Key=destination_key,
                            CopySource=copy_source
                        )
                        logger.info(f"Backed up: {key} -> {backup_bucket}/{destination_key}")
                    except Exception as e:
                        logger.error(f"Failed to backup {key}: {str(e)}")
```

---

## ⚙️ EventBridge Schedule Setup

1. Go to **EventBridge (CloudWatch Events)**.
2. Create a **Rule**:
   - Rule type: **Schedule**.
   - Expression: `cron(0 2 * * ? *)` — runs daily at 2 AM UTC.
3. Set **Lambda function** as the target.
4. Enable the rule.

---

## 💡 Notes

- The `threshold_days` is set to 85 days, so logs will be copied before AWS purges them at the 90-day mark.
- Logs will retain their original folder structure in the backup bucket.
- You can extend this to:
   - Compress logs.
   - Apply encryption.
   - Store with Glacier lifecycle policies.

---

## 📝 Summary

| Feature               | Purpose                                        |
|------------------------|------------------------------------------------|
| **Scheduled Lambda**   | Scans for near-expiry CloudTrail logs.         |
| **Backup S3 Bucket**   | Stores log files safely beyond 90 days.        |
| **Lifecycle Policies** | Move old logs to Glacier for cost savings.     |

---

✅ Let me know if you’d like me to:
- Write a **CloudFormation** or **Terraform script** for the full setup.
- Add email or Slack notifications on success/failure!