import React, { useState, useEffect, useMemo } from 'react';
import {
  Box, Typography, Avatar, Button, Chip, Divider, IconButton, Card,
  CardContent, Grid, Rating, LinearProgress, Dialog, DialogActions,
  DialogContent, DialogContentText, DialogTitle, FormControl,
  InputLabel, Select, MenuItem, Snackbar, Alert, CircularProgress, Tooltip,  Collapse
} from "@mui/material";
import { 
  Favorite, Visibility, Groups, Menu as MenuIcon, ArrowBack,
  TrendingUp, Star, YouTube, Instagram, SportsEsports,
  MusicNote, PersonOutlined, Business, BarChart, Campaign,  AutoAwesome, Verified 
} from "@mui/icons-material";
import StarIcon from "@mui/icons-material/Star";
import YouTubeIcon from "@mui/icons-material/YouTube";
import InstagramIcon from "@mui/icons-material/Instagram";
import SportsEsportsIcon from "@mui/icons-material/SportsEsports";
import MusicNoteIcon from "@mui/icons-material/MusicNote";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import { useParams, useNavigate } from "react-router-dom";
import Estatisticas from "../../../components/Estatisticas.jsx"; 
import TiptapContent from "../../../components/TiptapContent.jsx";
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../../../auth/AuthContext'; 
import { SiTwitch } from 'react-icons/si';
import { keyframes } from "@mui/system";

export const ROLES = {
    AD_AGENT: 'AD_AGENT',
    INFLUENCER_AGENT: 'INFLUENCER_AGENT',
    INFLUENCER: 'INFLUENCER',
    ADMIN: 'ADMIN',
};

const gradientFlow = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const pulse = keyframes`
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.2); opacity: 0.7; }
  100% { transform: scale(1); opacity: 1; }
`;

const formatNumber = (num) => {
  if (!num) return "0";
  if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
  if (num >= 1000) return (num / 1000).toFixed(1) + "K";
  return num.toString();
};


const borderGlow = keyframes`
  0% { box-shadow: 0 0 5px rgba(193, 78, 216, 0.2), inset 0 0 10px rgba(193, 78, 216, 0.1); border-color: rgba(124, 77, 255, 0.3); }
  50% { box-shadow: 0 0 20px rgba(193, 78, 216, 0.5), inset 0 0 20px rgba(193, 78, 216, 0.2); border-color: rgba(193, 78, 216, 0.8); }
  100% { box-shadow: 0 0 5px rgba(193, 78, 216, 0.2), inset 0 0 10px rgba(193, 78, 216, 0.1); border-color: rgba(124, 77, 255, 0.3); }
`;

