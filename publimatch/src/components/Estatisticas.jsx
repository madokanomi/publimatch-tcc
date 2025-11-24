import React, { useState, useMemo } from "react";
import { Box, Typography, Select, MenuItem, FormControl, InputLabel, Grid, LinearProgress, Divider } from "@mui/material";

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

// --- Componente Principal ---

export default function Estatisticas({ youtubeData, instagramData, socialLinks }) {
  const [platform, setPlatform] = useState("geral");

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
  // --- Renderização Condicional ---

  const renderContent = () => {
    switch (platform) {
      case "youtube":
        return (
            <Box display="flex" flexDirection="column" gap={3} key="youtube-content">
                {/* KPI HERO */}
                <Box display="grid" gridTemplateColumns={{ xs: "1fr", md: "repeat(3, 1fr)" }} gap={2}>
                    <StatCard 
                        title="Inscritos" 
                        value={youtubeData ? formatNumber(youtubeData.subscriberCount) : "N/A"} 
                        icon={GroupAddIcon} 
                        color="#FF0000" 
                        gradient="linear-gradient(135deg, #FF0000 0%, #FF8A80 100%)"
                    />
                    <StatCard 
                        title="Visualizações Totais" 
                        value={youtubeData ? formatNumber(youtubeData.viewCount) : "N/A"} 
                        icon={VideoLibraryIcon} 
                        color="#FFFFFF" 
                    />
                    <StatCard 
                        title="Vídeos Publicados" 
                        value={youtubeData ? formatNumber(youtubeData.videoCount) : "N/A"} 
                        icon={DashboardIcon} 
                        color="#FFFFFF" 
                    />
                </Box>

                {/* Gráfico de Área - Views */}
                <Box sx={{ p: 3, bgcolor: "rgba(255,255,255,0.02)", borderRadius: "20px", border: "1px solid rgba(255,255,255,0.05)" }}>
                    <Typography variant="h6" fontWeight="bold" mb={3} display="flex" alignItems="center" gap={1}>
                        <TrendingUpIcon sx={{ color: "#FF0000" }} /> Tendência de Visualizações
                    </Typography>
                    <Box height={300}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={[{date:'Jan', v:80}, {date:'Fev', v:100}, {date:'Mar', v:150}, {date:'Abr', v:200}, {date:'Mai', v:280}, {date:'Jun', v:400}]}>
                                <defs>
                                    <linearGradient id="colorView" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#FF0000" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#FF0000" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false}/>
                                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill:'rgba(255,255,255,0.5)'}} />
                                <YAxis axisLine={false} tickLine={false} tick={{fill:'rgba(255,255,255,0.5)'}} />
                                <Tooltip content={<CustomTooltip />} />
                                <Area type="monotone" dataKey="v" stroke="#FF0000" strokeWidth={3} fillOpacity={1} fill="url(#colorView)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </Box>
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
                        subtext={instagramData?.engagementRate > 2 ? "Performance Alta 🚀" : "Performance Média"}
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

      case "tiktok":
      case "twitch":
        return (
            <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="50vh" gap={2}>
                <Typography variant="h5" color="rgba(255,255,255,0.5)">
                    Integração com {platform.charAt(0).toUpperCase() + platform.slice(1)} em desenvolvimento
                </Typography>
            </Box>
        );

      case "geral":
      default:
        return (
          <Box display="flex" flexDirection="column" gap={3} key="geral-content">
                <Box display="grid" gridTemplateColumns={{ xs: "1fr", md: "1fr 1fr" }} gap={2}>
                    <StatCard 
                        title="Alcance Potencial Total" 
                        value={formatNumber((youtubeData?.subscriberCount || 0) + (instagramData?.followers || 0))} 
                        icon={PublicIcon} 
                        color="#FFFFFF" 
                    />
                    <StatCard 
                        title="Campanhas Ativas" 
                        value="3" 
                        icon={DashboardIcon} 
                        color="#FFFFFF" 
                    />
                </Box>
                <Typography variant="body2" align="center" sx={{opacity: 0.5, mt: 4}}>
                    Selecione uma plataforma específica acima para ver análises detalhadas.
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