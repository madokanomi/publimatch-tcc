import { useMemo, useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Chip,
  Avatar,
  Rating,
  Divider,
  InputAdornment,
  Fade,
  CircularProgress
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
import { Link } from "react-router-dom";
import axios from "axios";

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

// Função auxiliar para pegar ícone ou padrão
const getCategoryIcon = (key) => ICONS_BY_CATEGORY[key] || <GroupsIcon />;

export default function RankingInfluenciadores() {
  const [listaInfluenciadores, setListaInfluenciadores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoria, setCategoria] = useState("Jogos");
  const [catQuery, setCatQuery] = useState("");

  // 1. Fetch dos dados reais do Backend
useEffect(() => {
    const fetchData = async () => {
      try {
        const userInfo = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user'));
        const token = userInfo?.token;
        const config = { headers: { Authorization: `Bearer ${token}` } };

        // Agora chama a rota que retorna TODOS (conforme configurado no Backend)
   // Chama a rota específica para buscar TODOS do banco
const { data: influencersData } = await axios.get('http://localhost:5001/api/influencers/all', config);

        // O backend já está retornando a estrutura formatada no getAllInfluencers
        // Se precisar de mapeamento adicional, faça aqui, mas o controller atualizado já trata isso.
        
        // Garante que é um array
        const dataArray = Array.isArray(influencersData) ? influencersData : [];

        // Mapeamento de segurança (caso o backend não envie exatamente os campos visuais)
        const formattedData = dataArray.map(inf => ({
             id: inf._id || inf.id,
             nome: inf.name || inf.nome,
             nomeReal: inf.realName || inf.nomeReal || "",
             imagem: inf.profileImageUrl || inf.imagem,
             imagemFundo: inf.backgroundImageUrl || inf.imagemFundo,
             categorias: inf.niches || inf.categorias || [],
             engajamento: inf.engagementRate || inf.engajamento || 0,
             inscritos: inf.followersCount || inf.inscritos || 0,
             avaliacao: Number(inf.avaliacao || 0),
             qtdAvaliacoes: Number(inf.qtdAvaliacoes || 0)
        }));

        setListaInfluenciadores(formattedData);
        
        // Ajusta a categoria inicial dinamicamente
        const allCats = Array.from(new Set(formattedData.flatMap(i => i.categorias)));
        if (allCats.length > 0 && !allCats.includes("Jogos")) {
             setCategoria(allCats[0]);
        }

      } catch (error) {
        console.error("Erro ao carregar ranking:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // 2. Extrai categorias únicas dos dados carregados
  const categoriesList = useMemo(() => {
    const todas = Array.from(
      new Set(listaInfluenciadores.flatMap((i) => i.categorias || []))
    );
    return todas.map((c) => ({
      key: c,
      icon: getCategoryIcon(c),
    }));
  }, [listaInfluenciadores]);

  // 3. Filtro de Categorias
  const catsFiltradas = useMemo(
    () =>
        categoriesList.filter((c) =>
        c.key.toLowerCase().includes(catQuery.trim().toLowerCase())
      ),
    [catQuery, categoriesList]
  );

  // 4. Lógica de Ranking
  const listaOrdenada = useMemo(() => {
    const base = listaInfluenciadores.filter((i) => i.categorias?.includes(categoria));
    return [...base].sort((a, b) => {
      if (b.avaliacao !== a.avaliacao) {
        return b.avaliacao - a.avaliacao;
      }
      return b.qtdAvaliacoes - a.qtdAvaliacoes;
    });
  }, [categoria, listaInfluenciadores]);

  const top3 = listaOrdenada.slice(0, 3);
  const resto = listaOrdenada.slice(3);

  if (loading) {
      return <Box display="flex" justifyContent="center" alignItems="center" height="100vh"><CircularProgress /></Box>;
  }

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
                    flex: 1, 
                    overflowY: "auto", 
                    overflowX: "visible",
                    width: "100%", 
                    pr: 1, 
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
            {catsFiltradas.length > 0 ? (
                catsFiltradas.map((c) => {
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
                })
            ) : (
                 <Typography variant="body2" sx={{ opacity: 0.6, mt: 2, textAlign: 'center' }}>
                    Nenhuma categoria encontrada.
                 </Typography>
            )}
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
             {top3.length === 0 ? (
                 <Box gridColumn="1 / -1" display="flex" justifyContent="center" alignItems="center" height="100%">
                     <Typography sx={{ opacity: 0.5 }}>Sem influenciadores nesta categoria.</Typography>
                 </Box>
             ) : (
                 <>
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
                 </>
             )}
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
      pr: 1, 
          "&::-webkit-scrollbar": {
      width: "10px",
      marginRight:"10px",              
    },
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
    {[...top3, ...resto].map((inf, idx) => {
      // Se não tiver inf (pode acontecer se o array for vazio ou menor que 3 no podio), não renderiza na lista
      if (!inf) return null;

      const rank = idx + 1;
      return (
        <Link
        to={`/influenciador/${inf.id}`} 
        key={inf.nome + rank} 
        style={{ textDecoration: "none",  color: "inherit",    }} 
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
            transition: "transform 0.2s",
            "&:hover": {
                transform: "translateX(4px)"
            }
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
                    ({inf.qtdAvaliacoes.toLocaleString("pt-BR")})
                  </Typography>
                </Box>

                {/* Categorias */}
                <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                  {inf.categorias?.slice(0, 2).map((c) => (
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
                  {inf.categorias?.length > 2 && (
                       <Chip label={`+${inf.categorias.length - 2}`} size="small" sx={{ height: 22, fontSize: "0.7rem", borderRadius: "8px", bgcolor: "rgba(255,255,255,0.1)", color: "white" }} />
                  )}
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
    return <Box />; 
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