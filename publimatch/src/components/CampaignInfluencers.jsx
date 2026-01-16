import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Box, Typography, Avatar, LinearProgress, CircularProgress, Tooltip, IconButton, Collapse, Card, CardMedia, CardContent, Button, Accordion, AccordionSummary, AccordionDetails
} from "@mui/material";
import { Instagram, YouTube, Twitter, StarRounded, Chat as ChatIcon, Search, PlayArrow, AutoAwesome, ExpandMore, ExpandLess } from "@mui/icons-material";
import { FaTwitch, FaTiktok } from 'react-icons/fa';
import axios from "axios";
import { TextField, InputAdornment } from "@mui/material"; // Adicione TextField e InputAdornment
import { Link as LinkIcon } from "@mui/icons-material";
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
    const [activeTab, setActiveTab] = useState(null); // Qual rede está selecionada na expansão
    const [instagramLink, setInstagramLink] = useState(""); // Link inserido manualmente
    const [youtubeLink, setYoutubeLink] = useState(""); // Novo State
    const [tiktokLink, setTiktokLink] = useState(""); // Novo State para TikTok

    // ---------------------

    // --- State for Expansion and Video Data ---
    const [expandedInfluencerId, setExpandedInfluencerId] = useState(null);
    const [influencerVideos, setInfluencerVideos] = useState({}); // Map: influencerId -> [videos]
    const [selectedVideoAnalysis, setSelectedVideoAnalysis] = useState(null); // Stores which video is being "analyzed"
    // ------------------------------------------

    
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
    const [analyzingLink, setAnalyzingLink] = useState(false);

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

    const handleAnalyzeAnyLink = async (influencerId, urlToAnalyze) => {
    // Validação
    if (!urlToAnalyze || urlToAnalyze.trim() === "") {
        alert("Cole um link válido primeiro.");
        return;
    }

    setAnalyzingLink(true);
    setSelectedVideoAnalysis({ 
        video: { id: 'manual-link', title: 'Link Manual', thumb: '' }, 
        status: 'loading', 
        result: '' 
    });

    try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };

 const { data } = await axios.post(
                'http://localhost:5001/api/video/analyze-link',
                { link: urlToAnalyze, influencerId: influencerId },
                config
            );

            setSelectedVideoAnalysis({ 
                video: { id: 'manual-link', title: 'Link Processado', thumb: '' },
                status: 'done',
                result: data.analysis, // <--- AGORA É UM OBJETO JSON, NÃO STRING
                fullTranscript: data.transcript
            });

        // Limpa os inputs
        setInstagramLink("");
        setYoutubeLink("");

    } catch (error) {
        console.error(error);
        alert("Erro ao analisar link.");
        setSelectedVideoAnalysis(null);
    } finally {
        setAnalyzingLink(false);
    }
};

    // --- 2. Lógica de Chat ---
    const handleStartChat = async (agentId) => {
        const targetUserId = (typeof agentId === 'object' && agentId !== null) ? agentId._id : agentId;

        if (!targetUserId) {
            alert("Erro: Influenciador sem agente vinculado.");
            return;
        }


        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            
            const { data: conversationData } = await axios.post(
                `http://localhost:5001/api/chat/ensure`, 
                { userId: targetUserId }, 
                config
            );

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

    // --- 3. Lógica de Verificar Hashtag (Sempre Atualiza) ---
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

            // Salva os vídeos reais retornados do backend
            setInfluencerVideos(prev => ({
                ...prev,
                [influencer._id]: data.videos || []
            }));

            // Expande automaticamente ao buscar/atualizar
            setExpandedInfluencerId(influencer._id);

        } catch (error) {
            console.error("Erro ao checar posts:", error);
            alert("Erro ao verificar hashtag nas redes sociais.");
            setPostCounts(prev => ({ ...prev, [influencer._id]: 'Erro' }));
            setPostViews(prev => ({ ...prev, [influencer._id]: 'Erro' }));
        } finally {
            setCheckingId(null);
        }
    };

    // --- 4. Toggle Expansão (Sem API) ---
    // --- 4. Toggle Expansão Atualizado ---
    const handleToggleExpand = (id) => {
        if (expandedInfluencerId === id) {
            setExpandedInfluencerId(null);
            setActiveTab(null);
        } else {
            setExpandedInfluencerId(id);
            // Define a primeira rede da campanha como ativa por padrão
            if (campaign?.requiredSocials?.length > 0) {
                setActiveTab(campaign.requiredSocials[0].toLowerCase());
            }
        }
    };

    // --- 5. Análise de Vídeo (Obter Transcrição ou Processar Áudio com IA) ---
    const handleAnalyzeVideo = async (video) => {
        if (selectedVideoAnalysis?.video?.id === video.id) return;

        setSelectedVideoAnalysis({ video, status: 'loading' });

        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            
            // Chama o backend para obter a transcrição (Seja scraping ou IA via Gemini)
            const { data } = await axios.post(
                'http://localhost:5001/api/youtube/transcript',
                { videoId: video.id },
                config
            );

            const truncatedTranscript = data.transcript.length > 500 
                ? data.transcript.substring(0, 500) + "..." 
                : data.transcript;

            setSelectedVideoAnalysis({ 
                video, 
                status: 'done',
                result: `Análise realizada!\n\n"${truncatedTranscript}"`,
                fullTranscript: data.transcript 
            });

        } catch (error) {
            console.error("Erro ao obter análise:", error);
            setSelectedVideoAnalysis({ 
                video, 
                status: 'done',
                result: "Não foi possível obter a transcrição deste vídeo. O vídeo pode não ter áudio claro ou ser restrito."
            });
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
                            borderRadius: "16px", overflow: 'hidden', transition: 'all 0.3s',
                            '&:hover': { backgroundColor: "rgba(255, 255, 255, 0.1)" },
                            border: expandedInfluencerId === influencer._id ? `1px solid ${primaryPink}` : '1px solid transparent'
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
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                {/* Botão de Lupa */}
                                                <Tooltip title="Buscar/Atualizar vídeos com a hashtag">
                                                    <span>
                                                        <IconButton 
                                                            size="small"
                                                            onClick={() => handleCheckHashtag(influencer)}
                                                            disabled={!!checkingId || !campaign.hashtag}
                                                            sx={{ 
                                                                color: 'rgba(255,255,255,0.7)', 
                                                                '&:hover': { bgcolor: 'rgba(255,255,255,0.1)', color: 'white' },
                                                                '&.Mui-disabled': { color: 'rgba(255,255,255,0.3)' }
                                                            }}
                                                        >
                                                            <Search fontSize="inherit" />
                                                        </IconButton>
                                                    </span>
                                                </Tooltip>
                                                
                                                {/* Botão de Expandir */}
                                                {influencerVideos[influencer._id] && (
                                                    <Tooltip title={expandedInfluencerId === influencer._id ? "Recolher" : "Expandir visualização"}>
                                                        <IconButton 
                                                            size="small"
                                                            onClick={() => handleToggleExpand(influencer._id)}
                                                            sx={{ 
                                                                color: primaryPink, 
                                                                ml: 0.5,
                                                                '&:hover': { bgcolor: 'rgba(255,255,255,0.1)'}
                                                            }}
                                                        >
                                                            {expandedInfluencerId === influencer._id ? <ExpandLess /> : <ExpandMore />}
                                                        </IconButton>
                                                    </Tooltip>
                                                )}
                                            </Box>
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

                            {/* PAINEL DE VÍDEOS (COLLAPSE) */}
                           {/* PAINEL DE CONTEÚDO (COLLAPSE) */}
<Collapse in={expandedInfluencerId === influencer._id} timeout="auto" unmountOnExit>
    <Box sx={{ 
        p: 3, 
        backgroundColor: "rgba(0,0,0,0.3)", 
        borderTop: "1px solid rgba(255,255,255,0.1)" 
    }}>
        
        {/* 1. BARRA DE SELEÇÃO DE REDE (ABAS) */}
        <Box sx={{ display: 'flex', gap: 2, mb: 3, borderBottom: '1px solid rgba(255,255,255,0.1)', pb: 1 }}>
            {campaign.requiredSocials?.map((social) => {
                const net = social.toLowerCase();
                const isActive = activeTab === net;
                
                return (
                    <Button
                        key={net}
                        onClick={() => setActiveTab(net)}
                        startIcon={<SocialIcon network={net} />}
                        sx={{
                            color: isActive ? 'white' : 'rgba(255,255,255,0.4)',
                            backgroundColor: isActive ? 'rgba(255, 0, 212, 0.1)' : 'transparent',
                            borderBottom: isActive ? `2px solid ${primaryPink}` : '2px solid transparent',
                            borderRadius: '8px 8px 0 0',
                            textTransform: 'capitalize',
                            '&:hover': { backgroundColor: 'rgba(255,255,255,0.05)', color: 'white' }
                        }}
                    >
                        {social}
                    </Button>
                );
            })}
        </Box>

        {/* 2. CONTEÚDO BASEADO NA ABA SELECIONADA */}
        
        {/* --- VISÃO INSTAGRAM (Input de Link) --- */}
        {activeTab === 'instagram' && (
            <Box sx={{ maxWidth: '600px' }}>
                <Typography variant="subtitle2" sx={{ color: 'white', mb: 1 }}>
                    Inserir publicação do Instagram
                </Typography>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', mb: 2, display: 'block' }}>
                    Cole o link do Post, Reel ou Story para registrar na campanha.
                </Typography>

                <Box sx={{ display: 'flex', gap: 1 }}>
                    <TextField
                        fullWidth
                        variant="outlined"
                        placeholder="https://www.instagram.com/p/..."
                        value={instagramLink}
                        onChange={(e) => setInstagramLink(e.target.value)}
                        size="small"
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <LinkIcon sx={{ color: 'rgba(255,255,255,0.5)' }} />
                                </InputAdornment>
                            ),
                            sx: { 
                                color: 'white', 
                                backgroundColor: 'rgba(255,255,255,0.05)',
                                '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
                                '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.4)' },
                                '&.Mui-focused fieldset': { borderColor: primaryPink }
                            }
                        }}
                    />
              <Button 
                        variant="contained" 
                        disabled={analyzingLink} // Desabilita o botão durante o processo
                        sx={{ 
                            bgcolor: primaryPink, 
                            color: 'white',
                            fontWeight: 'bold',
                            minWidth: '100px', // Garante tamanho fixo para não "pular" com o spinner
                            '&:hover': { bgcolor: 'rgb(200, 0, 160)' },
                            '&.Mui-disabled': { bgcolor: 'rgba(255, 0, 212, 0.3)' }
                        }}
                     onClick={() => handleAnalyzeAnyLink(influencer._id, instagramLink)}
                    >
                        {analyzingLink ? (
                            <CircularProgress size={24} sx={{ color: 'white' }} />
                        ) : (
                            "Analisar com IA"
                        )}
                    </Button>
                </Box>
            </Box>
        )}

   {/* --- VISÃO YOUTUBE / TIKTOK --- */}
        {(activeTab === 'youtube' || activeTab === 'tiktok') && (
            <Box>
                {/* 1. INPUT DE LINK MANUAL (Dinâmico: Mostra YT ou TikTok dependendo da aba) */}
                <Box sx={{ mb: 4, p: 2, bgcolor: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                    <Typography variant="subtitle2" sx={{ color: 'white', mb: 1 }}>
                        {activeTab === 'youtube' 
                            ? "Analisar vídeo específico do YouTube" 
                            : "Analisar vídeo específico do TikTok"}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <TextField
                            fullWidth
                            variant="outlined"
                            // Placeholder muda dinamicamente
                            placeholder={activeTab === 'youtube' 
                                ? "https://www.youtube.com/watch?v=..." 
                                : "https://www.tiktok.com/@usuario/video/..."}
                            // Valor e Change mudam dinamicamente
                            value={activeTab === 'youtube' ? youtubeLink : tiktokLink}
                            onChange={(e) => {
                                if (activeTab === 'youtube') setYoutubeLink(e.target.value);
                                else setTiktokLink(e.target.value);
                            }}
                            size="small"
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        {/* Ícone muda dinamicamente */}
                                        {activeTab === 'youtube' 
                                            ? <YouTube sx={{ color: 'rgba(255,255,255,0.5)' }} />
                                            : <FaTiktok style={{ color: 'rgba(255,255,255,0.5)', fontSize: '20px' }} />
                                        }
                                    </InputAdornment>
                                ),
                                sx: { 
                                    color: 'white', 
                                    backgroundColor: 'rgba(255,255,255,0.05)',
                                    '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' }
                                }
                            }}
                        />
                        <Button 
                            variant="contained" 
                            disabled={analyzingLink}
                            sx={{ 
                                // Cor do botão muda (Vermelho pro YT, Preto/Cinza pro TikTok)
                                bgcolor: activeTab === 'youtube' ? 'red' : '#FE2C55', // #FE2C55 é a cor rosa do TikTok
                                color: 'white', 
                                fontWeight: 'bold', 
                                minWidth: '120px',
                                '&:hover': { bgcolor: activeTab === 'youtube' ? '#cc0000' : '#e6254c' }
                            }}
                            // Envia o link correto
                            onClick={() => handleAnalyzeAnyLink(
                                influencer._id, 
                                activeTab === 'youtube' ? youtubeLink : tiktokLink
                            )}
                        >
                            {analyzingLink ? <CircularProgress size={24} color="inherit" /> : "Analisar"}
                        </Button>
                    </Box>
                </Box>

                {/* ... (Abaixo continua a sua lista de vídeos da Hashtag igual antes) ... */}
{/* ... Aqui continua o resto do código que já existia (Lista de vídeos da Hashtag) ... */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Box>
                        <Typography variant="subtitle2" sx={{ color: 'white' }}>
                            Publicações encontradas via Hashtag
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                            Clique em um vídeo para análise de IA
                        </Typography>
                    </Box>
                    {/* Botão de Atualizar que já existia */}
                    <Button 
                        size="small" 
                        startIcon={<Search />} 
                        onClick={() => handleCheckHashtag(influencer)}
                        disabled={!!checkingId}
                        sx={{ color: 'rgba(255,255,255,0.7)', borderColor: 'rgba(255,255,255,0.2)', variant: 'outlined' }}
                    >
                        Atualizar Lista
                    </Button>
                </Box>

                {/* Lista de Vídeos Horizontal */}
                <Box sx={{ 
                    display: 'flex', gap: 2, overflowX: 'auto', pb: 1,
                    "&::-webkit-scrollbar": { height: "6px" },
                    "&::-webkit-scrollbar-thumb": { backgroundColor: "rgba(255, 255, 255, 0.2)", borderRadius: "10px" }
                }}>
                    {influencerVideos[influencer._id] && influencerVideos[influencer._id].length > 0 ? (
                        influencerVideos[influencer._id].map((video) => (
                            <Box 
                                key={video.id} 
                                onClick={() => handleAnalyzeVideo(video)}
                                sx={{ 
                                    width: 200, flexShrink: 0, cursor: 'pointer',
                                    opacity: selectedVideoAnalysis?.video?.id === video.id ? 1 : 0.8,
                                    transform: selectedVideoAnalysis?.video?.id === video.id ? 'scale(1.02)' : 'scale(1)',
                                    transition: 'all 0.2s',
                                    '&:hover': { opacity: 1, transform: 'scale(1.02)' }
                                }}
                            >
                                <Box sx={{ 
                                    width: '100%', height: 112, borderRadius: '12px', overflow: 'hidden', 
                                    border: selectedVideoAnalysis?.video?.id === video.id ? `2px solid ${primaryPink}` : '1px solid rgba(255,255,255,0.2)',
                                    position: 'relative'
                                }}>
                                    <img src={video.thumb} alt={video.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    <Box sx={{ position: 'absolute', inset: 0, bgcolor: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, '&:hover': { opacity: 1 }, transition: 'opacity 0.2s' }}>
                                        <AutoAwesome sx={{ color: 'white' }} />
                                    </Box>
                                </Box>
                                <Typography variant="caption" sx={{ color: 'white', mt: 1, display: 'block', lineHeight: 1.2 }}>
                                    {video.title}
                                </Typography>
                            </Box>
                        ))
                    ) : (
                        <Typography variant="body2" color="gray">Nenhum vídeo encontrado com a hashtag.</Typography>
                    )}
                </Box>

                {/* Resultado da Análise (Mantido igual) */}
               {/* --- BLOCO DE RESULTADO DA ANÁLISE --- */}
                {selectedVideoAnalysis && (
                    <Box sx={{ mt: 3, p: 2, borderRadius: '8px', bgcolor: 'rgba(255, 0, 212, 0.05)', border: `1px solid ${primaryPink}` }}>
                         {selectedVideoAnalysis.status === 'loading' ? (
                             <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2 }}>
                                 <CircularProgress size={20} sx={{ color: primaryPink }} />
                                 <Typography variant="body2" color="white">A Inteligência Artificial está assistindo ao vídeo...</Typography>
                             </Box>
                         ) : (
                             <Box>
                                 <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                     <AutoAwesome sx={{ color: primaryPink, fontSize: 22 }} />
                                     <Typography variant="h6" color="white" fontWeight="bold">
                                         Análise Estratégica
                                     </Typography>
                                 </Box>

                                 {/* Helper function para renderizar Accordion estilizado */}
                                 {[
                                     { key: 'resumo', icon: '📌', title: 'Resumo do Conteúdo' },
                                     { key: 'tom', icon: '🗣️', title: 'Tom de Voz & Personalidade' },
                                     { key: 'brand_safety', icon: '🛡️', title: 'Brand Safety (Segurança)' },
                                     { key: 'publico', icon: '👥', title: 'Público-Alvo' },
                                     { key: 'match', icon: '🎯', title: 'Match de Indústrias' },
                                     { key: 'veredito', icon: '⚖️', title: 'Veredito Final' }
                                 ].map((item) => (
                                     <Accordion 
                                         key={item.key}
                                         sx={{ 
                                             bgcolor: 'rgba(0,0,0,0.4)', 
                                             color: 'white', 
                                             mb: 1, 
                                             border: '1px solid rgba(255,255,255,0.1)',
                                             '&:before': { display: 'none' }, // Remove linha padrão do MUI
                                             boxShadow: 'none'
                                         }}
                                     >
                                         <AccordionSummary expandIcon={<ExpandMore sx={{ color: 'rgba(255,255,255,0.5)' }} />}>
                                             <Typography fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                 <span>{item.icon}</span> {item.title}
                                             </Typography>
                                         </AccordionSummary>
                                         <AccordionDetails sx={{ borderTop: '1px solid rgba(255,255,255,0.05)', bgcolor: 'rgba(0,0,0,0.2)' }}>
                                             <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', whiteSpace: 'pre-wrap' }}>
                                                 {/* Verifica se result é objeto (JSON novo) ou string (legado) */}
                                                 {typeof selectedVideoAnalysis.result === 'object' 
                                                     ? selectedVideoAnalysis.result[item.key] || "Não disponível"
                                                     : "Formato antigo. Refaça a análise."}
                                             </Typography>
                                         </AccordionDetails>
                                     </Accordion>
                                 ))}

                                 {/* Accordion Extra para Transcrição */}
                                 <Accordion sx={{ bgcolor: 'transparent', color: 'white', mt: 2, boxShadow: 'none', border: '1px dashed rgba(255,255,255,0.2)' }}>
                                     <AccordionSummary expandIcon={<ExpandMore sx={{ color: 'white' }} />}>
                                         <Typography variant="caption" sx={{ opacity: 0.7 }}>Ver Transcrição Completa</Typography>
                                     </AccordionSummary>
                                     <AccordionDetails>
                                         <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'monospace' }}>
                                             {selectedVideoAnalysis.fullTranscript}
                                         </Typography>
                                     </AccordionDetails>
                                 </Accordion>

                             </Box>
                         )}
                    </Box>
                )}
            </Box>
        )}

        {/* --- VISÃO OUTRAS REDES (Placeholder) --- */}
        {activeTab !== 'instagram' && activeTab !== 'youtube' && activeTab !== 'tiktok' && (
            <Typography sx={{ color: 'gray', fontStyle: 'italic' }}>
                Funcionalidade para {activeTab} em desenvolvimento.
            </Typography>
        )}

    </Box>
</Collapse>

                            {/* ✨ BOTÃO DE CHAT */}
                            <IconButton
                              onClick={() => handleStartChat(influencer.agent)}
                              disabled={!influencer.agent || influencer.agent === user._id}
                              sx={{
                                position: 'absolute', top: '38px', right: '16px', transform: 'translateY(-50%)',
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