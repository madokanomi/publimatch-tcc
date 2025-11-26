import Campaign from '../models/campaignModel.js';
import Application from '../models/applicationModel.js';
import Invite from '../models/inviteModel.js';
import Influencer from '../models/influencerModel.js';
import mongoose from 'mongoose';

export const getDashboardStats = async (req, res) => {
    try {
        const userId = req.user._id;
        const userRole = req.user.role;
        
        console.log("--- DASHBOARD DEBUG ---");
        console.log(`Usuário Logado: ${req.user.name} (${userId})`);
        console.log(`Role: ${userRole}`);

        let stats = { stat1: 0, stat2: "R$ 0", stat3: 0, stat4: 0 };

        // ==========================================================
        // LÓGICA AGÊNCIA (AD_AGENT)
        // ==========================================================
        if (userRole === 'AD_AGENT') {
            // 1. Campanhas Ativas
            // ATENÇÃO: Verifique se no banco o status é 'Ativa', 'ativa' ou 'Open'. O código busca exato.
            const activeCampaignsCount = await Campaign.countDocuments({ createdBy: userId, status: 'Ativa' });
            console.log(`[AD_AGENT] Campanhas Ativas (status='Ativa'): ${activeCampaignsCount}`);
            
            // 2. Investimento
            const campaigns = await Campaign.find({ createdBy: userId });
            console.log(`[AD_AGENT] Total de Campanhas criadas por este user: ${campaigns.length}`);
            
            const totalInvestment = campaigns.reduce((acc, curr) => {
                // Se paymentValueExact for null/undefined, soma 0
                return acc + (curr.paymentValueExact || 0);
            }, 0);

            // 3. Candidaturas Pendentes
            const campaignIds = campaigns.map(c => c._id);
            const pendingApplications = await Application.countDocuments({ campaign: { $in: campaignIds }, status: 'pendente' });
            console.log(`[AD_AGENT] Candidaturas Pendentes (status='pendente'): ${pendingApplications}`);

            // 4. Influenciadores Contratados (Participantes)
            const hiredCount = campaigns.reduce((acc, curr) => acc + (curr.participatingInfluencers ? curr.participatingInfluencers.length : 0), 0);

            stats = {
                stat1: activeCampaignsCount,
                stat2: `R$ ${totalInvestment.toLocaleString('pt-BR')}`,
                stat3: pendingApplications,
                stat4: hiredCount
            };
        }

        // ==========================================================
        // LÓGICA AGENTE DE INFLUENCIADOR (INFLUENCER_AGENT)
        // ==========================================================
      else if (userRole === 'INFLUENCER_AGENT') {
            // 1. Busca os influenciadores deste agente
            const myInfluencers = await Influencer.find({ agent: userId });
            const myInfluencersIds = myInfluencers.map(inf => inf._id);
            
            // 2. [ALTERADO] Alcance Total (Soma dos seguidores de todos os agenciados)
            const totalFollowers = myInfluencers.reduce((acc, influencer) => {
                return acc + (influencer.followersCount || 0);
            }, 0);

            // Formatação bonita (k ou M)
            let formattedReach = totalFollowers.toString();
            if (totalFollowers >= 1000000) {
                formattedReach = (totalFollowers / 1000000).toFixed(1) + 'M';
            } else if (totalFollowers >= 1000) {
                formattedReach = (totalFollowers / 1000).toFixed(1) + 'k';
            }

            // 3. Convites Pendentes
            const pendingInvites = await Invite.countDocuments({ influencer: { $in: myInfluencersIds }, status: 'PENDING' });

            // 4. Campanhas Concluídas (Baseado em jobs aprovados em campanhas fechadas)
            const approvedApps = await Application.find({ 
                influencer: { $in: myInfluencersIds }, 
                status: 'aprovada' 
            }).populate('campaign');
            
            const completedApps = approvedApps.filter(app => app.campaign?.status === 'Concluída').length;

            stats = {
                stat1: myInfluencers.length,
                stat2: formattedReach, // Agora exibe o Alcance Total (Ex: 1.5M)
                stat3: pendingInvites,
                stat4: completedApps
            };
        }

        // ==========================================================
        // LÓGICA INFLUENCIADOR (INFLUENCER)
        // ==========================================================
        else if (userRole === 'INFLUENCER') {
            // Importante: O usuário logado (User) precisa estar linkado a um perfil (Influencer)
            // através do campo userAccount no model Influencer.
            const influencerProfile = await Influencer.findOne({ userAccount: userId });
            
            if (!influencerProfile) {
                console.log("[INFLUENCER] AVISO: Usuário logado não tem perfil de influenciador associado (campo userAccount vazio ou incorreto).");
            } else {
                console.log(`[INFLUENCER] Perfil encontrado: ${influencerProfile.name}`);
                
                // Stat 1: Jobs (Application status 'aprovada')
                const activeJobs = await Application.countDocuments({ 
                    influencer: influencerProfile._id, 
                    status: 'aprovada' 
                });
                console.log(`[INFLUENCER] Jobs Aprovados: ${activeJobs}`);

                // Stat 2: Ganhos
                const myApps = await Application.find({ influencer: influencerProfile._id, status: 'aprovada' }).populate('campaign');
                const earnings = myApps.reduce((acc, app) => acc + (app.campaign?.paymentValueExact || 0), 0);

                // Stat 3: Convites (Invites status 'PENDING')
                const pendingProposals = await Invite.countDocuments({ influencer: influencerProfile._id, status: 'PENDING' });

                stats = {
                    stat1: activeJobs,
                    stat2: `R$ ${earnings.toLocaleString('pt-BR')}`,
                    stat3: pendingProposals,
                    stat4: influencerProfile.followersCount || 0
                };
            }
        }

        console.log("Stats Finais retornadas:", stats);
        res.status(200).json(stats);

    } catch (error) {
        console.error("ERRO NO DASHBOARD:", error);
        res.status(500).json({ message: 'Error fetching dashboard stats', error: error.message });
    }
};
// ... imports (Campaign, Application, Invite, Influencer, mongoose)

