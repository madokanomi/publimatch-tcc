const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { 
    createCampaign, 
    getCampaigns, 
    getCampaignById, 
    updateCampaign, 
    deleteCampaign,
    searchCampaigns
} = require('../controllers/campaignControllers');

// Rota de pesquisa para INFLUENCER e INFLUENCER_AGENT
router.route('/search')
    .get(protect, authorize('INFLUENCER', 'INFLUENCER_AGENT'), searchCampaigns);

// Rotas CRUD para AD_AGENT
router.route('/')
    .post(protect, authorize('AD_AGENT'), createCampaign)
    .get(protect, authorize('AD_AGENT'), getCampaigns);

router.route('/:id')
    .get(protect, getCampaignById) // Acesso mais geral para ver detalhes
    .put(protect, authorize('AD_AGENT'), updateCampaign)
    .delete(protect, authorize('AD_AGENT'), deleteCampaign);

module.exports = router; 