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
import { influencers } from "../../../data/mockInfluencer";
import { useNavigate, Link } from "react-router-dom";
// 1. IMPORTAR O MOTION PARA ANIMAÇÃO
import { motion } from "framer-motion";
import axios from "axios";

const MotionCard = motion(Card);
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

// ✅ MELHORIA: Centralizar função utilitária para não repetir
const fmt = (v) => {
  if (v === null || v === undefined || v === "") return "—";
  if (typeof v === "number") {
    if (v >= 1000000) return `${(v / 1000000).toFixed(1)}M`;
    if (v >= 1000) return `${(v / 1000).toFixed(1)}k`;
    return `${v}`;
  }
  return String(v);
};

const InfluencerRow = React.memo(({ inf, handleEdit, handleDeleteClick, navigate }) => {
  
    const avatarImg = inf.imagem || inf.avatar || "";
    const curtidas = inf.curtidas ?? inf.likes ?? inf.inscritos ?? inf.followers ?? inf.followersCount ?? 0;
    const views = inf.views ?? inf.visualizacoes ?? inf.viewsCount ?? 0;
    const seguidores = inf.seguidores ?? inf.followers ?? inf.followersCount ?? 0;
    const mediaConversao = inf.mediaConversao ?? inf.conversao ?? inf.conversionRate ?? inf.conversaoPercent ?? 0;
    const campanhasNum = inf.campanhasCount ?? inf.campanhas ?? inf.campaigns ?? 0;
    const contratosNum = inf.contratos ?? 0;
    const desempenhoVal = Number(inf.desempenhoPercent ?? inf.desempenho ?? inf.performance ?? inf.conversaoPercent ?? 0);
    const avaliacao = Number(inf.avaliacao ?? inf.rating ?? 0);
    const categorias = inf.categorias ?? inf.tags ?? [];
    const desempenhoColor =
      desempenhoVal >= 90 ? "#4caf50" :
      desempenhoVal >= 70 ? "#ff9800" :
      desempenhoVal >= 50 ? "#2196f3" :
      desempenhoVal >= 25 ? "#ff9800" :
      "#ff3b3b";

    return (
      // 4. USAR O MotionCard EM VEZ DO Card E PASSAR AS VARIANTES DO ITEM
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
        key={inf._id}
        variants={itemVariants}  // <-- Variante para o item
        layout // Adiciona uma animação suave se a lista for reordenada
        onClick={() => navigate(`/influenciadores/perfil/${inf._id}`)}
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
              md: "2fr 1fr 1fr 1fr 1fr 1fr 1fr 0.5fr",
              lg: "2.5fr 1fr 1fr 1fr 1fr 1fr 1fr 0.7fr",
            },
            gap: 2,
            alignItems: "center",
            p: 2,
            minHeight: "80px",
          }}
        >
          {/* Nome e Avatar */}
          <Box display="flex" alignItems="center" gap={1.5}>
            <Avatar src={inf.profileImageUrl} alt={inf.name} sx={{ width: 50, height: 50, border: "2px solid rgba(255,255,255,0.2)" }} />
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
            <Box display="flex" alignItems="center">
              {[...Array(5)].map((_, i) => (
                <StarIcon key={i} sx={{ color: i < Math.floor(avaliacao) ? "#FFD700" : "rgba(255,255,255,0.2)", fontSize: 16 }} />
              ))}
            </Box>
            <Typography variant="caption" color="rgba(255,255,255,0.6)">
              {avaliacao.toFixed(1)}({Math.floor(Math.random() * 9000) + 1000})
            </Typography>
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
          <Box textAlign="center"><Typography variant="h6" color="white" fontWeight={700} sx={{ fontSize: "1.5rem", textShadow: "0 2px 4px rgba(0,0,0,0.3)" }}>{campanhasNum}</Typography></Box>
          {/* Desempenho nas campanhas */}
          <Box textAlign="center"><Typography variant="h6" color={desempenhoColor} fontWeight={700} sx={{ fontSize: "1.5rem", textShadow: "0 2px 4px rgba(0,0,0,0.3)" }}>{Number.isFinite(desempenhoVal) ? `${Math.round(desempenhoVal)}%` : "—"}</Typography></Box>
          {/* Contratos para confirmação */}
          <Box textAlign="center"><Typography variant="h6" color="white" fontWeight={700} sx={{ fontSize: "1.5rem", textShadow: "0 2px 4px rgba(0,0,0,0.3)" }}>{contratosNum}</Typography></Box>
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
    const fetchInfluencers = async () => {
      try {
        const userInfo = JSON.parse(localStorage.getItem('user'));
        const token = userInfo?.token;
        if (!token) throw new Error('Utilizador não autenticado.');
        
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const { data } = await axios.get('http://localhost:5001/api/influencers', config);
        setListaInfluenciadores(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Erro ao carregar influenciadores.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchInfluencers();
  }, []);

  // Lógica para apagar o influenciador
   const confirmDelete = useCallback(async () => {
    if (!selectedInfluencer) return;
    setIsDeleting(true);
    setDialogError(''); // Limpa erros anteriores
    try {
      const userInfo = JSON.parse(localStorage.getItem('user'));
      const token = userInfo?.token;
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.delete(`http://localhost:5001/api/influencers/${selectedInfluencer._id}`, config);
      
      setListaInfluenciadores(prev => prev.filter(inf => inf._id !== selectedInfluencer._id));
      handleCloseDialog(); // Fecha o dialog SÓ no sucesso
    } catch (err) {
      const message = err.response?.data?.message || 'Não foi possível apagar o influenciador.';
      setDialogError(message); // Mostra o erro para o usuário
    } finally {
      setIsDeleting(false);
    }
  }, [selectedInfluencer]);

  // 2. DEFINIR AS VARIANTES DA ANIMAÇÃO
  // Variante para o container da lista (pai)

  // Variante para cada item da lista (filho)
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
      },
    },
  };

  const sortedInfluencers = useMemo(() => {
    if (!sortConfig.key) return listaInfluenciadores;
    
    const sorted = [...listaInfluenciadores].sort((a, b) => {
      let aVal, bVal;
      
      // Mapear as chaves para os campos corretos
      switch (sortConfig.key) {
        case "nome":
          aVal = a.name || "";
          bVal = b.name || "";
          break;
        case "avaliacao":
          aVal = Number(a.avaliacao ?? a.rating ?? 0);
          bVal = Number(b.avaliacao ?? b.rating ?? 0);
          break;
        case "campanhas":
          aVal = Number(a.campanhasCount ?? a.campanhas ?? a.campaigns ?? 0);
          bVal = Number(b.campanhasCount ?? b.campanhas ?? b.campaigns ?? 0);
          break;
        case "desempenho":
          aVal = Number(a.desempenhoPercent ?? a.desempenho ?? a.performance ?? a.conversaoPercent ?? 0);
          bVal = Number(b.desempenhoPercent ?? b.desempenho ?? b.performance ?? b.conversaoPercent ?? 0);
          break;
        case "contratos":
          aVal = Number(a.contratos ?? 0);
          bVal = Number(b.contratos ?? 0);
          break;
        case "engajamento":
          // Para engajamento, usar seguidores como critério principal
          aVal = Number(a.seguidores ?? a.followers ?? a.followersCount ?? 0);
          bVal = Number(b.seguidores ?? b.followers ?? b.followersCount ?? 0);
          break;
        default:
          aVal = a[sortConfig.key];
          bVal = b[sortConfig.key];
      }
      
      // Converter strings numéricas para números
      if (typeof aVal === "string" && !isNaN(Number(aVal))) aVal = Number(aVal);
      if (typeof bVal === "string" && !isNaN(Number(bVal))) bVal = Number(bVal);
      
      // Tratar valores nulos/undefined
      if (aVal == null) aVal = sortConfig.direction === "asc" ? Infinity : -Infinity;
      if (bVal == null) bVal = sortConfig.direction === "asc" ? Infinity : -Infinity;
      
      // Comparação
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
}, []); // Sem dependências, pois só usa setters de estado


const handleCloseDialog = () => {
    setDialogOpen(false);
    setTimeout(() => {
        setDialogStep(1);
        setUserPassword("");
        setConfirmationName("");
        setSelectedInfluencer(null);
        // ✅ LIMPE O ERRO AO FECHAR
        setDialogError('');
    }, 300); 
};

// ATUALIZE ESTA FUNÇÃO
const handleNextStep = async () => {
  setDialogError('');

  // --- ETAPA 1 -> 2: Validar senha no BACKEND ---
  if (dialogStep === 1) {
    if (!userPassword) {
      setDialogError("Digite sua senha para continuar!");
      return;
    }

    setIsVerifying(true); // Inicia o loading
    try {
      const userInfo = JSON.parse(localStorage.getItem('user'));
      const token = userInfo?.token;
      
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      // Chama a nova rota no backend
      await axios.post('http://localhost:5001/api/users/verify-password', { password: userPassword }, config);

      // Se a chamada for bem-sucedida (não der erro), avança
      setDialogStep(2);

    } catch (error) {
      // Se der erro, o backend retornará 401, e capturamos a mensagem aqui
      const message = error.response?.data?.message || "Erro ao verificar senha.";
      setDialogError(message);
    } finally {
      setIsVerifying(false); // Finaliza o loading
    }
  }
  // --- ETAPA 2 -> 3: Validar nome do influenciador (lógica local) ---
  else if (dialogStep === 2) {
    if (confirmationName.trim() !== selectedInfluencer?.name) {
      setDialogError("O nome digitado não corresponde ao do influenciador!");
      return;
    }
    setDialogStep(3);
  }
};

  const fmt = (v) => {
    if (v === null || v === undefined || v === "") return "—";
    if (typeof v === "string") return v;
    if (typeof v === "number") {
      if (v >= 1000000) return `${(v / 1000000).toFixed(1)}M`;
      if (v >= 1000) return `${(v / 1000).toFixed(1)}k`;
      return `${v}`;
    }
    return String(v);
  };

  const handleEdit = (id) => {
    navigate(`/influenciador/editar/${id}`);
  };

  
  
  // 3. TRANSFORMAR O COMPONENTE CARD DO MUI EM UM COMPONENTE ANIMÁVEL
  const MotionCard = motion(Card);

  const TableHeader = () => {
    const columns = [
      { key: "nome", label: "Nome" },
      { key: "avaliacao", label: "Avaliação" },
      { key: "categorias", label: "Categorias" },
      { key: "engajamento", label: "Engajamento" },
      { key: "campanhas", label: "Vinculado a campanhas" },
      { key: "desempenho", label: "Desempenho nas campanhas" },
      { key: "contratos", label: "Contratos para confirmação!" },
      { key: "acoes", label: "Ações" },
    ];

    return (
      <Box
        sx={{
          display: { xs: "none", md: "grid" },
          gridTemplateColumns: {
            md: "2fr 1fr 1fr 1fr 1fr 1fr 1fr 0.5fr",
            lg: "2.5fr 1fr 1fr 1fr 1fr 1fr 1fr 0.5fr",
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
              cursor: col.key !== "acoes" ? "pointer" : "default",
              userSelect: "none",
            }}
            onClick={() => col.key !== "acoes" && handleSort(col.key)}
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

          {/* 5. APLICAR O MOTION.DIV AO CONTAINER E PASSAR AS VARIANTES DO CONTAINER */}
          <Box
            component={motion.div} // <-- Transforma o Box em um container de animação
            variants={containerVariants} // <-- Passa as variantes do container
            initial="hidden" // <-- Estado inicial
            animate="visible" // <-- Estado final
            px={1}
          >
           {sortedInfluencers.length > 0 ? (
          // ✅ A FORMA CORRETA de renderizar uma lista de componentes
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
            backgroundColor: '#ffffffbb', // Fundo branco
            backdropFilter:"blur(10px)",
            boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.15)',
            width: '100%',
          border: "1px solid rgba(255, 255, 255, 0.1)",
            maxWidth: '500px'
        } 
    }}
>
    
    {/* --- ETAPA 1: SENHA --- */}
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
                    // Mostra o erro no próprio campo
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

    {/* --- ETAPA 2: NOME DO INFLUENCIADOR --- */}
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
                    // Mostra o erro no próprio campo
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
    
    {/* --- ETAPA 3: CONFIRMAÇÃO FINAL --- */}
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