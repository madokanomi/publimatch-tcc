import axios from 'axios';

/**
 * Extrai o identificador do canal a partir de várias URLs possíveis
 * Suporta:
 * - https://www.youtube.com/@handle (Retorna: @handle)
 * - https://www.youtube.com/channel/UCxxxx (Retorna: UCxxxx)
 * - https://www.youtube.com/user/username (Retorna: username)
 */
export const extractYoutubeId = (url) => {
    if (!url) return null;

    // Remove query params (?si=...) e espaços
    const cleanUrl = url.split('?')[0].trim();

    // Caso 1: Handle (@kenforrest)
    const handleMatch = cleanUrl.match(/@[\w\d_.-]+/);
    if (handleMatch) return { type: 'handle', value: handleMatch[0] };

    // Caso 2: Channel ID (UC...)
    const channelMatch = cleanUrl.match(/channel\/(UC[\w-]+)/);
    if (channelMatch) return { type: 'id', value: channelMatch[1] };

    // Caso 3: Username legado (/user/nome)
    const userMatch = cleanUrl.match(/user\/([\w\d_-]+)/);
    if (userMatch) return { type: 'username', value: userMatch[1] };

    return null;
};

export const getYoutubeStats = async (url) => {
    const identifier = extractYoutubeId(url);
    
    if (!identifier) return null;

    const apiKey = process.env.YOUTUBE_API_KEY; // Lembre de colocar no .env
    const baseUrl = 'https://www.googleapis.com/youtube/v3/channels';
    
    let params = {
        part: 'statistics',
        key: apiKey
    };

    // Ajusta o parametro baseado no tipo de ID encontrado
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
            const stats = response.data.items[0].statistics;
            return {
                viewCount: stats.viewCount,
                subscriberCount: stats.subscriberCount,
                videoCount: stats.videoCount,
                hiddenSubscriberCount: stats.hiddenSubscriberCount
            };
        }
        return null;
    } catch (error) {
        console.error('Erro ao buscar dados do YouTube:', error.message);
        return null;
    }
};