// @desc    Dados para o Gráfico de Barras
// @route   GET /api/dashboard/bar-chart
export const getBarChartData = async (req, res) => {
    try {
        const userId = req.user._id;
        const userRole = req.user.role;

        let data = [];

        // --- LÓGICA AGÊNCIA (AD_AGENT) ---
        // Mostra campanhas com mais candidaturas
        if (userRole === 'AD_AGENT') {
            data = await Campaign.aggregate([
                { $match: { createdBy: new mongoose.Types.ObjectId(userId) } },
                {
                    $lookup: {
                        from: 'applications',
                        localField: '_id',
                        foreignField: 'campaign',
                        as: 'apps'
                    }
                },
                { $project: { name: '$title', value: { $size: '$apps' } } }, // Padronizei a chave para "value"
                { $sort: { value: -1 } },
                { $limit: 5 }
            ]);
        }

        // --- LÓGICA AGENTE (INFLUENCER_AGENT) ---
        // Mostra os Top 5 Influenciadores com mais convites recebidos
        else if (userRole === 'INFLUENCER_AGENT') {
            // 1. Pega os IDs dos influenciadores desse agente
            const myInfluencers = await Influencer.find({ agent: userId }).select('_id');
            const myInfluencerIds = myInfluencers.map(i => i._id);

            data = await Invite.aggregate([
                { $match: { influencer: { $in: myInfluencerIds } } },
                {
                    $lookup: {
                        from: 'influencers',
                        localField: 'influencer',
                        foreignField: '_id',
                        as: 'influencerData'
                    }
                },
                { $unwind: '$influencerData' },
                {
                    $group: {
                        _id: '$influencerData._id',
                        name: { $first: '$influencerData.name' }, // Nome do Influenciador
                        value: { $sum: 1 } // Conta quantos convites
                    }
                },
                { $sort: { value: -1 } },
                { $limit: 5 }
            ]);
        }

        // Se não tiver dados, retorna array vazio
        res.status(200).json(data);

    } catch (error) {
        console.error("Erro Bar Chart:", error);
        res.status(500).json({ message: 'Erro ao buscar dados do gráfico de barras' });
    }
};

// @desc    Dados para o Gráfico de Linha
// @route   GET /api/dashboard/line-chart
export const getLineChartData = async (req, res) => {
    try {
        const userId = req.user._id;
        const userRole = req.user.role;
        
        const formattedData = {};

        // --- LÓGICA AGÊNCIA (AD_AGENT) ---
        if (userRole === 'AD_AGENT') {
            // (Lógica original de simulação de cliques baseada em views das campanhas)
            const campaigns = await Campaign.find({ 
                createdBy: userId, 
                status: { $in: ['Ativa', 'Aberta', 'Concluída'] } 
            }).limit(3).select('title views');

            campaigns.forEach(camp => {
                const points = 5;
                const dataPoints = [];
                const total = camp.views || 50; 
                for (let i = 0; i < points; i++) {
                    const date = new Date();
                    date.setDate(date.getDate() - ((points - 1 - i) * 7));
                    // Simulação simples
                    let val = Math.floor(Math.random() * (total / 3));
                    dataPoints.push({
                        name: date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
                        value: val
                    });
                }
                formattedData[camp.title] = dataPoints;
            });
        }

        // --- LÓGICA AGENTE (INFLUENCER_AGENT) ---
        // Mostra o histórico de Convites recebidos (Agrupado por status ou geral)
        else if (userRole === 'INFLUENCER_AGENT') {
            const myInfluencers = await Influencer.find({ agent: userId }).select('_id name');
            const myInfluencerIds = myInfluencers.map(i => i._id);

            // Vamos pegar os top 3 influencers para mostrar no gráfico
            const topInfluencers = myInfluencers.slice(0, 3);

            for (const influencer of topInfluencers) {
                // Busca convites reais do banco para esse influenciador
                const invites = await Invite.find({ influencer: influencer._id }).sort({ createdAt: 1 });
                
                // Se não tiver convites, gera dados zerados para não quebrar o gráfico
                const points = 5;
                const dataPoints = [];
                
                for (let i = 0; i < points; i++) {
                    const date = new Date();
                    date.setDate(date.getDate() - ((points - 1 - i) * 7)); // Semanas atrás
                    
                    // Conta quantos convites foram criados perto dessa data (simulação de agrupamento semanal simples)
                    // Num cenário real de produção, usaríamos aggregation $bucket
                    const count = invites.filter(inv => {
                        const invDate = new Date(inv.createdAt);
                        const diffTime = Math.abs(date - invDate);
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
                        return diffDays <= 3; // Margem de 3 dias
                    }).length;

                    // Se não tiver dados reais suficientes, simula um número baixo para visualização
                    const displayValue = invites.length > 0 ? count : Math.floor(Math.random() * 5);

                    dataPoints.push({
                        name: date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
                        value: displayValue
                    });
                }
                formattedData[influencer.name] = dataPoints;
            }
        }

        res.status(200).json(formattedData);

    } catch (error) {
        console.error("Erro Line Chart:", error);
        res.status(500).json({ message: 'Erro ao buscar dados do gráfico de linha' });
    }
};