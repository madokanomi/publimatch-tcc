import React, { useState, useEffect } from 'react'; // ✨ 1. IMPORTADO O useState e useEffect
import { Box, Typography } from "@mui/material";
import CampaignIcon from "@mui/icons-material/Campaign";
import Visibility from "@mui/icons-material/Visibility"; // ✨ 2. IMPORTADO O ÍCONE DE VIEWS
// PercentIcon e StarIcon não são mais usados neste bloco
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

// ... (Seu CustomTooltip helper - SEM MUDANÇAS) ...
const CustomTooltip = ({ active, payload, label, unit = "" }) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <Box sx={{ /* ... estilos ... */ }}>
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

// ... (Seu ChartWrapper helper - SEM MUDANÇAS) ...
const ChartWrapper = ({ children }) => (
  <Box sx={{ flex: 1, minHeight: '250px' }}>
    <ResponsiveContainer width="100%" height="100%">
      {children}
    </ResponsiveContainer>
  </Box>
);

// ✨ 3. ADICIONADA A FUNÇÃO DE FORMATAR NÚMEROS (do seu exemplo)
const fmt = (v) => {
    if (v === null || v === undefined || v === "") return "—";
    const num = Number(v);
    if (isNaN(num)) return v;
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
    return `${num}`;
};

// Componente Principal de Estatísticas da Campanha
const CampaignStats = ({ campaign }) => {

  // ✨ 4. ESTADOS LOCAIS PARA OS TOTAIS DO YOUTUBE
  const [totalPublicacoes, setTotalPublicacoes] = useState(0);
  const [totalVisualizacoes, setTotalVisualizacoes] = useState(0);

  // ✨ 5. USEEFFECT PARA LER OS DADOS DO LOCALSTORAGE
  useEffect(() => {
    // Só executa se o objeto 'campaign' (com o ID) estiver pronto
    if (!campaign?._id) return;

    // Define as chaves de armazenamento (as mesmas do CampaignInfluencers.jsx)
    const countsKey = `yt_counts_${campaign._id}`;
    const viewsKey = `yt_views_${campaign._id}`;

    // Lê os dados salvos
    const savedCounts = localStorage.getItem(countsKey);
    const savedViews = localStorage.getItem(viewsKey);

    const countsData = savedCounts ? JSON.parse(savedCounts) : {};
    const viewsData = savedViews ? JSON.parse(savedViews) : {};

    // Calcula os totais
    const totalPubs = Object.values(countsData)
                         .reduce((acc, count) => acc + (count === 'Erro' ? 0 : Number(count)), 0);
                         
    const totalViews = Object.values(viewsData)
                         .reduce((acc, views) => acc + (views === 'Erro' ? 0 : Number(views)), 0);
    
    // Salva os totais no estado para re-renderizar
    setTotalPublicacoes(totalPubs);
    setTotalVisualizacoes(totalViews);

  }, [campaign]); // Este efeito roda sempre que o objeto 'campaign' mudar

 
  // --- (Seus dados de gráficos mockados - SEM MUDANÇAS) ---
  const ageData = [ /* ... */ ];
  const pieColors = ["#d84ca8", "#9b2ecc", "#5a2b8b", "#7E57C2"];
  const platformEngagementData = (campaign.redesNecessarias || []).map(rede => { /* ... */ });
  const barGradientId = "barGradient";
  const cardSx = { /* ... */ };

  return (
    <Box sx={{ /* ... (Seu Box principal - SEM MUDANÇAS) ... */ }}>
      <Box display="grid" gridTemplateColumns={{ xs: '1fr', md: '5fr 7fr' }} gap={3}>
        
        {/* COLUNA DA ESQUERDA */}
        <Box display="flex" flexDirection="column" gap={3}>
          <Typography variant="h5" fontWeight="600">
            Estatísticas do YouTube
          </Typography>
          
          {/* ✨ 6. CARDS DE MÉTRICAS PRINCIPAIS (SUBSTITUÍDOS) */}
          <Box display="grid" gridTemplateColumns="repeat(2, 1fr)" gap={2}>
            
            {/* Card 1: Publicações Totais (Real) */}
            <Box sx={{ p: 2, background: "rgba(216,76,168,0.12)", borderRadius: 2, textAlign: 'center' }}>
              <CampaignIcon sx={{ fontSize: 32 }} />
              <Typography variant="h5" fontWeight="700">
                {totalPublicacoes}
              </Typography>
              <Typography variant="caption">Todas as Publicações</Typography>
            </Box>
            
            {/* Card 2: Views Totais (Real) */}
            <Box sx={{ p: 2, background: "rgba(123,43,214,0.12)", borderRadius: 2, textAlign: 'center' }}>
              <Visibility sx={{ fontSize: 32 }} />
              <Typography variant="h5" fontWeight="700">
                {fmt(totalVisualizacoes)}
              </Typography>
              <Typography variant="caption">Visualizações Totais</Typography>
            </Box>

          </Box>
          
          {/* GRÁFICO DE PÚBLICO GERAL (Mantido) */}
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

        {/* COLUNA DA DIREITA (Mantida) */}
        <Box sx={cardSx}>
          <Typography variant="h6" fontWeight={600}>Engajamento por plataforma</Typography>
          <ChartWrapper>
            <BarChart data={platformEngagementData} margin={{ top: 30, right: 20, left: -20, bottom: 5 }}>
              <defs>
                  <linearGradient id={barGradientId} x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="#d84ca8" />
                      <stop offset="100%" stopColor="#7b2bd6" />
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