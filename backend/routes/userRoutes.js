// routes/userRoutes.js

import express from 'express';
import { protect, authorize, isCompanyAdmin } from '../middleware/authMiddleware.js'; // Importe o novo middleware
import { getMembrosDaEquipe, convidarMembro } from '../controllers/userController.js';

const router = express.Router();

// Apenas admins de empresa podem acessar estas rotas
router.use(protect, isCompanyAdmin); 

router.get('/equipe', getMembrosDaEquipe);
router.post('/convidar', convidarMembro);

export default router;