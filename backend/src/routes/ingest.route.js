import express from "express";
import { ingestController } from "../controllers/ingest.controller.js";

const router = express.Router();

router.post("/", ingestController);

export default router;
