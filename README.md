# 💬 X-Chat — Real-Time Anonymous-Style Room Chat Application

X-Chat is a full-stack, production-ready real-time room chat application. It allows users to register, log in, view online users, create or join chat rooms using short Room IDs, and exchange real-time text messages. When the last user leaves a chat room, the room and its message history are automatically deleted from MongoDB to ensure privacy and keep the database clean.

---

## ✨ Features

- 🔐 **JWT Authentication & Security**: Register and Login with password hashing using `bcryptjs` and stateless JWT tokens.
- 🟢 **Real-Time Online User Tracking**: Live global online user list updating instantaneously via Socket.IO.
- 🔑 **Unique Room Generation**: Create rooms with short unique 6-character Room IDs (e.g., `X7K92A`).
- ⚡ **Instant Live Messaging**: Low-latency Socket.IO room messaging with auto-scroll and system notifications (join/leave events).
- 🧹 **Automatic Room Deletion**: When a room reaches **0 active users**, the room document and all associated messages are immediately removed from MongoDB.
- 🎨 **Modern Dark Aesthetic**: Clean UI with custom CSS gradients, glassmorphism, responsive sidebar, and micro-animations.
- 📱 **Fully Responsive Layout**: Designed to work seamlessly on Desktop, Tablet, and Mobile screens.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React.js (Vite)
- **Language**: JavaScript (ES6+)
- **Routing**: React Router v6
- **Real-Time Client**: Socket.IO Client
- **HTTP Client**: Axios
- **Styling**: Vanilla CSS (CSS Variables, Flexbox, Grid)
- **Icons**: Lucide React

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Real-Time Server**: Socket.IO
- **Database**: MongoDB & Mongoose ORM
- **Authentication**: JWT & bcryptjs
- **Security & Config**: CORS & dotenv

---

## 📁 Project Structure

```
X-Chat/
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── ChatMessage.jsx
│   │   │   ├── UserList.jsx
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
├── README.md
└── package.json
```

---

## 🚀 Prerequisites

- **Node.js**: v18+ installed on your machine
- **npm**: v9+ installed
- **MongoDB Atlas Account** (or local MongoDB running on `mongodb://127.0.0.1:27017`)

---

## ⚙️ Environment Variables

### Server Environment (`server/.env`)

Create a `.env` file inside the `server/` directory:

```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/x-chat?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_here
CLIENT_URL=http://localhost:5173
```

### Client Environment (`client/.env`)

Create a `.env` file inside the `client/` directory:

```env
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

---

## 🗄️ MongoDB Atlas Setup

1. Sign up at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a new **Database Cluster** (Shared/Free tier).
3. Under **Database Access**, create a user with a username and password.
4. Under **Network Access**, add `0.0.0.0/0` to allow access from any IP address (required for Render/Vercel).
5. Click **Connect** -> **Drivers** -> Copy the connection string.
6. Replace `<username>`, `<password>`, and database name in your `server/.env` `MONGODB_URI`.

---

## 💻 Local Development

### Quick Start (Root Directory)

1. Clone the repository and navigate into the folder:
   ```bash
   cd X-Chat
   ```

2. Install all dependencies (root, server, client):
   ```bash
   npm run install:all
   ```

3. Start both backend and frontend concurrently:
   ```bash
   npm run dev
   ```

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:5000`

---

## 💡 How it Works

### 🔒 Authentication Flow
1. **Registration**: User inputs `name`, `email`, and `password`. Password is salted and hashed with `bcryptjs` before persisting to MongoDB.
2. **Login**: Password is verified using `bcrypt.compare()`. Upon success, a signed JWT token is returned.
3. **Persistence**: The token and user object are saved in `localStorage`. The Axios service injects the token into `Authorization: Bearer <token>` headers for all protected endpoints (`/api/auth/me`, `/api/rooms/create`, `/api/rooms/:roomId`).

### 🌐 Room System & Socket.IO Architecture
1. **Global Connection**: Upon logging in, the client connects to Socket.IO and emits `user-online`. The server maintains active socket connections per user in memory and broadcasts the updated online users list.
2. **Joining a Room**: Entering a room triggers a REST check (`GET /api/rooms/:roomId`) and a socket emit `join-room`. The client receives past room message history and system notifications (`"Varsha joined the room"`).
3. **Messaging**: Message input validates length (<2000 chars), persists the document to the `Message` collection in MongoDB, and broadcasts `receive-message` to all sockets inside the Socket.IO room.

### 🧹 Automatic Empty Room Cleanup Rule
- In `server/socket/socketHandler.js`, the server tracks active socket IDs per room.
- When a user disconnects or explicitly clicks **Leave Room**, the socket leaves the room.
- If the active socket count for that `roomId` drops to **0**:
  1. The server deletes the `Room` document from MongoDB (`Room.deleteOne({ roomId })`).
  2. The server deletes all associated chat messages from MongoDB (`Message.deleteMany({ roomId })`).
  3. No lingering empty rooms or orphaned messages remain in the database.

---

## 🌐 Deployment Instructions

### Backend Deployment (Render)

1. Push your repository to GitHub.
2. Log in to [Render](https://render.com) and create a **New Web Service**.
3. Connect your GitHub repository and select the `server/` directory as the Root Directory (or configure build settings):
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
4. Add Environment Variables in Render settings:
   - `PORT`: `5000`
   - `MONGODB_URI`: `your_mongodb_atlas_connection_string`
   - `JWT_SECRET`: `your_production_secret_key`
   - `CLIENT_URL`: `https://your-frontend.vercel.app`
5. Deploy Web Service and copy your Render HTTPS backend URL (e.g., `https://x-chat-backend.onrender.com`).

### Frontend Deployment (Vercel)

1. Log in to [Vercel](https://vercel.com) and import your repository.
2. Configure project settings:
   - **Framework Preset**: Vite
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. Add Environment Variables in Vercel settings:
   - `VITE_API_URL`: `https://x-chat-backend.onrender.com`
   - `VITE_SOCKET_URL`: `https://x-chat-backend.onrender.com`
4. Deploy project.

---

## ❓ Troubleshooting

- **MongoDB Connection Error**: Ensure your IP is whitelisted (`0.0.0.0/0`) in MongoDB Atlas Network Access and your password does not contain unencoded special characters.
- **CORS Error on Socket.IO**: Double-check `CLIENT_URL` on Render matches your exact Vercel URL (e.g., `https://your-chat.vercel.app`).
- **Room Not Found Error**: If all users left the room, it was automatically deleted by design. Create a new room from the Dashboard.

---

## 📸 Screenshots

*(Add screenshots of Registration, Login, Dashboard, Online Users, and Chat Room here)*

---

## 🚀 Future Improvements

- [ ] Direct 1-on-1 private messaging between online users.
- [ ] User avatars and customizable profile themes.
- [ ] Typing indicators in chat rooms.
- [ ] Read receipts and unread message notifications.
#   X c h a t  
 #   X c h a t  
 