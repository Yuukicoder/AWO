import express from "express";
import { ingestController } from "../controllers/ingest.controller.js";
import { slackWebhookController, formWebhookController } from "../controllers/ingest.controller.js"; // Thêm controller cho Slack và Form

const router = express.Router();

router.post("/", ingestController);
router.post("/webhooks/slack", slackWebhookController); // Webhook cho Slack
router.post("/webhooks/form", formWebhookController); // Webhook cho Form

export default router;
