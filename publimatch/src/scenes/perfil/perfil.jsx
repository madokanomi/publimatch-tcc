import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Avatar, Button, Chip, Divider, IconButton, 
  Grid, CircularProgress, Tooltip,
  useTheme, useMediaQuery
} from "@mui/material";
import { 
  Edit, ArrowBack, BusinessCenter, 
  Groups, Email, Phone, VerifiedUser, Security,
  Language, AccessTime, CheckCircle,
  Instagram, YouTube, Twitter,
  Star, Favorite, Visibility, LocalOffer // Adicionado LocalOffer para Tags
} from "@mui/icons-material";
import { FaTwitch, FaTiktok } from 'react-icons/fa'; 
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from "react-router-dom";
import axios from 'axios';
import { useAuth } from '../../auth/AuthContext'; 

// --- DEFINIÇÃO DE ROLES ---
const ROLES = {
    AD_AGENT: 'AD_AGENT',
    INFLUENCER_AGENT: 'INFLUENCER_AGENT',
    ADMIN: 'ADMIN'
};

// Função auxiliar para formatar números (K, M)
const formatNumber = (num) => {
  if (!num) return "0";
  if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
  if (num >= 1000) return (num / 1000).toFixed(1) + "K";
  return num.toString();
};

const SocialIcon = ({ network }) => {
    const iconStyle = { color: "white", fontSize: '20px' };
    const net = network ? network.toLowerCase() : '';
    
    if (net.includes("instagram")) return <Tooltip title="Instagram"><Instagram sx={iconStyle} /></Tooltip>;
    if (net.includes("youtube")) return <Tooltip title="YouTube"><YouTube sx={iconStyle} /></Tooltip>;
    if (net.includes("twitter")) return <Tooltip title="Twitter"><Twitter sx={iconStyle} /></Tooltip>;
    if (net.includes("twitch")) return <Tooltip title="Twitch"><FaTwitch style={iconStyle} /></Tooltip>;
    if (net.includes("tiktok")) return <Tooltip title="TikTok"><FaTiktok style={iconStyle} /></Tooltip>;
    
    return null;
};

// Processador de texto do TipTap (Editor de Bio)
const extractTextFromTipTap = (content) => {
    if (!content) return "";
    try {
        if (typeof content === 'string' && !content.trim().startsWith('{')) return content;
        let json = content;
        if (typeof content === 'string') {
            try { json = JSON.parse(content); } catch (e) { return content; }
        }
        if (json && json.type === 'doc' && Array.isArray(json.content)) {
            return json.content.map(node => {
                if (node.content && Array.isArray(node.content)) {
                    return node.content.map(n => n.text).join('');
                }
                return '\n'; 
            }).join('\n');
        }
        return ""; 
    } catch (error) {
        console.error("Erro ao processar bio:", error);
        return "";
    }
};

