import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// Sender address — must be a domain you verified on resend.com
// e.g.  "AWO <noreply@yourdomain.com>"
// During dev you can use the sandbox: "onboarding@resend.dev"
const FROM = process.env.EMAIL_FROM ?? 'AWO <onboarding@resend.dev>';

/**
 * Send a generic email.
 * @param {object} opts
 * @param {string|string[]} opts.to
 * @param {string} opts.subject
 * @param {string} opts.html
 * @param {string} [opts.text]   - plain-text fallback
 * @param {string} [opts.from]   - override sender
 */
export async function sendEmail({ to, subject, html, text, from }) {
  const { data, error } = await resend.emails.send({
    from: from ?? FROM,
    to: Array.isArray(to) ? to : [to],
    subject,
    html,
    ...(text ? { text } : {}),
  });

  if (error) {
    console.error('[Resend] send error:', error);
    throw new Error(error.message ?? 'Failed to send email');
  }

  console.log(`[Resend] sent → ${JSON.stringify(to)}  id=${data.id}`);
  return data;
}

// ─── Pre-built templates ──────────────────────────────────────────────────────

/**
 * Notify an agent that a ticket has been assigned to them.
 */
export async function sendTicketAssignedEmail({ to, agentName, ticket }) {
  return sendEmail({
    to,
    subject: `[AWO] Ticket ${ticket.number} assigned to you`,
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:auto">
        <h2 style="color:#111">Ticket Assigned</h2>
        <p>Hi <strong>${agentName}</strong>,</p>
        <p>Ticket <strong>${ticket.number}</strong> has been assigned to you.</p>
        <table style="width:100%;border-collapse:collapse;margin:16px 0">
          <tr><td style="padding:6px;color:#555;width:120px">Title</td>
              <td style="padding:6px;font-weight:600">${ticket.title}</td></tr>
          <tr><td style="padding:6px;color:#555">Priority</td>
              <td style="padding:6px;text-transform:capitalize">${ticket.priority}</td></tr>
          <tr><td style="padding:6px;color:#555">Category</td>
              <td style="padding:6px;text-transform:capitalize">${ticket.category}</td></tr>
          ${ticket.dueDate ? `<tr><td style="padding:6px;color:#555">Due</td>
              <td style="padding:6px">${new Date(ticket.dueDate).toLocaleDateString()}</td></tr>` : ''}
        </table>
        <p style="margin-top:24px;color:#888;font-size:12px">AWO – AI Workflow Orchestrator</p>
      </div>
    `,
  });
}

/**
 * Notify the reporter that their ticket was created / received.
 */
export async function sendTicketCreatedEmail({ to, reporterName, ticket }) {
  return sendEmail({
    to,
    subject: `[AWO] Your request ${ticket.number} has been received`,
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:auto">
        <h2 style="color:#111">Request Received</h2>
        <p>Hi <strong>${reporterName ?? 'there'}</strong>,</p>
        <p>We received your request and it is currently being reviewed by our team.</p>
        <table style="width:100%;border-collapse:collapse;margin:16px 0">
          <tr><td style="padding:6px;color:#555;width:120px">ID</td>
              <td style="padding:6px;font-weight:600">${ticket.number}</td></tr>
          <tr><td style="padding:6px;color:#555">Title</td>
              <td style="padding:6px">${ticket.title}</td></tr>
          <tr><td style="padding:6px;color:#555">Priority</td>
              <td style="padding:6px;text-transform:capitalize">${ticket.priority}</td></tr>
        </table>
        <p style="margin-top:24px;color:#888;font-size:12px">AWO – AI Workflow Orchestrator</p>
      </div>
    `,
  });
}
