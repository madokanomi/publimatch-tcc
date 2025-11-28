import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Avatar, Button, Chip, Divider, IconButton, 
  Grid, CircularProgress, Tooltip,
  useTheme, useMediaQuery, LinearProgress
} from "@mui/material";
import { 
  Edit, ArrowBack, BusinessCenter, 
  Groups, Email, Phone, VerifiedUser, Security,
  Language, AccessTime, CheckCircle,
  Instagram, YouTube, Twitter
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

// --- COMPONENTE AUXILIAR PARA ÍCONES SOCIAIS ---
const SocialIcon = ({ network }) => {
    const iconStyle = { color: "rgba(255,255,255,0.7)", fontSize: '20px' };
    const net = network ? network.toLowerCase() : '';
    
    if (net.includes("instagram")) return <Tooltip title="Instagram"><Instagram sx={iconStyle} /></Tooltip>;
    if (net.includes("youtube")) return <Tooltip title="YouTube"><YouTube sx={iconStyle} /></Tooltip>;
    if (net.includes("twitter")) return <Tooltip title="Twitter"><Twitter sx={iconStyle} /></Tooltip>;
    if (net.includes("twitch")) return <Tooltip title="Twitch"><FaTwitch style={iconStyle} /></Tooltip>;
    if (net.includes("tiktok")) return <Tooltip title="TikTok"><FaTiktok style={iconStyle} /></Tooltip>;
    
    return null;
};

// --- FUNÇÃO AUXILIAR PARA EXTRAIR TEXTO DO TIPTAP (JSON) ---
const extractTextFromTipTap = (content) => {
    if (!content) return "";

    try {
        // Se já for uma string simples (não JSON), retorna ela mesma
        if (typeof content === 'string' && !content.trim().startsWith('{')) {
            return content;
        }

        // Se for string JSON, faz o parse primeiro
        let json = content;
        if (typeof content === 'string') {
            try {
                json = JSON.parse(content);
            } catch (e) {
                return content; // Falha no parse, retorna como está
            }
        }

        // Se for estrutura do Tiptap (doc -> content -> paragraph -> text)
        if (json && json.type === 'doc' && Array.isArray(json.content)) {
            return json.content.map(node => {
                if (node.content && Array.isArray(node.content)) {
                    return node.content.map(n => n.text).join('');
                }
                return '\n'; // Parágrafos vazios viram quebra de linha
            }).join('\n');
        }

        return ""; // Estrutura desconhecida
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

  // Lógica de Identidade
  const isOwnProfile = !id || (authUser && id === authUser._id);
  const profileId = id || (authUser ? authUser._id : null);

  const [profileData, setProfileData] = useState(null);
  const [relatedData, setRelatedData] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Sobre");
  
  // Variantes de Animação
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

  // --- FETCH DATA ---
  useEffect(() => {
    const fetchProfile = async () => {
        if (!profileId) return;
        setLoading(true);
        try {
            // 1. Fetch Dados do Usuário
            const res = await axios.get(`http://localhost:5001/api/users/public/${profileId}`);
            let userData = res.data;
            
            const safeUserData = {
                ...userData,
                profileImageUrl: userData.profileImageUrl || "",
                backgroundImageUrl: userData.backgroundImageUrl || "",
                privacySettings: userData.privacySettings || { showEmail: false, showPhone: false, isProfilePublic: true }
            };

            setProfileData(safeUserData);

            // 2. Busca Campanhas ou Influenciadores
            const tokenConfig = authUser?.token ? { headers: { Authorization: `Bearer ${authUser.token}` } } : {};

            if (safeUserData.role === ROLES.AD_AGENT) {
                const url = isOwnProfile 
                    ? 'http://localhost:5001/api/campaigns/my-campaigns' 
                    : `http://localhost:5001/api/campaigns/public?creator=${profileId}`;
                try {
                    const campRes = await axios.get(url, tokenConfig);
                    setRelatedData(campRes.data);
                } catch (e) { setRelatedData([]); }

            } else if (safeUserData.role === ROLES.INFLUENCER_AGENT) {
                const url = isOwnProfile 
                    ? 'http://localhost:5001/api/influencers'
                    : `http://localhost:5001/api/influencers/by-agent/${profileId}`;
                
                try {
                    const infRes = await axios.get(url, tokenConfig);
                    
                    const augmentedInfluencers = infRes.data.map(influencer => ({
                        ...influencer,
                        randomStats: {
                            views: (Math.random() * 5 + 1).toFixed(1),
                            publications: Math.floor(Math.random() * 20) + 5,
                            platform: ["Stories, Vídeos", "Reels, Posts", "Vídeos Longos"][Math.floor(Math.random() * 3)],
                            conversion: Math.floor(Math.random() * 50) + 40,
                        },
                        social: influencer.social || {} 
                    }));
                    setRelatedData(augmentedInfluencers);
                } catch (e) { 
                    setRelatedData([]); 
                }
            }

        } catch (error) {
            console.error("Erro ao carregar perfil:", error);
        } finally {
            setLoading(false);
        }
    };
    fetchProfile();
  }, [profileId, isOwnProfile, authUser]);

  if (loading) return <Box display="flex" justifyContent="center" alignItems="center" height="80vh"><CircularProgress sx={{ color: '#db1db5' }} /></Box>;
  if (!profileData) return <Typography p={5} color="white" align="center">Usuário não encontrado.</Typography>;

  const tabs = [
      { name: 'Sobre', icon: VerifiedUser },
      { 
          name: profileData.role === ROLES.AD_AGENT ? 'Campanhas' : 'Agenciados', 
          icon: profileData.role === ROLES.AD_AGENT ? BusinessCenter : Groups 
      }
  ];

  const gridTemplate = "2.5fr 1.5fr 1.5fr 1fr 1.5fr 1fr";
  const primaryPink = "#db1db5"; 
  const lightPinkBg = "rgba(219, 29, 181, 0.2)";

  // --- RENDER CONTENT ---
  const renderTabContent = () => {
    switch (activeTab) {
      case "Sobre":
        // Processa o texto da biografia antes de renderizar
        const bioText = extractTextFromTipTap(profileData.bio);

        return (
          <Box
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

      case "Campanhas": // AD_AGENT
        return (
            <Box component={motion.div} variants={staggerContainer} initial="hidden" animate="visible">
                {relatedData.length === 0 ? (
                    <Box textAlign="center" py={5} sx={{ backgroundColor: "rgba(255,255,255,0.02)", borderRadius: "20px" }}>
                          <Typography color="rgba(255,255,255,0.5)">Nenhuma campanha encontrada.</Typography>
                    </Box>
                ) : (
                    <Box display="flex" flexDirection="column" gap={2}>
                        {relatedData.map((campaign, i) => (
                            <Box 
                                component={motion.div} variants={staggerItem}
                                key={campaign._id || i}
                                onClick={() => navigate(`/dashboard/campaigns/${campaign._id}`)}
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
                                            label={campaign.status} 
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
                                    <Button variant="outlined" sx={{ color: "white", borderColor: "rgba(255,255,255,0.3)", borderRadius: "20px", textTransform: "none" }}>
                                        Ver Detalhes
                                    </Button>
                                </Box>
                            </Box>
                        ))}
                    </Box>
                )}
            </Box>
        );

      case "Agenciados": // INFLUENCER_AGENT
          return (
            <Box component={motion.div} variants={staggerContainer} initial="hidden" animate="visible"
                sx={{
                    backgroundColor: "rgba(20, 1, 19, 0.6)", p: 3, borderRadius: "12px",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                }}
            >
                 {relatedData.length === 0 ? (
                      <Box textAlign="center" py={5}>
                         <Typography color="rgba(255,255,255,0.5)">Nenhum influenciador encontrado.</Typography>
                      </Box>
                  ) : (
                      <>
                        <Box
                            sx={{
                                display: { xs: "none", md: "grid" }, 
                                gridTemplateColumns: gridTemplate, 
                                gap: 2, py: 1.5, px: 2, mb: 2,
                                alignItems: "center", color: "rgba(255,255,255,0.6)", fontWeight: "bold",
                                textTransform: 'uppercase', fontSize: '0.8rem',
                            }}
                        >
                            <Typography variant="caption" fontWeight="bold">Nome</Typography>
                            <Typography variant="caption" fontWeight="bold">Visualizações</Typography>
                            <Typography variant="caption" fontWeight="bold">Publicações</Typography>
                            <Typography variant="caption" fontWeight="bold">Redes Sociais</Typography>
                            <Typography variant="caption" fontWeight="bold">Especialidade</Typography>
                            <Typography variant="caption" fontWeight="bold">Conversão</Typography>
                        </Box>

                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {relatedData.map((influencer) => (
                                <Box 
                                    key={influencer._id} 
                                    onClick={() => navigate(`/dashboard/influencers/${influencer._id}`)}
                                    component={motion.div} variants={staggerItem}
                                    sx={{ 
                                        position: 'relative', backgroundColor: "rgba(255, 255, 255, 0.05)",
                                        borderRadius: "16px", overflow: 'hidden', transition: 'all 0.3s',
                                        cursor: 'pointer',
                                        '&:hover': { backgroundColor: "rgba(255, 255, 255, 0.1)", transform: "translateX(5px)" }
                                    }}
                                >
                                    <Box sx={{
                                        display: "grid", 
                                        gridTemplateColumns: { xs: "1fr", md: gridTemplate }, 
                                        gap: { xs: 2, md: 2 },
                                        py: 2, px: 2, alignItems: "center",
                                    }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            <Avatar src={influencer.profileImageUrl} alt={influencer.name} sx={{ width: 48, height: 48, borderRadius: "12px" }} variant="rounded" />
                                            <Box>
                                                <Typography color="white" fontWeight="bold">{influencer.name}</Typography>
                                                <Typography variant="caption" color="rgba(255,255,255,0.5)">
                                                    {influencer.realName || "Influencer"}
                                                </Typography>
                                            </Box>
                                        </Box>
                                        <Box>
                                            <Typography variant="caption" display={{ xs: 'block', md: 'none' }} color="rgba(255,255,255,0.5)">Views</Typography>
                                            <Typography color="white" fontWeight="bold">{influencer.randomStats?.views}M</Typography>
                                        </Box>
                                        <Box>
                                            <Typography variant="caption" display={{ xs: 'block', md: 'none' }} color="rgba(255,255,255,0.5)">Pubs</Typography>
                                            <Typography color="white" fontWeight="bold">{influencer.randomStats?.publications}</Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', gap: 1 }}>
                                             {influencer.social && Object.keys(influencer.social).map(key => (
                                                 influencer.social[key] ? <SocialIcon key={key} network={key} /> : null
                                             ))}
                                             {(!influencer.social || Object.keys(influencer.social).length === 0) && (
                                                 <Typography variant="caption" color="rgba(255,255,255,0.3)">-</Typography>
                                             )}
                                        </Box>
                                        <Box>
                                            <Typography color="rgba(255,255,255,0.8)" fontSize="14px">{influencer.randomStats?.platform}</Typography>
                                        </Box>
                                        <Box position="relative">
                                            <Typography color={primaryPink} fontWeight="bold" textAlign={{ xs: 'left', md: 'right' }} pr={1}>
                                                {influencer.randomStats?.conversion}%
                                            </Typography>
                                             <LinearProgress variant="determinate" value={influencer.randomStats?.conversion} sx={{
                                                mt: 0.5,
                                                width: '100%', height: '3px',
                                                backgroundColor: lightPinkBg,
                                                '& .MuiLinearProgress-bar': { backgroundColor: primaryPink }
                                            }} />
                                        </Box>
                                    </Box>
                                </Box>
                            ))}
                        </Box>
                      </>
                  )}
            </Box>
          );

      default: return null;
    }
  };

  return (
    <Box pr={3} pl={3} pb={10} 
        sx={{ 
            height: "calc(100vh - 80px)", 
            overflowY: "auto",
            "&:webkit-scrollbar": { width: "8px" },
            "&:webkit-scrollbar-track": { background: "rgba(255,255,255,0.02)" },
            "&:webkit-scrollbar-thumb": { background: "rgba(255,255,255,0.15)", borderRadius: "4px" },
            "&:webkit-scrollbar-thumb:hover": { background: "rgba(255,255,255,0.25)" }
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

                    {/* ✅ CONTATOS NO BANNER */}
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