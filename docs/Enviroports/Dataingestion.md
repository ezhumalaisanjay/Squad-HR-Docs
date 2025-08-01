# 📘 Architecture Design Document

## **Title**: Scalable and Cost-Effective Excel Processing Pipeline with Frontend Preview and Data Ingestion into DynamoDB

---

## 🔍 **Use Case Overview**

Your application involves uploading **very large Excel files (1–2 GB)**, extracting each **sheet into separate JSON files**, allowing users to **preview the data** in the frontend, and finally **ingesting the confirmed JSON sheets into DynamoDB**.

The frontend is built using **Next.js**, hosted with **AWS Amplify**, and integrated with **AWS AppSync** (GraphQL) and **Amazon Cognito** for user authentication.

---

## 🎯 **Architecture Objectives**

* Handle **large file uploads** asynchronously.
* Support **long-running, compute-heavy jobs** for Excel parsing.
* Allow **preview and confirmation** of JSON sheets before ingestion.
* Perform **cost-optimized, reliable processing** using Spot Instances.
* Use a **fully serverless or managed architecture** wherever possible.
* Enable **GraphQL access** to ingested data via AppSync.

---

## 🧱 **High-Level Architecture Components**

```plaintext
Frontend (Next.js + Amplify) ⟶ S3 ⟶ EventBridge ⟶ Step Functions
                           ⟶ AWS Batch (on EC2 Spot) ⟶ JSONs to S3
                           ⟶ Frontend Preview
                           ⟶ Confirm Ingestion
                           ⟶ Step Functions ⟶ AWS Batch ⟶ Ingest to DynamoDB
                           ⟶ AppSync ⟶ Query DynamoDB
```

---

## ✅ **Detailed Flow Breakdown**

### ### 1. 🔼 **Excel File Upload**

* **Frontend**: Next.js using `Amplify Storage.put()`
* **Service**: Amazon S3
* **Bucket Structure**:

  ```
  s3://your-bucket/
      └── raw-uploads/
           └── bigfile.xlsx
  ```

---

### 2. 🚀 **Trigger Processing Workflow**

* **Trigger Service**: Amazon EventBridge (on S3 `raw-uploads/`)
* **Target**: AWS Step Functions (State Machine)

---

### 3. 🔁 **Step Functions: Orchestration Layer**

* **Role**: Coordinates Excel parsing job
* **First Task**: Submit job to AWS Batch
* **Optionally**: Poll for job completion, handle success/failure
* **Advantage**: Long-running, retry-safe, visual monitoring

---

### 4. 🧠 **Excel Parsing via AWS Batch**

* **Service**: AWS Batch
* **Compute Environment**: EC2 (Spot Instances with On-Demand fallback)
* **Job Definition**: Custom Docker container with Python script
* **Script Responsibilities**:

  * Download `.xlsx` file from S3
  * Extract each sheet using `pandas`, `openpyxl`, etc.
  * Convert each sheet to `.json`
  * Upload each JSON file to `parsed-json/<original_file>/<sheet>.json`

```plaintext
s3://your-bucket/
    └── parsed-json/
         └── bigfile/
              ├── Sheet1.json
              ├── Sheet2.json
```

---

### 5. 🖼️ **Frontend JSON Preview**

* **Frontend**: Next.js (Amplify)
* **User Action**: Review parsed sheets from S3
* **Access**: Use `Amplify Storage.get()` or signed URLs
* **UI**: Show parsed JSONs per sheet; allow confirmation

---

### 6. ✅ **Confirm & Ingest JSON to DynamoDB**

* **User clicks "Ingest"**
* **API Trigger**: Amplify function or AppSync mutation
* **Step Functions**: Starts another batch ingestion workflow
* **AWS Batch** job:

  * Reads confirmed JSON from `parsed-json/`
  * Transforms data if necessary
  * Performs `BatchWriteItem` to DynamoDB tables
  * Optional: logs status or moves to "archived" folder

---

### 7. 🔎 **GraphQL Access via AppSync**

* **Frontend**: Amplify GraphQL queries
* **Backend**: AWS AppSync
* **Database**: DynamoDB (tables keyed by sheet/file metadata)
* **Auth**: Amazon Cognito via Amplify Auth

---

## 🧰 **Services Used & Their Purpose**

| AWS Service            | Purpose                                                   |
| ---------------------- | --------------------------------------------------------- |
| **Amazon S3**          | Stores raw Excel uploads and parsed JSON sheets           |
| **Amazon EventBridge** | Detects file uploads and triggers Step Functions          |
| **AWS Step Functions** | Orchestrates Excel extraction and ingestion workflows     |
| **AWS Batch**          | Executes long-running, resource-heavy jobs using EC2 Spot |
| **Amazon EC2 (Spot)**  | Cost-effective compute for parsing Excel in AWS Batch     |
| **Amazon ECR**         | Stores Docker image for Batch job                         |
| **Amazon DynamoDB**    | Stores confirmed sheet data for querying                  |
| **AWS AppSync**        | GraphQL layer for accessing DynamoDB                      |
| **AWS Amplify**        | Hosts frontend (Next.js), manages auth, API, and storage  |
| **Amazon Cognito**     | User authentication and authorization                     |

---

## 💰 **Cost Optimization Strategies**

| Area     | Optimization                                                  |
| -------- | ------------------------------------------------------------- |
| Compute  | Use **EC2 Spot Instances** in AWS Batch                       |
| S3       | Use **Intelligent-Tiering** or periodically archive raw files |
| DynamoDB | Use **on-demand billing** or **provisioned + auto-scaling**   |
| AppSync  | Use **reserved concurrency** for APIs if needed               |
| Batch    | Run **batch jobs in non-peak hours** if flexibility allows    |

---

## 🛡️ **Security Best Practices**

* Use **S3 bucket policies** with `amplify-*` roles to restrict access
* Encrypt all S3 and DynamoDB data at rest (AES-256 or KMS)
* Use **IAM roles for Batch jobs** (least privilege)
* Enable **CloudTrail + CloudWatch Logs** for auditing
* Use **WAF or throttling** on AppSync APIs if exposed to public

---

## 📦 **Deployment Strategy**

| Item                 | Notes                                                      |
| -------------------- | ---------------------------------------------------------- |
| Docker container     | Build locally and push to Amazon ECR                       |
| Batch Job Definition | Create with container image, vCPU, memory                  |
| Step Functions       | Define using JSON/YAML or CDK/Terraform                    |
| AppSync schema       | Define GraphQL schema for frontend use                     |
| Amplify              | Use Amplify CLI to deploy hosting + Auth + API integration |

---

## 🧪 Example Folder Structure in S3

```
s3://your-bucket/
├── raw-uploads/
│   └── data_file_2025.xlsx
├── parsed-json/
│   └── data_file_2025/
│       ├── Sheet1.json
│       └── Sheet2.json
```

---

## 🔚 Conclusion

This architecture ensures:

* Efficient handling of **large Excel files**
* Seamless user experience for **preview and confirmation**
* Serverless backend for **scalability and cost efficiency**
* Reliable, long-running processing via **Step Functions + AWS Batch + EC2 Spot**

---