import dotenv from 'dotenv';
dotenv.config({ override: true });
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { initDb } from './src/db/index.ts';
import authRoutes from './src/routes/auth.ts';
import jobsRoutes from './src/routes/jobs.ts';
import aiRoutes from './src/routes/ai.ts';
import { createServer as createViteServer } from 'vite';
import path from 'path';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*', // Allow all origins for simplicity in this environment
    methods: ['GET', 'POST']
  }
});

const PORT = 3000;

// Debug: Check if API key is present
if (process.env.GEMINI_API_KEY) {
  console.log('GEMINI_API_KEY is set (length:', process.env.GEMINI_API_KEY.length, ')');
} else {
  console.error('FATAL: GEMINI_API_KEY is NOT set in the environment!');
}

// Initialize Database
initDb();

// Middleware
app.use(cors());
app.use(express.json());
app.use(cookieParser());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobsRoutes);
app.use('/api/ai', aiRoutes);

// Socket.io Logic
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('join_chat', (username) => {
    socket.data.username = username;
    io.emit('message', {
      type: 'system',
      content: `${username} has joined the chat`,
      timestamp: new Date().toISOString()
    });
  });

  socket.on('send_message', (data) => {
    io.emit('message', {
      type: 'user',
      username: data.username,
      content: data.content,
      timestamp: new Date().toISOString()
    });
  });

  socket.on('disconnect', () => {
    if (socket.data.username) {
      io.emit('message', {
        type: 'system',
        content: `${socket.data.username} has left the chat`,
        timestamp: new Date().toISOString()
      });
    }
    console.log('User disconnected:', socket.id);
  });
});

// Vite Middleware for Development
async function setupVite() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }
}

setupVite().then(() => {
  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
});
