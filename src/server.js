const express = require('express');
const cors = require('cors');
const http = require('http'); // 1. Import module http có sẵn của Node.js
const { Server } = require('socket.io'); // 2. Import Server từ socket.io
require('dotenv').config();
const db = require('./config/db');

// Import Middleware & Routes
const { verifyToken } = require('./middlewares/authMiddleware');
const authRoutes = require('./routes/authRoutes');
const universityRoutes = require('./routes/universityRoutes');
const userRoutes = require('./routes/userRoutes');
const deviceRoutes = require('./routes/deviceRoutes');
const smokeLogRoutes = require('./routes/smokeLogRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// 3. Tạo HTTP Server bọc Express app và khởi tạo Socket.io
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', // Cho phép kết nối Real-time từ mọi Web Dashboard / App Frontend
    methods: ['GET', 'POST'],
  },
});

app.use(cors());
app.use(express.json());

// 4. Đưa biến io vào app để các Controller có thể dùng lại
app.set('io', io);

// Lắng nghe sự kiện kết nối WebSocket từ Client
io.on('connection', (socket) => {
  console.log(`📡 Dashboard vừa kết nối Socket.id: ${socket.id}`);

  socket.on('disconnect', () => {
    console.log(`❌ Dashboard ngắt kết nối Socket.id: ${socket.id}`);
  });
});

// Tự động khởi tạo CSDL
db.initDb();

// Đăng ký Routes
app.use('/api/auth', authRoutes);
app.use('/api/universities', verifyToken, universityRoutes);
app.use('/api/users', verifyToken, userRoutes);
app.use('/api/devices', verifyToken, deviceRoutes);
app.use('/api/smoke-logs', smokeLogRoutes);

app.get('/', (req, res) => {
  res.json({ message: '🚀 SmokeGuard API Service đang hoạt động!' });
});

// 5. Đổi app.listen thành server.listen
server.listen(PORT, () => {
  console.log(`🚀 Server SmokeGuard đang chạy tại http://localhost:${PORT}`);
});