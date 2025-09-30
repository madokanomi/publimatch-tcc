import Influencer from '../models/influencerModel.js';
import User from '../models/userModel.js';
import asyncHandler from 'express-async-handler';
import crypto from 'crypto';
import { sendWelcomeEmail } from '../config/email.js';
import cloudinary from '../config/cloudinaryConfig.js';

// --- FUNÇÃO AUXILIAR PARA UPLOAD ---
// Esta função recebe um ficheiro da requisição e faz o upload para o Cloudinary
const uploadToCloudinary = (file) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "influencers_profiles" }, // Organiza as imagens numa pasta no Cloudinary
      (error, result) => {
        if (error) {
          console.error("Cloudinary Upload Error:", error);
          reject(new Error("Falha no upload da imagem."));
        } else {
          resolve(result);
        }
      }
    );
    stream.end(file.buffer);
  });
};


// --- FUNÇÃO PRINCIPAL DE REGISTO ---
// @desc    Cadastrar um novo influenciador com imagens
// @route   POST /api/influencers
// @access  Private (Apenas para INFLUENCER_AGENT)
export const registerInfluencer = asyncHandler(async (req, res) => {
    // Os campos de texto agora vêm de req.body e os ficheiros de req.files
    const { 
        exibitionName, realName, age, description, aboutMe, 
        categories, social, wantsAccount, email 
    } = req.body;

    if (!exibitionName || !realName) {
        res.status(400);
        throw new Error('Nome de exibição e nome real são obrigatórios.');
    }

    if (wantsAccount === 'true' && email) {
        const userExists = await User.findOne({ email });
        if (userExists) {
            res.status(409);
            throw new Error('Este e-mail já está cadastrado na plataforma.');
        }
    }

    // --- LÓGICA DE UPLOAD DE IMAGENS ---
    let profileImageUrl = '';
    let backgroundImageUrl = '';

    // Verifica se os ficheiros foram enviados na requisição
    if (req.files) {
      if (req.files.profileImage) {
        const result = await uploadToCloudinary(req.files.profileImage[0]);
        profileImageUrl = result.secure_url;
      }
      if (req.files.backgroundImage) {
        const result = await uploadToCloudinary(req.files.backgroundImage[0]);
        backgroundImageUrl = result.secure_url;
      }
    }
    
    // --- CRIAÇÃO DO PERFIL DO INFLUENCIADOR ---
    const influencer = await Influencer.create({
        name: exibitionName,
        realName,
        age,
        description,
        aboutMe,
        niches: typeof categories === 'string' ? categories.split(',') : categories,
      // O objeto social geralmente chega como uma string '[object Object]' ou uma string JSON.
      // O ideal é que o frontend envie como string JSON.
      social: typeof social === 'string' ? JSON.parse(social) : social, 
        agent: req.user._id,
        profileImageUrl,    // Guarda o URL da imagem de perfil
        backgroundImageUrl, // Guarda o URL da imagem de fundo
    });

    if (!influencer) {
        res.status(400);
        throw new Error('Dados inválidos, não foi possível criar o perfil do influenciador.');
    }

    // --- CRIAÇÃO DA CONTA DE UTILIZADOR (se aplicável) ---
    if (wantsAccount === 'true' && email) {
        const user = await User.create({
            name: realName,
            email: email,
            password: crypto.randomBytes(20).toString('hex'), 
            role: 'INFLUENCER',
        });
        
        const setupToken = user.getPasswordSetupToken();
        await user.save({ validateBeforeSave: false });
        influencer.userAccount = user._id;
        await influencer.save();
        const setupUrl = `${process.env.FRONTEND_URL}/criar-senha/${setupToken}`;
        try {
            await sendWelcomeEmail(user.email, user.name, setupUrl);
        } catch (error) {
            console.error("Falha CRÍTICA ao enviar e-mail de boas-vindas:", error);
        }
    }

    res.status(201).json({
        _id: influencer._id,
        name: influencer.name,
        message: "Influenciador cadastrado com sucesso!"
    });
});


// --- FUNÇÕES ADICIONAIS PARA A PÁGINA DE LISTA ---

// @desc    Buscar os influenciadores cadastrados pelo agente logado
// @route   GET /api/influencers
// @access  Private (INFLUENCER_AGENT)
export const getMyInfluencers = asyncHandler(async (req, res) => {
    const influencers = await Influencer.find({ agent: req.user._id });
    res.status(200).json(influencers);
});

// @desc    Apagar um influenciador
// @route   DELETE /api/influencers/:id
// @access  Private (INFLUENCER_AGENT)
export const deleteInfluencer = asyncHandler(async (req, res) => {
    const influencer = await Influencer.findById(req.params.id);

    if (!influencer) {
        res.status(404);
        throw new Error('Influenciador não encontrado.');
    }

    // Apenas o agente que criou pode apagar
    if (influencer.agent.toString() !== req.user._id.toString()) {
        res.status(401);
        throw new Error('Não tem permissão para apagar este influenciador.');
    }

    // Opcional: Apagar imagens do Cloudinary
    // ...

    await influencer.deleteOne();

    res.status(200).json({ message: 'Influenciador removido com sucesso.' });
});

export const getInfluencerById = asyncHandler(async (req, res) => {
    console.log('--- BUSCANDO INFLUENCIADOR POR ID ---');
    console.log('ID do Influenciador Buscado:', req.params.id);
    
    const influencer = await Influencer.findById(req.params.id);

    if (!influencer) {
        console.log('RESULTADO: Influenciador não encontrado no banco de dados.');
        res.status(404);
        throw new Error('Influenciador não encontrado');
    }

    // --- LÓGICA DE PERMISSÃO COM LOGS ---
    console.log('--- Verificando Permissões ---');
    console.log('ID do Agente Dono (do DB):', influencer.agent.toString());
    console.log('ID do Usuário Logado (Agente):', req.user._id.toString());
    console.log('Role do Usuário Logado:', req.user.role);

    const isAdmin = req.user.role === 'ADMIN';
    const isOwnerAgent = influencer.agent.toString() === req.user._id.toString();
    const isTheInfluencer = influencer.userAccount ? influencer.userAccount.toString() === req.user._id.toString() : false;

    console.log('O usuário é Admin?', isAdmin);
    console.log('O Agente é o dono?', isOwnerAgent);
    console.log('O usuário é o Influenciador?', isTheInfluencer);
    
    if (isAdmin || isOwnerAgent || isTheInfluencer) {
        console.log('RESULTADO: Permissão concedida!');
        res.json(influencer);
    } else {
        console.log('RESULTADO: Permissão NEGADA!');
        res.status(403);
        throw new Error('Você não tem permissão para acessar este perfil.');
    }
});