import axios from 'axios';
import ytdl from 'ytdl-core';

/**
 * Extrai o identificador do canal a partir de várias URLs possíveis
 */
export const extractYoutubeId = (url) => {
    if (!url) return null;
    const cleanUrl = url.split('?')[0].trim();

    const handleMatch = cleanUrl.match(/@[\w\d_.-]+/);
    if (handleMatch) return { type: 'handle', value: handleMatch[0] };

    const channelMatch = cleanUrl.match(/channel\/(UC[\w-]+)/);
    if (channelMatch) return { type: 'id', value: channelMatch[1] };

    const userMatch = cleanUrl.match(/user\/([\w\d_-]+)/);
    if (userMatch) return { type: 'username', value: userMatch[1] };

    return null;
};

// =======================================================
// ✨ FUNÇÃO AUXILIAR (NOVA) - Custo: 1 Ponto
// Necessária para a função checkYoutubeHashtag
// =======================================================
/**
 * Pega o ID do canal (UC...) a partir de qualquer URL.
 */
const getChannelId = async (url) => {
    const identifier = extractYoutubeId(url);
    if (!identifier) return null;

    const apiKey = process.env.YOUTUBE_API_KEY;
    const baseUrl = 'https://www.googleapis.com/youtube/v3/channels';
    
    let params = {
        part: 'id', // Só precisamos do ID
        key: apiKey
    };

    if (identifier.type === 'handle') {
        params.forHandle = identifier.value;
    } else if (identifier.type === 'id') {
        params.id = identifier.value;
    } else if (identifier.type === 'username') {
        params.forUsername = identifier.value;
    }

    try {
        const response = await axios.get(baseUrl, { params });
        if (response.data.items && response.data.items.length > 0) {
            return response.data.items[0].id; // Retorna o 'UC...' ID
        }
        return null;
    } catch (error) {
        console.error('Erro ao buscar ID do canal YouTube:', error.message);
        return null;
    }
};

// Função auxiliar para converter duração ISO 8601 (PT15M33S) para minutos
const parseDuration = (duration) => {
    const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
    if (!match) return 0;
    const hours = (parseInt(match[1]) || 0);
    const minutes = (parseInt(match[2]) || 0);
    const seconds = (parseInt(match[3]) || 0);
    return (hours * 60) + minutes + (seconds / 60);
};

