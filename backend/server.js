import http from 'http';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import connectDB from './src/config/db.js';
import userRoutes from './src/routes/User.routes.js';
import taskRoutes from './src/routes/task.routes.js';
import ticketRoutes from './src/routes/ticket.routes.js';
import { connectRedis, disconnectRedis } from './src/config/redis.js';
import { initSocket } from './src/config/socket.js';

dotenv.config();

const app = express();
const httpServer = http.createServer(app);

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL, // Frontend URL
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