import Invite from '../models/inviteModel.js';
import Notification from '../models/notificationModel.js';
import User from '../models/userModel.js';
import Campaign from '../models/campaignModel.js';
import Influencer from '../models/influencerModel.js'

export const createInvite = async (req, res) => {
    const { campaignId, influencerId } = req.body;
    const adAgentId = req.user._id;

    try {
        const influencerProfile = await Influencer.findById(influencerId).populate('agent');
        
        if (!influencerProfile) {
            return res.status(404).json({ message: 'Perfil de influenciador não encontrado.' });
        }
        
        if (!influencerProfile.agent) {
            return res.status(400).json({ message: 'Este influenciador não tem um agente associado.' });
        }
        
        const campaign = await Campaign.findById(campaignId);
        if (!campaign) {
            return res.status(404).json({ message: 'Campanha não encontrada.' });
        }

        const newInvite = new Invite({
            campaign: campaignId,
            // ✅ CORREÇÃO: Usamos o 'influencerId' diretamente,
            // pois o schema agora espera um ID de Influenciador.
            influencer: influencerId,
            adAgent: adAgentId,
        });
        await newInvite.save();

        const recipientId = influencerProfile.agent._id;
        const notification = new Notification({
            recipient: recipientId,
            sender: adAgentId,
            title: 'Novo Convite de Campanha!',
            message: `${req.user.name} convidou ${influencerProfile.name} para a campanha "${campaign.title}".`,
            type: 'CAMPAIGN_INVITE',
            entityId: newInvite._id,
             link: `/campaigns/${campaignId}` 
        });
       await notification.save();
        
        // --- INÍCIO DA CORREÇÃO ---

        // 1. Busque a notificação e popule os dados do remetente
        const populatedNotification = await Notification.findById(notification._id)
            .populate('sender', 'name profileImageUrl')
            .lean(); // Usar .lean() é mais performático para enviar dados

        // 2. Crie o objeto final no formato exato que o frontend espera
        const notificationForFrontend = {
            ...populatedNotification,
            // Crie a propriedade 'senderAvatar' que o frontend usa
            senderAvatar: populatedNotification.sender?.profileImageUrl || 'default_avatar_url'
        };
        
        // 3. Emita o objeto já formatado para o frontend
        req.io.to(recipientId.toString()).emit('new_notification', notificationForFrontend);

        // --- FIM DA CORREÇÃO ---

        res.status(201).json({ message: 'Convite enviado com sucesso!' });

    } catch (error) {
        console.error("Erro ao criar convite:", error);
        res.status(500).json({ message: 'Erro interno no servidor.' });
    }
};