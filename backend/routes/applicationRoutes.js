import express from 'express';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { 
    applyToCampaign,
    getApplicationsForCampaign,
    updateApplicationStatus
} from '../controllers/applicationController.js';

const router = express.Router();

// Rota para um INFLUENCER ou AGENTE se candidatar
router.post(
    '/apply/:campaignId', 
    protect, 
    authorize('INFLUENCER', 'INFLUENCER_AGENT'), 
    applyToCampaign
);

// Rota para um AD_AGENT buscar as candidaturas de uma de suas campanhas
router.get(
    '/campaign/:campaignId',
    protect,
    authorize('AD_AGENT'),
    getApplicationsForCampaign
);

// Rota para um AD_AGENT aprovar ou rejeitar uma candidatura
router.put(
    '/:applicationId/status',
    protect,
    authorize('AD_AGENT'),
    updateApplicationStatus
);

export default router;