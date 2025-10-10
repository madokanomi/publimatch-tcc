// backend/routes/notificationRoutes.js
import express from 'express';
import { getNotifications } from '../controllers/notificationController.js';
import { protect } from '../middleware/authMiddleware.js'; // Supondo que você tenha um middleware de proteção

const router = express.Router();

// Rota principal para buscar as notificações
// O middleware 'protect' garante que apenas usuários logados possam acessar
router.get('/', protect, getNotifications);

// Exemplo de rota para marcar como lida
// router.patch('/:id/read', protect, markAsRead);

export default router;