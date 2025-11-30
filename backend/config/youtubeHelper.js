import axios from 'axios';

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

<<<<<<< HEAD
/**
 * Busca estatísticas completas, incluindo engajamento recente
 */
=======
// =======================================================
// ✨ FUNÇÃO AUXILIAR 2 (NOVA) - Custo: 1 Ponto
// =======================================================
/**
 * Pega o ID do canal (UC...) a partir de qualquer URL.
 * Reutiliza a lógica de busca do 'getYoutubeStats' mas retorna apenas o ID.
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

>>>>>>> d67e9f6 (hashtag funcionando, vou colocar pra ela ser visivel em outros lugares e arrumar a edição pra ter as coisas novas)
export const getYoutubeStats = async (url) => {
    const identifier = extractYoutubeId(url);
    if (!identifier) return null;

    const apiKey = process.env.YOUTUBE_API_KEY;
    
    // Endpoints
    const channelsUrl = 'https://www.googleapis.com/youtube/v3/channels';
    const playlistItemsUrl = 'https://www.googleapis.com/youtube/v3/playlistItems';
    const videosUrl = 'https://www.googleapis.com/youtube/v3/videos';

    try {
        // --- PASSO 1: Buscar dados do Canal e ID da Playlist de Uploads ---
        let params = {
            part: 'statistics,contentDetails', // contentDetails é necessário para achar a playlist de vídeos
            key: apiKey
        };

        if (identifier.type === 'handle') params.forHandle = identifier.value;
        else if (identifier.type === 'id') params.id = identifier.value;
        else if (identifier.type === 'username') params.forUsername = identifier.value;

        const channelRes = await axios.get(channelsUrl, { params });
        
        if (!channelRes.data.items || channelRes.data.items.length === 0) return null;

        const channelItem = channelRes.data.items[0];
        const stats = channelItem.statistics;
        const uploadsPlaylistId = channelItem.contentDetails.relatedPlaylists.uploads;

        // Dados base
        let result = {
            viewCount: stats.viewCount,
            subscriberCount: stats.subscriberCount,
            videoCount: stats.videoCount,
            hiddenSubscriberCount: stats.hiddenSubscriberCount,
            // Valores padrão caso falhe o cálculo de engajamento
            avgLikes: 0,
            avgComments: 0,
            engagementRate: 0
        };

        // Se o canal não tem vídeos ou inscritos ocultos, retornamos o básico
        if (stats.videoCount == 0 || !uploadsPlaylistId) {
            return result;
        }

        // --- PASSO 2: Buscar os IDs dos últimos 5 vídeos ---
        const playlistRes = await axios.get(playlistItemsUrl, {
            params: {
                part: 'contentDetails',
                playlistId: uploadsPlaylistId,
                maxResults: 5, // Analisar últimos 5 vídeos
                key: apiKey
            }
        });

        const videoItems = playlistRes.data.items;
        if (!videoItems || videoItems.length === 0) return result;

        const videoIds = videoItems.map(item => item.contentDetails.videoId).join(',');

        // --- PASSO 3: Buscar estatísticas detalhadas desses vídeos ---
        const videosRes = await axios.get(videosUrl, {
            params: {
                part: 'statistics',
                id: videoIds,
                key: apiKey
            }
        });

        // --- PASSO 4: Calcular Médias ---
       let totalLikes = 0;
        let totalComments = 0;
        let totalViewsRecent = 0; // ✅ Novo: Somar views recentes

        const videosData = videosRes.data.items;
        
        videosData.forEach(video => {
            totalLikes += parseInt(video.statistics.likeCount || 0);
            totalComments += parseInt(video.statistics.commentCount || 0);
            totalViewsRecent += parseInt(video.statistics.viewCount || 0); // ✅ Pegando views
        });

        const videoCountSample = videosData.length;
        
        result.avgLikes = Math.round(totalLikes / videoCountSample);
        result.avgComments = Math.round(totalComments / videoCountSample);
        const avgViews = Math.round(totalViewsRecent / videoCountSample); // ✅ Média de views

        // --- PASSO 5: Calcular Taxa de Engajamento OTIMIZADA ---
        // Lógica Antiga (Ruim): (Likes + Comments) / Inscritos -> Dá 0.2%
        // Lógica Nova (Boa): (Interações / Views Recentes) -> Dá entre 3% e 10%
        
        if (avgViews > 0) {
            const interactions = result.avgLikes + (result.avgComments * 2); // Comentário vale o dobro
            // Se quiser limitar a no máximo 100% (pra não bugar em shorts virais), usamos Math.min
            result.engagementRate = Math.min(((interactions / avgViews) * 100), 100).toFixed(2);
        } else {
             // Fallback para inscritos se não tiver view count (raro)
             const subscribers = parseInt(stats.subscriberCount);
             result.engagementRate = subscribers > 0 ? ((result.avgLikes / subscribers) * 100).toFixed(2) : 0;
        }

        return result;

    } catch (error) {
        console.error('Erro ao buscar dados do YouTube:', error.message);
        // Em caso de erro (ex: cota excedida), retorna null ou objeto vazio para não quebrar a UI
        return null;
    }
}

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
    const params = {
        part: 'id', // Só precisamos saber a contagem, 'id' é o mais leve
        key: apiKey,
        channelId: channelId, // Filtra por canal
        q: hashtag, // Filtra pela hashtag
        type: 'video', // Apenas vídeos
    };

    try {
        const response = await axios.get(searchUrl, { params });
        // O totalResults nos dá a contagem de vídeos que deram "match"
        return response.data.pageInfo.totalResults;
    } catch (error) {
        console.error('Erro ao buscar no YouTube (search.list):', error.message);
        return null;
    }
};