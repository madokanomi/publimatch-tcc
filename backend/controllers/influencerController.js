import Influencer from '../models/influencerModel.js';
import User from '../models/userModel.js';
import asyncHandler from 'express-async-handler';
import crypto from 'crypto';
import { sendWelcomeEmail } from '../config/email.js';
import cloudinary from '../config/cloudinaryConfig.js';
import Invite from '../models/inviteModel.js';
import Campaign from '../models/campaignModel.js';
import Application from '../models/applicationModel.js';
import { getYoutubeStats } from '../config/youtubeHelper.js';
import { getInstagramStats } from '../config/instagramHelper.js';
import Review from '../models/reviewModel.js'; // ✅ Importante para as tags

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
            password: 'senhaForte123', 
            role: 'INFLUENCER',
        });
        
        influencer.userAccount = user._id;
        await influencer.save();
    }

    res.status(201).json({
        _id: influencer._id,
        name: influencer.name,
        message: "Influenciador cadastrado com sucesso!"
    });
});

export const getMyInfluencers = asyncHandler(async (req, res) => {
    const { campaignId } = req.query;
    let agentInfluencers = await Influencer.find({ agent: req.user._id });

    if (campaignId) {
        const applications = await Application.find({ campaign: campaignId }).select('influencer');
        const appliedInfluencerIds = new Set(
            applications.map(app => app.influencer.toString())
        );
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
    const influencer = await Influencer.findById(req.params.id).populate('agent', 'name');

    if (!influencer) {
        res.status(404);
        throw new Error('Influenciador não encontrado');
    }

    const isAdmin = req.user.role === 'ADMIN';
    const isOwnerAgent = influencer.agent._id.toString() === req.user._id.toString();
    const isTheInfluencer = influencer.userAccount ? influencer.userAccount.toString() === req.user._id.toString() : false;
    const isAdAgent = req.user.role === 'AD_AGENT';

    if (isAdmin || isOwnerAgent || isTheInfluencer || isAdAgent) {
        let youtubePromise = Promise.resolve(null);
        let instagramPromise = Promise.resolve(null);

        if (influencer.social?.youtube) {
            youtubePromise = getYoutubeStats(influencer.social.youtube);
        }
        if (influencer.social?.instagram) {
            instagramPromise = getInstagramStats(influencer.social.instagram);
        }

        const [youtubeResult, instagramResult] = await Promise.allSettled([
            youtubePromise,
            instagramPromise
        ]);

        const responseData = influencer.toObject();

        if (youtubeResult.status === 'fulfilled' && youtubeResult.value) {
            responseData.youtubeStats = youtubeResult.value;
        }
        if (instagramResult.status === 'fulfilled' && instagramResult.value) {
            responseData.instagramStats = instagramResult.value;
        }

        res.json(responseData);

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
  
  if (aboutMe) { influencer.aboutMe = aboutMe; }
  if (niches) { influencer.niches = typeof niches === 'string' ? niches.split(',') : niches; }
  if (social) { influencer.social = typeof social === 'string' ? JSON.parse(social) : social; }

  const updatedInfluencer = await influencer.save();
  res.status(200).json(updatedInfluencer);
});

// ✅ ATUALIZADO: Lógica para calcular tags e avaliação média na listagem geral
export const getAllInfluencers = asyncHandler(async (req, res) => {
    // Usamos .lean() para modificar o objeto JSON
    const influencers = await Influencer.find({}).lean(); 
    
    if (influencers && influencers.length > 0) {
        // Processa cada influenciador para buscar reviews e calcular tags
        const influencersWithData = await Promise.all(influencers.map(async (inf) => {
            const reviews = await Review.find({ influencer: inf._id }).select('tags rating');

            // 1. Calcular Média de Avaliação Real
            const totalRating = reviews.reduce((acc, curr) => acc + curr.rating, 0);
            const avgRating = reviews.length > 0 ? (totalRating / reviews.length) : 0; // Se não houver reviews, 0 ou valor padrão do model

            // 2. Contar frequência das Tags
            const tagCounts = {};
            reviews.forEach(review => {
                if (review.tags && Array.isArray(review.tags)) {
                    review.tags.forEach(tag => {
                        const normalizedTag = tag.trim(); 
                        tagCounts[normalizedTag] = (tagCounts[normalizedTag] || 0) + 1;
                    });
                }
            });

            // 3. Pegar as top 3 tags mais recorrentes
            const topTags = Object.entries(tagCounts)
                .sort(([, countA], [, countB]) => countB - countA) 
                .slice(0, 3) 
                .map(([tag]) => tag); 

            return {
                ...inf,
                avaliacao: avgRating || inf.avaliacao || 4.5, // Usa a média real, ou fallback
                tags: topTags // ✅ Mapeado para 'tags' para o InfluencerCard usar diretamente
            };
        }));

        res.status(200).json(influencersWithData);
    } else {
        res.status(404).json({ message: 'Nenhum influenciador encontrado na plataforma.' });
    }
});

export const getPublicInfluencerProfile = asyncHandler(async (req, res) => {
  const influencer = await Influencer.findById(req.params.id)
    .select('name realName age description aboutMe niches social profileImageUrl backgroundImageUrl agent')
    .populate('agent', 'name');

  if (influencer) {
    res.json(influencer);
  } else {
    res.status(404);
    throw new Error('Perfil de influenciador não encontrado.');
  }
});

// ✅ ATUALIZADO: Mantém a segurança do perfil público (histórico vs tudo)
export const getInfluencerCampaigns = asyncHandler(async (req, res) => {
  const { id: influencerId } = req.params;
  const userRequesting = req.user; // Pode ser undefined se não houver middleware protect, ou o usuário logado

  if (!influencerId) {
    res.status(400);
    throw new Error('O ID do influenciador é necessário.');
  }

  const influencerProfile = await Influencer.findById(influencerId);
  if (!influencerProfile) {
      res.status(404);
      throw new Error('Influenciador não encontrado');
  }

  // Verifica permissões (Dono, Agente ou Admin vê tudo)
  let hasFullAccess = false;
  if (userRequesting) {
      const isOwner = influencerProfile.userAccount && influencerProfile.userAccount.toString() === userRequesting._id.toString();
      const isAgent = influencerProfile.agent && influencerProfile.agent.toString() === userRequesting._id.toString();
      const isAdmin = userRequesting.role === 'ADMIN';
      hasFullAccess = isOwner || isAgent || isAdmin;
  }

  if (hasFullAccess) {
      const [invites, participating, history] = await Promise.all([
        Invite.find({ influencer: influencerId, status: 'PENDING' })
          .populate({ path: 'campaign', select: 'title logo endDate createdBy' })
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
  } else {
      // VISITANTE PÚBLICO: Vê apenas campanhas CONCLUÍDAS (Histórico)
      const history = await Campaign.find({
          participatingInfluencers: influencerId,
          status: 'Concluída',
      }).select('title logo endDate conversion views engagement'); 

      res.status(200).json({ invites: [], participating: [], history });
  }
});

export const getParticipatingInfluencers = asyncHandler(async (req, res) => {
    const campaign = await Campaign.findById(req.params.id)
        .populate('participatingInfluencers', 'name email profileImageUrl agent');

    if (!campaign) {
        res.status(404);
        throw new Error('Campanha não encontrada.');
    }

    if (campaign.createdBy.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('Não autorizado a ver os participantes desta campanha.');
    }

    res.status(200).json(campaign.participatingInfluencers);
});

export const getInfluencersByAgent = asyncHandler(async (req, res) => {
    const { agentId } = req.params;
    const influencers = await Influencer.find({ agent: agentId })
        .select('name profileImageUrl realName social'); 

    if (influencers) {
        res.status(200).json(influencers);
    } else {
        res.status(404).json({ message: 'Nenhum influenciador encontrado para este agente.' });
    }
});
