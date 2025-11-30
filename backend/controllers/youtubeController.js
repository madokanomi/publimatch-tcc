// controllers/youtubeController.js

import asyncHandler from 'express-async-handler';
// Ajuste o caminho se necessário
import { checkYoutubeHashtag } from '../config/youtubeHelper.js';
// Não precisamos mais do model aqui
// import Influencer from '../models/influencerModel.js'; 

export const checkCampaignHashtag = asyncHandler(async (req, res) => {
    
    // 1. Vamos receber a URL e o ID diretamente do frontend
    const { channelUrl, hashtag, influencerId } = req.body;

    if (!channelUrl || !hashtag || !influencerId) {
        res.status(400);
        throw new Error('A URL do Canal, a Hashtag e o ID do Influenciador são obrigatórios.');
    }

    // 2. Não precisamos mais buscar o influenciador no banco de dados.
    // O frontend já nos enviou a 'channelUrl' que ele tinha na lista.

    // 3. Chamar nosso helper DIRETAMENTE com a URL
    const count = await checkYoutubeHashtag(channelUrl, hashtag);

    if (count === null) {
        res.status(500);
        throw new Error('Falha ao verificar o YouTube. Verifique a quota da API Key ou se a URL do canal é válida.');
    }

    // 4. Retornar a contagem E o ID (para o frontend saber qual linha atualizar)
    res.status(200).json({ influencerId: influencerId, count: count });
});