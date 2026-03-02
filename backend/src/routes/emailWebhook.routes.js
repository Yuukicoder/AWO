import express from 'express';
import { receiveEmailWebhook, simulateEmailWebhook } from '../controllers/emailWebhook.controller.js';

const router = express.Router();

// Real inbound webhook — called by ForwardEmail / Resend Inbound
router.post('/', receiveEmailWebhook);

// Dev-only simulation endpoint
router.post('/simulate', simulateEmailWebhook);

export default router;
