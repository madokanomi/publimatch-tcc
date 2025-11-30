// controllers/youtubeController.js

import asyncHandler from 'express-async-handler';
import { checkYoutubeHashtag } from '../config/youtubeHelper.js';
import { checkTiktokHashtag } from '../config/tiktokHelper.js'; // ✨ IMPORTAR AQUI

export const checkCampaignHashtag = asyncHandler(async (req, res) => {
    // ✨ Agora recebemos tiktokUrl também
    const { channelUrl, tiktokUrl, hashtag, influencerId } = req.body;

    if (!hashtag || !influencerId) {
        res.status(400);
        throw new Error('Hashtag e ID do Influenciador são obrigatórios.');
    }

    // Inicializa contadores
    let finalCount = 0;
    let finalViews = 0;

    // ✨ Executa as checagens em PARALELO (Promise.all) para ser rápido
    const promises = [];

    if (channelUrl) {
        promises.push(checkYoutubeHashtag(channelUrl, hashtag)
            .then(data => data || { count: 0, totalViews: 0 })
            .catch(() => ({ count: 0, totalViews: 0 }))
        );
    }

    if (tiktokUrl) {
        promises.push(checkTiktokHashtag(tiktokUrl, hashtag)
            .then(data => data || { count: 0, totalViews: 0 })
            .catch(() => ({ count: 0, totalViews: 0 }))
        );
    }

    const results = await Promise.all(promises);

    // Soma tudo
    results.forEach(result => {
        finalCount += result.count;
        finalViews += result.totalViews;
    });

    res.status(200).json({ 
        influencerId: influencerId, 
        count: finalCount, 
        totalViews: finalViews,
        // Opcional: retornar detalhes por rede se quiser debug
        details: { youtube: results[0], tiktok: results[1] } 
    });
});