# AWS Fargate vs EC2 vs Lambda: Best Fit for Market Data Feed & Trading Automation

## Introduction
This document provides a comparison between AWS Fargate, EC2, and Lambda for implementing a system that connects to Upstox WebSocket, subscribes to market data symbols, and executes trade orders based on real-time data. The goal is to find the most suitable AWS service for this use case considering factors like cost, management, and scalability.

---

## **AWS Fargate**
### **Best Fit for Our Requirement**
Fargate is a serverless compute engine that allows you to run containers without managing the underlying infrastructure.

### **Why Fargate is Ideal:**
- **Serverless**: No need to manage EC2 instances or worry about provisioning and scaling infrastructure.
- **Cost-Effective**: Pay only for the compute resources used, making it more affordable for workloads that need continuous processing (like monitoring WebSocket data feeds).
- **Scalability**: Automatically scales to handle varying workloads without manual intervention.
- **Long-Running Tasks**: Supports long-running WebSocket connections and continuous monitoring, which is perfect for our real-time trading system.
- **Easier Integration**: Seamlessly integrates with other AWS services such as DynamoDB, Lambda, and CloudWatch, enabling a fully managed, scalable solution.
- **Simplified Management**: No need to handle instance health or scaling; AWS takes care of it.

---

## **Amazon EC2**
### **When EC2 Might Be Considered**
EC2 provides more control over the virtual machine environment, ideal for use cases where you need to fully manage and customize the infrastructure.

### **Why EC2 is Less Suitable:**
- **Overhead in Management**: You need to manually manage EC2 instances, configure scaling, and handle instance health, leading to increased operational complexity.
- **Higher Cost**: EC2 can be more expensive for workloads that don’t require constant, high resource usage due to the need to manage instances and possibly incur costs even when not fully utilized.
- **Scaling Complexity**: EC2 scaling requires configuring auto-scaling groups, which may add complexity to managing variable workloads like WebSocket connections.

---

## **AWS Lambda**
### **Why Lambda is Not Suitable for This Use Case**
Lambda is a serverless compute service that executes code in response to events and is great for short, stateless executions.

### **Limitations of Lambda:**
- **Short Execution Time**: Lambda functions have a maximum execution timeout of 15 minutes. This makes it unsuitable for long-running WebSocket connections needed for continuous market monitoring and trading.
- **State Management**: Lambda is stateless, making it difficult to manage long-term state (such as tracking active trades and WebSocket subscriptions) within the function itself.
- **Cold Starts**: For workloads requiring continuous real-time interaction (e.g., WebSocket), Lambda might experience cold starts and delays when there’s a gap between invocations, which could affect real-time trading decisions.

---

## **Conclusion:**
For this use case, **AWS Fargate** is the most suitable service because it provides:
- **Serverless infrastructure** for easy management and scalability.
- **Cost efficiency** by paying only for used resources.
- **Support for long-running tasks**, such as maintaining WebSocket connections and processing real-time market data.
- **Seamless integration** with AWS services to support the full trading system workflow.

While **EC2** provides more control, it comes with additional management overhead and higher costs for a workload like this. **Lambda**, on the other hand, is not suitable due to its limitations on execution time and state management.

---

## **Recommendation:**
We recommend using **AWS Fargate** for implementing the market data feed subscription, trading automation, and order management system due to its scalability, cost-effectiveness, and ease of integration with other AWS services.

