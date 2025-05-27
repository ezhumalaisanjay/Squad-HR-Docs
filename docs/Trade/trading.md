# Trading

Here’s a **detailed documentation** and strategy guide for implementing **auto-trading using Upstox APIs**, covering both **Live Orders** and **Sandbox Orders**, including what is supported and how to proceed with each environment.

---

# 📘 Upstox Auto-Trading Documentation

---

## 🔀 Environments Overview

| Feature/API                       | Live Trading ✅ | Sandbox Trading ⚠️ |
| --------------------------------- | -------------- | ------------------ |
| Place Order                       | ✅ Supported    | ✅ Supported        |
| Cancel Order                      | ✅ Supported    | ✅ Supported        |
| Modify Order                      | ✅ Supported    | ✅ Supported        |
| Get Order Book                    | ✅ Supported    | ❌ Not Available    |
| Get Order Details                 | ✅ Supported    | ❌ Not Available    |
| Get Order History                 | ✅ Supported    | ❌ Not Available    |
| Webhook (Order Update)            | ✅ Supported    | ❌ Not Available    |
| Portfolio Stream Feed (WebSocket) | ✅ Supported    | ❌ Not Available    |

---

# ✅ Live Trading Strategy (Full Feature Set)

### 🔧 1. **Placing Orders**

Use the `/order/place` API to place:

* **Limit Buy / Limit Sell**
* **Market Buy / Sell**
* **Stop Loss / Stop Limit**
* **Cover Orders / Bracket Orders (if supported)**

**Response**:

* `order_id`, `status`, `transaction_type`, `price`, etc.

### 🔁 2. **Modify / Cancel Order**

* Modify existing orders with `/order/modify`
* Cancel using `/order/cancel`

### 📋 3. **Track Orders**

#### a. **Get Order Book**

* Endpoint: `/order/book`
* Returns all orders placed on the current day.

#### b. **Get Order Details**

* Endpoint: `/order/details?order_id=...`
* Get current status (open, rejected, complete, etc.)

#### c. **Get Order History**

* Track progression through:

  * `validation pending` → `open` → `complete`/`rejected`

---

### 📡 4. **Real-Time Order Monitoring**

#### a. **Webhook (POST Back URL)**

* Configure a webhook URL in your Upstox console.
* Receive real-time updates when order status changes.
* No authentication required, must respond with HTTP 2XX.

Payload:

```json
{
  "order_id": "abc123",
  "status": "complete",
  "filled_qty": 100
}
```

#### b. **WebSocket: Portfolio Stream Feed**

* Stream order updates live.
* No need for polling.
* Connect to Upstox WebSocket URL and listen to `order_update` events.

---

## 🧠 Auto-Trading Flow for **Live Orders**

1. **Signal Detection (Strategy Engine)**

   * Price crossovers, indicators, moving averages, etc.

2. **Place Order**

   * Via REST API `/order/place`

3. **Track in Real-Time**

   * Webhook receives update instantly.
   * WebSocket reflects live change.

4. **Decision Logic**

   * If Stop Loss Hit: place `Sell Market`
   * If Target Reached: place `Limit Sell`
   * If Rejected: retry or alert user

5. **Log All Events**

   * For audit trail and debugging

6. **End-of-Day Cleanup**

   * Check for open positions and close or roll over

---

# ⚠️ Sandbox Trading Strategy (Limited Features)

### ✅ Supported APIs:

* `/order/place`
* `/order/modify`
* `/order/cancel`

### ❌ Not Supported:

* `/order/book`
* `/order/details`
* `/order/history`
* Webhooks
* WebSocket feed

---

## 🧠 Auto-Trading Flow for **Sandbox Orders**

Since real-time tracking and status APIs are not available, you **simulate** the process:

---

### 1. **Simulated Status Tracker**

After placing an order:

* Maintain an **in-memory or database-based state**:

```json
{
  "order_id": "ORD001",
  "status": "open",
  "entry_time": "2025-05-27T10:00:00Z"
}
```

---

### 2. **Timer-Based Status Transitions**

* Use timers or cron jobs to "update" order status after some delay.

  * e.g., after 5 seconds: mark order as `complete`

---

### 3. **Mock Response Generator**

* When testing UI or strategy logic, mock `/order/book` or `/order/details` responses.

---

### 4. **Polling Simulation**

Instead of WebSocket, simulate polling by calling your mock backend every X seconds.

---

### 5. **End-of-Day Reset**

* Clear all sandbox orders at end of day (manually or via cron).

---

## 📑 Summary Table

| Step                | Live (Real Trading)                    | Sandbox (Simulated)                         |
| ------------------- | -------------------------------------- | ------------------------------------------- |
| Strategy Signal     | Algorithm/Indicator                    | Algorithm/Indicator                         |
| Place Order         | REST API `/order/place`                | REST API `/order/place`                     |
| Order Tracking      | WebSocket + Webhook + `/order/details` | Simulated in DB/Memory                      |
| Modify/Cancel Order | `/order/modify` or `/order/cancel`     | Same                                        |
| Order Status Flow   | Actual status updates from exchange    | Manually simulate (timers/fake transitions) |
| Logging             | Log actual events and responses        | Log simulated transitions                   |
| EOD Clean-Up        | Query and close positions/orders       | Clear simulated records                     |

---

## 🧩 Implementation Tips

* Abstract your API layer to switch between sandbox and live.
* Build a **mock server** or use JSON-based mocks for missing endpoints.
* Use WebSocket in live, and polling with mock data in sandbox.
* Build your **autotrading logic** to be event-driven in live, but **timer-driven in sandbox**.


