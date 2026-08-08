const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '.env') });

const authRoutes = require('./routes/authRoutes');
const roomRoutes = require('./routes/roomRoutes');
const setupSocket = require('./socket/socketHandler');

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// Socket.IO Setup
const io = socketIo(server, {
  cors: {
    origin: function (origin, callback) {
      if (!origin || origin === CLIENT_URL || origin.includes('localhost') || origin.includes('127.0.0.1') || origin.includes('vercel.app')) {
        callback(null, true);
      } else {
        callback(null, true);
      }
    },
    methods: ['GET', 'POST', 'DELETE', 'PUT'],
    credentials: true
  }
});

// Middleware
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl) or matching allowed client
    if (!origin || origin === CLIENT_URL || origin.includes('localhost') || origin.includes('127.0.0.1') || origin.includes('vercel.app')) {
      callback(null, true);
    } else {
      callback(null, true); // Permissive CORS for smooth deployment & testing
    }
  },
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);

// Health Check Route
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'X-Chat Server',
    timestamp: new Date().toISOString()
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error'
  });
});

// Initialize Socket logic
setupSocket(io);

// Start HTTP Server
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 X-Chat Backend running on port ${PORT} (0.0.0.0)`);
});

// Database Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/x-chat';

mongoose.connect(MONGODB_URI, {
  serverSelectionTimeoutMS: 5000 // 5s timeout for fast fallback
})
  .then(() => {
    console.log('✅ Connected to MongoDB Atlas / Database successfully');
  })
  .catch((err) => {
    console.error('❌ MongoDB Connection Error:', err.message);
    console.log('⚠️ Ensure MONGODB_URI is set to a valid MongoDB Atlas connection string.');
  });

