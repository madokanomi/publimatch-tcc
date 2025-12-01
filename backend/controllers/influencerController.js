import Influencer from '../models/influencerModel.js';
import User from '../models/userModel.js';
import asyncHandler from 'express-async-handler';
import crypto from 'crypto';
import axios from 'axios';
import { sendWelcomeEmail } from '../config/email.js';
import cloudinary from '../config/cloudinaryConfig.js';
import Invite from '../models/inviteModel.js';
import Campaign from '../models/campaignModel.js';
import Application from '../models/applicationModel.js';
import { getYoutubeStats } from '../config/youtubeHelper.js';
import { getInstagramStats } from '../config/instagramHelper.js';
import Review from '../models/reviewModel.js'; // ✅ Importante para as tags
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getTwitchStats } from '../config/twitchHelper.js'; // Novo
import { getTikTokStats } from '../config/tiktokHelper.js'; // Novo

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
        // Inicializa as promessas
        let youtubePromise = Promise.resolve(null);
        let instagramPromise = Promise.resolve(null);
        let twitchPromise = Promise.resolve(null);
        let tiktokPromise = Promise.resolve(null);

        // Dispara chamadas apenas se o link existir
        if (influencer.social?.youtube) youtubePromise = getYoutubeStats(influencer.social.youtube);
        if (influencer.social?.instagram) instagramPromise = getInstagramStats(influencer.social.instagram);
        if (influencer.social?.twitch) twitchPromise = getTwitchStats(influencer.social.twitch);
        if (influencer.social?.tiktok) tiktokPromise = getTikTokStats(influencer.social.tiktok);

        // Aguarda todas (usando allSettled para que uma falha não trave as outras)
        const [youtubeResult, instagramResult, twitchResult, tiktokResult] = await Promise.allSettled([
            youtubePromise, instagramPromise, twitchPromise, tiktokPromise
        ]);

        const responseData = influencer.toObject();

        // --- LÓGICA DE SOMA (AGREGAÇÃO) ---
        let totalFollowers = 0;
        let totalViews = 0;
        let totalLikes = 0;
        let engagementSum = 0;
        let platformsWithEngagement = 0;

        // Função auxiliar para somar dados de forma segura
        const aggregateData = (stats) => {
            if (!stats) return;

            // 1. Seguidores (Inscritos + Followers)
            const followers = Number(stats.subscriberCount || stats.followers || 0);
            totalFollowers += followers;

            // 2. Visualizações (Views Totais ou Médias dependendo da API)
            // Twitch e YT tem totalViews/viewCount. Instagram/TikTok as vezes tem avgViews.
            const views = Number(stats.viewCount || stats.totalViews || stats.avgViews || 0);
            totalViews += views;

            // 3. Curtidas (Likes ou AvgLikes)
            const likes = Number(stats.likes || stats.avgLikes || 0);
            totalLikes += likes;

            // 4. Taxa de Engajamento (Para média)
            const er = Number(stats.engagementRate || 0);
            if (er > 0) {
                engagementSum += er;
                platformsWithEngagement++;
            }
        };

        // Adiciona dados individuais e soma no total
        if (youtubeResult.status === 'fulfilled' && youtubeResult.value) {
            responseData.youtubeStats = youtubeResult.value;
            aggregateData(youtubeResult.value);
        }
        if (instagramResult.status === 'fulfilled' && instagramResult.value) {
            responseData.instagramStats = instagramResult.value;
            aggregateData(instagramResult.value);
        }
        if (twitchResult.status === 'fulfilled' && twitchResult.value) {
            responseData.twitchStats = twitchResult.value;
            aggregateData(twitchResult.value);
        }
        if (tiktokResult.status === 'fulfilled' && tiktokResult.value) {
            responseData.tiktokStats = tiktokResult.value;
            aggregateData(tiktokResult.value);
        }

        // Calcula a média de engajamento (Ex: (5% + 3%) / 2 = 4%)
        const avgEngagement = platformsWithEngagement > 0 
            ? (engagementSum / platformsWithEngagement).toFixed(2) 
            : 0;

        // ✅ INJETA OS DADOS SOMADOS NA RESPOSTA
        // O Frontend poderá acessar via: influencer.aggregatedStats.followers
        responseData.aggregatedStats = {
            followers: totalFollowers,
            views: totalViews,
            likes: totalLikes,
            engagementRate: Number(avgEngagement),
            platformsActive: platformsWithEngagement
        };

        // Atualiza campos raiz do influenciador com os totais calculados (opcional, para facilitar exibição rápida)
        responseData.followersCount = totalFollowers; 
        responseData.engagementRate = Number(avgEngagement);
        responseData.views = totalViews;
        responseData.curtidas = totalLikes;

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
    // Busca TODOS os influenciadores no banco de dados, sem filtro de agente
    const influencers = await Influencer.find({}).lean(); 
    
    if (influencers && influencers.length > 0) {
        const influencersWithData = await Promise.all(influencers.map(async (inf) => {
            // Busca reviews para calcular a nota real
            const reviews = await Review.find({ influencer: inf._id }).select('tags rating');

            // Calcula média
            const totalRating = reviews.reduce((acc, curr) => acc + curr.rating, 0);
            const avgRating = reviews.length > 0 ? (totalRating / reviews.length) : 0;

            // Calcula Tags
            const tagCounts = {};
            reviews.forEach(review => {
                if (review.tags && Array.isArray(review.tags)) {
                    review.tags.forEach(tag => {
                        const normalizedTag = tag.trim(); 
                        tagCounts[normalizedTag] = (tagCounts[normalizedTag] || 0) + 1;
                    });
                }
            });

            const topTags = Object.entries(tagCounts)
                .sort(([, countA], [, countB]) => countB - countA) 
                .slice(0, 3) 
                .map(([tag]) => tag); 

            return {
                ...inf,
                avaliacao: avgRating || inf.avaliacao || 0, // Nota real ou 0
                tags: topTags,
                // Mapeia para o frontend
                id: inf._id,
                nome: inf.name,
                nomeReal: inf.realName,
                imagem: inf.profileImageUrl,
                imagemFundo: inf.backgroundImageUrl,
                categorias: inf.niches || [],
                engajamento: inf.engagementRate || 0,
                inscritos: inf.followersCount || 0,
                qtdAvaliacoes: reviews.length
            };
        }));

        res.status(200).json(influencersWithData);
    } else {
        // Retorna array vazio em vez de erro 404 para não quebrar o map do frontend
        res.status(200).json([]);
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

// controllers/influencerController.js

export const getInfluencersByAgent = asyncHandler(async (req, res) => {
    const { agentId } = req.params;
    
    // CORREÇÃO: Retornamos os dados necessários e garantimos que niches e imagens venham.
    // Se quiser retornar TUDO, basta remover o .select
    const influencers = await Influencer.find({ agent: agentId })
        .select('name profileImageUrl realName social niches agent'); 

    // CORREÇÃO: Retorna array vazio em vez de erro 404 se não encontrar nada
    // Isso evita que o frontend trate como "Erro de API"
    if (influencers) {
        res.status(200).json(influencers);
    } else {
        res.status(200).json([]); 
    }
});

export const summarizeInfluencerBio = asyncHandler(async (req, res) => {
  const { text } = req.body;

  if (!text) {
    res.status(400);
    throw new Error("Texto para resumo não fornecido.");
  }

  try {
    const apiKey = process.env.GROQ_API_KEY; 
    
    const url = "https://api.groq.com/openai/v1/chat/completions";

    const response = await axios.post(url, {
      // ✅ MODELO ATUALIZADO (O Llama 3.3 é o mais atual e potente)
      model: "llama-3.3-70b-versatile", 
      messages: [
        { 
          role: "system", 
          content: "Você é um especialista em Marketing de Influência. Resuma o perfil a seguir em Português do Brasil de forma sucinta, tente demonstrar informações importantes para possíveis anunciantes interesssados, entenda o influenciador, e diga a sua opinião de que tipo de publicidade mais se encaixa com ele. Foco: Nicho e estilo. foque bastante em dar sua avaliação e sugestão ao publicitário. maximo de 10 linhas, não use forma de destacar as palavras pq nao funciona" 
        },
        { role: "user", content: text }
      ],
      temperature: 0.5
    }, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    const summary = response.data?.choices?.[0]?.message?.content;

    if (summary) {
        res.status(200).json({ summary });
    } else {
        throw new Error("Resposta da IA vazia.");
    }

  } catch (error) {
    console.error("Erro na IA (Groq):", error?.response?.data || error.message);
    
    // Resposta de fallback para não quebrar o frontend
    res.status(200).json({ 
        summary: "Resumo indisponível no momento, mas o perfil está ativo e verificado." 
    });
  }
});
export const analyzeInfluencerStats = asyncHandler(async (req, res) => {
  // ✅ Agora extraímos também a 'bio'
  const { stats, bio } = req.body;

  if (!stats) {
    res.status(400);
    throw new Error("Dados estatísticos não fornecidos.");
  }

  try {
    const apiKey = process.env.GROQ_API_KEY; 
    const url = "https://api.groq.com/openai/v1/chat/completions";

    const statsString = JSON.stringify(stats);
    // Limita o tamanho da bio para não estourar tokens se for muito grande
    const bioString = bio ? bio.substring(0, 500) : "Não informada"; 

    // ✅ PROMPT ATUALIZADO: Cruzamento de Bio + Dados
    const prompt = `
      Atue como um Estrategista Sênior de Marketing.
      
      CONTEXTO DO INFLUENCIADOR:
      - Biografia/Nicho Declarado: "${bioString}"
      - Métricas Reais (Dados Brutos): ${statsString}

      TAREFA:
      Gere um "Relatório de Performance e Alinhamento" detalhado em Português do Brasil.

      DIRETRIZES:
      1. Coerência: Analise se os números sustentam a autoridade do influenciador no nicho citado na bio.
      2. Saúde da Base: Avalie a proporção de seguidores vs engajamento.
      3. Recomendação: Sugira qual tipo de marca se beneficiaria mais (ex: se o foco é gamer na bio e os números da Twitch são altos, sugira periféricos/jogos).
      4. Tom: Profissional, estratégico e direto.
      5. Formatação: Use parágrafos claros. Sem markdown complexo.
    `;

    const response = await axios.post(url, {
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: "Você é um consultor especialista em validar influenciadores para grandes marcas." },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 800 // Mais espaço para a análise combinada
    }, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    const analysis = response.data?.choices?.[0]?.message?.content;

    if (analysis) {
        res.status(200).json({ analysis });
    } else {
        throw new Error("IA não retornou análise.");
    }

  } catch (error) {
    console.error("Erro na Análise (Groq):", error?.response?.data || error.message);
    res.status(200).json({ 
        analysis: "Análise indisponível. Recomendamos verificar manualmente se o conteúdo do influenciador está alinhado com as métricas apresentadas." 
    });
  }
});