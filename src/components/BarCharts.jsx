import React from "react";
import { Typography } from "@mui/material";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  { name: "Lançamento IPhone 17", value: 100 },
  { name: "Viva o Agora - Heineken", value: 25 },
  { name: "Campanha Publi", value: 75 },
  { name: "Komonew: Criando o Novo", value: 10 },
];

const BarCharts = () => {
  return (
    <div style={{ width: "100%", height: 500 , borderRadius: "16px", padding:"20px"}}>
       <Typography variant="h3" fontWeight="bold" color="white" mt="0.5vh"mb="3.7vh">Candidaturas nas Campanhas</Typography>
      <ResponsiveContainer  width="105%" height={513}>
        <BarChart data={data} margin={{ top: 40, right: 30, left: 20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.3)" />
          <XAxis dataKey="name" tick={{ fill: "white", fontSize: 14 }} />
          <YAxis domain={[0, 100]} tick={{ fill: "white", fontSize: 14 }} />
          <Tooltip
            contentStyle={{ backgroundColor: "#222", borderRadius: "10px", color: "white" }} 
          />
          <Bar dataKey="value" fill="white" radius={[6, 6, 0, 0]} barSize={80} 

          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BarCharts;
