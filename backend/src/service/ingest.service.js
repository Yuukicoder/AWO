import IngestPayload from '../models/IngetPayload.js';
import AI_TriangleService from '../modules/AI_Triagle/AI_Triangle.service.js';
import Ticket from '../models/tickets.model.js';
import User from '../models/users.model.js';

/**
 * Process email ingest
 * Parse email format and extract relevant information
 */
export async function processEmailIngest(input) {
  const ingestPayload = new IngestPayload({
    source: 'email',
    rawData: {
      from: input.from,
      to: input.to,
      subject: input.subject,
      body: input.body,
      headers: input.headers || {},
      cc: input.cc || [],
      bcc: input.bcc || []
    },
    rawText: `Subject: ${input.subject}\n\n${input.body}`,
    sourceMeta: {
      emailFrom: input.from,
      emailTo: input.to,
      subject: input.subject,
      receivedDate: input.receivedDate || new Date()
    },
    attachments: input.attachments || [],
    status: 'pending',
    receivedAt: new Date()
  });

  // Save to database
  await ingestPayload.save();
  console.log(`📧 Email ingest saved: ${ingestPayload._id}`);

  // Trigger AI triage immediately
  await processAITriage(ingestPayload);

  return ingestPayload;
}

/**
 * Process webhook ingest
 * Handle various webhook sources (Slack, Forms, etc.)
 */
export async function processWebhookIngest(input) {
  const ingestPayload = new IngestPayload({
    source: 'webhook',
    rawData: input.rawData || input,
    rawText: input.rawText || JSON.stringify(input.rawData || input),
    sourceMeta: {
      webhookType: input.webhookType || 'generic',
      ...input.sourceMeta
    },
    attachments: input.attachments || [],
    status: 'pending',
    receivedAt: new Date()
  });

  // Save to database
  await ingestPayload.save();
  console.log(`🔗 Webhook ingest saved: ${ingestPayload._id}`);

  // Trigger AI triage immediately
  await processAITriage(ingestPayload);

  return ingestPayload;
}

/**
 * Process manual entry
 * Direct user input through UI
 */
export async function processManualIngest(input) {
  const ingestPayload = new IngestPayload({
    source: 'manual',
    rawData: {
      title: input.title,
      description: input.description || input.rawText,
      priority: input.priority,
      category: input.category,
      requestedBy: input.requestedBy
    },
    rawText: input.rawText || input.description,
    sourceMeta: {
      createdBy: input.createdBy,
      userAgent: input.userAgent
    },
    attachments: input.attachments || [],
    status: 'pending',
    receivedAt: new Date()
  });

  // Save to database
  await ingestPayload.save();
  console.log(`✍️ Manual ingest saved: ${ingestPayload._id}`);

  // Trigger AI triage immediately
  await processAITriage(ingestPayload);

  return ingestPayload;
}

/**
 * Process AI Triage - CORE LOGIC
 * Analyzes ingest payload and creates ticket with AI suggestions
 */
async function processAITriage(ingestPayload) {
  try {
    console.log(`🤖 Starting AI analysis for ingest: ${ingestPayload._id}`);

    // Update status to processing
    ingestPayload.status = 'processing';
    await ingestPayload.save();

    // Step 1: Call Gemini AI to analyze content
    const aiResult = await AI_TriangleService.triageWithGemini(
      ingestPayload.rawText,
      {
        source: ingestPayload.source,
        from: ingestPayload.sourceMeta?.emailFrom || ingestPayload.sourceMeta?.submittedBy,
        subject: ingestPayload.sourceMeta?.subject
      }
    );

    if (!aiResult.success) {
      console.warn('⚠️ AI analysis failed, using fallback data');
    }

    // Step 2: Get active users for assignment suggestion
    const users = await User.find({ is_active: true }).lean();
    
    // Step 3: Suggest assignee based on AI analysis
    const assignmentSuggestion = await AI_TriangleService.suggestAssigneee(
      aiResult.data,
      users
    );

    // Step 4: Generate unique ticket number
    const ticketNumber = await generateTicketNumber();

    // Step 5: Create ticket from AI analysis
    const ticket = new Ticket({
      number: ticketNumber,
      title: aiResult.data.title,
      description: aiResult.data.description,
      priority: aiResult.data.priority,
      status: 'open',
      category: aiResult.data.category,
      tags: aiResult.data.labels || [],
      estimatedResolutionTime: aiResult.data.estimatedEffort || 0,
      
      // AI Analysis Metadata
      aiAnalysis: {
        processed: aiResult.success,
        confidence: aiResult.data.confidenceScore || 0,
        modelVersion: aiResult.data.modelVersion,
        suggestedAssignee: assignmentSuggestion.suggestedAssignee,
        alternatives: assignmentSuggestion.alternativeAssignees || [],
        rawResponse: aiResult.data.rawResponse,
        isFallback: aiResult.data.isFallback || false
      },

      // Source tracking
      source: ingestPayload.source,
      sourceMeta: ingestPayload.rawData,
      ingestId: ingestPayload._id
    });

    await ticket.save();
    console.log(`✅ Ticket created: ${ticket.number}`);

    // Step 6: Update ingest status to completed
    ingestPayload.status = 'completed';
    ingestPayload.processedAt = new Date();
    ingestPayload.ticketId = ticket._id;
    await ingestPayload.save();

    console.log(`✅ AI Triage completed for ingest: ${ingestPayload._id} → Ticket: ${ticket.number}`);

    return {
      success: true,
      ingestId: ingestPayload._id,
      ticketId: ticket._id,
      ticketNumber: ticket.number,
      aiAnalysis: aiResult.data,
      assignment: assignmentSuggestion
    };

  } catch (error) {
    console.error(`❌ AI Triage failed for ingest ${ingestPayload._id}:`, error);

    // Update ingest status to failed
    ingestPayload.status = 'failed';
    ingestPayload.errorMessage = error.message;
    await ingestPayload.save();

    throw error;
  }
}

/**
 * Generate unique ticket number
 * Format: TICKET-000001, TICKET-000002, etc.
 */
async function generateTicketNumber() {
  const count = await Ticket.countDocuments();
  const number = `TICKET-${String(count + 1).padStart(6, '0')}`;
  return number;
}

/**
 * Get ingest payload by ID
 */
export async function getIngestById(ingestId) {
  return await IngestPayload.findById(ingestId);
}

/**
 * Update ingest status (called by AI triage service)
 */
export async function updateIngestStatus(ingestId, status, metadata = {}) {
  const ingest = await IngestPayload.findById(ingestId);
  
  if (!ingest) {
    throw new Error(`Ingest payload not found: ${ingestId}`);
  }

  ingest.status = status;
  
  if (status === 'completed') {
    ingest.processedAt = new Date();
  }
  
  if (status === 'failed' && metadata.error) {
    ingest.errorMessage = metadata.error;
  }

  if (metadata.ticketId) {
    ingest.ticketId = metadata.ticketId;
  }

  await ingest.save();
  return ingest;
}