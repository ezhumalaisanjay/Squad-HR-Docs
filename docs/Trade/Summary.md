# AI-Powered Automated Nifty Options Trading – Documentation

## 🔁 Daily Setup: Generate Access Token

### What is it?
Upstox uses OAuth 2.0 to generate short-lived **access tokens** for API access. These tokens expire daily.

### Why is it needed?
To authenticate and authorize every request made to the Upstox trading and data APIs.

### How to do it:
1. Open the Upstox login URL with your `api_key` to get the authorization code.
2. Exchange the code for an access token using the `/login/authorization/token` API.
3. Store the access token securely for use in all API requests.

### Notes:
- This must be done **once every trading day**.
- Use automation to refresh this process at market open.

---

## 🧠 Trading Concepts

### 🔵 Long Position (Buy)
- **Definition**: Buying an asset in anticipation that its price will rise.
- **You own the asset.**
- **Goal**: Buy low, sell high.
- **Example**: Buy Nifty CE at ₹100. If it reaches ₹110, sell for ₹10 profit.

### 🔴 Short Position (Sell First)
- **Definition**: Selling an asset you do not own, expecting the price to drop.
- **You borrow the asset from the broker and sell it.**
- **You must buy it back later to square off.**
- **Goal**: Sell high, buy back low.
- **Example**: Sell Nifty CE at ₹110, price drops to ₹100, buy back and earn ₹10 profit.
- **Note**: Must be closed the same day (Intraday only).

---

## 📉 Stop Loss (SL)

### What is it?
A predefined price at which your trade is automatically exited to **limit your losses**.

### How it works:
- You buy at ₹100, set SL at ₹95.
- If price drops to ₹95, the system places a market sell order.
- **Upstox API supports SL** via `place_order` or `modify_order` APIs.

### Benefits:
- Reduces emotional trading
- Limits downside risk
- Automatically handled at broker/exchange level

---

## 📈 Take Profit (TP)

### What is it?
A target price at which your system exits the trade to lock in **desired profit**.

### How it works:
- Buy at ₹100, TP at ₹110
- If price rises to ₹110, your system places a sell order to book profit

### Important:
- **Upstox API does NOT support TP natively.**
- You must implement TP logic using your own application:
  1. Store TP in your DB
  2. Monitor prices via WebSocket
  3. When TP is reached, trigger `place_order` to exit manually

---

## 🔌 WebSocket Feeds

### What is it?
A real-time streaming connection provided by Upstox to receive **live market data (ticks)** for instruments like Nifty options.

### Why it is used:
- Track live price movement
- Detect SL and TP conditions
- Drive exit logic

### How to use it:
1. Establish a connection using access token and instrument token
2. Subscribe to the desired instruments
3. Receive continuous price updates (per second or better)
4. Run your logic to check for SL or TP match

### Tip:
Keep the WebSocket alive and handle disconnects or errors gracefully.

---

## 📊 Order Lifecycle Workflow

### Step-by-step Process:
1. **Place Entry Order**
   - Buy or Sell (short)
2. **Set Stop Loss (SL)**
   - Use `modify_order` API
3. **Save Take Profit (TP)**
   - Store TP price in your database
4. **Subscribe to WebSocket**
   - Monitor real-time market data
5. **Trigger Sell on TP Hit**
   - If price hits TP, place a market sell
6. **Auto-Exit on SL Hit**
   - If price hits SL, Upstox exits automatically
7. **End-of-Day Square Off (optional)**
   - Use `exit_all_positions` API to close all open positions

---

## 📒 Final Summary Table

| Feature              | Upstox Handles | You Handle |
|----------------------|----------------|------------|
| Long/Short Orders     | ✅ Yes          | ✅ Yes      |
| Stop Loss (SL)        | ✅ Yes (via API)| ❌ No       |
| Take Profit (TP)      | ❌ No           | ✅ Yes      |
| Price Monitoring      | ❌ No           | ✅ Yes (WebSocket) |
| Exit All Positions    | ✅ Yes (manual) | ✅ Optional |
| Access Token Renewal  | ❌ No           | ✅ Yes (daily) |

---

## ✅ Key Advantages of This Architecture
- High-frequency, AI-driven trading
- Real-time execution using WebSocket feed
- Reduced risk via SL protection
- Custom TP logic for consistent profit booking
- Zero manual effort once deployed

---

