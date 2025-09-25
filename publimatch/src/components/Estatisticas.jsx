import React from "react";
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
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  BarChart,
  Bar,
} from "recharts";


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
        
        <Typography variant="body2" sx={{ color: data.color || "#FFF" }}>
          <span style={{ color: "rgba(255,255,255,0.7)" }}>{data.name}: </span>
          <strong>{`${data.value}${unit}`}</strong>
        </Typography>
      </Box>
    );
  }
  return null;
};

const ChartWrapper = ({ children }) => (
  <Box sx={{ width: "100%", height: "100%", display: "flex", alignItems: "stretch" }}>
    <ResponsiveContainer width="100%" height="100%">
      {children}
    </ResponsiveContainer>
  </Box>
);

export default function Estatisticas() {
  const ageData = [
    { name: "18-25 Anos", value: 30.3 }, { name: "25-40 Anos", value: 32.4 },
    { name: "40+ Anos", value: 12.0 }, { name: "10-18 Anos", value: 25.3 },
  ];

  const followersData = [
    { date: "01/02", Seguidores: 80 }, { date: "01/03", Seguidores: 30 },
    { date: "01/04", Seguidores: 55 }, { date: "01/05", Seguidores: 85 },
    { date: "01/06", Seguidores: 22 },
  ];
  const campaignData = [
    { name: "iPhone 17", Engajamento: 100 }, { name: "Heineken", Engajamento: 25 },
    { name: "Publi", Engajamento: 75 }, { name: "Komonew", Engajamento: 12 },
  ];
  const trueEngagement = [
    { name: "Público Real", value: 95 }, { name: "Bots", value: 5 },
  ];
  
  const pieColors = ["#d84ca8", "#9b2ecc", "#5a2b8b", "#2e1b3a"];
  const areaGradientId = "areaGradient";
  const barGradientCampaign = "barGradientCampaign";

  const cardBoxSx = {
    p: 2, height: "40vh", display: "flex", flexDirection: "column",
    background: "linear-gradient(180deg, rgba(255,255,255,0.05), rgba(0,0,0,0.0))",
    borderRadius: "15px",
  };

  return (
    <Box pl={5} pr={5} sx={{ backgroundColor: "rgba(27, 27, 27, 0.26)", borderRadius: "20px", p: 3, backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.1)" }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight="bold">Estatísticas</Typography>
      </Box>

      <Box display="grid" gridTemplateColumns="repeat(12, 1fr)" gap="20px">
        <Box sx={cardBoxSx} gridColumn={{ xs: "span 12", md: "span 5" }}>
          <Typography variant="h4" fontWeight={600} noWrap>Público Geral</Typography>
          <ChartWrapper>
            <PieChart>
              <Pie data={ageData} dataKey="value" startAngle={90} endAngle={-270} innerRadius="40%" outerRadius="75%" paddingAngle={2} stroke="transparent">
                {ageData.map((entry, index) => (<Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />))}
              </Pie>
              <Tooltip 
                isAnimationActive={false} // <-- MUDANÇA AQUI
                content={<CustomTooltip unit="%" />} 
                cursor={{ fill: "rgba(255,255,255,0.1)" }} 
              />
            </PieChart>
          </ChartWrapper>
          <Box display="flex" justifyContent="space-around" flexWrap="wrap" gap={1} mt={1}>
            {ageData.map((d, i) => (
              <Box key={d.name} display="flex" alignItems="center" gap={1}>
                <Box sx={{ width: 10, height: 10, borderRadius: 2, background: pieColors[i % pieColors.length] }} />
                <Typography variant="caption" color="rgba(255,255,255,0.75)">{d.name} <strong>{d.value}%</strong></Typography>
              </Box>
            ))}
          </Box>
        </Box>

        <Box sx={cardBoxSx} gridColumn={{ xs: "span 12", md: "span 7" }}>
          <Typography variant="h4" fontWeight={600} noWrap>Crescimento de Seguidores</Typography>
          <ChartWrapper>
            <AreaChart data={followersData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
              <defs><linearGradient id={areaGradientId} x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#d84ca8" stopOpacity={0.85} /><stop offset="100%" stopColor="#7b2bd6" stopOpacity={0.06} /></linearGradient></defs>
              <CartesianGrid strokeDasharray="4 4" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="date" tick={{ fill: "rgba(255,255,255,0.7)", fontSize: 12 }} />
              <YAxis tick={{ fill: "rgba(255,255,255,0.7)", fontSize: 12 }} />
              <Tooltip 
                isAnimationActive={false} // <-- MUDANÇA AQUI
                content={<CustomTooltip />} 
                cursor={{ stroke: "#d84ca8", strokeWidth: 1, strokeDasharray: "3 3" }} 
              />
              <Area type="monotone" dataKey="Seguidores" stroke="#d84ca8" fill={`url(#${areaGradientId})`} strokeWidth={3} dot={{ r: 4 }} />
            </AreaChart>
          </ChartWrapper>
        </Box>

        <Box sx={cardBoxSx} gridColumn={{ xs: "span 12", md: "span 4" }}>
          <Typography variant="h4" fontWeight={600} noWrap>Engajamento Campanhas</Typography>
          <ChartWrapper>
            <BarChart data={campaignData} margin={{ top: 20, right: 10, left: -10, bottom: 0 }}>
              <defs><linearGradient id={barGradientCampaign} x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#d84ca8" /><stop offset="100%" stopColor="#7b2bd6" /></linearGradient></defs>
              <CartesianGrid strokeDasharray="4 4" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="name" tick={{ fill: "rgba(255,255,255,0.75)", fontSize: 11 }} interval={0} />
              <YAxis tick={{ fill: "rgba(255,255,255,0.7)", fontSize: 12 }} />
              <Tooltip 
                isAnimationActive={false} // <-- MUDANÇA AQUI
                content={<CustomTooltip />} 
                cursor={{ fill: "rgba(255,255,255,0.1)" }} 
              />
              <Bar dataKey="Engajamento" fill={`url(#${barGradientCampaign})`} radius={[8, 8, 0, 0]} barSize={35} />
            </BarChart>
          </ChartWrapper>
        </Box>

        <Box sx={cardBoxSx} gridColumn={{ xs: "span 12", md: "span 4" }}>
          <Typography variant="h4" fontWeight={600} noWrap>Engajamento Verdadeiro</Typography>
          <ChartWrapper>
            <PieChart>
              <Pie data={trueEngagement} dataKey="value" innerRadius="40%" outerRadius="75%" startAngle={90} endAngle={-270} paddingAngle={2}>
                <Cell fill="#d84ca8" stroke="none" />
                <Cell fill="#ffffff" stroke="none" />
              </Pie>
              <Tooltip 
                isAnimationActive={false} // <-- MUDANÇA AQUI
                content={<CustomTooltip unit="%" />} 
                cursor={{ fill: "rgba(255,255,255,0.1)" }} 
              />
            </PieChart>
          </ChartWrapper>
          <Box display="flex" justifyContent="center" gap={4} mt={1}>
            <Typography variant="body2">Público Real <strong>95%</strong></Typography>
            <Typography variant="body2">Bots <strong>5%</strong></Typography>
          </Box>
        </Box>

        <Box sx={cardBoxSx} gridColumn={{ xs: "span 12", md: "span 4" }}>
          <Typography variant="h4" fontWeight={600}>Estatísticas Chave</Typography>
          <Box display="flex" flexDirection="column" gap={2} mt={2} flex={1} justifyContent="space-around">
            <Box sx={{ flex: 1, p: 2, borderRadius: 2, background: "rgba(216,76,168,0.12)", display: 'flex', alignItems: 'center', gap: 2 }}>
              <CampaignIcon />
              <Box><Typography variant="h4" fontWeight="700">23</Typography><Typography variant="h5">Campanhas Realizadas</Typography></Box>
            </Box>
            <Box sx={{ flex: 1, p: 2, borderRadius: 2, background: "rgba(123,43,214,0.12)", display: 'flex', alignItems: 'center', gap: 2 }}>
              <PercentIcon />
              <Box><Typography variant="h4" fontWeight="700">80%</Typography><Typography variant="h5">Taxa de Conversão</Typography></Box>
            </Box>
            <Box sx={{ flex: 1, p: 2, borderRadius: 2, background: "rgba(255,255,255,0.06)", display: 'flex', alignItems: 'center', gap: 2 }}>
              <StarIcon />
              <Box><Typography variant="h4" fontWeight="700">4.2</Typography><Typography variant="h5">Ótima Avaliação</Typography></Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}