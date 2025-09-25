import { useMemo, useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Chip,
  Avatar,
  Rating,
  Divider,
  InputAdornment,
  Fade
} from "@mui/material";
import Header from "../../../components/Header";
import SearchIcon from "@mui/icons-material/Search";
import SportsEsportsIcon from "@mui/icons-material/SportsEsports";
import TheaterComedyIcon from "@mui/icons-material/TheaterComedy";
import NewspaperIcon from "@mui/icons-material/Newspaper";
import StyleIcon from "@mui/icons-material/Style";
import SchoolIcon from "@mui/icons-material/School";
import MusicNoteIcon from "@mui/icons-material/MusicNote";
import BugReportIcon from "@mui/icons-material/BugReport";
import SportsMmaIcon from "@mui/icons-material/SportsMma";
import FavoriteIcon from "@mui/icons-material/Favorite";
import VisibilityIcon from "@mui/icons-material/Visibility";
import GroupsIcon from "@mui/icons-material/Groups";
import { motion } from "framer-motion";
import { influencers } from "../../../data/mockInfluencer";
import { Link } from "react-router-dom";

// ————— Helpers
const ICONS_BY_CATEGORY = {
  "Jogos": <SportsEsportsIcon />,
  "Comédia": <TheaterComedyIcon />,
  "Notícias": <NewspaperIcon />,
  "Estilo de Vida": <StyleIcon />,
  "Educação": <SchoolIcon />,
  "Terror": <BugReportIcon />,
  "Música": <MusicNoteIcon />,
  "RPG": <SportsMmaIcon />,
  "Streaming": <GroupsIcon />,
  "Família": <FavoriteIcon />,
  "Lifestyle": <StyleIcon />,
  "Games": <SportsEsportsIcon />,
  "Variedade": <GroupsIcon />,
  "Atuação": <TheaterComedyIcon />,
  "Entretenimento": <GroupsIcon />,
  "Tecnologia": <BugReportIcon />,
  "Beleza": <FavoriteIcon />,
  "Empreendedorismo": <SchoolIcon />,
  "Opinião": <NewspaperIcon />,
};

function useCategorias() {
  // pega todas as categorias da mockInfluencer
  const todasCategorias = Array.from(
    new Set(influencers.flatMap((i) => i.categorias || []))
  );

  // transforma em objeto { key, icon }
  return todasCategorias.map((c) => ({
    key: c,
    icon: ICONS_BY_CATEGORY[c] || <GroupsIcon />, // se não tiver, usa padrão
  }));
}


const fmtM = (v) => `${parseFloat(v || 0)}M`;
const colorByEng = (p) => (p >= 90 ? "#6EE787" : p >= 75 ? "#E7C76E" : "#F07171");
const getReviewCount = (inf) =>
  typeof inf.qtdAvaliacoes === "number"
    ? inf.qtdAvaliacoes
    : Math.max(1, Math.round(parseFloat(inf.inscritos || 0) * 1200)); // fallback

