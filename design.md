# Low Level Design Document – PomoPro

## 1. Introduction

**App Name:** PomoPro

**Purpose:** A productivity app that uses the Pomodoro technique to help users manage time, track tasks, analyze productivity, and collaborate with peers or within organizations.

**Tech Stack:**

* **Frontend:** React Native
* **Backend:** Node.js + Express
* **Database:** MongoDB (Mongoose ODM)
* **Real-time Communication:** WebSockets (Socket.IO)

**Scope:** Covers Task Management, Pomodoro Timer, User Authentication, Productivity Analytics, and Collaboration (Teams, Shared Sessions, Pair Focus Mode).

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

### 2.5 Collaboration 

#### 2.5.1 Team Management

**Description:** Create or join an organization/team.

* **Inputs:** Team name, invite code
* **Outputs:** Organization details, member list

**Flow:**

1. User creates/join team via invite code
2. Members can see shared tasks and sessions

---

#### 2.5.2 Shared Pomodoro Sessions

**Description:** Multiple users run the same Pomodoro timer together.

* **Inputs:** Session type (focus/break), duration, participants
* **Outputs:** Synced timer across devices, session logs

**Flow:**

1. User starts shared session
2. Timer synced via WebSocket
3. Session logged in DB for all participants

---

#### 2.5.3 Pair Focus Mode (Inspired by Pair Programming)

**Description:** Two users pair up for a shared, synced Pomodoro session.

* **Inputs:** Tasks chosen by both users
* **Outputs:** Real-time synced progress, chat/notes option

**Flow:**

1. User A invites User B to pair session
2. Both confirm and start timer
3. Progress updates shared in real-time
4. End-of-session stats shown for both

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
 │     ├── AnalyticsScreen
 │     └── CollaborationStack
 │           ├── TeamDashboardScreen
 │           ├── SharedSessionScreen
 │           └── PairFocusScreen
```

**Example: SharedSessionScreen**

* **State:** `timeLeft`, `isRunning`, `participants`, `sessionType`, `chatMessages`
* **Methods:** `startSession()`, `syncTime()`, `sendMessage()`, `endSession()`
* **Navigation:** Back → TeamDashboard

---

## 4. Database Design (MongoDB)

### Users

```json
{
  "_id": "ObjectId",
  "name": "string",
  "email": "string",
  "passwordHash": "string",
  "createdAt": "Date"
}
```

### Tasks

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

### Sessions

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

### Organizations (New)

```json
{
  "_id": "ObjectId",
  "name": "string",
  "code": "string",
  "members": ["ObjectId (userId)"],
  "createdAt": "Date"
}
```

### SharedSessions (New)

```json
{
  "_id": "ObjectId",
  "organizationId": "ObjectId",
  "sessionType": "focus | break",
  "duration": "number",
  "startedBy": "ObjectId",
  "participants": [
    { "userId": "ObjectId", "taskId": "ObjectId" }
  ],
  "startedAt": "Date",
  "endedAt": "Date"
}
```

---

## 5. API Contracts

### Auth

* **POST** `/auth/signup`
* **POST** `/auth/login`

### Tasks

* **GET** `/tasks/:userId`
* **POST** `/tasks/create`

### Sessions

* **POST** `/sessions/log`

### Collaboration (New)

**POST `/org/create`**
*Request*

```json
{ "name": "Study Group A", "userId": "123" }
```

*Response*

```json
{ "orgId": "456", "code": "XYZ123" }
```

**POST `/org/join`**
*Request*

```json
{ "userId": "123", "code": "XYZ123" }
```

**POST `/session/shared/start`**
*Request*

```json
{
  "orgId": "456",
  "sessionType": "focus",
  "duration": 25,
  "participants": [
    { "userId": "123", "taskId": "789" },
    { "userId": "124", "taskId": "790" }
  ]
}
```

---

## 6. Sequence Diagram (Shared Session Example)

```
User A → TeamDashboard: Start Shared Session
TeamDashboard → Backend: Create SharedSession
Backend → DB: Insert shared session
Backend → All Participants (via WebSocket): Notify session start
All Users → SharedSessionScreen: Show synced timer
At end → Backend logs completion → Updates analytics
```

---

## 7. Error Handling & Edge Cases

* Invalid login → Show error toast
* Timer paused → Preserve state in AsyncStorage
* API failure → Use local cache and sync later
* Task without deadline → Default null deadline
* Shared session user drops → Continue for remaining users
* Invalid org code → Show error message

---

## 8. Non-Functional Requirements

**Performance:** Timer runs locally; sync only for shared sessions.

**Security:**

* Passwords hashed with bcrypt
* JWT tokens stored securely in AsyncStorage
* Org codes unique and expirable

**Scalability:** MongoDB collections allow growth of tasks, sessions, orgs.

**Real-time:** Shared sessions & pair focus use WebSocket for live sync.