export const getYoutubeStats = async (url) => {
    const identifier = extractYoutubeId(url);
    if (!identifier) return null;

    const apiKey = process.env.YOUTUBE_API_KEY;
    const channelsUrl = 'https://www.googleapis.com/youtube/v3/channels';
    const playlistItemsUrl = 'https://www.googleapis.com/youtube/v3/playlistItems';
    const videosUrl = 'https://www.googleapis.com/youtube/v3/videos';

    try {
        // 1. DADOS DO CANAL: Adicionamos 'brandingSettings' e 'topicDetails'
        let params = {
            part: 'statistics,contentDetails,snippet,brandingSettings,topicDetails', 
            key: apiKey
        };

        if (identifier.type === 'handle') params.forHandle = identifier.value;
        else if (identifier.type === 'id') params.id = identifier.value;
        else if (identifier.type === 'username') params.forUsername = identifier.value;

        const channelRes = await axios.get(channelsUrl, { params });
        if (!channelRes.data.items || channelRes.data.items.length === 0) return null;

        const channelItem = channelRes.data.items[0];
        const stats = channelItem.statistics;
        const snippet = channelItem.snippet;
        const branding = channelItem.brandingSettings?.channel;
        const topics = channelItem.topicDetails?.topicCategories; 
        const uploadsPlaylistId = channelItem.contentDetails.relatedPlaylists.uploads;

        // Processamento de Tópicos (Limpar URLs da Wikipedia que a API retorna)
        const cleanTopics = topics ? topics.map(t => {
            const parts = t.split('/');
            return parts[parts.length - 1].replace(/_/g, ' '); // Ex: "Lifestyle_(sociology)" -> "Lifestyle"
        }) : [];

        let result = {
            // Básicos
            viewCount: stats.viewCount,
            subscriberCount: stats.subscriberCount,
            videoCount: stats.videoCount,
            hiddenSubscriberCount: stats.hiddenSubscriberCount,
            
            // Perfil
            country: snippet.country || 'Global',
            publishedAt: snippet.publishedAt,
            description: snippet.description,
            customUrl: snippet.customUrl,
            
            // --- MARKETING INTEL (NOVOS) ---
            channelKeywords: branding?.keywords ? branding.keywords.split(' ').slice(0, 10) : [], // Top 10 palavras-chave
            mainTopics: cleanTopics, // Categorias oficiais do YouTube
            
            // Dados calculados abaixo
            avgLikes: 0,
            avgComments: 0,
            engagementRate: 0,
            uploadFrequency: "N/A", // Ex: "2 vídeos/semana"
            contentFormat: "Variado", // Ex: "Long Form", "Shorts"
            recentTags: [], // Nuvem de tags recentes
            recentVideos: []
        };

        if (stats.videoCount == 0 || !uploadsPlaylistId) return result;

        // 2. BUSCAR VÍDEOS (Aumentei para 10 para ter melhor média de frequência)
        const playlistRes = await axios.get(playlistItemsUrl, {
            params: {
                part: 'contentDetails,snippet',
                playlistId: uploadsPlaylistId,
                maxResults: 10, 
                key: apiKey
            }
        });

        const videoItems = playlistRes.data.items;
        if (!videoItems || videoItems.length === 0) return result;

        const videoDetailsMap = {};
        const videoIds = [];
        const uploadDates = []; // Para calcular frequência

        videoItems.forEach(item => {
            const vid = item.contentDetails.videoId;
            videoIds.push(vid);
            uploadDates.push(new Date(item.snippet.publishedAt));
            
            videoDetailsMap[vid] = {
                id: vid,
                title: item.snippet.title,
                thumbnail: item.snippet.thumbnails?.medium?.url,
                publishedAt: item.snippet.publishedAt,
            };
        });

        // --- CÁLCULO DE FREQUÊNCIA DE UPLOAD ---
        if (uploadDates.length > 1) {
            // Diferença em dias entre o vídeo mais recente e o mais antigo do lote
            const newest = uploadDates[0];
            const oldest = uploadDates[uploadDates.length - 1];
            const diffTime = Math.abs(newest - oldest);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
            
            const avgDaysBetween = diffDays / (uploadDates.length - 1);
            
            if (avgDaysBetween <= 1) result.uploadFrequency = "Diária (Hardcore)";
            else if (avgDaysBetween <= 3) result.uploadFrequency = "Alta (2-3 dias)";
            else if (avgDaysBetween <= 7) result.uploadFrequency = "Semanal (Regular)";
            else if (avgDaysBetween <= 14) result.uploadFrequency = "Quinzenal";
            else result.uploadFrequency = "Esporádica";
        }

        // 3. ESTATÍSTICAS DOS VÍDEOS (snippet para pegar tags, contentDetails para duração)
        const videosRes = await axios.get(videosUrl, {
            params: {
                part: 'statistics,snippet,contentDetails', // <--- ADICIONADO snippet e contentDetails
                id: videoIds.join(','),
                key: apiKey
            }
        });

        let totalLikes = 0;
        let totalComments = 0;
        let totalViewsRecent = 0;
        let totalDuration = 0;
        const allTags = new Set();

        const videosData = videosRes.data.items;
        
        // Vamos processar apenas os 5 mais recentes para o array de exibição, mas usar 10 para stats se quiser
        // Aqui mantemos a lógica de processar todos que vieram
        videosData.forEach(video => {
            const vStats = video.statistics;
            const vSnippet = video.snippet;
            const vContent = video.contentDetails;
            const basicInfo = videoDetailsMap[video.id];

            // Métricas
            totalLikes += parseInt(vStats.likeCount || 0);
            totalComments += parseInt(vStats.commentCount || 0);
            totalViewsRecent += parseInt(vStats.viewCount || 0);
            
            // Duração (para definir formato)
            const durationMins = parseDuration(vContent.duration);
            totalDuration += durationMins;

            // Coletar Tags (Marketing Intel)
            if (vSnippet.tags) {
                vSnippet.tags.slice(0, 5).forEach(tag => allTags.add(tag.toLowerCase()));
            }

            // Adiciona aos vídeos recentes (apenas os top 5 para não poluir o front)
            if (result.recentVideos.length < 5) {
                result.recentVideos.push({
                    ...basicInfo,
                    views: vStats.viewCount || 0,
                    likes: vStats.likeCount || 0,
                    comments: vStats.commentCount || 0,
                    duration: durationMins < 1 ? "Shorts" : `${Math.round(durationMins)} min`
                });
            }
        });

        // Definição de Formato do Canal
        const avgDuration = totalDuration / videosData.length;
        if (avgDuration <= 1.5) result.contentFormat = "Foco em Shorts";
        else if (avgDuration < 10) result.contentFormat = "Vídeos Curtos/Médios";
        else result.contentFormat = "Vídeos Longos (Deep Dive)";

        // Converter Set de tags para Array
        result.recentTags = Array.from(allTags).slice(0, 12); // Top 12 tags recentes

        // Médias finais
        const sampleSize = videosData.length;
        if (sampleSize > 0) {
            result.avgLikes = Math.round(totalLikes / sampleSize);
            result.avgComments = Math.round(totalComments / sampleSize);
            const avgViews = Math.round(totalViewsRecent / sampleSize);

            if (avgViews > 0) {
                const interactions = result.avgLikes + (result.avgComments * 2);
                result.engagementRate = Math.min(((interactions / avgViews) * 100), 100).toFixed(2);
            } else {
                 const subs = parseInt(stats.subscriberCount);
                 result.engagementRate = subs > 0 ? ((result.avgLikes / subs) * 100).toFixed(2) : 0;
            }
        }

        return result;

    } catch (error) {
        console.error('Erro ao buscar dados do YouTube:', error.message);
        return null;
    }
}
/**
 * Verifica contagem de views em vídeos com uma Hashtag específica
 * (Custo alto de API: ~102 pontos)
 */
