import express from 'express';
import { 
    sendMessage, 
    getMessages, 
    getConversations,
    deleteConversation,
    ensureConversation 
} from '../controllers/chatController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// 1. Buscar todas as conversas do usuário
router.get('/', protect, getConversations);

// 2. Garantir conversa (Buscar existente ou Criar nova)
// ⚠️ IMPORTANTE: Esta rota deve vir ANTES de rotas com /:id
router.post('/ensure', protect, ensureConversation);

// 3. Buscar mensagens de uma conversa específica (por ID do outro usuário)
router.get('/:otherUserId', protect, getMessages);

// 4. Enviar mensagem
router.post('/send/:receiverId', protect, sendMessage);

// 5. Deletar conversa
router.delete('/:conversationId', protect, deleteConversation);

export default router;