# PomoPro Backend (Express + MongoDB + Socket.IO)

Base URL: http://localhost:4000/api

## Endpoints

- POST /auth/signup
- POST /auth/login
- GET /auth/me

- GET /tasks/:userId
- POST /tasks/create
- PATCH /tasks/:taskId
- DELETE /tasks/:taskId
- POST /tasks/:taskId/increment-pomodoro

- POST /sessions/log
- GET /sessions/:userId
- GET /sessions/:userId/stats?period=week|month
- POST /sessions/shared/start

- POST /org/create
- POST /org/join
- GET /org/:userId

## Env

Create .env in backend root with:

PORT=4000
MONGODB_URI=mongodb://127.0.0.1:27017/pomopro
JWT_SECRET=change_me
CORS_ORIGIN=http://localhost:19006

## Run

npm install
npm run dev

Socket.IO: join a room by emitting org:join with { orgId }.
