// controllers/userController.js

import User from '../models/userModel.js';
import crypto from 'crypto';
import { sendWelcomeEmail } from '../config/email.js';
import asyncHandler from 'express-async-handler';
// @desc    Listar todos os usuários da empresa do admin logado
// @route   GET /api/users/equipe
// @access  Privado (Admin da Empresa)
export const getMembrosDaEquipe = async (req, res) => {
    try {
        // req.user.empresaId foi adicionado ao usuário no momento do login
        if (!req.user.empresaId) {
            return res.status(400).json({ message: "Este usuário não pertence a uma empresa." });
        }
        
        const membros = await User.find({ empresaId: req.user.empresaId }).select('-password');
        res.status(200).json(membros);
    } catch (error) {
        res.status(500).json({ message: "Erro ao buscar membros da equipe." });
    }
};

export const verifyUserPassword = asyncHandler(async (req, res) => {
  const { password } = req.body;

  // O middleware 'protect' já nos deu o 'req.user'
  const user = await User.findById(req.user._id);

  if (user && (await user.comparePassword(password))) {
    res.status(200).json({ message: 'Senha verificada com sucesso.' });
  } else {
    res.status(401);
    throw new Error('Senha incorreta.');
  }
});


// @desc    Convidar um novo usuário para a empresa
// @route   POST /api/users/convidar
// @access  Privado (Admin da Empresa)
export const convidarMembro = async (req, res) => {
    try {
        const { name, email, role } = req.body;
        const adminConvidando = req.user;

        if (!name || !email || !role) {
            return res.status(400).json({ message: 'Por favor, preencha todos os campos.' });
        }

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'Um usuário com este e-mail já existe na plataforma.' });
        }

        // Lógica de "vagas" da assinatura viria aqui.
        // Ex: verificar se a empresa ainda pode adicionar um usuário com essa 'role'.

        // Função auxiliar para criar o usuário e enviar o e-mail
        const setupToken = crypto.randomBytes(32).toString('hex');
        const passwordSetupToken = crypto.createHash('sha256').update(setupToken).digest('hex');
        const passwordSetupExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 horas

        const newUser = await User.create({
            name,
            email,
            role,
            empresaId: adminConvidando.empresaId, // Vincula à mesma empresa do admin
            password: 'password-not-set',
            passwordSetupToken,
            passwordSetupExpires
        });
        
        const setupLink = `http://localhost:3000/criar-senha/${setupToken}`;
        await sendWelcomeEmail(newUser.email, newUser.name, setupLink);

        res.status(201).json({ message: 'Convite enviado com sucesso!', user: newUser });

    } catch (error) {
        res.status(500).json({ message: 'Erro ao convidar membro.' });
    }
};