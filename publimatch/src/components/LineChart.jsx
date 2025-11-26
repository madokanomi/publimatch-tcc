import { Box, Typography, CircularProgress, FormControl, Select, MenuItem } from "@mui/material";
import React, { useState, useEffect } from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import axios from "axios";
import { useAuth } from "../auth/AuthContext"; 

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
          <strong>{`${data.value} ${unit}`}</strong>
        </Typography>
      </Box>
    );
  }
  return null;
};

export default function CampaignChart() {
  const { user } = useAuth();
  const [chartData, setChartData] = useState({});
  const [selectedOption, setSelectedOption] = useState("");
  const [loading, setLoading] = useState(true);

  const isAgent = user?.role === 'INFLUENCER_AGENT';
  
  // Textos dinâmicos
  const chartTitle = isAgent ? "Fluxo de Convites por Influenciador" : "Engajamento (Visualizações)";
  const selectLabel = isAgent ? "Selecionar Influenciador" : "Selecionar Campanha";
  const unitLabel = isAgent ? "convites" : "views";

  useEffect(() => {
    const fetchLineData = async () => {
      if (user && user.token) {
        try {
          const config = { headers: { Authorization: `Bearer ${user.token}` } };
          const response = await axios.get("http://localhost:5001/api/dashboard/line-chart", config);
          
          const data = response.data;
          setChartData(data);

          const keys = Object.keys(data);
          if (keys.length > 0) {
            setSelectedOption(keys[0]);
          }
        } catch (error) {
          console.error("Erro ao carregar gráfico de linha:", error);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchLineData();
  }, [user]);

  if (loading) {
    return <Box display="flex" justifyContent="center" alignItems="center" height={460}><CircularProgress color="secondary" /></Box>;
  }

  if (Object.keys(chartData).length === 0) {
    return (
        <div style={{ width: "100%", height: 460, borderRadius: "10px", padding: "2px", color: "white", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <Typography>Dados insuficientes para exibir o gráfico.</Typography>
        </div>
    );
  }

  return (
    <div style={{ width: "100%", height: 460, borderRadius: "10px", padding: "2px", color: "white" }}>
      <Typography variant="h3" fontWeight="bold" color="white" mb="10px">{chartTitle}</Typography>
       
       <FormControl
        sx={{
          mt: 1, mb: 2, minWidth: 220, borderRadius: "20px",
          "& .MuiOutlinedInput-notchedOutline": { borderColor: "transparent" },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "white" },
        }}
      >
        <Select
          value={selectedOption}
          onChange={(e) => setSelectedOption(e.target.value)}
          displayEmpty
          sx={{
            backgroundColor: "#ffffff49", borderRadius: "20px", color: "white",
            "& .MuiSvgIcon-root": { color: "white" },
            "& .MuiOutlinedInput-notchedOutline": { borderColor: "transparent" },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#ffffff6b" },
          }}
          MenuProps={{
            PaperProps: {
              sx: { backgroundColor: "#620a5cff", color: "white", borderRadius: "10px" },
            },
          }}
        >
          {Object.keys(chartData).map((optionName) => (
            <MenuItem key={optionName} value={optionName}
              sx={{
                "&.Mui-selected": { backgroundColor: "#ffffff1b", color: "white" },
                "&:hover": { backgroundColor: "#ececec35", color: "white" },
              }}
            >
              {optionName}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <ResponsiveContainer width="100%" height={500}>
        <AreaChart data={chartData[selectedOption] || []}>
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
            isAnimationActive={false}
            content={<CustomTooltip unit={unitLabel} />}
            cursor={{ stroke: "white", strokeWidth: 1, strokeDasharray: "3 3" }}
          />

          <Legend wrapperStyle={{ color: "white" }} />
          <Area
            type="monotone"
            dataKey="value"
            name={isAgent ? "Novos Convites" : "Visualizações"}
            stroke="white"
            strokeWidth={2}
            fill="url(#areaGradient)"
            dot={{ stroke: "white", strokeWidth: 2, r: 4, fill: "#431F54" }}
            activeDot={{ r: 6, stroke: "white", fill: "#431F54" }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}