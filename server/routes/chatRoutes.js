import express from 'express';
import { getChatForItem, postMessageForItem } from '../controllers/chatController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET /api/chats/:itemType/:itemId
router.get('/:itemType/:itemId', protect, getChatForItem);

// POST /api/chats/:itemType/:itemId/messages
router.post('/:itemType/:itemId/messages', protect, postMessageForItem);

export default router;
