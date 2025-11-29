import express from 'express';
import upload from '../middleware/uploadMiddleware.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { 
    registerInfluencer, 
    getMyInfluencers, 
    deleteInfluencer,
    getInfluencerById,
    updateInfluencer,
    getPublicInfluencerProfile,
    getAllInfluencers,
    getInfluencerCampaigns,
    getInfluencersByAgent
} from '../controllers/influencerController.js';

const router = express.Router();

// ==============================================================================
// ⚠️ REGRAS DE OURO: 
// 1. Rotas específicas (como /all, /by-agent) devem vir PRIMEIRO.
// 2. Rotas genéricas com IDs (como /:id) devem vir POR ÚLTIMO.
// ==============================================================================

// 1. Rota para listar todos (somente Admin ou uso interno)
router.route('/all')
    .get(getAllInfluencers); 

// 2. Rota para buscar influenciadores por Agente
router.route('/by-agent/:agentId')
    .get(getInfluencersByAgent); 

// 3. Rota para Perfil Público (sem login)
router.route('/public/:id')
    .get(getPublicInfluencerProfile);

// 4. Rota Raiz (Meus Influenciadores / Cadastro)
router.route('/')
    .post(
        protect,
        authorize('INFLUENCER_AGENT'),
        upload.fields([
            { name: 'profileImage', maxCount: 1 },
            { name: 'backgroundImage', maxCount: 1 }
        ]),
        registerInfluencer
    )
    .get(protect, authorize('INFLUENCER_AGENT'), getMyInfluencers);

// 5. Rotas Específicas de um ID (Campanhas)
// ✅ ALTERAÇÃO: Removido 'protect' para permitir visualização pública do histórico.
// O Controller já gerencia a segurança (mostra só histórico se não for dono).
router.route('/:id/campaigns')
    .get(getInfluencerCampaigns);

// 6. Rota Genérica por ID (GET, PUT, DELETE) - DEIXE ESTA POR ÚLTIMO
router.route('/:id')
    .get(protect, authorize('INFLUENCER_AGENT', 'INFLUENCER', 'ADMIN'), getInfluencerById)
    .delete(protect, authorize('INFLUENCER_AGENT'), deleteInfluencer)
    .put(
        protect,
        authorize('INFLUENCER_AGENT'),
        upload.fields([
            { name: 'profileImage', maxCount: 1 },
            { name: 'backgroundImage', maxCount: 1 }
        ]),
        updateInfluencer
    );

export default router;
