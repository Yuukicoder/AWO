import mongoose from 'mongoose';

const IngestPayloadSchema = new mongoose.Schema({
  source: {
    type: String,
    enum: ["slack", "form", "email"],
    required: true
  },
  sourceMeta: {
    channelId: { type: String },
    userId: { type: String },
    emailFrom: { type: String }
  },
  rawText: {
    type: String,
    required: true
  },
  attachments: [{ type: String }],
  receivedAt: {
    type: Date,
    default: Date.now
  }
});

const IngestPayload = mongoose.model('IngestPayload', IngestPayloadSchema);

export default IngestPayload;
