# Collaborative Code Editor

<div align="left">
  <img src="https://img.shields.io/badge/AWS_AppSync-GraphQL_API-FF9900?style=for-the-badge&logo=amazonaws&logoColor=white" alt="AWS AppSync"/>
  <img src="https://img.shields.io/badge/Amazon_Cognito-Auth-FF9900?style=for-the-badge&logo=amazoncognito&logoColor=white" alt="Amazon Cognito"/>
  <img src="https://img.shields.io/badge/Amazon_DynamoDB-Database-4053D6?style=for-the-badge&logo=amazondynamodb&logoColor=white" alt="Amazon DynamoDB"/>
  <img src="https://img.shields.io/badge/Next.js-Frontend-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js"/>
  <img src="https://img.shields.io/badge/Monaco_Editor-Code-007ACC?style=for-the-badge&logo=visualstudiocode&logoColor=white" alt="Monaco Editor"/>
</div>

## Project Overview

A production-grade, real-time collaborative code editor facilitating concurrent document editing with low-latency synchronization. Built with a highly scalable, serverless AWS backend and a Next.js frontend, the system guarantees strong data consistency, secure access control, and seamless multi-user collaboration.

##  Project Demo

<p align="center">
  <a href="https://www.youtube.com/watch?v=TRW3RA6j7Pw">
    <img src="https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExb3ZlZ3VxNnY4c2Q2dHh6eTh6eXJqM2Z0YzFjZzY5cG5rZzN4d3l5biZlcD12MV9naWZzX3NlYXJjaCZjdD1n/26tn33aiTi1jkl6H6/giphy.gif" width="600"/>
  </a>
</p>

## Cloud Architecture & AWS Services

This project heavily leverages AWS Serverless managed services to provide high availability, horizontal scalability, and real-time data propagation.

### Service Roles

| AWS Service | Core Purpose | Role in Architecture |
| :--- | :--- | :--- |
| **AWS AppSync** | Real-time GraphQL API | Acts as the central synchronization hub. Manages WebSocket connections for GraphQL subscriptions, delivering real-time code updates to all connected clients under 200ms latency. |
| **Amazon DynamoDB** | Persistence Layer | Extremely fast NoSQL key-value store. Maintains primary data including Document states, metadata, and active collaborative Sessions. |
| **Amazon Cognito** | Authentication & OIDC | Secures the platform through User Pools. Handles user registration, sign-in flows via Hosted UI, and JWT issuance for secure GraphQL access. |

### Real-time Data Flow Strategy

1. **Client Connection**: Users subscribe to document updates via AWS AppSync WebSocket connections.
2. **Event Mutation**: When a user types in the Monaco Editor, a GraphQL mutation (`updateDocument`) is triggered.
3. **Storage Update**: AppSync securely writes the changes to Amazon DynamoDB using direct resolvers.
4. **Broadcast**: AppSync automatically triggers the `onUpdateDocument` subscription, broadcasting the diffs to all connected clients in real time.

## Database Schema (DynamoDB)

The system utilizes an optimized NoSQL schema for fast document retrieval and state management.

| Table Name | Partition Key (PK) | Purpose |
| :--- | :--- | :--- |
| **Documents** | `id` (String) | Stores document contents, title, language format, and timestamps. |
| **DocumentSessions** | `documentId` (String) | Tracks active users in a specific document session for presence features. |

## GraphQL API Design

The AWS AppSync GraphQL API defines strict types to guarantee data integrity between the Next.js frontend and the DynamoDB backend.

| Operation Type | Operations | Description |
| :--- | :--- | :--- |
| **Queries** | `getDocument`, `listDocuments` | Fetch single document states or list active user documents for the dashboard. |
| **Mutations** | `createDocument`, `updateDocument`, `deleteDocument` | Perform CRUD operations to persist code state. |
| **Subscriptions**| `onUpdateDocument` | Triggered exclusively on mutation to push data to active session subscribers. |

## Authentication Setup

The platform implements OpenID Connect (OIDC) via Amazon Cognito and the `react-oidc-context` library. 

| Layer | Configuration | 
| :--- | :--- |
| **OAuth Flow** | Authorization Code Grant |
| **Scopes** | `openid`, `email`, `phone` |
| **Access Control** | JWT verification via AppSync Default Authorization |

Users are redirected to the Cognito Hosted UI for sign-in, exchanging the authorization code for ID, Access, and Refresh tokens automatically on the frontend. The `AuthProvider.tsx` maps the OIDC user profile to internal system records.

## Local Development Configuration

To run the Next.js application locally against the deployed AWS backend services:

### 1. Configure Environment Variables

Create a `.env` (or `.env.local`) file in the project directory root containing your AWS resource bindings:

```env
# AWS Cognito (OIDC Authentication)
NEXT_PUBLIC_AWS_REGION=ap-south-1
NEXT_PUBLIC_COGNITO_AUTHORITY=https://cognito-idp.ap-south-1.amazonaws.com/your-pool-id
NEXT_PUBLIC_COGNITO_CLIENT_ID=your-client-id
NEXT_PUBLIC_COGNITO_REDIRECT_URI=http://localhost:3000
NEXT_PUBLIC_COGNITO_DOMAIN=https://your-auth-domain.auth.ap-south-1.amazoncognito.com

# AWS AppSync (Real-time DB / API)
NEXT_PUBLIC_APPSYNC_GRAPHQL_ENDPOINT=https://your-api-id.appsync-api.ap-south-1.amazonaws.com/graphql
```

### 2. Start the Development Server

```bash
npm install
npm run dev
```

Navigate your browser to `http://localhost:3000` to interact with the platform.

Note: The AWS services have been stopped due to billing constraints; however, you can deploy and host the application on your own setup.
