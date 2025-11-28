import express from 'express';
import { protect, authorize } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';
import {
    createCampaign,
    getCampaigns,
    getCampaignById,
    updateCampaign,
    updateCampaignState,
    searchCampaigns,
    updateCampaignStatus,
    cancelCampaignWithPassword,
    getMyCampaigns,
    applyToCampaign,
    requestCampaignFinalization,
    finalizeCampaign,
    getParticipatingInfluencers,
} from '../controllers/campaignControllers.js';

const router = express.Router();

// 1. Rotas Específicas (DEVEM vir antes das rotas com :id)
router.route('/my-campaigns')
    .get(protect, authorize('AD_AGENT'), getMyCampaigns);

// ✅ NOVA ROTA ADICIONADA: Para o UserProfile.js buscar campanhas públicas
// Estamos usando getCampaigns assumindo que ele aceita filtros via query string (ex: ?creator=ID)
router.route('/public')
    .get(getCampaigns); 
    
router.route('/search')
    .get(protect, authorize('INFLUENCER', 'INFLUENCER_AGENT'), searchCampaigns);

// 2. Rota Raiz
router.route('/')
    .post(protect, authorize('AD_AGENT'), upload.single('logo'), createCampaign)
    .get(protect, authorize('AD_AGENT'), getCampaigns);

// 3. Rotas com ID (DEVEM vir por último)
router.route('/:id/cancel')
    .post(protect, authorize('AD_AGENT'), cancelCampaignWithPassword);

router.route('/:id/state')
    .patch(protect, authorize('AD_AGENT'), updateCampaignState);

router.route('/:id/participants')
    .get(protect, authorize('AD_AGENT'), getParticipatingInfluencers);

router.route('/:id')
    .get(protect, getCampaignById)
    .put(protect, authorize('AD_AGENT'), upload.single('logo'), updateCampaign);

router.route('/:id/status')
    .patch(protect, authorize('AD_AGENT'), updateCampaignStatus);
    
router.route('/:id/apply').post(protect, applyToCampaign);
router.route('/:id/request-finalization').post(protect, requestCampaignFinalization);
router.route('/:id/finalize').put(protect, finalizeCampaign);

export default router;