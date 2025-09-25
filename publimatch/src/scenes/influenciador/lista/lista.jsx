import React, { useState, useMemo } from "react";
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

const Influenciadores = () => {
  const navigate = useNavigate();
  const [listaInfluenciadores, setListaInfluenciadores] = useState(influencers);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogStep, setDialogStep] = useState(1);
  const [selectedInfluencer, setSelectedInfluencer] = useState(null);
  const [userPassword, setUserPassword] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  // 2. DEFINIR AS VARIANTES DA ANIMAÇÃO
  // Variante para o container da lista (pai)
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        // A mágica acontece aqui: aplica um delay em cada filho
        staggerChildren: 0.08,
      },
    },
  };

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
      let aVal = a[sortConfig.key];
      let bVal = b[sortConfig.key];
      if (typeof aVal === "string" && !isNaN(Number(aVal))) aVal = Number(aVal);
      if (typeof bVal === "string" && !isNaN(Number(bVal))) bVal = Number(bVal);
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

  const handleDeleteClick = (inf) => {
    setSelectedInfluencer(inf);
    setDialogStep(1);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setUserPassword("");
    setSelectedInfluencer(null);
  };

  const handleNextStep = () => {
    if (dialogStep === 1) {
      if (!userPassword) {
        alert("Digite sua senha para continuar!");
        return;
      }
      setDialogStep(2);
    } else if (dialogStep === 2) {
      setListaInfluenciadores((prev) =>
        prev.filter((inf) => inf.id !== selectedInfluencer.id)
      );
      handleCloseDialog();
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

  const InfluencerRow = (inf) => {
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
      <MotionCard
        key={inf.id}
        variants={itemVariants} // <-- Variante para o item
        layout // Adiciona uma animação suave se a lista for reordenada
        onClick={() => navigate(`/influenciadores/perfil/${inf.id}`)}
        sx={{
          backgroundImage: inf.imagemFundo
            ? `linear-gradient(90deg, rgba(22, 7, 83, 0.8), rgba(81, 4, 61, 0.6)), url(${inf.imagemFundo})`
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
            <Avatar src={avatarImg} alt={inf.nome} sx={{ width: 50, height: 50, border: "2px solid rgba(255,255,255,0.2)" }} />
            <Box>
              <Typography variant="subtitle1" color="white" sx={{ fontSize: "20px" }} fontWeight={700} noWrap>
                {inf.nome}
              </Typography>
              <Typography variant="caption" sx={{ fontSize: "13px" }} color="rgba(255,255,255,0.6)" noWrap>
                {inf.nomeReal ?? ""}
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
            {categorias?.slice(0, 2).map((c, i) => (
              <Chip key={i} label={c} size="small" sx={{ bgcolor: "rgba(255, 255, 255, 0.2)", color: "#ffffffff", fontSize: "0.7rem", height: 24, borderRadius: "6px", border: "1px solid rgba(255, 255, 255, 0.3)" }} />
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
            <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleEdit(inf.id); }} sx={{ bgcolor: "rgba(255,255,255,0.1)", color: "white", "&:hover": { bgcolor: "rgba(255,255,255,0.2)" }, width: 32, height: 32 }}><EditIcon fontSize="small" /></IconButton>
            <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleDeleteClick(inf); }} sx={{ bgcolor: "rgba(255,0,0,0.1)", color: "#ff6b6b", "&:hover": { bgcolor: "rgba(255,0,0,0.2)" }, width: 32, height: 32 }}><DeleteIcon fontSize="small" /></IconButton>
          </Box>
        </Box>
      </MotionCard>
    );
  };

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
            {sortedInfluencers.length
              ? sortedInfluencers.map((inf) => InfluencerRow(inf))
              : (
                <Typography variant="h5" color="white" textAlign="center" mt={4}>
                  Nenhum influenciador encontrado
                </Typography>
              )}
          </Box>
        </Box>
      </Box>

      {/* Dialog de exclusão */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        aria-labelledby="dialog-title"
        aria-describedby="dialog-description"
        sx={{ "& .MuiPaper-root": { backgroundColor: "rgba(255, 255, 255, 0.64)", color: "#610069ff", backdropFilter: "blur(30px)", borderRadius: "20px" } }}
      >
        {dialogStep === 1 && (
          <>
            <DialogTitle id="dialog-title">Confirme sua senha</DialogTitle>
            <DialogContent>
              <TextField autoFocus margin="dense" label="Digite sua senha" type="password" fullWidth value={userPassword} onChange={(e) => setUserPassword(e.target.value)} sx={{ mt: 1, "& .MuiOutlinedInput-root": { color: "#000000", fontSize: "1rem", "& fieldset": { borderColor: "#000000" }, "&:hover fieldset": { borderColor: "#000000" }, "&.Mui-focused fieldset": { borderColor: "#000000" } }, "& .MuiInputLabel-root": { color: "#000000" } }} />
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog} sx={{ color: "#540069ff" }}>Cancelar</Button>
              <Button onClick={handleNextStep} variant="contained" color="primary" sx={{ fontWeight: "bold" }}>Confirmar</Button>
            </DialogActions>
          </>
        )}
        {dialogStep === 2 && (
          <>
            <DialogTitle id="dialog-title">Confirmação</DialogTitle>
            <DialogContent>
              <DialogContentText id="dialog-description" sx={{ color: "#4f4f4fff" }}>
                Tem certeza que deseja apagar o influenciador <b>{selectedInfluencer?.nome}</b>?
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog} sx={{ color: "#540069ff" }}>Cancelar</Button>
              <Button onClick={handleNextStep} sx={{ fontWeight: "bold" }} color="error">Apagar</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
}

export default Influenciadores;