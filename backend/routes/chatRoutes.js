import express from 'express';
import { 
    sendMessage, 
    getMessages, 
    getConversations,
    deleteConversation,
    ensureConversation // ✅ 1. IMPORTE A FUNÇÃO QUE FALTAVA
} from '../controllers/chatController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Rota para buscar a lista de conversas do usuário logado
router.get('/', protect, getConversations);

// ✅ 2. ADICIONE A NOVA ROTA AQUI
//    Esta rota deve vir ANTES da rota com parâmetro dinâmico para evitar conflitos.
//    Recebe um POST para encontrar ou criar uma conversa.
router.post('/ensure', protect, ensureConversation);

// Rota para buscar as mensagens de uma conversa específica com outro usuário
router.get('/:otherUserId', protect, getMessages);

// Rota para enviar uma nova mensagem
router.post('/send/:receiverId', protect, sendMessage);

// Rota para deletar uma conversa
router.delete('/:conversationId', protect, deleteConversation);

export default router;