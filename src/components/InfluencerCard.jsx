import { Box, Typography, Card, Avatar, IconButton, Chip, Button } from "@mui/material";
import { Star, Favorite, Visibility, Groups, BarChart } from "@mui/icons-material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { Link } from "react-router-dom"; // 👈 IMPORTANTE

// Ícones das redes
import YouTubeIcon from "@mui/icons-material/YouTube";
import InstagramIcon from "@mui/icons-material/Instagram";
import MusicNoteIcon from "@mui/icons-material/MusicNote";
import SportsEsportsIcon from "@mui/icons-material/SportsEsports";
import TwitchIcon from "@mui/icons-material/SportsEsports"; // Troque pelo ícone correto do Twitch

const InfluencerCard = ({
  id, // 👈 PRECISA receber esse id
  nome,
  nomeReal,
  avaliacao,
  seguidores,
  views,
  inscritos,
  engajamento,
  descricao,
  tags = [],
  imagem,
  redes = [],
  categorias = [],
  imagemFundo,
}) => (
  <Card
    sx={{
      borderRadius: "20px",
      p: 2,
      background: `linear-gradient(0deg, rgba(20, 3, 41, 0.75), rgba(20, 3, 41, 0.52)), url(${imagemFundo})`,
      backgroundSize: "cover",
      color: "white",
      position: "relative",
      height: "105%",
      border: "3px solid rgba(255, 255, 255, 0.56)",
      boxShadow: "0px 0px 29.6px -1px rgba(0, 0, 0, 0.25)",
      display: "flex",
      flexDirection: "column",
    }}
  >
    {/* Header */}
    <Box display="flex" justifyContent="space-between" alignItems="flex-start">
      {/* Avatar + infos */}
      <Box display="flex" alignItems="center" gap={2}>
        <Avatar
          src={imagem}
          sx={{ width: 90, height: 90, border: "3px solid white" }}
        />
        <Box>
          <Typography variant="h5" fontWeight="bold">
            {nome}
          </Typography>
          <Typography variant="body2" color="white">
            {nomeReal}
          </Typography>

          {/* Redes sociais */}
          <Box display="flex" gap={1} mt={0.5}>
            {redes.includes("tiktok") && <MusicNoteIcon />}
            {redes.includes("twitch") && <TwitchIcon />}
            {redes.includes("instagram") && <InstagramIcon />}
            {redes.includes("youtube") && <YouTubeIcon />}
          </Box>

          {/* Categorias */}
          <Box display="flex" gap={1} mt={0.5} flexWrap="wrap">
            {categorias?.map((cat, i) => (
              <Chip
                key={i}
                label={cat}
                size="small"
                sx={{
                  backdropFilter: "blur(10px)",
                  p: "2px",
                  bgcolor: "#d4d4d414",
                  color: "white",
                }}
              />
            ))}
          </Box>
        </Box>
      </Box>

      {/* Botão menu */}
      <IconButton>
        <MoreVertIcon sx={{ color: "white" }} />
      </IconButton>
    </Box>

    {/* Avaliação em estrelas */}
    <Box display="flex" alignItems="center" mt={2}>
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          sx={{ color: i < Math.floor(avaliacao) ? "gold" : "gray" }}
        />
      ))}
      <Typography variant="body2" ml={1}>
        {avaliacao.toFixed(1)}
      </Typography>
    </Box>

    {/* Métricas */}
    <Box display="flex" justifyContent="space-between" mt={2}>
      <Box display="flex" alignItems="center" gap={0.5}>
        <Favorite sx={{ fontSize: 18 }} /> <Typography>{seguidores}M</Typography>
      </Box>
      <Box display="flex" alignItems="center" gap={0.5}>
        <Visibility sx={{ fontSize: 18 }} /> <Typography>{views}M</Typography>
      </Box>
      <Box display="flex" alignItems="center" gap={0.5}>
        <Groups sx={{ fontSize: 18 }} /> <Typography>{inscritos}M</Typography>
      </Box>
      <Typography color="lightgreen" fontWeight="bold">
        {engajamento}%
      </Typography>
    </Box>

    {/* Descrição */}
    <Typography
      variant="body2"
      fontStyle="italic"
      mt={2}
      textAlign="center"
      color="white"
    >
      “{descricao}”
    </Typography>

    {/* Tags */}
    <Box display="flex" gap={1} mt={2} flexWrap="wrap" justifyContent="center">
      {tags.map((tag, idx) => (
        <Chip
          key={idx}
          label={tag}
          size="small"
          sx={{
            bgcolor: "#c6c6c61c",
            color: "white",
            borderRadius: "5px",
            border: "white 1px solid",
            fontWeight: "800px",
          }}
        />
      ))}
    </Box>

    {/* Botão final */}
    <Box mt="auto" display="flex" justifyContent="center" gap={1}>
      {/* 👇 Aqui está o segredo */}
      <Button
        fullWidth
        component={Link}
        to={`/influenciador/${id}`} // 👈 Redireciona para o perfil do influenciador
        variant="outlined"
        sx={{
          width: "70%",
          color: "white",
          borderRadius: "10px",
          mr: 1,
          background: "rgba(255, 255, 255, 0.28)",
          p: "10px 20px",
          "&:hover": { background: "rgba(165, 165, 165, 0.28)" },
        }}
      >
        <Typography variant="h6" fontWeight="bold" textTransform="none">
          Ver Perfil
        </Typography>
      </Button>

      <IconButton sx={{ bgcolor: "rgba(255,255,255,0.1)", width: "15%", height: "100%" }}>
        <BarChart sx={{ color: "white" }} />
      </IconButton>
    </Box>
  </Card>
);

export default InfluencerCard;
