// src/components/CampaignInfluencers.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Box, Typography, Avatar, LinearProgress, CircularProgress, Tooltip, IconButton
} from "@mui/material";
import { Instagram, YouTube, Twitter, StarRounded, Chat as ChatIcon, Search } from "@mui/icons-material";
import { FaTwitch, FaTiktok } from 'react-icons/fa';
import axios from "axios";

import { useAuth } from "../auth/AuthContext";
import { useConversation } from "../scenes/chat/ConversationContext";
import ReviewInfluencer from './ReviewInfluencer';

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

const formatViews = (num) => {
    if (num === 'Erro') return 'Erro';
    if (!num) return '0';
    if (num < 1000) return num;
    if (num < 1000000) return (num / 1000).toFixed(1) + 'K';
    if (num < 1000000000) return (num / 1000000).toFixed(1) + 'M';
    return (num / 1000000000).toFixed(1) + 'B';
};

const CampaignInfluencers = ({ campaign }) => {
    const [participants, setParticipants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [reviewingInfluencer, setReviewingInfluencer] = useState(null);
    const [reviewedIds, setReviewedIds] = useState(new Set());

    const countStorageKey = `yt_counts_${campaign._id}`;
    const viewsStorageKey = `yt_views_${campaign._id}`;

    const [postCounts, setPostCounts] = useState(() => {
        const savedCounts = localStorage.getItem(countStorageKey);
        return savedCounts ? JSON.parse(savedCounts) : {};
    });
    
    const [postViews, setPostViews] = useState(() => {
        const savedViews = localStorage.getItem(viewsStorageKey);
        return savedViews ? JSON.parse(savedViews) : {};
    });

    const [checkingId, setCheckingId] = useState(null);

    const { user } = useAuth();
    const navigate = useNavigate();
    const { setSelectedConversation, setConversations, conversations } = useConversation();

    // --- 1. Fetch Data ---
    useEffect(() => {
        const fetchData = async () => {
            if (!campaign?._id || !user?.token) {
                setLoading(false);
                return;
            }
            try {
                setLoading(true);
                const config = { headers: { Authorization: `Bearer ${user.token}` } };
                
                const [participantsResponse, reviewedResponse] = await Promise.all([
                    axios.get(`http://localhost:5001/api/campaigns/${campaign._id}/participants`, config),
                    axios.get(`http://localhost:5001/api/reviews/campaign/${campaign._id}/my-reviews`, config)
                ]);

                console.log("Participantes com Agent?", participantsResponse.data); // Debug

                setParticipants(participantsResponse.data);
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

    // --- 2. Lógica de Chat ---
    const handleStartChat = async (agentId) => {
        // Se o agentId vier como objeto (ex: { _id: "..." }), pegamos o _id. Se for string, usa ela.
        const targetUserId = (typeof agentId === 'object' && agentId !== null) ? agentId._id : agentId;

        console.log("Iniciando chat com ID:", targetUserId);

        if (!targetUserId) {
            alert("Erro: Influenciador sem agente vinculado.");
            return;
        }

        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            
            // Rota ensure que criamos
            const { data: conversationData } = await axios.post(
                `http://localhost:5001/api/chat/ensure`, 
                { userId: targetUserId }, 
                config
            );

            // Atualiza contexto local
            const conversationExists = conversations.some(c => c._id === conversationData._id);
            if (!conversationExists) {
                setConversations(prevConvos => [conversationData, ...prevConvos]);
            }
            
            setSelectedConversation(conversationData);
            navigate(`/conversa/${conversationData._id}`);

        } catch (error) {
            console.error("Erro ao iniciar chat:", error);
            alert("Não foi possível iniciar o chat.");
        }
    };

    // --- 3. Lógica de Verificar Hashtag ---
    const handleCheckHashtag = async (influencer) => {
        if (checkingId) return; 

        const hashtag = campaign.hashtag;
        if (!hashtag) {
            alert("Esta campanha não tem uma hashtag definida.");
            return;
        }

        const youtubeUrl = influencer.social?.youtube;
        const tiktokUrl = influencer.social?.tiktok;

        if (!youtubeUrl && !tiktokUrl) {
            alert("Este influenciador não tem YouTube nem TikTok cadastrados.");
            return;
        }

        setCheckingId(influencer._id);
        setPostCounts(prev => ({ ...prev, [influencer._id]: undefined }));
        setPostViews(prev => ({ ...prev, [influencer._id]: undefined }));

        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            
            const { data } = await axios.post(
                'http://localhost:5001/api/youtube/check-hashtag',
                { 
                    channelUrl: youtubeUrl,  
                    tiktokUrl: tiktokUrl, 
                    hashtag: hashtag,           
                    influencerId: influencer._id
                },
                config
            );
            
            setPostCounts(prev => {
                const newCounts = { ...prev, [data.influencerId]: data.count };
                localStorage.setItem(countStorageKey, JSON.stringify(newCounts));
                return newCounts;
            });
            
            setPostViews(prev => {
                const newViews = { ...prev, [data.influencerId]: data.totalViews };
                localStorage.setItem(viewsStorageKey, JSON.stringify(newViews));
                return newViews;
            });

        } catch (error) {
            console.error("Erro ao checar posts:", error);
            alert("Erro ao verificar hashtag nas redes sociais.");
            setPostCounts(prev => ({ ...prev, [influencer._id]: 'Erro' }));
            setPostViews(prev => ({ ...prev, [influencer._id]: 'Erro' }));
        } finally {
            setCheckingId(null);
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

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;
    if (error) return <Typography color="error" sx={{ textAlign: 'center', p: 4 }}>{error}</Typography>;
    
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
                                    
                                    {/* Nome e Avatar */}
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Avatar src={influencer.profileImageUrl} alt={influencer.name} sx={{ width: 48, height: 48, borderRadius: "12px" }} variant="rounded" />
                                        <Box>
                                            <Typography color="white" fontWeight="bold">{influencer.name}</Typography>
                                            
                                            {!reviewedIds.has(influencer._id) ? (
                                                <Box onClick={() => setReviewingInfluencer(influencer)} sx={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                    <StarRounded sx={{ fontSize: '16px', color: 'white' }} />
                                                    <Typography variant="caption" sx={{ color: 'white', fontWeight: 500 }}>
                                                        Avaliar influenciador
                                                    </Typography>
                                                </Box>
                                            ) : (
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                    <StarRounded sx={{ fontSize: '16px', color: 'rgb(255, 0, 212)' }} />
                                                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>
                                                        Avaliado
                                                    </Typography>
                                                </Box>
                                            )}
                                        </Box>
                                    </Box>

                                    {/* Visualizações */}
                                    {checkingId === influencer._id ? (
                                        <CircularProgress size={22} sx={{ color: 'white' }} />
                                    ) : (
                                        <Typography color="white" fontWeight="bold">
                                            {formatViews(postViews[influencer._id])}
                                        </Typography>
                                    )}

                                    {/* Publicações */}
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        {checkingId === influencer._id ? (
                                            <CircularProgress size={22} sx={{ color: 'white' }} />
                                        ) : (
                                            <Typography color="white" fontWeight="bold" sx={{ minWidth: '20px' }}>
                                                {postCounts[influencer._id] !== undefined ? postCounts[influencer._id] : 0}
                                            </Typography>
                                        )}

                                        {(influencer.social?.youtube || influencer.social?.tiktok) && (
                                            <Tooltip title="Verificar posts com a hashtag (YouTube + TikTok)">
                                                <span>
                                                    <IconButton 
                                                        size="small"
                                                        onClick={() => handleCheckHashtag(influencer)}
                                                        disabled={!!checkingId || !campaign.hashtag}
                                                        sx={{ 
                                                            color: 'rgba(255,255,255,0.7)', 
                                                            '&:hover': { bgcolor: 'rgba(255,255,255,0.1)'},
                                                            '&.Mui-disabled': { color: 'rgba(255,255,255,0.3)' }
                                                        }}
                                                    >
                                                        <Search fontSize="inherit" />
                                                    </IconButton>
                                                </span>
                                            </Tooltip>
                                        )}
                                    </Box>

                                    {/* Redes Sociais */}
                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                        {Object.keys(influencer.social || {}).filter(key => influencer.social[key]).map(net => <SocialIcon key={net} network={net} />)}
                                    </Box>
                                    
                                    {/* Realizado em */}
                                    <Typography color="white" fontWeight="bold" sx={{fontSize: '0.9rem'}}>
                                        {influencer.platform || "—"} 
                                    </Typography>

                                    {/* Conversão */}
                                    <Typography color={primaryPink} fontWeight="bold">
                                        {influencer.conversion || 0}%
                                    </Typography>
                            </Box>

                            {/* ✨ BOTÃO DE CHAT (Habilitado se tiver 'agent') */}
                            <IconButton
                              // Agora o backend manda o 'agent', então podemos passar aqui
                              onClick={() => handleStartChat(influencer.agent)}
                              
                              // Habilita se existir 'agent' e não for eu mesmo
                              disabled={!influencer.agent || influencer.agent === user._id}
                              
                              sx={{
                                position: 'absolute', top: '50%', right: '16px', transform: 'translateY(-50%)',
                                color: 'rgba(255,255,255,0.7)',
                                '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' },
                                '&.Mui-disabled': { color: 'rgba(255,255,255,0.2)' },
                                width: '36px', height: '36px', padding: 0, borderRadius: '50%'
                              }}
                            >
                              <ChatIcon sx={{ fontSize: '20px' }} /> 
                            </IconButton>

                            {/* Barra de Progresso */}
                            <LinearProgress variant="determinate" value={influencer.conversion || 0} sx={{
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