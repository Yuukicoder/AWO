import http from 'http';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import connectDB from './src/config/db.js';
import userRoutes from './src/routes/User.routes.js';
import taskRoutes from './src/routes/task.routes.js';
import ticketRoutes from './src/routes/ticket.routes.js';
import ingestRoutes from './src/routes/ingest.route.js';
import managerRoutes from './src/routes/manager.routes.js';
import emailWebhookRoutes from './src/routes/emailWebhook.routes.js';
import { connectRedis, disconnectRedis } from './src/config/redis.js';
import { initSocket } from './src/config/socket.js';

dotenv.config();

const app = express();
const httpServer = http.createServer(app);

// Middleware
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  ...(process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(',').map(o => o.trim()) : [])
];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes - phải định nghĩa TRƯỚC khi listen
app.get('/', (req, res) => {
    res.json({ message: "AWO Hi there!" });
});

app.use('/api/auth', userRoutes);
app.use('/api/users', userRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/ingest', ingestRoutes);
app.use('/api/v1/manager', managerRoutes);
app.use('/api/webhooks/email', emailWebhookRoutes);

// Connect DB, Redis và start server
const PORT = process.env.PORT || 3002;

const startServer = async () => {
    try {
        await connectDB();
        // await connectRedis();

        initSocket(httpServer);

        httpServer.listen(PORT, () => {
            console.log(`✅ Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        // await disconnectRedis().catch(() => {});
        process.exit(1);
    }
};

startServer();

const shutdown = (signal) => {
    console.log(`\nReceived ${signal}. Shutting down gracefully...`);

    httpServer.close((error) => {
        if (error) {
            console.error('Error while shutting down HTTP server:', error);
            process.exit(1);
        }

        // disconnectRedis()
        //     .catch(() => {})
        //     .finally(() => process.exit(0));
        process.exit(0);
    });
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));