# Low Level Design Document – PomoPro

## 1. Introduction

**App Name:** PomoPro

**Purpose:** A productivity app that uses the Pomodoro technique to help users manage time, track tasks, and analyze productivity.

**Tech Stack:**

* **Frontend:** React Native
* **Backend:** Node.js + Express
* **Database:** MongoDB (Mongoose ODM)

**Scope:** Covers Task Management, Pomodoro Timer, User Authentication, and Productivity Analytics.

---

## 2. Modules & Features

### 2.1 User Authentication

**Description:** User signup, login, and session management.

* **Inputs:** Email, password
* **Outputs:** JWT token, user profile

**Flow:**

1. User enters credentials
2. App sends credentials to backend
3. Backend verifies and returns token
4. Token stored securely in AsyncStorage

---

### 2.2 Task Management

**Description:** Create, edit, delete, and list tasks.

* **Inputs:** Task name, category, deadline, Pomodoro count, Task description
* **Outputs:** Task object with status

**Flow:**

1. User creates a task
2. Task stored in MongoDB
3. Tasks retrieved & displayed in dashboard

---

### 2.3 Pomodoro Timer

**Description:** Start, pause, reset Pomodoro cycles (25m focus + 5m break).

* **Inputs:** Start/Stop command
* **Outputs:** Timer state, notifications

**Flow:**

1. User starts a session
2. Timer runs locally in app
3. Session completion logged in DB

---

### 2.4 Productivity Analytics

**Description:** Show session history, completed tasks, and focus stats.

* **Inputs:** User ID
* **Outputs:** Charts & stats (sessions completed, total focus time)

**Flow:**

1. App fetches logs from DB
2. Aggregates data
3. Renders weekly/monthly summary

---

## 3. Detailed Component Design

### 3.1 Screens & Components

```
App
 ├── AuthStack
 │     ├── LoginScreen
 │     ├── SignupScreen
 ├── HomeStack
 │     ├── HomeScreen
 │     ├── TaskListScreen
 │     ├── TaskDetailScreen
 │     ├── TimerScreen
 │     └── AnalyticsScreen
```

**Example: TimerScreen**

* **State:** `timeLeft`, `isRunning`, `sessionType (focus/break)`
* **Methods:** `startTimer()`, `pauseTimer()`, `resetTimer()`, `switchSession()`
* **Navigation:** Back → HomeScreen

---

## 4. Database Design (MongoDB)

### Collections

**Users**

```json
{
  "_id": "ObjectId",
  "name": "string",
  "email": "string",
  "passwordHash": "string",
  "createdAt": "Date"
}
```

**Tasks**

```json
{
  "_id": "ObjectId",
  "userId": "ObjectId",
  "title": "string",
  "description": "string",
  "status": "pending | completed",
  "deadline": "Date",
  "createdAt": "Date"
}
```

**Sessions**

```json
{
  "_id": "ObjectId",
  "userId": "ObjectId",
  "taskId": "ObjectId",
  "type": "focus | break",
  "duration": "number (minutes)",
  "completedAt": "Date"
}
```

---

## 5. API Contracts

### POST `/auth/signup`

**Request**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "mypassword"
}
```

**Response**

```json
{
  "message": "Signup successful",
  "token": "jwt_token_here"
}
```

---

### POST `/auth/login`

**Request**

```json
{
  "email": "john@example.com",
  "password": "mypassword"
}
```

**Response**

```json
{
  "message": "Login successful",
  "token": "jwt_token_here",
  "userId": "ObjectId"
}
```

---

### GET `/tasks/:userId`

**Response**

```json
[
  {
    "_id": "123",
    "title": "Finish project",
    "status": "pending",
    "deadline": "2025-08-20"
  }
]
```

---

### POST `/sessions/log`

**Request**

```json
{
  "userId": "123",
  "taskId": "456",
  "type": "focus",
  "duration": 25
}
```

---

## 6. Sequence Diagram (Example: Start Timer)

```
User → TimerScreen: Start Timer
TimerScreen → Local State: Start countdown
TimerScreen → Backend: Log session start
Backend → DB (Sessions): Insert new session
TimerScreen → User: Show countdown
```

---

## 7. Error Handling & Edge Cases

* Invalid login → Show error toast
* Timer paused → Preserve state in AsyncStorage
* API failure → Use local cache and sync later
* Task without deadline → Default null deadline

---

## 8. Non-Functional Requirements

**Performance:** Timer runs locally without needing backend calls

**Security:**

* Passwords hashed with bcrypt
* JWT tokens stored securely in AsyncStorage

**Scalability:** MongoDB allows flexible schema for tasks/sessions
