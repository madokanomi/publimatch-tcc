import axios from 'axios';

// Função para gerar dados demográficos simulados (pois são dados privados)
// Isso garante que os gráficos fiquem bonitos para o anunciante ver o "perfil"
const generateMockDemographics = () => {
    return {
        audienceGender: [
            { name: 'f', value: 55 + Math.random() * 10 },
            { name: 'm', value: 35 + Math.random() * 10 }
        ],
        audienceAge: [
            { name: '13_17', value: 5 + Math.random() * 5 },
            { name: '18_24', value: 25 + Math.random() * 10 },
            { name: '25_34', value: 40 + Math.random() * 10 }, // Público alvo comum
            { name: '35_44', value: 15 + Math.random() * 5 },
            { name: '45_54', value: 5 + Math.random() * 2 }
        ],
        audienceCountry: [
            { name: 'BR', value: 85 + Math.random() * 10 },
            { name: 'PT', value: 2 + Math.random() * 2 },
            { name: 'US', value: 1 + Math.random() * 2 }
        ],
        qualityScore: Math.floor(70 + Math.random() * 25) // Entre 70 e 95
    };
};

export const getInstagramStats = async (url) => {
    if (!url) return null;

    // Extrair username da URL
    const usernameMatch = url.match(/(?:instagram\.com\/)([\w\._]+)/);
    const username = usernameMatch ? usernameMatch[1] : null;

    if (!username) return null;

    try {
        // --- OPÇÃO 1: Tentar uma API Gratuita/Freemium (Ex: RapidAPI) ---
        // Se você tiver uma chave RAPIDAPI_KEY no .env, tentaremos usar.
        // Caso contrário, retornaremos dados simulados para a demonstração.
        
        if (process.env.RAPIDAPI_KEY) {
            // Exemplo fictício de chamada RapidAPI (existem várias: RocketAPI, Instagram Bulk Scraper)
            /* 
            const options = {
                method: 'GET',
                url: 'https://instagram-scraper-2022.p.rapidapi.com/ig/info_username/',
                params: { user: username },
                headers: {
                    'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
                    'X-RapidAPI-Host': 'instagram-scraper-2022.p.rapidapi.com'
                }
            };
            const response = await axios.request(options);
            const user = response.data.user;
            return {
                followers: user.follower_count,
                following: user.following_count,
                posts: user.media_count,
                engagementRate: 2.5, // Algumas APIs calculam, outras não
                avgLikes: 1200, // Exemplo
                avgComments: 45,
                ...generateMockDemographics() // Mescla com demografia simulada
            };
            */
        }

        // --- OPÇÃO 2: Dados "Mockados" baseados no Influenciador (FALLBACK) ---
        // Útil para o desenvolvimento e apresentação sem custos de API.
        // Gera números aleatórios mas consistentes para parecer real.
        
        // Hash simples do username para gerar números "fixos" para o mesmo usuário
        let hash = 0;
        for (let i = 0; i < username.length; i++) hash = username.charCodeAt(i) + ((hash << 5) - hash);
        const seed = Math.abs(hash);

        const followers = (seed % 900) * 1000 + 5000; // Entre 5k e 900k
        const engagementRate = (2 + (seed % 30) / 10).toFixed(2); // Entre 2.0% e 5.0%
        const avgLikes = Math.floor(followers * (engagementRate / 100));
        const avgComments = Math.floor(avgLikes * 0.05);

        return {
            followers: followers,
            following: (seed % 500) + 100,
            posts: (seed % 200) + 50,
            engagementRate: Number(engagementRate),
            avgLikes: avgLikes,
            avgComments: avgComments,
            avgViews: avgLikes * 1.5, // Estimativa para reels/video
            ...generateMockDemographics() // Adiciona os dados gráficos
        };

    } catch (error) {
        console.error("Erro Instagram Helper:", error.message);
        return null;
    }
};