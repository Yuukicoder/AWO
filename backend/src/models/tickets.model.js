import mongoose from 'mongoose';

// Counter schema for auto-incrementing ticket numbers
const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  sequence_value: { type: Number, default: 0 }
});

const Counter = mongoose.model('Counter', counterSchema);

// Main Ticket Schema
const ticketSchema = new mongoose.Schema({
  number: {
    type: String,
    unique: true,
    index: true
  },
  subject: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  description: {
    type: String,
    default: '',
    maxlength: 5000
  },
  status: {
    type: String,
    enum: ['open', 'assigned', 'in_progress', 'resolved', 'closed'],
    default: 'open',
    index: true
  },
  priority: {
    type: String,
    enum: ['urgent', 'high', 'medium', 'low'],
    default: 'medium',
    index: true
  },
  category: {
    type: String,
    enum: ['bug', 'feature', 'support', 'incident', 'change_request', 'other'],
    default: 'other',
    index: true
  },
  source: {
    type: String,
    enum: ['email', 'web', 'api', 'phone', 'chat'],
    default: 'web',
    index: true
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  
  // Reporter information (not necessarily a user in system)
  reporter: {
    name: {
      type: String,
      trim: true,
      default: ''
    },
    email: {
      type: String,
      // required: true,
      trim: true,
      lowercase: true,
      index: true
    },
    phone: {
      type: String,
      trim: true,
      default: ''
    }
  },
  // Assignment information
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  assignedAt: {
    type: Date
  },
  
  // Resolution information
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  resolvedAt: {
    type: Date
  },
  resolutionNotes: {
    type: String,
    default: ''
  },
  
  // SLA and timing
  dueDate: {
    type: Date,
    index: true
  },
  estimatedResolutionTime: {
    type: Number, // in hours
    min: 0
  },
  actualResolutionTime: {
    type: Number, // in hours
    min: 0
  },
  
  // AI Analysis results
  aiAnalysis: {
    processed: {
      type: Boolean,
      default: false
    },
    extractedPriority: {
      type: String,
      enum: ['urgent', 'high', 'medium', 'low']
    },
    extractedCategory: {
      type: String,
      enum: ['bug', 'feature', 'support', 'incident', 'change_request', 'other']
    },
    suggestedTags: [String],
    confidence: {
      type: Number,
      min: 0,
      max: 1
    },
    processedAt: Date,
    originalContent: String
  },
  
  // Soft delete
  isDeleted: {
    type: Boolean,
    default: false,
    index: true
  },
  deletedAt: Date,
  deletedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
ticketSchema.index({ 'reporter.email': 1, status: 1 });
ticketSchema.index({ assignedTo: 1, status: 1 });
ticketSchema.index({ dueDate: 1, status: 1 });
ticketSchema.index({ createdAt: -1 });
ticketSchema.index({ priority: 1, status: 1 });
ticketSchema.index({ category: 1, status: 1 });

// Virtual for SLA status
ticketSchema.virtual('slaStatus').get(function() {
  if (['resolved', 'closed'].includes(this.status)) {
    return 'met';
  }
  
  if (!this.dueDate) {
    return 'unknown';
  }
  
  const now = new Date();
  if (now > this.dueDate) {
    return 'breached';
  }
  
  // At risk if less than 4 hours remaining
  const timeRemaining = this.dueDate - now;
  if (timeRemaining < (4 * 60 * 60 * 1000)) {
    return 'at_risk';
  }
  
  return 'on_track';
});

// Virtual for time remaining
ticketSchema.virtual('timeRemaining').get(function() {
  if (!this.dueDate || ['resolved', 'closed'].includes(this.status)) {
    return null;
  }
  
  const now = new Date();
  return Math.max(0, this.dueDate - now);
});

// Virtual for task count
ticketSchema.virtual('tasks', {
  ref: 'Task',
  localField: '_id',
  foreignField: 'ticketId',
  count: false
});

ticketSchema.virtual('taskCount', {
  ref: 'Task',
  localField: '_id',
  foreignField: 'ticketId',
  count: true
});

// Pre-save middleware for auto-incrementing ticket number
ticketSchema.pre('save', async function() {
  if (this.isNew && !this.number) {
    try {
      const counter = await Counter.findByIdAndUpdate(
        'ticket_number',
        { $inc: { sequence_value: 1 } },
        { new: true, upsert: true }
      );
      
      this.number = `TKT-${String(counter.sequence_value).padStart(6, '0')}`;
    } catch (error) {
      throw error;
    }
  }
});

// Instance methods
ticketSchema.methods.assign = function(userId, assignedById) {
  this.assignedTo = userId;
  this.assignedBy = assignedById;
  this.assignedAt = new Date();
  this.status = 'assigned';
  return this.save();
};

ticketSchema.methods.resolve = function(resolvedById, notes = '') {
  this.resolvedBy = resolvedById;
  this.resolvedAt = new Date();
  this.resolutionNotes = notes;
  this.status = 'resolved';
  
  // Calculate actual resolution time
  if (this.createdAt) {
    this.actualResolutionTime = Math.round((this.resolvedAt - this.createdAt) / (1000 * 60 * 60));
  }
  
  return this.save();
};

ticketSchema.methods.close = function() {
  this.status = 'closed';
  return this.save();
};

ticketSchema.methods.reopen = function() {
  this.status = 'open';
  this.resolvedAt = null;
  this.resolvedBy = null;
  this.resolutionNotes = '';
  this.actualResolutionTime = null;
  return this.save();
};

// Static methods
ticketSchema.statics.getOpenCount = function() {
  return this.countDocuments({
    status: { $in: ['open', 'assigned', 'in_progress'] },
    isDeleted: false
  });
};

ticketSchema.statics.getOverdueCount = function() {
  return this.countDocuments({
    dueDate: { $lt: new Date() },
    status: { $nin: ['resolved', 'closed'] },
    isDeleted: false
  });
};

const Ticket = mongoose.model('Ticket', ticketSchema);

export default Ticket;