export default function RankingInfluenciadores() {
  const [categoria, setCategoria] = useState("Jogos");
  const [catQuery, setCatQuery] = useState("");

  const CATEGORIES = useCategorias();

  const catsFiltradas = useMemo(
    () =>
      CATEGORIES.filter((c) =>
        c.key.toLowerCase().includes(catQuery.trim().toLowerCase())
      ),
    [catQuery, CATEGORIES]
  );
  // Filtra e ordena rank: 1) média desc  2) qtdAvaliações desc
  const listaOrdenada = useMemo(() => {
    const base = influencers.filter((i) => i.categorias?.includes(categoria));
    return [...base].sort((a, b) => {
      if (b.avaliacao === a.avaliacao) {
        return getReviewCount(b) - getReviewCount(a);
      }
      return b.avaliacao - a.avaliacao;
    });
  }, [categoria]);

  const top3 = listaOrdenada.slice(0, 3);
  const resto = listaOrdenada.slice(3);

  return (
     <Fade in={true} timeout={800}>
    <Box
      sx={{
        minHeight: "100vh",
        pl: 2,
        pr:2,
      }}
    >
      <Header title="Ranking" subtitle="de Influenciadores" />

      <Box display="flex" gap={3} mt={2}>
        {/* ————— Sidebar (busca + categorias) */}
        <Box
          flex="0 0 320px"
          p={2.2}
          sx={{
            borderRadius: 3,
            background:
              "linear-gradient(180deg, rgba(18, 18, 42, 0.47) 0%, rgba(18, 18, 42, 0.55) 100%)",
            backdropFilter: "blur(14px)",
            color: "white",
            boxShadow: "0 12px 40px rgba(0,0,0,0.35)",
             height: "70vh",
              position: "sticky",
              top: "20px",
              alignSelf: "flex-start",
              boxShadow: "0 8px 20px rgba(0,0,0,0.4)",
              display: "flex",
              flexDirection: "column",
          }}
        >
            
          <Typography variant="h6" fontWeight={800} sx={{ opacity: 0.9 }}>
            Busca
          </Typography>

          <TextField
            placeholder="Pesquise a categoria desejada"
            fullWidth
            size="small"
            value={catQuery}
            onChange={(e) => setCatQuery(e.target.value)}
            sx={{
              mt: 1.5,
              mb: 2.5,
              "& .MuiOutlinedInput-root": {
                bgcolor: "rgba(255,255,255,0.08)",
                color: "white",
                borderRadius: "12px",
                "& fieldset": { border: "none" },
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: "rgba(255,255,255,0.7)" }} />
                </InputAdornment>
              ),
            }}
          />

          <Typography
            variant="overline"
            fontWeight={700}
            sx={{ letterSpacing: 1.4, opacity: 0.8 }}
          >
            Categorias
          </Typography>
<Box
                        sx={{
                            flex: 1, // ✅ Ocupa todo espaço disponível
                            overflowY: "auto", // ✅ Adiciona scroll vertical
                            overflowX: "visible",
                            width: "100%", // ✅ Remove scroll horizontal
                            pr: 5, // Espaçamento para a scrollbar
                            "&::-webkit-scrollbar": { 
                              width: "6px" 
                            },
                            "&::-webkit-scrollbar-track": {
                              background: "rgba(255, 255, 255, 0.1)",
                              borderRadius: "10px",
                            },
                            "&::-webkit-scrollbar-thumb": {
                              background: "rgba(255, 255, 255, 0.3)",
                              borderRadius: "10px",
                            },
                          }}
                        >
          <Box mt={1} display="flex" flexDirection="column" gap={1}>
            {catsFiltradas.map((c) => {
              const active = c.key === categoria;
              return (
                <Box
                  key={c.key}
                  onClick={() => setCategoria(c.key)}
                  sx={{
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    px: 1.5,
                    py: 1.2,
                    borderRadius: "14px",
                    background: active
                      ? "linear-gradient(90deg, rgba(255, 255, 255, 0.25) 0%, rgba(255,255,255,0.06) 100%)"
                      : "rgba(255,255,255,0.06)",
                    border: active
                      ? "1px solid rgba(255,255,255,0.35)"
                      : "1px solid rgba(255,255,255,0.10)",
                    transition: "all .2s",
                    "&:hover": {
                      background: "rgba(255,255,255,0.12)",
                    },
                  }}
                >
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: "10px",
                      display: "grid",
                      placeItems: "center",
                      background: active
                        ? "linear-gradient(180deg, #ed4fffff 0%, #cc438eff 100%)"
                        : "rgba(255,255,255,0.12)",
                    }}
                  >
                    {c.icon}
                  </Box>
                  <Typography fontWeight={700}>{c.key}</Typography>
                </Box>
              );
            })}
          </Box>
          </Box>
        </Box>

        {/* ————— Podium (Destaques) */}
        <Box
          flex={1.2}
          p={2.2}
          sx={{
            borderRadius: 3,
            color: "white",
            background:
              "linear-gradient(180deg, rgba(20, 20, 45, 0.65) 0%, rgba(20, 20, 45, 0.5) 100%)",
            boxShadow: "0 12px 40px rgba(0,0,0,0.35)",
            backdropFilter: "blur(50px)",
            position: "relative",
            height: "70vh",
          }}
        >
          <Typography
            variant="h6"
            fontWeight={800}
            textAlign="center"
            sx={{ opacity: 0.9 }}
          >
            Destaques — {categoria}
          </Typography>

          <Divider
            sx={{
              my: 2,
              borderColor: "rgba(255,255,255,0.15)",
            }}
          />

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              alignItems: "end",
              gap: 3,
              height: "calc(56vh)",
              pb: 0,
            }}
          >
            {/* 3º */}
            <PodiumBar
             key={categoria + "-3"}
              pos={3}
              color="linear-gradient(180deg, #D08B52 0%, #B1652B 100%)"
              h="26vh"
              inf={top3[2]}
            />
            {/* 1º */}
            <PodiumBar
              pos={1}
                 key={categoria + "-1"}
              color="linear-gradient(180deg, #FFD54F 0%, #FFB300 100%)"
              h="45vh"
              inf={top3[0]}
              crown
            />
            {/* 2º */}
            <PodiumBar
              pos={2}
                 key={categoria + "-2"}
              color="linear-gradient(180deg, #D2D4DB 0%, #BFC2CB 100%)"
              h="35vh"
              inf={top3[1]}
            />
          </Box>
        </Box>

        {/* ————— Tabela de Ranking */}
  <Box
  flex={1.8}
  p={2.2}
  sx={{
    borderRadius: 3,
    color: "white",
    background:
      "linear-gradient(180deg, rgba(16, 16, 36, 0.52) 0%, rgba(16, 16, 36, 0.56) 100%)",
    backdropFilter: "blur(50px)",
    boxShadow: "0 12px 40px rgba(0,0,0,0.35)",
    height: "70vh",
    display: "flex",
    flexDirection: "column",
  }}
