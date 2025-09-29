import express from 'express';
import upload from '../middleware/uploadMiddleware.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
// Adicionadas as novas funções do controller
import { 
    registerInfluencer, 
    getMyInfluencers, 
    deleteInfluencer 
} from '../controllers/influencerController.js';

const router = express.Router();

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

// Rota para apagar um influenciador específico por ID
router.route('/:id')
    .delete(protect, authorize('INFLUENCER_AGENT'), deleteInfluencer);

export default router;

