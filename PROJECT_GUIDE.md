# 🚀 X-Chat Project Documentation & Interview Guide

---

## 📋 Table of Contents
1. [Project Overview](#1-project-overview)
2. [Technology Stack](#2-technology-stack)
3. [System Architecture & Data Flow](#3-system-architecture--data-flow)
4. [Database Schema (MongoDB)](#4-database-schema-mongodb)
5. [REST API Endpoints](#5-rest-api-endpoints)
6. [Real-Time WebSocket Events (Socket.IO)](#6-real-time-websocket-events-socketio)
7. [Key Technical Features & Highlights](#7-key-technical-features--highlights)
8. [Deployment Setup (Vercel & Render)](#8-deployment-setup-vercel--render)
9. [Top 15 Interview & Viva Questions with Answers](#9-top-15-interview--viva-questions-with-answers)

---

## 1. Project Overview

**X-Chat** is a full-stack, real-time web application for temporary and anonymous chat rooms. Users can register/login, create unique 6-character room codes, join existing rooms, chat in real-time, see who is online, and view persistent room history.

### 🌟 Key Product Highlights
- **Real-Time Communication**: Multi-user instant chat using WebSockets (`Socket.IO`).
- **Temporary Room Lifecycle**: Rooms and their message history are automatically purged from MongoDB when the room becomes empty (0 active users).
- **Secure Authentication**: Password hashing using `bcryptjs` and stateless session management with `JSON Web Tokens (JWT)`.
- **Responsive Modern UI**: Styled with clean modern CSS, glassmorphism, glowing badges, and responsive layouts.
- **Cross-Domain Deployment**: Frontend deployed on **Vercel** (`xchat-ashen.vercel.app`), Backend API & Socket server deployed on **Render** (`xchat-nzb2.onrender.com`).

---

## 2. Technology Stack

### 💻 Frontend (Client)
- **Framework/Library**: React 18 + Vite
- **Routing**: `react-router-dom` (v6)
- **HTTP Client**: `axios` with Request Interceptors
- **Real-time Client**: `socket.io-client`
- **Icons**: `lucide-react`
- **Styling**: Vanilla CSS3 (Custom Design System with Variables & Animations)

### ⚙️ Backend (Server)
- **Runtime**: Node.js
- **Framework**: Express.js
- **Real-time Engine**: `socket.io`
- **Database ORM**: `mongoose` (MongoDB Atlas)
- **Authentication**: `jsonwebtoken` (JWT), `bcryptjs`
- **CORS & Middleware**: `cors`, `dotenv`

---

## 3. System Architecture & Data Flow

```
+---------------------------+                +-------------------------+
| User Browser (React SPA)  | -- HTTP API -> | Express Node.js Server  |
| (xchat-ashen.vercel.app)  | <WebSocket> -> | (xchat-nzb2.render.com) |
+---------------------------+                +-------------------------+
                                                          |
                                                    MongoDB Atlas
```

### Flow of Execution:
1. **User Authentication**: User logs in/registers via REST API (`/api/auth/...`). Server returns a JWT token stored in browser `localStorage`.
2. **Room Creation/Validation**: User requests a room via REST API (`/api/rooms/create` or `/api/rooms/:roomId`).
3. **Socket Connection**: When joining a room page, `socket.io-client` opens a persistent WebSocket connection.
4. **Real-time Messaging**: Sent messages are saved to MongoDB asynchronously and simultaneously broadcasted to all sockets in that room.
5. **Automatic Cleanup**: When all users disconnect from a room, Socket.IO triggers a database cleanup hook deleting the `Room` document and all `Message` documents associated with it.

---

## 4. Database Schema (MongoDB)

### 👤 User Schema (`models/User.js`)
| Field | Type | Options / Constraints |
| :--- | :--- | :--- |
| `name` | String | Required, Trimmed, Max 50 chars |
| `email` | String | Required, Unique, Lowercase, Trimmed |
| `password` | String | Required, Min 6 chars (Hashed with Bcrypt) |
| `createdAt` | Date | Default `Date.now` |

### 🚪 Room Schema (`models/Room.js`)
| Field | Type | Options / Constraints |
| :--- | :--- | :--- |
| `roomId` | String | Required, Unique, Uppercase, Trimmed (6-char code) |
| `createdAt` | Date | Default `Date.now` |

### 💬 Message Schema (`models/Message.js`)
| Field | Type | Options / Constraints |
| :--- | :--- | :--- |
| `roomId` | String | Required, Indexed |
| `senderId` | ObjectId | Ref `User`, Required |
| `senderName` | String | Required |
| `text` | String | Required, Max 2000 chars |
| `createdAt` | Date | Default `Date.now`, Indexed |

---

## 5. REST API Endpoints

### Auth Routes (`/api/auth`)
- `POST /api/auth/register` - Create a new user account & return JWT.
- `POST /api/auth/login` - Authenticate user credentials & return JWT.
- `GET /api/auth/me` - Fetch profile of currently authenticated user (`Bearer <token>`).

### Room Routes (`/api/rooms`)
- `POST /api/rooms/create` - Generate a unique 6-character Room ID and save to DB.
- `GET /api/rooms/:roomId` - Verify if a room exists in the database.
- `DELETE /api/rooms/:roomId` - Manually delete room and associated chat history.

### Health Route
- `GET /api/health` - Server health check endpoint.

---

## 6. Real-Time WebSocket Events (Socket.IO)

| Event Name | Direction | Payload | Description |
| :--- | :--- | :--- | :--- |
| `user-online` | Client ➔ Server | `{ userId, name }` | Registers user as online globally |
| `online-users` | Server ➔ Client | `Array<{ userId, name }>` | Broadcasts updated online users list |
| `join-room` | Client ➔ Server | `{ roomId, userId, name }` | Joins a room & fetches history |
| `room-history` | Server ➔ Client | `{ roomId, messages }` | Emits last 100 messages to joining user |
| `send-message` | Client ➔ Server | `{ roomId, senderId, senderName, text }` | Sends a message to the room |
| `receive-message` | Server ➔ Client | `{ _id, senderId, text, ... }` | Broadcasts message to all members in room |
| `room-users-updated` | Server ➔ Client | `{ roomId, users, count }` | Broadcasts updated member list in room |
| `leave-room` | Client ➔ Server | `{ roomId }` | Explicitly leaves a chat room |

---

## 7. Key Technical Features & Highlights

1. **Stateless Authentication with Axios Interceptors**:
   Axios automatically injects the JWT token in `Authorization: Bearer <token>` header for all REST calls via `api.interceptors.request`.

2. **Automatic DB Room Cleanup**:
   In-memory `activeRooms` Map tracks socket connections. When `activeRooms.get(roomId).size === 0`, server automatically deletes the `Room` and `Message` documents from MongoDB.

3. **CORS & Multi-Origin Handling**:
   Custom CORS callback in Express & Socket.IO validates incoming origins from Vercel (`.vercel.app`) and Localhost (`5173`).

4. **Single Page Application Routing on Vercel**:
   Custom `vercel.json` handles rewrites (`/.* -> /index.html`) so direct navigation (`/register`, `/dashboard`) works without `404 Not Found`.

---

## 8. Deployment Setup (Vercel & Render)

- **Frontend**: Vercel (`xchat-ashen.vercel.app`)
  - **Build Command**: `npm run build`
  - **Output Directory**: `dist`
  - **Environment Variables**:
    - `VITE_API_URL` = `https://xchat-nzb2.onrender.com`
    - `VITE_SOCKET_URL` = `https://xchat-nzb2.onrender.com`

- **Backend**: Render (`xchat-nzb2.onrender.com`)
  - **Build Command**: `npm install`
  - **Start Command**: `node server.js`
  - **Environment Variables**:
    - `CLIENT_URL` = `https://xchat-ashen.vercel.app`
    - `MONGODB_URI` = `mongodb+srv://...`
    - `JWT_SECRET` = `your_secret_key`

---

## 9. Top 15 Interview & Viva Questions with Answers

### Q1: What is the main difference between HTTP requests and WebSockets?
**Answer**: HTTP is a stateless, request-response protocol where the client initiates every request. WebSockets provide a full-duplex, persistent TCP connection allowing bidirectional, real-time communication between client and server with minimal overhead.

### Q2: Why did you choose Socket.IO over native WebSockets?
**Answer**: Socket.IO builds on top of WebSockets and offers built-in features such as auto-reconnection, room multiplexing (`socket.join`), fallback to HTTP long-polling if WebSockets are blocked, and automatic JSON serialization/deserialization.

### Q3: How is user authentication implemented in X-Chat?
**Answer**: We use JSON Web Tokens (JWT). When a user registers or logs in, the backend hashes the password using `bcryptjs` (salt factor 10) and signs a JWT containing the user ID. The client saves this token in `localStorage` and includes it in the `Authorization` header for protected routes.

### Q4: How do you handle password security in your database?
**Answer**: Passwords are never stored in plain text. We use `bcryptjs` to generate a random salt and hash the password before saving to MongoDB. During login, `bcrypt.compare()` verifies the entered password against the stored hash.

### Q5: How does automatic room deletion work when users leave?
**Answer**: The server maintains an in-memory `Map` named `activeRooms`. When a user disconnects or triggers `leave-room`, their socket ID is removed from the room's socket map. If `roomMap.size === 0`, the server triggers `Room.deleteOne({ roomId })` and `Message.deleteMany({ roomId })` in MongoDB.

### Q6: How is room code uniqueness guaranteed during room creation?
**Answer**: The room generator creates a random 6-character alphanumeric code. A `while` loop checks MongoDB via `Room.findOne({ roomId })` up to 10 attempts to guarantee the generated code does not conflict with an active room.

### Q7: Why was a 404 error occurring on direct page refresh on Vercel, and how did you solve it?
**Answer**: Client-side single page applications (SPAs) use virtual routing via React Router. When requesting `/register` directly, Vercel looked for a static file named `/register` on the server disk. We resolved this by adding a `vercel.json` file with a rewrite rule (`"source": "/(.*)", "destination": "/index.html"`) so Vercel always serves `index.html`.

### Q8: How does Axios attach the JWT token to requests automatically?
**Answer**: We configured an Axios request interceptor (`api.interceptors.request.use`). Before any request is sent, it reads the `token` from `localStorage` and adds `config.headers.Authorization = 'Bearer ' + token`.

### Q9: How do you handle CORS when frontend and backend are on different domains?
**Answer**: We configured the `cors` middleware in Express and the `cors` option in `socket.io` to check incoming request origins against an allowed list or pattern (including `CLIENT_URL` and `*.vercel.app`) with `credentials: true`.

### Q10: What indexes are used in your MongoDB models and why?
**Answer**: 
- `email` in User Schema has a `unique: true` index for fast lookups during login.
- `roomId` in Message Schema is indexed to quickly retrieve history for a specific room.
- `createdAt` in Message Schema is indexed to sort messages chronologically (`sort({ createdAt: 1 })`).

### Q11: How do you prevent XSS (Cross-Site Scripting) in chat messages?
**Answer**: React automatically escapes strings rendered inside JSX braces (`{message.text}`), preventing arbitrary script execution. Additionally, backend inputs are trimmed and bounded to maximum character lengths (e.g. 2000 chars).

### Q12: What happens if a user opens multiple browser tabs with the same account?
**Answer**: The backend tracks `onlineUsers` using a `Map` where each `userId` maps to a `Set` of socket IDs (`sockets: Set<socketId>`). A user is considered offline only when their socket set becomes empty (`userData.sockets.size === 0`).

### Q13: Why use Vite instead of Create React App (CRA)?
**Answer**: Vite uses native ES Modules (ESM) during development, leading to instant server start times and fast Hot Module Replacement (HMR) regardless of application size, unlike CRA which bundles the entire application upfront using Webpack.

### Q14: How are environment variables handled between development and production?
**Answer**: Vite uses `import.meta.env.VITE_*` for client-side environment variables. In Node.js, `process.env.*` loaded via `dotenv` manages backend configuration like `MONGODB_URI`, `JWT_SECRET`, and `CLIENT_URL`.

### Q15: What improvements would you add to X-Chat in the future?
**Answer**:
1. **End-to-End Encryption (E2EE)** for messages using Web Crypto API.
2. **File & Media Sharing** (Images, Voice Notes) stored on Cloudinary or AWS S3.
3. **Typing Indicators** (`user-typing` socket events).
4. **Push Notifications** via Web Push API for offline users.
