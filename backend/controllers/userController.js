// controllers/userController.js

import User from '../models/userModel.js';
import { sendWelcomeEmail } from '../config/email.js';
import asyncHandler from 'express-async-handler';

// @desc    Listar todos os usuários da empresa do admin logado
// @route   GET /api/users/equipe
// @access  Privado (Admin da Empresa)
export const getMembrosDaEquipe = asyncHandler(async (req, res) => {
    // req.user.empresaId foi adicionado ao usuário no momento do login
    if (!req.user.empresaId) {
        res.status(400);
        throw new Error("Este usuário não pertence a uma empresa.");
    }
    
    const membros = await User.find({ empresaId: req.user.empresaId }).select('-password');
    res.status(200).json(membros);
});

// @desc    Verificar a senha do usuário logado
// @route   POST /api/users/verify-password
// @access  Privado
export const verifyUserPassword = asyncHandler(async (req, res) => {
    const { password } = req.body;

    // Busca o usuário incluindo o campo password que pode estar com select: false
    const user = await User.findById(req.user._id).select('+password');

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
export const convidarMembro = asyncHandler(async (req, res) => {
    const { name, email, role } = req.body;
    const adminConvidando = req.user;

    if (!name || !email || !role) {
        res.status(400);
        throw new Error('Por favor, preencha todos os campos.');
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
        res.status(400);
        throw new Error('Um usuário com este e-mail já existe na plataforma.');
    }

    // Lógica de "vagas" da assinatura viria aqui.
    // Ex: verificar se a empresa ainda pode adicionar um usuário com essa 'role'.

    // Cria uma nova instância de usuário sem salvar ainda
    const newUser = new User({
        name,
        email,
        role,
        empresaId: adminConvidando.empresaId, // Vincula à mesma empresa do admin
    });

    // ========================================================================
    // AJUSTE PRINCIPAL: Utiliza o método do modelo para gerar o token
    // 1. O método getPasswordSetupToken() faz 3 coisas:
    //    - Gera o token não criptografado.
    //    - Salva a versão criptografada e a data de expiração no objeto newUser.
    //    - Retorna o token não criptografado para podermos enviá-lo por e-mail.
    // ========================================================================
    const setupToken = newUser.getPasswordSetupToken();

    // Agora salva o usuário no banco de dados com os campos do token já definidos
  await newUser.save(); // Usamos validateBeforeSave: false para pular a validação da senha que ainda não existe

    // Envia o e-mail de boas-vindas com o link para criar a senha
    const setupLink = `${process.env.FRONTEND_URL}/criar-senha/${setupToken}`; // É uma boa prática usar variáveis de ambiente para a URL do frontend
    
    try {
        await sendWelcomeEmail(newUser.email, newUser.name, setupLink);

        res.status(201).json({ 
            message: 'Convite enviado com sucesso!', 
            user: {
                _id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role,
                empresaId: newUser.empresaId
            }
        });

    } catch (emailError) {
        console.error("Erro ao enviar e-mail:", emailError);
        // Opcional: remover o usuário se o e-mail falhar, para que o admin possa tentar novamente.
        // await User.findByIdAndDelete(newUser._id);
        res.status(500);
        throw new Error('Usuário criado, mas houve um erro ao enviar o e-mail de convite. Tente novamente mais tarde.');
    }
});


// @desc    Atualizar senha do usuário logado
// @route   PUT /api/users/update-password
// @access  Privado
export const updateUserPassword = asyncHandler(async (req, res) => {
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
        res.status(400);
        throw new Error('A nova senha é inválida ou muito curta (mínimo 6 caracteres).');
    }

    // O middleware 'protect' já nos deu o 'req.user'
    const user = await User.findById(req.user._id);

    if (user) {
        // Apenas atribua a nova senha. O hook 'pre-save' no userModel
        // cuidará da criptografia automaticamente antes de salvar.
        user.password = newPassword;
        await user.save();
        res.status(200).json({ message: 'Senha atualizada com sucesso.' });
    } else {
        res.status(404);
        throw new Error('Usuário não encontrado.');
    }
});