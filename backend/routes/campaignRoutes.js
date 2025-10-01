// backend/routes/campaignRoutes.js
// Lógica adaptada do seu influencerRoutes.js

import express from 'express'; // MODIFICADO: Padronizando para 'import'
import { protect, authorize } from '../middleware/authMiddleware.js'; // MODIFICADO
import upload from '../middleware/uploadMiddleware.js'; // MODIFICADO: Importando o upload
import { 
    createCampaign, 
    getCampaigns, 
    getCampaignById, 
    updateCampaign, 
    deleteCampaign,
    searchCampaigns
} from '../controllers/campaignControllers.js'; // MODIFICADO

const router = express.Router();

router.route('/search')
    .get(protect, authorize('INFLUENCER', 'INFLUENCER_AGENT'), searchCampaigns);

router.route('/')
    // MODIFICADO: Adicionado middleware de upload para um único arquivo chamado 'logo'
    .post(protect, authorize('AD_AGENT'), upload.single('logo'), createCampaign) 
    .get(protect, authorize('AD_AGENT'), getCampaigns);

router.route('/:id')
    .get(protect, getCampaignById) 
    // MODIFICADO: Adicionado 'upload.single('logo')' também na rota de update, caso queira trocar a imagem
    .put(protect, authorize('AD_AGENT'), upload.single('logo'), updateCampaign)
    .delete(protect, authorize('AD_AGENT'), deleteCampaign);

export default router; // MODIFICADO: Padronizando para 'export default'