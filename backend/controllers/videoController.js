import asyncHandler from 'express-async-handler';
import { processarVideoUniversal } from '../config/videoService.js'; // Importação do arquivo acima

// @desc    Analisa qualquer link de vídeo (Insta/YT/TikTok) e retorna transcrição
// @route   POST /api/video/analyze-link
// @access  Private
export const analyzeLink = asyncHandler(async (req, res) => {
    const { link, influencerId } = req.body;

    if (!link) {
        res.status(400);
        throw new Error('O link do vídeo é obrigatório.');
    }

    // Aqui chamamos o serviço pesado
    const transcript = await processarVideoUniversal(link);

    // Opcional: Aqui você pode salvar essa transcrição no banco se quiser
    // const influencer = await Influencer.findById(influencerId);
    // ... lógica de salvar ...

    res.status(200).json({
        success: true,
        transcript: transcript
    });
});