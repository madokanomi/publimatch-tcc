import asyncHandler from 'express-async-handler';
import Application from '../models/applicationModel.js';
import Campaign from '../models/campaignModel.js';
import Influencer from '../models/influencerModel.js';

export const applyToCampaign = asyncHandler(async (req, res) => {
    const { campaignId } = req.params;
    const { influencerId } = req.body;
    const userMakingRequest = req.user;

    const campaign = await Campaign.findById(campaignId);
    if (!campaign) {
        res.status(404);
        throw new Error('Campanha não encontrada.');
    }
    if (campaign.status !== 'Aberta') {
        res.status(400);
        throw new Error('Esta campanha não está mais aceitando candidaturas.');
    }

    let finalInfluencerProfileId;

    if (userMakingRequest.role === 'INFLUENCER_AGENT') {
        if (!influencerId) {
            res.status(400);
            throw new Error('Agentes devem selecionar um influenciador para candidatar.');
        }
        finalInfluencerProfileId = influencerId;
    } else {
        const influencerProfile = await Influencer.findOne({ userAccount: userMakingRequest._id });
        if (!influencerProfile) {
            res.status(404);
            throw new Error('Perfil de influenciador associado a esta conta não foi encontrado.');
        }
        finalInfluencerProfileId = influencerProfile._id;
    }
    
    const existingApplication = await Application.findOne({
        campaign: campaignId,
        influencer: finalInfluencerProfileId
    });

    if (existingApplication) {
        res.status(400);
        throw new Error('Este influenciador já se candidatou para esta campanha.');
    }

    const newApplication = await Application.create({
        campaign: campaignId,
        influencer: finalInfluencerProfileId,
        submittedBy: userMakingRequest._id,
    });

    campaign.applications += 1;
    await campaign.save();
    
    res.status(201).json({
        message: 'Candidatura enviada com sucesso!',
        application: newApplication
    });
});

export const getApplicationsForCampaign = asyncHandler(async (req, res) => {
    const { campaignId } = req.params;

    const campaign = await Campaign.findById(campaignId);
    if (!campaign) {
        res.status(404);
        throw new Error('Campanha não encontrada.');
    }

    if (campaign.createdBy.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('Você não tem permissão para ver as candidaturas desta campanha.');
    }
    
    const applications = await Application.find({ campaign: campaignId, status: 'pendente' })
        .populate('influencer');

    res.status(200).json(applications);
});

export const updateApplicationStatus = asyncHandler(async (req, res) => {
    const { applicationId } = req.params;
    const { status } = req.body;

    if (!['aprovada', 'rejeitada'].includes(status)) {
        res.status(400);
        throw new Error('Status inválido. Use "aprovada" ou "rejeitada".');
    }

    const application = await Application.findById(applicationId).populate('campaign');
    if (!application) {
        res.status(404);
        throw new Error('Candidatura não encontrada.');
    }

    if (application.campaign.createdBy.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('Você não tem permissão para gerenciar esta candidatura.');
    }
    
    application.status = status;
    await application.save();

    if (status === 'aprovada') {
        await Campaign.findByIdAndUpdate(application.campaign._id, {
            $addToSet: { participatingInfluencers: application.influencer },
            $inc: { influencers: 1 }
        });
    }

    res.status(200).json({ message: `Candidatura ${status} com sucesso.`, application });
});