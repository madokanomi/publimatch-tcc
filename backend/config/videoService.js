import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export const processarVideoUniversal = async (videoUrl) => {
    const rootPath = process.cwd(); 
    const tempId = uuidv4();
    const tempDir = path.join(rootPath, 'temp');
    const cookiePath = path.join(rootPath, 'cookies.txt'); 
    
    // --- CORREÇÃO AQUI: Aponta diretamente para o executável na raiz ---
    const ytDlpPath = path.join(rootPath, 'yt-dlp.exe');
    // -----------------------------------------------------------------

    // Garante que a pasta temp existe
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

    // Verifica se os executáveis existem antes de tentar rodar
    if (!fs.existsSync(ytDlpPath)) {
        throw new Error("O arquivo 'yt-dlp.exe' não foi encontrado na raiz do backend.");
    }

    console.log(`[Service] Iniciando processamento universal: ${videoUrl}`);

    try {
        const outputTemplate = path.join(tempDir, `${tempId}.%(ext)s`);

        // 1. Download com yt-dlp
        const caminhoAudio = await new Promise((resolve, reject) => {
            const args = [
                '--cookies', cookiePath,
                '-x', 
                '--audio-format', 'mp3',
                '--no-playlist',
                // Força o yt-dlp a usar o ffmpeg que está na mesma pasta (se necessário)
                '--ffmpeg-location', rootPath, 
                '-o', outputTemplate,
                videoUrl
            ];

            // Usa o caminho completo do executável
            const process = spawn(ytDlpPath, args);

            process.stderr.on('data', (data) => {
                // console.log(`yt-dlp log: ${data}`); 
            });

            process.on('close', (code) => {
                if (code === 0) {
                    resolve(path.join(tempDir, `${tempId}.mp3`));
                } else {
                    reject(new Error(`Erro no yt-dlp. Código: ${code}. Verifique o console.`));
                }
            });
        });

        // 2. Transcrição Groq
       console.log(`[Service] Enviando áudio para Groq (Whisper V3)...`);
        
        try {
            const transcription = await groq.audio.transcriptions.create({
                file: fs.createReadStream(caminhoAudio),
                model: "whisper-large-v3",
                language: "pt", 
                response_format: "json",
            });

            const textoFinal = transcription.text;

            // --- AQUI ESTÁ O QUE VOCÊ QUER VER ---
            console.log("\n========================================");
            console.log("RESPOSTA DA GROQ (BACKEND):");
            console.log(textoFinal);
            console.log("========================================\n");
            // -------------------------------------

            // 3. Limpeza
            if (fs.existsSync(caminhoAudio)) fs.unlinkSync(caminhoAudio);

            return textoFinal;

        } catch (groqError) {
            console.error("Erro específico na API da GROQ:", groqError);
            throw groqError;
        }

    } catch (error) {
        console.error("[VideoService Error]", error);
        // Limpeza de emergência
        const arquivoFalha = path.join(tempDir, `${tempId}.mp3`);
        if (fs.existsSync(arquivoFalha)) fs.unlinkSync(arquivoFalha);
        throw error;
    }
};