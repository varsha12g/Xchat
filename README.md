# 💬 X-Chat — Real-Time Anonymous-Style Room Chat Application

[![Vercel Deployment](https://img.shields.io/badge/Frontend-Vercel-black?style=for-the-badge&logo=vercel)](https://xchat-ashen.vercel.app)
[![Render Deployment](https://img.shields.io/badge/Backend-Render-46E3B7?style=for-the-badge&logo=render)](https://xchat-nzb2.onrender.com)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-v18+-339933?style=for-the-badge&logo=nodedotjs)](https://nodejs.org/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-4.7-010101?style=for-the-badge&logo=socketdotio)](https://socket.io/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/)

**X-Chat** is a full-stack, real-time web application for temporary and anonymous chat rooms. Users can register, log in, view live online users, create unique 6-character room codes, join existing rooms, chat in real-time, and view persistent room history. When all users leave a chat room, the room and its message history are automatically purged from MongoDB to ensure privacy and keep the database clean.

---

## 🔗 Live Deployments

- **Frontend App**: [https://xchat-ashen.vercel.app](https://xchat-ashen.vercel.app)
- **Backend API & WebSockets**: [https://xchat-nzb2.onrender.com](https://xchat-nzb2.onrender.com)

---

## ✨ Key Features

- 🔐 **JWT Authentication & Security**: Register and Login with password hashing using `bcryptjs` and stateless JWT tokens.
- 🟢 **Real-Time Online User Tracking**: Live global online user list updating instantaneously via Socket.IO.
- 🔑 **Unique Room Code Generation**: Create rooms with unique 6-character uppercase Room IDs (e.g., `X7K92A`).
- ⚡ **Instant Live Messaging**: Low-latency Socket.IO room messaging with auto-scroll and system notifications (join/leave events).
- 🧹 **Automatic Room Purge**: When a room reaches **0 active users**, the room document and all associated messages are immediately deleted from MongoDB.
- 🔄 **SPA Route Handling**: Native rewrite configuration (`vercel.json`) ensures direct sub-path navigation (`/register`, `/dashboard`) works seamlessly without 404 errors.
- 🎨 **Modern Dark Aesthetic**: Clean UI with custom CSS gradients, glassmorphism, glowing badges, and micro-animations.
- 📱 **Fully Responsive Layout**: Designed to work seamlessly across Desktop, Tablet, and Mobile devices.

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: React 18 (Vite)
- **Routing**: `react-router-dom` (v6)
- **HTTP Client**: Axios (with token request interceptor)
- **Real-Time Client**: `socket.io-client`
- **Icons**: `lucide-react`
- **Styling**: Vanilla CSS3 (Custom Design System with CSS Variables)

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Real-Time Engine**: `socket.io`
- **Database**: MongoDB Atlas & Mongoose ORM
- **Authentication**: JWT (`jsonwebtoken`) & `bcryptjs`
- **Security & Config**: `cors` & `dotenv`

---

## 📁 Project Structure

```
X-Chat/
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   └── ChatRoom.jsx
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   └── socket.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── .env.example
│   ├── index.html
│   ├── vercel.json
│   ├── package.json
│   └── vite.config.js
│
├── server/
│   ├── controllers/
│   │   ├── authController.js
│   │   └── roomController.js
│   ├── middleware/
│   │   └── authMiddleware.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Room.js
│   │   └── Message.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   └── roomRoutes.js
│   ├── socket/
│   │   └── socketHandler.js
│   ├── server.js
│   ├── package.json
│   └── .env.example
│
├── .gitignore
├── PROJECT_GUIDE.md
├── vercel.json
├── README.md
└── package.json
```

---

## ⚙️ Environment Variables

### Server Environment (`server/.env`)

```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/x-chat?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_here
CLIENT_URL=https://xchat-ashen.vercel.app
```

### Client Environment (`client/.env`)

```env
VITE_API_URL=https://xchat-nzb2.onrender.com
VITE_SOCKET_URL=https://xchat-nzb2.onrender.com
```

---

## 💻 Local Development Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/varsha12g/Xchat.git
   cd Xchat
   ```

2. **Install dependencies**:
   ```bash
   npm run install:all
   ```

3. **Set up Environment Files**:
   - Create `server/.env` based on `server/.env.example`.
   - Create `client/.env` based on `client/.env.example`.

4. **Start Development Servers**:
   ```bash
   npm run dev
   ```
   - Client will run on: `http://localhost:5173`
   - Server will run on: `http://localhost:5000`

---

## 💡 How It Works

### 🔒 Authentication & Route Protection
1. **Registration/Login**: Passwords are salted and hashed with `bcryptjs` before persisting to MongoDB.
2. **Stateless JWT Sessions**: Upon successful login, a signed JWT is returned to the client and stored in `localStorage`.
3. **Axios Interceptor**: Automatically attaches `Authorization: Bearer <token>` to all protected REST calls.

### 🌐 Real-Time Socket Architecture
1. **Online User Presence**: On login, sockets register with `user-online`. The server maintains in-memory tracking via `onlineUsers` Map and broadcasts updates globally.
2. **Room Management**: Sockets join channels via `join-room`. Users receive system join notifications and the last 100 room messages stored in MongoDB.
3. **Instant Messaging**: Messages are validated, saved to MongoDB, and broadcasted via `receive-message`.

### 🧹 Automatic Empty Room Cleanup
- The backend tracks active socket connections per room in `activeRooms`.
- When all participants disconnect or leave a room (0 active sockets remaining), the server automatically executes:
  - `Room.deleteOne({ roomId })`
  - `Message.deleteMany({ roomId })`
- This ensures zero leftover empty rooms or orphaned message data.

---

## 📚 Project Documentation & Viva Questions

For full architectural breakdowns, data flow diagrams, API schemas, socket dictionaries, and **Top 15 Interview & Viva Questions with Answers**, check out [PROJECT_GUIDE.md](PROJECT_GUIDE.md).

---

## 📄 License

This project is open source and available under the [ISC License](LICENSE).