import Chat from '../models/Chat.model.js';
import { AppError } from '../middleware/errorHandler.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { getIO } from '../config/socket.js';

export const getChats = asyncHandler(async (req, res) => {
  const chats = await Chat.find({ 
    participants: req.user._id,
    isActive: true
  })
    .populate('participants', 'name avatar')
    .populate('vendor', 'storeName')
    .sort('-lastMessageAt');

  res.status(200).json({ success: true, count: chats.length, data: { chats } });
});

export const getChat = asyncHandler(async (req, res, next) => {
  const chat = await Chat.findById(req.params.id)
    .populate('participants', 'name avatar')
    .populate('vendor', 'storeName')
    .populate('messages.sender', 'name avatar');

  if (!chat) return next(new AppError('Chat not found', 404));

  // Check if user is participant
  if (!chat.participants.some(p => p._id.toString() === req.user._id.toString())) {
    return next(new AppError('Not authorized', 403));
  }

  res.status(200).json({ success: true, data: { chat } });
});

export const createChat = asyncHandler(async (req, res, next) => {
  const { recipientId, vendorId, type } = req.body;

  // Check if chat already exists
  let chat = await Chat.findOne({
    participants: { $all: [req.user._id, recipientId] },
    type
  });

  if (chat) {
    return res.status(200).json({ success: true, data: { chat } });
  }

  chat = await Chat.create({
    participants: [req.user._id, recipientId],
    type,
    vendor: vendorId,
    messages: []
  });

  await chat.populate('participants', 'name avatar');

  res.status(201).json({ success: true, message: 'Chat created', data: { chat } });
});

export const sendMessage = asyncHandler(async (req, res, next) => {
  const { content } = req.body;
  const chat = await Chat.findById(req.params.id);

  if (!chat) return next(new AppError('Chat not found', 404));

  // Check if user is participant
  if (!chat.participants.some(p => p.toString() === req.user._id.toString())) {
    return next(new AppError('Not authorized', 403));
  }

  const message = {
    sender: req.user._id,
    content,
    isRead: false
  };

  chat.messages.push(message);
  chat.lastMessage = content;
  chat.lastMessageAt = new Date();
  await chat.save();

  await chat.populate('messages.sender', 'name avatar');

  // Emit to other participants via socket
  const io = getIO();
  chat.participants.forEach(participantId => {
    if (participantId.toString() !== req.user._id.toString()) {
      io.to(`user_${participantId}`).emit('newMessage', {
        chatId: chat._id,
        message: chat.messages[chat.messages.length - 1]
      });
    }
  });

  res.status(200).json({ success: true, data: { message: chat.messages[chat.messages.length - 1] } });
});

export const markAsRead = asyncHandler(async (req, res, next) => {
  const chat = await Chat.findById(req.params.id);

  if (!chat) return next(new AppError('Chat not found', 404));

  chat.messages.forEach(message => {
    if (message.sender.toString() !== req.user._id.toString() && !message.isRead) {
      message.isRead = true;
      message.readAt = new Date();
    }
  });

  await chat.save();

  res.status(200).json({ success: true, message: 'Messages marked as read' });
});
