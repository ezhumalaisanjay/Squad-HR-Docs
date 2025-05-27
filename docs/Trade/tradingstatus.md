# Order Status

Here is a detailed explanation of **order statuses in Upstox trading account**, outlining the complete lifecycle from placing an order, modifying, cancelling, or exiting it.

---

### 🔁 **1. Order Placement Lifecycle**

| **Status**                 | **Description**                                                                                                                                 |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| **put order req received** | This is the **initial stage**. Your request to place a new order has been received by the Upstox system.                                        |
| **validation pending**     | The system is **validating** the order details like price, quantity, symbol, and margin availability.                                           |
| **trigger pending**        | For **Stop Loss** or **Trigger Orders**, this means the order is **waiting for the trigger price** to be hit before it is sent to the exchange. |
| **open pending**           | The order is being sent to the exchange. It is **awaiting confirmation** to become active in the market.                                        |
| **open**                   | The order is now **active and live** in the exchange. It can be partially or fully executed depending on the market conditions.                 |
| **complete**               | The order is **fully executed** (i.e., all units have been bought or sold as per the order).                                                    |

---

### ✏️ **2. Modify Order Lifecycle**

| **Status**                    | **Description**                                                                                                        |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| **modify pending**            | A request has been made to **change the order** (price, quantity, etc.). It is pending system processing.              |
| **modify validation pending** | The **modification request** is undergoing **validation** (e.g., checking whether it’s valid to modify at this point). |
| **modified**                  | The order has been **successfully updated** with the requested changes.                                                |
| **not modified**              | The **modification request failed**, and the order remains in its previous state.                                      |

---

### ❌ **3. Cancel Order Lifecycle**

| **Status**         | **Description**                                                                                                 |
| ------------------ | --------------------------------------------------------------------------------------------------------------- |
| **cancel pending** | A cancellation request has been submitted and is **waiting to be processed**.                                   |
| **cancelled**      | The order has been **successfully cancelled**.                                                                  |
| **not cancelled**  | The cancellation **could not be processed**, possibly because the order was already executed or in final state. |

---

### 🌙 **4. After Market Order (AMO) Lifecycle**

These statuses relate to orders placed outside of market hours (AMO orders):

| **Status**                                 | **Description**                                                                 |
| ------------------------------------------ | ------------------------------------------------------------------------------- |
| **after market order req received**        | A new **AMO request** has been placed and received by the system.               |
| **modify after market order req received** | A **modification request for an AMO order** has been received.                  |
| **cancelled after market order**           | The AMO order has been successfully cancelled **before it reached the market**. |

---

### ❗ **5. Rejected / Final States**

| **Status**   | **Description**                                                                                                        |
| ------------ | ---------------------------------------------------------------------------------------------------------------------- |
| **rejected** | The order was **not accepted by the exchange**—reasons could include invalid inputs, price errors, margin issues, etc. |
| **complete** | The order has been **fully filled**.                                                                                   |

---

### 📘 Summary Flow of Order Status in Upstox

#### 🛒 **Placing an Order:**

```
put order req received → validation pending → trigger pending (if stop-loss) → open pending → open → complete
```

#### ✏️ **Modifying an Order:**

```
modify pending → modify validation pending → modified / not modified
```

#### ❌ **Cancelling an Order:**

```
cancel pending → cancelled / not cancelled
```

#### 🌙 **After Market Orders:**

```
after market order req received → (if modified) modify after market order req received → (if cancelled) cancelled after market order
```

#### 🚫 **If the order fails:**

```
validation pending → rejected
```

---
