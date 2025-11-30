// backend/controllers/campaignControllers.js

import Notification from '../models/notificationModel.js';
import Campaign from '../models/campaignModel.js';
import User from '../models/userModel.js';
import Influencer from '../models/influencerModel.js';
import cloudinary from '../config/cloudinaryConfig.js';
import asyncHandler from 'express-async-handler';
import Invite from '../models/inviteModel.js';


const uploadToCloudinary = (file) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { folder: "campaigns_logos" },
            (error, result) => {
                if (error) {
                    console.error("Cloudinary Upload Error:", error);
                    reject(new Error("Falha no upload da imagem."));
                } else {
                    resolve(result);
                }
            }
        );
        stream.end(file.buffer);
    });
};

export const createCampaign = async (req, res) => {
    try {
        const {
            title, privacy, minFollowers, minViews,
            startDate, endDate, paymentType, paymentValueExact,
            paymentValueMin, paymentValueMax, vagas, hashtag
        } = req.body;

        let logoUrl = '';
        if (req.file) {
            const result = await uploadToCloudinary(req.file);
            logoUrl = result.secure_url;
        } else {
            res.status(400);
            throw new Error('A imagem da campanha (logo) é obrigatória.');
        }

        const description = JSON.parse(req.body.description);
        const categories = JSON.parse(req.body.categories);
        const requiredSocials = JSON.parse(req.body.requiredSocials);

        

        if (!title || !description || !paymentType || !vagas || !hashtag) {
            return res.status(400).json({ message: 'Título, Descrição, Tipo de Pagamento, Vagas e Hashtag são obrigatórios.' });
        }

        if (Number(vagas) <= 0) {
            return res.status(400).json({ message: 'A quantidade de vagas deve ser pelo menos 1.' });
        }
        
        const campaignData = {
            title, description, privacy, categories,
            minFollowers, minViews, requiredSocials,
            startDate, endDate, paymentType, vagas: Number(vagas),
            logo: logoUrl,
            brandName: req.user.name,
            createdBy: req.user._id,
            hashtag
        };

        if (paymentType === 'Exato') {
            campaignData.paymentValueExact = paymentValueExact;
        } else if (paymentType === 'Aberto') {
            campaignData.paymentValueMin = paymentValueMin;
            campaignData.paymentValueMax = paymentValueMax;
        }
        
        const campaign = await Campaign.create(campaignData);
        res.status(201).json(campaign);

    } catch (error) {
        console.error("ERRO DETALHADO AO CRIAR CAMPANHA:", error);
        res.status(500).json({ message: 'Erro no servidor ao criar campanha', error: error.message });
    }
};

export const getCampaigns = async (req, res) => {
    try {
        let query = {};

        // 1. Verifica se foi passado um criador na URL (Ex: ?creator=ID_DO_USUARIO)
        // Isso é usado quando visitamos o perfil público de outro agente
        if (req.query.creator) {
            query.createdBy = req.query.creator;
            
            // Opcional: Se for visualização pública, talvez você queira esconder campanhas canceladas/rascunhos
            // query.status = { $ne: 'Cancelada' }; 
        } 
        // 2. Se não tem query, assume que é o usuário logado (comportamento padrão)
        else if (req.user && req.user._id) {
            query.createdBy = req.user._id;
        } else {
            // Se chegou aqui sem autenticação e sem query param
            return res.status(400).json({ message: "Filtro de campanhas não especificado." });
        }

        const campaigns = await Campaign.find(query).sort({ createdAt: -1 });
        res.status(200).json(campaigns);
    } catch (error) {
        res.status(500).json({ message: 'Erro no servidor ao buscar campanhas', error: error.message });
    }
};

export const getCampaignById = async (req, res) => {
    try {
        // ✨ CORREÇÃO AQUI: Adicionado populate para 'participatingInfluencers' ✨
        const campaign = await Campaign.findById(req.params.id)
            .populate('createdBy', 'name email profileImageUrl _id')
            .populate('participatingInfluencers', 'name profileImageUrl social agent'); // Garante que a foto venha no JSON
            
        if (!campaign) {
            return res.status(404).json({ message: 'Campanha não encontrada.' });
        }
        res.status(200).json(campaign);
    } catch (error) {
        res.status(500).json({ message: 'Erro no servidor ao buscar campanha', error: error.message });
    }
};

