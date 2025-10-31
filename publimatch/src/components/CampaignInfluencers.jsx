import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Box, Typography, Avatar, LinearProgress, CircularProgress, Tooltip, IconButton
} from "@mui/material";
import { Instagram, YouTube, Twitter, StarRounded, Chat as ChatIcon } from "@mui/icons-material";
import { FaTwitch, FaTiktok } from 'react-icons/fa';
import { useAuth } from "../auth/AuthContext";
import axios from "axios";
import ReviewInfluencer from './ReviewInfluencer';
import { useConversation } from '../scenes/chat/ConversationContext';

const SocialIcon = ({ network }) => {
    const iconStyle = { color: "rgba(255,255,255,0.7)", fontSize: '20px' };
    switch (network) {
        case "instagram": return <Tooltip title="Instagram"><Instagram sx={iconStyle} /></Tooltip>;
        case "youtube": return <Tooltip title="YouTube"><YouTube sx={iconStyle} /></Tooltip>;
        case "twitter": return <Tooltip title="Twitter"><Twitter sx={iconStyle} /></Tooltip>;
        case "twitch": return <Tooltip title="Twitch"><FaTwitch style={iconStyle} /></Tooltip>;
        case "tiktok": return <Tooltip title="TikTok"><FaTiktok style={iconStyle} /></Tooltip>;
        default: return null;
    }
};

