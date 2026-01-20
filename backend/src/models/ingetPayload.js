import mongoose from 'mongoose';

const ingestPayloadSchema = new mongoose.Schema({
  source: {
    type: String,
    enum: ['email', 'webhook', 'manual'],
    required: true,
    index: true
  },
  rawData: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  rawText: {
    type: String,
    required: true
  },
  sourceMeta: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  attachments: [{
    filename: String,
    url: String,
    size: Number,
    mimeType: String
  }],
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending',
    index: true
  },
  errorMessage: String,
  receivedAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  processedAt: Date,
  
  // Link to created ticket
  ticketId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ticket'
  }
});

// Index for common queries
ingestPayloadSchema.index({ status: 1, receivedAt: -1 });

export default mongoose.model('IngestPayload', ingestPayloadSchema);
