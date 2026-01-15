import React, { useState, useMemo, useEffect } from "react";
import { Box, Typography, Select, MenuItem, FormControl, InputLabel, Grid, LinearProgress, Divider, CircularProgress, Fade } from "@mui/material";
import { useAuth } from "../auth/AuthContext";
import axios from "axios";
import GppGoodIcon from '@mui/icons-material/GppGood'; // Escudo (Brand Safety)
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'; // Intenção de Compra
import ForumIcon from '@mui/icons-material/Forum'; // Tópicos
import WarningAmberIcon from '@mui/icons-material/WarningAmber'; // Alertas

// Ícones
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import DashboardIcon from '@mui/icons-material/Dashboard';
import YouTubeIcon from '@mui/icons-material/YouTube';
import InstagramIcon from '@mui/icons-material/Instagram';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt';
import ChatBubbleIcon from '@mui/icons-material/ChatBubble';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PublicIcon from '@mui/icons-material/Public';
import WcIcon from '@mui/icons-material/Wc';
import CakeIcon from '@mui/icons-material/Cake';
import { SiTwitch } from "react-icons/si";
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'; // Ícone da IA
import PhoneIphoneIcon from '@mui/icons-material/PhoneIphone';
import TrafficIcon from '@mui/icons-material/Traffic';
import ShareIcon from '@mui/icons-material/Share';
import TagIcon from '@mui/icons-material/Tag';
import CategoryIcon from '@mui/icons-material/Category';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import UpdateIcon from '@mui/icons-material/Update';
import { Chip } from "@mui/material"; // Importe Chip
// Recharts
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  BarChart,
  Bar,
  Legend
} from "recharts";
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'; // Novo
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
// --- Utilitários de Formatação ---

const formatNumber = (num) => {
  if (!num) return "0";
  const n = Number(num);
  if (n >= 1000000000) return (n / 1000000000).toFixed(1) + 'B';
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return n.toString();
};

const formatPercent = (val) => `${Number(val).toFixed(1)}%`;

const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { year: 'numeric', month: 'short', day: 'numeric' });
};

// Calcula anos de existência
const getChannelAge = (dateString) => {
    if (!dateString) return "";
    const created = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now - created) / (1000 * 60 * 60 * 24 * 365));
    return `${diff} anos`;
};


// --- Subcomponentes de UI ---

const CustomTooltip = ({ active, payload, label, unit = "" }) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <Box sx={{
          background: "rgba(10, 10, 10, 0.34)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          borderRadius: "8px",
          p: 1.5,
          boxShadow: "0 8px 32px rgba(0,0,0,0.5)"
      }}>
        <Typography variant="caption" sx={{ color: "#aaa", mb: 0.5, display: 'block' }}>
          {label || data.name}
        </Typography>
        <Box display="flex" alignItems="center" gap={1}>
            <Box width={8} height={8} borderRadius="50%" bgcolor={data.fill || data.color} />
            <Typography variant="body2" fontWeight="bold" color="white">
            {`${formatNumber(data.value)}${unit}`}
            </Typography>
        </Box>
      </Box>
    );
  }
  return null;
};


const VideoCard = ({ video }) => (
    <Box sx={{
        display: 'flex', gap: 2, p: 1.5,
        bgcolor: "rgba(255,255,255,0.02)", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.05)",
        transition: "0.2s", "&:hover": { bgcolor: "rgba(255,255,255,0.05)" }
    }}>
        {/* Thumbnail */}
        <Box sx={{ position: 'relative', width: 120, minWidth: 120, height: 68, borderRadius: "8px", overflow: "hidden" }}>
            <img src={video.thumbnail} alt={video.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <Box sx={{ position: 'absolute', inset: 0, bgcolor: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: '0.2s', "&:hover": { opacity: 1 } }}>
                <PlayCircleOutlineIcon sx={{ color: 'white' }} />
            </Box>
        </Box>
        
        {/* Detalhes */}
        <Box display="flex" flexDirection="column" justifyContent="center" flex={1}>
            <Typography variant="body2" color="white" fontWeight="600" sx={{
                display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.2, mb: 0.5
            }}>
                {video.title}
            </Typography>
            <Box display="flex" gap={2} alignItems="center">
                <Typography variant="caption" color="rgba(255,255,255,0.5)" display="flex" alignItems="center" gap={0.5}>
                    <VisibilityIcon sx={{ fontSize: 12 }} /> {formatNumber(video.views)}
                </Typography>
                <Typography variant="caption" color="rgba(255,255,255,0.5)" display="flex" alignItems="center" gap={0.5}>
                    <ThumbUpAltIcon sx={{ fontSize: 12 }} /> {formatNumber(video.likes)}
                </Typography>
                <Typography variant="caption" color="rgba(255,255,255,0.4)">
                    {formatDate(video.publishedAt)}
                </Typography>
            </Box>
        </Box>
    </Box>
);

