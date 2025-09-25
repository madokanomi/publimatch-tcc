// controllers/campaignControllers.js

// Lembre-se de usar o nome correto do seu arquivo de modelo
const Campaign = require('../models/campaignModel'); 

// @desc    Criar uma nova campanha
// @route   POST /api/campaigns
// controllers/campaignControllers.js

// @desc    Criar uma nova campanha
// @route   POST /api/campaigns
// backend/controllers/campaignControllers.js

exports.createCampaign = async (req, res) => {
    try {
        // 1. Recebemos todos os campos, incluindo a nova estrutura de pagamento
        const {
            title, description, privacy, categories,
            minFollowers, minViews, requiredSocials,
            startDate, endDate,
            paymentType,
            paymentValueExact,
            paymentValueMin,
            paymentValueMax
        } = req.body;

        // 2. Validação principal
        if (!title || !description || !paymentType) {
            return res.status(400).json({ message: 'Título, Descrição e Tipo de Pagamento são obrigatórios.' });
        }
        
        // 3. Validação específica para cada tipo de pagamento
        const campaignData = {
            title, description, privacy, categories,
            minFollowers, minViews, requiredSocials,
            startDate, endDate,
            paymentType,
            brandName: req.user.name,
            createdBy: req.user._id
        };

        if (paymentType === 'Exato') {
            if (!paymentValueExact || paymentValueExact <= 0) {
                return res.status(400).json({ message: 'Para pagamento "Exato", um valor maior que zero é necessário.' });
            }
            campaignData.paymentValueExact = paymentValueExact;
        } else if (paymentType === 'Aberto') {
            if (!paymentValueMin || !paymentValueMax || paymentValueMin <= 0 || paymentValueMax <= 0) {
                return res.status(400).json({ message: 'Para pagamento "Aberto", os valores mínimo e máximo são obrigatórios.' });
            }
            if (paymentValueMin > paymentValueMax) {
                return res.status(400).json({ message: 'O valor mínimo não pode ser maior que o valor máximo.' });
            }
            campaignData.paymentValueMin = paymentValueMin;
            campaignData.paymentValueMax = paymentValueMax;
        }
        // Se for 'Indefinido', não precisamos fazer nada, os valores padrão (0) serão usados.

        // 4. Criamos a campanha com os dados validados
        const campaign = await Campaign.create(campaignData);

        res.status(201).json(campaign);

    } catch (error) {
        console.error("ERRO DETALHADO AO CRIAR CAMPANHA:", error);
        res.status(500).json({ message: 'Erro no servidor ao criar campanha', error: error.message });
    }
};
// @desc    Listar todas as campanhas do agente logado
// @route   GET /api/campaigns
exports.getCampaigns = async (req, res) => {
    try {
        const campaigns = await Campaign.find({ createdBy: req.user._id }).sort({ createdAt: -1 });
        res.status(200).json(campaigns);
    } catch (error) {
        res.status(500).json({ message: 'Erro no servidor ao buscar campanhas', error: error.message });
    }
};

// @desc    Buscar uma campanha específica por ID
// @route   GET /api/campaigns/:id
exports.getCampaignById = async (req, res) => {
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

// @desc    Atualizar uma campanha
// @route   PUT /api/campaigns/:id
exports.updateCampaign = async (req, res) => {
    try {
        const campaign = await Campaign.findById(req.params.id);

        if (!campaign) {
            return res.status(404).json({ message: 'Campanha não encontrada.' });
        }

        if (campaign.createdBy.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Usuário não autorizado a modificar esta campanha.' });
        }

        const updatedCampaign = await Campaign.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json(updatedCampaign);
    } catch (error) {
        res.status(500).json({ message: 'Erro no servidor ao atualizar campanha', error: error.message });
    }
};

// @desc    Deletar uma campanha
// @route   DELETE /api/campaigns/:id
exports.deleteCampaign = async (req, res) => {
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

// @desc    Pesquisar campanhas (para Influenciadores e seus agentes)
// @route   GET /api/campaigns/search
exports.searchCampaigns = async (req, res) => {
    try {
        const campaigns = await Campaign.find({ status: 'Ativa' })
            .populate('createdBy', 'name')
            .sort({ createdAt: -1 });

        res.status(200).json(campaigns);
    } catch (error) {
        res.status(500).json({ message: 'Erro no servidor ao pesquisar campanhas', error: error.message });
    }
};