export const checkYoutubeHashtag = async (channelUrl, hashtag) => {
    // 1. Encontrar o ID do canal (ex: UC...) - Custo: 1 ponto
    const channelId = await getChannelId(channelUrl);
    if (!channelId) {
        console.error("Não foi possível encontrar o Channel ID para a URL:", channelUrl);
        return null;
    }

    const apiKey = process.env.YOUTUBE_API_KEY;
    const searchUrl = 'https://www.googleapis.com/youtube/v3/search';
    
    // 2. Buscar por vídeos com a hashtag E o channelId - Custo: 100 pontos
    let searchResponse;
    try {
        searchResponse = await axios.get(searchUrl, {
            params: {
                part: 'id', // Só precisamos dos IDs dos vídeos
                key: apiKey,
                channelId: channelId,
                q: hashtag,
                type: 'video',
                maxResults: 50 // Limite da API
            }
        });
    } catch (error) {
        console.error('Erro ao buscar no YouTube (search.list):', error.message);
        return null;
    }

    const videoItems = searchResponse.data.items;
    const videoCount = videoItems.length; // Usamos length, 'totalResults' pode ser impreciso

    if (videoCount === 0) {
        return { count: 0, totalViews: 0, videos: [] }; // Nenhum vídeo encontrado
    }

    // 3. Pegar os IDs de todos os vídeos encontrados
    const videoIds = videoItems.map(item => item.id.videoId).join(',');

    // 4. Fazer UMA chamada para pegar estatísticas de TODOS os vídeos - Custo: 1 ponto
    try {
        const statsUrl = 'https://www.googleapis.com/youtube/v3/videos';
        const statsResponse = await axios.get(statsUrl, {
            params: {
                part: 'statistics,snippet', // Adicionado 'snippet' para pegar Título e Thumb
                id: videoIds,
                key: apiKey
            }
        });

        // 5. Somar as visualizações e montar lista de vídeos
        let totalViews = 0;
        const videos = [];

        statsResponse.data.items.forEach(video => {
            const views = parseInt(video.statistics.viewCount, 10);
            totalViews += views;
            
            videos.push({
                id: video.id,
                title: video.snippet.title,
                thumb: video.snippet.thumbnails?.medium?.url || video.snippet.thumbnails?.default?.url,
                views: views,
                publishedAt: video.snippet.publishedAt
            });
        });

        return { count: videoCount, totalViews: totalViews, videos: videos };

    } catch (error) {
        console.error('Erro ao buscar estatísticas dos vídeos (videos.list):', error.message);
        return null;
    }
};