const CommunityAnalysis = ({ data }) => {
    if (!data) return null;

    // Define cor do Brand Safety
    const getSafetyColor = (score) => {
        if (score >= 80) return "#00E676"; // Verde
        if (score >= 50) return "#FFC107"; // Amarelo
        return "#FF1744"; // Vermelho
    };

    return (
        <Box sx={{ mt: 3, p: 3, bgcolor: "rgba(30, 30, 40, 0.6)", borderRadius: "20px", border: "1px solid rgba(255,255,255,0.1)" }}>
            <Box display="flex" alignItems="center" gap={1} mb={3}>
                <ForumIcon sx={{ color: "#d8b4fe" }} />
                <Typography variant="h6" fontWeight="bold" color="white">
                    Raio-X da Comunidade (IA)
                </Typography>
            </Box>

            <Grid container spacing={3}>
                {/* Coluna 1: Scores e Persona */}
                <Grid item xs={12} md={4}>
                    <Box display="flex" flexDirection="column" gap={2}>
                        
                        {/* Persona Card */}
                        <Box sx={{ p: 2, bgcolor: "rgba(255,255,255,0.05)", borderRadius: "12px", borderLeft: "4px solid #d8b4fe" }}>
                            <Typography variant="caption" color="rgba(255,255,255,0.6)">PERFIL DA TRIBO</Typography>
                            <Typography variant="body2" color="white" fontWeight="500" mt={0.5}>
                                "{data.community_persona}"
                            </Typography>
                        </Box>

                        {/* Brand Safety Meter */}
                        <Box sx={{ p: 2, bgcolor: "rgba(255,255,255,0.05)", borderRadius: "12px" }}>
                            <Box display="flex" justifyContent="space-between" mb={1}>
                                <Typography variant="caption" color="rgba(255,255,255,0.6)" display="flex" alignItems="center" gap={0.5}>
                                    <GppGoodIcon fontSize="inherit"/> BRAND SAFETY
                                </Typography>
                                <Typography variant="caption" fontWeight="bold" color={getSafetyColor(data.brand_safety_score)}>
                                    {data.brand_safety_score}/100
                                </Typography>
                            </Box>
                            <LinearProgress 
                                variant="determinate" 
                                value={data.brand_safety_score} 
                                sx={{ 
                                    height: 8, borderRadius: 4, bgcolor: "rgba(255,255,255,0.1)",
                                    "& .MuiLinearProgress-bar": { backgroundColor: getSafetyColor(data.brand_safety_score) }
                                }} 
                            />
                        </Box>

                        {/* Intenção de Compra */}
                        <Box sx={{ p: 2, bgcolor: "rgba(255,255,255,0.05)", borderRadius: "12px", display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Typography variant="caption" color="rgba(255,255,255,0.6)" display="flex" alignItems="center" gap={0.5}>
                                <ShoppingCartIcon fontSize="inherit"/> INTENÇÃO DE COMPRA
                            </Typography>
                            <Chip 
                                label={data.purchase_intent} 
                                size="small" 
                                sx={{ 
                                    bgcolor: data.purchase_intent === 'Alta' ? 'rgba(0, 230, 118, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                                    color: data.purchase_intent === 'Alta' ? '#00E676' : 'white',
                                    fontWeight: 'bold'
                                }} 
                            />
                        </Box>
                    </Box>
                </Grid>

                {/* Coluna 2: Tópicos e Alertas */}
                <Grid item xs={12} md={8}>
                    <Box height="100%" display="flex" flexDirection="column" gap={2}>
                        
                        {/* Tópicos Principais (Chips) */}
                        <Box>
                            <Typography variant="caption" color="rgba(255,255,255,0.5)" mb={1} display="block">TÓPICOS MAIS COMENTADOS</Typography>
                            <Box display="flex" flexWrap="wrap" gap={1}>
                                {data.topics.map((topic, i) => (
                                    <Chip 
                                        key={i} 
                                        label={topic} 
                                        sx={{ 
                                            bgcolor: "rgba(147, 51, 234, 0.15)", 
                                            color: "#d8b4fe", 
                                            border: "1px solid rgba(147, 51, 234, 0.3)" 
                                        }} 
                                    />
                                ))}
                            </Box>
                        </Box>

                        {/* Alertas (Se houver) */}
                        {data.warnings && data.warnings.length > 0 && (
                            <Box sx={{ mt: 'auto', p: 2, bgcolor: "rgba(255, 23, 68, 0.1)", borderRadius: "12px", border: "1px solid rgba(255, 23, 68, 0.3)" }}>
                                <Typography variant="caption" color="#FF1744" fontWeight="bold" display="flex" alignItems="center" gap={1} mb={1}>
                                    <WarningAmberIcon fontSize="small"/> PONTOS DE ATENÇÃO
                                </Typography>
                                {data.warnings.map((warn, i) => (
                                    <Typography key={i} variant="body2" color="rgba(255, 200, 200, 0.9)" sx={{ display: 'list-item', ml: 2 }}>
                                        {warn}
                                    </Typography>
                                ))}
                            </Box>
                        )}
                    </Box>
                </Grid>
            </Grid>
        </Box>
    );
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

const AuthenticationLock = ({ platformName }) => (
    <Box sx={{
        position: 'absolute', inset: 0, zIndex: 10,
        backdropFilter: "blur(8px)",
        backgroundColor: "rgba(0,0,0,0.6)",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        borderRadius: "20px",
        textAlign: "center", p: 3
    }}>
        <WorkspacePremiumIcon sx={{ fontSize: 48, color: "#ff0055ff", mb: 2 }} />
        <Typography variant="h6" fontWeight="bold" color="white">
            Dados Demográficos Bloqueados
        </Typography>
        <Typography variant="body2" color="rgba(255,255,255,0.7)" mb={2}>
            O influenciador precisa conectar a conta do {platformName} oficialmente para exibir idade, gênero e geografia real.
        </Typography>
        <Chip label="Não Verificado" color="error" variant="outlined" />
    </Box>
);

// --- Componente Principal ---

// No início do componente Estatisticas.jsx
export default function Estatisticas({ youtubeData, instagramData, tiktokData, twitchData, socialLinks, description }) {
  const { user } = useAuth();
  // 1. Garante que safeYoutubeData sempre seja um objeto para evitar crash
  const safeYoutubeData = useMemo(() => youtubeData || {}, [youtubeData]);
  const [platform, setPlatform] = useState("geral");
  
  // Estados da IA
  const [aiAnalysis, setAiAnalysis] = useState("");
  const [loadingAi, setLoadingAi] = useState(false);
  const [hasFetchedAi, setHasFetchedAi] = useState(false);

  // --- Efeito para chamar a IA automaticamente ---
 useEffect(() => {
    const fetchAnalysis = async () => {
        const hasAnyData = youtubeData || instagramData || tiktokData || twitchData;
        
        // Adicionei verificação se a description mudou para re-analisar se necessário
        if (!hasAnyData || hasFetchedAi || !user?.token) return;

        setLoadingAi(true);
        setHasFetchedAi(true);

        const aggregatedStats = {
            youtube: youtubeData ? { subs: youtubeData.subscriberCount, views: youtubeData.viewCount, eng: youtubeData.engagementRate } : null,
            instagram: instagramData ? { followers: instagramData.followers, er: instagramData.engagementRate } : null,
            tiktok: tiktokData ? { followers: tiktokData.followers, likes: tiktokData.likes } : null,
            twitch: twitchData ? { followers: twitchData.followers, views: twitchData.totalViews } : null
        };

        try {
            const { data } = await axios.post('http://localhost:5001/api/influencers/analyze-stats', 
                { 
                  stats: aggregatedStats,
                  bio: description // ✅ 2. Enviando a descrição para o backend
                },
                { headers: { Authorization: `Bearer ${user.token}` } }
            );
            setAiAnalysis(data.analysis);
        } catch (error) {
            console.error("Falha ao gerar análise IA:", error);
            setAiAnalysis("Perfil analisado. Verifique os dados detalhados abaixo.");
        } finally {
            setLoadingAi(false);
        }
    };

    const timeout = setTimeout(fetchAnalysis, 1000);
    return () => clearTimeout(timeout);
    
    // ✅ Importante: Adicione 'description' nas dependências do useEffect se quiser que atualize ao mudar
  }, [youtubeData, instagramData, tiktokData, twitchData, hasFetchedAi, user, description]);
  // ... resto do código
  
  // Onde você usa youtubeData.subscriberCount, mude para:
  // safeYoutubeData.subscriberCount

  // --- Processamento de Dados (useMemo) ---

  // 1. Qualidade do Público (Real vs Bots)
  const qualityData = useMemo(() => {
    const score = instagramData?.qualityScore ? Number(instagramData.qualityScore) : 95;
    return [
      { name: "Audiência Real", value: score, fill: "#00E676" }, // Verde Neon
      { name: "Suspeito/Massa", value: 100 - score, fill: "#FF1744" }, // Vermelho Neon
    ];
  }, [instagramData]);

  // 2. Gênero da Audiência (Mapeia 'm'/'f' da API para Labels)
// 2. Gênero da Audiência
  const genderData = useMemo(() => {
    if (!instagramData?.audienceGender || instagramData.audienceGender.length === 0) {
        return [];
    }

  
    
    // Mapeia labels baseados na documentação: m=Male, f=Female [cite: 169]
    return instagramData.audienceGender.map(g => {
        const isFemale = g.name === 'f';
        return {
            name: isFemale ? 'Feminino' : 'Masculino',
            value: Number(g.value).toFixed(1),
            fill: isFemale ? "#F50057" : "#2979FF"
        };
    });
  }, [instagramData]);

  // 3. Faixa Etária (Age)
 // 3. Faixa Etária (Age)
  const ageData = useMemo(() => {
    // Se não houver dados, retorna array vazio ou mock
    if (!instagramData?.audienceAge || instagramData.audienceAge.length === 0) {
        return []; 
    }
    
    // O service já converteu para { name: "18_21", value: 15.0 }
    // Apenas formatamos o label e ordenamos
    return instagramData.audienceAge
        .map((a, index) => ({
            name: a.name.replace('_', '-'), // De "18_21" para "18-21" [cite: 172]
            value: Number(a.value).toFixed(1),
            fill: `rgba(255, 255, 255, ${0.9 - (index * 0.1)})`
        }))
        .sort((a, b) => b.value - a.value) // Ordena do maior para o menor
        .slice(0, 5); // Pega top 5
  }, [instagramData]);

  // 4. Top Países
  // 4. Top Países
  const countryData = useMemo(() => {
      if (!instagramData?.audienceCountry || instagramData.audienceCountry.length === 0) return [];
      
      return instagramData.audienceCountry
          .sort((a, b) => b.value - a.value)
          .slice(0, 5)
          .map((c) => ({
              name: c.name, // Ex: "US", "BR" [cite: 163]
              value: Number(c.value).toFixed(1),
              fill: "#7B1FA2"
          }));
  }, [instagramData]);

    
const isYoutubeAuthenticated = !!(safeYoutubeData.isAuthenticated && safeYoutubeData.advanced && Object.keys(safeYoutubeData.advanced).length > 0);

  const youtubeAgeData = useMemo(() => {
      // Usa Optional Chaining (?.) para não quebrar se advanced for undefined
      if (isYoutubeAuthenticated && safeYoutubeData.advanced?.ageGroup) {
          return safeYoutubeData.advanced.ageGroup.map((a, i) => ({
              name: a.name,
              value: Number(a.value).toFixed(1),
              fill: `rgba(255, 0, 0, ${0.9 - (i * 0.1)})`
          }));
      }
      return [];
  }, [safeYoutubeData, isYoutubeAuthenticated]);

  const youtubeGenderData = useMemo(() => {
      if (isYoutubeAuthenticated && safeYoutubeData.advanced?.gender) {
          return safeYoutubeData.advanced.gender.map(g => ({
             name: g.name,
             value: Number(g.value).toFixed(1),
             fill: g.name === 'Feminino' ? "#F50057" : "#2979FF"
          }));
      }
      return [];
  }, [safeYoutubeData, isYoutubeAuthenticated]);

  // --- Renderização Condicional ---

  const renderContent = () => {
    switch (platform) {
  case "youtube":
        const hasExtraData = safeYoutubeData.avgLikes > 0;
        const recentVideos = safeYoutubeData.recentVideos || [];

        return (
    <Box display="flex" flexDirection="column" gap={3} key="youtube-content">
        {/* KPI CARDS */}
        <Box display="grid" gridTemplateColumns={{ xs: "1fr", md: "repeat(4, 1fr)" }} gap={2}>
             <StatCard title="Inscritos" value={formatNumber(safeYoutubeData.subscriberCount)} icon={GroupAddIcon} color="#FF0000" gradient="linear-gradient(135deg, #FF0000 0%, #FF8A80 100%)" />
             <StatCard title="Total de Views" value={formatNumber(safeYoutubeData.viewCount)} icon={VideoLibraryIcon} color="#FFFFFF" />
             <StatCard title="Idade do Canal" value={safeYoutubeData.publishedAt ? new Date(safeYoutubeData.publishedAt).getFullYear() : "-"} subtext={getChannelAge(safeYoutubeData.publishedAt)} icon={CalendarMonthIcon} color="#B388FF" />
             <StatCard title="País" value={safeYoutubeData.country || "Global"} icon={PublicIcon} color="#40C4FF" />
        </Box>

        {/* SEO SECTION */}
        <Box sx={{ p: 3, bgcolor: "rgba(255,255,255,0.02)", borderRadius: "20px", border: "1px solid rgba(255,255,255,0.05)" }}>
            <Typography variant="h6" fontWeight="bold" mb={3} display="flex" alignItems="center" gap={1} sx={{ color: "#d8b4fe" }}>
                <AutoAwesomeIcon /> Inteligência de Nicho & Brand Safety
            </Typography>
            <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                    <Box display="flex" flexDirection="column" gap={3}>
                        <Box>
                            <Typography variant="caption" color="rgba(255,255,255,0.5)" display="flex" alignItems="center" gap={0.5} mb={1}><CategoryIcon fontSize="small"/> CATEGORIAS OFICIAIS</Typography>
                            <Box display="flex" flexWrap="wrap" gap={1}>
                                {safeYoutubeData.mainTopics?.length > 0 ? (
                                    safeYoutubeData.mainTopics.map((topic, i) => (
                                        <Chip key={i} label={topic} size="small" sx={{ bgcolor: "rgba(147, 51, 234, 0.2)", color: "#d8b4fe", border: "1px solid rgba(147, 51, 234, 0.4)", fontWeight: 'bold' }} />
                                    ))
                                ) : <Typography variant="body2" color="rgba(255,255,255,0.3)">Não categorizado</Typography>}
                            </Box>
                        </Box>
                        <Box display="flex" gap={2}>
                            <Box flex={1} p={1.5} bgcolor="rgba(255,255,255,0.05)" borderRadius="12px">
                                <Typography variant="caption" color="rgba(255,255,255,0.5)" display="block" mb={0.5}>Frequência</Typography>
                                <Box display="flex" alignItems="center" gap={1}>
                                    <UpdateIcon sx={{ color: "#00E676", fontSize: 20 }} />
                                    <Typography variant="body2" fontWeight="bold" color="white">{safeYoutubeData.uploadFrequency || "N/A"}</Typography>
                                </Box>
                            </Box>
                            <Box flex={1} p={1.5} bgcolor="rgba(255,255,255,0.05)" borderRadius="12px">
                                <Typography variant="caption" color="rgba(255,255,255,0.5)" display="block" mb={0.5}>Formato</Typography>
                                <Box display="flex" alignItems="center" gap={1}>
                                    <AccessTimeIcon sx={{ color: "#29B6F6", fontSize: 20 }} />
                                    <Typography variant="body2" fontWeight="bold" color="white">{safeYoutubeData.contentFormat || "Variado"}</Typography>
                                </Box>
                            </Box>
                        </Box>
                    </Box>
                </Grid>
                <Grid item xs={12} md={8}>
                    <Box>
                        <Typography variant="caption" color="rgba(255,255,255,0.5)" display="flex" alignItems="center" gap={0.5} mb={1}><TagIcon fontSize="small"/> PALAVRAS-CHAVE & SEO</Typography>
                        <Box display="flex" flexWrap="wrap" gap={0.8} sx={{ maxHeight: '120px', overflowY: 'auto', pr: 1 }}>
                            {[...(safeYoutubeData.channelKeywords || []), ...(safeYoutubeData.recentTags || [])].length > 0 ? (
                                [...(safeYoutubeData.channelKeywords || []), ...(safeYoutubeData.recentTags || [])].slice(0, 25).map((tag, i) => (
                                    <Chip key={i} label={`#${tag.replace(/"/g, '')}`} size="small" sx={{ bgcolor: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.7)", fontSize: '0.75rem', border: "1px solid rgba(255,255,255,0.1)" }} />
                                ))
                            ) : <Typography variant="body2" color="rgba(255,255,255,0.3)">Nenhuma tag de SEO identificada.</Typography>}
                        </Box>
                    </Box>
                </Grid>
            </Grid>
        </Box>

        <Fade in={true} timeout={1000}>
            <Box>
                {/* 3. Safe Navigation no objeto advanced */}
                {safeYoutubeData.advanced?.communityAnalysis ? (
                    <CommunityAnalysis data={safeYoutubeData.advanced.communityAnalysis} />
                ) : (
                    <Box sx={{ mt: 3, p: 3, bgcolor: "rgba(30, 30, 40, 0.28)", borderRadius: "20px", border: "1px dashed rgba(255,255,255,0.1)", textAlign: 'center' }}>
                         <Typography variant="body2" color="rgba(255,255,255,0.4)">Dados de análise de comunidade indisponíveis no momento.</Typography>
                    </Box>
                )}
            </Box>
        </Fade>

        {/* ENGAJAMENTO E VIDEOS */}
        <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
                <Box display="flex" flexDirection="column" gap={2} height="100%">
                    <StatCard title="Média de Likes" value={hasExtraData ? formatNumber(safeYoutubeData.avgLikes) : "—"} subtext="Últimos 5 vídeos" icon={ThumbUpAltIcon} color="#2196F3" />
                    <StatCard title="Média de Comentários" value={hasExtraData ? formatNumber(safeYoutubeData.avgComments) : "—"} icon={ChatBubbleIcon} color="#4CAF50" />
                    <StatCard title="Taxa de Engajamento" value={hasExtraData ? `${safeYoutubeData.engagementRate}%` : "—"} subtext="Interações / Views Recentes" icon={TrendingUpIcon} color="#FF9800" />
                </Box>
            </Grid>
            <Grid item xs={12} md={8}>
                <Box sx={{ p: 3, height: "100%", bgcolor: "rgba(255,255,255,0.02)", borderRadius: "20px", border: "1px solid rgba(255,255,255,0.05)", display: 'flex', flexDirection: 'column' }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                        <Typography variant="h6" fontWeight="bold" display="flex" alignItems="center" gap={1}><YouTubeIcon sx={{ color: "#FF0000" }} /> Envios Recentes</Typography>
                    </Box>
                    <Box display="flex" flexDirection="column" gap={1.5} sx={{ overflowY: 'auto', maxHeight: '400px', pr: 1 }}>
                        {recentVideos.length > 0 ? (
                            recentVideos.map((video) => <VideoCard key={video.id} video={video} />)
                        ) : (
                            <Box display="flex" alignItems="center" justifyContent="center" height="200px" flexDirection="column" gap={1}>
                                <VideoLibraryIcon sx={{ fontSize: 40, color: 'rgba(255,255,255,0.1)' }} />
                                <Typography variant="body2" color="rgba(255,255,255,0.3)">Nenhum vídeo recente encontrado.</Typography>
                            </Box>
                        )}
                    </Box>
                </Box>
            </Grid>
        </Grid>
                
        {/* GRÁFICOS DEMOGRÁFICOS */}
        <Box display="grid" gridTemplateColumns={{ xs: "1fr", md: "1fr 1fr 1fr" }} gap={2} mt={3}>
            {/* Idade */}
            <Box sx={{ p: 2, bgcolor: "rgba(255,255,255,0.02)", borderRadius: "20px", border: "1px solid rgba(255,255,255,0.05)", position: 'relative' }}>
                {!isYoutubeAuthenticated && <AuthenticationLock platformName="YouTube" />}
                <Box display="flex" alignItems="center" gap={1} mb={2}>
                    <CakeIcon sx={{color: "#FF0000"}} fontSize="small"/>
                    <Typography variant="subtitle2" fontWeight="bold">Faixa Etária</Typography>
                </Box>
                <Box height={150}>
                    <ResponsiveContainer>
                        <BarChart data={isYoutubeAuthenticated ? youtubeAgeData : [{name:'Demo', value:100}]} layout="vertical">
                            <XAxis type="number" hide />
                            <YAxis dataKey="name" type="category" width={50} tick={{fill: "#aaa", fontSize: 11}} axisLine={false} tickLine={false}/>
                            <Tooltip content={<CustomTooltip unit="%" />} cursor={{fill: 'transparent'}} />
                            <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={16}>
                                {youtubeAgeData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} />)}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </Box>
            </Box>

            {/* Gênero */}
            <Box sx={{ p: 2, bgcolor: "rgba(255,255,255,0.02)", borderRadius: "20px", border: "1px solid rgba(255,255,255,0.05)", position: 'relative' }}>
                {!isYoutubeAuthenticated && <AuthenticationLock platformName="YouTube" />}
                <Box display="flex" alignItems="center" gap={1} mb={2}>
                     <WcIcon sx={{color: "#FF0000"}} fontSize="small"/>
                     <Typography variant="subtitle2" fontWeight="bold">Gênero</Typography>
                </Box>
                 <Box height={150} display="flex" alignItems="center">
                    <ResponsiveContainer>
                        <PieChart>
                            <Pie data={isYoutubeAuthenticated ? youtubeGenderData : [{name:'Demo', value:1}]} cx="50%" cy="50%" outerRadius={60} dataKey="value" stroke="none">
                                {youtubeGenderData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} />)}
                            </Pie>
                            <Tooltip content={<CustomTooltip unit="%" />} />
                            <Legend verticalAlign="middle" align="right" layout="vertical" iconType="circle" wrapperStyle={{fontSize: '12px', color: '#aaa'}}/>
                        </PieChart>
                    </ResponsiveContainer>
                </Box>
            </Box>

            {/* Países */}
            <Box sx={{ p: 2, bgcolor: "rgba(255,255,255,0.02)", borderRadius: "20px", border: "1px solid rgba(255,255,255,0.05)", position: 'relative' }}>
                 {!isYoutubeAuthenticated && <AuthenticationLock platformName="YouTube" />}
                 <Box display="flex" alignItems="center" gap={1} mb={2}>
                    <PublicIcon sx={{color: "#FF0000"}} fontSize="small"/>
                    <Typography variant="subtitle2" fontWeight="bold">Principais Países</Typography>
                </Box>
                <Box height={150} display="flex" flexDirection="column" gap={1} justifyContent="center" sx={{overflowY: 'auto'}}>
                    {/* 4. Safe Navigation no array de countries */}
                    {isYoutubeAuthenticated && safeYoutubeData.advanced?.countries ? (
                        safeYoutubeData.advanced.countries.map((country, idx) => (
                            <Box key={idx} display="flex" alignItems="center" justifyContent="space-between" px={2}>
                                <Box display="flex" alignItems="center" gap={1}>
                                    <Typography variant="caption" fontWeight="bold" sx={{color: '#fff', minWidth: 20}}>{country.name}</Typography>
                                    <Box width={100} height={6} bgcolor="rgba(255,255,255,0.1)" borderRadius={1}>
                                        <Box width={`${Math.min(country.value, 100)}%`} height="100%" bgcolor="#FF0000" borderRadius={1} /> 
                                    </Box>
                                </Box>
                                <Typography variant="caption" color="rgba(255,255,255,0.6)">{formatNumber(country.value)}%</Typography>
                            </Box>
                        ))
                    ) : <Typography variant="caption" align="center" color="rgba(255,255,255,0.3)">Dados geográficos indisponíveis</Typography>}
                </Box>
            </Box>
        </Box>

        {/* --- DISPOSITIVOS E TRÁFEGO --- */}
        <Box display="grid" gridTemplateColumns={{ xs: "1fr", md: "1fr 1fr" }} gap={2} mt={2}>
            {/* Dispositivos */}
            <Box sx={{ p: 2, bgcolor: "rgba(255,255,255,0.02)", borderRadius: "20px", border: "1px solid rgba(255,255,255,0.05)", position: 'relative' }}>
                {!isYoutubeAuthenticated && <AuthenticationLock platformName="YouTube" />}
                <Box display="flex" alignItems="center" gap={1} mb={2}>
                    <PhoneIphoneIcon sx={{color: "#FF0000"}} fontSize="small"/>
                    <Typography variant="subtitle2" fontWeight="bold">Dispositivos</Typography>
                </Box>
                <Box height={200}>
                    <ResponsiveContainer>
                        <PieChart>
                            <Pie 
                                data={isYoutubeAuthenticated && safeYoutubeData.advanced?.devices ? safeYoutubeData.advanced.devices : [{name:'Demo', value:1}]} 
                                cx="50%" cy="50%" innerRadius={40} outerRadius={70} 
                                dataKey="value" stroke="none" paddingAngle={5}
                            >
                                {(isYoutubeAuthenticated && safeYoutubeData.advanced?.devices ? safeYoutubeData.advanced.devices : []).map((entry, index) => (
                                     <Cell key={`cell-${index}`} fill={['#FF0000', '#212121', '#555', '#999'][index % 4]} />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip unit="%" />} />
                            <Legend layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{fontSize: '11px', color:'#aaa'}} />
                        </PieChart>
                    </ResponsiveContainer>
                </Box>
            </Box>

            {/* Fontes de Tráfego */}
            <Box sx={{ p: 2, bgcolor: "rgba(255,255,255,0.02)", borderRadius: "20px", border: "1px solid rgba(255,255,255,0.05)", position: 'relative' }}>
                {!isYoutubeAuthenticated && <AuthenticationLock platformName="YouTube" />}
                <Box display="flex" alignItems="center" gap={1} mb={2}>
                    <TrafficIcon sx={{color: "#FF0000"}} fontSize="small"/>
                    <Typography variant="subtitle2" fontWeight="bold">Origem do Tráfego</Typography>
                </Box>
                <Box height={200}>
                    <ResponsiveContainer>
                        <BarChart layout="vertical" data={isYoutubeAuthenticated && safeYoutubeData.advanced?.traffic ? safeYoutubeData.advanced.traffic : [{name:'Demo', value:100}]} margin={{left: 10}}>
                            <XAxis type="number" hide />
                            <YAxis dataKey="name" type="category" width={90} tick={{fill: "#aaa", fontSize: 10}} axisLine={false} tickLine={false}/>
                            <Tooltip content={<CustomTooltip unit="%" />} cursor={{fill: 'rgba(255,255,255,0.05)'}} />
                            <Bar dataKey="value" barSize={12} radius={[0, 4, 4, 0]}>
                                 <Cell fill="#FF0000" />
                                 <Cell fill="#D32F2F" />
                                 <Cell fill="#B71C1C" />
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </Box>
            </Box>
        </Box>

        {/* --- CARD EXTRA: METRICAS DE CONVERSÃO --- */}
        <Box mt={2} display="flex" gap={2}>
            <StatCard 
                title="Compartilhamentos (30d)" 
                value={isYoutubeAuthenticated ? formatNumber(safeYoutubeData.advanced?.engagement?.shares) : "N/A"} 
                icon={ShareIcon} color="#fff" 
                subtext="Índice de Viralidade"
            />
             <StatCard 
                title="Retenção Média" 
                value={isYoutubeAuthenticated && safeYoutubeData.advanced?.engagement?.avgViewDuration ? 
                       `${Math.floor(safeYoutubeData.advanced.engagement.avgViewDuration / 60)}m ${safeYoutubeData.advanced.engagement.avgViewDuration % 60}s` 
                       : "N/A"} 
                icon={AccessTimeIcon} color="#fff" 
                subtext="Tempo de tela"
            />
        </Box>
    </Box>
        );

      case "instagram":
        return (
            <Box display="flex" flexDirection="column" gap={3} key="instagram-content">
                {/* --- LINHA 1: KPIS PRINCIPAIS (Statistics API) --- */}
                <Box display="grid" gridTemplateColumns={{ xs: "1fr", md: "repeat(4, 1fr)" }} gap={2}>
                    {/* Seguidores */}
                    <StatCard 
                        title="Seguidores" 
                        value={instagramData ? formatNumber(instagramData.followers) : "N/A"} 
                        icon={GroupAddIcon} 
                        color="#D81B60" 
                        gradient="linear-gradient(135deg, #833AB4 0%, #FD1D1D 50%, #FCB045 100%)"
                    />
                    
                    {/* Engajamento (ER) */}
                    <StatCard 
                        title="Taxa de Engajamento" 
                        value={instagramData?.engagementRate ? `${instagramData.engagementRate}%` : "N/A"} 
                        subtext={instagramData?.engagementRate > 2 ? "Performance Alta" : "Performance Média"}
                        icon={TrendingUpIcon} 
                        color="#FF9800" 
                    />

                    {/* Quality Score */}
                    <StatCard 
                        title="Quality Score" 
                        value={instagramData?.qualityScore || "N/A"} 
                        subtext="Índice de autenticidade (0-100)"
                        icon={WorkspacePremiumIcon} 
                        color="#00E676" 
                    />

                    {/* Média de Likes (KPI Composto) */}
                    <StatCard 
                        title="Média de Likes" 
                        value={instagramData?.avgLikes ? formatNumber(instagramData.avgLikes) : "N/A"} 
                        icon={ThumbUpAltIcon} 
                        color="#2979FF" 
                    />
                </Box>

                {/* --- LINHA 2: DETALHAMENTO DE ENGAJAMENTO --- */}
                <Box display="grid" gridTemplateColumns={{ xs: "1fr", md: "2fr 1fr" }} gap={2}>
                    {/* Médias por Post */}
                    <Box sx={{ p: 3, bgcolor: "rgba(255,255,255,0.02)", borderRadius: "20px", border: "1px solid rgba(255,255,255,0.05)", display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <Typography variant="h6" fontWeight="bold" mb={3} sx={{opacity: 0.9}}>Médias de Interação por Post</Typography>
                        <Box display="flex" justifyContent="space-around" alignItems="center" gap={2}>
                            {/* Likes */}
                            <Box textAlign="center">
                                <Box sx={{ width: 60, height: 60, borderRadius: '50%', bgcolor: 'rgba(41, 121, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 1 }}>
                                    <ThumbUpAltIcon sx={{ color: '#2979FF', fontSize: 28 }} />
                                </Box>
                                <Typography variant="h5" fontWeight="bold">{formatNumber(instagramData?.avgLikes)}</Typography>
                                <Typography variant="caption" color="rgba(255,255,255,0.5)">Likes</Typography>
                            </Box>
                            <Divider orientation="vertical" flexItem sx={{bgcolor: 'rgba(255,255,255,0.1)'}} />
                            {/* Comentários */}
                            <Box textAlign="center">
                                <Box sx={{ width: 60, height: 60, borderRadius: '50%', bgcolor: 'rgba(0, 230, 118, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 1 }}>
                                    <ChatBubbleIcon sx={{ color: '#00E676', fontSize: 28 }} />
                                </Box>
                                <Typography variant="h5" fontWeight="bold">{formatNumber(instagramData?.avgComments)}</Typography>
                                <Typography variant="caption" color="rgba(255,255,255,0.5)">Comentários</Typography>
                            </Box>
                            <Divider orientation="vertical" flexItem sx={{bgcolor: 'rgba(255,255,255,0.1)'}} />
                            {/* Views (se disponível) */}
                            <Box textAlign="center">
                                <Box sx={{ width: 60, height: 60, borderRadius: '50%', bgcolor: 'rgba(255, 23, 68, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 1 }}>
                                    <VisibilityIcon sx={{ color: '#FF1744', fontSize: 28 }} />
                                </Box>
                                <Typography variant="h5" fontWeight="bold">{formatNumber(instagramData?.avgViews)}</Typography>
                                <Typography variant="caption" color="rgba(255,255,255,0.5)">Visualizações</Typography>
                            </Box>
                        </Box>
                    </Box>

                    {/* Gráfico de Qualidade (Rosca) */}
                    <Box sx={{ p: 3, bgcolor: "rgba(255,255,255,0.02)", borderRadius: "20px", border: "1px solid rgba(255,255,255,0.05)", display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <Typography variant="subtitle1" fontWeight="600" mb={1}>Autenticidade da Base</Typography>
                        <Box width="100%" height={180}>
                            <ResponsiveContainer>
                                <PieChart>
                                    <Pie data={qualityData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none">
                                        {qualityData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.fill} />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<CustomTooltip unit="%" />} />
                                    <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" fill="white" fontSize="24" fontWeight="bold">
                                        {qualityData[0].value}%
                                    </text>
                                </PieChart>
                            </ResponsiveContainer>
                        </Box>
                        <Typography variant="caption" sx={{color: 'rgba(255,255,255,0.5)'}}>Seguidores Reais Estimados</Typography>
                    </Box>
                </Box>

                {/* --- LINHA 3: DEMOGRAFIA (DADOS REAIS DA API) --- */}
                <Box display="grid" gridTemplateColumns={{ xs: "1fr", md: "1fr 1fr 1fr" }} gap={2}>
                    {/* Idade */}
                    <Box sx={{ p: 2, bgcolor: "rgba(255,255,255,0.02)", borderRadius: "20px", border: "1px solid rgba(255,255,255,0.05)" }}>
                        <Box display="flex" alignItems="center" gap={1} mb={2}>
                            <CakeIcon sx={{color: "#AB47BC"}} fontSize="small"/>
                            <Typography variant="subtitle2" fontWeight="bold">Faixa Etária</Typography>
                        </Box>
                        <Box height={150}>
                            <ResponsiveContainer>
                                <BarChart data={ageData} layout="vertical" margin={{left: -20}}>
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="name" type="category" width={50} tick={{fill: "#aaa", fontSize: 11}} axisLine={false} tickLine={false}/>
                                    <Tooltip content={<CustomTooltip unit="%" />} cursor={{fill: 'transparent'}} />
                                    <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={16}>
                                        {ageData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.fill} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </Box>
                    </Box>

                    {/* Gênero */}
                    <Box sx={{ p: 2, bgcolor: "rgba(255,255,255,0.02)", borderRadius: "20px", border: "1px solid rgba(255,255,255,0.05)" }}>
                        <Box display="flex" alignItems="center" gap={1} mb={2}>
                            <WcIcon sx={{color: "#29B6F6"}} fontSize="small"/>
                            <Typography variant="subtitle2" fontWeight="bold">Gênero</Typography>
                        </Box>
                        <Box height={150} display="flex" alignItems="center">
                            <ResponsiveContainer>
                                <PieChart>
                                    <Pie data={genderData} cx="50%" cy="50%" outerRadius={60} dataKey="value" stroke="none">
                                        {genderData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.fill} />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<CustomTooltip unit="%" />} />
                                    <Legend verticalAlign="middle" align="right" layout="vertical" iconType="circle" wrapperStyle={{fontSize: '12px', color: '#aaa'}}/>
                                </PieChart>
                            </ResponsiveContainer>
                        </Box>
                    </Box>

                    {/* Países */}
                    <Box sx={{ p: 2, bgcolor: "rgba(255,255,255,0.02)", borderRadius: "20px", border: "1px solid rgba(255,255,255,0.05)" }}>
                        <Box display="flex" alignItems="center" gap={1} mb={2}>
                            <PublicIcon sx={{color: "#66BB6A"}} fontSize="small"/>
                            <Typography variant="subtitle2" fontWeight="bold">Principais Países</Typography>
                        </Box>
                        <Box height={150} display="flex" flexDirection="column" gap={1} justifyContent="center">
                            {countryData.length > 0 ? countryData.map((country, idx) => (
                                <Box key={idx} display="flex" alignItems="center" justifyContent="space-between" px={2}>
                                    <Box display="flex" alignItems="center" gap={1}>
                                        <Typography variant="caption" fontWeight="bold" sx={{color: '#fff', minWidth: 20}}>{country.name}</Typography>
                                        <Box width={100} height={6} bgcolor="rgba(255,255,255,0.1)" borderRadius={1}>
                                            <Box width={`${country.value}%`} height="100%" bgcolor="#66BB6A" borderRadius={1} />
                                        </Box>
                                    </Box>
                                    <Typography variant="caption" color="rgba(255,255,255,0.6)">{country.value}%</Typography>
                                </Box>
                            )) : (
                                <Typography variant="caption" align="center" color="rgba(255,255,255,0.3)">Dados geográficos insuficientes</Typography>
                            )}
                        </Box>
                    </Box>
                </Box>
            </Box>
        );

     case "twitch":
        return (
            <Box display="flex" flexDirection="column" gap={3} key="twitch-content">
                <Box display="grid" gridTemplateColumns={{ xs: "1fr", md: "repeat(3, 1fr)" }} gap={2}>
                    <StatCard 
                        title="Seguidores" 
                        value={twitchData ? formatNumber(twitchData.followers) : "N/A"} 
                        icon={GroupAddIcon} 
                        color="#9146FF" 
                        gradient="linear-gradient(135deg, #9146FF 0%, #F0F0FF 100%)"
                    />
                    <StatCard 
                        title="Views Totais" 
                        value={twitchData ? formatNumber(twitchData.totalViews) : "N/A"} 
                        icon={VisibilityIcon} 
                        color="#FFFFFF" 
                    />
                     <StatCard 
                        title="Último Jogo / Categoria" 
                        value={twitchData?.lastGame || "Variedades"} 
                        subtext={twitchData?.language ? `Idioma: ${twitchData.language.toUpperCase()}` : ""}
                        icon={SportsEsportsIcon} 
                        color="#00E676" 
                    />
                </Box>
                
                {/* Exemplo de card extra para Twitch */}
                <Box sx={{ p: 3, bgcolor: "rgba(145, 70, 255, 0.1)", borderRadius: "20px", border: "1px solid rgba(145, 70, 255, 0.3)", display: 'flex', alignItems: 'center', gap: 2 }}>
                    <SiTwitch size={40} color="#9146FF" />
                    <Box>
                        <Typography variant="h6" fontWeight="bold">Canal na Twitch</Typography>
                        <Typography variant="body2" sx={{ opacity: 0.7 }}>
                            {twitchData?.description || "Sem descrição disponível na Twitch."}
                        </Typography>
                    </Box>
                </Box>
            </Box>
        );

      case "tiktok":
        return (
            <Box display="flex" flexDirection="column" gap={3} key="tiktok-content">
                 <Box display="grid" gridTemplateColumns={{ xs: "1fr", md: "repeat(3, 1fr)" }} gap={2}>
                    <StatCard 
                        title="Seguidores" 
                        value={tiktokData ? formatNumber(tiktokData.followers) : "N/A"} 
                        icon={GroupAddIcon} 
                        color="#00f2ea" 
                        gradient="linear-gradient(135deg, #00f2ea 0%, #ff0050 100%)"
                    />
                    <StatCard 
                        title="Total de Curtidas" 
                        value={tiktokData ? formatNumber(tiktokData.likes) : "N/A"} 
                        icon={ThumbUpAltIcon} 
                        color="#ff0050" 
                    />
                    <StatCard 
                        title="Engajamento Est." 
                        value={tiktokData?.engagementRate ? `${tiktokData.engagementRate}%` : "N/A"} 
                        subtext="Baseado em likes/seguidores"
                        icon={TrendingUpIcon} 
                        color="#FFFFFF" 
                    />
                </Box>
                
            </Box>
        );

     case "geral":
      default:
        const totalFollowers = (safeYoutubeData.subscriberCount ? Number(safeYoutubeData.subscriberCount) : 0) + 
                               (instagramData?.followers ? Number(instagramData.followers) : 0) + 
                               (tiktokData?.followers ? Number(tiktokData.followers) : 0) +
                               (twitchData?.followers ? Number(twitchData.followers) : 0);
        
        return (
          <Box display="flex" flexDirection="column" gap={3} key="geral-content">
                
                {/* --- NOVO: CARD DE ANÁLISE DA IA --- */}
                <Fade in={true}>
                    <Box sx={{
                        p: 3,
                        borderRadius: "20px",
                        background: "linear-gradient(90deg, rgba(40,10,80,0.6) 0%, rgba(20,0,40,0.4) 100%)",
                        border: "1px solid rgba(147, 51, 234, 0.3)",
                        boxShadow: "0 0 20px rgba(147, 51, 234, 0.15)",
                        display: "flex",
                        flexDirection: "column",
                        gap: 1
                    }}>
                        <Box display="flex" alignItems="center" gap={1}>
                            <AutoAwesomeIcon sx={{ color: "#d8b4fe" }} />
                            <Typography variant="subtitle1" fontWeight="bold" sx={{ color: "#d8b4fe", letterSpacing: 1 }}>
                                ANÁLISE ESTRATÉGICA (IA)
                            </Typography>
                        </Box>
                        
                        {loadingAi ? (
                            <Box display="flex" alignItems="center" gap={2} mt={1}>
                                <CircularProgress size={20} sx={{ color: "#d8b4fe" }} />
                                <Typography variant="body2" color="rgba(255,255,255,0.7)">
                                    Processando métricas em tempo real...
                                </Typography>
                            </Box>
                        ) : (
                        <Typography 
                variant="body1" 
                sx={{ 
                    color: "white", 
                    lineHeight: 1.7,       // Mais espaçamento entre linhas para leitura fácil
                    fontStyle: 'italic', 
                    mt: 2,                 // Mais margem no topo
                    whiteSpace: 'pre-line' // IMPORTANTE: Respeita parágrafos e quebras de linha da IA
                }}
            >
                "{aiAnalysis || "Aguardando dados para gerar o relatório..."}"
            </Typography>
        )}
                     
                    </Box>
                </Fade>

                <Box display="grid" gridTemplateColumns={{ xs: "1fr", md: "1fr 1fr" }} gap={2}>
                    <StatCard 
                        title="Alcance Potencial Total" 
                        value={formatNumber(totalFollowers)} 
                        icon={PublicIcon} 
                        color="#00E5FF" 
                        gradient="linear-gradient(135deg, #00E5FF 0%, #2979FF 100%)"
                    />
                    <StatCard 
                        title="Plataformas Conectadas" 
                        value={Object.values(socialLinks || {}).filter(Boolean).length} 
                        icon={DashboardIcon} 
                        color="#FFFFFF" 
                    />
                </Box>
                
                <Typography variant="body2" align="center" sx={{opacity: 0.5, mt: 4}}>
                    

                    Selecione uma plataforma específica acima para ver gráficos demográficos e engajamento detalhado.
                </Typography>
          </Box>
        );
    }
  };

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
      
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={5} flexWrap="wrap" gap={2}>
        <Box>
            <Typography variant="h4" fontWeight="800" letterSpacing="-0.5px" sx={{ background: "linear-gradient(90deg, #fff, #888)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                Analytics Hub
            </Typography>
            <Typography variant="body2" sx={{color: 'rgba(255,255,255,0.5)', mt: 0.5, maxWidth: 400}}>
                 Dados atualizados em tempo real via APIs oficiais e de terceiros.
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
                
                {socialLinks?.youtube && (
                    <MenuItem value="youtube">
                        <Box display="flex" alignItems="center" gap={1.5}><YouTubeIcon fontSize="small" sx={{color: '#FF0000'}}/> YouTube</Box>
                    </MenuItem>
                )}
                
                {socialLinks?.instagram && (
                    <MenuItem value="instagram">
                        <Box display="flex" alignItems="center" gap={1.5}><InstagramIcon fontSize="small" sx={{color: '#E1306C'}}/> Instagram</Box>
                    </MenuItem>
                )}
                 {socialLinks?.tiktok && (
                    <MenuItem value="tiktok">
                        <Box display="flex" alignItems="center" gap={1.5}><MusicNoteIcon fontSize="small" sx={{color: '#00f2ea'}}/> TikTok</Box>
                    </MenuItem>
                )}
                 {socialLinks?.twitch && (
                    <MenuItem value="twitch">
                        <Box display="flex" alignItems="center" gap={1.5}><SportsEsportsIcon fontSize="small" sx={{color: '#9146FF'}}/> Twitch</Box>
                    </MenuItem>
                )}
            </Select>
        </FormControl>
      </Box>

      {renderContent()}

    </Box>
  );
}