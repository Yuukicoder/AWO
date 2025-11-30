import express from 'express';
import cors from 'cors';
import connectDB from './src/config/db.js';
import userRoutes from './src/routes/User.routes.js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes - phải định nghĩa TRƯỚC khi listen
app.get('/', (req, res) => {
    res.json({ message: "AWO Hi there!" });
});

app.use('/api/auth', userRoutes);

// Connect DB và start server
const PORT = process.env.PORT || 3002;

connectDB()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`✅ Server running on port ${PORT}`);
        });
    })
    .catch((error) => {
        console.error('❌ Failed to connect to database:', error);
        process.exit(1);
    });