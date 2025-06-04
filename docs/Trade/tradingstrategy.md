## **Intraday Algorithmic Trading Strategy using Upstox for Nifty 50 Weekly Option Chain**.

---

## ✅ **Step-by-Step Procedure for Algorithmic Trading**

### 📌 1. **Setup & Initialization**

* **Schedule Start/Stop**: Use a cron scheduler or AWS EventBridge to start the algorithm at 9:15 AM IST (market open) and stop at 3:30 PM IST (market close).
* **Manual Control**: Provide manual override (Start/Stop) via a front-end dashboard with backend control APIs.

---

### 📌 2. **Fetch Spot Price (Nifty 50 LTP)**

* Use Upstox REST API to fetch **Live Nifty 50 Spot Price (LTP)**.
* Identify the **weekly expiry date** (nearest Thursday), or use Upstox API to dynamically find upcoming expiry.

---

### 📌 3. **Locate Closest Strike Prices**

* From the current Spot Price, calculate **±200 range**.
* Locate 2 strike prices closest to this spot price (e.g., if spot = 22,200 → look for 22,000 and 22,400).

---

### 📌 4. **Identify Instruments (CE/PE)**

* For each selected strike price, fetch:

  * **Call Option (CE)**
  * **Put Option (PE)**
* Total: 2 Strike Prices × 2 Instruments = **4 Instruments**

---

### 📌 5. **Set Up Microservices Architecture**

Each of the **4 instruments** should be assigned to a dedicated **port/microservice**, each with:

* **Route 1: `/info`** – Detailed instrument info (strike, type, expiry, token, etc.)
* **Route 2: `/closest-ltp`** – Finds closest LTP to ±200 range and performs liquidity check.

---

### 📌 6. **Liquidity Check**

* Fetch **market depth** for each instrument.
* Get:

  * **Best Buy Price**
  * **Best Sell Price**
* Calculate:

  * **Mid Price** = (Buy + Sell) / 2
  * **Spread** = |Buy - Sell|
* If spread > threshold (illiquid), drop the instrument and move to next closest strike.

---

### 📌 7. **Place Buy Order with Trade Rules**

* Once liquidity is validated:

  * Fetch **user trade rules** (Stop Loss %, Target %, Quantity) from front-end.
  * Place **Limit Buy Order** at best buy or mid price.

---

### 📌 8. **Place OCO Sell Orders**

* After placing buy order:

  * **Limit Sell Order** at Target Price
  * **Stop Loss Market Order** at Stop Loss Price
* Tag both with OCO logic (not native in Upstox, handle logic in app).

---

### 📌 9. **Monitor Order Status**

* Use:

  * **WebSocket (preferred)** for real-time updates.
  * Or **Polling REST API** for order book status.
* Once Limit Buy Order is filled:

  * Monitor both Sell Orders for execution.

---

### 📌 10. **Exit Logic**

* Once either sell order is executed:

  * **Cancel the other pending order** (limit/SLM).
  * Confirm exit and finalize trade cycle.

---

### 📌 11. **Post-Trade Actions**

* Fetch:

  * **Order History**
  * **Order Book**
  * **PnL Report**
* Save data into **DynamoDB** with:

  * Timestamps
  * Entry/Exit points
  * Execution prices
  * PnL
  * User ID and Algo ID for audit

---

### 📌 12. **Expiry Handling**

* Every new week:

  * Automatically fetch new **weekly expiry** via Upstox API.
  * Update relevant instruments and database records.

---

## 🔄 Short Summary Paragraph

This intraday algorithmic trading system for Nifty 50 weekly options fetches the current spot price and identifies the closest strike prices within a ±200 range. For each strike, it processes Call and Put options via microservices on separate ports, each exposing routes for instrument info and closest LTP evaluation. After passing a liquidity check (based on bid-ask spread), the system places a limit buy order according to user-defined trade rules (target/stop-loss), followed by limit sell and stop-loss market orders. Real-time order status is monitored using WebSocket or REST API polling. Once one exit order is executed, the other is canceled, and the trade is logged in DynamoDB for auditing. The system auto-refreshes expiry instruments weekly and supports scheduled and manual control for trading sessions.

---