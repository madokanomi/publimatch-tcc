import React from 'react';
import { Box, Typography, Chip } from "@mui/material";
import StarIcon from "@mui/icons-material/Star";

const AvaliacoesEspc = () => {
  return (
    <Box pl={5} pr={5} sx={{backgroundColor: "rgba(27, 27, 27, 0.26)", borderRadius:"20px", p:3, backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.1)"}}>
      <Box display="flex" gap={4}>
        <Box flex={1} display="flex" flexDirection="column" alignItems="center" justifyContent="center" sx={{ p: 4, textAlign: "center" }}>
          <Typography variant="h1" fontWeight="bold" color="white" sx={{ fontSize: "120px", lineHeight: 1 }}>
            4.2
          </Typography>
          <Box display="flex" gap={0.5} mb={2}>
            {[...Array(5)].map((_, i) => (<StarIcon key={i} sx={{ color: i < 4 ? "#FFD700" : "rgba(255,255,255,0.3)", fontSize: 32 }}/>))}
          </Box>
          <Typography variant="h4" fontWeight="bold" color="white" mb={1}>
            Muito Bom!
          </Typography>
          <Box display="flex" gap={1} flexWrap="wrap" justifyContent="center">
            {["Prestativo", "Criativo", "Agradável", "Atencioso"].map((tag, i) => (
              <Chip key={i} label={tag} size="small" sx={{ bgcolor: "rgba(255,255,255,0.2)", color: "white", fontWeight: "bold", borderRadius: "15px" }}/>
            ))}
          </Box>
        </Box>
        <Box flex={1.2}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h6" color="white"> Mais Recentes </Typography>
            <Typography variant="body2" color="rgba(255,255,255,0.7)"> ⌄ </Typography>
          </Box>
          <Box mb={3} p={3} sx={{ backgroundColor: "rgba(255,255,255,0.08)", borderRadius: "15px", border: "1px solid rgba(255,255,255,0.1)" }}>
            <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
              <Box>
                <Typography variant="body1" color="white" fontWeight="bold" mb={0.5}> Entrega criativa e autêntica — superou expectativas! </Typography>
                <Typography variant="caption" color="rgba(255,255,255,0.6)"> 18/08/2025 </Typography>
              </Box>
              <Chip label="Campanha Lançamento Iphone 17" size="small" sx={{ bgcolor: "rgba(255, 255, 255, 0.89)", color: "#2d0069ff", fontWeight: "bold", fontSize: "11px" }}/>
            </Box>
            <Box display="flex" gap={0.5} mb={2}>
              {[...Array(5)].map((_, i) => (<StarIcon key={i} sx={{ color: "#FFD700", fontSize: 16 }} />))}
              <Typography variant="body2" color="white" fontWeight="bold" ml={1}> 5.0 </Typography>
              <Box ml={2} display="flex" gap={1}>
                <Chip label="Proatividade" size="small" sx={{bgcolor: "rgba(76, 175, 80, 0.2)", color: "#4caf50", fontSize: "10px"}} />
                <Chip label="Profissional" size="small" sx={{bgcolor: "rgba(76, 175, 80, 0.2)", color: "#4caf50", fontSize: "10px"}} />
                <Chip label="Resultados" size="small" sx={{bgcolor: "rgba(76, 175, 80, 0.2)", color: "#4caf50", fontSize: "10px"}} />
              </Box>
            </Box>
            <Typography variant="body2" color="rgba(255,255,255,0.8)" lineHeight={1.6}>
              Trabalhar com o Gemaplys foi uma experiência extremamente positiva. Desde o briefing inicial até a publicação final, ele demonstrou profissionalismo, criatividade e comprometimento com a entrega. O conteúdo produzido foi fiel à linguagem da marca, mas ao mesmo tempo manteve seu estilo único, o que garantiu uma recepção orgânica e engajada do público. Recomendamos fortemente para marcas que desejam trabalhar com influenciadores autênticos, com bom senso criativo e grande conexão com a comunidade gamer e jovem adulto.
            </Typography>
          </Box>
          <Box p={3} sx={{ backgroundColor: "rgba(255,255,255,0.08)", borderRadius: "15px", border: "1px solid rgba(255,255,255,0.1)" }}>
            <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
              <Box>
                <Typography variant="body1" color="white" fontWeight="bold" mb={0.5}> Bom desempenho, mas com espaço para melhorias </Typography>
                <Typography variant="caption" color="rgba(255,255,255,0.6)"> 14/08/2025 </Typography>
              </Box>
              <Chip label="Campanha Antigos 2" size="small" sx={{ bgcolor: "rgba(255, 152, 0, 0.2)", color: "#ff9800", fontSize: "11px" }}/>
            </Box>
            <Box display="flex" gap={0.5} mb={2}>
              {[...Array(5)].map((_, i) => (<StarIcon key={i} sx={{ color: i < 3 ? "#FFD700" : "rgba(255,255,255,0.3)", fontSize: 16 }} />))}
              <Typography variant="body2" color="white" fontWeight="bold" ml={1}> 3.5 </Typography>
              <Box ml={2} display="flex" gap={1}>
                <Chip label="Indefinido" size="small" sx={{bgcolor: "rgba(255, 152, 0, 0.2)", color: "#ff9800", fontSize: "10px"}} />
                <Chip label="Carisma" size="small" sx={{bgcolor: "rgba(76, 175, 80, 0.2)", color: "#4caf50", fontSize: "10px"}} />
                <Chip label="Resultados" size="small" sx={{bgcolor: "rgba(76, 175, 80, 0.2)", color: "#4caf50", fontSize: "10px"}} />
              </Box>
            </Box>
            <Typography variant="body2" color="rgba(255,255,255,0.8)" lineHeight={1.6}>
              Gemaplys demonstrou carisma e capacidade de engajamento com seu público, características que agregaram valor à campanha. O conteúdo final teve boa performance, especialmente em termos de visualizações e comentários...
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default AvaliacoesEspc;