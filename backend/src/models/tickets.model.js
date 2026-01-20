import mongoose from 'mongoose';

// Main Ticket Schema
const ticketSchema = new mongoose.Schema({
  number: {
    type: String,
    unique: true,
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: true
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
  tags: [String],
  estimatedResolutionTime: {
    type: Number, // hours
    default: 0
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // AI Analysis metadata
  aiAnalysis: {
    processed: {
      type: Boolean,
      default: false
    },
    confidence: {
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
      score: Number
    }],
    rawResponse: mongoose.Schema.Types.Mixed,
    isFallback: {
      type: Boolean,
      default: false
    }
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
ticketSchema.index({ number: 1 }, { unique: true });

// Virtual for ticket age
ticketSchema.virtual('age').get(function() {
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24)); // days
});

// Method to check if ticket is overdue
ticketSchema.methods.isOverdue = function() {
  if (!this.estimatedResolutionTime) return false;
  const deadline = new Date(this.createdAt);
  deadline.setHours(deadline.getHours() + this.estimatedResolutionTime);
  return Date.now() > deadline && this.status !== 'done' && this.status !== 'closed';
};

export default mongoose.model('Ticket', ticketSchema);