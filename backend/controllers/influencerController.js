import Influencer from '../models/influencerModel.js';
import User from '../models/userModel.js';
import asyncHandler from 'express-async-handler';
import crypto from 'crypto';
import { sendWelcomeEmail } from '../config/email.js';
import cloudinary from '../config/cloudinaryConfig.js';
import Invite from '../models/inviteModel.js';
import Campaign from '../models/campaignModel.js';
import Application from '../models/applicationModel.js';

const uploadToCloudinary = (file) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "influencers_profiles" },
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

export const registerInfluencer = asyncHandler(async (req, res) => {
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

    let profileImageUrl = '';
    let backgroundImageUrl = '';

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
    
    const influencer = await Influencer.create({
        name: exibitionName,
        realName,
        age,
        description,
        aboutMe,
        niches: typeof categories === 'string' ? categories.split(',') : categories,
        social: typeof social === 'string' ? JSON.parse(social) : social, 
        agent: req.user._id,
        profileImageUrl,
        backgroundImageUrl,
    });

    if (!influencer) {
        res.status(400);
        throw new Error('Dados inválidos, não foi possível criar o perfil do influenciador.');
    }

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

export const getMyInfluencers = asyncHandler(async (req, res) => {
    const { campaignId } = req.query;

    // Passo 1: Busca todos os influenciadores do agente logado
    let agentInfluencers = await Influencer.find({ agent: req.user._id });

    // Passo 2: Se um campaignId foi fornecido, filtra a lista
    if (campaignId) {
        // Busca todas as candidaturas para a campanha, selecionando o campo 'influencer'
        const applications = await Application.find({ campaign: campaignId }).select('influencer');
        
        // Cria um conjunto (Set) com os IDs dos perfis de influenciador que já se candidataram
        const appliedInfluencerIds = new Set(
            applications.map(app => app.influencer.toString())
        );

        // Filtra a lista, mantendo apenas aqueles cujo _id NÃO está no conjunto de candidaturas
        agentInfluencers = agentInfluencers.filter(
            influencer => !appliedInfluencerIds.has(influencer._id.toString())
        );
    }
    
    res.status(200).json(agentInfluencers);
});

export const deleteInfluencer = asyncHandler(async (req, res) => {
    const influencer = await Influencer.findById(req.params.id);

    if (!influencer) {
        res.status(404);
        throw new Error('Influenciador não encontrado.');
    }

    if (influencer.agent.toString() !== req.user._id.toString()) {
        res.status(401);
        throw new Error('Não tem permissão para apagar este influenciador.');
    }

    await influencer.deleteOne();

    res.status(200).json({ message: 'Influenciador removido com sucesso.' });
});

export const getInfluencerById = asyncHandler(async (req, res) => {
    const influencer = await Influencer.findById(req.params.id);

    if (!influencer) {
        res.status(404);
        throw new Error('Influenciador não encontrado');
    }

    const isAdmin = req.user.role === 'ADMIN';
    const isOwnerAgent = influencer.agent.toString() === req.user._id.toString();
    const isTheInfluencer = influencer.userAccount ? influencer.userAccount.toString() === req.user._id.toString() : false;
    
    if (isAdmin || isOwnerAgent || isTheInfluencer) {
        res.json(influencer);
    } else {
        res.status(403);
        throw new Error('Você não tem permissão para acessar este perfil.');
    }
});

export const updateInfluencer = asyncHandler(async (req, res) => {
  const influencer = await Influencer.findById(req.params.id);

  if (!influencer) {
    res.status(404);
    throw new Error('Influenciador não encontrado.');
  }

  if (influencer.agent.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Você não tem permissão para editar este perfil.');
  }

  if (req.files) {
    if (req.files.profileImage) {
      const result = await uploadToCloudinary(req.files.profileImage[0]);
      influencer.profileImageUrl = result.secure_url;
    }
    if (req.files.backgroundImage) {
      const result = await uploadToCloudinary(req.files.backgroundImage[0]);
      influencer.backgroundImageUrl = result.secure_url;
    }
  }

  const { exibitionName, realName, age, description, aboutMe, niches, social } = req.body;
 
  influencer.name = exibitionName || influencer.name;
  influencer.realName = realName || influencer.realName;
  influencer.age = age || influencer.age;
  influencer.description = description || influencer.description;
  
  if (aboutMe) {
    influencer.aboutMe = aboutMe;
  }

  if (niches) {
    influencer.niches = typeof niches === 'string' ? niches.split(',') : niches;
  }
  if (social) {
    influencer.social = typeof social === 'string' ? JSON.parse(social) : social;
  }

  const updatedInfluencer = await influencer.save();

  res.status(200).json(updatedInfluencer);
});

export const getAllInfluencers = asyncHandler(async (req, res) => {
    const influencers = await Influencer.find({}); 
    
   if (influencers && influencers.length > 0) {
        res.status(200).json(influencers);
    } else {
        res.status(404).json({ message: 'Nenhum influenciador encontrado na plataforma.' });
    }
});

export const getPublicInfluencerProfile = asyncHandler(async (req, res) => {
  const influencer = await Influencer.findById(req.params.id)
    .select('name realName age description aboutMe niches social profileImageUrl backgroundImageUrl');

  if (influencer) {
    res.json(influencer);
  } else {
    res.status(404);
    throw new Error('Perfil de influenciador não encontrado.');
  }
});

export const getInfluencerCampaigns = asyncHandler(async (req, res) => {
  const { id: influencerId } = req.params;

  if (!influencerId) {
    res.status(400);
    throw new Error('O ID do influenciador é necessário.');
  }

  const [invites, participating, history] = await Promise.all([
    Invite.find({ influencer: influencerId, status: 'PENDING' })
      .populate({
        path: 'campaign',
        select: 'title logo endDate createdBy',
      })
      .populate('adAgent', 'name'),

    Campaign.find({
      participatingInfluencers: influencerId,
      status: { $in: ['Aberta', 'Planejamento', 'Ativa'] },
    }),

    Campaign.find({
      participatingInfluencers: influencerId,
      status: 'Concluída',
    }),
  ]);

  res.status(200).json({ invites, participating, history });
});

// @desc    Buscar os influenciadores participantes de uma campanha
// @route   GET /api/campaigns/:id/participants
// @access  Privado (AD_AGENT)
export const getParticipatingInfluencers = asyncHandler(async (req, res) => {
    const campaign = await Campaign.findById(req.params.id)
        .populate('participatingInfluencers', 'name email profileImageUrl'); // Popula os dados dos usuários

    if (!campaign) {
        res.status(404);
        throw new Error('Campanha não encontrada.');
    }

    // Segurança: Apenas o criador da campanha pode ver os participantes
    if (campaign.createdBy.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('Não autorizado a ver os participantes desta campanha.');
    }

    res.status(200).json(campaign.participatingInfluencers);
});