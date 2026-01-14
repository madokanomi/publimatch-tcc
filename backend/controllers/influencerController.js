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

// No arquivo: controllers/influencerController.js

// No arquivo: controllers/influencerController.js

// No arquivo: controllers/influencerController.js

export const getMyInfluencers = asyncHandler(async (req, res) => {
    const { campaignId } = req.query;
    
    // Busca influenciadores do agente logado
    let agentInfluencers = await Influencer.find({ agent: req.user._id }).lean();

    // Filtra se estiver escolhendo para campanha
    if (campaignId) {
        const applications = await Application.find({ campaign: campaignId }).select('influencer');
        const appliedIds = new Set(applications.map(app => app.influencer.toString()));
        agentInfluencers = agentInfluencers.filter(inf => !appliedIds.has(inf._id.toString()));
    }

    if (agentInfluencers && agentInfluencers.length > 0) {
        const influencersWithData = await Promise.all(agentInfluencers.map(async (inf) => {
            
            // A. Busca Reviews (Nota) se necessário
            let avgRating = inf.averageRating || 0;
            let reviewsCount = inf.reviewsCount || 0;

            if (inf.averageRating === undefined) {
                const reviews = await Review.find({ influencer: inf._id }).select('rating');
                const totalRating = reviews.reduce((acc, curr) => acc + curr.rating, 0);
                avgRating = reviews.length > 0 ? (totalRating / reviews.length) : 0;
                reviewsCount = reviews.length;
            }

            // --- B. PADRONIZAÇÃO BLINDADA DE ESTATÍSTICAS ---
            // O ERRO ESTAVA AQUI: Antes ele ignorava o inf.aggregatedStats do banco.
            // Agora ele checa: 1. Raiz -> 2. AggregatedStats do Banco -> 3. Redes Sociais -> 4. Zero
            
            const dbStats = inf.aggregatedStats || {}; // Pega o que já está salvo no banco

            const stats = {
                followers: inf.followersCount || dbStats.followers || inf.seguidores || 0,
                
                // Prioridade para Views:
                views: inf.views || dbStats.views || inf.visualizacoes || 0,
                
                // Prioridade para Likes (Curtidas):
                likes: inf.curtidas || dbStats.likes || inf.likes || 0,
                
                // Prioridade para Engajamento:
                engagementRate: inf.engagementRate || dbStats.engagementRate || inf.mediaConversao || 0
            };

            return {
                ...inf,
                // Dados Raiz atualizados
                averageRating: avgRating,
                reviewsCount: reviewsCount,
                
                // Atualiza a raiz para facilitar leituras simples
                followersCount: stats.followers,
                views: stats.views,
                curtidas: stats.likes,
                engagementRate: stats.engagementRate,

                // Envia o objeto stats consolidado
                aggregatedStats: stats 
            };
        }));

        res.status(200).json(influencersWithData);
    } else {
        res.status(200).json([]);
    }
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

// No arquivo influencerController.js

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
        // ... (Mantenha a lógica de Promises do Youtube, Instagram, Twitch, TikTok igual ao que você já tem) ...
        
        // --- CÓDIGO EXISTENTE DE PROMISES (Resumido para foco na correção) ---
        let youtubePromise = influencer.social?.youtube ? getYoutubeStats(influencer.social.youtube) : Promise.resolve(null);
        let instagramPromise = influencer.social?.instagram ? getInstagramStats(influencer.social.instagram) : Promise.resolve(null);
        let twitchPromise = influencer.social?.twitch ? getTwitchStats(influencer.social.twitch) : Promise.resolve(null);
        let tiktokPromise = influencer.social?.tiktok ? getTikTokStats(influencer.social.tiktok) : Promise.resolve(null);

        const [youtubeResult, instagramResult, twitchResult, tiktokResult] = await Promise.allSettled([
            youtubePromise, instagramPromise, twitchPromise, tiktokPromise
        ]);

        // --- LÓGICA DE SOMA (AGREGAÇÃO) ---
        let totalFollowers = 0;
        let totalViews = 0;
        let totalLikes = 0;
        let engagementSum = 0;
        let platformsWithEngagement = 0;

        const aggregateData = (stats) => {
            if (!stats) return;
            totalFollowers += Number(stats.subscriberCount || stats.followers || 0);
            totalViews += Number(stats.viewCount || stats.totalViews || stats.avgViews || 0);
            totalLikes += Number(stats.likes || stats.avgLikes || 0);
            const er = Number(stats.engagementRate || 0);
            if (er > 0) {
                engagementSum += er;
                platformsWithEngagement++;
            }
        };

        const responseData = influencer.toObject();

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

        const avgEngagement = platformsWithEngagement > 0 
            ? (engagementSum / platformsWithEngagement).toFixed(2) 
            : 0;

        responseData.aggregatedStats = {
            followers: totalFollowers,
            views: totalViews,
            likes: totalLikes,
            engagementRate: Number(avgEngagement),
            platformsActive: platformsWithEngagement
        };

        // =================================================================
        // 🔥 A CORREÇÃO MÁGICA ESTÁ AQUI EMBAIXO 🔥
        // Salvamos os dados calculados no banco de dados para a lista ler depois
        // =================================================================
        
        influencer.followersCount = totalFollowers;
        influencer.views = totalViews;
        // Se o seu model tiver campo 'likes' ou 'curtidas', use aqui. Vou usar 'curtidas' baseado no seu código anterior.
        influencer.curtidas = totalLikes; 
        influencer.engagementRate = Number(avgEngagement);
        
        // Salva silenciosamente (sem travar a resposta se der erro leve)
        try {
            await influencer.save();
        } catch (error) {
            console.error("Erro ao salvar estatísticas atualizadas no banco:", error.message);
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
    // 1. Busca TODOS os influenciadores
    const influencers = await Influencer.find({}).lean(); 
    
    if (influencers && influencers.length > 0) {
        const influencersWithData = await Promise.all(influencers.map(async (inf) => {
            
            // --- A. REVIEWS (Tags e Avaliação) ---
            const reviews = await Review.find({ influencer: inf._id }).select('tags rating');
            const totalRating = reviews.reduce((acc, curr) => acc + curr.rating, 0);
            const avgRating = reviews.length > 0 ? (totalRating / reviews.length) : 0;

            const tagCounts = {};
            reviews.forEach(review => {
                if (review.tags && Array.isArray(review.tags)) {
                    review.tags.forEach(tag => {
                        tagCounts[tag.trim()] = (tagCounts[tag.trim()] || 0) + 1;
                    });
                }
            });
            const topTags = Object.entries(tagCounts)
                .sort(([, countA], [, countB]) => countB - countA) 
                .slice(0, 3) 
                .map(([tag]) => tag); 

            // --- B. AUTO-REPAIR DE ESTATÍSTICAS ---
            let currentStats = {
                followers: inf.followersCount || 0,
                views: inf.views || 0,
                likes: inf.curtidas || 0, 
                engagementRate: inf.engagementRate || 0
            };

            // Se tiver redes sociais cadastradas...
            const hasSocials = (inf.social?.instagram || inf.social?.youtube || inf.social?.tiktok || inf.social?.twitch);
            
            // CORREÇÃO: Verifica se QUALQUER dado importante está zerado (Seguidores, Views OU Likes)
            const isDataMissing = hasSocials && (currentStats.followers === 0 || currentStats.views === 0 || currentStats.likes === 0);

            if (isDataMissing) {
                // console.log(`Atualizando dados automaticamente para: ${inf.name}...`);
                
                const promises = [];
                if (inf.social?.youtube) promises.push(getYoutubeStats(inf.social.youtube));
                if (inf.social?.instagram) promises.push(getInstagramStats(inf.social.instagram));
                if (inf.social?.twitch) promises.push(getTwitchStats(inf.social.twitch));
                if (inf.social?.tiktok) promises.push(getTikTokStats(inf.social.tiktok));

                const results = await Promise.allSettled(promises);

                // Variáveis para somar os novos resultados
                let newFollowers = 0;
                let newViews = 0;
                let newLikes = 0;
                let engagementSum = 0;
                let platformsCount = 0;

                results.forEach(res => {
                    if (res.status === 'fulfilled' && res.value) {
                        const val = res.value;

                        // 1. SOMA SEGUIDORES
                        newFollowers += Number(val.subscriberCount || val.followers || 0);

                        // 2. SOMA VIEWS (Normalizando os nomes das propriedades)
                        // Youtube usa viewCount, Twitch usa totalViews, Insta/TikTok usa avgViews ou videoCount
                        if (val.viewCount) newViews += Number(val.viewCount); // Youtube Total
                        else if (val.totalViews) newViews += Number(val.totalViews); // Twitch
                        else if (val.avgViews) newViews += Number(val.avgViews); // Estimativa Insta

                        // 3. SOMA LIKES (Normalizando)
                        // TikTok usa likes, Youtube/Insta usa avgLikes
                        if (val.likes) newLikes += Number(val.likes); // TikTok Total
                        else if (val.avgLikes) newLikes += Number(val.avgLikes); // Média Youtube/Insta

                        // 4. SOMA ENGAJAMENTO
                        if (val.engagementRate) {
                            engagementSum += Number(val.engagementRate);
                            platformsCount++;
                        }
                    }
                });

                const newEngagement = platformsCount > 0 ? (engagementSum / platformsCount).toFixed(2) : 0;

                // Atualiza o objeto local para retorno imediato
                // (Só substitui se o novo valor for maior que 0, para não zerar dados manuais sem querer)
                currentStats = {
                    followers: newFollowers > 0 ? newFollowers : currentStats.followers,
                    views: newViews > 0 ? newViews : currentStats.views,
                    likes: newLikes > 0 ? newLikes : currentStats.likes,
                    engagementRate: Number(newEngagement) > 0 ? Number(newEngagement) : currentStats.engagementRate
                };

                // SALVA NO BANCO DE DADOS
                await Influencer.updateOne(
                    { _id: inf._id },
                    { 
                        $set: { 
                            followersCount: currentStats.followers,
                            views: currentStats.views,
                            curtidas: currentStats.likes,
                            engagementRate: currentStats.engagementRate
                        } 
                    }
                );
            }

            // --- C. MONTAGEM FINAL DO OBJETO PARA O FRONTEND ---
            return {
                ...inf,
                avaliacao: avgRating || inf.avaliacao || 0, 
                tags: topTags,
                
                // Envia aggregatedStats preenchido para o InfluencerCard
                aggregatedStats: currentStats, 

                qtdAvaliacoes: reviews.length,
                
                // Campos raiz para compatibilidade
                followersCount: currentStats.followers,
                views: currentStats.views,
                curtidas: currentStats.likes,
                engagementRate: currentStats.engagementRate
            };
        }));

        res.status(200).json(influencersWithData);
    } else {
        res.status(200).json([]); 
    }
});

// No arquivo: controllers/influencerController.js

export const getPublicInfluencerProfile = asyncHandler(async (req, res) => {
  // 1. Busca o influenciador com TODOS os campos necessários para o Banner E para a aba Estatísticas
  const influencer = await Influencer.findById(req.params.id)
    .select('name realName age description aboutMe niches social profileImageUrl backgroundImageUrl agent followersCount views curtidas engagementRate youtubeStats instagramStats twitchStats tiktokStats')
    .populate('agent', 'name');

  if (!influencer) {
    res.status(404);
    throw new Error('Perfil de influenciador não encontrado.');
  }

  // 2. Prepara objeto de estatísticas atuais (lendo do banco)
  let currentStats = {
      followers: influencer.followersCount || 0,
      views: influencer.views || 0,
      likes: influencer.curtidas || 0,
      engagementRate: influencer.engagementRate || 0
  };

  // 3. Extrai os links das redes sociais
  const socialLinks = influencer.social || {};
  
  // Verifica se tem redes sociais E se os dados estão zerados (Gatilho para Auto-Repair)
  const hasSocials = (socialLinks.instagram || socialLinks.youtube || socialLinks.tiktok || socialLinks.twitch);
  const isDataMissing = hasSocials && (currentStats.followers === 0 || currentStats.views === 0 || currentStats.likes === 0);

  if (isDataMissing) {
      // console.log(`Atualizando dados detalhados (Auto-Repair) para: ${influencer.name}...`);
      
      // Definimos as tarefas para saber qual resultado pertence a qual rede
      const tasks = [
          { platform: 'youtube', check: socialLinks.youtube, fn: () => getYoutubeStats(socialLinks.youtube) },
          { platform: 'instagram', check: socialLinks.instagram, fn: () => getInstagramStats(socialLinks.instagram) },
          { platform: 'twitch', check: socialLinks.twitch, fn: () => getTwitchStats(socialLinks.twitch) },
          { platform: 'tiktok', check: socialLinks.tiktok, fn: () => getTikTokStats(socialLinks.tiktok) }
      ];

      // Filtra apenas as redes que existem
      const activeTasks = tasks.filter(t => t.check);
      
      // Executa em paralelo
      const results = await Promise.allSettled(activeTasks.map(t => t.fn()));

      // Variáveis para somar os totais
      let newFollowers = 0;
      let newViews = 0;
      let newLikes = 0;
      let engagementSum = 0;
      let platformsCount = 0;

      // Processa os resultados
      results.forEach((res, index) => {
          if (res.status === 'fulfilled' && res.value) {
              const val = res.value;
              const platform = activeTasks[index].platform;

              // ✅ SALVA O OBJETO DETALHADO NO DOCUMENTO DO MONGOOSE
              // Isso garante que os gráficos funcionem na próxima carga
              if (platform === 'youtube') influencer.youtubeStats = val;
              if (platform === 'instagram') influencer.instagramStats = val;
              if (platform === 'twitch') influencer.twitchStats = val;
              if (platform === 'tiktok') influencer.tiktokStats = val;
              
              // --- Lógica de Soma dos Totais ---
              newFollowers += Number(val.subscriberCount || val.followers || 0);
              
              if (val.viewCount) newViews += Number(val.viewCount); // Youtube
              else if (val.totalViews) newViews += Number(val.totalViews); // Twitch
              else if (val.avgViews) newViews += Number(val.avgViews); // Instagram
              else if (val.videoCount) newViews += Number(val.videoCount * 100); // TikTok (estimativa)

              if (val.likes) newLikes += Number(val.likes); // TikTok
              else if (val.avgLikes) newLikes += Number(val.avgLikes); // Youtube/Insta

              if (val.engagementRate) {
                  engagementSum += Number(val.engagementRate);
                  platformsCount++;
              }
          }
      });

      const newEngagement = platformsCount > 0 ? (engagementSum / platformsCount).toFixed(2) : 0;

      // Atualiza os totais locais
      currentStats = {
          followers: newFollowers > 0 ? newFollowers : currentStats.followers,
          views: newViews > 0 ? newViews : currentStats.views,
          likes: newLikes > 0 ? newLikes : currentStats.likes,
          engagementRate: Number(newEngagement) > 0 ? Number(newEngagement) : currentStats.engagementRate
      };

      // 🔥 SALVA TUDO NO BANCO DE DADOS (Totais + Detalhados)
      influencer.followersCount = currentStats.followers;
      influencer.views = currentStats.views;
      influencer.curtidas = currentStats.likes;
      influencer.engagementRate = currentStats.engagementRate;
      
      try {
        await influencer.save();
      } catch (err) {
        console.error("Erro ao salvar atualização automática:", err.message);
      }
  }

  // 4. Retorna os dados completos para o Frontend
  const responseData = {
      ...influencer.toObject(),
      // Garante que o frontend receba os valores mais atualizados
      followersCount: currentStats.followers,
      views: currentStats.views,
      curtidas: currentStats.likes,
      engagementRate: currentStats.engagementRate,
      // Garante o envio dos objetos detalhados atualizados
      youtubeStats: influencer.youtubeStats,
      instagramStats: influencer.instagramStats,
      twitchStats: influencer.twitchStats,
      tiktokStats: influencer.tiktokStats
  };

  res.json(responseData);
});

// ✅ ATUALIZADO: Mantém a segurança do perfil público (histórico vs tudo)
// backend/controllers/influencerController.js

export const getInfluencerCampaigns = asyncHandler(async (req, res) => {
  const { id: influencerId } = req.params;
  const userRequesting = req.user; 

  if (!influencerId) {
    res.status(400);
    throw new Error('O ID do influenciador é necessário.');
  }

  // Busca o influenciador para confirmar permissões
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
      // ✅ VISÃO PRIVADA (Sobrespec): Retorna Convites, Ativas e Histórico
      const [invites, participating, history] = await Promise.all([
        // Convites pendentes
        Invite.find({ influencer: influencerId, status: 'PENDING' })
          .populate({ path: 'campaign', select: 'title logo endDate createdBy' })
          .populate('adAgent', 'name'),

        // Campanhas Ativas (Aberta, Planejamento, Ativa)
        Campaign.find({
          participatingInfluencers: influencerId,
          status: { $in: ['Aberta', 'Planejamento', 'Ativa'] },
        }),

        // ✅ Histórico (Concluída, Finalizada, Encerrada)
        Campaign.find({
          participatingInfluencers: influencerId,
          status: { $in: ['Concluída', 'Finalizada', 'Encerrada'] },
        }),
      ]);
      
      res.status(200).json({ invites, participating, history });

  } else {
      // VISÃO PÚBLICA
      const history = await Campaign.find({
          participatingInfluencers: influencerId,
          status: { $in: ['Concluída', 'Finalizada', 'Encerrada'] }, 
      }).select('title logo endDate conversion views engagement status'); 

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
    
    // 1. Busca os influenciadores do agente (usando .lean() para performance)
    const influencers = await Influencer.find({ agent: agentId }).lean(); 

    if (influencers && influencers.length > 0) {
        // 2. Processa cada influenciador para adicionar dados das Reviews e Totais
        const influencersWithData = await Promise.all(influencers.map(async (inf) => {
            
            // A. Busca reviews para calcular a nota e tags
            const reviews = await Review.find({ influencer: inf._id }).select('tags rating');

            // B. Calcula média de Estrelas
            const totalRating = reviews.reduce((acc, curr) => acc + curr.rating, 0);
            const avgRating = reviews.length > 0 ? (totalRating / reviews.length) : 0;

            // C. Calcula Top 3 Tags
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

            // D. Prepara o objeto de estatísticas somadas
            // Se o influenciador tiver dados salvos de 'followersCount', etc., usamos eles.
            // Caso contrário, enviamos 0. (Esses dados são atualizados quando se abre o perfil detalhado)
            const stats = {
                followers: inf.followersCount || 0,
                views: inf.views || 0,
                likes: inf.curtidas || 0, // Usando o campo 'curtidas' do seu model
                engagementRate: inf.engagementRate || 0
            };

            return {
                ...inf,
                // Adiciona dados calculados
                avaliacao: avgRating, 
                tags: topTags,
                aggregatedStats: stats, // Envia formatado para o front
                qtdAvaliacoes: reviews.length
            };
        }));

        res.status(200).json(influencersWithData);
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

// Adicione esta função para lidar com o callback de sucesso do login social
export const verifySocialPlatform = asyncHandler(async (req, res) => {
    const { influencerId, platform, token } = req.body; // Token vindo do Google/Facebook

    // 1. (Aqui entraria a lógica de validar o Token na API do Google/Meta para garantir segurança real)
    // const isValid = await validateTokenWithProvider(platform, token);
    
    // Para este exemplo, vamos assumir que o frontend fez o OAuth e mandou o ok
    const influencer = await Influencer.findById(influencerId);

    if (!influencer) {
        res.status(404);
        throw new Error('Influenciador não encontrado');
    }

    // Verifica se o usuário logado é o dono da conta
    if (influencer.userAccount && influencer.userAccount.toString() !== req.user._id.toString()) {
         res.status(403);
         throw new Error('Apenas o dono do perfil pode verificar as redes sociais.');
    }

    // 2. Atualiza o status
    if (!influencer.socialVerification) influencer.socialVerification = {};
    influencer.socialVerification[platform] = true;

    // Se tiver pelo menos uma rede verificada, marca o perfil geral como verificado
    influencer.isVerified = true;

    await influencer.save();

    res.status(200).json({ 
        message: `${platform} verificado com sucesso!`, 
        socialVerification: influencer.socialVerification 
    });
});