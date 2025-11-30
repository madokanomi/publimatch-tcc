import axios from 'axios';

let appAccessToken = null;

const getTwitchAccessToken = async () => {
    try {
        const response = await axios.post('https://id.twitch.tv/oauth2/token', null, {
            params: {
                client_id: process.env.TWITCH_CLIENT_ID,
                client_secret: process.env.TWITCH_CLIENT_SECRET,
                grant_type: 'client_credentials'
            }
        });
        appAccessToken = response.data.access_token;
        return appAccessToken;
    } catch (error) {
        console.error("Twitch Auth Error:", error.message);
        return null;
    }
};

export const getTwitchStats = async (url) => {
    if (!url) return null;

    // Limpa a URL para pegar só o username (ex: twitch.tv/cocielo -> cocielo)
    const cleanUrl = url.split('?')[0].replace(/\/$/, '');
    const username = cleanUrl.split('/').pop();

    if (!username) return null;

    try {
        let token = appAccessToken || await getTwitchAccessToken();
        const headers = {
            'Client-ID': process.env.TWITCH_CLIENT_ID,
            'Authorization': `Bearer ${token}`
        };

        // 1. Pegar ID do usuário
        let userRes;
        try {
            userRes = await axios.get(`https://api.twitch.tv/helix/users?login=${username}`, { headers });
        } catch (e) {
            // Se o token expirou, renova e tenta de novo
            token = await getTwitchAccessToken();
            headers['Authorization'] = `Bearer ${token}`;
            userRes = await axios.get(`https://api.twitch.tv/helix/users?login=${username}`, { headers });
        }

        if (!userRes.data.data || userRes.data.data.length === 0) return null;
        const user = userRes.data.data[0];

        // 2. Pegar Seguidores (Endpoint específico)
        const followersRes = await axios.get(`https://api.twitch.tv/helix/channels/followers?broadcaster_id=${user.id}`, { headers });
        
        // 3. Pegar Informações do Canal (Jogo, Idioma)
        const channelRes = await axios.get(`https://api.twitch.tv/helix/channels?broadcaster_id=${user.id}`, { headers });
        const channelInfo = channelRes.data.data[0];

        // 4. CORREÇÃO: Pegar vídeos recentes (VODs) para calcular views reais
        // A API de usuários retorna view_count zerado ou antigo.
        const videosRes = await axios.get(`https://api.twitch.tv/helix/videos?user_id=${user.id}&first=20&type=archive`, { headers });
        
        let recentViews = 0;
        if (videosRes.data.data) {
            recentViews = videosRes.data.data.reduce((acc, video) => acc + video.view_count, 0);
        }

        // Se recentViews for 0 (streamer não salva VODs), usamos o view_count antigo como fallback, se existir
        const displayViews = recentViews > 0 ? recentViews : user.view_count;

        return {
            followers: followersRes.data.total,
            totalViews: displayViews, // Agora representa soma dos VODs recentes ou total antigo
            description: user.description,
            profileImage: user.profile_image_url,
            lastGame: channelInfo.game_name,
            language: channelInfo.broadcaster_language,
            isLive: false // Poderia checar endpoint 'streams'
        };

    } catch (error) {
        console.error("Erro Twitch Helper:", error.response?.data || error.message);
        return null;
    }
};