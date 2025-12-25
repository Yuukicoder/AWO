import {loginController, registerController, refreshTokenController, logoutController} from '../controllers/auth.controller.js';
import {getWorkloadController, getTeamWorkloadController, getAllUsersController, getUserByIdController} from '../controllers/users.controller.js';
import {authenticate} from '../middleware/auth.middleware.js';
import express from 'express';

const router = express.Router();


// Auth routes
router.get('/health', (req, res) => {
    res.status(200).send('Auth service is healthy');
});
router.post('/login', loginController);
router.post('/register', registerController);
router.post('/refresh-token', refreshTokenController);
router.post('/logout', logoutController);

// User management routes (protected)
router.get('/', authenticate, getAllUsersController);
router.get('/:id', authenticate, getUserByIdController);

// Workload routes (protected)
router.get('/:id/workload', authenticate, getWorkloadController);
router.post('/team/workload', authenticate, getTeamWorkloadController);

export default router;