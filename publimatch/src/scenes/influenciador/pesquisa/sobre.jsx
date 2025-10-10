import React, { useState, useEffect } from 'react';
import {

  Box, Typography, Avatar, Button, Chip, Divider, IconButton, Card,
  CardContent, Grid, Rating, LinearProgress, Dialog, DialogActions,
  DialogContent, DialogContentText, DialogTitle, FormControl,
  InputLabel, Select, MenuItem, Snackbar, Alert, CircularProgress
} from "@mui/material";
import { 
  Favorite, Visibility, Groups, Menu as MenuIcon, ArrowBack,
  TrendingUp, Star, YouTube, Instagram, SportsEsports,
  MusicNote, PersonOutlined, Business, BarChart, Campaign
} from "@mui/icons-material";
import StarIcon from "@mui/icons-material/Star";
import YouTubeIcon from "@mui/icons-material/YouTube";
import InstagramIcon from "@mui/icons-material/Instagram";
import SportsEsportsIcon from "@mui/icons-material/SportsEsports";
import MusicNoteIcon from "@mui/icons-material/MusicNote";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import { useParams, useNavigate } from "react-router-dom";
import Estatisticas from "../../../components/Estatisticas.jsx";
import TiptapContent from "../../../components/TiptapContent.jsx";
// 1. IMPORTS DE ANIMAÇÃO
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import axiosInstance from '../../../auth/axios.jsx';
// Importar o hook de autenticação e as ROLES
import { useAuth } from '../../../auth/AuthContext'; // Ajuste o caminho se necessário

import { SiTwitch } from 'react-icons/si';

export const ROLES = {
    AD_AGENT: 'AD_AGENT',
    INFLUENCER_AGENT: 'INFLUENCER_AGENT',
    INFLUENCER: 'INFLUENCER',
    ADMIN: 'ADMIN',
};

