// src/scenes/campanha/CampaignStats.jsx

import React, { useState, useEffect, useMemo } from 'react';
import { 
    Box, 
    Typography, 
    Select, 
    MenuItem, 
    FormControl, 
    InputLabel, 
    CircularProgress,
    Fade
} from "@mui/material";
import {
  Campaign as CampaignIcon,
  Visibility,
  Dashboard as DashboardIcon,
  YouTube as YouTubeIcon,
  MusicNote as MusicNoteIcon, // TikTok
  Instagram as InstagramIcon, // Instagram
  SportsEsports as TwitchIcon, // Twitch (usando ícone de jogos)
  Public as PublicIcon,
  TrendingUp as TrendingUpIcon,
  BarChart as BarChartIcon
} from "@mui/icons-material";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  AreaChart,
  Area
} from "recharts";
import axios from 'axios';
import { useAuth } from "../auth/AuthContext";

// --- Utilitários de Formatação ---
const formatNumber = (num) => {
  if (!num) return "0";
  const n = Number(num);
  if (isNaN(n)) return "0";
  if (n >= 1000000000) return (n / 1000000000).toFixed(1) + 'B';
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return n.toString();
};

// --- Componentes de UI ---

const CustomTooltip = ({ active, payload, label, unit = "" }) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <Box sx={{
          background: "rgba(10, 10, 10, 0.95)",
          border: "1px solid rgba(255, 255, 255, 0.2)",
          borderRadius: "8px",
          p: 1.5,
          boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
          backdropFilter: "blur(10px)",
          zIndex: 1000
      }}>
        <Typography variant="caption" sx={{ color: "#aaa", mb: 0.5, display: 'block' }}>
          {label || data.name}
        </Typography>
        <Box display="flex" alignItems="center" gap={1}>
            <Box width={8} height={8} borderRadius="50%" bgcolor={data.fill || data.stroke || data.color || "#fff"} />
            <Typography variant="body2" fontWeight="bold" color="white">
            {`${formatNumber(data.value)}${unit}`}
            </Typography>
        </Box>
      </Box>
    );
  }
  return null;
};

const StatCard = ({ title, value, subtext, icon: Icon, color, gradient }) => (
    <Box sx={{
        p: 2.5,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.05)",
        borderRadius: "16px",
        position: "relative",
        overflow: "hidden",
        transition: "all 0.3s ease",
        "&:hover": {
            background: "rgba(255,255,255,0.05)",
            transform: "translateY(-2px)",
            boxShadow: `0 8px 24px ${color}20`
        }
    }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
            <Box p={1} borderRadius="12px" bgcolor={`${color}15`}>
                <Icon sx={{ color: color, fontSize: 24 }} />
            </Box>
            {gradient && (
                <Box sx={{
                    position: 'absolute', top: -20, right: -20, width: 80, height: 80,
                    background: gradient, filter: 'blur(40px)', opacity: 0.2, borderRadius: '50%'
                }}/>
            )}
        </Box>
        <Box>
            <Typography variant="h4" fontWeight="700" sx={{ color: "#fff", mb: 0.5 }}>
                {value}
            </Typography>
            <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.6)", textTransform: "uppercase", letterSpacing: 1, fontWeight: 600 }}>
                {title}
            </Typography>
            {subtext && (
                <Typography variant="body2" sx={{ color: color, mt: 1, fontSize: '0.75rem', fontWeight: 500 }}>
                    {subtext}
                </Typography>
            )}
        </Box>
    </Box>
);

const ChartWrapper = ({ children, height = 300 }) => (
  <Box sx={{ width: '100%', height: height, position: 'relative' }}>
    <ResponsiveContainer width="100%" height="100%">
      {children}
    </ResponsiveContainer>
  </Box>
);

// --- Componente Principal ---

