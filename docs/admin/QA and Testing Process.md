# Automating Unit Tests for ShadCN UI Components with AWS Lambda & CodeCommit

## Overview

This document describes how to automate unit test generation and execution for ShadCN UI components in a Next.js project using AWS Lambda, CodeCommit, and CodeBuild.

## Project Structure

```
/my-project
│── /app
│   ├── /components    # Custom UI components
│   ├── /ui            # ShadCN components
│── /__tests__         # Test files will be stored here
│── package.json       # Project dependencies
│── jest.config.js     # Jest configuration
│── buildspec.yml      # AWS CodeBuild configuration
```

## Steps

### 1. Set Up AWS Lambda for CodeCommit Push Event

- Create a Lambda function.
- Configure a trigger for AWS CodeCommit push events.
- Use AWS SDK to retrieve modified `.ts` files in `/components/` and `/ui/`.

### 2. Generate Unit Test Files

- Identify modified component files.
- Dynamically generate test files in `__tests__/`.
- Example test template for a button component:
  
  ```ts
  import { render, screen } from "@testing-library/react";
  import { Button } from "@/app/ui/button";

  describe("Button Component", () => {
    test("renders correctly", () => {
      render(<Button>Click Me</Button>);
      expect(screen.getByText("Click Me")).toBeInTheDocument();
    });
  });
  ```

### 3. Commit Generated Test Files

- Use AWS SDK to commit `.test.tsx` files to CodeCommit.

### 4. Configure AWS CodeBuild to Run Tests

- Install Jest dependencies:

  ```bash
  npm install --save-dev jest @testing-library/react @testing-library/jest-dom
  ```

- Configure `jest.config.js`:

  ```js
  module.exports = {
    testEnvironment: "jsdom",
    setupFilesAfterEnv: ["@testing-library/jest-dom/extend-expect"],
  };
  ```

- Create `buildspec.yml` for CodeBuild:

  ```yaml
  version: 0.2
  phases:
    install:
      commands:
        - npm install
    build:
      commands:
        - npm run test
  ```

### 5. Send Test Results to Chat App

- Use AWS Lambda or CodeBuild to send test results via webhook to Slack/Discord.

## Tech Stack

- **AWS Lambda** (CodeCommit event trigger)
- **AWS CodeCommit** (Git repository)
- **Jest + React Testing Library** (Testing framework)
- **AWS CodeBuild** (Test automation)
- **Slack/Discord API** (Test result notifications)
