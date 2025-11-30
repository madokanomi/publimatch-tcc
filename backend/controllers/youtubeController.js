// controllers/youtubeController.js

import asyncHandler from 'express-async-handler';
// Ajuste o caminho se necessário
import { checkYoutubeHashtag } from '../config/youtubeHelper.js';
// Não precisamos mais do model aqui
// import Influencer from '../models/influencerModel.js'; 

export const checkCampaignHashtag = asyncHandler(async (req, res) => {
    const { channelUrl, hashtag, influencerId } = req.body;

    if (!channelUrl || !hashtag || !influencerId) {
        res.status(400);
        throw new Error('A URL do Canal, a Hashtag e o ID do Influenciador são obrigatórios.');
    }

    // ✨ MUDANÇA AQUI: 'data' agora é um objeto { count, totalViews }
    const data = await checkYoutubeHashtag(channelUrl, hashtag);

    if (data === null) {
        res.status(500);
        throw new Error('Falha ao verificar o YouTube. Verifique a quota da API Key ou se a URL do canal é válida.');
    }

    // ✨ MUDANÇA AQUI: Retornamos os dois valores para o frontend
    res.status(200).json({ 
        influencerId: influencerId, 
        count: data.count, 
        totalViews: data.totalViews 
    });
});