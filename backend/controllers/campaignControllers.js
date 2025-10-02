// backend/controllers/campaignController.js

import Campaign from '../models/campaignModel.js';
import cloudinary from '../config/cloudinaryConfig.js';

// --- FUNÇÃO AUXILIAR PARA UPLOAD (sem alterações) ---
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

// --- createCampaign (sem alterações) ---
export const createCampaign = async (req, res) => {
    try {
        const {
            title, privacy, minFollowers, minViews,
            startDate, endDate, paymentType, paymentValueExact,
            paymentValueMin, paymentValueMax
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

        if (!title || !description || !paymentType) {
            return res.status(400).json({ message: 'Título, Descrição e Tipo de Pagamento são obrigatórios.' });
        }
        
        const campaignData = {
            title, description, privacy, categories,
            minFollowers, minViews, requiredSocials,
            startDate, endDate, paymentType,
            logo: logoUrl,
            brandName: req.user.name,
            createdBy: req.user._id
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

// --- getCampaigns (sem alterações) ---
export const getCampaigns = async (req, res) => {
    try {
        const campaigns = await Campaign.find({ createdBy: req.user._id }).sort({ createdAt: -1 });
        res.status(200).json(campaigns);
    } catch (error) {
        res.status(500).json({ message: 'Erro no servidor ao buscar campanhas', error: error.message });
    }
};

// --- getCampaignById (sem alterações) ---
export const getCampaignById = async (req, res) => {
    try {
        const campaign = await Campaign.findById(req.params.id).populate('createdBy', 'name email');
        if (!campaign) {
            return res.status(404).json({ message: 'Campanha não encontrada.' });
        }
        res.status(200).json(campaign);
    } catch (error) {
        res.status(500).json({ message: 'Erro no servidor ao buscar campanha', error: error.message });
    }
};

// --- updateCampaign (sem alterações) ---
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

// --- ANTIGA FUNÇÃO deleteCampaign REMOVIDA ---

// --- NOVA FUNÇÃO PARA OCULTAR/MOSTRAR CAMPANHA ---
export const updateCampaignState = async (req, res) => {
    try {
        const campaign = await Campaign.findById(req.params.id);

        if (!campaign) {
            return res.status(404).json({ message: 'Campanha não encontrada.' });
        }

        if (campaign.createdBy.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Usuário não autorizado a modificar esta campanha.' });
        }

        // Alterna o estado: se for 'Hidden', vira 'Open', e vice-versa.
        campaign.state = campaign.state === 'Hidden' ? 'Open' : 'Hidden';

        await campaign.save();

        res.status(200).json({ message: `Campanha agora está ${campaign.state}`, campaign });

    } catch (error) {
        res.status(500).json({ message: 'Erro no servidor ao atualizar estado da campanha', error: error.message });
    }
};

// --- searchCampaigns (sem alterações) ---
export const searchCampaigns = async (req, res) => {
    try {
        const campaigns = await Campaign.find({ status: 'Ativa' })
            .populate('createdBy', 'name')
            .sort({ createdAt: -1 });
        res.status(200).json(campaigns);
    } catch (error) {
        res.status(500).json({ message: 'Erro no servidor ao pesquisar campanhas', error: error.message });
    }
};