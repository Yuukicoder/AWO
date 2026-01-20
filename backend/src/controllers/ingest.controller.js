import { validateIngestInput, validateEmailPayload, validateWebhookPayload } from "../validators/ingest.validator.js";
import { processEmailIngest, processWebhookIngest, processManualIngest } from "../service/ingest.service.js";

/**
 * Main ingest endpoint - POST /api/v1/ingest
 * Accepts: Email forward, Webhook payload, Manual entry
 */
export async function ingestController(req, res) {
  const { source } = req.body;

  try {
    let result;

    // Route to specific handler based on source
    switch (source) {
      case 'email':
        const emailError = validateEmailPayload(req.body);
        if (emailError) {
          return res.status(400).json({
            success: false,
            error: "Invalid email payload",
            message: emailError
          });
        }
        result = await processEmailIngest(req.body);
        break;

      case 'webhook':
        const webhookError = validateWebhookPayload(req.body);
        if (webhookError) {
          return res.status(400).json({
            success: false,
            error: "Invalid webhook payload",
            message: webhookError
          });
        }
        result = await processWebhookIngest(req.body);
        break;

      case 'manual':
        const manualError = validateIngestInput(req.body);
        if (manualError) {
          return res.status(400).json({
            success: false,
            error: "Invalid manual payload",
            message: manualError
          });
        }
        result = await processManualIngest(req.body);
        break;

      default:
        return res.status(400).json({
          success: false,
          error: "Invalid source",
          message: "Source must be 'email', 'webhook', or 'manual'"
        });
    }

    // Reload result để lấy ticketId sau khi AI xử lý xong
    const updatedResult = await result.populate('ticketId');

    return res.status(201).json({
      success: true,
      message: "Ingest processed successfully and ticket created",
      data: {
        ingestId: result._id,
        source: result.source,
        status: result.status,
        receivedAt: result.receivedAt,
        processedAt: result.processedAt,
        ticket: updatedResult.ticketId ? {
          id: updatedResult.ticketId._id,
          number: updatedResult.ticketId.number,
          title: updatedResult.ticketId.title,
          priority: updatedResult.ticketId.priority,
          category: updatedResult.ticketId.category,
          aiSuggestion: updatedResult.ticketId.aiAnalysis?.suggestedAssignee
        } : null
      }
    });
  } catch (err) {
    console.error("❌ Error processing ingest:", err);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
      message: process.env.NODE_ENV === 'development' ? err.message : 'An error occurred processing your request'
    });
  }
}

/**
 * Slack webhook endpoint - POST /api/v1/ingest/webhooks/slack
 */
export async function slackWebhookController(req, res) {
  // Slack URL verification challenge
  if (req.body.type === 'url_verification') {
    return res.status(200).json({ challenge: req.body.challenge });
  }

  const { event } = req.body;

  if (!event || event.type !== 'message' || event.subtype === 'bot_message') {
    return res.status(200).json({ ok: true }); // Acknowledge but don't process
  }

  try {
    const payload = {
      source: 'webhook',
      webhookType: 'slack',
      rawData: {
        channel: event.channel,
        user: event.user,
        text: event.text,
        ts: event.ts,
        team: req.body.team_id
      },
      rawText: event.text,
      sourceMeta: {
        channelId: event.channel,
        userId: event.user,
        timestamp: event.ts
      }
    };

    await processWebhookIngest(payload);

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("❌ Error processing Slack webhook:", err);
    return res.status(500).json({ ok: false, error: "Internal server error" });
  }
}

/**
 * Generic form webhook endpoint - POST /api/v1/ingest/webhooks/form
 */
export async function formWebhookController(req, res) {
  try {
    const payload = {
      source: 'webhook',
      webhookType: 'form',
      rawData: req.body,
      rawText: req.body.message || req.body.description || JSON.stringify(req.body),
      sourceMeta: {
        formId: req.body.formId,
        submittedBy: req.body.email || req.body.submittedBy
      }
    };

    const result = await processWebhookIngest(payload);

    return res.status(201).json({
      success: true,
      message: "Form submission received and processed",
      ingestId: result._id,
      ticketNumber: result.ticketId?.number
    });
  } catch (err) {
    console.error("❌ Error processing form webhook:", err);
    return res.status(500).json({
      success: false,
      error: "Internal server error"
    });
  }
}
