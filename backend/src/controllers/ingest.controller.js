import { validateIngestInput } from "../validators/ingest.validator.js";
import { processIngest, processSlackWebhook } from "../service/ingest.service.js";

export async function ingestController(req, res) {
  const error = validateIngestInput(req.body);

  if (error) {
    return res.status(400).json({
      error: "Invalid payload",
      message: error
    });
  }

  try {
    // Process the ingest payload
    const result = await processIngest(req.body);

    return res.status(202).json({
      message: "Ingest payload processed and forwarded",
      payload: result
    });
  } catch (err) {
    console.error("Error processing ingest:", err);
    return res.status(500).json({
      error: "Internal server error"
    });
  }
}

export async function slackWebhookController(req, res) {
  const { event } = req.body; // Giả sử Slack gửi { event: { type, user, text, channel } }

  if (!event || event.type !== 'message') {
    return res.status(400).json({ error: "Invalid Slack event" });
  }

  try {
    const result = await processSlackWebhook(event);

    return res.status(202).json({
      message: "Ingest payload processed and forwarded",
      payload: result
    });
  } catch (err) {
    console.error("Error processing Slack webhook:", err);
    return res.status(500).json({
      error: "Internal server error"
    });
  }
}

export async function formWebhookController(req, res) {
  const { source, rawText, sourceMeta, attachments } = req.body; // Form gửi trực tiếp IngestPayload format

  if (!source || source !== 'form') {
    return res.status(400).json({ error: "Invalid form source" });
  }

  if (!rawText) {
    return res.status(400).json({ error: "rawText is required" });
  }

  try {
    const result = await processIngest({
      source: 'form',
      rawText,
      sourceMeta: sourceMeta || {},
      attachments: attachments || []
    });

    return res.status(202).json({
      message: "Ingest payload processed and forwarded",
      payload: result
    });
  } catch (err) {
    console.error("Error processing form webhook:", err);
    return res.status(500).json({
      error: "Internal server error"
    });
  }
}
