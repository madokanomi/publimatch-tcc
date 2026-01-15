import asyncHandler from 'express-async-handler';
import { checkYoutubeHashtag, getVideoTranscript } from '../config/youtubeHelper.js';
import { checkTiktokHashtag } from '../config/tiktokHelper.js'; 

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
    let finalVideos = []; 

    // ✨ Executa as checagens em PARALELO (Promise.all) para ser rápido
    const promises = [];

    if (channelUrl) {
        promises.push(checkYoutubeHashtag(channelUrl, hashtag)
            .then(data => data || { count: 0, totalViews: 0, videos: [] })
            .catch(() => ({ count: 0, totalViews: 0, videos: [] }))
        );
    }

    if (tiktokUrl) {
        // Tiktok helper apenas placeholder por enquanto
        promises.push(checkTiktokHashtag(tiktokUrl, hashtag)
            .then(data => data || { count: 0, totalViews: 0, videos: [] })
            .catch(() => ({ count: 0, totalViews: 0, videos: [] }))
        );
    }

    const results = await Promise.all(promises);

    // Soma tudo e junta vídeos
    results.forEach(result => {
        finalCount += result.count;
        finalViews += result.totalViews;
        if (result.videos && Array.isArray(result.videos)) {
            finalVideos = [...finalVideos, ...result.videos];
        }
    });

    res.status(200).json({ 
        influencerId: influencerId, 
        count: finalCount, 
        totalViews: finalViews,
        videos: finalVideos,
        // Opcional: retornar detalhes por rede se quiser debug
        details: { youtube: results[0], tiktok: results[1] } 
    });
});

export const fetchVideoTranscript = asyncHandler(async (req, res) => {
    const { videoId } = req.body;

    if (!videoId) {
        res.status(400);
        throw new Error('Video ID é obrigatório.');
    }

    const transcript = await getVideoTranscript(videoId);

    if (!transcript) {
        res.status(404);
        throw new Error('Transcrição não disponível para este vídeo (pode não ter legendas).');
    }

    res.status(200).json({ 
        videoId,
        transcript 
    });
});