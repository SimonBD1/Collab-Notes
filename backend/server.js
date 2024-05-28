//
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
dotenv.config();
const authRoutes = require('./routes/auth');
const createNotesRoutes = require('./routes/notes');
const authMiddleware = require('./middleware/authMiddleware');
const pool = require('./db/db');
const jwt = require('jsonwebtoken');

dotenv.config();

const secret = process.env.JWT_SECRET;

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:8080",
    methods: ["GET", "POST"]
  }
});

app.use(express.json());
app.use(cors({ origin: "http://localhost:8080" }));
app.use(helmet()); 

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error('Authentication error'));
  }

  jwt.verify(token, secret, (err, decoded) => {
    if (err) {
      return next(new Error('Authentication error'));
    }

    socket.userId = decoded.id;
    next();
  });
});

io.on('connection', (socket) => {
  console.log('a user connected');
  
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

app.use('/auth', authRoutes);
app.use('/notes', createNotesRoutes(io));

app.use(express.static(path.join(__dirname, '..', 'frontend', 'public')));

app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, '..', 'frontend', 'public', 'index.html'));
});

