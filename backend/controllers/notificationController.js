// backend/controllers/notificationController.js
import Notification from '../models/notificationModel.js';

// @desc    Buscar todas as notificações do usuário logado
// @route   GET /api/notifications
// @access  Privado

export const getNotifications = async (req, res) => {
    try {
        const notificationsFromDB = await Notification.find({ recipient: req.user._id })
            .populate('sender', 'name profileImageUrl')
            // ✅ LINHA ADICIONADA: Busca a campanha e seleciona apenas o campo do logo.
            .populate({
                path: 'campaign',     // O nome do campo no seu NotificationModel que referencia a campanha
                select: 'logoUrl'     // Selecione APENAS o campo que contém a URL do logo
            })
            .sort({ createdAt: -1 });
        // Mapeia os resultados para garantir que o formato seja exatamente
        // o que o frontend espera.
        const formattedNotifications = notificationsFromDB.map(notif => ({
            _id: notif._id,
            title: notif.title,
            message: notif.message,
            link: notif.link, // ✅ O link agora virá do banco de dados
            createdAt: notif.createdAt,
            isRead: notif.isRead,
            // Garante que o campo `senderAvatar` seja criado
            senderAvatar: notif.sender ? notif.sender.profileImageUrl : 'default_avatar_url',
            logo: notif.campaign ? notif.campaign.logoUrl : null,
        }));

        res.status(200).json(formattedNotifications);
    } catch (error) {
        console.error("Erro ao buscar notificações:", error);
        res.status(500).json({ message: "Erro no servidor ao buscar notificações." });
    }   
};
// Futuramente, você pode adicionar uma função para marcar como lida
export const markAsRead = async (req, res) => {
    // Lógica para encontrar a notificação pelo ID e atualizar `isRead: true`
};

export const deleteNotification = async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);

        if (!notification) {
            return res.status(404).json({ message: 'Notificação não encontrada' });
        }

        // Garante que o usuário (o destinatário) só pode deletar suas próprias notificações
        // ✅ CORREÇÃO APLICADA AQUI
        if (notification.recipient.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Não autorizado' });
        }

        await notification.deleteOne();

        res.status(200).json({ message: 'Notificação removida com sucesso' });
    } catch (error) {
        console.error('Erro ao deletar notificação:', error);
        res.status(500).json({ message: 'Erro no servidor' });
    }
};