import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  Avatar,
  Chip,
  IconButton,
  Card,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  DialogContentText,
  CircularProgress
} from "@mui/material";
import {
  Favorite as FavoriteIcon,
  Visibility as VisibilityIcon,
  Groups as GroupsIcon,
  TrendingUp as TrendingUpIcon,
  Star as StarIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import Header from "../../../components/Header";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 100 },
  },
};

const fmt = (v) => {
  if (v === null || v === undefined || v === "") return "—";
  if (typeof v === "number") {
    if (v >= 1000000) return `${(v / 1000000).toFixed(1)}M`;
    if (v >= 1000) return `${(v / 1000).toFixed(1)}k`;
    return `${v}`;
  }
  return String(v);
};

// --- COMPONENTE DA LINHA (ATUALIZADO: Cor dos contratos fixa em branco) ---
const InfluencerRow = React.memo(({ inf, handleEdit, handleDeleteClick, navigate }) => {
    const [ratingStats, setRatingStats] = useState({ avg: 0, count: 0 });
    const [campaignStats, setCampaignStats] = useState({ active: 0, pending: 0 });
    const [loadingData, setLoadingData] = useState(true);

    useEffect(() => {
        let isMounted = true;
        const fetchData = async () => {
            try {
                const userInfo = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user'));
                const token = userInfo?.token;
                if (!token) return;

                const config = { headers: { Authorization: `Bearer ${token}` } };

                let reviewsPromise = Promise.resolve(null);
                if (inf.averageRating === undefined || inf.reviewsCount === undefined) {
                    reviewsPromise = axios.get(`http://localhost:5001/api/reviews/influencer/${inf._id}`, config);
                }

                const campaignsPromise = axios.get(`http://localhost:5001/api/influencers/${inf._id}/campaigns`, config);

                const [reviewsRes, campaignsRes] = await Promise.allSettled([reviewsPromise, campaignsPromise]);

                if (isMounted) {
                    if (inf.averageRating !== undefined) {
                        setRatingStats({ avg: Number(inf.averageRating), count: Number(inf.reviewsCount) });
                    } else if (reviewsRes.status === 'fulfilled' && reviewsRes.value) {
                         const data = reviewsRes.value.data;
                         if (data && data.length > 0) {
                            const totalRating = data.reduce((acc, review) => acc + review.rating, 0);
                            const avg = totalRating / data.length;
                            setRatingStats({ avg, count: data.length });
                        }
                    }

                    if (campaignsRes.status === 'fulfilled') {
                        const { participating, invites } = campaignsRes.value.data;
                        setCampaignStats({
                            active: participating ? participating.length : 0,
                            pending: invites ? invites.length : 0
                        });
                    }
                }

            } catch (error) {
                console.error("Erro ao carregar dados da linha:", error);
            } finally {
                if (isMounted) setLoadingData(false);
            }
        };

        fetchData();
        return () => { isMounted = false; };
    }, [inf]);

    const avatarImg = inf.imagem || inf.profileImageUrl || "";
    const curtidas = inf.curtidas ?? inf.likes ?? inf.inscritos ?? inf.followers ?? inf.followersCount ?? 0;
    const views = inf.views ?? inf.visualizacoes ?? inf.viewsCount ?? 0;
    const seguidores = inf.seguidores ?? inf.followers ?? inf.followersCount ?? 0;
    const mediaConversao = inf.mediaConversao ?? inf.conversao ?? inf.conversionRate ?? inf.conversaoPercent ?? 0;
    
    const avaliacao = ratingStats.avg;
    const numReviews = ratingStats.count;

    return (
      <motion.div
        variants={itemVariants}
        layout
        onClick={() => navigate(`/influenciadores/perfil/${inf._id}`)}
        style={{
          borderRadius: "8px",
          marginBottom: "8px",
          cursor: "pointer",
        }}
      >
        <Card
          sx={{
            backgroundImage: inf.backgroundImageUrl
              ? `linear-gradient(90deg, rgba(22, 7, 83, 0.8), rgba(81, 4, 61, 0.6)), url(${inf.backgroundImageUrl})`
              : "linear-gradient(90deg, rgba(30, 58, 138, 0.8), rgba(59, 130, 246, 0.6))",
            backdropFilter: "blur(8px)",
            backgroundSize: "cover",
            backgroundPosition: "center",
            borderRadius: "8px",
            mb: 1,
            cursor: "pointer",
            transition: "all 0.2s ease",
            "&:hover": {
              transform: "translateY(-1px)",
              boxShadow: "0 4px 15px rgba(251, 219, 255, 0.24)",
            },
          }}
        >
          <Box
            sx={{
              display: { xs: "flex", md: "grid" },
              flexDirection: { xs: "column", md: "row" },
              gridTemplateColumns: {
                md: "2.5fr 1fr 1fr 1.2fr 1fr 1fr 0.5fr",
                lg: "3fr 1fr 1fr 1.2fr 1fr 1fr 0.7fr",
              },
              gap: 2,
              alignItems: "center",
              p: 2,
              minHeight: "80px",
            }}
          >
            {/* Nome e Avatar */}
            <Box display="flex" alignItems="center" gap={1.5}>
              <Avatar src={avatarImg} alt={inf.name} sx={{ width: 50, height: 50, border: "2px solid rgba(255,255,255,0.2)" }} />
              <Box>
                <Typography variant="subtitle1" color="white" sx={{ fontSize: "20px" }} fontWeight={700} noWrap>
                  {inf.name}
                </Typography>
                <Typography variant="caption" sx={{ fontSize: "13px" }} color="rgba(255,255,255,0.6)" noWrap>
                  {inf.realName ?? ""}
                </Typography>
              </Box>
            </Box>

            {/* Avaliação */}
            <Box display="flex" alignItems="center" gap={0.5}>
              {loadingData ? (
                  <CircularProgress size={16} color="inherit" />
              ) : (
                  <>
                    <Box display="flex" alignItems="center">
                        {[...Array(5)].map((_, i) => (
                        <StarIcon key={i} sx={{ color: i < Math.floor(avaliacao) ? "#FFD700" : "rgba(255,255,255,0.2)", fontSize: 16 }} />
                        ))}
                    </Box>
                    <Typography variant="caption" color="rgba(255,255,255,0.6)">
                        {avaliacao.toFixed(1)} ({numReviews})
                    </Typography>
                  </>
              )}
            </Box>

            {/* Categorias */}
            <Box display="flex" flexWrap="wrap" gap={0.5}>
               {inf.niches?.slice(0, 2).map((niche, i) => (
                <Chip key={i} label={niche} size="small" sx={{ bgcolor: "rgba(255, 255, 255, 0.2)", color: "#ffffffff", fontSize: "0.7rem", height: 24, borderRadius: "6px", border: "1px solid rgba(255, 255, 255, 0.3)" }} />
              ))}
            </Box>

            {/* Engajamento */}
            <Box>
              <Box display="flex" alignItems="center" gap={0.5} mb={0.5}>
                <GroupsIcon sx={{ fontSize: 30, color: "#9c27b0" }} />
                <Typography variant="caption" fontSize='15px' color="white" fontWeight={600}>{fmt(seguidores)}</Typography>
                <VisibilityIcon sx={{ fontSize: 30, color: "#2196f3" }} />
                <Typography variant="caption" fontSize='15px' color="white" fontWeight={600}>{fmt(views)}</Typography>
              </Box>
              <Box display="flex" alignItems="center" gap={0.5}>
                <FavoriteIcon sx={{ fontSize: 30, color: "#ff1493" }} />
                <Typography variant="caption" fontSize='15px' color="white" fontWeight={600}>{fmt(curtidas)}</Typography>
                <TrendingUpIcon sx={{ fontSize: 30, color: "#4caf50" }} />
                <Typography variant="caption" fontSize='15px' color="white" fontWeight={600}>
                  {typeof mediaConversao === "number" ? `${Math.round(mediaConversao)}%` : fmt(mediaConversao)}
                </Typography>
              </Box>
            </Box>

            {/* Vinculado a campanhas */}
            <Box textAlign="center">
                {loadingData ? <CircularProgress size={20} color="inherit" /> : (
                  <Typography variant="h6" color="white" fontWeight={700} sx={{ fontSize: "1.5rem", textShadow: "0 2px 4px rgba(0,0,0,0.3)" }}>
                      {campaignStats.active}
                  </Typography>
                )}
            </Box>
            
            {/* Contratos para confirmação (AGORA SEMPRE BRANCO) */}
            <Box textAlign="center">
                {loadingData ? <CircularProgress size={20} color="inherit" /> : (
                  <Typography variant="h6" color="white" fontWeight={700} sx={{ fontSize: "1.5rem", textShadow: "0 2px 4px rgba(0,0,0,0.3)" }}>
                      {campaignStats.pending}
                  </Typography>
                )}
            </Box>
            
            {/* Ações */}
            <Box display="flex" gap={0.5} justifyContent="center">
               <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleEdit(inf._id); }} sx={{ bgcolor: "rgba(255,255,255,0.1)", color: "white", "&:hover": { bgcolor: "rgba(255,255,255,0.2)" }, width: 32, height: 32 }}>
                  <EditIcon fontSize="small" />
                </IconButton>
              <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleDeleteClick(inf); }} sx={{ bgcolor: "rgba(255,0,0,0.1)", color: "#ff6b6b", "&:hover": { bgcolor: "rgba(255,0,0,0.2)" }, width: 32, height: 32 }}><DeleteIcon fontSize="small" /></IconButton>
            </Box>
          </Box>
        </Card>
      </motion.div>
    );
});
// -------------------------------------------------------------

