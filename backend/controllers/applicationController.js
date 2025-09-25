const Application = require('../models/applicationModel.js');
const Campaign = require('../models/campaignModel.js'); // Usando o nome do seu arquivo
const User = require('../models/userModel.js');

// @desc    Cria uma nova candidatura para uma campanha
// @route   POST /api/applications
exports.createApplication = async (req, res) => {
    try {
        const { campaignId, influencerId } = req.body; // O frontend enviará o ID da campanha e do influenciador

        // O ID do usuário que está enviando a candidatura vem do token
        const submittedById = req.user._id; 
        
        let finalInfluencerId = influencerId;

        // Se o próprio influenciador está se candidatando, o ID dele é o do usuário logado
        if (req.user.role === 'INFLUENCER') {
            finalInfluencerId = req.user._id;
        } else if (req.user.role === 'INFLUENCER_AGENT' && !influencerId) {
            return res.status(400).json({ message: 'Agentes devem selecionar um influenciador.' });
        }
        
        // Cria a candidatura no banco de dados
        const application = await Application.create({
            campaign: campaignId,
            influencer: finalInfluencerId,
            submittedBy: submittedById
        });

        res.status(201).json(application);

    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Este influenciador já se candidatou para esta campanha.' });
        }
        res.status(500).json({ message: 'Erro no servidor', error: error.message });
    }
};

// @desc    Busca todas as candidaturas de uma campanha
// @route   GET /api/applications/campaign/:campaignId
exports.getApplicationsForCampaign = async (req, res) => {
    try {
        const applications = await Application.find({ campaign: req.params.campaignId })
            .populate('influencer', 'name email'); // Puxa nome e email do influenciador

        res.status(200).json(applications);
    } catch (error) {
        res.status(500).json({ message: 'Erro no servidor', error: error.message });
    }
};

// @desc    Atualiza o status de uma candidatura (Aprovar/Rejeitar)
// @route   PUT /api/applications/:applicationId
exports.updateApplicationStatus = async (req, res) => {
    try {
        const { status } = req.body; // O frontend enviará "Aprovado" ou "Rejeitado"

        if (!['Aprovado', 'Rejeitado'].includes(status)) {
            return res.status(400).json({ message: 'Status inválido.' });
        }

        const application = await Application.findById(req.params.applicationId);

        if (!application) {
            return res.status(404).json({ message: 'Candidatura não encontrada.' });
        }

        application.status = status;
        await application.save();

        // Se o status for "Aprovado", adiciona o influenciador na lista da campanha
        if (status === 'Aprovado') {
            await Campaign.findByIdAndUpdate(application.campaign, {
                $addToSet: { participatingInfluencers: application.influencer }
                // $addToSet previne que o mesmo influenciador seja adicionado duas vezes
            });
        }

        res.status(200).json(application);
    } catch (error) {
        res.status(500).json({ message: 'Erro no servidor', error: error.message });
    }
};