export const updateCampaign = async (req, res) => {
    try {
        const campaign = await Campaign.findById(req.params.id);

        if (!campaign) {
            return res.status(404).json({ message: 'Campanha não encontrada.' });
        }
        if (campaign.createdBy.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Usuário não autorizado a modificar esta campanha.' });
        }

        const updateData = { ...req.body };
        delete updateData.createdBy;
        delete updateData.participatingInfluencers;

        if (req.file) {
            const result = await uploadToCloudinary(req.file);
            updateData.logo = result.secure_url;
        }

        try {
            if (updateData.description && typeof updateData.description === 'string') {
                updateData.description = JSON.parse(updateData.description);
            }
            if (updateData.categories && typeof updateData.categories === 'string') {
                updateData.categories = JSON.parse(updateData.categories);
            }
            if (updateData.requiredSocials && typeof updateData.requiredSocials === 'string') {
                updateData.requiredSocials = JSON.parse(updateData.requiredSocials);
            }
        } catch (parseError) {
            return res.status(400).json({ message: "Dados em formato inválido." });
        }
        
        const updatedCampaign = await Campaign.findByIdAndUpdate(req.params.id, updateData, {
            new: true,
            runValidators: true
        });
        res.status(200).json(updatedCampaign);
    } catch (error) {
        res.status(500).json({ message: 'Erro no servidor ao atualizar campanha', error: error.message });
    }
};

export const updateCampaignState = async (req, res) => {
    try {
        const campaign = await Campaign.findById(req.params.id);

        if (!campaign) {
            return res.status(404).json({ message: 'Campanha não encontrada.' });
        }

        if (campaign.createdBy.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Usuário não autorizado a modificar esta campanha.' });
        }

        campaign.state = campaign.state === 'Hidden' ? 'Open' : 'Hidden';
        await campaign.save();

        res.status(200).json({ message: `Campanha agora está ${campaign.state}`, campaign });

    } catch (error) {
        res.status(500).json({ message: 'Erro no servidor ao atualizar estado da campanha', error: error.message });
    }
};

export const updateCampaignStatus = async (req, res) => {
    try {
        const campaign = await Campaign.findById(req.params.id);

        if (!campaign) {
            return res.status(404).json({ message: 'Campanha não encontrada.' });
        }
        if (campaign.createdBy.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Usuário não autorizado.' });
        }
        const { status } = req.body;
        if (!status) {
            return res.status(400).json({ message: 'Novo status é obrigatório.'});
        }
        campaign.status = status;
        await campaign.save();
        res.status(200).json({ message: `Status atualizado para ${status}`, campaign });
    } catch (error) {
        res.status(500).json({ message: 'Erro no servidor ao atualizar status.', error: error.message });
    }
};

export const searchCampaigns = async (req, res) => {
    try {
        const { title, category, platform, minFollowers, openSlots, minViews } = req.query;
        const query = { status: { $nin: ['Concluída', 'Cancelada'] } };

        if (req.user.role === 'INFLUENCER_AGENT') {
            // 1. Encontrar todos os influenciadores gerenciados pelo agente
            const agentInfluencers = await Influencer.find({ agent: req.user._id })
                .select('niches'); // Seleciona apenas os nichos

            // 2. Se o agente tiver influenciadores, agrega seus nichos
            if (agentInfluencers && agentInfluencers.length > 0) {
                // 3. Agregar todos os nichos (categorias) do time do agente
                const allTeamNiches = new Set();
                for (const influencer of agentInfluencers) {
                    influencer.niches.forEach(niche => allTeamNiches.add(niche));
                }

                // 4. Injetar o filtro de categorias na query base
                // "Mostre-me campanhas que tenham PELO MENOS UMA das categorias do meu time"
                if (allTeamNiches.size > 0) {
                    query.categories = { $in: [...allTeamNiches] };
                } else {
                    // Se o time não tem nichos, só pode ver campanhas que não exigem nicho
                    query.categories = { $exists: true, $eq: [] };
                }
            }
            // Se o agente não tiver influenciadores, nenhum pré-filtro é aplicado.
        }
        // ✨ --- FIM DA LÓGICA DE PRÉ-FILTRAGEM --- ✨

        if (title) {
            query.title = { $regex: title, $options: 'i' };
        }
        if (category) {
            query.categories = { $in: [category] };
        }
        if (platform) {
            query.requiredSocials = { $in: [platform] };
        }
        if (minFollowers && parseInt(minFollowers, 10) > 0) {
            const followerCount = parseInt(minFollowers, 10);
            query.minFollowers = { $lte: followerCount };
        }
        if (minViews && parseInt(minViews, 10) > 0) {
            const viewsCount = parseInt(minViews, 10);
            query.minViews = { $lte: viewsCount };
        }
        if (openSlots === 'true') {
            query.status = 'Aberta';
        }

        const campaigns = await Campaign.find(query)
            .populate('createdBy', 'name')
            .sort({ createdAt: -1 });

        res.status(200).json(campaigns);

    } catch (error) {
        console.error("ERRO AO PESQUISAR CAMPANHAS:", error);
        res.status(500).json({ message: 'Erro no servidor ao pesquisar campanhas', error: error.message });
    }
};

