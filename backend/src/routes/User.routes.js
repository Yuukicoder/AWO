import {loginController, registerController, refreshTokenController, logoutController} from '../controllers/auth.controller.js';
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

export default router;