const Influenciadores = () => {
  const navigate = useNavigate();
  const [listaInfluenciadores, setListaInfluenciadores] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogStep, setDialogStep] = useState(1);
  const [selectedInfluencer, setSelectedInfluencer] = useState(null);
  const [userPassword, setUserPassword] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmationName, setConfirmationName] = useState("");
  const [error, setError] = useState(null);
  const [dialogError, setDialogError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false); 

  useEffect(() => {
    const fetchInfluencersData = async () => {
      try {
        const userInfo = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user'));
        const token = userInfo?.token;
        if (!token) throw new Error('Utilizador não autenticado.');
        
        const config = { headers: { Authorization: `Bearer ${token}` } };
        
        const { data: influencers } = await axios.get('http://localhost:5001/api/influencers', config);
        
        const influencersWithRatings = await Promise.all(influencers.map(async (inf) => {
            try {
                if (inf.averageRating !== undefined) return inf;
                const { data: reviews } = await axios.get(`http://localhost:5001/api/reviews/influencer/${inf._id}`, config);
                const totalRating = reviews.reduce((acc, r) => acc + r.rating, 0);
                const avg = reviews.length > 0 ? totalRating / reviews.length : 0;
                
                return { 
                    ...inf, 
                    averageRating: avg, 
                    reviewsCount: reviews.length 
                };
            } catch (err) {
                return { ...inf, averageRating: 0, reviewsCount: 0 };
            }
        }));

        setListaInfluenciadores(influencersWithRatings);
      } catch (err) {
        setError(err.response?.data?.message || 'Erro ao carregar influenciadores.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchInfluencersData();
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!selectedInfluencer) return;
    setIsDeleting(true);
    setDialogError('');
    try {
      const userInfo = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user'));
      const token = userInfo?.token;
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.delete(`http://localhost:5001/api/influencers/${selectedInfluencer._id}`, config);
      
      setListaInfluenciadores(prev => prev.filter(inf => inf._id !== selectedInfluencer._id));
      handleCloseDialog();
    } catch (err) {
      const message = err.response?.data?.message || 'Não foi possível apagar o influenciador.';
      setDialogError(message);
    } finally {
      setIsDeleting(false);
    }
  }, [selectedInfluencer]);

  const sortedInfluencers = useMemo(() => {
    if (!sortConfig.key) return listaInfluenciadores;
    
    const sorted = [...listaInfluenciadores].sort((a, b) => {
      let aVal, bVal;
      
      switch (sortConfig.key) {
        case "nome":
          aVal = (a.name || "").toLowerCase();
          bVal = (b.name || "").toLowerCase();
          break;
        case "avaliacao":
          aVal = Number(a.averageRating || 0);
          bVal = Number(b.averageRating || 0);
          break;
        case "engajamento":
          aVal = Number(a.seguidores ?? a.followersCount ?? 0);
          bVal = Number(b.seguidores ?? b.followersCount ?? 0);
          break;
        default:
          aVal = a[sortConfig.key] || 0;
          bVal = b[sortConfig.key] || 0;
      }
      
      if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [listaInfluenciadores, sortConfig]);

  const handleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key !== key) return { key, direction: "asc" };
      if (prev.direction === "asc") return { key, direction: "desc" };
      return { key: null, direction: "asc" };
    });
  };

  const handleDeleteClick = useCallback((inf) => {
    setSelectedInfluencer(inf);
    setDialogStep(1);
    setDialogOpen(true);
  }, []);

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setTimeout(() => {
        setDialogStep(1);
        setUserPassword("");
        setConfirmationName("");
        setSelectedInfluencer(null);
        setDialogError('');
    }, 300); 
  };

  const handleNextStep = async () => {
    setDialogError('');

    if (dialogStep === 1) {
      if (!userPassword) {
        setDialogError("Digite sua senha para continuar!");
        return;
      }

      setIsVerifying(true);
      try {
        const userInfo = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user'));
        const token = userInfo?.token;
        const config = { headers: { Authorization: `Bearer ${token}` } };
        
        await axios.post('http://localhost:5001/api/users/verify-password', { password: userPassword }, config);
        setDialogStep(2);

      } catch (error) {
        const message = error.response?.data?.message || "Erro ao verificar senha.";
        setDialogError(message);
      } finally {
        setIsVerifying(false);
      }
    }
    else if (dialogStep === 2) {
      if (confirmationName.trim() !== selectedInfluencer?.name) {
        setDialogError("O nome digitado não corresponde ao do influenciador!");
        return;
      }
      setDialogStep(3);
    }
  };

  const handleEdit = (id) => {
    navigate(`/influenciador/editar/${id}`);
  };

  const TableHeader = () => {
    const columns = [
      { key: "nome", label: "Nome" },
      { key: "avaliacao", label: "Avaliação" },
      { key: "categorias", label: "Categorias" },
      { key: "engajamento", label: "Engajamento" },
      { key: "campanhas", label: "Vinculado a campanhas" }, 
      { key: "contratos", label: "Contratos para confirmação" },
      { key: "acoes", label: "Ações" },
    ];

    return (
      <Box
        sx={{
          display: { xs: "none", md: "grid" },
          gridTemplateColumns: {
            md: "2.5fr 1fr 1fr 1.2fr 1fr 1fr 0.5fr",
            lg: "3fr 1fr 1fr 1.2fr 1fr 1fr 0.7fr",
          },
          gap: 2,
          alignItems: "center",
          p: 2,
          borderBottom: "1px solid rgba(255,255,255,0.1)",
          mb: 1,
        }}
      >
        {columns.map((col) => (
          <Typography
            key={col.key}
            variant="subtitle2"
            color="rgba(255,255,255,0.7)"
            fontWeight={600}
            sx={{
              cursor: (col.key !== "acoes" && col.key !== "campanhas" && col.key !== "contratos") ? "pointer" : "default",
              userSelect: "none",
            }}
            onClick={() => (col.key !== "acoes" && col.key !== "campanhas" && col.key !== "contratos") && handleSort(col.key)}
          >
            {col.label}{" "}
            {sortConfig.key === col.key
              ? sortConfig.direction === "asc"
                ? "↑"
                : "↓"
              : ""}
          </Typography>
        ))}
      </Box>
    );
  };

   if (isLoading) {
    return <Box display="flex" justifyContent="center" alignItems="center" height="50vh"><CircularProgress /></Box>;
  }

  if (error) {
    return <Box display="flex" justifyContent="center" alignItems="center" height="50vh"><Typography color="error">{error}</Typography></Box>;
  }

  return (
    <Box ml="25px" mr="25px" pb={30}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Header title="Influenciadores" subtitle="Lista completa" />
      </Box>

      <Box height="calc(100vh - 120px)" overflow="auto" sx={{ pb: "200px", "&::-webkit-scrollbar": { width: "8px" }, "&::-webkit-scrollbar-track": { background: "rgba(255,255,255,0.05)", borderRadius: "10px" }, "&::-webkit-scrollbar-thumb": { background: "rgba(255,255,255,0.15)", borderRadius: "10px", "&:hover": { background: "rgba(255,255,255,0.25)" } } }}>
        <Box>
          <Button variant="contained" color="primary" component={Link} to="/influenciador/cadastro" sx={{ mt: 0, borderRadius: "30px", transition: "all 0.2s ease-in-out", background: "#FFFFFF", boxShadow: "0px 0px 24.5px 4px rgba(255, 55, 235, 0.25)", color: "#BF28B0", fontWeight: "800", textTransform: "none", "&:hover": { borderRadius: "10px", background: "#ffffff46", color: "white", boxShadow: "none", letterSpacing: 1, fontSize: "24px" } }}>
            <Typography variant="overline" fontWeight={700} sx={{ letterSpacing: 1.4, opacity: 0.8, fontSize: "13px" }}> Cadastrar Influenciador </Typography>
          </Button>

          <TableHeader />

          <Box
            component={motion.div} 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            px={1}
          >
           {sortedInfluencers.length > 0 ? (
          sortedInfluencers.map(inf => (
            <InfluencerRow 
              key={inf._id} 
              inf={inf} 
              navigate={navigate} 
              handleEdit={handleEdit} 
              handleDeleteClick={handleDeleteClick} 
            />
          ))
        ) : (
          <Typography variant="h6" color="rgba(255,255,255,0.7)" textAlign="center" mt={5}>
            Você ainda não cadastrou nenhum influenciador.
          </Typography>
        )}
          </Box>
        </Box>
      </Box>

    <Dialog 
    open={dialogOpen} 
    onClose={handleCloseDialog} 
    PaperProps={{ 
        sx: { 
            borderRadius: "15px", 
            backgroundColor: '#ffffffbb', 
            backdropFilter:"blur(10px)",
            boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.15)',
            width: '100%',
            border: "1px solid rgba(255, 255, 255, 0.1)",
            maxWidth: '500px'
        } 
    }}
