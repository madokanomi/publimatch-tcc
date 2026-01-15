import axios from 'axios';

// --- LÓGICA DE MOCK/FALLBACK (Mantida do seu arquivo original) ---
const generateMockDemographics = () => {
    return {
        audienceGender: [
            { name: 'f', value: 55 + Math.random() * 10 },
            { name: 'm', value: 35 + Math.random() * 10 }
        ],
        audienceAge: [
            { name: '13_17', value: 5 + Math.random() * 5 },
            { name: '18_24', value: 25 + Math.random() * 10 },
            { name: '25_34', value: 40 + Math.random() * 10 },
            { name: '35_44', value: 15 + Math.random() * 5 },
            { name: '45_54', value: 5 + Math.random() * 2 }
        ],
        audienceCountry: [
            { name: 'BR', value: 85 + Math.random() * 10 },
            { name: 'PT', value: 2 + Math.random() * 2 },
            { name: 'US', value: 1 + Math.random() * 2 }
        ],
        qualityScore: Math.floor(70 + Math.random() * 25)
    };
};

// Esta função continua existindo para perfis NÃO conectados (Scraping/Mock)
export const getInstagramStats = async (url) => {
    if (!url) return null;
    const usernameMatch = url.match(/(?:instagram\.com\/)([\w\._]+)/);
    const username = usernameMatch ? usernameMatch[1] : null;
    if (!username) return null;

    try {
        if (process.env.RAPIDAPI_KEY) {
             // Lógica RapidAPI se existir...
        }

        // Mock Fallback
        let hash = 0;
        for (let i = 0; i < username.length; i++) hash = username.charCodeAt(i) + ((hash << 5) - hash);
        const seed = Math.abs(hash);

        const followers = (seed % 900) * 1000 + 5000; 
        const engagementRate = (2 + (seed % 30) / 10).toFixed(2);
        const avgLikes = Math.floor(followers * (engagementRate / 100));
        const avgComments = Math.floor(avgLikes * 0.05);

        return {
            followers: followers,
            following: (seed % 500) + 100,
            posts: (seed % 200) + 50,
            engagementRate: Number(engagementRate),
            avgLikes: avgLikes,
            avgComments: avgComments,
            avgViews: avgLikes * 1.5,
            ...generateMockDemographics()
        };

    } catch (error) {
        console.error("Erro Instagram Helper (Mock):", error.message);
        return null;
    }
};

// --- NOVA LÓGICA: API REAL (GRAPH API) ---
const GRAPH_API_URL = 'https://graph.facebook.com/v19.0';

export const getAuthenticatedInstagramStats = async (accessToken, instagramAccountId) => {
    try {
        if (!accessToken || !instagramAccountId) return null;

        // 1. Perfil Básico
        const profileReq = axios.get(`${GRAPH_API_URL}/${instagramAccountId}`, {
            params: {
                access_token: accessToken,
                fields: 'name,username,followers_count,media_count,profile_picture_url,biography'
            }
        });

        // 2. Mídias Recentes (para calcular engajamento real)
        const mediaReq = axios.get(`${GRAPH_API_URL}/${instagramAccountId}/media`, {
            params: {
                access_token: accessToken,
                fields: 'like_count,comments_count,media_type,timestamp',
                limit: 20 
            }
        });

        // 3. Insights (Demografia e Alcance)
        // Nota: pode falhar se a conta tiver menos de 100 seguidores
        const insightsReq = axios.get(`${GRAPH_API_URL}/${instagramAccountId}/insights`, {
            params: {
                access_token: accessToken,
                metric: 'impressions,reach,profile_views,audience_country,audience_gender_age',
                period: 'lifetime'
            },
            validateStatus: () => true // Não lança erro se falhar (ex: conta pequena)
        });

        const [profileRes, mediaRes, insightsRes] = await Promise.all([profileReq, mediaReq, insightsReq]);

        // Processamento de Engajamento
        const mediaList = mediaRes.data.data || [];
        let totalInteractions = 0;
        let totalLikes = 0;
        let totalComments = 0;

        mediaList.forEach(media => {
            const likes = media.like_count || 0;
            const comments = media.comments_count || 0;
            totalLikes += likes;
            totalComments += comments;
            totalInteractions += (likes + comments);
        });

        const avgLikes = mediaList.length ? Math.round(totalLikes / mediaList.length) : 0;
        const avgComments = mediaList.length ? Math.round(totalComments / mediaList.length) : 0;
        const followers = profileRes.data.followers_count || 1;
        const avgInteractions = mediaList.length ? (totalInteractions / mediaList.length) : 0;
        const engagementRate = ((avgInteractions / followers) * 100).toFixed(2);

        // Processamento de Insights Demográficos
        let demographics = {
            gender: [],
            age: [],
            country: [],
            impressions: 0,
            reach: 0,
            profile_views: 0
        };

        if (insightsRes.data && insightsRes.data.data) {
            insightsRes.data.data.forEach(metric => {
                if (metric.name === 'impressions') demographics.impressions = metric.values[0]?.value || 0;
                if (metric.name === 'reach') demographics.reach = metric.values[0]?.value || 0;
                if (metric.name === 'profile_views') demographics.profile_views = metric.values[0]?.value || 0;

                // Parsing da string complexa "F.18-24" do Facebook
                if (metric.name === 'audience_gender_age') {
                    const rawData = metric.values[0]?.value || {};
                    const genderMap = { 'F': 0, 'M': 0, 'U': 0 };
                    const ageMap = {};

                    Object.entries(rawData).forEach(([key, value]) => {
                        const [gender, ageRange] = key.split('.');
                        if (genderMap[gender] !== undefined) genderMap[gender] += value;
                        if (!ageMap[ageRange]) ageMap[ageRange] = 0;
                        ageMap[ageRange] += value;
                    });

                    const totalAudience = Object.values(rawData).reduce((a, b) => a + b, 0) || 1;
                    
                    demographics.gender = Object.entries(genderMap)
                        .filter(([_, val]) => val > 0)
                        .map(([name, val]) => ({ 
                            name: name === 'F' ? 'Feminino' : name === 'M' ? 'Masculino' : 'Outro', 
                            value: ((val / totalAudience) * 100).toFixed(1) 
                        }));

                    demographics.age = Object.entries(ageMap)
                        .map(([name, val]) => ({ name, value: ((val / totalAudience) * 100).toFixed(1) }))
                        .sort((a, b) => parseFloat(b.value) - parseFloat(a.value));
                }

                if (metric.name === 'audience_country') {
                    const rawData = metric.values[0]?.value || {};
                    const total = Object.values(rawData).reduce((a, b) => a + b, 0) || 1;
                    demographics.country = Object.entries(rawData)
                        .map(([name, val]) => ({ name, value: ((val / total) * 100).toFixed(1) }))
                        .sort((a, b) => parseFloat(b.value) - parseFloat(a.value));
                }
            });
        }

        // Retorno formatado igual ao Mock para não quebrar o frontend
        return {
            followers: profileRes.data.followers_count,
            mediaCount: profileRes.data.media_count,
            profilePicture: profileRes.data.profile_picture_url,
            biography: profileRes.data.biography,
            
            avgLikes,
            avgComments,
            engagementRate,
            
            impressions: demographics.impressions,
            reach: demographics.reach,
            profileViews: demographics.profile_views,
            
            audienceGender: demographics.gender,
            audienceAge: demographics.age,
            audienceCountry: demographics.country,
            qualityScore: 98 // Valor fixo alto para contas verificadas
        };

    } catch (error) {
        console.error("Erro Instagram Real API:", error.response?.data || error.message);
        throw error;
    }
};