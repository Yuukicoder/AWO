import {loginController} from '../controllers/auth.controller.js';
import {registerController} from "../controllers/users.controller.js"
import express from 'express';

const router = express.Router();


// Auth routes
router.get('/health', (req, res) => {
    res.status(200).send('Auth service is healthy');
});
router.post('/login', loginController);
router.post('/register',registerController)

export default router;