>
    {dialogStep === 1 && (
        <>
            <DialogTitle sx={{ color: '#1a1a1a', fontWeight: 'bold' }}>
                Confirme sua Identidade
            </DialogTitle>
            <DialogContent>
                <DialogContentText sx={{ color: '#555555', mb: 2 }}>
                    Para sua segurança, digite sua senha para continuar com a exclusão.
                </DialogContentText>
                <TextField 
                    autoFocus 
                    label="Sua Senha" 
                    type="password" 
                    fullWidth 
                    value={userPassword} 
                   onChange={(e) => { setUserPassword(e.target.value); setDialogError(''); }} 
                    variant="outlined"
                    error={!!dialogError}
                    helperText={dialogError}
                    
                      sx={{
                        '& .MuiOutlinedInput-input': { color: 'black' },
                        '& .MuiInputLabel-root': { color: 'rgba(0, 0, 0, 0.6)' },
                        '& .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(0, 0, 0, 0.23)' },
                        '&:hover .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline': { borderColor: 'black' },
                        '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'primary.main' },
                        '& .MuiInputLabel-root.Mui-focused': { color: 'primary.main' }
                    }}
                />
            </DialogContent>
            <DialogActions sx={{ p: '16px 24px' }}>
                <Button onClick={handleCloseDialog}>Cancelar</Button>
                    <Button onClick={handleNextStep} variant="contained" color="primary" disabled={isVerifying}>
        {isVerifying ? <CircularProgress size={24} color="inherit" /> : 'Próximo'}
      </Button>

            </DialogActions>
        </>
    )}

    {dialogStep === 2 && (
        <>
            <DialogTitle sx={{ color: '#1a1a1a', fontWeight: 'bold' }}>
                Confirmação Adicional
            </DialogTitle>
            <DialogContent>
                <DialogContentText sx={{ color: '#555555', mb: 2 }}>
                    Para confirmar que você tem ciência da exclusão, por favor, digite o nome do influenciador: <br/>
                    <Typography component="span" fontWeight="bold" color="primary.main">{selectedInfluencer?.name}</Typography>
                </DialogContentText>
                <TextField 
                    autoFocus 
                    label="Nome do Influenciador" 
                    type="text" 
                    fullWidth 
                    value={confirmationName} 
                    onChange={(e) => { setConfirmationName(e.target.value); setDialogError(''); }} 
                    variant="outlined"
                    error={!!dialogError}
                    helperText={dialogError}
                      sx={{
                        '& .MuiOutlinedInput-input': { color: 'black' },
                        '& .MuiInputLabel-root': { color: 'rgba(0, 0, 0, 0.6)' },
                        '& .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(0, 0, 0, 0.23)' },
                        '&:hover .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline': { borderColor: 'black' },
                        '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'primary.main' },
                        '& .MuiInputLabel-root.Mui-focused': { color: 'primary.main' }
                    }}
                />
            </DialogContent>
            <DialogActions sx={{ p: '16px 24px' }}>
                <Button onClick={handleCloseDialog}>Cancelar</Button>
                <Button onClick={handleNextStep} variant="contained" color="error">Confirmar</Button>
            </DialogActions>
        </>
    )}
    
    {dialogStep === 3 && (
        <>
            <DialogTitle sx={{ color: 'error.main', fontWeight: 'bold' }}>
                Atenção: Ação Irreversível
            </DialogTitle>
            <DialogContent>
                <DialogContentText sx={{ color: '#555555' }}>
                    Você confirma a exclusão permanente do perfil de <b>{selectedInfluencer?.name}</b>?
                </DialogContentText>
                 {dialogError && (
                    <Typography color="error" sx={{ mt: 2, fontWeight: 'bold' }}>
                        {dialogError}
                    </Typography>
                )}
            </DialogContent>
            <DialogActions sx={{ p: '16px 24px' }}>
                <Button onClick={handleCloseDialog}>Cancelar</Button>
                <Button onClick={confirmDelete} color="error" variant="contained" disabled={isDeleting}>
                    {isDeleting ? <CircularProgress size={24} color="inherit" /> : "Sim, Excluir Permanentemente"}
                </Button>
            </DialogActions>
        </>
    )}

    </Dialog>
    </Box>
  );
}

export default Influenciadores;