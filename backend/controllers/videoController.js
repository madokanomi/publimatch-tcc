import asyncHandler from 'express-async-handler';
import { processarVideoUniversal } from '../config/videoService.js'; // Importação do arquivo acima

// @desc    Analisa qualquer link de vídeo (Insta/YT/TikTok) e retorna transcrição
// @route   POST /api/video/analyze-link
// @access  Private
export const analyzeLink = asyncHandler(async (req, res) => {
    const { link, influencerId } = req.body;

    if (!link) {
        res.status(400);
        throw new Error('Link obrigatório.');
    }

    // Agora 'resultado' é um objeto { transcript, analysis }
    const resultado = await processarVideoUniversal(link);

    res.status(200).json({
        success: true,
        transcript: resultado.transcript, // Texto puro
        analysis: resultado.analysis      // Relatório da IA
    });
});