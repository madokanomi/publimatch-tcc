import React, { useState, useEffect, useMemo } from "react";
import {
    Box,
    Typography,
    Avatar,
    Button,
    Chip,
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
    IconButton,
    TextField,
    Tooltip, 
    Badge    
} from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import {
    Favorite,
    Visibility,
    Groups,
    Menu as MenuIcon,
    ArrowBack,
    TrendingUp,
    Star,
    YouTube as YouTubeIcon,
    Instagram as InstagramIcon,
    MusicNote as MusicNoteIcon,
    PersonOutlined,
    Business,
    BarChart,
    Campaign,
    CheckCircle,    
    ErrorOutline,   
    Verified,
    Lock // ✅ Importado para o botão bloqueado
} from "@mui/icons-material";
import StarIcon from "@mui/icons-material/Star";
import { useParams, useNavigate } from "react-router-dom";
import axios from 'axios';
import { SiTwitch } from "react-icons/si";
import { motion, AnimatePresence } from 'framer-motion';

// Importe seus componentes
import Estatisticas from "../../../components/Estatisticas.jsx";
import CampanhasInfluSpec from "../../../components/CampanhasInfluEspc.jsx";
import AvaliacoesEspc from "../../../components/AvaliacoesEspc.jsx";
import TiptapContent from "../../../components/TiptapContent.jsx";

// Função utilitária para formatar números (K, M)
const fmt = (v) => {
    if (v === null || v === undefined || v === "") return "—";
    const num = Number(v);
    if (isNaN(num)) return v;
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
    return `${num}`;
};

// -------------------------------------------------------------
// COMPONENTE ATUALIZADO: SocialIconWithStatus
// -------------------------------------------------------------
const SocialIconWithStatus = ({ platform, url, handle, isVerified, icon: Icon, onConnect, onRequestDisconnect, isOwner }) => {
    // Se não tem URL e não é dono, não mostra nada
    if (!url && !isOwner) return null;

    const handleClick = (e) => {
        // Se estiver verificado e tiver URL, abre o perfil
        if (isVerified && url) {
            window.open(url, '_blank');
        } 
        // Se não verificado e for dono, inicia conexão
        else if (!isVerified && isOwner) {
            onConnect(platform);
        }
    };

    const handleDeleteClick = (e) => {
        e.stopPropagation(); // Impede que o clique propague e abra o link/conectar
        if (isOwner) {
            onRequestDisconnect(platform); // Abre o diálogo de confirmação no pai
        }
    };

    const iconColorUnverified = isOwner ? "#ffcc80" : "rgba(255,255,255,0.5)";
    const iconColorVerified = "black";

    // --- VISUAL VERIFICADO (Pílula com Nome da Conta + Botão Remover) ---
    if (isVerified) {
        return (
            <Tooltip title={isOwner ? "Conta Conectada (Clique para ver)" : `Ir para ${handle || "perfil"}`}>
                <Box
                    component={motion.div}
                    initial="idle"
                    whileHover="hover"
                    onClick={handleClick}
                    layout
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        pl: 0.5,
                        pr: isOwner ? 1 : 2, // Espaço extra na direita se não tiver botão de fechar
                        py: 0.5,
                        borderRadius: "20px",
                        backgroundColor: "rgba(0, 212, 255, 0.1)",
                        border: "1px solid rgba(0, 212, 255, 0.3)",
                        cursor: "pointer",
                        overflow: "hidden",
                        position: "relative",
                        transition: "all 0.3s ease",
                        "&:hover": {
                             backgroundColor: "rgba(0, 212, 255, 0.2)",
                             boxShadow: "0 0 10px rgba(0, 212, 255, 0.2)"
                        }
                    }}
                >
                    {/* Ícone da Rede */}
                    <Box sx={{ width: 28, height: 28, borderRadius: "50%", backgroundColor: "#00d4ff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                       <Icon 
                            size={16} 
                            style={{ color: iconColorVerified }} 
                            sx={{ fontSize: 16, color: iconColorVerified }} 
                        />
                    </Box>

                    {/* Texto: Nome da Conta / Handle */}
                    <Typography variant="body2" fontWeight="bold" color="#00d4ff" sx={{ fontSize: '13px', whiteSpace: "nowrap", maxWidth: "150px", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {handle || "Conta Verificada"} 
                    </Typography>

                    <Verified sx={{ fontSize: 16, color: "#00d4ff" }} />

                    {/* BOTÃO DE REMOVER (Apenas para o Dono) */}
                    {isOwner && (
                        <Box
                            component={motion.div}
                            variants={{
                                idle: { width: 0, opacity: 0, marginLeft: 0 },
                                hover: { width: "auto", opacity: 1, marginLeft: 8 }
                            }}
                            transition={{ duration: 0.2 }}
                            sx={{ display: "flex", alignItems: "center" }}
                        >
                            <Box
                                component="span"
                                onClick={handleDeleteClick}
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    width: 20,
                                    height: 20,
                                    borderRadius: "50%",
                                    backgroundColor: "rgba(255,255,255,0.2)",
                                    color: "white",
                                    "&:hover": { backgroundColor: "#ff1744", transform: "scale(1.1)" },
                                    transition: "0.2s"
                                }}
                            >
                                <CloseIcon sx={{ fontSize: 12 }} />
                            </Box>
                        </Box>
                    )}
                </Box>
            </Tooltip>
        );
    }

    // --- VISUAL NÃO VERIFICADO (Botão Redondo para Conectar) ---
return (
        <Tooltip title={isOwner ? `Conectar ${platform}` : "Não verificado"}>
            <Box 
                onClick={handleClick}
                sx={{ 
                    position: "relative", // ✅ ADICIONADO: Isso segura o ícone absolute dentro do botão
                    cursor: isOwner ? "pointer" : "default", 
                    width: 36, 
                    height: 36, 
                    borderRadius: "50%", 
                    backgroundColor: "rgba(255,255,255,0.1)", 
                    border: isOwner ? "1px dashed rgba(255,152,0,0.7)" : "1px solid rgba(255,255,255,0.2)",
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "center", 
                    transition: "all 0.3s",
                    "&:hover": isOwner ? { backgroundColor: "rgba(255,152,0,0.15)", borderColor: "#ff9800" } : {}
                }}
            >
               <Icon 
                    size={18}
                    style={{ color: iconColorUnverified }} 
                    sx={{ fontSize: 18, color: iconColorUnverified }} 
                />
                {isOwner && (
                    <ErrorOutline sx={{ 
                        fontSize: 14, 
                        color: "#ff9800", 
                        position: "absolute", 
                        bottom: -2, 
                        right: -2, 
                        backgroundColor: "black", // Fundo preto para destacar
                        borderRadius: "50%",
                        border: "1px solid rgba(0,0,0,0.5)" // Borda opcional para acabamento
                    }} />
                )}
            </Box>
        </Tooltip>
    );
};

