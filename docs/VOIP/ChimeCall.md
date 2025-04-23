# 📞 International Audio Calling Dialer – AWS Implementation Guide

## 🧭 Project Overview

One of our clients has requested the implementation of a **dialer interface for international audio calls** targeting customers in **Panama and Singapore**. This application will be built using:

- **AWS Amplify Gen 2** with **Next.js**
- **Amazon Chime SDK** via **Voice Connector** for audio calling
- **Amazon Cognito** for authentication (not Amplify Auth)

The UI will include:
- Dialer input
- Recent call logs
- Contacts list
- Loudspeaker toggle
- Mute/unmute functionality
- End call button
- Audio recording
- Other basic call management features

---

## 🧰 Services & Tools Used

| Component             | AWS Service             |
|----------------------|-------------------------|
| Audio Call Handling  | Amazon Chime SDK        |
| User Authentication  | Amazon Cognito          |
| Backend APIs         | AWS Lambda + API Gateway|
| UI Development       | Amplify Gen 2 + Next.js |
| Data Storage         | DynamoDB                |
| Audio Storage        | Amazon S3               |
| Logging & Monitoring | CloudWatch              |

---

## 🔄 Application Flow & Implementation Steps

### 1. ☎️ Request PSTN Numbers
- Request **international PSTN numbers** for **Panama** and **Singapore** via [AWS Support Center](https://console.aws.amazon.com/support/home).
- Ensure the AWS account is **PSTN-enabled**.

### 2. 🔗 Set Up Chime Voice Connector
- Create a **Voice Connector** in the **Chime SDK Console**.
- Configure **termination** for outbound PSTN calling.
- Associate the purchased phone numbers to this connector.
- Enable media streaming or SIP trunking as needed.

### 3. 🔐 Configure Amazon Cognito (User Authentication)
- Create a **Cognito User Pool**.
- Add sign-up and login flows.
- Integrate using `amazon-cognito-identity-js` or AWS Amplify library (`Auth` module manually configured).
- Use tokens (ID/Access) to authorize API requests.

### 4. 🧑‍🎨 Build Frontend with Next.js + Amplify Gen 2
Create the following UI components:
- Dialer Pad: Accepts user input
- Recent Calls: Shows history
- Contacts List: Displays saved numbers
- Audio Controls:
  - **Mute/Unmute**
  - **Loudspeaker Toggle**
  - **End Call**
  - **Audio Recording Button**

Styling Suggestions:
- Use **Tailwind CSS** or **Chakra UI**
- Animate with **Framer Motion** if needed

### 5. 🎙️ Integrate Chime SDK for Voice Calls
- Use **Chime SDK JavaScript client** for WebRTC audio session:
  ```js
  const meetingSession = new DefaultMeetingSession(configuration, logger, deviceController);
  meetingSession.audioVideo.start();
  ```
- Connect outgoing calls through **Voice Connector** with backend support (SIP Media Application or WebRTC + Lambda flow).

### 6. 🎧 Record and Store Audio (Optional)
- Enable **Call Recording** on Voice Connector:
  - Stream audio to an S3 bucket
  - Use **AWS Lambda** for post-processing
- Save metadata (timestamp, user, duration) to **DynamoDB**

### 7. 🧾 Backend APIs with API Gateway + Lambda
Use **REST or GraphQL (via Amplify)** for:
- Creating/storing call logs
- Managing contacts (CRUD)
- Retrieving call history
- Recording metadata

Example Lambda for saving call logs:
```python
def lambda_handler(event, context):
    # Save to DynamoDB
    return {"statusCode": 200, "body": "Call log saved"}
```

### 8. 🧬 Amplify Gen 2 Setup
- Define backend components via `amplify/backend`
  - Functions (Lambda)
  - Models (DynamoDB)
  - APIs (REST or GraphQL)
- Run `amplify pull` to sync with your Next.js project

### 9. 📈 Monitoring & Logs
Use **Amazon CloudWatch** to:
- Monitor API/Lambda errors
- Track call sessions
- Set alarms for anomalies

---

## ✅ Optional Enhancements

- 🔊 **Call Transcript with AWS Transcribe**
- 💬 **Chat + SMS with Amazon Pinpoint**
- 📊 **Call Analytics Dashboard**
- 🔔 **Push Notifications for Missed Calls**

---

## 📌 Summary

| Task                           | Technology          |
|--------------------------------|---------------------|
| PSTN Call Setup                | Chime SDK Voice     |
| UI with Call Features          | Next.js + Amplify   |
| Authentication                 | Cognito             |
| Audio Call Flow                | Chime SDK + Lambda  |
| Audio Recording                | S3 + Lambda         |
| Contact/Call Log Management    | DynamoDB            |
| API Management                 | API Gateway + Lambda|

---