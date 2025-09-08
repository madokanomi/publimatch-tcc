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
import { influencers } from "../../../data/mockInfluencer";

// ————— Helpers
const CATEGORIES = [
  { key: "Jogos", icon: <SportsEsportsIcon /> },
  { key: "Comédia", icon: <TheaterComedyIcon /> },
  { key: "Notícias", icon: <NewspaperIcon /> },
  { key: "Estilo de Vida", icon: <StyleIcon /> },
  { key: "Educação", icon: <SchoolIcon /> },
  { key: "Terror", icon: <BugReportIcon /> },
  { key: "Música", icon: <MusicNoteIcon /> },
  { key: "RPG", icon: <SportsMmaIcon /> },
];

const fmtM = (v) => `${parseFloat(v || 0)}M`;
const colorByEng = (p) => (p >= 90 ? "#6EE787" : p >= 75 ? "#E7C76E" : "#F07171");
const getReviewCount = (inf) =>
  typeof inf.qtdAvaliacoes === "number"
    ? inf.qtdAvaliacoes
    : Math.max(1, Math.round(parseFloat(inf.inscritos || 0) * 1200)); // fallback

export default function RankingInfluenciadores() {
  const [categoria, setCategoria] = useState("Jogos");
  const [catQuery, setCatQuery] = useState("");

  // Filtra categorias pelo campo de busca da sidebar
  const catsFiltradas = useMemo(
    () =>
      CATEGORIES.filter((c) =>
        c.key.toLowerCase().includes(catQuery.trim().toLowerCase())
      ),
    [catQuery]
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
    <Box
      sx={{
        minHeight: "100vh",
        p: 2,
      
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
             height: "64vh",
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
            height: "64vh",
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
              pb: 5,
            }}
          >
            {/* 3º */}
            <PodiumBar
              pos={3}
              color="linear-gradient(180deg, #D08B52 0%, #B1652B 100%)"
              h={140}
              inf={top3[2]}
            />
            {/* 1º */}
            <PodiumBar
              pos={1}
              color="linear-gradient(180deg, #FFD54F 0%, #FFB300 100%)"
              h="40vh"
              inf={top3[0]}
              crown
            />
            {/* 2º */}
            <PodiumBar
              pos={2}
              color="linear-gradient(180deg, #D2D4DB 0%, #BFC2CB 100%)"
              h="30vh"
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
              "linear-gradient(180deg, rgba(16, 16, 36, 0.82) 0%, rgba(16, 16, 36, 0.56) 100%)",
            backdropFilter: "blur(12px)",
            boxShadow: "0 12px 40px rgba(0,0,0,0.35)",
            overflow: "hidden",
          }}
        >
          <Typography variant="h6" fontWeight={800} sx={{ opacity: 0.9 }}>
            Ranking
          </Typography>

          {/* Cabeçalho */}
         {/* Cabeçalho */}
<Box
  mt={1.2}
  px={2}
  py={1.4}
  sx={{
    display: "grid",
    gridTemplateColumns: "80px minmax(200px, 2fr) minmax(120px, 1fr) minmax(160px, 1.4fr) minmax(120px, 1fr)",
    fontSize: 14,
    fontWeight: 700,
    opacity: 0.75,
    borderBottom: "1px solid rgba(255,255,255,0.15)",
  }}
>
  <Typography>Ranking</Typography>
  <Typography>Nome</Typography>
  <Typography textAlign="right">Avaliação</Typography>
  <Typography>Categorias</Typography>
  <Typography textAlign="right">Engajamento</Typography>
</Box>

{/* Linhas */}
{/* Linhas da tabela */}
<Box
  sx={{
    maxHeight: "62vh",
    overflowY: "auto",
    pr: 1.5,
    "&::-webkit-scrollbar": { width: 8 },
    "&::-webkit-scrollbar-thumb": {
      background: "rgba(255,255,255,0.25)",
      borderRadius: 8,
    },
  }}
