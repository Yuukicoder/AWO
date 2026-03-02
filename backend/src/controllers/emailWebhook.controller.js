import { processEmailIngest } from '../service/ingest.service.js';
import crypto from 'crypto';

// ─── Payload normalizer ───────────────────────────────────────────────────────
// Handles Resend Inbound, ForwardEmail, SendGrid, and plain JSON
function normalizeEmailPayload(body) {
  // Resend Inbound wraps payload inside body.data
  // { type: "email.received", created_at: "...", data: { from, to, subject, text, html, ... } }
  const src = body.data ?? body;

  const from    = src.from    ?? src.sender ?? src.envelope?.from ?? '';
  const to      = Array.isArray(src.to)
    ? src.to.join(', ')
    : (src.to ?? src.recipient ?? src.envelope?.to ?? '');
  const subject = src.subject ?? src.Subject ?? '(no subject)';
  const text    = src.text    ?? src.plain  ?? src.body ?? src.html ?? '';
  const html    = src.html    ?? '';
  const headers = src.headers ?? {};
  const attachments = src.attachments ?? [];
  const receivedDate = src.date ?? src.created_at ?? body.created_at ?? new Date();

  return { from, to, subject, body: text, html, headers, attachments, receivedDate };
}

// ─── HMAC verification (ForwardEmail) ────────────────────────────────────────
function verifyForwardEmailSignature(req) {
  const secret = process.env.FORWARDEMAIL_WEBHOOK_SECRET;
  if (!secret) return true; // skip if not configured

  const signature = req.headers['x-forwardemail-signature'];
  if (!signature) return false;

  const hmac = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(req.body))
    .digest('hex');

  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(hmac));
}

// ─── Controllers ──────────────────────────────────────────────────────────────

/**
 * POST /api/webhooks/email
 * Called by ForwardEmail / Resend Inbound / any email forwarding service.
 */
export async function receiveEmailWebhook(req, res) {
  try {
    // Verify signature when ForwardEmail secret is configured
    if (!verifyForwardEmailSignature(req)) {
      return res.status(401).json({ success: false, message: 'Invalid webhook signature' });
    }

    const normalized = normalizeEmailPayload(req.body);

    if (!normalized.from) {
      return res.status(400).json({ success: false, message: 'Missing sender address' });
    }

    console.log(`📨 Inbound email from: ${normalized.from} — "${normalized.subject}"`);

    const ingest = await processEmailIngest(normalized);

    return res.status(200).json({
      success: true,
      message: 'Email ingested and AI triage started',
      ingestId: ingest._id,
    });
  } catch (err) {
    console.error('[emailWebhook] error:', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * POST /api/webhooks/email/simulate
 * Dev-only: simulate an inbound email without a real email service.
 * Body: { from, to, subject, text }
 */
export async function simulateEmailWebhook(req, res) {
  if (process.env.NODE_ENV === 'production') {
    return res.status(404).json({ message: 'Not found' });
  }

  try {
    const normalized = normalizeEmailPayload({
      from:    req.body.from    ?? 'testuser@example.com',
      to:      req.body.to      ?? 'support@awo.dev',
      subject: req.body.subject ?? 'Test inbound email',
      text:    req.body.text    ?? 'This is a simulated inbound email for testing.',
    });

    console.log(`🧪 Simulated inbound email from: ${normalized.from}`);

    const ingest = await processEmailIngest(normalized);

    return res.status(201).json({
      success: true,
      message: 'Simulated email ingested',
      ingestId: ingest._id,
      status: ingest.status,
      aiAnalysis: ingest.aiAnalysis,
    });
  } catch (err) {
    console.error('[simulateEmailWebhook] error:', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
}
