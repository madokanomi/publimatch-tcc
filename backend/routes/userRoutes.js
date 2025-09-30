// routes/userRoutes.js

import express from 'express';
// ✅ Mudei o nome do import para ser mais claro
import { protect, isCompanyAdmin } from '../middleware/authMiddleware.js'; 
import { getMembrosDaEquipe, convidarMembro, verifyUserPassword } from '../controllers/userController.js';

const router = express.Router();

// ❌ REMOVA ESTA LINHA QUE APLICAVA A REGRA A TODAS AS ROTAS
// router.use(protect, isCompanyAdmin); 

// ✅ AGORA, APLICAMOS OS MIDDLEWARES A CADA ROTA INDIVIDUALMENTE

// Estas rotas precisam que o usuário seja um admin da empresa
router.get('/equipe', protect, isCompanyAdmin, getMembrosDaEquipe);
router.post('/convidar', protect, isCompanyAdmin, convidarMembro);

// Esta rota precisa apenas que o usuário esteja logado (seja ele admin ou não)
router.post('/verify-password', protect, verifyUserPassword);

export default router;