const CampaignInfluencers = ({ campaign }) => {
    const [participants, setParticipants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [reviewingInfluencer, setReviewingInfluencer] = useState(null);
    
    // ✨ NOVO: Estado para guardar os IDs dos influenciadores já avaliados.
    // Usamos um Set para uma verificação de existência mais rápida (O(1)).
    const [reviewedIds, setReviewedIds] = useState(new Set());

    const { user } = useAuth();
    const navigate = useNavigate();

    const { setSelectedConversation, setConversations, conversations } = useConversation();

    useEffect(() => {
        const fetchData = async () => {
            if (!campaign?._id || !user?.token) {
                setLoading(false);
                return;
            }
            try {
                setLoading(true);
                const config = { headers: { Authorization: `Bearer ${user.token}` } };
                
                // ✨ Fazemos duas chamadas em paralelo para otimizar o carregamento ✨
                const [participantsResponse, reviewedResponse] = await Promise.all([
                    axios.get(`http://localhost:5001/api/campaigns/${campaign._id}/participants`, config),
                    axios.get(`http://localhost:5001/api/reviews/campaign/${campaign._id}/my-reviews`, config)
                ]);

                // Processa a lista de participantes
                const augmentedData = participantsResponse.data.map(influencer => ({
                    ...influencer,
                    randomStats: {
                        views: (Math.random() * (campaign.minViews / 100000 || 5) + 1).toFixed(1),
                        publications: Math.floor(Math.random() * 20) + 5,
                        platform: ["Stories, Vídeos", "Reels, Posts", "Vídeos Longos"][Math.floor(Math.random() * 3)],
                        conversion: Math.floor(Math.random() * 50) + 40,
                    }
                }));
                setParticipants(augmentedData);

                // ✨ Processa a lista de IDs de avaliados e guarda no estado
                setReviewedIds(new Set(reviewedResponse.data));

            } catch (err) {
                setError(err.response?.data?.message || "Erro ao buscar dados da campanha.");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [campaign, user]);

    const handleStartChat = async (agentId) => {
        // 1. Impede que o AD_AGENT (você) inicie um chat consigo mesmo
        if (agentId === user._id) {
            console.warn("Você não pode iniciar um chat consigo mesmo.");
            return;
        }

        try {
            // 2. Pega o token para a requisição
            const config = {
                headers: { Authorization: `Bearer ${user.token}` },
            };

            // 3. Usa a rota 'ensure' e o body 'userId' (como no seu exemplo)
            const { data: conversationData } = await axios.post(
                `http://localhost:5001/api/chat/ensure`, 
                { userId: agentId }, // O corpo da requisição com o ID do agente
                config
            );

            // 4. Atualiza o Contexto global do chat (como no seu exemplo)
            const conversationExists = conversations.some(c => c._id === conversationData._id);
            if (!conversationExists) {
                setConversations(prevConvos => [conversationData, ...prevConvos]);
            }
            setSelectedConversation(conversationData);

            // 5. Navega para a página de conversa (com a URL singular 'conversa' do seu exemplo)
            navigate(`/conversa/${conversationData._id}`);

        } catch (error) {
            console.error("Erro ao garantir ou criar a conversa:", error);
            // Você pode adicionar um snackbar de erro aqui, se quiser
        }
    };

    const gridTemplate = "2.5fr 1.5fr 1.5fr 1fr 1.5fr 1fr";
    const primaryPink = "rgb(255, 0, 212)"; 
    const lightPinkBg = "rgba(255, 0, 212, 0.2)";

    if (reviewingInfluencer) {
        return (
            <ReviewInfluencer 
                influencer={reviewingInfluencer}
                campaign={campaign}
                onClose={() => setReviewingInfluencer(null)}
            />
        );
    }

    if (loading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;
    }
    if (error) {
        return <Typography color="error" sx={{ textAlign: 'center', p: 4 }}>{error}</Typography>;
    }
    
    return (
        <Box
            sx={{
                backgroundColor: "rgba(20, 1, 19, 0.6)", p: 3, borderRadius: "12px",
                border: "1px solid rgba(255, 255, 255, 0.1)", height: '100%', overflowY: 'auto',
                "&::-webkit-scrollbar": { width: "8px" },
                "&::-webkit-scrollbar-track": { background: "rgba(0, 0, 0, 0.2)", borderRadius: "10px" },
                "&::-webkit-scrollbar-thumb": { backgroundColor: "rgba(255, 255, 255, 0.3)", borderRadius: "10px" },
                "&::-webkit-scrollbar-thumb:hover": { backgroundColor: "rgba(255, 255, 255, 0.5)" }
            }}
        >
            {/* Cabeçalho da Tabela */}
            <Box
                sx={{
                    display: "grid", gridTemplateColumns: gridTemplate, gap: 2, py: 1.5, px: 2,
                    alignItems: "center", color: "rgba(255,255,255,0.6)", fontWeight: "bold",
                    textTransform: 'uppercase', fontSize: '0.8rem',
                }}
            >
                <Typography variant="caption" fontWeight="bold">Nome</Typography>
                <Typography variant="caption" fontWeight="bold">Visualizações</Typography>
                <Typography variant="caption" fontWeight="bold">Publicações</Typography>
                <Typography variant="caption" fontWeight="bold">Redes Sociais</Typography>
                <Typography variant="caption" fontWeight="bold">Realizado em</Typography>
                <Typography variant="caption" fontWeight="bold">Conversão</Typography>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: '12px', mt: 2 }}>
                {participants.length > 0 ? (
                    participants.map((influencer) => (
                        <Box key={influencer._id} sx={{ 
                            position: 'relative', backgroundColor: "rgba(255, 255, 255, 0.05)",
                            borderRadius: "16px", overflow: 'hidden', transition: 'background-color 0.3s',
                            '&:hover': { backgroundColor: "rgba(255, 255, 255, 0.1)" }
                        }}>
                            <Box sx={{
                                display: "grid", gridTemplateColumns: gridTemplate, gap: 2,
                                py: 2, px: 2, alignItems: "center",
                            }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Avatar src={influencer.profileImageUrl} alt={influencer.name} sx={{ width: 48, height: 48, borderRadius: "12px" }} variant="rounded" />
                                    <Box>
                                        <Typography color="white" fontWeight="bold">{influencer.name}</Typography>
                                        
                                        {/* ✨ LÓGICA CONDICIONAL PARA O BOTÃO ✨ */}
                                        {/* O botão só aparece se o ID do influencer NÃO estiver na lista de avaliados */}
                                        {!reviewedIds.has(influencer._id) ? (
                                            <Box 
                                                onClick={() => setReviewingInfluencer(influencer)}
                                                sx={{
                                                    display: 'inline-flex', alignItems: 'center', gap: 0.5,
                                                    backgroundColor: 'rgba(179, 105, 245, 0.15)', borderRadius: '6px',
                                                    px: 1, py: 0.25, mt: 0.5, cursor: 'pointer',
                                                    transition: 'background-color 0.3s',
                                                    '&:hover': { backgroundColor: 'rgba(179, 105, 245, 0.3)' }
                                                }}>
                                                <StarRounded sx={{ fontSize: '16px', color: 'white' }} />
                                                <Typography variant="caption" sx={{ color: 'white', fontWeight: 500 }}>
                                                    Avaliar influenciador
                                                </Typography>
                                            </Box>
                                        ) : (
                                            // Opcional: Mostrar um feedback de que já foi avaliado
                                            <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, px: 1, py: 0.25, mt: 0.5 }}>
                                                <StarRounded sx={{ fontSize: '16px', color: 'rgb(255, 0, 212)' }} />
                                                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>
                                                    Avaliado
                                                </Typography>
                                            </Box>
                                        )}
                                    </Box>
                                </Box>

                                <Typography color="white" fontWeight="bold">{influencer.randomStats.views}M</Typography>
                                <Typography color="white" fontWeight="bold">{influencer.randomStats.publications}</Typography>
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                    {Object.keys(influencer.social || {}).filter(key => influencer.social[key]).map(net => <SocialIcon key={net} network={net} />)}
                                </Box>
                                <Typography color="white" fontWeight="bold">{influencer.randomStats.platform}</Typography>
                                <Typography color={primaryPink} fontWeight="bold">{influencer.randomStats.conversion}%</Typography>
                            </Box>

                            <IconButton
                              onClick={() => handleStartChat(influencer.agent)}
                              disabled={influencer.agent === user._id}
                              sx={{
                                position: 'absolute',
                                top: '50%',
                                  right: '16px',
                                transform: 'translateY(-50%)',
                                  color: 'rgba(255,255,255,0.7)',
                                  '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' },
                                  '&.Mui-disabled': { color: 'rgba(255,255,255,0.2)' },
                                width: '36px',
                                  height: '36px',
                                  padding: 0,
                                  borderRadius: '50%'
                              }}
                            >
                              <ChatIcon sx={{ fontSize: '20px' }} /> 
                            </IconButton>

                            <LinearProgress variant="determinate" value={influencer.randomStats.conversion} sx={{
                                position: 'absolute', bottom: 0, left: 0, width: '100%', height: '3px',
                                backgroundColor: lightPinkBg,
                                '& .MuiLinearProgress-bar': { backgroundColor: primaryPink }
                            }} />
                        </Box>
                    ))
                ) : (
                    <Typography sx={{ textAlign: 'center', color: 'rgba(255,255,255,0.7)', p: 4 }}>
                        Nenhum influenciador participando desta campanha ainda.
                    </Typography>
                )}
            </Box>
        </Box>
    );
};

export default CampaignInfluencers;