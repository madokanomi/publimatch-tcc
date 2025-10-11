import express from 'express';
import { sendMessage, getMessages, getConversations } from '../controllers/chat.controller.js';
import { protectRoute } from '../middleware/protectRoute.js'; // Crie ou use seu middleware de autenticação

const router = express.Router();

router.get('/conversations', protectRoute, getConversations);
router.get('/:otherUserId', protectRoute, getMessages);
router.post('/send/:receiverId', protectRoute, sendMessage);

export default router;