>
  {/* Título */}
  <Typography variant="h6" fontWeight={800} sx={{ opacity: 0.9 }}>
    Ranking
  </Typography>

  {/* Cabeçalho fixo */}
  <Box
    mt={1.2}
    px={2}
    py={1.4}
    sx={{
      display: "grid",
      gridTemplateColumns: "50px 2fr 1.8fr 1.5fr 1fr",
      alignItems: "center",
      gap: 1.2,
      fontSize: 14,
      fontWeight: 700,
      opacity: 0.75,
      borderBottom: "1px solid rgba(255,255,255,0.15)",
      flexShrink: 0,
    }}
  >
    <Typography sx={{ textAlign: "center" }}>Ranking</Typography>
    <Typography>Nome</Typography>
    <Typography sx={{ textAlign: "center" }}>Avaliação</Typography>
    <Typography>Categorias</Typography>
    <Typography sx={{ textAlign: "right" }}>Engajamento</Typography>
  </Box>

  {/* Lista rolável */}
  <Box
    sx={{
      overflowY: "auto",
      
      mt: 1,
      flex: 1,
      pr: 1, // evita que a scrollbar encoste no conteúdo
          "&::-webkit-scrollbar": {
      width: "10px",
      marginRight:"10px",               // largura da scrollbar
    },
    "&::-webkit-scrollbar-track": {
      background: "rgba(255, 255, 255, 0.1)", // cor do fundo da scrollbar
      borderRadius: "10px",
    },
    "&::-webkit-scrollbar-thumb": {
      background: "rgba(255, 255, 255, 0.3)", // cor da parte que você arrasta
      borderRadius: "10px",
    },
    "&::-webkit-scrollbar-thumb:hover": {
      background: "rgba(255, 255, 255, 0.6)", // muda a cor ao passar o mouse
    },
    }}
  >
    {[...top3, ...resto].map((inf, idx) => {
      const rank = idx + 1;
      return (
        <Link
        to={`/influenciador/${inf.id}`} // ✅ caminho dinâmico
        key={inf.nome + rank}
        style={{ textDecoration: "none",  color: "inherit",    }} 
        // remove underline
      >
        <Box
          key={inf.nome + rank}
          sx={{
            display: "grid",
            gridTemplateColumns: "50px 2fr 1.8fr 1.5fr 1fr",
            alignItems: "center",
            gap: 1.2,
            px: 2,
            py: 1.2,
            borderRadius: 2,
            mb: 0.5,
            mt: 1,
            backgroundImage: inf.imagemFundo 
                ? `linear-gradient(90deg, rgba(22, 7, 83, 0.8), rgba(81, 4, 61, 0.6)), url(${inf.imagemFundo})`
                : "linear-gradient(90deg, rgba(30, 58, 138, 0.8), rgba(59, 130, 246, 0.6))",
            backgroundSize: "cover",
            backgroundPosition:"center",
            border: "none",
            backdropFilter: "blur(10px)",
          }}
        >
                {/* Ranking */}
                <Typography
                  sx={{
                    fontWeight: 900,
                    fontSize: 20,
                    textAlign: "center",
                  }}
                >
                  {rank}º
                </Typography>

                {/* Nome + Avatar */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
                  <Avatar src={inf.imagem} sx={{ width: 42, height: 42 }} />
                  <Box>
                    <Typography fontWeight={800}>{inf.nome}</Typography>
                    <Typography variant="caption" sx={{ opacity: 0.7 }}>
                      {inf.nomeReal}
                    </Typography>
                  </Box>
                </Box>

                {/* Avaliação */}
                <Box sx={{ textAlign: "center" }}>
                  <Box display="flex" alignItems="center" justifyContent="center" gap={0.6}>
                    <Rating value={inf.avaliacao} precision={0.1} readOnly size="small" />
                    <Typography fontWeight={700}>{inf.avaliacao.toFixed(1)}</Typography>
                  </Box>
                  <Typography variant="caption" sx={{ opacity: 0.7 }}>
                    ({getReviewCount(inf).toLocaleString("pt-BR")})
                  </Typography>
                </Box>

                {/* Categorias */}
                <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                  {inf.categorias?.map((c) => (
                    <Chip
                      key={c}
                      label={c}
                      size="small"
                      sx={{
                        height: 22,
                        fontSize: "0.7rem",
                        borderRadius: "8px",
                        bgcolor: "rgba(255,255,255,0.08)",
                        color: "white",
                      }}
                    />
                  ))}
                </Box>

                {/* Engajamento */}
                <Typography sx={{ textAlign: "right", fontWeight: 700 }}>
                  {inf.engajamento}%
                </Typography>
              </Box>
                </Link>
            );
          })}
</Box>
        </Box>
      </Box>
    </Box>
  </Fade>
  );
}


