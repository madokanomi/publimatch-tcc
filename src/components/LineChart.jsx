
import { Box, Typography, useTheme } from "@mui/material";
import React, { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Area,
  AreaChart
} from "recharts";
import { Select, MenuItem, FormControl } from "@mui/material";

const campanhas = {
  "Komonew: Criando o Novo": [
    { name: "Início - 07/05", Cliques: 74 },
    { name: "14/05", Cliques: 90 },
    { name: "21/05", Cliques: 33 },
    { name: "28/05", Cliques: 10 },
    { name: "Atualmente - 31/05", Cliques: 0 }
  ],
  "Campanha Verão": [
    { name: "Início - 07/05", Cliques: 50 },
    { name: "14/05", Cliques: 70 },
    { name: "21/05", Cliques: 60 },
    { name: "28/05", Cliques: 40 },
    { name: "Atualmente - 31/05", Cliques: 20 }
  ],
  "Campanha Inverno": [
    { name: "Início - 07/05", Cliques: 20 },
    { name: "14/05", Cliques: 40 },
    { name: "21/05", Cliques: 80 },
    { name: "28/05", Cliques: 60 },
    { name: "Atualmente - 31/05", Cliques: 45 }
  ]
};

export default function CampaignChart() {
  const [campanhaSelecionada, setCampanhaSelecionada] = useState(
    "Komonew: Criando o Novo"
  );

  return (
    <div
      style={{
        width: "100%",
        height: 460,
       
        borderRadius: "10px",
        padding: "2px",
        color: "white"
      }}
    >
      <Typography variant="h3" fontWeight="bold" color="white" mb="10px">Engajamento da Campanha</Typography>

      {/* Select para escolher campanha */}
       <FormControl
        sx={{
          mt: 1,
          mb: 2,
          minWidth: 220,
          borderRadius: "20px",
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: "transparent",
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "white", // borda branca quando focado
          },
        }}
      >
        <Select
          value={campanhaSelecionada}
          onChange={(e) => setCampanhaSelecionada(e.target.value)}
          sx={{
            backgroundColor: "#ffffff49",
            borderRadius: "20px",
            color: "white",
            "& .MuiSvgIcon-root": { color: "white" },
             "& .MuiOutlinedInput-notchedOutline": {
            borderColor: "transparent",
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "#ffffff6b", // borda branca quando focado
          },
          }}
          MenuProps={{
            PaperProps: {
              sx: {
                backgroundColor: "#620a5cff", // fundo da lista
                color: "white", // texto branco
                borderRadius: "10px",
              },
            },
          }}
        >
          {Object.keys(campanhas).map((campanha) => (
            <MenuItem
              key={campanha}
              value={campanha}
              sx={{
                "&.Mui-selected": {
                  backgroundColor: "#ffffff1b", // cor ao selecionar
                  color: "white",
                },
                "&:hover": {
                  backgroundColor: "#ececec35", // cor ao passar o mouse
                  color: "white",
                },
              }}
            >
              {campanha}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

<ResponsiveContainer width="100%" height={500}>
  <AreaChart data={campanhas[campanhaSelecionada]}>
    <defs>
      <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="white" stopOpacity={0.5} />
        <stop offset="100%" stopColor="white" stopOpacity={0} />
      </linearGradient>
    </defs>

    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.2)" />
    <XAxis dataKey="name" stroke="white" />
    <YAxis stroke="white" />
    <Tooltip
      contentStyle={{
        backgroundColor: "#2E0E5C",
        border: "none",
        borderRadius: "8px",
        color: "white",
      }}
    />
    <Legend wrapperStyle={{ color: "white" }} />

    <Area
      type="monotone"
      dataKey="Cliques"
      stroke="white"               // linha branca
      strokeWidth={2}
      fill="url(#areaGradient)"   // degradê por baixo da linha
      dot={{ stroke: "white", strokeWidth: 2, r: 4, fill: "#431F54" }}
      activeDot={{ r: 6, stroke: "white", fill: "#431F54" }}
    />
  </AreaChart>
</ResponsiveContainer>


    </div>
  );
}