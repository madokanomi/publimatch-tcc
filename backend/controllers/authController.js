// /controllers/authController.js

import User from '../models/userModel.js';
import jwt from 'jsonwebtoken';
import crypto from 'crypto'; // Módulo nativo do Node.js para criptografia
import sendPasswordResetCodeEmail from '../config/email.js' // Supondo que você tenha um utilitário de e-mail

// Função auxiliar para gerar o token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d', // O token expira em 30 dias
    });
};

// @desc    Registrar um novo usuário
// @route   POST /api/auth/register
// @access  Público
// @desc    Registrar um novo usuário
// @route   POST /api/auth/register
export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'Por favor, preencha todos os campos.' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'Este e-mail já está em uso.' });
    }

    const user = await User.create({
      name,
      email,
      password,
      role,
      // O profileImageUrl padrão será definido pelo Schema do Mongoose se não for passado
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        // ✅ CORREÇÃO: Retornar campos extras
        profileImageUrl: user.profileImageUrl,
        isCompanyAdmin: user.isCompanyAdmin,
        empresaId: user.empresaId,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Dados de usuário inválidos.' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Erro no servidor', error: error.message });
  }
};
// A função login começa AQUI, do lado de fora.
// @desc    Login
// @route   POST /api/auth/login
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Por favor, forneça e-mail e senha.' });
        }

        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(401).json({ message: 'Credenciais inválidas.' });
        }

        const isMatch = await user.comparePassword(password);

        if (isMatch) {
            const token = generateToken(user._id);
            
            return res.status(200).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                // ✅ CORREÇÃO CRÍTICA: Adicionado envio da imagem e dados da empresa
                profileImageUrl: user.profileImageUrl, 
                isCompanyAdmin: user.isCompanyAdmin,
                empresaId: user.empresaId,
                token: token,
            });
        } 
        
        res.status(401).json({ message: 'Credenciais inválidas.' });

    } catch (error) {
        console.error("ERRO NO LOGIN:", error);
        res.status(500).json({ message: 'Erro interno no servidor.' });
    }
};

// @desc    Gerar CÓDIGO de reset de senha e enviar por e-mail
// @route   POST /api/auth/forgot-password
export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            // Ainda respondemos com sucesso para não revelar se um e-mail existe
            return res.status(200).json({ message: 'Se um usuário com este e-mail existir, um código foi enviado.' });
        }

        // Gera um código numérico de 6 dígitos
        const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Salva o HASH do código no banco (nunca salve códigos/tokens em texto puro)
        user.passwordResetToken = crypto.createHash('sha256').update(resetCode).digest('hex');
        user.passwordResetExpires = Date.now() + 10 * 60 * 1000; // Válido por 10 minutos
        await user.save();

        // Envia o e-mail com o CÓDIGO original
        await sendPasswordResetCodeEmail(user.email, user.name, resetCode);

        res.status(200).json({ message: 'Se um usuário com este e-mail existir, um código foi enviado.' });

    } catch (error) {
        res.status(500).json({ message: "Erro no servidor" });
    }
};

// @desc    Redefinir a senha usando o CÓDIGO
// @route   PUT /api/auth/reset-password
export const resetPassword = async (req, res) => {
    try {
        const { email, code, password } = req.body;

        // Faz o hash do código recebido para comparar com o do banco
        const hashedCode = crypto.createHash('sha256').update(code).digest('hex');

        const user = await User.findOne({
            email: email, // Precisamos do email para encontrar o usuário
            passwordResetToken: hashedCode,
            passwordResetExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: 'Código inválido ou expirado.' });
        }

        user.password = password;
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save();

        res.status(200).json({ message: 'Senha redefinida com sucesso!' });

    } catch (error) {
        res.status(500).json({ message: "Erro no servidor" });
    }
};

export const verifyResetCode = async (req, res) => {
    try {
        const { email, code } = req.body;

        // Faz o hash do código recebido para comparar com o do banco
        const hashedCode = crypto.createHash('sha256').update(code).digest('hex');

        const user = await User.findOne({
            email: email,
            passwordResetToken: hashedCode,
            passwordResetExpires: { $gt: Date.now() } // Verifica se não expirou
        });

        if (!user) {
            // Se não encontrou, o código é inválido ou expirado
            return res.status(400).json({ message: 'Código inválido ou expirado.' });
        }

        // Se encontrou, o código é válido
        res.status(200).json({ message: 'Código verificado com sucesso.' });

    } catch (error) {
        res.status(500).json({ message: "Erro no servidor", error: error.message });
    }
};