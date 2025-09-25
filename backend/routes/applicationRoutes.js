const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware.js');
const applicationController = require('../controllers/applicationController.js');

// Rota para um influenciador ou agente se candidatar a uma campanha
router.post('/', protect, authorize('INFLUENCER', 'INFLUENCER_AGENT'), applicationController.createApplication);

// Rota para um agente de publicidade ver todas as candidaturas de uma campanha específica
router.get('/campaign/:campaignId', protect, authorize('AD_AGENT'), applicationController.getApplicationsForCampaign);

// Rota para um agente de publicidade aprovar ou rejeitar uma candidatura
router.put('/:applicationId', protect, authorize('AD_AGENT'), applicationController.updateApplicationStatus);

module.exports = router;