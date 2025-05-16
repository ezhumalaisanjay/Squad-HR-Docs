## Trade Overview

## Task List: Authentication & Environment Setup

**User Story 1.1: Amplify Environment Initialization**

**Objective:**
Initialize AWS Amplify Gen2 project with a solid frontend/backend structure and secure environment variable handling for Upstox and Google AI Studio.

**Steps:**

1. **Create Amplify Project:**

   * Use Amplify CLI (`amplify init`) to initialize a new project.
   * Define the environment (e.g., `sandbox`, `production`).

2. **Define Frontend and Backend:**

   * Scaffold the frontend using React or any preferred framework.
   * Scaffold backend with Lambda functions, GraphQL or REST APIs, and DynamoDB.

3. **Set Environment Variables:**

   * Create variables for Upstox and Google AI API keys.
   * Store temporary values in `amplify/team-provider-info.json` during development.

4. **Use AWS Secrets Manager:**

   * Create secrets in AWS Secrets Manager.
   * Reference secrets in Lambda functions using environment variables.
   * Ensure IAM permissions allow secure access to Secrets Manager.

5. **Verification:**

   * Ensure Amplify CLI injects secrets at build time.
   * Test secret access from backend functions.

**Acceptance Criteria:**

* Amplify initialized with frontend and backend structure.
* Upstox and Google AI API environment variables defined.
* Secrets stored securely and accessible.

---

## Task List: Market Data Integration (WebSocket)

**Task: Connect to Upstox Sandbox WebSocket**

**Steps:**

1. **WebSocket Client Integration:**

   * Use native WebSocket or libraries like `socket.io` or `ws` to connect.
   * Authenticate with Upstox sandbox credentials.

2. **Handle Market Data Events:**

   * Listen for Nifty index tick data.
   * Process incoming messages and update state/storage.

3. **Error & Reconnect Logic:**

   * Handle disconnects and retries.
   * Display connection status in the UI.

---

## Task List: Broadcast Real-Time Data to UI

**User Story 2.2: Broadcast Real-Time Data to UI**

**Steps:**

1. **Backend Message Processing:**

   * Parse and format Nifty tick data.
   * Calculate 15-minute moving average in Lambda.

2. **Use Pub/Sub Mechanism:**

   * Use AWS AppSync subscriptions, WebSocket APIs, or Amplify's real-time capabilities to push updates to frontend.

3. **Frontend Subscription:**

   * Subscribe to real-time updates.
   * Display Nifty price and 15-MA.
   * Show connection status (green/red indicator).

**Acceptance Criteria:**

* Nifty price and 15-MA updated in real-time.
* 15-MA updates every 15 minutes.
* UI shows connection status.

---

## Task List: Paper Trading Engine

**User Story 3.1: Execute Paper Trades Based on Strategy**

**Steps:**

1. **Define Strategy Rule:**

   * Monitor price crossing defined execution level.
   * Check 15-MA rule compliance.

2. **Simulate Option Trade:**

   * Choose nearest ₹200 strike.
   * Create paper trade object with price, SL, target.

3. **Log the Trade:**

   * Log details to DynamoDB with timestamps and trade metadata.

**Acceptance Criteria:**

* Trade executed on strategy condition match.
* Strike price selection logic works.
* SL/target applied and recorded.

**User Story 3.2: Re-entry Timing Logic**

**Steps:**

1. **Cooldown Timer:**

   * Record last trade timestamp for each level.
   * Deny new trades within 5 minutes at same level.

2. **UI Feedback:**

   * Display countdown timer after trade.

**Acceptance Criteria:**

* 5-minute cooldown enforced.
* Timer resets on valid trades.

**User Story 3.3: Store Paper Trades in DynamoDB**

**Steps:**

1. **Schema Design:**

   * Partition key: user ID.
   * Sort key: timestamp.
   * Attributes: contract, SL, target, status, etc.

2. **Store Trades:**

   * Lambda stores trades upon execution.

3. **Query Interface:**

   * Allow querying by user ID, status, time.

**Acceptance Criteria:**

* All trades stored with metadata.
* Queries by user and time supported.

---

## Task List: Integration via Google AI Studio

**User Story 4.1: Fetch Risk & Prediction Analytics**

**Steps:**

1. **Prepare Inputs:**

   * Package price, 15-MA, SL, target, volatility.

2. **Call AI API:**

   * Use HTTP POST to Google AI endpoint.
   * Pass required headers and input payload.

3. **Parse and Store Output:**

   * Parse predictions (expected return, scenarios, risk score).
   * Store with trade data in DynamoDB.

**Acceptance Criteria:**

* Proper API call with inputs.
* Response saved with trades.

**Task: Display AI Analytics on UI**

**Steps:**

1. **Frontend API Integration:**

   * Fetch analytics for a trade ID.
   * Display return, risk, and scenarios.

2. **UI Enhancements:**

   * Design cards or table to show AI metrics.

---

## Task List: Paper Trading Dashboard & UI

**Task: Trade Log Table**

**Steps:**

* Display trade entries with timestamps, contract, SL, target, status.
* Allow sorting and filtering.

**Task: Strategy Parameter Input Panel**

**Steps:**

* Input fields for execution level, MA period.
* Submit to backend for strategy monitoring.

**Task: Real-Time Alerts & Notifications**

**Steps:**

* Trigger notifications on trade entry/exit.
* Visual/audible alert on price signal match.

---

## Task List: Testing, Monitoring & Deployment

**User Story 6.1: Implement Unit & Integration Tests**

**Steps:**

1. **Test Lambda Functions:**

   * Write Jest/Pytest unit tests for each function.
   * Include edge cases and error handling.

2. **Mock External APIs:**

   * Mock Upstox and Google AI calls.
   * Validate outputs and system behavior.

3. **Test Coverage:**

   * Use coverage tools to ensure 80%+ coverage.

**Acceptance Criteria:**

* Tests for WebSocket, trade logic, AI calls.
* 80%+ test coverage.
* Mocks validate external dependencies.

**User Story 6.2: CI/CD & Post-Deployment Validation**

**Steps:**

1. **CI/CD Setup:**

   * Use Amplify's pipeline or integrate GitHub Actions.
   * Trigger build on push to main.

2. **Deploy and Validate:**

   * Deploy to sandbox environment.
   * Confirm functions/API and UI are working.

3. **Monitoring:**

   * Use CloudWatch for Lambda logs.
   * Inject secrets using Amplify environment config.

**Acceptance Criteria:**

* Automatic deploy to sandbox on push.
* CloudWatch logs visible.
* Secrets injected securely during deploy.
