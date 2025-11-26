import React, { useState, useEffect } from "react";
import { Typography, Box, CircularProgress } from "@mui/material";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import axios from "axios";
import { useAuth } from "../auth/AuthContext"; 

// Tooltip Customizado
const CustomTooltip = ({ active, payload, label, titleSuffix }) => {
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
          <strong>{data.value} {titleSuffix}</strong>
        </Typography>
      </Box>
    );
  }
  return null;
};

const BarCharts = ({ isDashboard = false }) => {
  const { user } = useAuth();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Define textos baseados no Role
  const isAgent = user?.role === 'INFLUENCER_AGENT';
  const chartTitle = isAgent ? "Top Influenciadores (Convites)" : "Candidaturas nas Campanhas";
  const tooltipSuffix = isAgent ? "convites" : "candidatos";

  useEffect(() => {
    const fetchBarData = async () => {
      if (user && user.token) {
        try {
          const config = { headers: { Authorization: `Bearer ${user.token}` } };
          const response = await axios.get("http://localhost:5001/api/dashboard/bar-chart", config);
          setData(response.data);
        } catch (error) {
          console.error("Erro ao carregar gráfico de barras:", error);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchBarData();
  }, [user]);

  if (loading) {
    return <Box display="flex" justifyContent="center" alignItems="center" height={500}><CircularProgress color="secondary" /></Box>;
  }

  return (
    <div style={{ width: "100%", height: 500 , borderRadius: "16px", padding:"20px"}}>
       <Typography variant="h3" fontWeight="bold" color="white" mt="0.5vh" mb="3.7vh">
          {chartTitle}
       </Typography>
      
      {data.length === 0 ? (
          <Typography color="white" textAlign="center" mt={10}>Nenhum dado registrado ainda.</Typography>
      ) : (
          <ResponsiveContainer  width="105%" height={513}>
            <BarChart data={data} margin={{ top: 40, right: 30, left: 20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.3)" />
              <XAxis dataKey="name" tick={{ fill: "white", fontSize: 10 }} interval={0} angle={0}/>
              <YAxis allowDecimals={false} tick={{ fill: "white", fontSize: 14 }} />
              
              <Tooltip
                isAnimationActive={false}
                content={<CustomTooltip titleSuffix={tooltipSuffix} />}
                cursor={{ fill: "rgba(255, 255, 255, 0.1)" }}
              />

              {/* Usamos "value" como chave genérica vinda do backend */}
              <Bar dataKey="value" fill="white" radius={[6, 6, 0, 0]} barSize={80} />

            </BarChart>
          </ResponsiveContainer>
      )}
    </div>
  );
};

export default BarCharts;