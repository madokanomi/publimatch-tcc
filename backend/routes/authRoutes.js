// /routes/authRoutes.js

const express = require('express');
const router = express.Router();

const { 
    login, 
    register, 
    forgotPassword, 
    verifyResetCode, // <-- IMPORTE A NOVA FUNÇÃO
    resetPassword 
} = require('../controllers/authController');


router.post('/login', login);

router.post('/register', register);
// ... (rotas de login, register, forgot-password)
router.post('/forgot-password', forgotPassword);

// NOVA ROTA PARA VERIFICAR O CÓDIGO
router.post('/verify-code', verifyResetCode);

// Rota para de fato redefinir a senha
router.put('/reset-password', resetPassword);

module.exports = router;