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

/**
 * Busca estatísticas completas, incluindo engajamento recente
 */
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
};