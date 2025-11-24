import Invite from '../models/inviteModel.js';
import Notification from '../models/notificationModel.js';
import User from '../models/userModel.js';
import Campaign from '../models/campaignModel.js';
import Influencer from '../models/influencerModel.js'
import asyncHandler from 'express-async-handler';
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
    // ✅ ADICIONE ESTE BLOCO DE POPULATE
    .populate({
        path: 'entityId',
        populate: {
            path: 'influencer'
        }
    })
    .lean(); 

// 2. Crie o objeto final no formato exato que o frontend espera
const notificationForFrontend = {
    ...populatedNotification,
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


// @desc    Atualiza o status de um convite (aceito/rejeitado)
// @route   PATCH /api/invites/:id/status
// @access  Private
export const updateInviteStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const { id: inviteId } = req.params;

  if (!status || !['ACCEPTED', 'REJECTED'].includes(status)) {
    res.status(400);
    throw new Error("Status inválido. Deve ser 'ACCEPTED' ou 'REJECTED'.");
  }

  const invite = await Invite.findById(inviteId).populate('influencer').populate('campaign');

  if (!invite) {
    res.status(404);
    throw new Error('Convite não encontrado.');
  }
  
  // Opcional: Adicionar verificação de segurança aqui

  invite.status = status;
  await invite.save();

  if (status === 'ACCEPTED') {
    await Campaign.findByIdAndUpdate(
      invite.campaign._id,
      { $addToSet: { participatingInfluencers: invite.influencer._id } }
    );
  }

  res.status(200).json({ message: 'Status do convite atualizado com sucesso!', invite });
});