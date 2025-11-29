// /controllers/authController.js

import User from '../models/userModel.js';
import jwt from 'jsonwebtoken';
import crypto from 'crypto'; 
// ✅ CORREÇÃO: Usar chaves { } para importar a função específica
import { sendPasswordResetCodeEmail } from '../config/email.js';

// Função auxiliar para gerar o token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

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
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
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
            // Retorna sucesso por segurança
            return res.status(200).json({ message: 'Se um usuário com este e-mail existir, um código foi enviado.' });
        }

        // Gera código de 6 dígitos
        const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Salva hash no banco
        user.passwordResetToken = crypto.createHash('sha256').update(resetCode).digest('hex');
        user.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 min
        await user.save();

        // Envia email
        try {
            await sendPasswordResetCodeEmail(user.email, user.name, resetCode);
        } catch (emailError) {
            console.error("Erro ao enviar email:", emailError);
            // Limpa o token se o email falhar para permitir nova tentativa limpa
            user.passwordResetToken = undefined;
            user.passwordResetExpires = undefined;
            await user.save();
            throw new Error("Falha no envio de email");
        }

        res.status(200).json({ message: 'Se um usuário com este e-mail existir, um código foi enviado.' });

    } catch (error) {
        console.error("ERRO NO FORGOT PASSWORD:", error); // ✅ LOG DE ERRO ADICIONADO
        res.status(500).json({ message: "Erro no servidor" });
    }
};

// @desc    Verificar se o código é válido
// @route   POST /api/auth/verify-code
export const verifyResetCode = async (req, res) => {
    try {
        const { email, code } = req.body;

        const hashedCode = crypto.createHash('sha256').update(code).digest('hex');

        const user = await User.findOne({
            email: email,
            passwordResetToken: hashedCode,
            passwordResetExpires: { $gt: Date.now() } 
        });

        if (!user) {
            return res.status(400).json({ message: 'Código inválido ou expirado.' });
        }

        res.status(200).json({ message: 'Código verificado com sucesso.' });

    } catch (error) {
        res.status(500).json({ message: "Erro no servidor", error: error.message });
    }
};

// @desc    Redefinir a senha usando o CÓDIGO validado
// @route   PUT /api/auth/reset-password
export const resetPassword = async (req, res) => {
    try {
        const { email, code, password } = req.body;

        const hashedCode = crypto.createHash('sha256').update(code).digest('hex');

        const user = await User.findOne({
            email: email,
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
        console.error("ERRO NO RESET PASSWORD:", error);
        res.status(500).json({ message: "Erro no servidor" });
    }
};