const CampaignStats = ({ campaign }) => {
  const { user } = useAuth();
  const [platform, setPlatform] = useState("geral");
  const [loading, setLoading] = useState(true);
  
  const [fullParticipants, setFullParticipants] = useState([]);

  // Adicionadas as chaves para Instagram e Twitch
  const [stats, setStats] = useState({
      geral: { pubs: 0, views: 0 },
      youtube: { pubs: 0, views: 0 },
      tiktok: { pubs: 0, views: 0 },
      instagram: { pubs: 0, views: 0 },
      twitch: { pubs: 0, views: 0 }
  });

  // Flags de presença
  const [hasTiktok, setHasTiktok] = useState(false);
  const [hasYoutube, setHasYoutube] = useState(false);
  const [hasInstagram, setHasInstagram] = useState(false);
  const [hasTwitch, setHasTwitch] = useState(false);

  // 1. Fetch dos Participantes
  useEffect(() => {
    const fetchParticipants = async () => {
        if (!campaign?._id || !user?.token) return;
        
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await axios.get(`http://localhost:5001/api/campaigns/${campaign._id}/participants`, config);
            setFullParticipants(data);
        } catch (error) {
            console.error("Erro ao carregar dados detalhados para estatísticas:", error);
            setFullParticipants(campaign.participatingInfluencers || []);
        }
    };
    fetchParticipants();
  }, [campaign, user]);

  // 2. Calcular Totais
  useEffect(() => {
    if (fullParticipants.length === 0) {
        if (campaign?.participatingInfluencers?.length > 0) return;
        setLoading(false);
        return;
    }

    const countsKey = `yt_counts_${campaign._id}`;
    const viewsKey = `yt_views_${campaign._id}`;
    
    const savedCounts = JSON.parse(localStorage.getItem(countsKey) || "{}");
    const savedViews = JSON.parse(localStorage.getItem(viewsKey) || "{}");

    // Acumuladores
    let gPubs = 0, gViews = 0;
    let yPubs = 0, yViews = 0;
    // As outras redes iniciam e permanecem em 0
    let tPubs = 0, tViews = 0; 
    let iPubs = 0, iViews = 0;
    let twPubs = 0, twViews = 0;

    // Flags temporárias
    let youtubePresent = false;
    let tiktokPresent = false;
    let instagramPresent = false;
    let twitchPresent = false;

    fullParticipants.forEach(p => {
        if (!p || typeof p !== 'object') return;

        const pid = p._id;
        const countVal = Number(savedCounts[pid]) || 0;
        const viewVal = Number(savedViews[pid]) || 0;

        // Soma Geral (Baseada no YouTube/LocalStorage)
        gPubs += countVal;
        gViews += viewVal;

        // Verifica existência de redes
        const hasYt = p.social?.youtube && p.social.youtube.length > 0;
        const hasTt = p.social?.tiktok && p.social.tiktok.length > 0;
        const hasInsta = p.social?.instagram && p.social.instagram.length > 0;
        const hasTw = p.social?.twitch && p.social.twitch.length > 0;

        // Atualiza flags
        if (hasYt) youtubePresent = true;
        if (hasTt) tiktokPresent = true;
        if (hasInsta) instagramPresent = true;
        if (hasTw) twitchPresent = true;

        // Atribuição de dados (Prioridade YouTube, resto zero)
        if (hasYt) {
            yPubs += countVal;
            yViews += viewVal;
        }
        
        // TikTok, Instagram e Twitch não recebem soma de dados (ficam zerados)
    });

    setStats({
        geral: { pubs: gPubs, views: gViews },
        youtube: { pubs: yPubs, views: yViews },
        tiktok: { pubs: 0, views: 0 },
        instagram: { pubs: 0, views: 0 },
        twitch: { pubs: 0, views: 0 }
    });

    setHasYoutube(youtubePresent);
    setHasTiktok(tiktokPresent);
    setHasInstagram(instagramPresent);
    setHasTwitch(twitchPresent);
    
    setLoading(false);

  }, [fullParticipants, campaign._id]);

  // --- DADOS PARA OS GRÁFICOS ---
  const ageData = [
    { name: "18-24", value: 35 },
    { name: "25-34", value: 45 },
    { name: "35-44", value: 15 },
    { name: "45+", value: 5 },
  ];
  const pieColors = ["#d84ca8", "#9b2ecc", "#5a2b8b", "#7E57C2"];

  // Gráfico de Crescimento
  const growthData = useMemo(() => {
     const currentStats = stats[platform] || stats.geral;
     const totalViews = currentStats.views;
     
     if (totalViews === 0) {
         return [
             { name: "Início", value: 0 }, { name: "Mês 1", value: 0 },
             { name: "Mês 2", value: 0 }, { name: "Atual", value: 0 },
         ];
     }

     return [
         { name: "Início", value: 0 },
         { name: "Mês 1", value: Math.floor(totalViews * 0.2) },
         { name: "Mês 2", value: Math.floor(totalViews * 0.5) },
         { name: "Atual", value: totalViews },
     ];
  }, [platform, stats]);

  const renderContent = () => {
    const currentStats = stats[platform] || stats.geral;
    const engagementRate = currentStats.views > 0 
        ? ((currentStats.pubs * 100) / currentStats.views).toFixed(4)
        : "0";

    // Configurações Padrão (Geral)
    let themeColor = "#00E5FF";
    let themeGradient = "linear-gradient(135deg, #00E5FF 0%, #2979FF 100%)";
    let MainIcon = PublicIcon;

    // Configurações Específicas
    if (platform === 'youtube') {
        themeColor = "#FF0000";
        themeGradient = "linear-gradient(135deg, #FF0000 0%, #FF8A80 100%)";
        MainIcon = YouTubeIcon;
    } else if (platform === 'tiktok') {
        themeColor = "#00f2ea";
        themeGradient = "linear-gradient(135deg, #00f2ea 0%, #ff0050 100%)";
        MainIcon = MusicNoteIcon;
    } else if (platform === 'instagram') {
        themeColor = "#E1306C";
        themeGradient = "linear-gradient(45deg, #F58529, #DD2A7B, #8134AF, #515BD4)";
        MainIcon = InstagramIcon;
    } else if (platform === 'twitch') {
        themeColor = "#9146FF";
        themeGradient = "linear-gradient(135deg, #9146FF 0%, #F0F0FF 100%)";
        MainIcon = TwitchIcon;
    }

    return (
        <Fade in={true} key={platform} timeout={500}>
            <Box display="flex" flexDirection="column" gap={3}>
                
                {/* LINHA 1: KPIs */}
                <Box display="grid" gridTemplateColumns={{ xs: "1fr", md: "repeat(3, 1fr)" }} gap={2}>
                    <StatCard 
                        title="Publicações Identificadas" 
                        value={formatNumber(currentStats.pubs)} 
                        icon={CampaignIcon} 
                        color={themeColor} 
                        gradient={themeGradient}
                    />
                    <StatCard 
                        title="Visualizações Totais" 
                        value={formatNumber(currentStats.views)} 
                        icon={Visibility} 
                        color="#FFFFFF" 
                    />
                    <StatCard 
                        title="Engajamento (Posts/Views)" 
                        value={`${engagementRate}%`}
                        subtext="Índice de conversão visual"
                        icon={TrendingUpIcon} 
                        color="#00E676" 
                    />
                </Box>

                {/* LINHA 2: Gráficos */}
                <Box display="grid" gridTemplateColumns={{ xs: "1fr", md: "1fr 1fr" }} gap={3}>
                    
                    {/* Gráfico 1: Demografia */}
                    <Box sx={{ p: 3, bgcolor: "rgba(255,255,255,0.02)", borderRadius: "20px", border: "1px solid rgba(255,255,255,0.05)", height: '400px', display: 'flex', flexDirection: 'column' }}>
                        <Box display="flex" alignItems="center" gap={1} mb={2}>
                            <MainIcon sx={{color: themeColor}} fontSize="small"/>
                            <Typography variant="subtitle2" fontWeight="bold">Demografia Estimada</Typography>
                        </Box>
                        <ChartWrapper height={300}>
                            <PieChart>
                                <Pie 
                                    data={ageData} 
                                    dataKey="value" 
                                    cx="50%" 
                                    cy="50%" 
                                    innerRadius={60} 
                                    outerRadius={80} 
                                    paddingAngle={5} 
                                    stroke="none"
                                >
                                    {ageData.map((entry, index) => (<Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />))}
                                </Pie>
                                <Tooltip content={<CustomTooltip unit="%" />} />
                            </PieChart>
                        </ChartWrapper>
                    </Box>

                    {/* Gráfico 2: Evolução Acumulada */}
                    <Box sx={{ p: 3, bgcolor: "rgba(255,255,255,0.02)", borderRadius: "20px", border: "1px solid rgba(255,255,255,0.05)", height: '400px', display: 'flex', flexDirection: 'column' }}>
                        <Box display="flex" alignItems="center" gap={1} mb={2}>
                            <BarChartIcon sx={{color: themeColor}} fontSize="small"/>
                            <Typography variant="subtitle2" fontWeight="bold">Crescimento de Visualizações</Typography>
                        </Box>
                        <ChartWrapper height={300}>
                            <AreaChart data={growthData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorVis" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={themeColor} stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor={themeColor} stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                <XAxis dataKey="name" tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 12 }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={formatNumber}/>
                                <Tooltip content={<CustomTooltip />} />
                                <Area type="monotone" dataKey="value" stroke={themeColor} strokeWidth={3} fillOpacity={1} fill="url(#colorVis)" />
                            </AreaChart>
                        </ChartWrapper>
                    </Box>

                </Box>
            </Box>
        </Fade>
    );
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;

  return (
    <Box sx={{ 
        backgroundColor: "rgba(13, 13, 15, 0.52)", 
        borderRadius: "24px", 
        p: { xs: 2, md: 4 }, 
        backdropFilter: "blur(40px)", 
        border: "1px solid rgba(255,255,255,0.05)",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4)",
        minHeight: "600px"
    }}>
      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={5} flexWrap="wrap" gap={2}>
        <Box>
            <Typography variant="h4" fontWeight="800" letterSpacing="-0.5px" sx={{ background: "linear-gradient(90deg, #fff, #888)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                Analytics da Campanha
            </Typography>
            <Typography variant="body2" sx={{color: 'rgba(255,255,255,0.5)', mt: 0.5}}>
                 Dados agregados em tempo real de publicações verificadas.
             </Typography>
        </Box>

        <FormControl variant="filled" sx={{ minWidth: 220, "& .MuiFilledInput-root": { backgroundColor: "rgba(255, 255, 255, 0.05)", borderRadius: "12px", color: "white", "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.08)" }, "&:before, &:after": { display: "none" } }, "& .MuiSelect-icon": { color: "white" } }}>
            <InputLabel sx={{color: "rgba(255,255,255,0.5)"}}>Filtrar Plataforma</InputLabel>
            <Select
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                label="Plataforma"
            >
                <MenuItem value="geral">
                    <Box display="flex" alignItems="center" gap={1.5}><DashboardIcon fontSize="small" sx={{ opacity: 0.7 }}/> Visão Geral</Box>
                </MenuItem>
                
                {hasYoutube && (
                    <MenuItem value="youtube">
                        <Box display="flex" alignItems="center" gap={1.5}><YouTubeIcon fontSize="small" sx={{color: '#FF0000'}}/> YouTube</Box>
                    </MenuItem>
                )}
                
                {hasTiktok && (
                    <MenuItem value="tiktok">
                        <Box display="flex" alignItems="center" gap={1.5}><MusicNoteIcon fontSize="small" sx={{color: '#00f2ea'}}/> TikTok</Box>
                    </MenuItem>
                )}

                {hasInstagram && (
                    <MenuItem value="instagram">
                        <Box display="flex" alignItems="center" gap={1.5}><InstagramIcon fontSize="small" sx={{color: '#E1306C'}}/> Instagram</Box>
                    </MenuItem>
                )}

                {hasTwitch && (
                    <MenuItem value="twitch">
                        <Box display="flex" alignItems="center" gap={1.5}><TwitchIcon fontSize="small" sx={{color: '#9146FF'}}/> Twitch</Box>
                    </MenuItem>
                )}
            </Select>
        </FormControl>
      </Box>

      {renderContent()}
    </Box>
  );
};

export default CampaignStats;