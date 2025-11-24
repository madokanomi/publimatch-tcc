import axios from 'axios';

export const getInstagramStats = async (profileUrl) => {
    if (!profileUrl) return null;

    try {
        console.log(`🔍 [API Statistics] Buscando via Search para: ${profileUrl}`);

        // ALTERAÇÃO: Usamos o endpoint de busca geral, que é mais estável.
        // A documentação diz que o parâmetro 'q' aceita links de redes sociais.
        const options = {
            method: 'GET',
            url: `https://${process.env.RAPIDAPI_HOST}/community/search`, 
            params: { 
                q: profileUrl, // Passamos a URL aqui conforme documentação "Method Search"
                socialTypes: 'INST' // Filtra apenas Instagram para garantir
            }, 
            headers: {
                'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
                'X-RapidAPI-Host': process.env.RAPIDAPI_HOST
            }
        };

        const response = await axios.request(options);
        const data = response.data;

        // A resposta do método Search geralmente traz uma lista ou um objeto com paginação
        // Verificamos se há uma lista de resultados (geralmente 'list' ou 'data')
        const results = data.list || data.data || (Array.isArray(data) ? data : []);
        
        // Pegamos o primeiro resultado que corresponda ao link
        const account = results.find(item => item.url === profileUrl) || results[0];

        if (!account) {
            console.warn("⚠️ [API Statistics] Nenhum resultado encontrado na busca.");
            return null;
        }

        // --- MAPEAMENTO DE DADOS ---
        // A estrutura de retorno do "Method Search" é igual à do "Profile by ID" conforme a doc.
        
        const stats = {
            cid: account.cid, // ID único
            username: account.screenName,
            fullName: account.name,
            
            // Métricas
            followers: account.usersCount || 0,
            engagementRate: account.avgER ? (account.avgER * 100).toFixed(2) : 0,
            
            // Médias
            avgLikes: account.avgLikes || 0,
            avgComments: account.avgComments || 0,
            avgViews: account.avgViews || 0,
            
            // Qualidade
            qualityScore: account.qualityScore ? (account.qualityScore * 100).toFixed(1) : 0,
            
            // Extras
            isVerified: account.verified || false,
            profileImage: account.image,
            
            // Demografia (pode vir vazia na busca inicial, mas mapeamos caso venha)
            audienceGender: account.genders || [], 
            audienceAge: account.ages || [],
            audienceCountry: account.countries || []
        };

        console.log(`✅ [API Statistics] Sucesso para ${stats.username}. Seguidores: ${stats.followers}`);
        
        return stats;

    } catch (error) {
        console.error(`❌ [API Statistics] Erro ao buscar ${profileUrl}:`);
        if (error.response) {
            console.error(`   Status: ${error.response.status}`);
            // Mostra a mensagem da API para facilitar o debug
            console.error(`   Msg:`, JSON.stringify(error.response.data)); 
            
            // Dica caso o endpoint /community/search também falhe
            if (error.response.status === 404) {
                 console.error("   DICA: Verifique no painel do RapidAPI se o endpoint correto é '/search' ou '/api/v1/search'");
            }
        } else {
            console.error(`   Erro: ${error.message}`);
        }
        return null;
    }
};