const UserProfile = () => {
  const { user: authUser } = useAuth(); 
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Determina IDs e Propriedade
  const isOwnProfile = !id || (authUser && id === authUser._id);
  const profileId = id || (authUser ? authUser._id : null);

  const [profileData, setProfileData] = useState(null);
  const [relatedData, setRelatedData] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Sobre");
  
  // Variantes de Animação
  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
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

  useEffect(() => {
    const fetchProfile = async () => {
        if (!profileId) return;
        setLoading(true);
        try {
            // 1. Busca Dados do Usuário (Agente)
            const res = await axios.get(`http://localhost:5001/api/users/public/${profileId}`);
            let userData = res.data;
            
            const userRole = userData.role ? userData.role.toUpperCase() : "";

            const safeUserData = {
                ...userData,
                role: userRole,
                profileImageUrl: userData.profileImageUrl || "",
                backgroundImageUrl: userData.backgroundImageUrl || "",
                privacySettings: userData.privacySettings || { showEmail: false, showPhone: false, isProfilePublic: true }
            };

            setProfileData(safeUserData);

            // 2. Configura Token e Busca Dados Relacionados (Campanhas ou Influencers)
            const tokenConfig = authUser?.token ? { headers: { Authorization: `Bearer ${authUser.token}` } } : {};
            let fetchedData = [];

            if (userRole === ROLES.AD_AGENT) {
                // --- Busca Campanhas ---
                const url = isOwnProfile 
                    ? 'http://localhost:5001/api/campaigns/my-campaigns' 
                    : `http://localhost:5001/api/campaigns/public?creator=${profileId}`;
                const campRes = await axios.get(url, tokenConfig);
                fetchedData = Array.isArray(campRes.data) ? campRes.data : [];

            } else if (userRole === ROLES.INFLUENCER_AGENT) {
                // --- Busca Influenciadores ---
                // FIX: Usamos sempre a rota '/agente/:id' pois ela (getInfluencersByAgent)
                // retorna os dados calculados (aggregatedStats, avaliação, tags) que a rota simples não retorna.
                const url = `http://localhost:5001/api/influencers/agente/${profileId}`;
                
                try {
                    const infRes = await axios.get(url, tokenConfig);
                    fetchedData = Array.isArray(infRes.data) ? infRes.data : [];
                } catch (err) {
                    console.warn("Erro ao buscar influencers detalhados:", err);
                    fetchedData = [];
                }
            }

            setRelatedData(fetchedData);

        } catch (error) {
            console.error("Erro ao carregar perfil:", error);
            if (!profileData) setProfileData(null); 
            setRelatedData([]);
        } finally {
            setLoading(false);
        }
    };
    fetchProfile();
  }, [profileId, isOwnProfile, authUser]);


  if (loading) return <Box display="flex" justifyContent="center" alignItems="center" height="80vh"><CircularProgress sx={{ color: '#db1db5' }} /></Box>;
  if (!profileData) return <Typography p={5} color="white" align="center">Usuário não encontrado.</Typography>;

  const secondTabName = profileData.role === ROLES.AD_AGENT ? 'Campanhas' : 'Agenciados';

  const tabs = [
      { name: 'Sobre', icon: VerifiedUser },
      { 
          name: secondTabName, 
          icon: profileData.role === ROLES.AD_AGENT ? BusinessCenter : Groups 
      }
  ];

  // --- RENDER CONTENT ---
  const renderTabContent = () => {
    switch (activeTab) {
      case "Sobre":
        const bioText = extractTextFromTipTap(profileData.bio);
        return (
          <Box
            key="sobre-box"
            component={motion.div} variants={tabContentVariant} initial="hidden" animate="visible" exit="exit"
            sx={{
              backgroundColor: "rgba(27, 27, 27, 0.26)", borderRadius: "20px", p: { xs: 2, md: 4 },
              backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.1)"
            }}
          >
            <Grid container spacing={4}>
                <Grid item xs={12}>
                    <Typography variant="h5" color="white" fontWeight="bold" mb={3} display="flex" alignItems="center" gap={1}>
                        <VerifiedUser sx={{ color: "#db1db5" }} /> Biografia Profissional
                    </Typography>
                    
                    {bioText ? (
                        <Typography color="rgba(255,255,255,0.8)" lineHeight={1.8} fontSize="16px" sx={{ whiteSpace: 'pre-line' }}>
                            {bioText}
                        </Typography>
                    ) : (
                        <Box textAlign="center" py={5} sx={{ border: "1px dashed rgba(255,255,255,0.2)", borderRadius: "15px" }}>
                            <Typography color="rgba(255,255,255,0.4)">Nenhuma biografia disponível.</Typography>
                        </Box>
                    )}
                </Grid>
            </Grid>
          </Box>
        );

      case "Campanhas": 
        return (
            <Box 
                key="campanhas-list" 
                component={motion.div} variants={staggerContainer} initial="hidden" animate="visible"
                sx={{
                    backgroundColor: "rgba(20, 1, 19, 0.6)", p: 3, borderRadius: "12px",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                }}
            >
                {(!relatedData || relatedData.length === 0) ? (
                    <Box textAlign="center" py={5}>
                          <Typography color="rgba(255,255,255,0.5)">Nenhuma campanha encontrada.</Typography>
                    </Box>
                ) : (
                    <Box display="flex" flexDirection="column" gap={2}>
                        {relatedData.map((campaign, i) => (
                            <Box 
                                component={motion.div} variants={staggerItem}
                                key={campaign._id || i}
                                onClick={() => navigate(`/campaign/${campaign._id}?view=about`)}
                                sx={{
                                    p: 3, borderRadius: "20px",
                                    backgroundColor: "rgba(255,255,255,0.05)",
                                    border: "1px solid rgba(255,255,255,0.1)",
                                    display: 'flex', alignItems: 'center', gap: 3,
                                    cursor: 'pointer',
                                    transition: "all 0.3s ease",
                                    "&:hover": { 
                                        backgroundColor: "rgba(255,255,255,0.08)", 
                                        transform: "translateY(-3px)",
                                        borderColor: "rgba(255,255,255,0.2)",
                                        boxShadow: "0 10px 20px rgba(0,0,0,0.2)"
                                    }
                                }}
                            >
                                <Avatar 
                                    src={campaign.logo} 
                                    variant="rounded" 
                                    sx={{ width: 70, height: 70, bgcolor: 'black', border: "1px solid rgba(255,255,255,0.1)" }} 
                                >
                                    {campaign.title?.charAt(0)}
                                </Avatar>
                                <Box flex={1}>
                                    <Typography variant="caption" color="rgba(255,255,255,0.5)">Campanha</Typography>
                                    <Typography variant="h6" color="white" fontWeight="bold">{campaign.title}</Typography>
                                    <Box display="flex" gap={1} mt={1}>
                                        <Chip 
                                            label={campaign.status || 'Indefinido'} 
                                            size="small" 
                                            icon={campaign.status === 'Aberta' ? <CheckCircle sx={{ fontSize: '14px !important' }} /> : <AccessTime sx={{ fontSize: '14px !important' }} />}
                                            sx={{ 
                                                bgcolor: campaign.status === 'Aberta' ? 'rgba(76, 175, 80, 0.2)' : 'rgba(255,255,255,0.1)',
                                                color: campaign.status === 'Aberta' ? '#4caf50' : 'white', fontWeight: 'bold', border: "1px solid transparent",
                                                borderColor: campaign.status === 'Aberta' ? 'rgba(76, 175, 80, 0.3)' : 'rgba(255,255,255,0.1)'
                                            }} 
                                        />
                                    </Box>
                                </Box>
                                <Box textAlign="right" sx={{ display: { xs: 'none', sm: 'block' } }}>
                                    <Button 
                                        variant="outlined" 
                                        onClick={(e) => {
                                            e.stopPropagation(); 
                                            navigate(`/campaign/${campaign._id}?view=about`);
                                        }}
                                        sx={{ color: "white", borderColor: "rgba(255,255,255,0.3)", borderRadius: "20px", textTransform: "none" }}
                                    >
                                            Ver Detalhes
                                    </Button>
                                </Box>
                            </Box>
                        ))}
                    </Box>
                )}
            </Box>
        );

      case "Agenciados": 
          return (
            <Box 
                key="agenciados-list" 
                component={motion.div} variants={staggerContainer} initial="hidden" animate="visible"
                sx={{
                    backgroundColor: "rgba(20, 1, 19, 0.6)", p: 3, borderRadius: "12px",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                }}
            >
                 {(!relatedData || relatedData.length === 0) ? (
                      <Box textAlign="center" py={5}>
                          <Typography color="rgba(255,255,255,0.5)">Nenhum influenciador encontrado.</Typography>
                       </Box>
                  ) : (
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {relatedData.map((influencer) => {
                             // --- MAPEAMENTO DAS ESTATÍSTICAS DO BACKEND ---
                             // O backend retorna 'aggregatedStats' com 'followers', 'views', 'likes'
                             const stats = influencer.aggregatedStats || { followers: 0, views: 0, likes: 0 };
                             // O backend retorna 'avaliacao' (média) e 'tags' (top 3)
                             const rating = influencer.avaliacao || 0;
                             const topTags = influencer.tags || [];
                             
                             return (
                                <Box 
                                    key={influencer._id} 
                                    onClick={() => navigate(`/influenciador/${influencer._id}`)}
                                    component={motion.div} variants={staggerItem}
                                    sx={{ 
                                        position: 'relative', 
                                        background: `linear-gradient(90deg, rgba(20, 3, 41, 0.95) 0%, rgba(20, 3, 41, 0.7) 100%), url(${influencer.backgroundImageUrl || ''})`,
                                        backgroundSize: "cover",
                                        backgroundPosition: "center",
                                        borderRadius: "20px", 
                                        overflow: 'hidden', 
                                        transition: 'all 0.3s',
                                        cursor: 'pointer',
                                        border: "1px solid rgba(255,255,255,0.1)",
                                        boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.2)",
                                        '&:hover': { 
                                            borderColor: "rgba(255, 0, 212, 0.5)", 
                                            transform: "translateY(-3px)",
                                            boxShadow: "0px 10px 30px rgba(0, 0, 0, 0.4)"
                                        }
                                    }}
                                >
                                    <Box sx={{
                                        display: "grid", 
                                        gridTemplateColumns: { xs: "1fr", md: "2.5fr 2fr 1.5fr" },
                                        gap: { xs: 2, md: 3 },
                                        p: 3, alignItems: "center",
                                    }}>
                                        
                                        {/* COLUNA 1: Perfil, Tags e Nichos */}
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            <Avatar 
                                                src={influencer.profileImageUrl} 
                                                alt={influencer.name} 
                                                sx={{ 
                                                    width: 80, height: 80, 
                                                    boxShadow: "0px 4px 15px rgba(0,0,0,0.5)",
                                                    border: "2px solid rgba(255,255,255,0.2)"
                                                }} 
                                            />
                                            <Box>
                                                <Typography color="white" variant="h6" fontWeight="bold" lineHeight={1.2}>
                                                    {influencer.name}
                                                </Typography>
                                                <Typography variant="body2" color="rgba(255,255,255,0.6)" mb={1}>
                                                    {influencer.realName || "Influencer"}
                                                </Typography>
                                                
                                                <Box display="flex" gap={0.5} flexWrap="wrap">
                                                    {/* Exibir Nichos */}
                                                    {influencer.niches?.slice(0, 2).map((cat, i) => (
                                                        <Chip key={`cat-${i}`} label={cat} size="small"
                                                            sx={{ 
                                                                backdropFilter: "blur(5px)", 
                                                                bgcolor: "rgba(255,255,255,0.1)", 
                                                                color: "white",
                                                                fontSize: "0.65rem",
                                                                height: "22px"
                                                            }} 
                                                        />
                                                    ))}
                                                    {/* Exibir Tags do Backend (reviews) se houver */}
                                                    {topTags.slice(0, 2).map((tag, i) => (
                                                        <Chip key={`tag-${i}`} label={`#${tag}`} size="small"
                                                            icon={<LocalOffer sx={{ fontSize: '10px !important', color: '#db1db5' }} />}
                                                            sx={{ 
                                                                backdropFilter: "blur(5px)", 
                                                                bgcolor: "rgba(219, 29, 181, 0.15)", 
                                                                color: "#ff80ea",
                                                                fontSize: "0.65rem",
                                                                height: "22px",
                                                                border: "1px solid rgba(219, 29, 181, 0.3)"
                                                            }} 
                                                        />
                                                    ))}
                                                </Box>
                                            </Box>
                                        </Box>

                                        {/* COLUNA 2: Métricas Agregadas (Calculadas pelo Backend) */}
                                        <Box 
                                            display="flex" 
                                            justifyContent="space-between" 
                                            bgcolor="rgba(0,0,0,0.4)" 
                                            borderRadius="12px" 
                                            p={1.5}
                                            sx={{ border: "1px solid rgba(255,255,255,0.05)" }}
                                        >
                                            <Box textAlign="center" flex={1}>
                                                <Box display="flex" alignItems="center" justifyContent="center" gap={0.5} color="#b2ff59">
                                                    <Groups sx={{ fontSize: 18 }} /> 
                                                    <Typography variant="body1" fontWeight="bold">{formatNumber(stats.followers)}</Typography>
                                                </Box>
                                                <Typography variant="caption" color="rgba(255,255,255,0.5)">Seguidores</Typography>
                                            </Box>

                                            <Divider orientation="vertical" flexItem sx={{ bgcolor: "rgba(255,255,255,0.1)" }} />

                                            <Box textAlign="center" flex={1}>
                                                <Box display="flex" alignItems="center" justifyContent="center" gap={0.5} color="#40c4ff">
                                                    <Visibility sx={{ fontSize: 18 }} /> 
                                                    <Typography variant="body1" fontWeight="bold">{formatNumber(stats.views)}</Typography>
                                                </Box>
                                                <Typography variant="caption" color="rgba(255,255,255,0.5)">Views</Typography>
                                            </Box>

                                            <Divider orientation="vertical" flexItem sx={{ bgcolor: "rgba(255,255,255,0.1)" }} />

                                            <Box textAlign="center" flex={1}>
                                                <Box display="flex" alignItems="center" justifyContent="center" gap={0.5} color="#ff4081">
                                                    <Favorite sx={{ fontSize: 18 }} /> 
                                                    <Typography variant="body1" fontWeight="bold">{formatNumber(stats.likes)}</Typography>
                                                </Box>
                                                <Typography variant="caption" color="rgba(255,255,255,0.5)">Curtidas</Typography>
                                            </Box>
                                        </Box>

                                        {/* COLUNA 3: Avaliação e Social */}
                                        <Box display="flex" flexDirection="column" alignItems={{ xs: 'center', md: 'flex-end' }} gap={1}>
                                            {/* Estrelas baseadas na Review */}
                                            <Box display="flex" alignItems="center">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star key={i} sx={{ fontSize: 16, color: i < Math.round(rating) ? "gold" : "rgba(255,255,255,0.3)" }} />
                                                ))}
                                                <Typography variant="caption" ml={0.5} color="white">
                                                    {rating > 0 ? rating.toFixed(1) : "N/A"}
                                                </Typography>
                                                {influencer.qtdAvaliacoes > 0 && (
                                                   <Typography variant="caption" color="rgba(255,255,255,0.5)" ml={0.5}>
                                                       ({influencer.qtdAvaliacoes})
                                                   </Typography>
                                                )}
                                            </Box>

                                            {/* Redes */}
                                            <Box display="flex" gap={1}>
                                                {influencer.social && Object.keys(influencer.social).map(key => (
                                                    influencer.social[key] ? <SocialIcon key={key} network={key} /> : null
                                                ))}
                                                {(!influencer.social || Object.keys(influencer.social).length === 0) && (
                                                    <Typography variant="caption" color="rgba(255,255,255,0.3)">-</Typography>
                                                )}
                                            </Box>

                                            {/* Botão */}
                                            <Button 
                                                variant="outlined" 
                                                size="small"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    navigate(`/influenciador/${influencer._id}`);
                                                }}
                                                sx={{ 
                                                    mt: 1,
                                                    color: "white", 
                                                    borderColor: "rgba(255,255,255,0.3)", 
                                                    borderRadius: "20px", 
                                                    textTransform: "none",
                                                    backdropFilter: "blur(5px)",
                                                    "&:hover": { bgcolor: "rgba(255,255,255,0.1)", borderColor: "white" }
                                                }}
                                            >
                                                Ver Perfil Completo
                                            </Button>
                                        </Box>

                                    </Box>
                                </Box>
                            );
                        })}
                      </Box>
                  )}
            </Box>
          );

      default: return null;
    }
  };

  return (
    <Box pr={3} pl={3} pb={10} 
        height="calc(100vh - 120px)" 
        overflow="auto" 
        sx={{ 
            transition: "all 0.3s ease-in-out", 
            willChange: "width", 
            "&::-webkit-scrollbar": { width: "10px", marginRight: "10px" }, 
            "&::-webkit-scrollbar-track": { background: "rgba(255, 255, 255, 0.1)", borderRadius: "10px" }, 
            "&::-webkit-scrollbar-thumb": { background: "rgba(255, 255, 255, 0.3)", borderRadius: "10px" }, 
            "&::-webkit-scrollbar-thumb:hover": { background: "rgba(255, 255, 255, 0.6)" } 
        }}
    >
        {/* HEADER NAVIGATION */}
        <Box mb={2} mt={1}>
            <Button
                startIcon={<ArrowBack />}
                onClick={() => navigate(-1)}
                sx={{ 
                    color: "white", textTransform: "none", 
                    backgroundColor: "rgba(22, 0, 61, 0.38)", backdropFilter: "blur(10px)",
                    borderRadius: "20px", px: 2, py: 0.8, 
                    "&:hover": { backgroundColor: "rgba(255,255,255,0.1)" } 
                }}
            >
                Voltar
            </Button>
        </Box>

        {/* HERO SECTION */}
        <Box
            component={motion.div} variants={staggerContainer} initial="hidden" animate="visible"
            sx={{
                position: "relative", borderRadius: "24px", overflow: "hidden", mb: 4,
                minHeight: "320px",
                background: `linear-gradient(135deg, rgba(67, 4, 66, 0.85) 0%, rgba(34, 1, 58, 0.95) 100%), url(${profileData.backgroundImageUrl || 'https://source.unsplash.com/random/1600x900?technology'})`,
                backgroundSize: "cover", backgroundPosition: "center",
                boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
                border: "1px solid rgba(255,255,255,0.1)"
            }}
        >
            <Box p={{ xs: 3, md: 5 }} display="flex" flexDirection={{ xs: 'column', md: 'row' }} alignItems="center" height="100%" gap={4}>
                
                {/* Avatar Wrapper */}
                <Box position="relative">
                    <Avatar 
                        src={profileData.profileImageUrl} 
                        sx={{ 
                            width: { xs: 120, md: 160 }, height: { xs: 120, md: 160 }, 
                            border: "4px solid rgba(255,255,255,0.9)", 
                            boxShadow: "0 10px 40px rgba(0,0,0,0.5)" 
                        }} 
                    />
                      {isOwnProfile && (
                          <Tooltip title="Editar Perfil">
                              <IconButton 
                                onClick={() => navigate('/editar')}
                                sx={{ 
                                    position: 'absolute', bottom: 5, right: 5, 
                                    backgroundColor: "#db1db5", color: "white", 
                                    border: "2px solid #1a1a1a",
                                    "&:hover": { backgroundColor: "#b01691" } 
                                }}
                             >
                                 <Edit fontSize="small" />
                             </IconButton>
                          </Tooltip>
                      )}
                </Box>

                {/* Info Wrapper */}
                <Box flex={1} textAlign={{ xs: 'center', md: 'left' }}>
                    <Box display="flex" alignItems="center" gap={2} justifyContent={{ xs: 'center', md: 'flex-start' }} flexWrap="wrap">
                        <Typography variant="h3" fontWeight="bold" color="white" sx={{ textShadow: "0 4px 10px rgba(0,0,0,0.5)" }}>
                            {profileData.name}
                        </Typography>
                        <Chip 
                            label={profileData.role === ROLES.AD_AGENT ? "Agente Publicitário" : "Agente de Talentos"} 
                            sx={{ 
                                bgcolor: profileData.role === ROLES.AD_AGENT ? "rgba(33, 150, 243, 0.2)" : "rgba(219, 29, 181, 0.2)",
                                color: profileData.role === ROLES.AD_AGENT ? "#2196f3" : "#db1db5",
                                fontWeight: "bold", border: "1px solid", borderColor: profileData.role === ROLES.AD_AGENT ? "rgba(33, 150, 243, 0.4)" : "rgba(219, 29, 181, 0.4)"
                            }}
                        />
                    </Box>

                    <Typography variant="h6" color="rgba(255,255,255,0.8)" mt={1} fontWeight="300">
                         {profileData.empresaId ? (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: isMobile ? 'center' : 'flex-start' }}>
                                <BusinessCenter fontSize="small"/> Organização Verificada
                            </span>
                         ) : (
                            "Profissional Independente"
                         )}
                    </Typography>

                    <Typography variant="body2" color="rgba(255,255,255,0.5)" mt={1}>
                        Membro desde {new Date(profileData.createdAt || Date.now()).getFullYear()}
                    </Typography>

                    <Box 
                        display="flex" 
                        flexWrap="wrap"
                        alignItems="center" 
                        gap={3} 
                        mt={3} 
                        justifyContent={{ xs: 'center', md: 'flex-start' }}
                        sx={{ 
                            p: 1.5, 
                            borderRadius: "15px", 
                            background: "rgba(0,0,0,0.3)", 
                            border: "1px solid rgba(255,255,255,0.1)",
                            backdropFilter: "blur(5px)",
                            width: "fit-content",
                            mx: { xs: "auto", md: 0 }
                        }}
                    >
                        {(isOwnProfile || profileData.privacySettings?.showEmail) && (
                            <Box display="flex" alignItems="center" gap={1}>
                                <Email fontSize="small" sx={{ color: "rgba(255,255,255,0.7)" }} />
                                <Typography variant="body2" color="white">{profileData.email}</Typography>
                            </Box>
                        )}
                        
                        {(isOwnProfile || profileData.privacySettings?.showPhone) && (
                            <Box display="flex" alignItems="center" gap={1}>
                                <Phone fontSize="small" sx={{ color: "rgba(255,255,255,0.7)" }} />
                                <Typography variant="body2" color="white">{profileData.telefone || "Sem telefone"}</Typography>
                            </Box>
                        )}

                        <Box display="flex" alignItems="center" gap={1}>
                            {profileData.privacySettings?.isProfilePublic 
                                ? <Language fontSize="small" sx={{ color: "#4caf50" }} /> 
                                : <Security fontSize="small" sx={{ color: "#ff9800" }} />
                            }
                            <Typography variant="body2" color="rgba(255,255,255,0.8)">
                                {profileData.privacySettings?.isProfilePublic ? "Público" : "Privado"}
                            </Typography>
                        </Box>
                    </Box>

                </Box>

                {/* Stats Wrapper Glass */}
                <Box 
                    sx={{ 
                        backgroundColor: "rgba(255,255,255,0.08)", 
                        backdropFilter: "blur(10px)",
                        p: 3, borderRadius: "20px", 
                        border: "1px solid rgba(255,255,255,0.1)",
                        minWidth: "200px",
                        display: "flex", flexDirection: "column", gap: 2
                    }}
                >
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Box>
                            <Typography variant="h4" fontWeight="bold" color="white">{relatedData.length}</Typography>
                            <Typography variant="caption" color="rgba(255,255,255,0.6)">
                                {profileData.role === ROLES.AD_AGENT ? "Campanhas" : "Influencers"}
                            </Typography>
                        </Box>
                        <Avatar variant="rounded" sx={{ bgcolor: "rgba(255,255,255,0.1)", color: "white" }}>
                             {profileData.role === ROLES.AD_AGENT ? <BusinessCenter /> : <Groups />}
                        </Avatar>
                    </Box>
                    <Divider sx={{ bgcolor: "rgba(255,255,255,0.1)" }} />
                    <Box display="flex" alignItems="center" gap={1}>
                        <Box width={10} height={10} borderRadius="50%" bgcolor="#4caf50" boxShadow="0 0 10px #4caf50" />
                        <Typography variant="body2" color="#4caf50" fontWeight="bold">Conta Ativa</Typography>
                    </Box>
                </Box>
            </Box>
        </Box>

        {/* MENU TABS */}
        <Box 
             display="flex" justifyContent="center" gap={2} mb={4}
             sx={{ backgroundColor: "rgba(255,255,255,0.05)", borderRadius: "20px", p: 1, backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.1)", width: "fit-content", mx: "auto" }}
        >
            {tabs.map((tab) => {
                const isActive = activeTab === tab.name;
                return (
                    <Button
                        key={tab.name}
                        startIcon={<tab.icon />}
                        onClick={() => setActiveTab(tab.name)}
                        sx={{
                            color: isActive ? "white" : "rgba(255,255,255,0.6)",
                            backgroundColor: isActive ? "rgba(219, 29, 181, 0.2)" : "transparent",
                            border: isActive ? "1px solid rgba(219, 29, 181, 0.5)" : "1px solid transparent",
                            borderRadius: "15px", px: 4, py: 1,
                            textTransform: "none", fontWeight: isActive ? "bold" : "normal",
                            transition: "all 0.3s",
                            "&:hover": { backgroundColor: isActive ? "rgba(219, 29, 181, 0.3)" : "rgba(255,255,255,0.05)", color: "white" }
                        }}
                    >
                        {tab.name}
                    </Button>
                );
            })}
        </Box>

        {/* CONTEÚDO */}
        <AnimatePresence mode="wait">
            {renderTabContent()}
        </AnimatePresence>

    </Box>
  );
};

export default UserProfile;