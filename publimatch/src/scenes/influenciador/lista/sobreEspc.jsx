import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Avatar,
  Button,
  Chip,
  Divider,
  IconButton,
  Card,
  CardContent,
  Grid,
  Rating,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Snackbar,
  Alert,
  TextField, // Importado para o campo de senha
} from "@mui/material";
import {
  Favorite,
  Visibility,
  Groups,
  Menu as MenuIcon,
  ArrowBack,
  TrendingUp,
  Star,
  YouTube,
  Instagram,
  SportsEsports,
  MusicNote,
  PersonOutlined,
  Business,
  BarChart,
  Campaign,
  Check,
  Close,
  KeyboardArrowDown,
  Flag,
} from "@mui/icons-material";
import StarIcon from "@mui/icons-material/Star";
import YouTubeIcon from "@mui/icons-material/YouTube";
import InstagramIcon from "@mui/icons-material/Instagram";
import SportsEsportsIcon from "@mui/icons-material/SportsEsports";
import MusicNoteIcon from "@mui/icons-material/MusicNote";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import { useParams } from "react-router-dom";
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import Estatisticas from "../../../components/Estatisticas.jsx";
import CampanhasInfluSpec from "../../../components/CampanhasInfluEspc.jsx";
import AvaliacoesEspc from "../../../components/AvaliacoesEspc.jsx";
import { SiTwitch } from "react-icons/si";
import TiptapContent from "../../../components/TiptapContent.jsx";
import { motion, AnimatePresence } from 'framer-motion';
const Sobrespec = () => {
  const { id } = useParams();
  const navigate = useNavigate();



   const [influencer, setInfluencer] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [activeTab, setActiveTab] = useState("Sobre");

  const [openHireDialog, setOpenHireDialog] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(false);

  const [openSections, setOpenSections] = useState({
    convites: true,
    participando: true,
    historico: true,
  });

  const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false);
  const [dialogContent, setDialogContent] = useState({
    title: "",
    text: "",
    onConfirm: () => {},
  });
  const [acceptFollowUpOpen, setAcceptFollowUpOpen] = useState(false);

  // --- NOVOS ESTADOS PARA O DIÁLOGO DE FINALIZAR CONTRATO ---
  const [openFinalizeDialog, setOpenFinalizeDialog] = useState(false);
  const [password, setPassword] = useState("");
  const [showFinalizeSuccess, setShowFinalizeSuccess] = useState(false);
  // -----------------------------------------------------------

     useEffect(() => {
    const fetchInfluencer = async () => {
      try {
        const userInfo = JSON.parse(localStorage.getItem('user'));
        const token = userInfo?.token;
        if (!token) throw new Error('Utilizador não autenticado.');
        
        const config = { headers: { Authorization: `Bearer ${token}` } };
        
        // A chamada à API usa o 'id' da URL
        const { data } = await axios.get(`http://localhost:5001/api/influencers/${id}`, config);
        
        setInfluencer(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Erro ao carregar dados do influenciador.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchInfluencer();
  }, [id]);
  // ✅ 7. ADICIONAR TRATAMENTO DE ESTADO DE CARREGAMENTO E ERRO
  if (isLoading) {
     return <Box display="flex" justifyContent="center" alignItems="center" height="50vh"><CircularProgress /></Box>;
   }
 
   if (error) {
     return <Box display="flex" justifyContent="center" alignItems="center" height="50vh"><Typography color="error">{error}</Typography></Box>;
   }

  if (!influencer) {
    // Fallback caso a API não retorne nem dado nem erro
    return <Typography>Influenciador não encontrado.</Typography>;
  }

  const handleToggleSection = (section) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const handleOpenHireDialog = () => {
    setOpenHireDialog(true);
  };

  const handleCloseHireDialog = () => {
    setOpenHireDialog(false);
    setSelectedCampaign("");
  };

  const handleConfirmHire = () => {
    handleCloseHireDialog();
    setShowConfirmation(true);
  };

  const handleCloseConfirmation = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setShowConfirmation(false);
  };

  const handleCloseDialogs = () => {
    setConfirmationDialogOpen(false);
    setAcceptFollowUpOpen(false);
  };

  const handleConfirmReject = () => {
    console.log("Campanha Rejeitada");
    handleCloseDialogs();
  };

  const handleConfirmAccept = () => {
    console.log("Campanha Aceita");
    handleCloseDialogs();
    setAcceptFollowUpOpen(true);
  };

  const handleRejectClick = () => {
    setDialogContent({
      title: "Rejeitar Convite",
      text: "Certeza que deseja rejeitar essa campanha?",
      onConfirm: handleConfirmReject,
    });
    setConfirmationDialogOpen(true);
  };

  const handleAcceptClick = () => {
    setDialogContent({
      title: "Aceitar Convite",
      text: "Certeza que deseja participar dessa campanha?",
      onConfirm: handleConfirmAccept,
    });
    setConfirmationDialogOpen(true);
  };

  // --- NOVAS FUNÇÕES PARA O DIÁLOGO DE FINALIZAR CONTRATO ---
  const handleOpenFinalizeDialog = () => {
    setOpenFinalizeDialog(true);
  };

  const handleCloseFinalizeDialog = () => {
    setOpenFinalizeDialog(false);
    setPassword(""); // Limpa a senha ao fechar
  };

  const handleConfirmFinalize = () => {
    // Aqui você validaria a senha antes de prosseguir
    console.log("Solicitação de finalização enviada");
    handleCloseFinalizeDialog();
    setShowFinalizeSuccess(true);
  };
  // -----------------------------------------------------------

  const availableCampaigns = [
    { id: 1, name: "Campanha Lançamento iPhone 17" },
    { id: 2, name: "Campanha Antigos 2" },
    { id: 3, name: "Divulgação - Nintendo Switch 3" },
    { id: 4, name: "Ação de Marketing - Insider" },
  ];

  const tabs = [
    { name: "Sobre", icon: PersonOutlined },
    { name: "Avaliações", icon: Star },
    { name: "Campanhas", icon: Campaign },
    { name: "Estatísticas", icon: BarChart },
  ];

   const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const staggerItem = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring', stiffness: 120 },
    },
  };
  
  const tabContentVariant = {
      hidden: { opacity: 0, y: 10 },
      visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
      exit: { opacity: 0, y: -10, transition: { duration: 0.2, ease: "easeIn" } }
  };

  
  const renderTabContent = () => {
    switch (activeTab) {
       case "Sobre":
        return (
      <Box
            component={motion.div}
            key="sobre"
            variants={tabContentVariant}
            initial="hidden"
            animate="visible"
            exit="exit"
            display="flex"
            gap={4}
            pl={5}
            pr={5}
            sx={{
              backgroundColor: "rgba(27, 27, 27, 0.26)",
              borderRadius: "20px",
              p: 3,
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            <Box flex={2}>
              <Typography variant="h4" fontWeight="bold" mb={3} color="white">
                Sobre Mim
              </Typography>
              {sobreMim ? (
                <TiptapContent content={JSON.parse(sobreMim)} />
              ) : (
                <Typography
                  variant="body1"
                  lineHeight={1.8}
                  fontSize="16px"
                  color="white"
                >
                  {descricao || 'Informação não disponível'}
                </Typography>
              )}
            </Box>
          </Box>
        );


      case "Avaliações":
       return (
            <motion.div
                key="avaliacoes"
                variants={tabContentVariant}
                initial="hidden"
                animate="visible"
                exit="exit"
            >
                <AvaliacoesEspc />
            </motion.div>
        );

      case "Campanhas":
        return  (        <motion.div
                key="campanhas"
                variants={tabContentVariant}
                initial="hidden"
                animate="visible"
                exit="exit"
            >
                <CampanhasInfluSpec 
                    openSections={openSections}
                    handleToggleSection={handleToggleSection}
                    handleRejectClick={handleRejectClick}
                    handleAcceptClick={handleAcceptClick}
                    handleOpenFinalizeDialog={handleOpenFinalizeDialog}
                />
            </motion.div>
        );
      case "Estatísticas":
        return (
            <motion.div
                key="estatisticas"
                variants={tabContentVariant}
                initial="hidden"
                animate="visible"
                exit="exit"
            >
                <Estatisticas />
            </motion.div>
        );
      default:
        return null;
    }
  };


const {
  name: nome = 'Nome não disponível',
  realName: nomeReal = '',
  age: idade = 0,
  followersCount: inscritos = 0,
  engagementRate: engajamento = 0,
  description: descricao = '',
  aboutMe: sobreMim = '',
  niches: categorias = [],
  profileImageUrl: imagem = '',
  backgroundImageUrl: imagemFundo = '',
  social = {},
} = influencer;

// Valores fictícios para dados não disponíveis no model
const avaliacao = 4.5; // Rating não existe no model
const views = 150; // viewsCount não existe no model
const seguidores = 80; // likesCount não existe no model

  return (
    <Box pr={3} pl={3}>
      <Box mb={1}>
        <Button
          startIcon={<MenuIcon sx={{ mr: 1 }} />}
          onClick={() => navigate(-1)}
          sx={{
            backgroundColor: "rgba(22, 0, 61, 0.38)",
            color: "white",
            px: 2,
            py: 1,
            borderRadius: "20px",
            backdropFilter: "blur(10px)",
            textTransform: "none",
            fontSize: "15px",
            fontWeight: "500",
            "&:hover": { backgroundColor: "rgba(0, 0, 0, 0.23)" },
          }}
        >
          <ArrowBack sx={{ width: "10%", mr: 1 }} />
          <Typography
            variant="overline"
            fontWeight={700}
            sx={{ letterSpacing: 1.4, opacity: 0.8 }}
          >
            {" "}
            Influenciador{" "}
          </Typography>
        </Button>
      </Box>
      <Box
        height="calc(100vh - 120px)"
        overflow="auto"
        transition="all 0.3s ease-in-out"
        pb={10}
        sx={{
          transition: "all 0.3s ease-in-out",
          willChange: "width",
          "&::-webkit-scrollbar": { width: "10px", marginRight: "10px" },
          "&::-webkit-scrollbar-track": {
            background: "rgba(255, 255, 255, 0.1)",
            borderRadius: "10px",
          },
          "&::-webkit-scrollbar-thumb": {
            background: "rgba(255, 255, 255, 0.3)",
            borderRadius: "10px",
          },
          "&::-webkit-scrollbar-thumb:hover": {
            background: "rgba(255, 255, 255, 0.6)",
          },
        }}
      >
        <Box
          sx={{
            position: "relative",
            borderRadius: 3,
            background: `linear-gradient(135deg, rgba(67, 4, 66, 0.7) 0%, rgba(34, 1, 58, 0.85) 50%, rgba(42, 1, 35, 0.68) 100%), url(${imagemFundo})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backdropFilter: "blur(20px)",
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              position: "absolute",
              top: 16,
              right: 16,
              display: "flex",
              alignItems: "center",
              backgroundColor: "rgba(255, 255, 255, 0.95)",
              borderRadius: "20px",
              px: 2,
              py: 0.5,
              backdropFilter: "blur(5px)",
              boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
            }}
          >
            <Business sx={{ fontSize: 16, color: "#6a1b9a", mr: 1 }} />
            <Typography variant="caption" sx={{ color: "#6a1b9a" }}>
              {" "}
              Agenciado por{" "}
            <Typography component="span" variant="caption" fontWeight="bold">
    {influencer?.agent?.name || 'Agente não informado'}
</Typography>
            </Typography>
          </Box>
          <Box p={4}>
            <Box
              display="flex"
              alignItems="flex-start"
              justifyContent="space-between"
            >
              <Box display="flex" gap={2} flex={1}>
                <Avatar
                  src={imagem}
                  sx={{ width: 120, height: 120, border: "4px solid white" }}
                />
                <Box>
                  <Typography
                    variant="body2"
                    sx={{
                      fontStyle: "italic",
                      opacity: 0.9,
                      mb: 0.2,
                      fontSize: "14px",
                    }}
                  >
                    {" "}
                    "{descricao}"{" "}
                  </Typography>
                  <Typography variant="h3" fontWeight="bold" mb={0}>
                    {" "}
                    {nome}{" "}
                  </Typography>
                  <Typography variant="h6" mb={0.5} sx={{ opacity: 0.9 }}>
                    {" "}
                    <PersonOutlinedIcon sx={{ paddingTop: "5px" }} /> {nomeReal}
                    , {idade} anos{" "}
                  </Typography>
                  <Box display="flex" alignItems="center" gap={0.5} mb={1}>
                    {[...Array(5)].map((_, i) => (
                      <StarIcon
                        key={i}
                        sx={{
                          color: i < Math.floor(avaliacao) ? "gold" : "gray",
                          fontSize: 20,
                        }}
                      />
                    ))}
                    <Typography fontWeight="bold">
                      {avaliacao.toFixed(1)}
                    </Typography>
                  </Box>
                  <Box display="flex" gap={1} mb={1.5}>
                    {categorias.map((cat, i) => (
                      <Chip
                        key={i}
                        label={cat}
                        size="small"
                        sx={{
                          bgcolor: "rgba(255,255,255,0.2)",
                          color: "white",
                          fontWeight: "bold",
                          backdropFilter: "blur(10px)",
                        }}
                      />
                    ))}
                  </Box>
                 <Box display="flex" gap={1}>
  {social.youtube && (
    <Box
      sx={{
        width: 32,
        height: 32,
        borderRadius: "50%",
        backgroundColor: "rgba(255,255,255,0.2)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        "&:hover": { backgroundColor: "rgba(255,255,255,0.3)" }
      }}
      onClick={() => window.open(social.youtube, '_blank')}
    >
      <YouTubeIcon sx={{ fontSize: 16 }} />
    </Box>
  )}
  
  {social.instagram && (
    <Box
      sx={{
        width: 32,
        height: 32,
        borderRadius: "50%",
        backgroundColor: "rgba(255,255,255,0.2)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        "&:hover": { backgroundColor: "rgba(255,255,255,0.3)" }
      }}
      onClick={() => window.open(social.instagram, '_blank')}
    >
      <InstagramIcon sx={{ fontSize: 16 }} />
    </Box>
  )}
  
  {social.twitch && (
    <Box
      sx={{
        width: 32,
        height: 32,
        borderRadius: "50%",
        backgroundColor: "rgba(255,255,255,0.2)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        "&:hover": { backgroundColor: "rgba(255,255,255,0.3)" }
      }}
      onClick={() => window.open(social.twitch, '_blank')}
    >
      <SiTwitch sx={{ fontSize: 16 }} />
    </Box>
  )}
  
  {social.tiktok && (
    <Box
      sx={{
        width: 32,
        height: 32,
        borderRadius: "50%",
        backgroundColor: "rgba(255,255,255,0.2)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        "&:hover": { backgroundColor: "rgba(255,255,255,0.3)" }
      }}
      onClick={() => window.open(social.tiktok, '_blank')}
    >
      <MusicNoteIcon sx={{ fontSize: 16 }} />
    </Box>
  )}
</Box>
                </Box>
              </Box>
              <Box
                display="flex"
                flexDirection="column"
                gap={3}
                mt={3}
                alignItems="center"
                sx={{ minWidth: "300px" }}
              >
                <Box
                  display="flex"
                  alignItems="center"
                  gap={1}
                  textAlign="center"
                >
                  <Favorite sx={{ fontSize: 24, color: "#ff1493" }} />
                  <Box>
                    <Typography variant="h4" fontWeight="bold">
                      {seguidores}M
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.8 }}>
                      Curtidas
                    </Typography>
                  </Box>
                </Box>
                <Box
                  display="flex"
                  alignItems="center"
                  gap={1}
                  textAlign="center"
                >
                  <Visibility sx={{ fontSize: 24, color: "#2196f3" }} />
                  <Box>
                    <Typography variant="h4" fontWeight="bold">
                      {views}M
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.8 }}>
                      Visualizações
                    </Typography>
                  </Box>
                </Box>
                <Box
                  display="flex"
                  alignItems="center"
                  gap={1}
                  textAlign="center"
                >
                  <Groups sx={{ fontSize: 24, color: "#9c27b0" }} />
                  <Box>
                    <Typography variant="h4" fontWeight="bold">
                      {inscritos}M
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.8 }}>
                      Seguidores
                    </Typography>
                  </Box>
                </Box>
                <Box
                  display="flex"
                  alignItems="center"
                  gap={1}
                  textAlign="center"
                >
                  <TrendingUp sx={{ fontSize: 24, color: "#4caf50" }} />
                  <Box>
                    <Typography variant="h4" fontWeight="bold" color="#4caf50">
                      {" "}
                      {engajamento}%{" "}
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.8 }}>
                      Média de Conversão
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
        <Box
          display="flex"
          justifyContent="center"
          gap={2}
          my={2}
          sx={{
            backgroundColor: "rgba(255,255,255,0.05)",
            borderRadius: "20px",
            p: 1,
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          {tabs.map((tab) => {
            const IconComponent = tab.icon;
            return (
              <Button
                key={tab.name}
                startIcon={<IconComponent />}
                onClick={() => setActiveTab(tab.name)}
                sx={{
                  color:
                    activeTab === tab.name
                      ? "#ffffffff"
                      : "rgba(255,255,255,0.7)",
                  fontWeight: activeTab === tab.name ? "bold" : "normal",
                  fontSize: "14px",
                  textTransform: "none",
                  backgroundColor:
                    activeTab === tab.name
                      ? "rgba(58, 0, 151, 0.1)"
                      : "transparent",
                  borderRadius: "15px",
                  px: 3,
                  py: 1.5,
                  transition: "all 0.3s ease",
                  border:
                    activeTab === tab.name
                      ? "1px solid rgba(255, 255, 255, 0.3)"
                      : "1px solid transparent",
                  "&:hover": {
                    backgroundColor:
                      activeTab === tab.name
                        ? "rgba(255, 0, 166, 0.15)"
                        : "rgba(255,255,255,0.05)",
                    color: activeTab === tab.name ? "#dfdbfaff" : "white",
                  },
                }}
              >
                {tab.name}
              </Button>
            );
          })}
        </Box>
        <Box mb={4}>{renderTabContent()}</Box>
      </Box>
      <Dialog
        open={openHireDialog}
        onClose={handleCloseHireDialog}
        sx={{
          "& .MuiPaper-root": {
            backgroundColor: "rgba(225, 225, 225, 0.33)",
            color: "#FFFFFF",
            backdropFilter: "blur(10px)",
            borderRadius: "20px",
            border: "1px solid rgba(255, 255, 255, 0.2)",
          },
        }}
      >
        <DialogTitle id="hire-dialog-title" sx={{ fontWeight: "bold" }}>
          {" "}
          {"Convidar Influenciador"}{" "}
        </DialogTitle>
        <DialogContent>
          <DialogContentText
            id="hire-dialog-description"
            sx={{ color: "rgba(255, 255, 255, 0.8)" }}
          >
            Selecione a campanha para a qual você deseja convidar{" "}
            <strong>{influencer.nome}</strong>.
          </DialogContentText>
          <FormControl
            fullWidth
            variant="filled"
            sx={{
              mt: 3,
              "& .MuiFilledInput-root": {
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                borderRadius: "10px",
                "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.15)" },
              },
              "& .MuiInputLabel-root": { color: "rgba(255, 255, 255, 0.7)" },
              "& .MuiSelect-icon": { color: "rgba(255, 255, 255, 0.7)" },
            }}
          >
            <InputLabel id="campaign-select-label">Campanha</InputLabel>
            <Select
              labelId="campaign-select-label"
              id="campaign-select"
              value={selectedCampaign}
              onChange={(e) => setSelectedCampaign(e.target.value)}
              label="Campanha"
              sx={{ color: "white" }}
            >
              {availableCampaigns.map((campaign) => (
                <MenuItem key={campaign.id} value={campaign.id}>
                  {" "}
                  {campaign.name}{" "}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ p: "0 24px 16px" }}>
          <Button
            onClick={handleCloseHireDialog}
            sx={{
              color: "rgba(255, 255, 255, 0.7)",
              textTransform: "none",
              fontSize: "15px",
            }}
          >
            {" "}
            Cancelar{" "}
          </Button>
          <Button
            onClick={handleConfirmHire}
            sx={{
              fontWeight: "bold",
              color: "#d900c7ff",
              backgroundColor: "#ffffffff",
              textTransform: "none",
              fontSize: "15px",
              px: 2,
              borderRadius: "10px",
              "&:hover": { backgroundColor: "#e9e9e9ff" },
            }}
            autoFocus
            disabled={!selectedCampaign}
          >
            {" "}
            Enviar Convite{" "}
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={confirmationDialogOpen}
        onClose={handleCloseDialogs}
        sx={{
          "& .MuiPaper-root": {
            backgroundColor: "rgba(255, 255, 255, 0.36)",
            color: "#FFFFFF",
            backdropFilter: "blur(10px)",
            borderRadius: "20px",
            border: "1px solid rgba(255, 255, 255, 0.2)",
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: "bold" }}>
          {dialogContent.title}
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: "rgba(255, 255, 255, 0.8)" }}>
            {dialogContent.text}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: "0 24px 16px" }}>
          <Button
            onClick={handleCloseDialogs}
            sx={{ color: "rgba(255, 255, 255, 0.7)" }}
          >
            Cancelar
          </Button>
          <Button
            onClick={dialogContent.onConfirm}
            autoFocus
            sx={{
              fontWeight: "bold",
              color: "#d900c7",
              backgroundColor: "#ffffffff",
              "&:hover": { backgroundColor: "#e9e9e9ff" },
            }}
          >
            {" "}
            Confirmar{" "}
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={acceptFollowUpOpen}
        onClose={handleCloseDialogs}
        sx={{
          "& .MuiPaper-root": {
            backgroundColor: "rgba(255, 255, 255, 0.26)",
            color: "#FFFFFF",
            backdropFilter: "blur(20px)",
            borderRadius: "20px",
            border: "1px solid rgba(255, 255, 255, 0.2)",
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: "bold" }}>Convite Aceito!</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: "rgba(255, 255, 255, 0.8)" }}>
            {" "}
            Notificação enviada ao publicitário. Deseja enviar uma
            mensagem?{" "}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: "0 24px 16px" }}>
          <Button
            onClick={handleCloseDialogs}
            sx={{ color: "rgba(255, 255, 255, 0.7)" }}
          >
            Fechar
          </Button>
          <Button
            onClick={handleCloseDialogs}
            autoFocus
            sx={{
              fontWeight: "bold",
              color: "#d900c7",
              backgroundColor: "#ffffffff",
              "&:hover": { backgroundColor: "#e9e9e9ff" },
            }}
          >
            {" "}
            Enviar Mensagem{" "}
          </Button>
        </DialogActions>
      </Dialog>

      {/* --- NOVO DIÁLOGO PARA FINALIZAR CONTRATO --- */}
      <Dialog
        open={openFinalizeDialog}
        onClose={handleCloseFinalizeDialog}
        sx={{
          "& .MuiPaper-root": {
            backgroundColor: "rgba(255, 255, 255, 0.26)",
            color: "#FFFFFF",
            backdropFilter: "blur(20px)",
            borderRadius: "20px",
            border: "1px solid rgba(255, 255, 255, 0.2)",
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: "bold" }}>
          Finalizar Contrato
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: "rgba(255, 255, 255, 0.8)", mb: 2 }}>
            Para solicitar a finalização do contrato, por favor, confirme sua
            senha.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="password"
            label="Senha"
            type="password"
            fullWidth
            variant="filled"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            sx={{
              "& .MuiFilledInput-root": {
                backgroundColor: "rgba(0, 0, 0, 0.2)",
                borderRadius: "10px",
              },
              "& .MuiInputLabel-root": { color: "rgba(255, 255, 255, 0.7)" },
              "& .MuiFilledInput-input": { color: "white" },
            }}
          />
        </DialogContent>
        <DialogActions sx={{ p: "0 24px 16px" }}>
          <Button
            onClick={handleCloseFinalizeDialog}
            sx={{ color: "rgba(255, 255, 255, 0.7)" }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleConfirmFinalize}
            disabled={!password}
            autoFocus
            sx={{
              fontWeight: "bold",
              color: "#d900c7",
              backgroundColor: "#ffffffff",
              "&:hover": { backgroundColor: "#e9e9e9ff" },
              "&.Mui-disabled": { backgroundColor: "rgba(255, 255, 255, 0.5)" },
            }}
          >
            Solicitar Finalização
          </Button>
        </DialogActions>
      </Dialog>
      {/* ------------------------------------------- */}

      <Snackbar
        open={showConfirmation}
        autoHideDuration={6000}
        onClose={handleCloseConfirmation}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseConfirmation}
          severity="success"
          sx={{
            width: "100%",
            backgroundColor: "#2e7d32",
            color: "white",
            fontWeight: "bold",
          }}
        >
          Convite enviado, esperando resposta do influenciador!
        </Alert>
      </Snackbar>

      {/* --- NOVO SNACKBAR PARA FINALIZAR CONTRATO --- */}
      <Snackbar
        open={showFinalizeSuccess}
        autoHideDuration={6000}
        onClose={() => setShowFinalizeSuccess(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setShowFinalizeSuccess(false)}
          severity="info"
          sx={{
            width: "100%",
            backgroundColor: "#0288d1",
            color: "white",
            fontWeight: "bold",
          }}
        >
          Solicitação de finalização da campanha foi enviada ao publicitário.
        </Alert>
      </Snackbar>
      {/* ------------------------------------------- */}
    </Box>
  );
};

export default Sobrespec;
