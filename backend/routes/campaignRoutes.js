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
    searchCampaigns,
    updateCampaignStatus,
    cancelCampaignWithPassword,
     getMyCampaigns,
      applyToCampaign,
          requestCampaignFinalization,
           finalizeCampaign,
} from '../controllers/campaignControllers.js';

const router = express.Router();

    router.route('/my-campaigns')
    .get(protect, authorize('AD_AGENT'), getMyCampaigns);
    
router.route('/search')
    .get(protect, authorize('INFLUENCER', 'INFLUENCER_AGENT'), searchCampaigns);

router.route('/')
    .post(protect, authorize('AD_AGENT'), upload.single('logo'), createCampaign)
    .get(protect, authorize('AD_AGENT'), getCampaigns);

router.route('/:id/cancel')
    .post(protect, authorize('AD_AGENT'), cancelCampaignWithPassword);

// --- NOVA ROTA PARA ATUALIZAR O ESTADO (OCULTAR/MOSTRAR) ---
router.route('/:id/state')
    .patch(protect, authorize('AD_AGENT'), updateCampaignState);

router.route('/:id')
    .get(protect, getCampaignById)
    .put(protect, authorize('AD_AGENT'), upload.single('logo'), updateCampaign);
    // --- ROTA ANTIGA .delete() FOI REMOVIDA DAQUI ---

router.route('/:id/status')
    .patch(protect, authorize('AD_AGENT'), updateCampaignStatus);

    
router.route('/:id/apply').post(protect, applyToCampaign)
router.route('/:id/request-finalization').post(protect, requestCampaignFinalization);
router.route('/:id/finalize').put(protect, finalizeCampaign);


export default router;