export const cancelCampaignWithPassword = async (req, res) => {
    try {
        const { password } = req.body;
        const campaignId = req.params.id;
        const userId = req.user._id;

        if (!password) {
            return res.status(400).json({ message: 'A senha é obrigatória.' });
        }

        const user = await User.findById(userId).select('+password');
        if (!user) {
            return res.status(404).json({ message: 'Usuário não encontrado.' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Senha incorreta.' });
        }

        const campaign = await Campaign.findById(campaignId);
        if (!campaign) {
            return res.status(404).json({ message: 'Campanha não encontrada.' });
        }

        if (campaign.createdBy.toString() !== userId.toString()) {
            return res.status(403).json({ message: 'Usuário não autorizado a cancelar esta campanha.' });
        }

        campaign.status = 'Cancelada';
        await campaign.save();

        res.status(200).json({ message: 'Campanha cancelada com sucesso.', campaign });

    } catch (error) {
        console.error("ERRO AO CANCELAR CAMPANHA COM SENHA:", error);
        res.status(500).json({ message: 'Erro no servidor ao cancelar campanha.' });
    }
};

export const getMyCampaigns = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: 'Não autorizado' });
    }
    const campaigns = await Campaign.find({ createdBy: req.user._id })
      .select('title _id')
      .sort({ createdAt: -1 });
    
    res.status(200).json(campaigns);
  } catch (error) {
    console.error("Erro ao buscar campanhas do usuário:", error);
    res.status(500).json({ message: "Erro no servidor ao buscar campanhas.", error: error.message });
  }
};

export const applyToCampaign = async (req, res) => {
    try {
        const campaignId = req.params.id;
        const { influencerId, inviteId } = req.body;

        if (!influencerId) {
            return res.status(400).json({ message: 'O ID do influenciador é obrigatório.' });
        }

        const campaign = await Campaign.findById(campaignId);
        if (!campaign) {
            return res.status(404).json({ message: 'Campanha não encontrada.' });
        }

        if (campaign.status !== 'Aberta' && campaign.status !== 'Ativa') {
            return res.status(400).json({ message: 'Esta campanha não está mais aceitando inscrições.' });
        }

        // 2. Verifica se o número de participantes atual é MAIOR OU IGUAL ao total de vagas
        if (campaign.participatingInfluencers.length >= campaign.vagas) {
            return res.status(400).json({ message: 'Esta campanha não possui mais vagas disponíveis.' });
        }

        if (campaign.participatingInfluencers.includes(influencerId)) {
            return res.status(400).json({ message: 'Este influenciador já está participando da campanha.' });
        }

        campaign.participatingInfluencers.push(influencerId);
        await campaign.save();

        if (inviteId) {
            await Invite.findByIdAndUpdate(inviteId, { status: 'ACCEPTED' });
        }

        res.status(200).json({
            message: 'Inscrição na campanha realizada com sucesso!',
            campaign
        });

    } catch (error) {
        console.error("ERRO AO APLICAR PARA CAMPANHA:", error);
        res.status(500).json({ message: 'Erro no servidor ao se inscrever na campanha.' });
    }
};

export const requestCampaignFinalization = asyncHandler(async (req, res) => {
    const { id: campaignId } = req.params;
    const influencerUser = req.user;

    const campaign = await Campaign.findById(campaignId);
    if (!campaign) {
        res.status(404);
        throw new Error('Campanha não encontrada.');
    }

    const recipientId = campaign.createdBy;
    const notification = new Notification({
        recipient: recipientId,
        sender: influencerUser._id,
        title: 'Solicitação de Finalização de Contrato',
        message: `${influencerUser.name} solicitou a finalização da campanha "${campaign.title}".`,
        type: 'FINALIZE_REQUEST',
        campaign: campaignId,
        link: `/dashboard/campaigns/${campaignId}`
    });
    await notification.save();
    
    const populatedNotification = await Notification.findById(notification._id)
        .populate('sender', 'name profileImageUrl')
        .populate('campaign', 'logo')
        .lean();
    
    req.io.to(recipientId.toString()).emit('new_notification', populatedNotification);

    res.status(200).json({ message: 'Solicitação de finalização enviada com sucesso!' });
});

export const finalizeCampaign = asyncHandler(async (req, res) => {
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) {
        res.status(404);
        throw new Error('Campanha não encontrada.');
    }

    if (campaign.createdBy.toString() !== req.user._id.toString()) {
        res.status(401);
        throw new Error('Não autorizado a finalizar esta campanha.');
    }

    campaign.status = 'Concluída';
    await campaign.save();

    res.status(200).json({ message: 'Campanha finalizada com sucesso!', campaign });
});

export const getParticipatingInfluencers = asyncHandler(async (req, res) => {
    const campaign = await Campaign.findById(req.params.id)
        .populate('participatingInfluencers', 'name realName profileImageUrl social agent'); 

    if (!campaign) {
        res.status(404);
        throw new Error('Campanha não encontrada.');
    }
    
    res.status(200).json(campaign.participatingInfluencers);
});