const Sobrespec = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [influencer, setInfluencer] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [reviewsLoading, setReviewsLoading] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const [activeTab, setActiveTab] = useState("Sobre");

    // Estados dos Dialogs e Ações
    const [openHireDialog, setOpenHireDialog] = useState(false);
    const [selectedCampaign, setSelectedCampaign] = useState("");
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [openSections, setOpenSections] = useState({ convites: true, participando: true, historico: true });
    const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false);
    const [dialogContent, setDialogContent] = useState({ title: "", text: "", onConfirm: () => {} });
    const [acceptFollowUpOpen, setAcceptFollowUpOpen] = useState(false);
    const [openFinalizeDialog, setOpenFinalizeDialog] = useState(false);
    const [password, setPassword] = useState("");
    const [showFinalizeSuccess, setShowFinalizeSuccess] = useState(false);

    // Identificação do Usuário Logado
    const [currentUser, setCurrentUser] = useState(null);

    const [disconnectDialog, setDisconnectDialog] = useState({ open: false, platform: null });
    const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
    const [isDisconnecting, setIsDisconnecting] = useState(false);

   const handleRequestDisconnect = (platform) => {
        setDisconnectDialog({ open: true, platform });
    };

    const handleCloseDisconnectDialog = () => {
        setDisconnectDialog({ open: false, platform: null });
    };

    const confirmDisconnect = async () => {
        const platform = disconnectDialog.platform;
        if (!platform) return;

        setIsDisconnecting(true);
        try {
            const userInfo = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user'));
            const token = userInfo?.token;
            const config = { headers: { Authorization: `Bearer ${token}` } };

            // Chama o backend para limpar os dados
            await axios.delete(`http://localhost:5001/api/influencers/${id}/social/${platform}`, config);

            // ATUALIZAÇÃO DO ESTADO LOCAL (Para refletir na UI sem reload)
            setInfluencer(prev => ({
                ...prev,
                isVerified: false, // Atualiza verificação geral (simplificado)
                socialVerification: {
                    ...prev.socialVerification,
                    [platform]: false // Remove o check de verificado
                },
                socialHandles: {
                    ...prev.socialHandles,
                    [platform]: "" // Remove o nome da conta
                },
                social: {
                    ...prev.social,
                    [platform]: "" // Remove o link
                },
                // Zera as estatísticas daquela plataforma visualmente
                [`${platform}Stats`]: {} 
            }));

            setSnackbar({ open: true, message: `Conta ${platform} desconectada com sucesso!`, severity: "success" });
        } catch (error) {
            console.error("Erro ao desconectar:", error);
            setSnackbar({ open: true, message: "Erro ao desconectar conta.", severity: "error" });
        } finally {
            setIsDisconnecting(false);
            handleCloseDisconnectDialog();
        }
    };

    const handleDisconnectAccount = async (platform) => {
        try {
            const userInfo = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user'));
            const token = userInfo?.token;
            const config = { headers: { Authorization: `Bearer ${token}` } };

            // Chama a API para limpar os dados
            await axios.delete(`http://localhost:5001/api/influencers/${id}/social/${platform}`, config);

            // Atualiza o estado local para remover o ícone azul imediatamente sem recarregar a página
            setInfluencer(prev => ({
                ...prev,
                socialVerification: {
                    ...prev.socialVerification,
                    [platform]: false
                },
                socialHandles: {
                    ...prev.socialHandles,
                    [platform]: ""
                },
                social: {
                    ...prev.social,
                    [platform]: "" // Limpa o link também (opcional)
                },
                // Atualiza o status geral se necessário (lógica simples de frontend)
                // Para ser perfeito, ideal é usar o objeto retornado do backend:
                // ...response.data.influencer
            }));
            
            // Recarrega os dados completos do backend para garantir sincronia do isVerified global
            // const { data } = await axios.get(...) // Se quiser ser 100% preciso, ou use window.location.reload()
            
        } catch (error) {
            console.error("Erro ao desconectar:", error);
            alert("Erro ao desconectar conta. Tente novamente.");
        }
    };

    useEffect(() => {
        const queryParams = new URLSearchParams(window.location.search);
        const status = queryParams.get('status');
        const platform = queryParams.get('platform');

        if (status === 'success' && platform) {
            // Limpa a URL para ficar bonita
            window.history.replaceState({}, document.title, window.location.pathname);
            
            // Exibe mensagem de sucesso
            setShowFinalizeSuccess(true); 
            // Força reload para garantir que o ícone azul apareça
            window.location.reload(); 
        }
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Tenta pegar do localStorage OU do sessionStorage
                const userInfoString = localStorage.getItem('user') || sessionStorage.getItem('user');
                if (!userInfoString) throw new Error('Utilizador não autenticado.');
                
                const userInfo = JSON.parse(userInfoString);
                setCurrentUser(userInfo); // Salva o usuário atual
                const token = userInfo?.token;
                
                if (!token) throw new Error('Token inválido.');
                
                const config = { headers: { Authorization: `Bearer ${token}` } };
                
                const [influencerResponse, reviewsResponse] = await Promise.all([
                    axios.get(`http://localhost:5001/api/influencers/${id}`, config),
                    axios.get(`http://localhost:5001/api/reviews/influencer/${id}`, config)
                ]);
                
                setInfluencer(influencerResponse.data);
                
                if (Array.isArray(reviewsResponse.data)) {
                    setReviews(reviewsResponse.data);
                } else {
                    console.warn("API de reviews não retornou um array:", reviewsResponse.data);
                    setReviews([]); 
                }

            } catch (err) {
                console.error("Erro no carregamento:", err);
                setError(err.response?.data?.message || 'Erro ao carregar dados.');
            } finally {
                setIsLoading(false);
                setReviewsLoading(false);
            }
        };

        if (id) {
            fetchData();
        } else {
            setError("ID do influenciador não fornecido.");
            setIsLoading(false);
        }
    }, [id]);

    const { averageRating, totalReviews } = useMemo(() => {
        if (!Array.isArray(reviews) || reviews.length === 0) {
            return { averageRating: 0, totalReviews: 0 };
        }
        
        try {
            const totalRating = reviews.reduce((acc, review) => acc + (Number(review.rating) || 0), 0);
            const avg = totalRating / reviews.length;
            return { averageRating: avg, totalReviews: reviews.length };
        } catch (e) {
            console.error("Erro ao calcular avaliações:", e);
            return { averageRating: 0, totalReviews: 0 };
        }
    }, [reviews]);


    if (isLoading) return <Box display="flex" justifyContent="center" alignItems="center" height="50vh"><CircularProgress /></Box>;
    if (error) return <Box display="flex" justifyContent="center" alignItems="center" height="50vh"><Typography color="error">{error}</Typography></Box>;
    if (!influencer) return <Box p={5}><Typography>Influenciador não encontrado.</Typography></Box>;

    
    // --- MANIPULADORES ---
    const handleToggleSection = (section) => setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
    const handleOpenHireDialog = () => setOpenHireDialog(true);
    const handleCloseHireDialog = () => { setOpenHireDialog(false); setSelectedCampaign(""); };
    const handleConfirmHire = () => { handleCloseHireDialog(); setShowConfirmation(true); };
    const handleCloseConfirmation = (event, reason) => { if (reason === "clickaway") return; setShowConfirmation(false); };
    const handleCloseDialogs = () => { setConfirmationDialogOpen(false); setAcceptFollowUpOpen(false); };
    const handleConfirmReject = () => { handleCloseDialogs(); };
    const handleConfirmAccept = () => { handleCloseDialogs(); setAcceptFollowUpOpen(true); };
    
    const handleRejectClick = () => {
        setDialogContent({ title: "Rejeitar Convite", text: "Certeza que deseja rejeitar essa campanha?", onConfirm: handleConfirmReject });
        setConfirmationDialogOpen(true);
    };

    const handleAcceptClick = () => {
        setDialogContent({ title: "Aceitar Convite", text: "Certeza que deseja participar dessa campanha?", onConfirm: handleConfirmAccept });
        setConfirmationDialogOpen(true);
    };

    const handleOpenFinalizeDialog = () => setOpenFinalizeDialog(true);
    const handleCloseFinalizeDialog = () => { setOpenFinalizeDialog(false); setPassword(""); };
    const handleConfirmFinalize = () => { handleCloseFinalizeDialog(); setShowFinalizeSuccess(true); };

    // --- NOVA LÓGICA DE CONEXÃO ---
    // Verifica se é o dono (compara ID da conta de usuário ou do agente)
    const isOwner = currentUser && (
        (influencer.userAccount && influencer.userAccount === currentUser._id) || 
        (influencer.agent && influencer.agent._id === currentUser._id)
    );

   const handleConnectAccount = (platform) => {
        if (!isOwner) return;
        
        // Mapeia o nome da plataforma para a rota correta
        let route = platform;
        if (platform === 'youtube') route = 'google';
        if (platform === 'instagram') route = 'facebook'; // Usamos Facebook Login para verificar Instagram

        // Redireciona a janela atual para o backend, passando o ID do influenciador
        // O backend vai cuidar de mandar para o Google/Meta/Twitch
        window.location.href = `http://localhost:5001/api/auth/${route}?influencerId=${id}`;
    };

    
    const availableCampaigns = [
        { id: 1, name: "Campanha Lançamento iPhone 17" },
        { id: 2, name: "Campanha Antigos 2" },
    ];

    const tabContentVariant = {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
        exit: { opacity: 0, y: -10, transition: { duration: 0.2, ease: "easeIn" } }
    };

    const renderAboutMeContent = () => {
        if (!influencer.aboutMe) {
            return (
                <Typography variant="body1" lineHeight={1.8} fontSize="16px" color="white">
                    {influencer.description || 'Informação não disponível'}
                </Typography>
            );
        }
        try {
            const isJson = typeof influencer.aboutMe === 'string' && (influencer.aboutMe.startsWith('{') || influencer.aboutMe.startsWith('['));
            const content = isJson ? JSON.parse(influencer.aboutMe) : influencer.aboutMe;
            if (typeof content === 'object') {
                 return <TiptapContent content={content} />;
            }
            return (
                <Typography variant="body1" lineHeight={1.8} fontSize="16px" color="white">
                    {content}
                </Typography>
            );
        } catch (e) {
            return (
                <Typography variant="body1" lineHeight={1.8} fontSize="16px" color="white">
                    {influencer.aboutMe}
                </Typography>
            );
        }
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case "Sobre":
                return (
                    <Box component={motion.div} key="sobre" variants={tabContentVariant} initial="hidden" animate="visible" exit="exit" display="flex" gap={4} pl={5} pr={5} sx={{ backgroundColor: "rgba(27, 27, 27, 0.26)", borderRadius: "20px", p: 3, backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.1)" }}>
                        <Box flex={2}>
                            <Typography variant="h4" fontWeight="bold" mb={3} color="white">Sobre Mim</Typography>
                            {renderAboutMeContent()}
                        </Box>
                    </Box>
                );
            case "Avaliações":
                return (
                    <motion.div key="avaliacoes" variants={tabContentVariant} initial="hidden" animate="visible" exit="exit">
                        <AvaliacoesEspc reviews={reviews} isLoading={reviewsLoading} />
                    </motion.div>
                );
            case "Campanhas":
                return (
                    <motion.div key="campanhas" variants={tabContentVariant} initial="hidden" animate="visible" exit="exit">
                        <CampanhasInfluSpec openSections={openSections} handleToggleSection={handleToggleSection} handleRejectClick={handleRejectClick} handleAcceptClick={handleAcceptClick} handleOpenFinalizeDialog={handleOpenFinalizeDialog} />
                    </motion.div>
                );
            case "Estatísticas":
                return (
                    <motion.div key="estatisticas" variants={tabContentVariant} initial="hidden" animate="visible" exit="exit">
                        <Estatisticas 
                             youtubeData={influencer.youtubeStats || {}} 
                            instagramData={influencer.instagramStats || {}} 
                            twitchData={influencer.twitchStats || {}}
                            tiktokData={influencer.tiktokStats || {}}
                            socialLinks={influencer.social || {}}
                        />
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
        niches: categorias = [],
        profileImageUrl: imagem = '',
        backgroundImageUrl: imagemFundo = '',
        social = {},
        socialHandles = {},
        socialVerification = {}, // Dados de verificação do backend
        isVerified = false       // Status geral de verificado
    } = influencer;

    const avaliacao = averageRating || 0;
    const numReviews = totalReviews || 0;
    const views = influencer.viewsCount || 0; 
    const likes = influencer.likes || 0;

    
    return (
        <Box pr={3} pl={3}>
            <Box mb={1}>
                <Button startIcon={<MenuIcon sx={{ mr: 1 }} />} onClick={() => navigate(-1)} sx={{ backgroundColor: "rgba(22, 0, 61, 0.38)", color: "white", px: 2, py: 1, borderRadius: "20px", backdropFilter: "blur(10px)", textTransform: "none", fontSize: "15px", fontWeight: "500", "&:hover": { backgroundColor: "rgba(0, 0, 0, 0.23)" } }}>
                    <ArrowBack sx={{ width: "10%", mr: 1 }} />
                    <Typography variant="overline" fontWeight={700} sx={{ letterSpacing: 1.4, opacity: 0.8 }}>Influenciador</Typography>
                </Button>
            </Box>

            <Box height="calc(100vh - 120px)" overflow="auto" transition="all 0.3s ease-in-out" pb={10} sx={{ transition: "all 0.3s ease-in-out", willChange: "width", "&::-webkit-scrollbar": { width: "10px", marginRight: "10px" }, "&::-webkit-scrollbar-track": { background: "rgba(255, 255, 255, 0.1)", borderRadius: "10px" }, "&::-webkit-scrollbar-thumb": { background: "rgba(255, 255, 255, 0.3)", borderRadius: "10px" }, "&::-webkit-scrollbar-thumb:hover": { background: "rgba(255, 255, 255, 0.6)" } }}>
                
                <Box sx={{ position: "relative", borderRadius: 3, background: `linear-gradient(135deg, rgba(67, 4, 66, 0.7) 0%, rgba(34, 1, 58, 0.85) 50%, rgba(42, 1, 35, 0.68) 100%), url(${imagemFundo})`, backgroundSize: "cover", backgroundPosition: "center", backdropFilter: "blur(20px)", overflow: "hidden" }}>
                    
                    <Box sx={{ position: "absolute", top: 16, right: 16, display: "flex", alignItems: "center", backgroundColor: "rgba(255, 255, 255, 0.95)", borderRadius: "20px", px: 2, py: 0.5, backdropFilter: "blur(5px)", boxShadow: "0 2px 10px rgba(0,0,0,0.1)" }}>
                        <Business sx={{ fontSize: 16, color: "#6a1b9a", mr: 1 }} />
                        <Typography variant="caption" sx={{ color: "#6a1b9a" }}>
                            Agenciado por <Typography component="span" variant="caption" fontWeight="bold">{influencer?.agent?.name || '—'}</Typography>
                        </Typography>
                    </Box>

                    <Box p={4}>
                        <Box display="flex" alignItems="flex-start" justifyContent="space-between">
                            <Box display="flex" gap={2} flex={1}>
                                <Avatar src={imagem} sx={{ width: 120, height: 120, border: "4px solid white" }} />
                                <Box>
                                    <Typography variant="body2" sx={{ fontStyle: "italic", opacity: 0.9, mb: 0.2, fontSize: "14px" }}>"{descricao}"</Typography>
                                    
                                    {/* NOME + VERIFICADO */}
                                    <Box display="flex" alignItems="center" gap={1}>
                                        <Typography variant="h3" fontWeight="bold" mb={0}>{nome}</Typography>
                                        {isVerified && (
                                            <Tooltip title="Influenciador Verificado">
                                                <Verified sx={{ color: "#00d4ff", fontSize: 24, mt: 1 }} />
                                            </Tooltip>
                                        )}
                                    </Box>

                                    <Typography variant="h6" mb={0.5} sx={{ opacity: 0.9 }}><PersonOutlined sx={{ paddingTop: "5px" }} /> {nomeReal}, {idade} anos</Typography>
                                    
                                    <Box display="flex" alignItems="center" gap={0.5} mb={1}>
                                        {[...Array(5)].map((_, i) => (
                                            <StarIcon key={i} sx={{ color: i < Math.floor(avaliacao) ? "gold" : "gray", fontSize: 20 }} />
                                        ))}
                                        <Typography fontWeight="bold">{avaliacao.toFixed(1)}</Typography>
                                        <Typography variant="body2" ml={1} sx={{ opacity: 0.7 }}>({numReviews} avaliações)</Typography>
                                    </Box>

                                    <Box display="flex" gap={1} mb={1.5}>
                                        {categorias.map((cat, i) => (
                                            <Chip key={i} label={cat} size="small" sx={{ bgcolor: "rgba(255,255,255,0.2)", color: "white", fontWeight: "bold", backdropFilter: "blur(10px)" }} />
                                        ))}
                                    </Box>

                                    {/* ÍCONES SOCIAIS COM STATUS DE VERIFICAÇÃO */}
                                    {/* LISTA DE REDES SOCIAIS */}
                            <Box display="flex" flexWrap="wrap" gap={1.5} mt={1}>
                                        <SocialIconWithStatus 
                                            platform="youtube"
                                            url={social?.youtube}
                                            handle={socialHandles?.youtube} // ✅ Passando o nome do canal
                                            isVerified={socialVerification?.youtube}
                                            icon={YouTubeIcon}
                                            onConnect={handleConnectAccount}
                                            onRequestDisconnect={handleRequestDisconnect} // ✅ Passando a função correta
                                            isOwner={isOwner}
                                        />
                                        <SocialIconWithStatus 
                                            platform="instagram"
                                            url={social?.instagram}
                                            handle={socialHandles?.instagram} // ✅ Passando o @usuario
                                            isVerified={socialVerification?.instagram}
                                            icon={InstagramIcon}
                                            onConnect={handleConnectAccount}
                                            onRequestDisconnect={handleRequestDisconnect}
                                            isOwner={isOwner}
                                        />
                                        <SocialIconWithStatus 
                                            platform="twitch"
                                            url={social?.twitch}
                                            handle={socialHandles?.twitch} // ✅ Passando o nome do canal
                                            isVerified={socialVerification?.twitch}
                                            icon={SiTwitch}
                                            onConnect={handleConnectAccount}
                                            onRequestDisconnect={handleRequestDisconnect}
                                            isOwner={isOwner}
                                        />
                                        <SocialIconWithStatus 
                                            platform="tiktok"
                                            url={social?.tiktok}
                                            handle={socialHandles?.tiktok} // ✅ Passando o @usuario
                                            isVerified={socialVerification?.tiktok}
                                            icon={MusicNoteIcon}
                                            onConnect={handleConnectAccount}
                                            onRequestDisconnect={handleRequestDisconnect}
                                            isOwner={isOwner}
                                        />
                                    </Box>

                                    {/* ALERTA SE NÃO VERIFICADO (VISÍVEL APENAS PARA O DONO) */}
                                    {!isVerified && isOwner && (
                                        <Box mt={2} p={1} bgcolor="rgba(255, 152, 0, 0.15)" borderRadius="10px" border="1px solid rgba(255, 152, 0, 0.3)" maxWidth="400px">
                                            <Typography variant="caption" color="#ffcc80" display="flex" alignItems="center">
                                                <ErrorOutline sx={{ fontSize: 16, mr: 1 }} />
                                                Perfil não verificado. Conecte suas contas acima para validar suas estatísticas.
                                            </Typography>
                                        </Box>
                                    )}

                                </Box>
                            </Box>

                            <Box display="flex" flexDirection="column" gap={3} mt={3} alignItems="center" sx={{ minWidth: "300px" }}>
                                <Box display="flex" alignItems="center" gap={1} textAlign="center">
                                    <Favorite sx={{ fontSize: 24, color: "#ff1493" }} />
                                    <Box>
                                        <Typography variant="h4" fontWeight="bold">{fmt(likes)}</Typography>
                                        <Typography variant="caption" sx={{ opacity: 0.8 }}>Curtidas</Typography>
                                    </Box>
                                </Box>
                                <Box display="flex" alignItems="center" gap={1} textAlign="center">
                                    <Visibility sx={{ fontSize: 24, color: "#2196f3" }} />
                                    <Box>
                                        <Typography variant="h4" fontWeight="bold">{fmt(views)}</Typography>
                                        <Typography variant="caption" sx={{ opacity: 0.8 }}>Visualizações</Typography>
                                    </Box>
                                </Box>
                                <Box display="flex" alignItems="center" gap={1} textAlign="center">
                                    <Groups sx={{ fontSize: 24, color: "#9c27b0" }} />
                                    <Box>
                                        <Typography variant="h4" fontWeight="bold">{fmt(inscritos)}</Typography>
                                        <Typography variant="caption" sx={{ opacity: 0.8 }}>Seguidores</Typography>
                                    </Box>
                                </Box>
                                <Box display="flex" alignItems="center" gap={1} textAlign="center">
                                    <TrendingUp sx={{ fontSize: 24, color: "#4caf50" }} />
                                    <Box>
                                        <Typography variant="h4" fontWeight="bold" color="#4caf50">{typeof engajamento === 'number' ? engajamento.toFixed(1) : engajamento}%</Typography>
                                        <Typography variant="caption" sx={{ opacity: 0.8 }}>Engajamento</Typography>
                                    </Box>
                                </Box>
                            </Box>
                        </Box>
                    </Box>
                </Box>

                <Box display="flex" justifyContent="center" gap={2} my={2} sx={{ backgroundColor: "rgba(255,255,255,0.05)", borderRadius: "20px", p: 1, backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.1)" }}>
                    {[{ name: "Sobre", icon: PersonOutlined }, { name: "Avaliações", icon: Star }, { name: "Campanhas", icon: Campaign }, { name: "Estatísticas", icon: BarChart }].map((tab) => {
                        const IconComponent = tab.icon;
                        return (
                            <Button key={tab.name} startIcon={<IconComponent />} onClick={() => setActiveTab(tab.name)} sx={{ color: activeTab === tab.name ? "#ffffffff" : "rgba(255,255,255,0.7)", fontWeight: activeTab === tab.name ? "bold" : "normal", fontSize: "14px", textTransform: "none", backgroundColor: activeTab === tab.name ? "rgba(58, 0, 151, 0.1)" : "transparent", borderRadius: "15px", px: 3, py: 1.5, transition: "all 0.3s ease", border: activeTab === tab.name ? "1px solid rgba(255, 255, 255, 0.3)" : "1px solid transparent", "&:hover": { backgroundColor: activeTab === tab.name ? "rgba(255, 0, 166, 0.15)" : "rgba(255,255,255,0.05)", color: activeTab === tab.name ? "#dfdbfaff" : "white" } }}>
                                {tab.name}
                            </Button>
                        );
                    })}
                </Box>
                <Box mb={4}>{renderTabContent()}</Box>
            </Box>


            <Dialog 
                open={disconnectDialog.open} 
                onClose={handleCloseDisconnectDialog}
                PaperProps={{ 
                    sx: { 
                        backgroundColor: "rgba(255, 255, 255, 0.9)", 
                        color: "#610069ff", 
                        backdropFilter: "blur(10px)", 
                        borderRadius: '20px', 
                        position: 'relative',
                        minWidth: '300px'
                    } 
                }}
            >
                <IconButton onClick={handleCloseDisconnectDialog} sx={{ position: "absolute", top: 8, right: 8, color: "#610069ff" }}>
                    <CloseIcon />
                </IconButton>
                
                <DialogTitle sx={{ fontWeight: 'bold' }}>Desconectar Conta</DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{ color: "#2a2a2aff" }}>
                        Você tem certeza que deseja desconectar a conta do <strong>{disconnectDialog.platform}</strong>? 
                        <br/>
                        Isso removerá o selo de verificação e o link oficial.
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ pb: 3, px: 3 }}>
                    <Button 
                        onClick={handleCloseDisconnectDialog} 
                        sx={{ color: "#610069ff", fontWeight: "bold" }}
                    >
                        Cancelar
                    </Button>
                    <Button 
                        onClick={confirmDisconnect} 
                        variant="contained" 
                        disabled={isDisconnecting}
                        sx={{ 
                            backgroundColor: "#d50000", 
                            color: "white", 
                            fontWeight: "bold",
                            borderRadius: "10px",
                            "&:hover": { backgroundColor: "#b71c1c" } 
                        }}
                    >
                        {isDisconnecting ? <CircularProgress size={24} color="inherit" /> : "Sim, Desconectar"}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* --- SNACKBAR DE SUCESSO/ERRO (NOVO) --- */}
            <Snackbar 
                open={snackbar.open} 
                autoHideDuration={4000} 
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            >
                <Alert 
                    onClose={() => setSnackbar({ ...snackbar, open: false })} 
                    severity={snackbar.severity} 
                    sx={{ width: '100%', fontWeight: 'bold', borderRadius: '10px', color: 'white', }}
                    variant="filled"
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>


            <Dialog open={openHireDialog} onClose={handleCloseHireDialog} sx={{ "& .MuiPaper-root": { backgroundColor: "rgba(225, 225, 225, 0.33)", color: "#FFFFFF", backdropFilter: "blur(10px)", borderRadius: "20px", border: "1px solid rgba(255, 255, 255, 0.2)" } }}>
                <DialogTitle sx={{ fontWeight: "bold" }}>Contratar Influenciador</DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{ color: "rgba(255, 255, 255, 0.8)" }}>Selecione a campanha para a qual você deseja convidar <strong>{influencer.name}</strong>.</DialogContentText>
                    <FormControl fullWidth variant="filled" sx={{ mt: 3, "& .MuiFilledInput-root": { backgroundColor: "rgba(255, 255, 255, 0.1)", borderRadius: "10px", "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.15)" } }, "& .MuiInputLabel-root": { color: "rgba(255, 255, 255, 0.7)" }, "& .MuiSelect-icon": { color: "rgba(255, 255, 255, 0.7)" } }}>
                        <InputLabel>Campanha</InputLabel>
                        <Select value={selectedCampaign} onChange={(e) => setSelectedCampaign(e.target.value)} label="Campanha" sx={{ color: "white" }}>
                            {availableCampaigns.map((c) => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions sx={{ p: "0 24px 16px" }}>
                    <Button onClick={handleCloseHireDialog} sx={{ color: "rgba(255, 255, 255, 0.7)" }}>Cancelar</Button>
                    <Button onClick={handleConfirmHire} sx={{ fontWeight: "bold", color: "#d900c7", backgroundColor: "#fff", "&:hover": { backgroundColor: "#e9e9e9" } }} disabled={!selectedCampaign}>Enviar Convite</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={confirmationDialogOpen} onClose={handleCloseDialogs} sx={{ "& .MuiPaper-root": { backgroundColor: "rgba(255, 255, 255, 0.36)", color: "#FFFFFF", backdropFilter: "blur(10px)", borderRadius: "20px", border: "1px solid rgba(255, 255, 255, 0.2)" } }}>
                <DialogTitle sx={{ fontWeight: "bold" }}>{dialogContent.title}</DialogTitle>
                <DialogContent><DialogContentText sx={{ color: "rgba(255, 255, 255, 0.8)" }}>{dialogContent.text}</DialogContentText></DialogContent>
                <DialogActions sx={{ p: "0 24px 16px" }}>
                    <Button onClick={handleCloseDialogs} sx={{ color: "rgba(255, 255, 255, 0.7)" }}>Cancelar</Button>
                    <Button onClick={dialogContent.onConfirm} autoFocus sx={{ fontWeight: "bold", color: "#d900c7", backgroundColor: "#fff", "&:hover": { backgroundColor: "#e9e9e9" } }}>Confirmar</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={acceptFollowUpOpen} onClose={handleCloseDialogs} sx={{ "& .MuiPaper-root": { backgroundColor: "rgba(255, 255, 255, 0.26)", color: "#FFFFFF", backdropFilter: "blur(20px)", borderRadius: "20px", border: "1px solid rgba(255, 255, 255, 0.2)" } }}>
                <DialogTitle sx={{ fontWeight: "bold" }}>Convite Aceito!</DialogTitle>
                <DialogContent><DialogContentText sx={{ color: "rgba(255, 255, 255, 0.8)" }}>Notificação enviada ao publicitário. Deseja enviar uma mensagem?</DialogContentText></DialogContent>
                <DialogActions sx={{ p: "0 24px 16px" }}>
                    <Button onClick={handleCloseDialogs} sx={{ color: "rgba(255, 255, 255, 0.7)" }}>Fechar</Button>
                    <Button onClick={handleCloseDialogs} autoFocus sx={{ fontWeight: "bold", color: "#d900c7", backgroundColor: "#fff", "&:hover": { backgroundColor: "#e9e9e9" } }}>Enviar Mensagem</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={openFinalizeDialog} onClose={handleCloseFinalizeDialog} sx={{ "& .MuiPaper-root": { backgroundColor: "rgba(255, 255, 255, 0.26)", color: "#FFFFFF", backdropFilter: "blur(20px)", borderRadius: "20px", border: "1px solid rgba(255, 255, 255, 0.2)" } }}>
                <DialogTitle sx={{ fontWeight: "bold" }}>Finalizar Contrato</DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{ color: "rgba(255, 255, 255, 0.8)", mb: 2 }}>Para solicitar a finalização do contrato, por favor, confirme sua senha.</DialogContentText>
                    <TextField autoFocus margin="dense" label="Senha" type="password" fullWidth variant="filled" value={password} onChange={(e) => setPassword(e.target.value)} sx={{ "& .MuiFilledInput-root": { backgroundColor: "rgba(0, 0, 0, 0.2)", borderRadius: "10px" }, "& .MuiInputLabel-root": { color: "rgba(255, 255, 255, 0.7)" }, "& .MuiFilledInput-input": { color: "white" } }} />
                </DialogContent>
                <DialogActions sx={{ p: "0 24px 16px" }}>
                    <Button onClick={handleCloseFinalizeDialog} sx={{ color: "rgba(255, 255, 255, 0.7)" }}>Cancelar</Button>
                    <Button onClick={handleConfirmFinalize} disabled={!password} sx={{ fontWeight: "bold", color: "#d900c7", backgroundColor: "#fff", "&:hover": { backgroundColor: "#e9e9e9" }, "&.Mui-disabled": { backgroundColor: "rgba(255, 255, 255, 0.5)" } }}>Solicitar Finalização</Button>
                </DialogActions>
            </Dialog>

            <Snackbar open={showConfirmation} autoHideDuration={6000} onClose={handleCloseConfirmation} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}><Alert onClose={handleCloseConfirmation} severity="success" sx={{ width: "100%", backgroundColor: "#2e7d32", color: "white", fontWeight: "bold" }}>Convite enviado!</Alert></Snackbar>
            <Snackbar open={showFinalizeSuccess} autoHideDuration={6000} onClose={() => setShowFinalizeSuccess(false)} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}><Alert onClose={() => setShowFinalizeSuccess(false)} severity="info" sx={{ width: "100%", backgroundColor: "#0288d1", color: "white", fontWeight: "bold" }}>Solicitação enviada.</Alert></Snackbar>
        </Box>
    );
};

export default Sobrespec;
