import { useState } from "react";
import { Box, Typography, Card, Avatar, IconButton, Chip, Button, Menu, MenuItem, Tooltip } from "@mui/material";
import { Star, Favorite, Visibility, Groups, BarChart, Verified, Lock } from "@mui/icons-material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { Link } from "react-router-dom";
import { SiTwitch } from "react-icons/si";
import YouTubeIcon from "@mui/icons-material/YouTube";
import InstagramIcon from "@mui/icons-material/Instagram";
import MusicNoteIcon from "@mui/icons-material/MusicNote";


const formatNumber = (num) => {
  if (!num) return "0";
  if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
  if (num >= 1000) return (num / 1000).toFixed(1) + "K";
  return num.toString();
};

const InfluencerCard = ({
  influencer,
  onCompararClick,
  estaSelecionado,
  onOcultar,
}) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  
  const handleMenuClick = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);
  
  // Extração segura dos dados
  const {
    _id, name, realName, description, profileImageUrl, backgroundImageUrl,
    niches, social, 
    tags, // Top 3 tags vindas do backend
    avaliacao, // Média de avaliação calculada no backend
    isVerified // ✅ Novo campo
  } = influencer;

  // Lógica para usar dados agregados (se existirem) ou campos diretos
  // O backend agora envia 'aggregatedStats' com a soma de todas as redes
  const stats = influencer.aggregatedStats || {
      followers: influencer.followersCount || 0,
      views: influencer.views || 0,
      engagementRate: influencer.engagementRate || 0,
      likes: influencer.curtidas || 0 // Usando 'curtidas' se 'likes' não existir
  };

  // Garante que a avaliação seja um número válido entre 0 e 5
  const ratingValue = typeof avaliacao === 'number' ? avaliacao : 0;

  const handleOcultar = () => {
    onOcultar(_id);
    handleClose();
  };

  return (
    <Card
      sx={{
        borderRadius: "20px",
        p: 2,
        background: `linear-gradient(0deg, rgba(20, 3, 41, 0.75), rgba(20, 3, 41, 0.52)), url(${backgroundImageUrl || ''})`,
        backgroundSize: "cover",
        color: "white",
        position: "relative",
        height: "100%",
        // Se não for verificado, reduz ligeiramente a opacidade para dar destaque aos verificados
        opacity: isVerified ? 1 : 0.85,
        filter: isVerified ? "none" : "grayscale(20%)",
        outline: estaSelecionado
          ? "3px solid #ff00d4"
          : isVerified ? "1px solid rgba(0, 212, 255, 0.3)" : "3px solid rgba(0,0,0,0)",
        boxShadow: isVerified 
          ? "0px 4px 25px rgba(0, 212, 255, 0.15)" // Glow azul leve para verificados
          : "0px 4px 20px rgba(0, 0, 0, 0.4)",
        display: "flex",
        flexDirection: "column",
        transition: "all 0.3s ease",
      }}
    >
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="flex-start">
        <Box display="flex" alignItems="center" gap={2}>
          <Avatar 
            src={profileImageUrl} 
            sx={{ 
                width: 90, height: 90,  
                boxShadow: "0px 4px 20px rgba(255, 255, 255, 0.16)", 
                border: isVerified ? "2px solid #00d4ff" : "none"
            }} 
          />
          <Box>
            <Box display="flex" alignItems="center" gap={0.5}>
                <Typography variant="h5" fontWeight="bold">{name}</Typography>
                {/* ✅ Ícone de Verificado no Card */}
                {isVerified && (
                    <Tooltip title="Verificado">
                        <Verified sx={{ color: "#00d4ff", fontSize: 20 }} />
                    </Tooltip>
                )}
            </Box>
            <Typography variant="body2" color="white">{realName}</Typography>
            <Box display="flex" gap={1} mt={0.5}>
             {social?.tiktok && <MusicNoteIcon />}
             {social?.twitch && <SiTwitch style={{ color: "white", fontSize: 18 }} />}
             {social?.instagram && <InstagramIcon />}
             {social?.youtube && <YouTubeIcon />}
            </Box>
            {/* Nichos (Categorias do perfil) */}
            <Box display="flex" gap={1} mt={0.5} flexWrap="wrap">
              {niches?.slice(0, 2).map((cat, i) => (
                <Chip key={i} label={cat} size="small"
                  sx={{ backdropFilter: "blur(10px)", p: "2px", bgcolor: "#d4d4d414", color: "white" }} />
              ))}
            </Box>
          </Box>
        </Box>

        <IconButton onClick={handleMenuClick}>
          <MoreVertIcon sx={{ color: "white" }} />
        </IconButton>
        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          PaperProps={{
            sx: { bgcolor: "rgba(20, 3, 41, 0.9)", color: "white" }
          }}
        >
          <MenuItem onClick={() => onOcultar(_id)}>Ocultar perfil</MenuItem>
        </Menu>
      </Box>

    {/* Avaliação em estrelas (Dados Reais) */}
    <Box display="flex" alignItems="center" mt={2}>
      {[...Array(5)].map((_, i) => (
        <Star key={i} sx={{ color: i < Math.floor(avaliacao || 0) ? "gold" : "gray" }} />
      ))}
      <Typography variant="body2" ml={1}>{(avaliacao || 0).toFixed(1)}</Typography>
    </Box>

    {/* Métricas */}
  <Box display="flex" justifyContent="space-between" mt={1} p={1.5} bgcolor="rgba(0,0,0,0.3)" borderRadius="12px">
      <Box textAlign="center">
        <Box display="flex" alignItems="center" justifyContent="center" gap={0.5} color="#ff4081">
            <Favorite sx={{ fontSize: 16 }} /> 
            <Typography variant="body2" fontWeight="bold">{formatNumber(stats.likes)}</Typography>
        </Box>
        <Typography variant="caption" color="gray" fontSize="0.65rem">Curtidas</Typography>
      </Box>

      <Box textAlign="center" sx={{borderLeft: '1px solid rgba(255,255,255,0.1)', borderRight: '1px solid rgba(255,255,255,0.1)', px: 2}}>
        <Box display="flex" alignItems="center" justifyContent="center" gap={0.5} color="#40c4ff">
            <Visibility sx={{ fontSize: 16 }} /> 
            <Typography variant="body2" fontWeight="bold">{formatNumber(stats.views)}</Typography>
        </Box>
        <Typography variant="caption" color="gray" fontSize="0.65rem">Views</Typography>
      </Box>

      <Box textAlign="center">
        <Box display="flex" alignItems="center" justifyContent="center" gap={0.5} color="#b2ff59">
             <Groups sx={{ fontSize: 16 }} /> 
             <Typography variant="body2" fontWeight="bold">{formatNumber(stats.followers)}</Typography>
        </Box>
        <Typography variant="caption" color="gray" fontSize="0.65rem">Seguidores</Typography>
      </Box>
    </Box>
    
  
    {/* Descrição */}
    <Typography variant="body2" fontStyle="italic" mt={2} textAlign="center" color="white" sx={{
         display: '-webkit-box',
         overflow: 'hidden',
         WebkitBoxOrient: 'vertical',
         WebkitLineClamp: 2, // Limita texto longo
      }}>
      “{description || "Sem descrição disponível"}”
    </Typography>

    {/* Tags (Top 3 recorrentes das avaliações) */}
    <Box mt="auto">
        <Typography variant="caption" sx={{ ml: 1, opacity: 0.7 }}>O que dizem as marcas:</Typography>
        <Box display="flex" gap={1} mt={0.5} mb={2} flexWrap="wrap" justifyContent="center">
        {tags && tags.length > 0 ? (
            tags.map((tag, idx) => (
            <Chip 
                key={idx} 
                label={tag} 
                size="small" 
                sx={{ 
                    bgcolor: "rgba(255, 0, 212, 0.15)", // Destaque visual
                    color: "#ffffffff", 
                    borderRadius: "5px", 
                    border: "1px solid #ffffffff", 
                    fontWeight: "bold" 
                }} 
            />
            ))
        ) : (
            <Typography variant="caption" color="gray" fontStyle="italic">Ainda sem avaliações</Typography>
        )}
        </Box>

        {/* Botão final */}
        <Box display="flex" justifyContent="center" gap={1}>
        <Button
            fullWidth
            component={Link}
            to={`/influenciador/${_id}`} 
            variant="outlined"
            sx={{
            width: "70%",
            color: "white",
            borderRadius: "10px",
            mr: 1,
            background: "rgba(255, 255, 255, 0.28)",
            p: "10px 20px",
            "&:hover": { background: "rgba(165, 165, 165, 0.28)" },
            backdropFilter: "blur(10px)",
            }}
        >
            <Typography variant="h6" fontWeight="bold" textTransform="none">
            Ver Perfil
            </Typography>
        </Button>

            <IconButton
            onClick={onCompararClick}
            sx={{
                bgcolor: estaSelecionado ? "#ff00d4" : "rgba(255,255,255,0.1)",
                width: 40, height: 40,
                backdropFilter: "blur(10px)",
                transition: 'background-color 0.3s ease',
                '&:hover': {
                bgcolor: estaSelecionado ? '#ff00a6' : 'rgba(255,255,255,0.3)'
                }
            }}
            >
            <BarChart sx={{ color: "white" }} />
            </IconButton>
        </Box>
    </Box>
    </Card>
  );
};

export default InfluencerCard;