const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const InfluencerProfile = () => {
  const { user } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();

  const [influencer, setInfluencer] = useState(null); 
  const [reviews, setReviews] = useState([]);
  const [campaignHistory, setCampaignHistory] = useState([]);

  const [loading, setLoading] = useState(true); 
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [userCampaigns, setUserCampaigns] = useState([]);
  const [dialogLoading, setDialogLoading] = useState(false);

  const [activeTab, setActiveTab] = useState("Sobre");
  const [openHireDialog, setOpenHireDialog] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [error, setError] = useState(null); 

   const [aiSummary, setAiSummary] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [showAiSummary, setShowAiSummary] = useState(false);

  const canHire = user && user.role === ROLES.AD_AGENT;
  const canSeeDetailedReviews = user && user.role === ROLES.AD_AGENT;

  useEffect(() => {
    const fetchData = async () => {
        if (!id) return;
        
        const publicInfluencerPromise = axios.get(`http://localhost:5001/api/influencers/public/${id}`);
        
        let reviewsPromise;
        let campaignsPromise;

        if (user && user.token) {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            reviewsPromise = axios.get(`http://localhost:5001/api/reviews/influencer/${id}`, config);
            campaignsPromise = axios.get(`http://localhost:5001/api/influencers/${id}/campaigns`, config);
        } else {
            reviewsPromise = Promise.resolve({ data: [] });
            campaignsPromise = axios.get(`http://localhost:5001/api/influencers/${id}/campaigns`); 
        }

        try {
            const [influencerResponse, reviewsResponse, campaignsResponse] = await Promise.all([
                publicInfluencerPromise,
                reviewsPromise,
                campaignsPromise
            ]);
            setInfluencer(influencerResponse.data);
            setReviews(reviewsResponse.data);
            
            if(campaignsResponse.data.history) {
                 setCampaignHistory(campaignsResponse.data.history);
            } else if (Array.isArray(campaignsResponse.data)) {
                 setCampaignHistory(campaignsResponse.data);
            }

        } catch (err) {
            console.error("Erro ao buscar dados do perfil:", err.response);
            setError(err.response?.data?.message || 'Este perfil não pôde ser carregado.');
        } finally {
            setLoading(false);
            setReviewsLoading(false);
        }
    };
    fetchData();
  }, [id, user]);

  const stats = useMemo(() => {
    if (!reviews || reviews.length === 0) {
        return { averageRating: 0, ratingText: "Sem Avaliações", topTags: [] };
    }
    const totalRating = reviews.reduce((acc, review) => acc + review.rating, 0);
    const averageRating = totalRating / reviews.length;
    let ratingText = "Regular";
    if (averageRating >= 4.5) ratingText = "Excelente!";
    else if (averageRating >= 4.0) ratingText = "Muito Bom!";
    else if (averageRating >= 3.0) ratingText = "Bom";
    const tagCounts = reviews.flatMap(r => r.tags).reduce((acc, tag) => {
        acc[tag] = (acc[tag] || 0) + 1;
        return acc;
    }, {});
    const topTags = Object.entries(tagCounts).sort((a, b) => b[1] - a[1]).slice(0, 4).map(item => item[0]);
    return { averageRating, ratingText, topTags };
  }, [reviews]);


  if (loading) return <Box display="flex" justifyContent="center" alignItems="center" height="50vh"><CircularProgress /></Box>;
  if (error) return <Box display="flex" justifyContent="center" alignItems="center" height="50vh"><Typography color="error">{error}</Typography></Box>;
  if (!influencer) return <Typography sx={{ m: 3 }}>Influenciador não encontrado.</Typography>;

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const staggerItem = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 120 } },
  };
  
  const tabContentVariant = {
      hidden: { opacity: 0, y: 10 },
      visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
      exit: { opacity: 0, y: -10, transition: { duration: 0.2, ease: "easeIn" } }
  };

  const handleOpenHireDialog = async () => {
    setOpenHireDialog(true);
    setDialogLoading(true);
    try {
        const token = user?.token; 
        if (!token) {
            setDialogLoading(false);
            return;
        }
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const { data } = await axios.get('http://localhost:5001/api/campaigns/my-campaigns', config);
        setUserCampaigns(data);
    } catch (err) {
        console.error("Erro ao buscar as campanhas do usuário:", err);
        setUserCampaigns([]); 
        setError("Não foi possível carregar suas campanhas. Tente novamente.");
    } finally {
        setDialogLoading(false);
    }
  };

  const handleCloseHireDialog = () => {
    setOpenHireDialog(false);
    setSelectedCampaign('');
    setUserCampaigns([]); 
  };

   const extractTextFromTiptap = (jsonContent) => {
    try {
      const content = typeof jsonContent === 'string' ? JSON.parse(jsonContent) : jsonContent;
      if (!content || !content.content) return "";
      return content.content
        .map(node => node.content?.map(textNode => textNode.text).join(" ") || "")
        .join("\n");
    } catch (e) {
      return typeof jsonContent === 'string' ? jsonContent : "";
    }
  };

   const handleGenerateSummary = async () => {
    if (aiSummary) {
        setShowAiSummary(!showAiSummary);
        return;
    }

    setAiLoading(true);
    setShowAiSummary(true);

    try {
        const cleanText = extractTextFromTiptap(influencer?.aboutMe || influencer?.description || "");
        
        if (!cleanText || cleanText.length < 5) {
             setAiSummary("O perfil não possui texto suficiente para gerar um resumo.");
             setAiLoading(false);
             return;
        }

        try {
            const { data } = await axios.post('http://localhost:5001/api/influencers/summary', 
                { text: cleanText },
                { headers: { Authorization: `Bearer ${user.token}` } }
            );
            setAiSummary(data.summary);
        } catch (apiError) {
            console.warn("API de IA falhou ou não configurada, usando simulação:", apiError);
            setTimeout(() => {
                setAiSummary(`(Simulação) ${influencer.name} é especialista em ${influencer.niches?.join(', ')}, criando conteúdo autêntico que gera alto engajamento.`);
            }, 1500);
        }

    } catch (error) {
        console.error("Erro geral na IA", error);
        setAiSummary("Erro ao gerar resumo.");
    } finally {
        if (!aiSummary) setAiLoading(false); 
    }
  };


  const handleConfirmHire = async () => {
    if (!selectedCampaign) {
        setError("Por favor, selecione uma campanha antes de enviar o convite.");
        return;
    }
    try {
        const token = user?.token;
        if (!token) throw new Error("Usuário não autenticado.");
        const inviteData = { campaignId: selectedCampaign, influencerId: id };
        const config = { headers: { Authorization: `Bearer ${token}` } };
        await axios.post('http://localhost:5001/api/invites', inviteData, config);
        handleCloseHireDialog();
        setShowConfirmation(true);
    } catch (err) {
        console.error("Erro ao enviar convite:", err);
        setError(err.response?.data?.message || "Não foi possível enviar o convite. Tente novamente.");
    }
  };

  const handleCloseConfirmation = (event, reason) => {
    if (reason === 'clickaway') return;
    setShowConfirmation(false);
  };

  const tabs = [
    { name: 'Sobre', icon: PersonOutlined },
    { name: 'Avaliações', icon: Star },
    { name: 'Campanhas', icon: Campaign },
    { name: 'Estatísticas', icon: BarChart }
  ];

  // Função auxiliar para renderizar o conteúdo do Tiptap com segurança
  const safeParseContent = (content) => {
    try {
        if (!content) return null;
        if (typeof content === 'object') return content;
        return JSON.parse(content);
    } catch (error) {
        return null;
    }
  };

  const renderTabContent = () => {
    switch(activeTab) {
        case "Sobre":
            const content = safeParseContent(influencer.aboutMe);

            return (
                <Box
                    display="flex"
                    flexDirection="column" 
                    gap={4}
                    pl={5}
                    pr={5}
                    sx={{
                        backgroundColor: "rgba(27, 27, 27, 0.26)",
                        borderRadius: "20px",
                        p: 3,
                        backdropFilter: "blur(10px)",
                        border: "1px solid rgba(255,255,255,0.1)",
                    }}
                >
                    {/* --- SEÇÃO DO RESUMO IA (Botão + Collapse) --- */}
                    <Box>
                        <Button 
                            startIcon={
                                aiLoading ? 
                                <CircularProgress size={20} color="inherit"/> : 
                                <AutoAwesome sx={{ animation: aiSummary ? 'none' : `${pulse} 2s infinite` }} /> 
                            }
                            onClick={handleGenerateSummary}
                            disabled={aiLoading}
                            sx={{
                                background: "linear-gradient(45deg, #c14ed8ff, #7c4dffff, #ff44c1ff, #c14ed8ff)",
                                backgroundSize: "300% 300%",
                                animation: `${gradientFlow} 3s ease infinite`,
                                color: "white",
                                textTransform: "none",
                                borderRadius: "20px",
                                px: 4, 
                                py: 1,
                                mb: 2,
                                fontWeight: "bold",
                                letterSpacing: "0.5px",
                                boxShadow: "0 4px 15px rgba(124, 77, 255, 0.4)",
                                transition: "all 0.3s ease",
                                "&:hover": { 
                                    transform: "translateY(-2px)",
                                    boxShadow: "0 6px 20px rgba(193, 78, 216, 0.6)"
                                },
                                "&:disabled": {
                                    background: "linear-gradient(45deg, #555 30%, #777 90%)",
                                    color: "#ccc"
                                }
                            }}
                        >
                            {aiSummary ? (showAiSummary ? "Ocultar Resumo Inteligente" : "Ver Resumo Inteligente") : "Gerar Resumo por IA"}
                        </Button>

                        <Collapse in={showAiSummary}>
                            <Box sx={{
                                position: 'relative',
                                p: 3,
                                borderRadius: "16px",
                                background: "rgba(20, 0, 50, 0.7)",
                                backdropFilter: "blur(10px)", 
                                border: "1px solid rgba(124, 77, 255, 0.3)",
                                mb: 3,
                                animation: `${borderGlow} 4s infinite alternate`,
                                overflow: "hidden" 
                            }}>
                                <Box sx={{
                                    position: 'absolute', top: 0, left: 0, right: 0, height: '1px',
                                    background: 'linear-gradient(90deg, transparent, #c14ed8, transparent)',
                                    opacity: 0.8
                                }} />

                                {aiLoading && !aiSummary ? (
                                    <Box display="flex" alignItems="center" gap={2}>
                                          <CircularProgress size={20} sx={{ color: "#b39ddb" }} />
                                          <Typography variant="body2" color="#b39ddb" sx={{ animation: `${fadeInUp} 0.5s ease` }}>
                                            A inteligência artificial está analisando o perfil...
                                          </Typography>
                                    </Box>
                                ) : (
                                    <Box sx={{ animation: `${fadeInUp} 0.8s ease-out` }}> 
                                        <Box display="flex" alignItems="center" gap={1} mb={2}>
                                            <AutoAwesome sx={{ fontSize: 20, color: "#d1c4e9" }} />
                                            <Typography variant="overline" sx={{ 
                                                background: "linear-gradient(90deg, #d1c4e9, #ff44c1)",
                                                WebkitBackgroundClip: "text",
                                                WebkitTextFillColor: "transparent",
                                                fontWeight: "900",
                                                letterSpacing: 1.5
                                            }}>
                                                INSIGHT DA IA
                                            </Typography>
                                        </Box>
                                        
                                        <Typography variant="body1" color="white" lineHeight={1.8} sx={{
                                            fontFamily: "'Roboto', sans-serif",
                                            textShadow: "0 0 10px rgba(0,0,0,0.5)"
                                        }}>
                                            "{aiSummary}"
                                        </Typography>
                                    </Box>
                                )}
                            </Box>
                        </Collapse>
                    </Box>

                    {/* CONTEÚDO ORIGINAL */}
                    <Box flex={2}>
                        <Typography variant="h4" fontWeight="bold" mb={3} color="white">
                            Sobre Mim
                        </Typography>
                        {content ? (
                            <TiptapContent content={content} />
                        ) : (
                            <Typography variant="body1" lineHeight={1.8} fontSize="16px" color="white">
                                {influencer.description || 'Informação não disponível'}
                            </Typography>
                        )}
                    </Box>
                </Box>
            );

      case 'Avaliações':
        return (
            <Box component={motion.div} key="avaliacoes" variants={tabContentVariant} initial="hidden" animate="visible" exit="exit" pl={5} pr={5} sx={{backgroundColor: "rgba(27, 27, 27, 0.26)", borderRadius:"20px", p:3, backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.1)"}}>
                {reviewsLoading ? (
                      <Box display="flex" justifyContent="center" alignItems="center" height="40vh"><CircularProgress /></Box>
                ) : reviews.length === 0 ? (
                    <Box textAlign="center">
                        <Typography variant="h6" color="white">Nenhuma Avaliação Encontrada</Typography>
                        <Typography variant="body2" color="rgba(255,255,255,0.7)">Este influenciador ainda não recebeu avaliações.</Typography>
                    </Box>
                ) : (
                    <Box display="flex" gap={4}>
                        <Box flex={1} display="flex" flexDirection="column" alignItems="center" justifyContent="center" sx={{ p: 4, textAlign: "center" }}>
                            <Typography variant="h1" fontWeight="bold" color="white" sx={{ fontSize: "120px", lineHeight: 1 }}>{stats.averageRating.toFixed(1)}</Typography>
                            <Rating value={stats.averageRating} readOnly precision={0.5} emptyIcon={<StarIcon style={{ opacity: 0.3, color: 'white' }} fontSize="inherit" />} icon={<StarIcon style={{ color: '#FFD700' }} fontSize="inherit" />} sx={{ fontSize: 32, mb: 2 }} />
                            <Typography variant="h4" fontWeight="bold" color="white" mb={1}>{stats.ratingText}</Typography>
                            <Box display="flex" gap={1} flexWrap="wrap" justifyContent="center">
                                {stats.topTags.map((tag, i) => (
                                    <Chip key={i} label={tag} size="small" sx={{ bgcolor: "rgba(255,255,255,0.2)", color: "white", fontWeight: "bold", borderRadius: "15px" }}/>
                                ))}
                            </Box>
                        </Box>
                        <Box flex={1.2}>
                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}><Typography variant="h6" color="white">Mais Recentes</Typography></Box>
                            {reviews.slice(0, 2).map((review) => (
                                <Box key={review._id} mb={3} p={3} sx={{ backgroundColor: "rgba(255,255,255,0.08)", borderRadius: "15px", border: "1px solid rgba(255,255,255,0.1)" }}>
                                      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                                            <Box>
                                                {review.campaign?.title && (
                                                    <Typography variant="caption" color="rgba(255,255,255,0.7)" fontWeight="medium" mb={0.2} display="block">Campanha: {review.campaign.title}</Typography>
                                                )}
                                                <Typography variant="body1" color="white" fontWeight="bold" mb={0.5}>{review.title}</Typography>
                                                <Typography variant="caption" color="rgba(255,255,255,0.6)">{new Date(review.createdAt).toLocaleDateString('pt-BR')}</Typography>
                                            </Box>
                                            <Box sx={{ mt: review.campaign?.title ? 2.5 : 0 }}>
                                                <Tooltip title={review.campaign?.title || 'Campanha'}>
                                                    <Avatar src={review.campaign?.logo} sx={{ width: 32, height: 32 }}>{review.campaign?.title ? review.campaign.title.charAt(0).toUpperCase() : 'C'}</Avatar>
                                                </Tooltip>
                                            </Box>
                                      </Box>
                                      <Box display="flex" alignItems="center" gap={0.5} mb={2}>
                                            <Rating value={review.rating} readOnly size="small" emptyIcon={<StarIcon style={{ opacity: 0.3, color: 'white' }} fontSize="inherit" />} />
                                            <Typography variant="body2" color="white" fontWeight="bold" ml={1}>{review.rating.toFixed(1)}</Typography>
                                            <Box ml={2} display="flex" gap={1}>
                                                {review.tags.slice(0, 3).map((tag, i) => (
                                                    <Chip key={i} label={tag} size="small" sx={{bgcolor: "rgba(76, 175, 80, 0.2)", color: "#4caf50", fontSize: "10px"}} />
                                                ))}
                                            </Box>
                                      </Box>
                                      {canSeeDetailedReviews ? (
                                          <Typography variant="body2" color="rgba(255,255,255,0.8)" lineHeight={1.6}>{review.comment || "Nenhum comentário adicional."}</Typography>
                                      ) : (
                                          <Typography variant="body2" fontStyle="italic" color="rgba(255,255,255,0.5)" lineHeight={1.6}>O conteúdo detalhado desta avaliação é visível apenas para Agentes de Publicidade.</Typography>
                                      )}
                                </Box>
                            ))}
                        </Box>
                    </Box>
                )}
            </Box>
        );

   case 'Campanhas':
        return (
          <Box 
            component={motion.div} key="campanhas" variants={tabContentVariant} initial="hidden" animate="visible" exit="exit"
            pl={5} pr={5} sx={{backgroundColor: "rgba(27, 27, 27, 0.17)", borderRadius:"20px", p:3, backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.1)"}}
          >
            <Typography variant="h4" fontWeight="bold" mb={3} color="white">
              Histórico de Campanhas
            </Typography>
            
            {campaignHistory && campaignHistory.length > 0 ? (
            <Box component={motion.div} variants={staggerContainer} initial="hidden" animate="visible" display="flex" flexDirection="column" gap={2}>
              {campaignHistory.map((campanha, index) => (
                <Box 
                  component={motion.div} variants={staggerItem} key={campanha._id || index}
                  display="flex" alignItems="center" p={3} 
                  sx={{
                    backgroundColor: "rgba(255,255,255,0.08)", borderRadius: "15px", border: "1px solid rgba(255,255,255,0.1)",
                    transition: "all 0.3s ease", "&:hover": { backgroundColor: "rgba(255,255,255,0.12)", transform: "translateY(-2px)", boxShadow: "0 8px 25px rgba(0,0,0,0.3)" }
                  }}
                >
                  {/* --- LOGO DA CAMPANHA (Com Fallback se não tiver imagem) --- */}
                  <Box 
                    sx={{
                      width: 60, height: 60, borderRadius: "12px", mr: 3, flexShrink: 0,
                      backgroundColor: "rgba(0,0,0,0.3)", 
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      backgroundImage: campanha.logo ? `url(${campanha.logo})` : 'none',
                      backgroundSize: "cover", backgroundPosition: "center"
                    }}
                  >
                      {!campanha.logo && <Campaign sx={{ color: "rgba(255,255,255,0.3)", fontSize: 30 }} />}
                  </Box>
                  
                  {/* --- INFORMAÇÕES E MÉTRICAS --- */}
                  <Box flex={1} display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
                    
                    {/* Título e Data */}
                    <Box minWidth="180px">
                      <Typography variant="caption" color="rgba(255,255,255,0.5)" fontWeight="bold" textTransform="uppercase" letterSpacing={1}>
                        Campanha
                      </Typography>
                      <Typography variant="h6" color="white" fontWeight="bold" lineHeight={1.2}>
                        {campanha.title}
                      </Typography>
                      <Typography variant="body2" color="rgba(255,255,255,0.6)" mt={0.5}>
                          {campanha.endDate ? new Date(campanha.endDate).toLocaleDateString('pt-BR') : 'Data não informada'}
                      </Typography>
                    </Box>
                    
                    {/* Métricas Reais (Conversão, Views, Engajamento) */}
                    <Box display="flex" alignItems="center" gap={4} flexWrap="wrap">
                        <Box textAlign="center">
                          <Typography variant="caption" color="rgba(255,255,255,0.6)" mb={0.5} display="block">Conversão</Typography>
                          <Typography variant="body1" fontWeight="bold" sx={{ color: '#4caf50' }}>
                            {campanha.conversion || 'N/A'}
                          </Typography>
                        </Box>

                        <Box textAlign="center">
                          <Typography variant="caption" color="rgba(255,255,255,0.6)" mb={0.5} display="block">Visualizações</Typography>
                          <Typography variant="h6" color="white" fontWeight="bold">
                            {formatNumber(campanha.views)}
                          </Typography>
                        </Box>

                        <Box textAlign="center">
                          <Typography variant="caption" color="rgba(255,255,255,0.6)" mb={0.5} display="block">Engajamento</Typography>
                          <Typography variant="h6" color="white" fontWeight="bold">
                            {formatNumber(campanha.engagement)}
                          </Typography>
                        </Box>
                    </Box>
                    
                    {/* Status Chip */}
                    <Box textAlign="center">
                        <Chip label="Concluída" size="small" color="success" variant="outlined" sx={{ fontWeight: 'bold' }} />
                    </Box>
                  </Box>
                </Box>
              ))}
            </Box>
            ) : (
              <Box textAlign="center" py={5}>
                  <Campaign sx={{ fontSize: 60, color: "rgba(255,255,255,0.1)", mb: 2 }} />
                  <Typography variant="h6" color="rgba(255,255,255,0.6)">
                    Nenhuma campanha concluída encontrada no histórico.
                  </Typography>
              </Box>
            )}
          </Box>
        );

      case 'Estatísticas':
        return (
            <Box component={motion.div} key="estatisticas" variants={tabContentVariant} initial="hidden" animate="visible" exit="exit">
                 <Estatisticas 
                                            youtubeData={influencer.youtubeStats || {}} 
                   instagramData={influencer.instagramStats || {}} 
                   twitchData={influencer.twitchStats || {}} // Adicionar
                   tiktokData={influencer.tiktokStats || {}} // Adicionar
                   socialLinks={influencer.social || {}}
                                       />
            </Box>
        );
      default:
        return null;
    }
  };

  const handleNavigateToAgent = () => {
      if (influencer?.agent?._id) {
          navigate(`/perfil/${influencer.agent._id}`);
      }
  };

  const {
    name: nome = 'Nome não disponível',
    realName: nomeReal = '',
    age: idade = 0,
    description: descricao = '',
    niches: categorias = [],
    profileImageUrl: imagem = '',
    backgroundImageUrl: imagemFundo = '',
    social = {},
    // Dados estatísticos vindos do backend (agora incluídos no select)
    followersCount = 0, 
    views: rawViews = 0,
    curtidas: rawLikes = 0,
    engagementRate = 0,
    // Avaliação calculada no frontend via reviews
    avaliacao = stats.averageRating,
    isVerified = false,
  } = influencer || {};


  const seguidoresDisplay = formatNumber(followersCount);
  const viewsDisplay = formatNumber(rawViews);
  const likesDisplay = formatNumber(rawLikes);
  const engajamentoDisplay = engagementRate ? engagementRate.toFixed(1) : "0";

  
  return (
      <Box pr={3} pl={3}>
        <Box mb={1}>
        <Button
          startIcon={<MenuIcon sx={{mr: 1}} />}
          onClick={() => navigate(-1)}
          sx={{ backgroundColor: "rgba(22, 0, 61, 0.38)", color: "white", px: 2, py: 1, borderRadius: "20px", backdropFilter: "blur(10px)", textTransform: "none", fontSize: "15px", fontWeight: "500", "&:hover": { backgroundColor: "rgba(0, 0, 0, 0.23)", }, }}
        >
          <ArrowBack sx={{  width:"10%", mr: 1 }} />
         <Typography  variant="overline" fontWeight={700} sx={{ letterSpacing: 1.4, opacity: 0.8 }}> Influenciador  </Typography>
        </Button>
      </Box>
  <Box 
    height="calc(100vh - 120px)"
    overflow="auto"
    transition="all 0.3s ease-in-out"  
    pb={10}
    sx={{ transition:"all 0.3s ease-in-out", willChange: "width", "&::-webkit-scrollbar": { width: "10px", marginRight:"10px", }, "&::-webkit-scrollbar-track": { background: "rgba(255, 255, 255, 0.1)", borderRadius: "10px", }, "&::-webkit-scrollbar-thumb": { background: "rgba(255, 255, 255, 0.3)", borderRadius: "10px", }, "&::-webkit-scrollbar-thumb:hover": { background: "rgba(255, 255, 255, 0.6)", }, }}
  >
     {/* HEADER PERFIL */}
        <Box
          component={motion.div}
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          sx={{
            position: "relative", borderRadius: 3,
            background: `linear-gradient(135deg, rgba(67, 4, 66, 0.7) 0%, rgba(34, 1, 58, 0.85) 50%, rgba(42, 1, 35, 0.68) 100%), url(${imagemFundo})`,
            backgroundSize: "cover", backgroundPosition: "center", backdropFilter: "blur(20px)", overflow: "hidden",
          }}
        >
        <Box
            onClick={handleNavigateToAgent}
            sx={{ 
                position: 'absolute', top: 16, right: 16, 
                display: 'flex', alignItems: 'center', 
                backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                borderRadius: '20px', px: 2, py: 0.5, 
                backdropFilter: 'blur(5px)', boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                cursor: influencer?.agent?._id ? 'pointer' : 'default', 
                transition: 'transform 0.2s',
                '&:hover': influencer?.agent?._id ? { transform: 'scale(1.05)', backgroundColor: '#fff' } : {}
            }}
        >
            <Business sx={{ fontSize: 16, color: '#6a1b9a', mr: 1 }} />
            <Typography variant="caption" sx={{ color: '#6a1b9a' }}>
                Agenciado por <Typography component="span" variant="caption" fontWeight="bold">
                    {influencer?.agent?.name || 'Agente não informado'}
                </Typography>
            </Typography>
        </Box>

          <Box p={4}>
            <Box display="flex" alignItems="flex-start" justifyContent="space-between">
              <Box component={motion.div} variants={staggerItem} display="flex" gap={2} flex={1}>
                <Avatar src={imagem} sx={{ width: 120, height: 120, border: "4px solid white" }} />
                <Box>
                  <Typography variant="body2" sx={{ fontStyle: "italic", opacity: 0.9, mb: 0.2, fontSize: "14px" }}>"{descricao}"</Typography>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography variant="h3" fontWeight="bold" mb={0}>{nome}</Typography>
                    {isVerified && (
                      <Tooltip title="Verificado">
                        <Verified sx={{ color: "#00d4ff", fontSize: 32 }} />
                      </Tooltip>
                    )}
                  </Box>
                    <Typography variant="h6" mb={0.5} sx={{ opacity: 0.9 }}>
                    <PersonOutlinedIcon sx={{paddingTop:"5px"}}/>  {nomeReal}, {idade} anos
                  </Typography>
                  <Box display="flex" alignItems="center" gap={0.5} mb={1}>
                    {[...Array(5)].map((_, i) => ( <StarIcon key={i} sx={{ color: i < Math.floor(avaliacao) ? "gold" : "gray", fontSize: 20, }} /> ))}
                    <Typography fontWeight="bold">{avaliacao.toFixed(1)}</Typography>
                  </Box>
                  <Box display="flex" gap={1} mb={1.5}>
                    {categorias.map((cat, i) => ( <Chip key={i} label={cat} size="small" sx={{ bgcolor: "rgba(255,255,255,0.2)", color: "white", fontWeight: "bold", backdropFilter: "blur(10px)", }} /> ))}
                  </Box>
                 <Box display="flex" gap={1}>
                    {social.youtube && (
                      <Box sx={{ width: 32, height: 32, borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", "&:hover": { backgroundColor: "rgba(255,255,255,0.3)" } }} onClick={() => window.open(social.youtube, '_blank')}> <YouTubeIcon sx={{ fontSize: 16 }} /> </Box>
                    )}
                    {social.instagram && (
                      <Box sx={{ width: 32, height: 32, borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", "&:hover": { backgroundColor: "rgba(255,255,255,0.3)" } }} onClick={() => window.open(social.instagram, '_blank')}> <InstagramIcon sx={{ fontSize: 16 }} /> </Box>
                    )}
                    {social.twitch && (
                      <Box sx={{ width: 32, height: 32, borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", "&:hover": { backgroundColor: "rgba(255,255,255,0.3)" } }} onClick={() => window.open(social.twitch, '_blank')}> <SiTwitch size={14} /> </Box>
                    )}
                    {social.tiktok && (
                      <Box sx={{ width: 32, height: 32, borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", "&:hover": { backgroundColor: "rgba(255,255,255,0.3)" } }} onClick={() => window.open(social.tiktok, '_blank')}> <MusicNoteIcon sx={{ fontSize: 16 }} /> </Box>
                    )}
                  </Box>
                  {canHire && (
                    <Box mt={1.2}>
                      {isVerified ? (
                        <Button variant="contained" startIcon={<Favorite />} onClick={handleOpenHireDialog} sx={{ background: "#f9f1f1ff", px: 4, py: 1.5, color:"#ff00a6ff", borderRadius: "25px", fontWeight: "bold", fontSize: "16px", transition: "0.2s all ease-in-out", textTransform: "none", boxShadow: "0px 0px 24.5px 4px rgba(255, 55, 235, 0.25)", "&:hover": { background: "#ffffffff", transform: "scale(1.05)", borderRadius:"10px", boxShadow: "0px 0px 15px 4px rgba(255, 55, 235, 0.53)", }, }}> Contratar </Button>
                      ) : (
                        <Tooltip title="Não é possível contratar o influenciador pois não é uma conta verificada" arrow>
                           <span style={{ cursor: 'not-allowed' }}>
                              <Button 
                                variant="contained" 
                                startIcon={<Favorite />} 
                                disabled
                                sx={{ 
                                  background: "#f9f1f1ff", 
                                  px: 4, 
                                  py: 1.5, 
                                  color:"#ff00a6ff", 
                                  borderRadius: "25px", 
                                  fontWeight: "bold", 
                                  fontSize: "16px", 
                                  textTransform: "none", 
                                  boxShadow: "none",
                                  opacity: 0.5,
                                  "&.Mui-disabled": {
                                     background: "rgba(249, 241, 241, 0.5)",
                                     color: "rgba(255, 0, 166, 0.5)"
                                  }
                                }}> 
                                Contratar 
                              </Button>
                           </span>
                        </Tooltip>
                      )}
                    </Box>
                  )}
                </Box>
              </Box>
              <Box component={motion.div} variants={staggerItem} display="flex" flexDirection="column" gap={3} mt={3} alignItems="center" sx={{ minWidth: "300px" }}>
                <Box display="flex" alignItems="center" gap={1} textAlign="center">
                  <Favorite sx={{ fontSize: 24, color: "#ff1493" }} />
                  <Box>
                      <Typography variant="h4" fontWeight="bold">{likesDisplay}</Typography>
                      <Typography variant="caption" sx={{ opacity: 0.8 }}>Curtidas</Typography>
                  </Box>
                </Box>
                <Box display="flex" alignItems="center" gap={1} textAlign="center">
                  <Visibility sx={{ fontSize: 24, color: "#2196f3" }} />
                  <Box>
                      <Typography variant="h4" fontWeight="bold">{viewsDisplay}</Typography>
                      <Typography variant="caption" sx={{ opacity: 0.8 }}>Visualizações</Typography>
                  </Box>
                </Box>
                <Box display="flex" alignItems="center" gap={1} textAlign="center">
                  <Groups sx={{ fontSize: 24, color: "#9c27b0" }} />
                  <Box>
                      <Typography variant="h4" fontWeight="bold">{seguidoresDisplay}</Typography>
                      <Typography variant="caption" sx={{ opacity: 0.8 }}>Seguidores</Typography>
                  </Box>
                </Box>
                <Box display="flex" alignItems="center" gap={1} textAlign="center">
                  <TrendingUp sx={{ fontSize: 24, color: "#4caf50" }} />
                  <Box>
                      <Typography variant="h4" fontWeight="bold" color="#4caf50">{engajamentoDisplay}%</Typography>
                      <Typography variant="caption" sx={{ opacity: 0.8 }}>Taxa de Engajamento</Typography>
                  </Box>
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>

         <Box display="flex" justifyContent="center" gap={2} my={2} sx={{ backgroundColor: "rgba(255,255,255,0.05)", borderRadius: "20px", p:1 , backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.1)" }}>
          {tabs.map((tab) => {
            const IconComponent = tab.icon;
            return (
              <Button key={tab.name} startIcon={<IconComponent />} onClick={() => setActiveTab(tab.name)} sx={{ color: activeTab === tab.name ? "#ffffffff" : "rgba(255,255,255,0.7)", fontWeight: activeTab === tab.name ? "bold" : "normal", fontSize: "14px", textTransform: "none", backgroundColor: activeTab === tab.name ? "rgba(58, 0, 151, 0.1)" : "transparent", borderRadius: "15px", px: 3, py: 1.5, transition: "all 0.3s ease", border: activeTab === tab.name ? "1px solid rgba(255, 255, 255, 0.3)" : "1px solid transparent", "&:hover": { backgroundColor: activeTab === tab.name ? "rgba(255, 0, 166, 0.15)" : "rgba(255,255,255,0.05)", color: activeTab === tab.name ? "#dfdbfaff" : "white", }, }}> {tab.name} </Button>
            );
          })}
        </Box>

        <Box mb={4}>
            <AnimatePresence mode="wait">
              {renderTabContent()}
            </AnimatePresence>
        </Box>
      </Box>

        <Dialog open={openHireDialog} onClose={handleCloseHireDialog} aria-labelledby="hire-dialog-title" aria-describedby="hire-dialog-description" sx={{ "& .MuiPaper-root": { backgroundColor: "rgba(225, 225, 225, 0.33)", color: "#FFFFFF", backdropFilter: "blur(10px)", borderRadius: '20px', border: '1px solid rgba(255, 255, 255, 0.2)' } }}>
            <DialogTitle id="hire-dialog-title" sx={{ fontWeight: 'bold' }}>{"Convidar Influenciador"}</DialogTitle>
            <DialogContent>
                <DialogContentText id="hire-dialog-description" sx={{ color: "rgba(255, 255, 255, 0.8)" }}> Selecione a campanha para a qual você deseja convidar <strong>{influencer.nome}</strong>. </DialogContentText>
                {dialogLoading ? ( <Box display="flex" justifyContent="center" alignItems="center" height={80}> <CircularProgress color="inherit" /> </Box> ) : (
            <FormControl fullWidth variant="filled" sx={{ mt: 3 }}>
                <InputLabel id="campaign-select-label">Campanha</InputLabel>
                <Select labelId="campaign-select-label" id="campaign-select" value={selectedCampaign} onChange={(e) => setSelectedCampaign(e.target.value)} label="Campanha" sx={{ color: 'white' }}>
                    {userCampaigns.length > 0 ? ( userCampaigns.map((campaign) => ( <MenuItem key={campaign._id} value={campaign._id}> {campaign.title} </MenuItem> )) ) : ( <MenuItem disabled>Nenhuma campanha criada por você foi encontrada.</MenuItem> )}
                </Select>
            </FormControl>
        )}
            </DialogContent>
            <DialogActions sx={{ p: '0 24px 16px' }}>
                <Button onClick={handleCloseHireDialog} sx={{ color: "rgba(255, 255, 255, 0.7)", textTransform:'none', fontSize: '15px' }}>Cancelar</Button>
                <Button onClick={handleConfirmHire} sx={{ fontWeight: 'bold', color: "#d900c7ff", backgroundColor: '#ffffffff', textTransform:'none', fontSize: '15px', px: 2, borderRadius: '10px', "&:hover": { backgroundColor: '#e9e9e9ff' } }} autoFocus disabled={!selectedCampaign}> Enviar Convite </Button>
            </DialogActions>
        </Dialog>
        
        <Snackbar open={showConfirmation} autoHideDuration={6000} onClose={handleCloseConfirmation} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
          <Alert onClose={handleCloseConfirmation} severity="success" sx={{ width: '100%', backgroundColor: '#2e7d32', color: 'white', fontWeight: 'bold' }}> Convite enviado, esperando resposta do influenciador! </Alert>
        </Snackbar>
      </Box>
  );
};

export default InfluencerProfile;
