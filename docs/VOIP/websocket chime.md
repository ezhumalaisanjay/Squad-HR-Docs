✅ **AWS Chime SDK**  
Primarily, the **AWS Chime SDK** is designed for:

- **Audio & Video communication** (VoIP, PSTN via Voice Connectors)  
- **Real-time screen sharing and meetings**  
- **Session signaling** (basic messaging to control media sessions, not chat)  

When you're talking about **PSTN numbers and international calls** (like Panama, Singapore, Switzerland) —  
👉 **Chime SDK + Voice Connector** is the right way.  
It will handle outbound and inbound **SIP/PSTN call routing** and audio streams.

---

💡 **But for real-time messaging (chat-like features)** —  
**AWS Chime SDK does NOT handle messaging/chat** the way you’d expect in a chat app.  
Chime's messaging features are more geared toward **control-plane messages** and not for app-level chat between users.

---

### So, for your use case:

| Requirement                  | Recommended Service                   |
|--------------------------------|----------------------------------------|
| Real-time Chat Messaging      | ✅ **AWS AppSync Subscriptions** (WebSocket-based) |
| PSTN / International Voice Calls | ✅ **AWS Chime SDK + Voice Connector**        |

---

### 🧠 **Summary:**
- **AppSync Subscriptions** (uses WebSocket under the hood) are ideal for **chat or real-time messaging**.
- **AWS Chime SDK + Voice Connector** handles **audio calls, SIP, PSTN** — especially for your international dialing needs.
- These two are complementary, not interchangeable.

---

### 💡 **Suggestion:**
- Use **GraphQL subscriptions** via **AppSync** for real-time chat between users (since you’re already using Amplify & GraphQL — super smooth integration).
- Use **Chime SDK + Voice Connector** exclusively for voice calling to PSTN numbers in Panama, Singapore, Switzerland.

This gives you a clean separation:
- **Messaging = AppSync**
- **Voice Calls = Chime**