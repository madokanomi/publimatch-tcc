import React from 'react';
import { Box, Typography } from "@mui/material";
import CampaignIcon from "@mui/icons-material/Campaign";
import PercentIcon from "@mui/icons-material/Percent";
import StarIcon from "@mui/icons-material/Star";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

// Ferramenta de Dica Personalizada para os Gráficos
const CustomTooltip = ({ active, payload, label, unit = "" }) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <Box
        sx={{
          background: "rgba(25, 25, 25, 0.8)",
          backdropFilter: "blur(5px)",
          border: "1px solid rgba(255, 255, 255, 0.2)",
          borderRadius: "10px",
          p: "10px 15px",
          color: "white",
     
        }}
      >
        <Typography variant="body2" sx={{ fontWeight: "bold", mb: 1 }}>
          {label || data.name}
        </Typography>
        <Typography variant="body2" sx={{ color: "white" }}> 
          <span style={{ color: "rgba(255,255,255,0.7)" }}>{data.name}: </span>
          <strong>{`${data.value}${unit}`}</strong>
        </Typography>
      </Box>
    );
  }
  return null;
};

// Wrapper para tornar os gráficos responsivos
const ChartWrapper = ({ children }) => (
  <Box sx={{ flex: 1, minHeight: '250px' }}>
    <ResponsiveContainer width="100%" height="100%">
      {children}
    </ResponsiveContainer>
  </Box>
);

// Componente Principal de Estatísticas da Campanha
const CampaignStats = ({ campaign }) => {
  
  // --- DADOS PARA OS GRÁFICOS ---
  const ageData = [
    { name: "18 - 25 Anos", value: 30.3 },
    { name: "25 - 40 Anos", value: 32.4 },
    { name: "40 - Acima", value: 12.0 },
    { name: "10 - 18 Anos", value: 25.3 },
  ];
  const pieColors = ["#d84ca8", "#9b2ecc", "#5a2b8b", "#7E57C2"];

  const platformEngagementData = (campaign.redesNecessarias || []).map(rede => {
    const platformMap = {
      tiktok: { name: 'TikTok', value: 100 },
      twitch: { name: 'Twitch', value: 30 },
      instagram: { name: 'Instagram', value: 75 },
      youtube: { name: 'Youtube', value: 15 },
      twitter: { name: 'Twitter', value: 25 },
    };
    return platformMap[rede] || { name: rede, value: 50 };
  });

  const barGradientId = "barGradient";
  
  // --- ESTILOS REUTILIZÁVEIS ---
  const cardSx = {
    p: 3,
    display: "flex",
    flexDirection: "column",
    background: "rgba(255,255,255,0.03)",
    backdropFilter: "blur(10px)",
    borderRadius: "15px",
    border: "1px solid rgba(255,255,255,0.1)",
    height: '100%'
  };

  return (
    <Box
      sx={{
        backgroundColor: "rgba(20, 1, 19, 0.6)",
        p: 3,
        borderRadius: "12px",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        color: 'white',
        height: '100%',
        overflowY: 'hidden',
             mb:"100px",
        "&::-webkit-scrollbar": { width: "8px" },
        "&::-webkit-scrollbar-track": { background: "rgba(0, 0, 0, 0.2)", borderRadius: "10px" },
        "&::-webkit-scrollbar-thumb": { backgroundColor: "rgba(255, 255, 255, 0.3)", borderRadius: "10px", border: "2px solid transparent", backgroundClip: "content-box" },
        "&::-webkit-scrollbar-thumb:hover": { backgroundColor: "rgba(255, 255, 255, 0.5)" }
      }}
    >
      <Box display="grid" gridTemplateColumns={{ xs: '1fr', md: '5fr 7fr' }} gap={3}>
        
        {/* COLUNA DA ESQUERDA */}
        <Box display="flex" flexDirection="column" gap={3}>
          <Typography variant="h5" fontWeight="600">
            Estatísticas
          </Typography>
          
          {/* CARDS DE MÉTRICAS PRINCIPAIS */}
          <Box display="grid" gridTemplateColumns="repeat(3, 1fr)" gap={2}>
            <Box sx={{ p: 2, background: "rgba(216,76,168,0.12)", borderRadius: 2, textAlign: 'center' }}>
              <CampaignIcon sx={{ fontSize: 32 }} />
              <Typography variant="h5" fontWeight="700">23</Typography>
              <Typography variant="caption">Publicações Realizadas</Typography>
            </Box>
            <Box sx={{ p: 2, background: "rgba(123,43,214,0.12)", borderRadius: 2, textAlign: 'center' }}>
              <PercentIcon sx={{ fontSize: 32 }} />
              <Typography variant="h5" fontWeight="700">{campaign.conversion}</Typography>
              <Typography variant="caption">Taxa de Conversão</Typography>
            </Box>
            <Box sx={{ p: 2, background: "rgba(90,43,139,0.12)", borderRadius: 2, textAlign: 'center' }}>
              <StarIcon sx={{ fontSize: 32 }} />
              <Typography variant="h5" fontWeight="700">{campaign.influencers}</Typography>
              <Typography variant="caption">Influenciadores vinculados</Typography>
            </Box>
          </Box>
          
          {/* GRÁFICO DE PÚBLICO GERAL */}
          <Box sx={cardSx}>
            <Typography variant="h6" fontWeight={600} noWrap>Público Geral</Typography>
            <ChartWrapper>
              <PieChart>
                <Pie data={ageData} dataKey="value" startAngle={90} endAngle={-270} innerRadius="55%" outerRadius="80%" paddingAngle={2} stroke="none">
                  {ageData.map((entry, index) => (<Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />))}
                </Pie>
                <Tooltip content={<CustomTooltip unit="%" />} cursor={{ fill: "rgba(255,255,255,0.1)" }} />
              </PieChart>
            </ChartWrapper>
            <Box display="flex" justifyContent="center" flexWrap="wrap" gap={2} mt={1}>
              {ageData.map((d, i) => (
                <Box key={d.name} display="flex" alignItems="center" gap={1}>
                  <Box sx={{ width: 10, height: 10, borderRadius: '50%', background: pieColors[i % pieColors.length] }} />
                  <Typography variant="caption" color="rgba(255,255,255,0.75)">{d.name}</Typography>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>

        {/* COLUNA DA DIREITA */}
        <Box sx={cardSx}>
          <Typography variant="h6" fontWeight={600}>Engajamento por plataforma</Typography>
          <ChartWrapper>
            <BarChart data={platformEngagementData} margin={{ top: 30, right: 20, left: -20, bottom: 5 }}>
              <defs>
                  <linearGradient id={barGradientId} x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="#d84ca8" />
                      <stop offset="100%" stopColor="#7b2bd6" />
                  {/* CORREÇÃO AQUI */}
                  </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
              <XAxis dataKey="name" tick={{ fill: "rgba(255,255,255,0.7)", fontSize: 12 }} />
              <YAxis tick={{ fill: "rgba(255,255,255,0.7)", fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.1)" }} />
              <Bar dataKey="value" name="Engajamento" fill={`url(#${barGradientId})`} radius={[8, 8, 0, 0]} barSize={40} />
            </BarChart>
          </ChartWrapper>
        </Box>

      </Box>
    </Box>
  );
};

export default CampaignStats;