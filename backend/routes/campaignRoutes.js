// backend/routes/campaignRoutes.js

import express from 'express';
import { protect, authorize } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';
import {
    createCampaign,
    getCampaigns,
    getCampaignById,
    updateCampaign,
    // --- deleteCampaign foi removido daqui ---
    updateCampaignState, // --- E updateCampaignState foi adicionado ---
    searchCampaigns
} from '../controllers/campaignControllers.js';

const router = express.Router();

router.route('/search')
    .get(protect, authorize('INFLUENCER', 'INFLUENCER_AGENT'), searchCampaigns);

router.route('/')
    .post(protect, authorize('AD_AGENT'), upload.single('logo'), createCampaign)
    .get(protect, authorize('AD_AGENT'), getCampaigns);

// --- NOVA ROTA PARA ATUALIZAR O ESTADO (OCULTAR/MOSTRAR) ---
router.route('/:id/state')
    .patch(protect, authorize('AD_AGENT'), updateCampaignState);

router.route('/:id')
    .get(protect, getCampaignById)
    .put(protect, authorize('AD_AGENT'), upload.single('logo'), updateCampaign);
    // --- ROTA ANTIGA .delete() FOI REMOVIDA DAQUI ---

export default router;