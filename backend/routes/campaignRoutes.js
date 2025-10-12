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
    getParticipatingInfluencers, // ADICIONADO A IMPORTAÇÃO
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

router.route('/:id/state')
    .patch(protect, authorize('AD_AGENT'), updateCampaignState);

// NOVA ROTA PARA BUSCAR OS PARTICIPANTES
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