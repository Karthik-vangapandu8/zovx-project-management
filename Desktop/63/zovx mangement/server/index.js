const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const socketIo = require('socket.io');
const rateLimit = require('express-rate-limit');
const { PrismaClient } = require('@prisma/client');

// Import routes
const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/projects');
const taskRoutes = require('./routes/tasks');
const teamRoutes = require('./routes/team');
const dashboardRoutes = require('./routes/dashboard');

dotenv.config();

const app = express();
const prisma = new PrismaClient();

// Trust proxy setting for rate limiting and forwarded headers
app.set('trust proxy', 1);

// Environment-aware CORS configuration
const isDevelopment = process.env.NODE_ENV !== 'production';
const clientURL = process.env.CLIENT_URL || 'http://localhost:3000';

const allowedOrigins = isDevelopment 
  ? ['http://localhost:3000', 'http://127.0.0.1:3000']
  : [clientURL];

// Enhanced CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('Blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'x-auth-token'
  ],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 200
};

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isDevelopment ? 1000 : 100, // More lenient in development
  message: {
    error: 'Too many requests from this IP, please try again later.'
  }
});

// Middleware - CORS must be first!
app.use(cors(corsOptions));
app.use(limiter);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Make Prisma and Socket.IO available in routes
app.use((req, res, next) => {
  req.prisma = prisma;
  req.io = io;
  next();
});

// Connect to Database
const connectDB = async () => {
  try {
    await prisma.$connect();
    console.log('🗄️  PostgreSQL Connected Successfully via Prisma');
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  }
};

connectDB();

// Socket.IO for real-time updates
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Join project-specific rooms for targeted updates
  socket.on('join-project', (projectId) => {
    socket.join(`project-${projectId}`);
    console.log(`User ${socket.id} joined project ${projectId}`);
  });

  // Join user-specific room for personal notifications
  socket.on('join-user', (userId) => {
    socket.join(`user-${userId}`);
    console.log(`User ${socket.id} joined user room ${userId}`);
  });

  // Task Management Events
  socket.on('taskCreated', (task) => {
    // Broadcast to all users who can see this task
    socket.broadcast.emit('taskCreated', task);
    if (task.projectId) {
      socket.to(`project-${task.projectId}`).emit('taskCreated', task);
    }
  });

  socket.on('taskUpdated', (task) => {
    // Broadcast task updates to relevant users
    socket.broadcast.emit('taskUpdated', task);
    if (task.projectId) {
      socket.to(`project-${task.projectId}`).emit('taskUpdated', task);
    }
    if (task.assigneeId) {
      socket.to(`user-${task.assigneeId}`).emit('taskUpdated', task);
    }
  });

  socket.on('taskDeleted', (data) => {
    // Broadcast task deletion
    socket.broadcast.emit('taskDeleted', data);
  });

  socket.on('taskCommentAdded', (comment) => {
    // Broadcast new comments to all users with access to the task
    socket.broadcast.emit('taskCommentAdded', comment);
  });

  // Project Management Events
  socket.on('projectUpdated', (project) => {
    socket.broadcast.emit('projectUpdated', project);
    socket.to(`project-${project.id}`).emit('projectUpdated', project);
  });

  socket.on('projectCreated', (project) => {
    socket.broadcast.emit('projectCreated', project);
  });

  // Team Management Events
  socket.on('teamMemberUpdated', (member) => {
    socket.broadcast.emit('teamMemberUpdated', member);
  });

  // Legacy events (for backwards compatibility)
  socket.on('task-update', (data) => {
    socket.to(`project-${data.projectId}`).emit('task-updated', data);
  });

  socket.on('project-update', (data) => {
    socket.to(`project-${data.projectId}`).emit('project-updated', data);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/team', teamRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    message: 'Zovx Labs Project Management API is running!', 
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    database: 'PostgreSQL via Railway',
    realtime: 'Socket.IO enabled'
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Zovx Labs PM Server running on port ${PORT}`);
  console.log(`🌐 API available at http://localhost:${PORT}/api`);
  console.log(`🗄️  Database: PostgreSQL via Railway`);
  console.log(`🔗 CORS enabled for: ${allowedOrigins.join(', ')}`);
  console.log(`⚡ Real-time updates: Socket.IO enabled`);
});

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
}); 