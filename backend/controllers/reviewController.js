// backend/controllers/reviewController.js

import asyncHandler from 'express-async-handler';
import Review from '../models/reviewModel.js';
import Campaign from '../models/campaignModel.js';
import Influencer from '../models/influencerModel.js';

// @desc    Criar uma nova avaliação
// @route   POST /api/reviews
// @access  Private (Apenas AD_AGENT)
const createReview = asyncHandler(async (req, res) => {
    const { rating, title, comment, tags, influencerId, campaignId } = req.body;
    const evaluatorId = req.user._id; // ID do AD_AGENT logado, vindo do middleware 'protect'

    // 1. Validação básica dos campos
    if (!rating || !title || !influencerId || !campaignId) {
        res.status(400);
        throw new Error('Por favor, preencha os campos obrigatórios: nota, título, influencer e campanha.');
    }

    // 2. Verificar se a campanha e o influencer existem
    const campaign = await Campaign.findById(campaignId);
    const influencer = await Influencer.findById(influencerId);

    if (!campaign || !influencer) {
        res.status(404);
        throw new Error('Campanha ou influenciador não encontrado.');
    }
    
    // 3. Verificar se o influenciador realmente participou da campanha
    const isParticipant = campaign.participatingInfluencers.some(p_id => p_id.equals(influencerId));
    if (!isParticipant) {
        res.status(403); // Forbidden
        throw new Error('A avaliação não pode ser concluída pois este influenciador não participou da campanha.');
    }

    // 4. Verificar se este AD_AGENT já avaliou este influencer nesta campanha
    const reviewExists = await Review.findOne({
        campaign: campaignId,
        influencer: influencerId,
        evaluator: evaluatorId,
    });

    if (reviewExists) {
        res.status(400); // Bad Request
        throw new Error('Você já avaliou este influenciador para esta campanha.');
    }

    // 5. Criar a avaliação no banco de dados
    const review = await Review.create({
        rating,
        title,
        comment,
        tags,
        influencer: influencerId,
        campaign: campaignId,
        evaluator: evaluatorId,
    });

    res.status(201).json(review);
});

// @desc    Buscar todas as avaliações de um influenciador
// @route   GET /api/reviews/influencer/:id
// @access  Private
const getReviewsByInfluencer = asyncHandler(async (req, res) => {
    const reviews = await Review.find({ influencer: req.params.id })
        .populate('evaluator', 'name profileImageUrl') // Puxa nome e foto de quem avaliou
        .populate('campaign', 'title logo'); // Puxa título e logo da campanha

    res.json(reviews);
});

const getMyReviewedInfluencers = asyncHandler(async (req, res) => {
    const { campaignId } = req.params;
    const evaluatorId = req.user._id;

    // Encontra todas as avaliações feitas pelo usuário logado para a campanha específica
    const reviews = await Review.find({
        campaign: campaignId,
        evaluator: evaluatorId,
    }).select('influencer'); // Seleciona apenas o campo 'influencer'

    // Mapeia o resultado para retornar um array simples de IDs de influenciadores
    const influencerIds = reviews.map(review => review.influencer);

    res.status(200).json(influencerIds);
});

export { createReview, getReviewsByInfluencer, getMyReviewedInfluencers };