function PodiumBar({ pos, h, color, crown = false, inf }) {
  if (!inf) {
    return <Box />; // quando não há 3 itens ainda
  }
  const nota = inf.avaliacao?.toFixed(1) ?? "—";
  const rotulo = `${pos}º`;

  return (
    <Box
      sx={{
        position: "relative",
        display: "grid",
        alignContent: "end",
        justifyItems: "center",
        height: "100%",
      }}
    >
      {/* Avatar "flutuando" */}
      <Avatar
        src={inf.imagem}
        alt={inf.nome}
        sx={{
          width: pos === 1 ? 96 : 72,
          height: pos === 1 ? 96 : 72,
          border: "3px solid white",
          zIndex: 2,
          transform: "translateY(18px)",
        }}
      />

      {/* Coluna animada */}
      <motion.div
        initial={{ height: 0 }}
        animate={{ height: typeof h === "string" ? h : `${h}px` }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        style={{
          width: pos === 1 ? "88%" : "72%",
          borderRadius: "18px",
          background: color,
          display: "grid",
          alignContent: "space-between",
          justifyItems: "center",
          paddingTop: "4.8rem",
          paddingBottom: "1.2rem",
          position: "relative",
          boxShadow:
            "inset 0 6px 18px rgba(255,255,255,0.25), 0 16px 30px rgba(0,0,0,0.35)",
          overflow: "hidden",
        }}
      >
        {/* nome curtinho */}
        <Typography
          variant="body2"
          fontWeight={800}
          sx={{
            px: 1,
            textAlign: "center",
            color: "#2B1B51",
            whiteSpace: "nowrap",
            textOverflow: "ellipsis",
            overflow: "hidden",
            width: "90%",
          }}
          title={inf.nome}
        >
          {inf.nome}
        </Typography>

        {/* posição */}
        <Typography variant="h4" fontWeight={900} color="#2B1B51">
          {rotulo}
        </Typography>

        {/* nota */}
        <Box
          sx={{
            mt: 0.6,
            px: 1.1,
            py: 0.3,
            borderRadius: "10px",
            background: "rgba(0,0,0,0.2)",
            color: "white",
            fontWeight: 800,
          }}
        >
          {nota}
        </Box>
      </motion.div>
    </Box>

  );
}
