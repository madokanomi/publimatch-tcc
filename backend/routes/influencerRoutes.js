import express from 'express';
import upload from '../middleware/uploadMiddleware.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { 
    registerInfluencer, 
    getMyInfluencers, 
    deleteInfluencer,
    getInfluencerById,
    updateInfluencer, // ✅ 1. IMPORTAR A NOVA FUNÇÃO DE UPDATE
       getPublicInfluencerProfile,
      getAllInfluencers
} from '../controllers/influencerController.js';

const router = express.Router();

router.route('/all') // ✅ 2. CRIAR A ROTA ESPECÍFICA
    .get(getAllInfluencers); 

// Rota para criar (POST) e buscar (GET) os influenciadores do agente logado
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

// Rota para buscar, apagar e ATUALIZAR um influenciador específico por ID
router.route('/:id')
    .get(protect, authorize('INFLUENCER_AGENT', 'INFLUENCER', 'ADMIN'), getInfluencerById)
    .delete(protect, authorize('INFLUENCER_AGENT'), deleteInfluencer)
    // ✅ 2. ADICIONAR A ROTA PUT PARA ATUALIZAR O INFLUENCIADOR
    .put(
        protect,
        authorize('INFLUENCER_AGENT'), // Apenas o agente pode editar
        upload.fields([ // Precisa do multer para processar possíveis novas imagens
            { name: 'profileImage', maxCount: 1 },
            { name: 'backgroundImage', maxCount: 1 }
        ]),
        updateInfluencer
    );

    router.route('/public/:id').get(getPublicInfluencerProfile);
    
export default router;