const InfluencerProfile = () => {
  // Acessar os dados do usuário logado
   const { user } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();

    const [influencer, setInfluencer] = useState(null); // Começa como nulo
  const [loading, setLoading] = useState(true); // Começa carregando
  const [userCampaigns, setUserCampaigns] = useState([]);
  const [dialogLoading, setDialogLoading] = useState(false);

  const [activeTab, setActiveTab] = useState("Sobre");
  const [openHireDialog, setOpenHireDialog] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
 const [error, setError] = useState(null); 

  
  // Condição para exibir o botão de contratar
  const canHire = user && user.role === ROLES.AD_AGENT;

  // MODIFICAÇÃO 1: Criar nova condição para ver detalhes das avaliações
  const canSeeDetailedReviews = user && user.role === ROLES.AD_AGENT;
useEffect(() => {
        const fetchPublicInfluencerData = async () => {
            try {
                // A URL agora aponta para a nova rota '/public/'
                const { data } = await axios.get(`http://localhost:5001/api/influencers/public/${id}`);
                
                setInfluencer(data);
            } catch (err) {
                console.error("Erro ao buscar perfil público:", err.response);
                setError(err.response?.data?.message || 'Este perfil não pôde ser carregado.');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchPublicInfluencerData();
        }
    }, [id]);

  // ALTERADO: Tratamento de loading e erro, igual ao do Sobrespec
  if (loading) {
    return <Box display="flex" justifyContent="center" alignItems="center" height="50vh"><CircularProgress /></Box>;
  }

  if (error) {
    return <Box display="flex" justifyContent="center" alignItems="center" height="50vh"><Typography color="error">{error}</Typography></Box>;
  }

  if (!influencer) {
    return <Typography sx={{ m: 3 }}>Influenciador não encontrado.</Typography>;
  }


  // 2. DEFINIÇÃO DAS VARIANTES DE ANIMAÇÃO
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


  if (!influencer) {
    return <Typography>Influenciador não encontrado.</Typography>;
  }

const handleOpenHireDialog = async () => {
    // 1. Abre o diálogo e ativa o estado de loading
    setOpenHireDialog(true);
    setDialogLoading(true);

    try {
        // 2. Pega o token do usuário logado (assumindo que está no objeto 'user')
        const token = user?.token; 
        if (!token) {
            console.error("Usuário não autenticado para buscar campanhas.");
            // Opcional: Adicionar um feedback de erro para o usuário
            setDialogLoading(false);
            return;
        }

        // 3. Configura o header de autorização para a requisição
        const config = {
            headers: {
                Authorization: `Bearer ${token}`
            }
        };

        // 4. Faz a chamada à API para buscar as campanhas do usuário logado
        //    (Ajuste a URL se necessário para corresponder à sua rota no backend)
        const { data } = await axios.get('http://localhost:5001/api/campaigns/my-campaigns', config);
        
        // 5. Atualiza o estado com as campanhas recebidas
        setUserCampaigns(data);

    } catch (err) {
        console.error("Erro ao buscar as campanhas do usuário:", err);
        // Limpa as campanhas em caso de erro e informa o usuário
        setUserCampaigns([]); 
        // Você pode também usar o estado de 'error' para mostrar uma mensagem no Snackbar
        setError("Não foi possível carregar suas campanhas. Tente novamente.");
    } finally {
        // 6. Desativa o estado de loading, independentemente do resultado
        setDialogLoading(false);
    }
};


const handleCloseHireDialog = () => {
    setOpenHireDialog(false);
    setSelectedCampaign('');
    // Limpa a lista para buscar novamente da próxima vez
    setUserCampaigns([]); 
};

const handleConfirmHire = async () => {
    // Verifica se uma campanha foi selecionada
    if (!selectedCampaign) {
        setError("Por favor, selecione uma campanha antes de enviar o convite.");
        return;
    }

       console.log('FRONTEND: Enviando convite para o Influencer ID:', id);

       
    try {
        // Pega o token para autenticação
        const token = user?.token;
        if (!token) {
            throw new Error("Usuário não autenticado.");
        }

        // Prepara os dados para enviar à API
        const inviteData = {
            campaignId: selectedCampaign, // ID da campanha selecionada
            influencerId: id,             // ID do influenciador (da URL)
        };

        // Configura o header da requisição
        const config = {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        };

        // Rota da API para criar um convite (que gera a notificação)
        // Certifique-se de que essa rota exista no seu backend
        await axios.post('http://localhost:5001/api/invites', inviteData, config);

        // Se a requisição for bem-sucedida:
        handleCloseHireDialog();
        setShowConfirmation(true); // Mostra o Snackbar de sucesso

    } catch (err) {
        console.error("Erro ao enviar convite:", err);
        // Mostra uma mensagem de erro para o usuário
        setError(err.response?.data?.message || "Não foi possível enviar o convite. Tente novamente.");
        // Você pode usar um Snackbar de erro aqui também
    }
};

  const handleCloseConfirmation = (event, reason) => {
    if (reason === 'clickaway') return;
    setShowConfirmation(false);
  };

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
      case "Sobre":
        return (
          <Box
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

      case 'Avaliações':
        return (
          <Box 
            component={motion.div}
            key="avaliacoes"
            variants={tabContentVariant}
            initial="hidden"
            animate="visible"
            exit="exit"
            pl={5} pr={5} sx={{backgroundColor: "rgba(27, 27, 27, 0.26)", borderRadius:"20px", p:3, backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.1)"}}>
            <Box display="flex" gap={4}>
              {/* AVALIAÇÃO PRINCIPAL */}
              <Box flex={1} display="flex" flexDirection="column" alignItems="center" justifyContent="center" sx={{
                borderRadius: "20px",
                p: 4,
                textAlign: "center"
              }}>
                <Typography variant="h1" fontWeight="bold" color="white" sx={{ fontSize: "120px", lineHeight: 1 }}>
                  4.2
                </Typography>
                
                <Box display="flex" gap={0.5} mb={2}>
                  {[...Array(5)].map((_, i) => (
                    <StarIcon
                      key={i}
                      sx={{
                        color: i < 4 ? "#FFD700" : "rgba(255,255,255,0.3)",
                        fontSize: 32,
                      }}
                    />
                  ))}
                </Box>
                
                <Typography variant="h4" fontWeight="bold" color="white" mb={1}>
                  Muito Bom!
                </Typography>
                
                <Box display="flex" gap={1} flexWrap="wrap" justifyContent="center">
                  {["Prestativo", "Criativo", "Agradável", "Atencioso"].map((tag, i) => (
                    <Chip
                      key={i}
                      label={tag}
                      size="small"
                      sx={{
                        bgcolor: "rgba(255,255,255,0.2)",
                        color: "white",
                        fontWeight: "bold",
                        borderRadius: "15px"
                      }}
                    />
                  ))}
                </Box>
              </Box>

              {/* AVALIAÇÕES RECENTES */}
              <Box flex={1.2}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                  <Typography variant="h6" color="white">
                    Mais Recentes
                  </Typography>
                  <Typography variant="body2" color="rgba(255,255,255,0.7)">
                    ⌄
                  </Typography>
                </Box>

                {/* AVALIAÇÃO 1 */}
                <Box mb={3} p={3} sx={{
                  backgroundColor: "rgba(255,255,255,0.08)",
                  borderRadius: "15px",
                  border: "1px solid rgba(255,255,255,0.1)"
                }}>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                    <Box>
                      <Typography variant="body1" color="white" fontWeight="bold" mb={0.5}>
                        Entrega criativa e autêntica — superou expectativas!
                      </Typography>
                      <Typography variant="caption" color="rgba(255,255,255,0.6)">
                        18/08/2025
                      </Typography>
                    </Box>
                    {/* MODIFICAÇÃO 2: Renderização condicional do Chip da campanha */}
                    {canSeeDetailedReviews && (
                      <Chip 
                        label="Campanha Lançamento Iphone 17"
                        size="small"
                        sx={{
                          bgcolor: "rgba(255, 255, 255, 0.89)",
                          color: "#2d0069ff",
                          fontWeight: "bold",
                          fontSize: "11px"
                        }}
                      />
                    )}
                  </Box>

                  <Box display="flex" gap={0.5} mb={2}>
                    {[...Array(5)].map((_, i) => (
                      <StarIcon
                        key={i}
                        sx={{
                          color: "#FFD700",
                          fontSize: 16,
                        }}
                      />
                    ))}
                    <Typography variant="body2" color="white" fontWeight="bold" ml={1}>
                      5.0
                    </Typography>
                    <Box ml={2} display="flex" gap={1}>
                      <Chip label="Proatividade" size="small" sx={{bgcolor: "rgba(76, 175, 80, 0.2)", color: "#4caf50", fontSize: "10px"}} />
                      <Chip label="Profissional" size="small" sx={{bgcolor: "rgba(76, 175, 80, 0.2)", color: "#4caf50", fontSize: "10px"}} />
                      <Chip label="Resultados" size="small" sx={{bgcolor: "rgba(76, 175, 80, 0.2)", color: "#4caf50", fontSize: "10px"}} />
                    </Box>
                  </Box>

                  {/* MODIFICAÇÃO 3: Renderização condicional do texto da avaliação */}
                  {canSeeDetailedReviews ? (
                      <Typography variant="body2" color="rgba(255,255,255,0.8)" lineHeight={1.6}>
                        Trabalhar com o Gemaplys foi uma experiência extremamente positiva. Desde o briefing inicial até a publicação final, ele 
                        demonstrou profissionalismo, criatividade e comprometimento com a entrega.
                      </Typography>
                  ) : (
                      <Typography variant="body2" fontStyle="italic" color="rgba(255,255,255,0.5)" lineHeight={1.6}>
                        O conteúdo detalhado desta avaliação é visível apenas para Agentes de Publicidade.
                      </Typography>
                  )}
                </Box>

                {/* AVALIAÇÃO 2 */}
                <Box p={3} sx={{
                  backgroundColor: "rgba(255,255,255,0.08)",
                  borderRadius: "15px",
                  border: "1px solid rgba(255,255,255,0.1)"
                }}>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                    <Box>
                      <Typography variant="body1" color="white" fontWeight="bold" mb={0.5}>
                        Bom desempenho, mas com espaço para melhorias
                      </Typography>
                      <Typography variant="caption" color="rgba(255,255,255,0.6)">
                        14/08/2025
                      </Typography>
                    </Box>
                    {/* MODIFICAÇÃO 2: Renderização condicional do Chip da campanha */}
                    {canSeeDetailedReviews && (
                      <Chip 
                        label="Campanha Antigos 2"
                        size="small"
                        sx={{
                          bgcolor: "rgba(255, 152, 0, 0.2)",
                          color: "#ff9800",
                          fontSize: "11px"
                        }}
                      />
                    )}
                  </Box>
                  <Box display="flex" gap={0.5} mb={2}>
                    {[...Array(5)].map((_, i) => (
                      <StarIcon
                        key={i}
                        sx={{
                          color: i < 3 ? "#FFD700" : "rgba(255,255,255,0.3)",
                          fontSize: 16,
                        }}
                      />
                    ))}
                    <Typography variant="body2" color="white" fontWeight="bold" ml={1}>
                      3.5
                    </Typography>
                    <Box ml={2} display="flex" gap={1}>
                      <Chip label="Indefinido" size="small" sx={{bgcolor: "rgba(255, 152, 0, 0.2)", color: "#ff9800", fontSize: "10px"}} />
                      <Chip label="Carisma" size="small" sx={{bgcolor: "rgba(76, 175, 80, 0.2)", color: "#4caf50", fontSize: "10px"}} />
                      <Chip label="Resultados" size="small" sx={{bgcolor: "rgba(76, 175, 80, 0.2)", color: "#4caf50", fontSize: "10px"}} />
                    </Box>
                  </Box>
                  {/* MODIFICAÇÃO 3: Renderização condicional do texto da avaliação */}
                  {canSeeDetailedReviews ? (
                    <Typography variant="body2" color="rgba(255,255,255,0.8)" lineHeight={1.6}>
                      Gemaplys demonstrou carisma e capacidade de engajamento com seu público, características que agregaram valor à campanha...
                    </Typography>
                  ) : (
                      <Typography variant="body2" fontStyle="italic" color="rgba(255,255,255,0.5)" lineHeight={1.6}>
                        O conteúdo detalhado desta avaliação é visível apenas para Agentes de Publicidade.
                      </Typography>
                  )}
                </Box>
              </Box>
            </Box>
          </Box>
        );


 case 'Campanhas':
    const campanhas = [
      { logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0d/Nintendo.svg/2560px-Nintendo.svg.png", nome: "Nintendo Switch 3", data: "02/06/2025", avaliacao: 5.0, conversao: "93% - Excelente", conversaoColor: "#4caf50", visualizacoes: "18.234.910", engajamento: "450.250", tempo: "2 Dias", bgColor: "#e60012" },
      { logo: "https://play-lh.googleusercontent.com/nO6_gaqx-ZMCL5qhHIk1If5UAe2VDDJpb8jh0KSUwQYYGZgJuJaltsOfwaLKOOrEq49l", nome: "Divulgação - LOCO", data: "01/02/2025", avaliacao: 4.0, conversao: "62% - Aceitável", conversaoColor: "#ff9800", visualizacoes: "123.420", engajamento: "450.250", tempo: "27 Dias", bgColor: "#ff6600" },
      { logo: "https://www.insiderstore.com.br/cdn/shop/files/Foto-03_a44bf6d3-e366-42d3-a459-e0668f7a002e.png?v=1756219633&width=600", nome: "Divulgação - Insider", data: "07/10/2024", avaliacao: 4.8, conversao: "83% - Bom", conversaoColor: "#2196f3", visualizacoes: "1.425.095", engajamento: "450.250", tempo: "34 Dias", bgColor: "#000000" },
      { logo: "https://cdn.awsli.com.br/800x800/2122/2122929/produto/179971951/1be1261942.jpg", nome: "iPhone 17 - Lançamento", data: "18/06/2025", avaliacao: 5.0, conversao: "100% - Excelente", conversaoColor: "#4caf50", visualizacoes: "44.124.750", engajamento: "450.250", tempo: "72 Dias", bgColor: "#007aff" }
    ];

    return (
      <Box 
        component={motion.div}
        key="campanhas"
        variants={tabContentVariant}
        initial="hidden"
        animate="visible"
        exit="exit"
        pl={5} pr={5} sx={{backgroundColor: "rgba(27, 27, 27, 0.17)", borderRadius:"20px", p:3, backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.1)"}}>
        <Typography variant="h4" fontWeight="bold" mb={3} color="white">
          Participou em:
        </Typography>
        
        {/* 6. ANIMAÇÃO ESCALONADA NA LISTA DE CAMPANHAS */}
        <Box 
          component={motion.div}
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          display="flex" 
          flexDirection="column" 
          gap={2}
        >
          {campanhas.map((campanha, index) => (
            <Box 
              component={motion.div}
              variants={staggerItem}
              key={index}
              display="flex" alignItems="center" p={3} 
              sx={{
                backgroundColor: "rgba(255,255,255,0.08)",
                borderRadius: "15px",
                border: "1px solid rgba(255,255,255,0.1)",
                transition: "all 0.3s ease",
                "&:hover": {
                  backgroundColor: "rgba(255,255,255,0.12)",
                  transform: "translateY(-2px)",
                  boxShadow: "0 8px 25px rgba(0,0,0,0.3)"
                }
              }}
            >
              <Box 
                sx={{
                  width: 60, height: 60, borderRadius: "12px", backgroundColor: campanha.bgColor, mr: 3, flexShrink: 0,
                  backgroundImage: `url(${campanha.logo})`, backgroundSize: "contain", backgroundPosition: "center", backgroundRepeat: "no-repeat",
                }}
              />
              <Box flex={1} display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="h6" color="white" fontWeight="bold" mb={0.5}>Campanha</Typography>
                  <Typography variant="h5" color="white" fontWeight="bold" mb={0.5}>{campanha.nome}</Typography>
                  <Typography variant="h6" color="rgba(255,255,255,0.6)">{campanha.data}</Typography>
                </Box>
                <Box textAlign="center" mx={3}>
                  <Typography variant="caption" color="rgba(255,255,255,0.6)" mb={0.5} display="block">Avaliação média</Typography>
                  <Box display="flex" gap={0.3} justifyContent="center" mb={0.5}>
                    {[...Array(5)].map((_, i) => (<StarIcon key={i} sx={{ color: i < Math.floor(campanha.avaliacao) ? "#FFD700" : "rgba(255,255,255,0.3)", fontSize: 20, }} />))}
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
      </Box>
    );

 case 'Estatísticas':
  return (
    <Box
        component={motion.div}
        key="estatisticas"
        variants={tabContentVariant}
        initial="hidden"
        animate="visible"
        exit="exit"
    >
        <Estatisticas />
    </Box>
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
    // Adicionamos a avaliação aqui com um valor padrão
    avaliacao = 4.5,
    // Adicionamos os outros campos aqui também
    views = 150,
    seguidores = 80,
    curtidas = 40,
} = influencer || {};

  return (
      <Box pr={3} pl={3}>
        <Box mb={1}>
        <Button
          startIcon={<MenuIcon sx={{mr: 1}} />}
          onClick={() => navigate(-1)}
          sx={{ backgroundColor: "rgba(22, 0, 61, 0.38)", color: "white", px: 2, py: 1, borderRadius: "20px", backdropFilter: "blur(10px)", textTransform: "none", fontSize: "15px", fontWeight: "500", "&:hover": { backgroundColor: "rgba(0, 0, 0, 0.23)", }, }}
        >
          <ArrowBack sx={{  width:"10%", mr: 1 }} />
         <Typography  variant="overline" fontWeight={700} sx={{ letterSpacing: 1.4, opacity: 0.8 }}> Influenciador  </Typography>
        </Button>
      </Box>
  <Box 
    height="calc(100vh - 120px)"
    overflow="auto"
    transition="all 0.3s ease-in-out"  
    pb={10}
 sx={{ transition:"all 0.3s ease-in-out", willChange: "width", "&::-webkit-scrollbar": { width: "10px", marginRight:"10px", }, "&::-webkit-scrollbar-track": { background: "rgba(255, 255, 255, 0.1)", borderRadius: "10px", }, "&::-webkit-scrollbar-thumb": { background: "rgba(255, 255, 255, 0.3)", borderRadius: "10px", }, "&::-webkit-scrollbar-thumb:hover": { background: "rgba(255, 255, 255, 0.6)", }, }}
>
     {/* HEADER PERFIL */}
        <Box
          // 3. ANIMAÇÃO DE ENTRADA DO CABEÇALHO
          component={motion.div}
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          sx={{
            position: "relative", borderRadius: 3,
            background: `linear-gradient(135deg, rgba(67, 4, 66, 0.7) 0%, rgba(34, 1, 58, 0.85) 50%, rgba(42, 1, 35, 0.68) 100%), url(${imagemFundo})`,
            backgroundSize: "cover", backgroundPosition: "center", backdropFilter: "blur(20px)", overflow: "hidden",
          }}
        >
          <Box
            sx={{ position: 'absolute', top: 16, right: 16, display: 'flex', alignItems: 'center', backgroundColor: 'rgba(255, 255, 255, 0.95)', borderRadius: '20px', px: 2, py: 0.5, backdropFilter: 'blur(5px)', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}
          >
            <Business sx={{ fontSize: 16, color: '#6a1b9a', mr: 1 }} />
            <Typography variant="caption" sx={{ color: '#6a1b9a' }}>
              Agenciado por <Typography component="span" variant="caption" fontWeight="bold">MediaList.BR</Typography>
            </Typography>
          </Box>

          <Box p={4}>
            <Box display="flex" alignItems="flex-start" justifyContent="space-between">
              {/* LADO ESQUERDO - PERFIL */}
              <Box component={motion.div} variants={staggerItem} display="flex" gap={2} flex={1}>
                <Avatar src={imagem} sx={{ width: 120, height: 120, border: "4px solid white" }} />
                <Box>
                  <Typography variant="body2" sx={{ fontStyle: "italic", opacity: 0.9, mb: 0.2, fontSize: "14px" }}>"{descricao}"</Typography>
                  <Typography variant="h3" fontWeight="bold" mb={0}>{nome}</Typography>
                    <Typography variant="h6" mb={0.5} sx={{ opacity: 0.9 }}>
                    <PersonOutlinedIcon sx={{paddingTop:"5px"}}/>  {nomeReal}, {idade} anos
                  </Typography>
                  <Box display="flex" alignItems="center" gap={0.5} mb={1}>
                    {[...Array(5)].map((_, i) => ( <StarIcon key={i} sx={{ color: i < Math.floor(avaliacao) ? "gold" : "gray", fontSize: 20, }} /> ))}
                    <Typography fontWeight="bold">{avaliacao.toFixed(1)}</Typography>
                  </Box>
                  <Box display="flex" gap={1} mb={1.5}>
                    {categorias.map((cat, i) => ( <Chip key={i} label={cat} size="small" sx={{ bgcolor: "rgba(255,255,255,0.2)", color: "white", fontWeight: "bold", backdropFilter: "blur(10px)", }} /> ))}
                  </Box>
                 <Box display="flex" gap={1}>
                    {social.youtube && (
                      <Box
                        sx={{
                          width: 32, height: 32, borderRadius: "50%",
                          backgroundColor: "rgba(255,255,255,0.2)", display: "flex",
                          alignItems: "center", justifyContent: "center", cursor: "pointer",
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
                          width: 32, height: 32, borderRadius: "50%",
                          backgroundColor: "rgba(255,255,255,0.2)", display: "flex",
                          alignItems: "center", justifyContent: "center", cursor: "pointer",
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
                          width: 32, height: 32, borderRadius: "50%",
                          backgroundColor: "rgba(255,255,255,0.2)", display: "flex",
                          alignItems: "center", justifyContent: "center", cursor: "pointer",
                          "&:hover": { backgroundColor: "rgba(255,255,255,0.3)" }
                        }}
                        onClick={() => window.open(social.twitch, '_blank')}
                      >
                        <SiTwitch size={14} />
                      </Box>
                    )}
                    {social.tiktok && (
                      <Box
                        sx={{
                          width: 32, height: 32, borderRadius: "50%",
                          backgroundColor: "rgba(255,255,255,0.2)", display: "flex",
                          alignItems: "center", justifyContent: "center", cursor: "pointer",
                          "&:hover": { backgroundColor: "rgba(255,255,255,0.3)" }
                        }}
                        onClick={() => window.open(social.tiktok, '_blank')}
                      >
                        <MusicNoteIcon sx={{ fontSize: 16 }} />
                      </Box>
                    )}
                  </Box>
                  {/* Renderização condicional do botão */}
                  {canHire && (
                    <Box mt={1.2}>
                      <Button
                        variant="contained" startIcon={<Favorite />} onClick={handleOpenHireDialog}
                        sx={{ background: "#f9f1f1ff", px: 4, py: 1.5, color:"#ff00a6ff", borderRadius: "25px", fontWeight: "bold", fontSize: "16px", transition: "0.2s all ease-in-out", textTransform: "none", boxShadow: "0px 0px 24.5px 4px rgba(255, 55, 235, 0.25)", "&:hover": { background: "#ffffffff", transform: "scale(1.05)", borderRadius:"10px", boxShadow: "0px 0px 15px 4px rgba(255, 55, 235, 0.53)", }, }}
                      >
                        Contratar
                      </Button>
                    </Box>
                  )}
                </Box>
              </Box>
              {/* LADO DIREITO - MÉTRICAS */}
              <Box 
                component={motion.div} variants={staggerItem}
                display="flex" flexDirection="column" gap={3} mt={3} alignItems="center" sx={{ minWidth: "300px" }}
              >
              <Box display="flex" alignItems="center" gap={1} textAlign="center">
                  <Favorite sx={{ fontSize: 24, color: "#ff1493" }} />
                  <Box><Typography variant="h4" fontWeight="bold">{curtidas}M</Typography><Typography variant="caption" sx={{ opacity: 0.8 }}>Curtidas</Typography></Box>
                </Box>
                <Box display="flex" alignItems="center" gap={1} textAlign="center">
                  <Visibility sx={{ fontSize: 24, color: "#2196f3" }} />
                  <Box><Typography variant="h4" fontWeight="bold">{views}M</Typography><Typography variant="caption" sx={{ opacity: 0.8 }}>Visualizações</Typography></Box>
                </Box>
                <Box display="flex" alignItems="center" gap={1} textAlign="center">
                  <Groups sx={{ fontSize: 24, color: "#9c27b0" }} />
                  <Box><Typography variant="h4" fontWeight="bold">{seguidores}M</Typography><Typography variant="caption" sx={{ opacity: 0.8 }}>Seguidores</Typography></Box>
                </Box>
                <Box display="flex" alignItems="center" gap={1} textAlign="center">
                  <TrendingUp sx={{ fontSize: 24, color: "#4caf50" }} />
                  <Box><Typography variant="h4" fontWeight="bold" color="#4caf50">{engajamento}%</Typography><Typography variant="caption" sx={{ opacity: 0.8 }}>Média de Conversão</Typography></Box>
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* MENU TABS */}
         <Box 
          display="flex" justifyContent="center" gap={2} my={2}
          sx={{ backgroundColor: "rgba(255,255,255,0.05)", borderRadius: "20px", p:1 , backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.1)" }}
        >
          {tabs.map((tab) => {
            const IconComponent = tab.icon;
            return (
              <Button
                key={tab.name} startIcon={<IconComponent />} onClick={() => setActiveTab(tab.name)}
                sx={{ color: activeTab === tab.name ? "#ffffffff" : "rgba(255,255,255,0.7)", fontWeight: activeTab === tab.name ? "bold" : "normal", fontSize: "14px", textTransform: "none", backgroundColor: activeTab === tab.name ? "rgba(58, 0, 151, 0.1)" : "transparent", borderRadius: "15px", px: 3, py: 1.5, transition: "all 0.3s ease", border: activeTab === tab.name ? "1px solid rgba(255, 255, 255, 0.3)" : "1px solid transparent", "&:hover": { backgroundColor: activeTab === tab.name ? "rgba(255, 0, 166, 0.15)" : "rgba(255,255,255,0.05)", color: activeTab === tab.name ? "#dfdbfaff" : "white", }, }}
              >
                {tab.name}
              </Button>
            );
          })}
        </Box>

        {/* CONTEÚDO DAS ABAS */}
        <Box mb={4}>
            {/* 4. ANIMAÇÃO DAS TRANSIÇÕES DE ABAS */}
            <AnimatePresence mode="wait">
              {renderTabContent()}
            </AnimatePresence>
        </Box>
      </Box>

        {/* DIÁLOGO DE CONTRATAÇÃO */}
        <Dialog
            open={openHireDialog} onClose={handleCloseHireDialog}
            aria-labelledby="hire-dialog-title" aria-describedby="hire-dialog-description"
            sx={{ "& .MuiPaper-root": { backgroundColor: "rgba(225, 225, 225, 0.33)", color: "#FFFFFF", backdropFilter: "blur(10px)", borderRadius: '20px', border: '1px solid rgba(255, 255, 255, 0.2)' } }}
        >
            <DialogTitle id="hire-dialog-title" sx={{ fontWeight: 'bold' }}>{"Convidar Influenciador"}</DialogTitle>
            <DialogContent>
                <DialogContentText id="hire-dialog-description" sx={{ color: "rgba(255, 255, 255, 0.8)" }}>
                    Selecione a campanha para a qual você deseja convidar <strong>{influencer.nome}</strong>.
                </DialogContentText>
                {dialogLoading ? (
            <Box display="flex" justifyContent="center" alignItems="center" height={80}>
                <CircularProgress color="inherit" />
            </Box>
        ) : (
            <FormControl fullWidth variant="filled" sx={{ mt: 3, /* ...outros sx */ }}>
                <InputLabel id="campaign-select-label">Campanha</InputLabel>
                <Select
                    labelId="campaign-select-label"
                    id="campaign-select"
                    value={selectedCampaign}
                    onChange={(e) => setSelectedCampaign(e.target.value)}
                    label="Campanha"
                    sx={{ color: 'white' }}
                >
                    {userCampaigns.length > 0 ? (
                        userCampaigns.map((campaign) => (
                            // Agora o value é o ID da campanha
                            <MenuItem key={campaign._id} value={campaign._id}> 
                                {campaign.title}
                            </MenuItem>
                        ))
                    ) : (
                        <MenuItem disabled>Nenhuma campanha criada por você foi encontrada.</MenuItem>
                    )}
                </Select>
            </FormControl>
        )}
            </DialogContent>
            <DialogActions sx={{ p: '0 24px 16px' }}>
                <Button onClick={handleCloseHireDialog} sx={{ color: "rgba(255, 255, 255, 0.7)", textTransform:'none', fontSize: '15px' }}>Cancelar</Button>
                <Button onClick={handleConfirmHire} sx={{ fontWeight: 'bold', color: "#d900c7ff", backgroundColor: '#ffffffff', textTransform:'none', fontSize: '15px', px: 2, borderRadius: '10px', "&:hover": { backgroundColor: '#e9e9e9ff' } }} autoFocus disabled={!selectedCampaign}>
                    Enviar Convite
                </Button>
            </DialogActions>
        </Dialog>
        
        {/* SNACKBAR DE CONFIRMAÇÃO */}
        <Snackbar
          open={showConfirmation} autoHideDuration={6000} onClose={handleCloseConfirmation} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert onClose={handleCloseConfirmation} severity="success" sx={{ width: '100%', backgroundColor: '#2e7d32', color: 'white', fontWeight: 'bold' }}>
            Convite enviado, esperando resposta do influenciador!
          </Alert>
        </Snackbar>
      </Box>
  );
};

export default InfluencerProfile;
