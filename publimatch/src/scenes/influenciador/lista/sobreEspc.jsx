import React, { useState } from 'react';
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
import { influencers } from "../../../data/mockInfluencer.js";
import { useNavigate } from "react-router-dom";
import Estatisticas from "../../../components/Estatisticas.jsx"

const Sobrespec = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const influencer = influencers.find((inf) => inf.id === Number(id));

  const [activeTab, setActiveTab] = useState("Sobre");
  
  const [openHireDialog, setOpenHireDialog] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  
  const [openSections, setOpenSections] = useState({
    convites: true,
    participando: true,
    historico: true,
  });

  const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false);
  const [dialogContent, setDialogContent] = useState({ title: '', text: '', onConfirm: () => {} });
  const [acceptFollowUpOpen, setAcceptFollowUpOpen] = useState(false);

  // --- NOVOS ESTADOS PARA O DIÁLOGO DE FINALIZAR CONTRATO ---
  const [openFinalizeDialog, setOpenFinalizeDialog] = useState(false);
  const [password, setPassword] = useState('');
  const [showFinalizeSuccess, setShowFinalizeSuccess] = useState(false);
  // -----------------------------------------------------------


  if (!influencer) {
    return <Typography>Influenciador não encontrado.</Typography>;
  }
  
  const handleToggleSection = (section) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleOpenHireDialog = () => {
    setOpenHireDialog(true);
  };

  const handleCloseHireDialog = () => {
    setOpenHireDialog(false);
    setSelectedCampaign('');
  };

  const handleConfirmHire = () => {
    handleCloseHireDialog();
    setShowConfirmation(true);
  };
  
  const handleCloseConfirmation = (event, reason) => {
    if (reason === 'clickaway') {
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
    setPassword(''); // Limpa a senha ao fechar
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
    { name: 'Sobre', icon: PersonOutlined },
    { name: 'Avaliações', icon: Star },
    { name: 'Campanhas', icon: Campaign },
    { name: 'Estatísticas', icon: BarChart }
  ];

  
  const renderTabContent = () => {
    switch(activeTab) {
      case 'Sobre':
        return (
          <Box display="flex" gap={4} pl={5} pr={5} sx={{backgroundColor: "rgba(27, 27, 27, 0.05)", borderRadius:"20px", p:3, backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.1)"}}>
            <Box flex={2}>
              <Typography variant="h4" fontWeight="bold" mb={3} color="white">
                Sobre Mim
              </Typography>
              <Typography variant="body1" lineHeight={1.8} fontSize="16px" color="white">
                Sou criador de conteúdo digital com mais de{" "}
                <Typography component="span" fontWeight="bold">10 anos</Typography> de experiência no YouTube e nas principais
                plataformas de streaming. Meu foco é a{" "}
                <Typography component="span" fontWeight="bold">
                  produção de vídeos e transmissões ao vivo voltadas para o público gamer e jovem adulto
                </Typography>,
                com uma abordagem bem-humorada, crítica e autêntica — características
                que me aproximaram de uma comunidade engajada e fiel ao longo dos anos.
                <br /><br />
                Tenho experiência com campanhas publicitárias, ativações de marca,
                publieditoriais e ações multiplataforma. Meu diferencial está na{" "}
                <Typography component="span" fontWeight="bold">criação de conteúdos personalizados</Typography>, que comunicam a proposta
                da marca de forma natural e envolvente, sem perder minha identidade criativa.
                <br /><br />
                <Typography component="span" fontWeight="bold" fontSize="18px">
                  Métricas reais, engajamento verdadeiro.
                </Typography>{" "}
                Trabalho com dados, insights e entregas alinhadas com os objetivos
                das marcas, buscando sempre gerar valor tanto para o público quanto para os parceiros comerciais.
                Estou aberto a colaborações com agências e marcas que buscam criadores com posicionamento sólido,
                criatividade e responsabilidade na comunicação.
              </Typography>
            </Box>
            <Box flex={1}>
              <img
                src="https://pulliginfluencers.com.br/wp-content/uploads/2022/06/image-1-1.png"
                alt="Influencer foto"
                style={{
                  width: "100%",
                  borderRadius: "15px",
                  boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
                }}
              />
            </Box>
          </Box>
        );

      case 'Avaliações':
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

      case 'Campanhas':
        const participandoCampanhas = [
          { logo: "https://www.insiderstore.com.br/cdn/shop/files/insider-logo-horizontal-branco.png?v=1646765790", nome: "Divulgação - Insider", data: "07/10/2024", avaliacao: 4.8, conversao: "83% - Bom", conversaoColor: "#2196f3", visualizacoes: "1.425.095", engajamento: "450.250", tempo: "34 Dias", bgColor: "#1c1c1e", showButtons: true },
        ];
        const campanhasFinalizadas = [
          { logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0d/Nintendo.svg/2560px-Nintendo.svg.png", nome: "Nintendo Switch 2", data: "02/06/2025", avaliacao: 5.0, conversao: "93% - Excelente", conversaoColor: "#4caf50", visualizacoes: "18.234.910", engajamento: "450.250", tempo: "92 Dias", bgColor: "#e60012" },
          { logo: "https://play-lh.googleusercontent.com/nO6_gaqx-ZMCL5qhHIk1If5UAe2VDDJpb8jh0KSUwQYYGZgJuJaltsOfwaLKOOrEq49l", nome: "Divulgação - LOCO", data: "01/02/2025", avaliacao: 4.0, conversao: "62% - Aceitável", conversaoColor: "#ff9800", visualizacoes: "123.420", engajamento: "450.250", tempo: "227 Dias", bgColor: "#ff6600" },
          { logo: "https://support.apple.com/library/APPLE/APPLECARE_ALLGEOS/SP852/sp852-iphone13-pro-max-colors-2x.png", nome: "iPhone 17 - Lançamento", data: "16/06/2025", avaliacao: 5.0, conversao: "100% - Excelente", conversaoColor: "#4caf50", visualizacoes: "44.124.750", engajamento: "450.250", tempo: "72 Dias", bgColor: "#f5f5f7", showButtons: false },
        ];
        return (
          <Box pl={5} pr={5} sx={{backgroundColor: "rgba(27, 27, 27, 0.17)", borderRadius:"20px", p:3, backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.1)"}}>
            <Box mb={2}>
              <Box onClick={() => handleToggleSection('convites')} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                <Typography variant="h4" fontWeight="bold" color="white"> Convites </Typography>
                <KeyboardArrowDown sx={{ color: 'white', transform: openSections.convites ? 'rotate(0deg)' : 'rotate(-180deg)', transition: 'transform 0.3s' }} />
              </Box>
              <Collapse in={openSections.convites}>
                <Box mt={2}>
                  <Box display="flex" alignItems="center" p={2} sx={{ background: "linear-gradient(1deg, rgba(255, 255, 255, 0.34), rgba(255, 255, 255, 0.27))", borderRadius: "15px", border: "1px solid rgba(255,255,255,0.1)" }}>
                    <Avatar variant="rounded" src="https://seeklogo.com/images/N/nintendo-switch-logo-304535BE43-seeklogo.com.png" sx={{ width: 56, height: 56, mr: 2, p: 0.5, backgroundColor: "#E60012", borderRadius:"10px" }} />
                    <Box flexGrow={1}>
                      <Typography variant="body2" color="rgba(255,255,255,0.7)">Campanha</Typography>
                      <Typography variant="h6" color="white" fontWeight="bold">Nintendo Switch 3</Typography>
                      <Typography variant="caption" color="rgba(255,255,255,0.7)">Prazo: 13/06/2025</Typography>
                      <Typography variant="caption" display="block" mt={0.5} color="rgba(255,255,255,0.7)">
                        Enviado por: <strong>AmigosPubli.org</strong>
                      </Typography>
                    </Box>
                    <Box display="flex" gap={1}>
                      <IconButton onClick={handleRejectClick} sx={{ backgroundColor: "rgba(255, 82, 82, 0.2)", "&:hover": { backgroundColor: "rgba(255, 82, 82, 0.4)" } }}>
                        <Close sx={{ color: "#ff5252" }} />
                      </IconButton>
                      <IconButton onClick={handleAcceptClick} sx={{ backgroundColor: "rgba(105, 240, 174, 0.2)", "&:hover": { backgroundColor: "rgba(105, 240, 174, 0.4)" } }}>
                        <Check sx={{ color: "#69f0ae" }} />
                      </IconButton>
                    </Box>
                  </Box>
                </Box>
              </Collapse>
            </Box>
            <Divider sx={{ my: 3, borderColor: "rgba(255,255,255,0.2)" }} />
            <Box mb={2}>
              <Box onClick={() => handleToggleSection('participando')} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                <Typography variant="h4" fontWeight="bold" color="white"> Participando de </Typography>
                <KeyboardArrowDown sx={{ color: 'white', transform: openSections.participando ? 'rotate(0deg)' : 'rotate(-180deg)', transition: 'transform 0.3s' }} />
              </Box>
              <Collapse in={openSections.participando}>
                <Box display="flex" flexDirection="column" gap={2} mt={2}>
                  {participandoCampanhas.map((campanha, index) => (
                    <Box key={index} p={2.5} sx={{ backgroundColor: "rgba(255,255,255,0.08)", borderRadius: "15px", border: "1px solid rgba(255,255,255,0.1)" }}>
                      <Box display="flex" alignItems="center" justifyContent="space-between">
                        <Box display="flex" alignItems="center" flex={2.5} gap={2}>
                          <Box sx={{ width: 60, height: 60, borderRadius: "12px", backgroundColor: campanha.bgColor, flexShrink: 0, backgroundImage: `url(${campanha.logo})`, backgroundSize: "contain", backgroundPosition: "center", backgroundRepeat: "no-repeat" }} />
                          <Box>
                            <Typography variant="h6" color="white" fontWeight="bold" noWrap>{campanha.nome}</Typography>
                            <Typography variant="body2" color="rgba(255,255,255,0.6)">{campanha.data}</Typography>
                          </Box>
                        </Box>
                        <Box flex={5} display="flex" justifyContent="space-around" alignItems="center">
                            <Box textAlign="center">
                                <Typography variant="caption" color="rgba(255,255,255,0.6)">Avaliação média</Typography>
                                <Box display="flex" alignItems="center" justifyContent="center" gap={0.5}>
                                  <Rating name="read-only" value={campanha.avaliacao} precision={0.1} readOnly size="small" emptyIcon={<StarIcon style={{ opacity: 0.3 }} fontSize="inherit" />} />
                                  <Typography variant="body2" color="white" fontWeight="bold">{campanha.avaliacao.toFixed(1)}</Typography>
                                </Box>
                            </Box>
                            <Box textAlign="center">
                                <Typography variant="caption" color="rgba(255,255,255,0.6)">Conversão</Typography>
                                <Typography variant="body1" fontWeight="bold" sx={{ color: campanha.conversaoColor }}>{campanha.conversao}</Typography>
                            </Box>
                            <Box textAlign="center">
                                <Typography variant="caption" color="rgba(255,255,255,0.6)">Visualizações Atingidas</Typography>
                                <Typography variant="h6" color="white" fontWeight="bold">{campanha.visualizacoes}</Typography>
                            </Box>
                             <Box textAlign="center">
                                <Typography variant="caption" color="rgba(255,255,255,0.6)">Engajamento</Typography>
                                <Typography variant="h6" color="white" fontWeight="bold">{campanha.engajamento}</Typography>
                            </Box>
                             <Box textAlign="center">
                                <Typography variant="caption" color="rgba(255,255,255,0.6)">Tempo desde a publicação</Typography>
                                <Typography variant="body1" color="white" fontWeight="bold">{campanha.tempo}</Typography>
                            </Box>
                        </Box>
                      </Box>
                       {campanha.showButtons && (
                          <Box mt={2} pt={2} borderTop="1px solid rgba(255,255,255,0.1)" display="flex" justifyContent="center" gap={1}>
                              <Button onClick={handleOpenFinalizeDialog} size="medium" variant="outlined" startIcon={<Flag />} sx={{ color: "white", borderColor: "rgba(255,255,255,0.3)", textTransform: "none", borderRadius: "10px", "&:hover": { borderColor: "white" } }}>Finalizar Contrato</Button>
                          </Box>
                      )}
                    </Box>
                  ))}
                </Box>
              </Collapse>
            </Box>
            <Divider sx={{ my: 3, borderColor: "rgba(255,255,255,0.2)" }} />
             <Box>
                <Box onClick={() => handleToggleSection('historico')} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                  <Typography variant="h4" fontWeight="bold" color="white"> Histórico de Campanhas </Typography>
                  <KeyboardArrowDown sx={{ color: 'white', transform: openSections.historico ? 'rotate(0deg)' : 'rotate(-180deg)', transition: 'transform 0.3s' }} />
                </Box>
                <Collapse in={openSections.historico}>
                  <Box display="flex" flexDirection="column" gap={2} mt={2}>
                    {campanhasFinalizadas.map((campanha, index) => (
                      <Box key={index} display="flex" alignItems="center" p={3} sx={{ backgroundColor: "rgba(255,255,255,0.08)", borderRadius: "15px", border: "1px solid rgba(255,255,255,0.1)", transition: "all 0.3s ease", "&:hover": { backgroundColor: "rgba(255,255,255,0.12)", transform: "translateY(-2px)", boxShadow: "0 8px 25px rgba(0,0,0,0.3)" } }}>
                        <Box sx={{ width: 60, height: 60, borderRadius: "12px", backgroundColor: campanha.bgColor, mr: 3, flexShrink: 0, backgroundImage: `url(${campanha.logo})`, backgroundSize: "contain", backgroundPosition: "center", backgroundRepeat: "no-repeat" }} />
                        <Box flex={1} display="flex" justifyContent="space-between" alignItems="center">
                          <Box>
                            <Typography variant="h6" color="white" fontWeight="bold" mb={0.5}>Campanha</Typography>
                            <Typography variant="h5" color="white" fontWeight="bold" mb={0.5}>{campanha.nome}</Typography>
                            <Typography variant="h6" color="rgba(255,255,255,0.6)">{campanha.data}</Typography>
                          </Box>
                          <Box textAlign="center" mx={3}>
                            <Typography variant="caption" color="rgba(255,255,255,0.6)" mb={0.5} display="block">Avaliação média</Typography>
                            <Box display="flex" gap={0.3} justifyContent="center" mb={0.5}>
                              {[...Array(5)].map((_, i) => (<StarIcon key={i} sx={{ color: i < Math.floor(campanha.avaliacao) ? "#FFD700" : "rgba(255,255,255,0.3)", fontSize: 20 }}/>))}
                            </Box>
                            <Typography variant="body2" color="white" fontWeight="bold">{campanha.avaliacao.toFixed(1)}</Typography>
                          </Box>
                          <Box textAlign="center" mx={3}>
                            <Typography variant="caption" color="rgba(255,255,255,0.6)" mb={0.5} display="block">Conversão</Typography>
                            <Typography variant="body1" fontWeight="bold" sx={{ color: campanha.conversaoColor }}>{campanha.conversao}</Typography>
                          </Box>
                          <Box textAlign="center" mx={3}>
                            <Typography variant="caption" color="rgba(255,255,255,0.6)" mb={0.5} display="block">Visualizações Atingidas</Typography>
                            <Typography variant="h6" color="white" fontWeight="bold">{campanha.visualizacoes}</Typography>
                          </Box>
                          <Box textAlign="center" mx={3}>
                            <Typography variant="caption" color="rgba(255,255,255,0.6)" mb={0.5} display="block">Engajamento</Typography>
                            <Typography variant="h6" color="white" fontWeight="bold">{campanha.engajamento}</Typography>
                          </Box>
                          <Box textAlign="center">
                            <Typography variant="caption" color="rgba(255,255,255,0.6)" mb={0.5} display="block">Tempo desde a publicação</Typography>
                            <Typography variant="body1" color="white" fontWeight="bold">{campanha.tempo}</Typography>
                          </Box>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                </Collapse>
             </Box>
          </Box>
        );

      case 'Estatísticas': return (<Estatisticas />);
      default: return null;
    }
  };

  const { nome, nomeReal, avaliacao, seguidores, views, inscritos, descricao, engajamento, categorias, imagem, imagemFundo, } = influencer;

  return (
      <Box pr={3} pl={3}>
        <Box mb={1}>
        <Button startIcon={<MenuIcon sx={{mr: 1}} />} onClick={() => navigate(-1)} sx={{ backgroundColor: "rgba(22, 0, 61, 0.38)", color: "white", px: 2, py: 1, borderRadius: "20px", backdropFilter: "blur(10px)", textTransform: "none", fontSize: "15px", fontWeight: "500", "&:hover": { backgroundColor: "rgba(0, 0, 0, 0.23)" } }}>
          <ArrowBack sx={{  width:"10%", mr: 1 }} />
         <Typography  variant="overline" fontWeight={700} sx={{ letterSpacing: 1.4, opacity: 0.8 }}> Influenciador  </Typography>
        </Button>
      </Box>
  <Box height="calc(100vh - 120px)" overflow="auto" transition="all 0.3s ease-in-out" pb={10} sx={{ transition:"all 0.3s ease-in-out", willChange: "width", "&::-webkit-scrollbar": { width: "10px", marginRight:"10px" }, "&::-webkit-scrollbar-track": { background: "rgba(255, 255, 255, 0.1)", borderRadius: "10px" }, "&::-webkit-scrollbar-thumb": { background: "rgba(255, 255, 255, 0.3)", borderRadius: "10px" }, "&::-webkit-scrollbar-thumb:hover": { background: "rgba(255, 255, 255, 0.6)" } }}>
        <Box sx={{ position: "relative", borderRadius: 3, background: `linear-gradient(135deg, rgba(67, 4, 66, 0.7) 0%, rgba(34, 1, 58, 0.85) 50%, rgba(42, 1, 35, 0.68) 100%), url(${imagemFundo})`, backgroundSize: "cover", backgroundPosition: "center", backdropFilter: "blur(20px)", overflow: "hidden" }}>
          <Box sx={{ position: 'absolute', top: 16, right: 16, display: 'flex', alignItems: 'center', backgroundColor: 'rgba(255, 255, 255, 0.95)', borderRadius: '20px', px: 2, py: 0.5, backdropFilter: 'blur(5px)', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
            <Business sx={{ fontSize: 16, color: '#6a1b9a', mr: 1 }} />
            <Typography variant="caption" sx={{ color: '#6a1b9a' }}> Agenciado por <Typography component="span" variant="caption" fontWeight="bold">MediaList.BR</Typography> </Typography>
          </Box>
          <Box p={4}>
            <Box display="flex" alignItems="flex-start" justifyContent="space-between">
              <Box display="flex" gap={2} flex={1}>
                <Avatar src={imagem} sx={{ width: 120, height: 120, border: "4px solid white" }}/>
                <Box>
                  <Typography variant="body2" sx={{ fontStyle: "italic", opacity: 0.9, mb: 0.2, fontSize: "14px" }}> "{descricao}" </Typography>
                  <Typography variant="h3" fontWeight="bold" mb={0}> {nome} </Typography>
                  <Typography variant="h6" mb={0.5} sx={{ opacity: 0.9 }}> <PersonOutlinedIcon sx={{paddingTop:"5px"}}/>  {nomeReal}, 25 anos </Typography>
                  <Box display="flex" alignItems="center" gap={0.5} mb={1}>
                    {[...Array(5)].map((_, i) => (<StarIcon key={i} sx={{ color: i < Math.floor(avaliacao) ? "gold" : "gray", fontSize: 20 }} />))}
                    <Typography fontWeight="bold">{avaliacao.toFixed(1)}</Typography>
                  </Box>
                  <Box display="flex" gap={1} mb={1.5}>
                    {categorias.map((cat, i) => (<Chip key={i} label={cat} size="small" sx={{ bgcolor: "rgba(255,255,255,0.2)", color: "white", fontWeight: "bold", backdropFilter: "blur(10px)" }} />))}
                  </Box>
                  <Box display="flex" gap={1}>
                    {[YouTubeIcon, InstagramIcon, SportsEsportsIcon, MusicNoteIcon].map((Icon, i) => (<Box key={i} sx={{ width: 32, height: 32, borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}> <Icon sx={{ fontSize: 16 }} /> </Box>))}
                  </Box>
                </Box>
              </Box>
              <Box display="flex" flexDirection="column" gap={3} mt={3} alignItems="center" sx={{ minWidth: "300px" }}>
                <Box display="flex" alignItems="center" gap={1} textAlign="center">
                  <Favorite sx={{ fontSize: 24, color: "#ff1493" }} />
                  <Box>
                    <Typography variant="h4" fontWeight="bold">{seguidores}M</Typography>
                    <Typography variant="caption" sx={{ opacity: 0.8 }}>Curtidas</Typography>
                  </Box>
                </Box>
                <Box display="flex" alignItems="center" gap={1} textAlign="center">
                  <Visibility sx={{ fontSize: 24, color: "#2196f3" }} />
                  <Box>
                    <Typography variant="h4" fontWeight="bold">{views}M</Typography>
                    <Typography variant="caption" sx={{ opacity: 0.8 }}>Visualizações</Typography>
                  </Box>
                </Box>
                <Box display="flex" alignItems="center" gap={1} textAlign="center">
                  <Groups sx={{ fontSize: 24, color: "#9c27b0" }} />
                  <Box>
                    <Typography variant="h4" fontWeight="bold">{inscritos}M</Typography>
                    <Typography variant="caption" sx={{ opacity: 0.8 }}>Seguidores</Typography>
                  </Box>
                </Box>
                <Box display="flex" alignItems="center" gap={1} textAlign="center">
                  <TrendingUp sx={{ fontSize: 24, color: "#4caf50" }} />
                  <Box>
                    <Typography variant="h4" fontWeight="bold" color="#4caf50"> {engajamento}% </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.8 }}>Média de Conversão</Typography>
                  </Box>
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
         <Box display="flex" justifyContent="center" gap={2} my={2} sx={{ backgroundColor: "rgba(255,255,255,0.05)", borderRadius: "20px", p:1 , backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.1)" }}>
          {tabs.map((tab) => {
            const IconComponent = tab.icon;
            return (
              <Button key={tab.name} startIcon={<IconComponent />} onClick={() => setActiveTab(tab.name)} sx={{ color: activeTab === tab.name ? "#ffffffff" : "rgba(255,255,255,0.7)", fontWeight: activeTab === tab.name ? "bold" : "normal", fontSize: "14px", textTransform: "none", backgroundColor: activeTab === tab.name ? "rgba(58, 0, 151, 0.1)" : "transparent", borderRadius: "15px", px: 3, py: 1.5, transition: "all 0.3s ease", border: activeTab === tab.name ? "1px solid rgba(255, 255, 255, 0.3)" : "1px solid transparent", "&:hover": { backgroundColor: activeTab === tab.name ? "rgba(255, 0, 166, 0.15)" : "rgba(255,255,255,0.05)", color: activeTab === tab.name ? "#dfdbfaff" : "white" } }}>
                {tab.name}
              </Button>
            );
          })}
        </Box>
        <Box mb={4}>
          {renderTabContent()}
        </Box>
      </Box>
        <Dialog open={openHireDialog} onClose={handleCloseHireDialog} sx={{ "& .MuiPaper-root": { backgroundColor: "rgba(225, 225, 225, 0.33)", color: "#FFFFFF", backdropFilter: "blur(10px)", borderRadius: '20px', border: '1px solid rgba(255, 255, 255, 0.2)' } }}>
            <DialogTitle id="hire-dialog-title" sx={{ fontWeight: 'bold' }}> {"Convidar Influenciador"} </DialogTitle>
            <DialogContent>
                <DialogContentText id="hire-dialog-description" sx={{ color: "rgba(255, 255, 255, 0.8)" }}>
                    Selecione a campanha para a qual você deseja convidar <strong>{influencer.nome}</strong>.
                </DialogContentText>
                <FormControl fullWidth variant="filled" sx={{ mt: 3, '& .MuiFilledInput-root': { backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: '10px', '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.15)' } }, '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.7)' }, '& .MuiSelect-icon': { color: 'rgba(255, 255, 255, 0.7)' } }}>
                    <InputLabel id="campaign-select-label">Campanha</InputLabel>
                    <Select labelId="campaign-select-label" id="campaign-select" value={selectedCampaign} onChange={(e) => setSelectedCampaign(e.target.value)} label="Campanha" sx={{color: 'white'}}>
                        {availableCampaigns.map((campaign) => ( <MenuItem key={campaign.id} value={campaign.id}> {campaign.name} </MenuItem> ))}
                    </Select>
                </FormControl>
            </DialogContent>
            <DialogActions sx={{ p: '0 24px 16px' }}>
                <Button onClick={handleCloseHireDialog} sx={{ color: "rgba(255, 255, 255, 0.7)", textTransform:'none', fontSize: '15px' }}> Cancelar </Button>
                <Button onClick={handleConfirmHire} sx={{ fontWeight: 'bold', color: "#d900c7ff", backgroundColor: '#ffffffff', textTransform:'none', fontSize: '15px', px: 2, borderRadius: '10px', "&:hover": { backgroundColor: '#e9e9e9ff' } }} autoFocus disabled={!selectedCampaign} > Enviar Convite </Button>
            </DialogActions>
        </Dialog>
      <Dialog open={confirmationDialogOpen} onClose={handleCloseDialogs} sx={{ "& .MuiPaper-root": { backgroundColor: "rgba(255, 255, 255, 0.36)", color: "#FFFFFF", backdropFilter: "blur(10px)", borderRadius: '20px', border: '1px solid rgba(255, 255, 255, 0.2)' } }}>
        <DialogTitle sx={{ fontWeight: 'bold' }}>{dialogContent.title}</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: "rgba(255, 255, 255, 0.8)" }}>{dialogContent.text}</DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: '0 24px 16px' }}>
          <Button onClick={handleCloseDialogs} sx={{ color: "rgba(255, 255, 255, 0.7)" }}>Cancelar</Button>
          <Button onClick={dialogContent.onConfirm} autoFocus sx={{ fontWeight: 'bold', color: "#d900c7", backgroundColor: '#ffffffff', "&:hover": { backgroundColor: '#e9e9e9ff' } }}> Confirmar </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={acceptFollowUpOpen} onClose={handleCloseDialogs} sx={{ "& .MuiPaper-root": { backgroundColor: "rgba(255, 255, 255, 0.26)", color: "#FFFFFF", backdropFilter: "blur(20px)", borderRadius: '20px', border: '1px solid rgba(255, 255, 255, 0.2)' } }}>
        <DialogTitle sx={{ fontWeight: 'bold' }}>Convite Aceito!</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: "rgba(255, 255, 255, 0.8)" }}> Notificação enviada ao publicitário. Deseja enviar uma mensagem? </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: '0 24px 16px' }}>
          <Button onClick={handleCloseDialogs} sx={{ color: "rgba(255, 255, 255, 0.7)" }}>Fechar</Button>
          <Button onClick={handleCloseDialogs} autoFocus sx={{ fontWeight: 'bold', color: "#d900c7", backgroundColor: '#ffffffff', "&:hover": { backgroundColor: '#e9e9e9ff' } }}> Enviar Mensagem </Button>
        </DialogActions>
      </Dialog>
      
      {/* --- NOVO DIÁLOGO PARA FINALIZAR CONTRATO --- */}
      <Dialog open={openFinalizeDialog} onClose={handleCloseFinalizeDialog} sx={{ "& .MuiPaper-root": { backgroundColor: "rgba(255, 255, 255, 0.26)", color: "#FFFFFF", backdropFilter: "blur(20px)", borderRadius: '20px', border: '1px solid rgba(255, 255, 255, 0.2)' } }}>
        <DialogTitle sx={{ fontWeight: 'bold' }}>Finalizar Contrato</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: "rgba(255, 255, 255, 0.8)", mb: 2 }}>
            Para solicitar a finalização do contrato, por favor, confirme sua senha.
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
              '& .MuiFilledInput-root': { backgroundColor: 'rgba(0, 0, 0, 0.2)', borderRadius: '10px' },
              '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.7)' },
              '& .MuiFilledInput-input': { color: 'white' }
            }}
          />
        </DialogContent>
        <DialogActions sx={{ p: '0 24px 16px' }}>
          <Button onClick={handleCloseFinalizeDialog} sx={{ color: "rgba(255, 255, 255, 0.7)" }}>Cancelar</Button>
          <Button onClick={handleConfirmFinalize} disabled={!password} autoFocus sx={{ fontWeight: 'bold', color: "#d900c7", backgroundColor: '#ffffffff', "&:hover": { backgroundColor: '#e9e9e9ff' }, '&.Mui-disabled': { backgroundColor: 'rgba(255, 255, 255, 0.5)' } }}>
            Solicitar Finalização
          </Button>
        </DialogActions>
      </Dialog>
      {/* ------------------------------------------- */}

        <Snackbar open={showConfirmation} autoHideDuration={6000} onClose={handleCloseConfirmation} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
          <Alert onClose={handleCloseConfirmation} severity="success" sx={{ width: '100%', backgroundColor: '#2e7d32', color: 'white', fontWeight: 'bold' }}>
            Convite enviado, esperando resposta do influenciador!
          </Alert>
        </Snackbar>

        {/* --- NOVO SNACKBAR PARA FINALIZAR CONTRATO --- */}
        <Snackbar open={showFinalizeSuccess} autoHideDuration={6000} onClose={() => setShowFinalizeSuccess(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
          <Alert onClose={() => setShowFinalizeSuccess(false)} severity="info" sx={{ width: '100%', backgroundColor: '#0288d1', color: 'white', fontWeight: 'bold' }}>
            Solicitação de finalização da campanha foi enviada ao publicitário.
          </Alert>
        </Snackbar>
        {/* ------------------------------------------- */}
      </Box>
  );
};

export default Sobrespec;