import express from 'express';
import { protect, isCompanyAdmin } from '../middleware/authMiddleware.js';
// ✅ IMPORTANTE: Importar o middleware de upload (Multer)
import upload from '../middleware/uploadMiddleware.js'; 

import { 
    getMembrosDaEquipe, 
    convidarMembro, 
    verifyUserPassword, 
    updateUserPassword,
    updateUserProfile, 
    getPublicProfile 
} from '../controllers/userController.js';

const router = express.Router();

// --- ROTAS PÚBLICAS ---
router.get('/public/:id', getPublicProfile); 

// --- ROTAS PRIVADAS (Requer Login) ---

// Atualizar perfil (com suporte a upload de imagens)
router.put('/profile', 
    protect, 
    // Middleware do Multer para processar os arquivos antes do controller
    upload.fields([
        { name: 'profileImageUrl', maxCount: 1 }, 
        { name: 'backgroundImageUrl', maxCount: 1 }
    ]),
    updateUserProfile
);

// Verificar e Atualizar Senha
router.post('/verify-password', protect, verifyUserPassword);
router.patch('/update-password', protect, updateUserPassword);

// --- ROTAS DE ADMIN DE EMPRESA ---
router.get('/equipe', protect, isCompanyAdmin, getMembrosDaEquipe);
router.post('/convidar', protect, isCompanyAdmin, convidarMembro);

export default router;