import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true
  },
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: Date
}, {
  timestamps: true
});

const chatSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  type: {
    type: String,
    enum: ['customer_vendor', 'customer_admin'],
    required: true
  },
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor'
  },
  messages: [messageSchema],
  lastMessage: {
    type: String
  },
  lastMessageAt: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes
chatSchema.index({ participants: 1 });
chatSchema.index({ vendor: 1 });
chatSchema.index({ lastMessageAt: -1 });

const Chat = mongoose.model('Chat', chatSchema);

export default Chat;
