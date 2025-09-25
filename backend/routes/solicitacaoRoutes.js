// routes/solicitacaoRoutes.js

import express from 'express';
// Adicione a nova função aqui
import { criarSolicitacao, getSolicitacoesPendentes, updateSolicitacaoStatus } from '../controllers/solicitacaoController.js'; 
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', criarSolicitacao);
router.get('/pendentes', protect, authorize('ADMIN'), getSolicitacoesPendentes);

// 👇 NOVA ROTA PARA ATUALIZAR O STATUS (APROVAR/REJEITAR) 👇
router.put('/:id', protect, authorize('ADMIN'), updateSolicitacaoStatus);

export default router;