import React from "react";
import { Typography, Box } from "@mui/material";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// ===================================================================
// 1. DADOS ATUALIZADOS COM CHAVE MAIS DESCRITIVA
// ===================================================================
const data = [
  { name: "Lançamento IPhone 17", Candidaturas: 100 },
  { name: "Viva o Agora - Heineken", Candidaturas: 25 },
  { name: "Campanha Publi", Candidaturas: 75 },
  { name: "Komonew: Criando o Novo", Candidaturas: 10 },
];


// ===================================================================
// 2. COMPONENTE DE TOOLTIP CUSTOMIZADO ADICIONADO AQUI
// ===================================================================
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

const BarCharts = () => {
  return (
    <div style={{ width: "100%", height: 500 , borderRadius: "16px", padding:"20px"}}>
       <Typography variant="h3" fontWeight="bold" color="white" mt="0.5vh"mb="3.7vh">Candidaturas nas Campanhas</Typography>
      <ResponsiveContainer  width="105%" height={513}>
        <BarChart data={data} margin={{ top: 40, right: 30, left: 20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.3)" />
          <XAxis dataKey="name" tick={{ fill: "white", fontSize: 14 }} />
          <YAxis domain={[0, 100]} tick={{ fill: "white", fontSize: 14 }} />
          
          {/* =================================================================== */}
          {/* 3. TOOLTIP ATUALIZADO AQUI                                          */}
          {/* =================================================================== */}
          <Tooltip
            isAnimationActive={false}
            content={<CustomTooltip />}
            cursor={{ fill: "rgba(255, 255, 255, 0.1)" }}
          />

          {/* =================================================================== */}
          {/* 4. dataKey ATUALIZADO AQUI                                         */}
          {/* =================================================================== */}
          <Bar dataKey="Candidaturas" fill="white" radius={[6, 6, 0, 0]} barSize={80} />

        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BarCharts;