import mongoose from 'mongoose';
import Counter from './counter.model.js';

// Main Ticket Schema
const ticketSchema = new mongoose.Schema({
  number: {
    type: String,
    unique: true,
    required: true
  },
  title: {
    type: String,
    required: true,
    maxlength: 500
  },
  description: {
    type: String,
    required: true
  },
  summary: {
    type: String,
    maxlength: 500
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium',
    index: true
  },
  status: {
    type: String,
    enum: ['open', 'in_progress', 'review', 'done', 'closed'],
    default: 'open',
    index: true
  },
  category: {
    type: String,
    enum: ['bug', 'feature', 'support', 'documentation', 'other'],
    default: 'other',
    index: true
  },
  labels: [String], // Changed from tags to labels
  estimatedEffort: {
    type: Number, // hours
    default: 0
  },
  complexity: {
    type: String,
    enum: ['trivial', 'simple', 'moderate', 'complex', 'very_complex']
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  assignedAt: {
    type: Date
  },
  
  // AI Analysis metadata
  aiAnalysis: {
    processed: {
      type: Boolean,
      default: false
    },
    confidenceScore: {
      type: Number,
      min: 0,
      max: 1
    },
    modelVersion: String,
    suggestedAssignee: {
      userId: mongoose.Schema.Types.ObjectId,
      userName: String,
      userEmail: String,
      score: Number,
      reasoning: String
    },
    alternatives: [{
      userId: mongoose.Schema.Types.ObjectId,
      userName: String,
      userEmail: String,
      score: Number,
      reasoning: String
    }],
    rawResponse: mongoose.Schema.Types.Mixed,
    isFallback: {
      type: Boolean,
      default: false
    },
    processingTimeMs: Number,
    errorMessage: String
  },

  // Source tracking
  source: {
    type: String,
    enum: ['email', 'webhook', 'manual'],
    required: true
  },
  sourceMeta: mongoose.Schema.Types.Mixed,
  ingestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'IngestPayload',
    index: true
  },

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  isDeleted: {
    type: Boolean,
    default: false,
    index: true
  },
  deletedAt: Date,
  deletedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true // Tự động tạo createdAt và updatedAt
});

// Index for common queries
ticketSchema.index({ status: 1, priority: -1, createdAt: -1 });
ticketSchema.index({ assignedTo: 1, status: 1 });

// Auto-generate ticket number before save
ticketSchema.pre('save', async function () {
  if (!this.isNew) return;
  const counter = await Counter.findByIdAndUpdate(
    'ticket',
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  this.number = `AWO-${String(counter.seq).padStart(4, '0')}`;
});

// Virtual for ticket age
ticketSchema.virtual('age').get(function() {
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24)); // days
});

// Method to check if ticket is overdue
ticketSchema.methods.isOverdue = function() {
  if (!this.estimatedEffort) return false;
  const deadline = new Date(this.createdAt);
  deadline.setHours(deadline.getHours() + this.estimatedEffort);
  return Date.now() > deadline && this.status !== 'done' && this.status !== 'closed';
};

export default mongoose.model('Ticket', ticketSchema);