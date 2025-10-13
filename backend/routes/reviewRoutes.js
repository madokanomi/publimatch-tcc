// backend/routes/reviewRoutes.js

import express from 'express';
const router = express.Router();
import { createReview, getReviewsByInfluencer, getMyReviewedInfluencers } from '../controllers/reviewController.js';

// Importando seus middlewares de authMiddleware.js
import { protect, authorize } from '../middleware/authMiddleware.js'; 

// Rota para CRIAR uma nova avaliação.
// 1. 'protect' garante que o usuário esteja logado.
// 2. 'authorize('AD_AGENT')' garante que SÓ um AD_AGENT possa acessar.
router.route('/')
    .post(protect, authorize('AD_AGENT'), createReview);

// Rota para BUSCAR todas as avaliações de um influenciador específico.
// Protegida para garantir que apenas usuários logados possam ver as avaliações.
router.route('/influencer/:id')
    .get(protect, getReviewsByInfluencer);

router.route('/campaign/:campaignId/my-reviews').get(protect, authorize('AD_AGENT'), getMyReviewedInfluencers);

export default router;