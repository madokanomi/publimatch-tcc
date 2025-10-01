// backend/controllers/campaignControllers.js
// Lógica adaptada do seu influencerController.js

import Campaign from '../models/campaignModel.js';
import cloudinary from '../config/cloudinaryConfig.js'; // Assumindo que você tenha um arquivo de configuração como no influencer

// --- FUNÇÃO AUXILIAR PARA UPLOAD (ADAPTADA DO SEU INFLUENCER CONTROLLER) ---
const uploadToCloudinary = (file) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "campaigns_logos" }, // Pasta diferente para organizar no Cloudinary
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

// @desc    Criar uma nova campanha
// @route   POST /api/campaigns
export const createCampaign = async (req, res) => {
    try {
        const {
            title, privacy, minFollowers, minViews,
            startDate, endDate, paymentType, paymentValueExact,
            paymentValueMin, paymentValueMax
        } = req.body;

        // --- LÓGICA DE UPLOAD DE IMAGEM (ADAPTADA DO SEU INFLUENCER CONTROLLER) ---
        let logoUrl = '';
        if (req.file) { // Para upload.single, o arquivo vem em req.file
            const result = await uploadToCloudinary(req.file);
            logoUrl = result.secure_url;
        } else {
            res.status(400);
            throw new Error('A imagem da campanha (logo) é obrigatória.');
        }

        // Converter campos que o FormData envia como string
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
            logo: logoUrl, // Salva a URL do Cloudinary
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

// --- OUTRAS FUNÇÕES CONVERTIDAS PARA A SINTAXE 'EXPORT' ---

export const getCampaigns = async (req, res) => {
    try {
        const campaigns = await Campaign.find({ createdBy: req.user._id }).sort({ createdAt: -1 });
        res.status(200).json(campaigns);
    } catch (error) {
        res.status(500).json({ message: 'Erro no servidor ao buscar campanhas', error: error.message });
    }
};

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

        // Remove os campos que não devem ser modificados por este formulário
        delete updateData.createdBy;
        // 👇 ADICIONE ESTA LINHA
        delete updateData.participatingInfluencers;

        // Lógica para atualizar a imagem se uma nova for enviada
        if (req.file) {
            const result = await uploadToCloudinary(req.file);
            updateData.logo = result.secure_url;
        }

        // Converte campos que vêm como string do FormData de volta para JSON
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
            console.error("Erro de JSON.parse na atualização:", parseError);
            return res.status(400).json({ message: "Dados em formato inválido." });
        }
        
        const updatedCampaign = await Campaign.findByIdAndUpdate(req.params.id, updateData, {
            new: true,
            runValidators: true
        });

        res.status(200).json(updatedCampaign);
    } catch (error) {
        console.error("ERRO DETALHADO AO ATUALIZAR CAMPANHA:", error);
        res.status(500).json({ message: 'Erro no servidor ao atualizar campanha', error: error.message });
    }
};

export const deleteCampaign = async (req, res) => {
    try {
        const campaign = await Campaign.findById(req.params.id);
        if (!campaign) {
            return res.status(404).json({ message: 'Campanha não encontrada.' });
        }
        if (campaign.createdBy.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Usuário não autorizado a deletar esta campanha.' });
        }
        await Campaign.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Campanha deletada com sucesso.' });
    } catch (error) {
        res.status(500).json({ message: 'Erro no servidor ao deletar campanha', error: error.message });
    }
};

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