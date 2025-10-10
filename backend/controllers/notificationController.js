// backend/controllers/notificationController.js
import Notification from '../models/notificationModel.js';

// @desc    Buscar todas as notificações do usuário logado
// @route   GET /api/notifications
// @access  Privado
export const getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ recipient: req.user._id })
            .populate('sender', 'name avatar') // Popula com nome e avatar do remetente
            .sort({ createdAt: -1 }); // Ordena pelas mais recentes

        res.status(200).json(notifications);
    } catch (error) {
        console.error("Erro ao buscar notificações:", error);
        res.status(500).json({ message: "Erro no servidor ao buscar notificações." });
    }
};

// Futuramente, você pode adicionar uma função para marcar como lida
export const markAsRead = async (req, res) => {
    // Lógica para encontrar a notificação pelo ID e atualizar `isRead: true`
};