>
  {[...top3, ...resto].map((inf, idx) => {
    if (!inf) return null;
    const rank = idx + 1;
    const nReviews = getReviewCount(inf);

    // cor do ranking
    const rankColor =
      rank === 1
        ? "#FFD54F"
        : rank === 2
        ? "#C0C0C0"
        : rank === 3
        ? "#D08B52"
        : "white";

    return (
      <Box
        key={inf.nome + rank}
        sx={{
          position: "relative",
          display: "grid",
          gridTemplateColumns: "60px 1.8fr 1fr 1.6fr", // mais compacto
          alignItems: "center",
          gap: 1.2,
          px: 2,
          py: 1.2, // menos padding
          borderRadius: 2,
          mb: 1,
          background:
            "linear-gradient(90deg, rgba(120,50,200,0.25), rgba(40,30,80,0.35))",
          border: "1px solid rgba(255,255,255,0.1)",
          backdropFilter: "blur(10px)",
          transition: "all .15s ease",
          "&:hover": {
            background:
              "linear-gradient(90deg, rgba(140,70,220,0.35), rgba(60,40,100,0.45))",
            transform: "translateY(-1px)",
          },
        }}
      >
        {/* Ranking */}
        <Typography
          sx={{
            fontWeight: 900,
            fontSize: 22,
            textAlign: "center",
            color: rankColor,
          }}
        >
          {rank}º
        </Typography>

        {/* Nome + Avatar */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
          <Avatar
            src={inf.imagem}
            sx={{
              width: 42,
              height: 42,
              border: "2px solid rgba(255,255,255,0.3)",
              boxShadow: "0 2px 8px rgba(0,0,0,0.4)",
            }}
          />
          <Box>
            <Typography fontWeight={800}>{inf.nome}</Typography>
            <Typography
              variant="caption"
              sx={{ opacity: 0.7, display: "block" }}
            >
              {inf.nomeReal || "• • •"}
            </Typography>
          </Box>
        </Box>

        {/* Avaliação */}
        <Box sx={{ textAlign: "center" }}>
          <Box display="flex" alignItems="center" justifyContent="flex-end" gap={0.6}>
            <Rating
              value={inf.avaliacao}
              precision={0.1}
              readOnly
              sx={{
                "& .MuiRating-iconFilled": { color: "#FFD54F" },
                "& .MuiRating-iconEmpty": { color: "rgba(255,255,255,0.25)" },
              }}
            />
            <Typography fontWeight={700}>
              {inf.avaliacao.toFixed(1)}
            </Typography>
          </Box>
          <Typography variant="caption" sx={{ opacity: 0.7 }}>
            ({nReviews.toLocaleString("pt-BR")})
          </Typography>
        </Box>

        {/* Categorias */}
        <Box
          sx={{
            display: "flex",
            gap: 0.6,
            flexWrap: "nowrap",
            overflowX: "auto",
            "&::-webkit-scrollbar": { height: 4 },
            "&::-webkit-scrollbar-thumb": {
              background: "rgba(255,255,255,0.2)",
              borderRadius: 4,
            },
          }}
        >
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
                border: "1px solid rgba(255,255,255,0.18)",
                whiteSpace: "nowrap",
              }}
            />
          ))}
        </Box>
      </Box>
    );
  })}
</Box>

        </Box>
      </Box>
    </Box>
  );
}

// ————— Componente de barra do pódio
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
      {/* Avatar “flutuando” */}
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

      {/* Coluna */}
      <Box
        sx={{
          width: pos === 1 ? "88%" : "72%",
          height: h,
          borderRadius: "18px",
          background: color,
          display: "grid",
          alignContent: "space-between",
          justifyItems: "center",
          pt: 4.8,
          pb: 1.2,
          position: "relative",
          boxShadow:
            "inset 0 6px 18px rgba(255,255,255,0.25), 0 16px 30px rgba(0,0,0,0.35)",
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
      </Box>
    </Box>
  );
}
