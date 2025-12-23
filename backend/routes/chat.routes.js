import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  getChats,
  getChat,
  createChat,
  sendMessage,
  markAsRead
} from '../controllers/chat.controller.js';

const router = express.Router();

router.get('/', protect, getChats);
router.get('/:id', protect, getChat);
router.post('/', protect, createChat);
router.post('/:id/messages', protect, sendMessage);
router.put('/:id/read', protect, markAsRead);

export default router;
