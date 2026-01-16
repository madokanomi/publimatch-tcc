import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// --- NOVA FUNÇÃO DE INTELIGÊNCIA ---
async function gerarAnaliseDeMarketing(textoTranscrito) {
  const promptSistema = `
    ATUE COMO: Um Diretor de Estratégia de Influência e Mídia (CMO) com 20 anos de experiência.
    
    OBJETIVO: Analisar a transcrição de um vídeo para determinar a VIABILIDADE COMERCIAL do influenciador. Não quero resumos simples. Quero uma análise crítica sobre se vale a pena investir dinheiro (Ads/Publi) neste criador.

    DIRETRIZES DE ANÁLISE:
    1. Não descreva apenas o que acontece. Analise a TÉCNICA de retenção, a clareza da comunicação e o potencial de persuasão.
    2. Seja crítico. Se o influenciador for amador, diga. Se for uma autoridade, destaque.
    3. Foque em ROI (Retorno) e Brand Safety (Segurança da Marca).

    RETORNE APENAS UM JSON VÁLIDO COM ESTA ESTRUTURA EXATA:
    {
      "resumo": "Análise do formato (ex: Storytelling, Tutorial Rápido, Vlog). Identifique se há 'Hooks' (ganchos) fortes no início e se há Call to Action (CTA).",
      "tom": "Análise da Persona. Ele(a) passa autoridade técnica ou é entretenimento puro? A dicção é clara? O tom gera conexão emocional ou é distante?",
      "brand_safety": "Auditoria de Risco. Detecte: gírias excessivas, palavrões (cite censurado), temas polêmicos, viés político ou discurso de ódio. Classifique o risco: BAIXO, MÉDIO ou ALTO.",
      "publico": "Perfil Psicográfico. Não só idade, mas: Poder de compra estimado (Classe C, B, A?), dores e desejos desse público. O que eles buscam nesse perfil?",
      "match": "Sugestão Comercial. Liste 3 nichos específicos (ex: 'Skincare de Entrada', 'Fintechs', 'Apps de Delivery') e explique brevemente o porquê do fit.",
      "veredito": "CONCLUSÃO DE INVESTIMENTO. Vale a pena contratar? É um micro-influenciador promissor ou um perfil de risco? Dê uma nota de 0 a 10 para o potencial de conversão."
    }
    `;

    try {
        const completion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: promptSistema },
                { role: "user", content: `Transcrição:\n\n"${textoTranscrito.substring(0, 25000)}"` }
            ],
            model: "llama-3.3-70b-versatile",
            temperature: 0.5, // Temperatura mais baixa ajuda a garantir JSON válido
            response_format: { type: "json_object" } // <--- O SEGREDO: FORÇA JSON
        });

        const conteudo = completion.choices[0]?.message?.content;
        
        // Faz o parse para garantir que é um Objeto JS e não uma string
        return JSON.parse(conteudo);

    } catch (error) {
        console.error("Erro na análise de IA:", error);
        // Fallback caso a IA falhe no JSON
        return {
            resumo: "Erro ao gerar análise estruturada.",
            tom: "Indisponível",
            brand_safety: "Indisponível",
            publico: "Indisponível",
            match: "Indisponível",
            veredito: "Indisponível"
        };
    }
}

// --- FUNÇÃO PRINCIPAL (JÁ EXISTENTE, COM PEQUENO AJUSTE NO FINAL) ---
export const processarVideoUniversal = async (videoUrl) => {
    const rootPath = process.cwd(); 
    const tempId = uuidv4();
    const tempDir = path.join(rootPath, 'temp');
    const cookiePath = path.join(rootPath, 'cookies.txt'); 
    const ytDlpPath = path.join(rootPath, 'yt-dlp.exe');

    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);
    if (!fs.existsSync(ytDlpPath)) throw new Error("yt-dlp.exe não encontrado na raiz.");

    console.log(`[Service] Processando: ${videoUrl}`);

    try {
        const outputTemplate = path.join(tempDir, `${tempId}.%(ext)s`);

        const args = [
            '-x', '--audio-format', 'mp3', '--no-playlist',
            '--ffmpeg-location', rootPath, '-o', outputTemplate
        ];

        if (videoUrl.includes('instagram.com')) {
            console.log('[Service] Instagram detectado.');
            args.push('--cookies', cookiePath);
        } else if (videoUrl.includes('tiktok.com')) {
            console.log('[Service] TikTok detectado.');
            videoUrl = videoUrl.split('?')[0]; 
            args.push('--user-agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
        }
        args.push(videoUrl);

        const caminhoAudio = await new Promise((resolve, reject) => {
            const process = spawn(ytDlpPath, args);
            // process.stderr.on('data', (data) => console.log(data.toString())); // Debug se precisar
            process.on('close', (code) => {
                if (code === 0) resolve(path.join(tempDir, `${tempId}.mp3`));
                else reject(new Error(`Erro yt-dlp (Código ${code})`));
            });
        });

        console.log(`[Service] Transcrevendo (Whisper)...`);
        
        const transcription = await groq.audio.transcriptions.create({
            file: fs.createReadStream(caminhoAudio),
            model: "whisper-large-v3",
            language: "pt", 
            response_format: "json",
        });

        const textoTranscrito = transcription.text;

        // --- O PULO DO GATO: AGORA CHAMAMOS A ANÁLISE ---
        console.log(`[Service] Gerando Análise de Marketing (Llama 3)...`);
        const analiseMarketing = await gerarAnaliseDeMarketing(textoTranscrito);
        
        // 3. Limpeza
        if (fs.existsSync(caminhoAudio)) fs.unlinkSync(caminhoAudio);

        // Retornamos um OBJETO agora, não só texto
        return {
            transcript: textoTranscrito,
            analysis: analiseMarketing
        };

    } catch (error) {
        console.error("[VideoService Error]", error);
        const arquivoFalha = path.join(tempDir, `${tempId}.mp3`);
        if (fs.existsSync(arquivoFalha)) fs.unlinkSync(arquivoFalha);
        throw error;
    }
};