/**
 * Função Auxiliar para converter stream do ytdl para Buffer
 */
const streamToBuffer = (stream) => {
    return new Promise((resolve, reject) => {
        const chunks = [];
        stream.on('data', (chunk) => chunks.push(chunk));
        stream.on('end', () => resolve(Buffer.concat(chunks)));
        stream.on('error', (err) => reject(err));
    });
};

/**
 * ✨ SCRAPING + AI AUDIO TRANSCRIPTION
 * Tenta extrair legendas via HTML. Se falhar, baixa o áudio e usa o Gemini para transcrever.
 */
export const getVideoTranscript = async (videoId) => {
    // 1. TENTATIVA RÁPIDA: Scraping de Legendas (Gratuito e Rápido)
    try {
        // Baixar o HTML da página do vídeo
        const { data: videoHtml } = await axios.get(`https://www.youtube.com/watch?v=${videoId}`);

        // Procurar pelo objeto "captionTracks" dentro do HTML
        const captionTracksRegex = /"captionTracks":(\[.*?\])/;
        const match = videoHtml.match(captionTracksRegex);

        if (!match || !match[1]) {
            throw new Error('Legendas automáticas não encontradas no HTML.');
        }

        const captionTracks = JSON.parse(match[1]);

        // Priorizar português ou inglês
        const track = captionTracks.find(t => t.languageCode === 'pt' || t.languageCode === 'pt-BR') 
                   || captionTracks.find(t => t.languageCode === 'en')
                   || captionTracks[0];

        if (!track || !track.baseUrl) {
            throw new Error('Nenhuma trilha válida encontrada.');
        }

        const { data: transcriptXml } = await axios.get(track.baseUrl);

        const cleanText = transcriptXml
            .replace(/&amp;#39;/g, "'")
            .replace(/&amp;/g, "&")
            .replace(/&quot;/g, '"')
            .replace(/<[^>]+>/g, ' ') 
            .replace(/\s+/g, ' ')
            .trim();

        return cleanText;

    } catch (scrapingError) {
        console.log(`[YouTube] Scraping falhou (${scrapingError.message}). Tentando download de áudio + Gemini...`);
        
        // 2. TENTATIVA ROBUSTA: Download de Áudio + Gemini 2.5 (Custa tokens, mais lento)
        try {
            const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
            
            // Configuração para baixar a menor qualidade de áudio possível (rápido e leve para upload)
            const audioStream = ytdl(videoUrl, { 
                quality: 'lowestaudio', 
                filter: 'audioonly' 
            });

            // Converter Stream -> Buffer -> Base64
            const audioBuffer = await streamToBuffer(audioStream);
            const base64Audio = audioBuffer.toString('base64');

            // Chamar Gemini API via REST para evitar erro de dependência '@google/genai'
            const geminiApiKey = process.env.API_KEY;
            const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`;
            
            const payload = {
                contents: [{
                    parts: [
                        { 
                            inlineData: { 
                                mimeType: 'audio/mp3', 
                                data: base64Audio 
                            } 
                        },
                        { 
                            text: "Transcreva o áudio deste vídeo em português. Se houver falas, transcreva o texto. Se for apenas música, descreva o estilo." 
                        }
                    ]
                }]
            };

            const { data } = await axios.post(geminiUrl, payload);
            
            // Extrair o texto da resposta da API REST
            const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
            
            if (!text) throw new Error("Resposta da IA vazia ou inválida.");

            return text;

        } catch (aiError) {
            console.error('[YouTube] Erro fatal na transcrição (Scraping e IA falharam):', aiError.message);
            if (aiError.response) {
                console.error('[Gemini API Error]', aiError.response.data);
            }
            return null;
        }
    }
};


// ... restante do código (getYoutubeAdvancedAnalytics, etc) permanece igual
export const getYoutubeAdvancedAnalytics = async (accessToken, channelId) => {
    if (!accessToken) return null;

    const analyticsUrl = 'https://youtubeanalytics.googleapis.com/v2/reports';
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 1000); // Últimos 30 dias
    const startDateStr = startDate.toISOString().split('T')[0];

    const commonParams = {
        ids: 'channel==MINE',
        startDate: startDateStr,
        endDate: endDate,
    };

    try {
        // Usamos Promise.all para fazer 4 requisições simultâneas (rápido)
        const [demoRes, geoRes, deviceRes, trafficRes, engagementRes] = await Promise.all([
            // 1. Demografia (Já existente)
            axios.get(analyticsUrl, {
                headers: { Authorization: `Bearer ${accessToken}` },
                params: { ...commonParams, metrics: 'viewerPercentage', dimensions: 'ageGroup,gender', sort: 'gender,ageGroup' }
            }),
            // 2. Geografia (Já existente)
            axios.get(analyticsUrl, {
                headers: { Authorization: `Bearer ${accessToken}` },
                params: { ...commonParams, metrics: 'views', dimensions: 'country', sort: '-views', maxResults: 5 }
            }),
            // 3. Tipos de Dispositivo (NOVO) - Mobile, Desktop, TV
            axios.get(analyticsUrl, {
                headers: { Authorization: `Bearer ${accessToken}` },
                params: { ...commonParams, metrics: 'views', dimensions: 'deviceType', sort: '-views' }
            }),
            // 4. Fontes de Tráfego (NOVO) - Search, Suggested, External
            axios.get(analyticsUrl, {
                headers: { Authorization: `Bearer ${accessToken}` },
                params: { ...commonParams, metrics: 'views', dimensions: 'insightTrafficSourceType', sort: '-views' }
            }),
            // 5. Engajamento Profundo (NOVO) - Shares e Subs
            axios.get(analyticsUrl, {
                headers: { Authorization: `Bearer ${accessToken}` },
                params: { ...commonParams, metrics: 'shares,subscribersGained,subscribersLost,averageViewDuration' } 
                // Sem dimension = totais do período
            })
        ]);

        // --- Processamento dos Dados ---

        // (Lógica de Age/Gender/Country anterior mantém aqui...)
        const demographics = { ageGroup: [], gender: [], countries: [], devices: [], traffic: [], engagement: {} };

        // ... processamento anterior de demo/geo ...
        if (demoRes.data.rows) {
             const ageMap = {};
             const genderMap = {};
             demoRes.data.rows.forEach(row => {
                 const age = row[0].replace('age', '');
                 const gender = row[1];
                 const value = row[2];
                 ageMap[age] = (ageMap[age] || 0) + value;
                 genderMap[gender] = (genderMap[gender] || 0) + value;
             });
             demographics.ageGroup = Object.keys(ageMap).map(k => ({ name: k, value: ageMap[k] }));
             demographics.gender = Object.keys(genderMap).map(k => ({ name: k === 'female' ? 'Feminino' : 'Masculino', value: genderMap[k] }));
        }
        if (geoRes.data.rows) {
             demographics.countries = geoRes.data.rows.map(r => ({ name: r[0], value: r[1] }));
        }

        // --- NOVOS PROCESSAMENTOS ---

        // 3. Dispositivos (Traduzindo códigos da API)
        const deviceNames = {
            'MOBILE': 'Celular', 'DESKTOP': 'PC/Note', 'TV': 'Smart TV', 'TABLET': 'Tablet', 'GAME_CONSOLE': 'Console'
        };
        if (deviceRes.data.rows) {
            demographics.devices = deviceRes.data.rows.map(r => ({
                name: deviceNames[r[0]] || r[0],
                value: r[1] // Views
            }));
        }

        // 4. Tráfego (Onde o usuário estava antes)
        const trafficNames = {
            'YT_SEARCH': 'Busca YouTube', 'RELATED_VIDEO': 'Sugeridos', 'EXT_URL': 'Externo (Google/Whats)',
            'SUBSCRIBER': 'Feed Inscritos', 'PLAYLIST': 'Playlists', 'YT_OTHER_PAGE': 'Outros'
        };
        if (trafficRes.data.rows) {
            demographics.traffic = trafficRes.data.rows.slice(0, 5).map(r => ({
                name: trafficNames[r[0]] || r[0],
                value: r[1]
            }));
        }

        // 5. Métricas Totais de Engajamento
        if (engagementRes.data.rows && engagementRes.data.rows[0]) {
            const r = engagementRes.data.rows[0];
            demographics.engagement = {
                shares: r[0],
                subsGained: r[1],
                subsLost: r[2],
                avgViewDuration: r[3] // Segundos
            };
        }

        return demographics;

    } catch (error) {
        console.error('Erro no Analytics Avançado:', error.message);
        return null;
    }
};


/**
 * Busca os comentários mais relevantes dos últimos vídeos para análise de IA
 */
export const getCommunityContext = async (accessToken, uploadsPlaylistId) => {
    try {
        // 1. Pegar os IDs dos 3 últimos vídeos enviados
        const playlistRes = await axios.get('https://www.googleapis.com/youtube/v3/playlistItems', {
            headers: { Authorization: `Bearer ${accessToken}` },
            params: {
                part: 'contentDetails',
                playlistId: uploadsPlaylistId, // ID da playlist "Uploads" que já pegamos antes
                maxResults: 3
            }
        });

        const videoIds = playlistRes.data.items.map(item => item.contentDetails.videoId);
        let allComments = [];

        // 2. Para cada vídeo, pegar os top 15 comentários (Order: RELEVANCE)
        // Usamos Promise.all para ser rápido
        const commentPromises = videoIds.map(async (videoId) => {
            try {
                const commentRes = await axios.get('https://www.googleapis.com/youtube/v3/commentThreads', {
                    headers: { Authorization: `Bearer ${accessToken}` },
                    params: {
                        part: 'snippet',
                        videoId: videoId,
                        maxResults: 15,
                        order: 'relevance', // Pega os mais curtidos/engajados, não os mais recentes
                        textFormat: 'plainText'
                    }
                });
                return commentRes.data.items.map(item => item.snippet.topLevelComment.snippet.textDisplay);
            } catch (err) {
                return []; // Se um vídeo tiver comentários desativados, ignora
            }
        });

        const results = await Promise.all(commentPromises);
        
        // Junta tudo num array único e limpa quebras de linha excessivas
        allComments = results.flat().map(c => c.replace(/\n/g, ' ').substring(0, 200)); // Limita caracteres para economizar tokens da IA

        return allComments; // Retorna array de strings

    } catch (error) {
        console.error("Erro ao buscar contexto da comunidade:", error.message);
        return [];
    }
};