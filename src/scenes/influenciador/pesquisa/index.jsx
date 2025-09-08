import { Box, Typography, TextField, Slider, Button, Chip, Rating, Card, CardContent, Avatar, IconButton } from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import Header from "../../../components/Header";
import InfluencerCard from "../../../components/InfluencerCard";
import { useState } from "react";
import { influencers } from "../../../data/mockInfluencer";

const Influenciadores = () => {
  const [search, setSearch] = useState("");

  const filteredInfluencers = influencers.filter((inf) =>
    inf.nome.toLowerCase().includes(search.toLowerCase())
  );

 const [categoria, setCategoria] = useState("");
  const [plataforma, setPlataforma] = useState("");
  const [seguidores, setSeguidores] = useState([0, 100]); // faixa min-max
  const [avaliacao, setAvaliacao] = useState(0);
  const [tagsSelecionadas, setTagsSelecionadas] = useState([]);

  // 🎯 Aplicar filtros
  const filtrados = influencers.filter((inf) => {
    const seg = parseFloat(inf.seguidores);

    return (
      (categoria ? inf.categorias.includes(categoria) : true) &&
      (plataforma ? inf.redes.includes(plataforma) : true) &&
      seg >= seguidores[0] &&
      seg <= seguidores[1] &&
      inf.avaliacao >= avaliacao &&
      (tagsSelecionadas.length > 0
        ? tagsSelecionadas.every((tag) => inf.tags.includes(tag))
        : true)
    );
  });
const [searchTag, setSearchTag] = useState("");
const [showAllTags, setShowAllTags] = useState(false);

  // 🎯 Tags possíveis
 const todasTags = Array.from(
  new Set(influencers.flatMap((inf) => inf.tags))
);

  return (
    <Box ml="25px">
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Header title="Pesquisa" subtitle="De influenciadores" />
      </Box>

      <Box
        height="calc(100vh - 120px)"
        overflow="auto"
        sx={{
          overflowY: "auto",
          transition: "all 0.3s ease-in-out",
          "&::-webkit-scrollbar": { width: "10px" },
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
        <Box display="flex" p={2} gap={2}>
          {/* Sidebar de Filtros */}
   {/* Sidebar de Filtros */}
          <Box
            flex="0 0 22vw"
            p={3}
            borderRadius="24px"
            sx={{
              background:
                "linear-gradient(180deg, rgba(18, 18, 42, 0.76) 0%, rgba(10, 10, 25, 0.6) 100%)",
              backdropFilter: "blur(12px)",
              color: "white",
              height: "64vh",
              position: "sticky",
              top: "20px",
              alignSelf: "flex-start",
              boxShadow: "0 8px 20px rgba(0,0,0,0.4)",
              display: "flex",
              flexDirection: "column", // ✅ Organiza em coluna
            }}
          >
            {/* Título fixo */}
            <Typography variant="h5" fontWeight="bold" mb={2}>
              Filtros avançados
            </Typography>

            {/* Área de scroll para os filtros */}
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
              {/* Categoria */}
              <Typography variant="body2" fontWeight="500">
                Categoria
              </Typography>
              <TextField
                fullWidth
                size="small"
                select
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                SelectProps={{ native: true }}
                sx={{
                  mb: 2,
                  mt: 0.5,
                  bgcolor: "rgba(255,255,255,0.1)",
                  borderRadius: "10px",
                  "& .MuiOutlinedInput-input": { color: "white" },
                  "& fieldset": { border: "none" },
                  "& svg": { color: "white" },
                }}
              >
                <option value="">Todas</option>
                <option value="Jogos">Jogos</option>
                <option value="Comédia">Comédia</option>
                <option value="Música">Música</option>
              </TextField>

              {/* Plataforma */}
              <Typography variant="body2" fontWeight="500">
                Plataforma
              </Typography>
              <TextField
                fullWidth
                size="small"
                select
                value={plataforma}
                onChange={(e) => setPlataforma(e.target.value)}
                SelectProps={{ native: true }}
                sx={{
                  mb: 2,
                  mt: 0.5,
                  bgcolor: "rgba(255,255,255,0.1)",
                  borderRadius: "10px",
                  "& .MuiOutlinedInput-input": { color: "white" },
                  "& fieldset": { border: "none" },
                  "& svg": { color: "white" },
                }}
              >
                <option value="">Todas</option>
                <option value="youtube">YouTube</option>
                <option value="twitch">Twitch</option>
                <option value="instagram">Instagram</option>
                <option value="tiktok">TikTok</option>
              </TextField>

              {/* Slider Seguidores */}
              <Typography variant="body2" fontWeight="500" mb={1}>
                Faixa de Seguidores (milhões)
              </Typography>
              <Slider
                value={seguidores}
                onChange={(_, v) => setSeguidores(v)}
                valueLabelDisplay="auto"
                min={0}
                max={100}
                sx={{
                  marginLeft: "10px",
                  mb: 2,
                  color: "#ff00d4",
                  "& .MuiSlider-thumb": {
                    bgcolor: "white",
                    border: "2px solid #ff00d4",
                  },
                  "& .MuiSlider-track": { bgcolor: "#ff00d4" },
                }}
              />

              {/* Avaliação */}
              <Typography variant="body2" fontWeight="500" mt={1}>
                Avaliação mínima
              </Typography>
              <Rating
                value={avaliacao}
                onChange={(_, v) => setAvaliacao(v)}
                precision={0.5}
                sx={{
                  mb: 2,
                  "& .MuiRating-iconFilled": { color: "gold" },
                  "& .MuiRating-iconEmpty": { color: "rgba(255,255,255,0.3)" },
                }}
              />

              {/* Tags */}
              <Typography variant="body2" fontWeight="500" mb={1}>
                Tags
              </Typography>

              {/* Pesquisa de Tags */}
              <TextField
                fullWidth
                size="small"
                placeholder="Buscar tag..."
                value={searchTag}
                onChange={(e) => setSearchTag(e.target.value)}
                sx={{
                  mb: 1,
                  bgcolor: "rgba(255,255,255,0.1)",
                  borderRadius: "10px",
                  "& .MuiOutlinedInput-input": { color: "white", fontSize: "0.85rem" },
                  "& fieldset": { border: "none" },
                }}
              />

              <Box display="flex" flexWrap="wrap" gap={1} mb={1}>
                {(showAllTags
                  ? todasTags
                  : todasTags.slice(0, 5)
                )
                  .filter((tag) => tag.toLowerCase().includes(searchTag.toLowerCase()))
                  .map((tag, idx) => (
                    <Chip
                      key={idx}
                      label={tag}
                      size="small"
                      onClick={() =>
                        setTagsSelecionadas((prev) =>
                          prev.includes(tag)
                            ? prev.filter((t) => t !== tag)
                            : [...prev, tag]
                        )
                      }
                      sx={{
                        bgcolor: tagsSelecionadas.includes(tag)
                          ? "#ff00d4"
                          : "rgba(255,255,255,0.1)",
                        color: "white",
                        borderRadius: "10px",
                        cursor: "pointer",
                        "&:hover": { bgcolor: "rgba(255,255,255,0.2)" },
                      }}
                    />
                  ))}
              </Box>

              {/* Botão Ver Mais / Ver Menos */}
              {todasTags.length > 5 && (
                <Button
                  onClick={() => setShowAllTags(!showAllTags)}
                  size="small"
                  variant="contained"
                  fullWidth
                  sx={{
                    mb: 2,
                    color: "white",
                    textTransform: "none",
                    backgroundColor: "rgba(255,255,255,0.1)",
                    alignContent: "center",
                    alignItems: "center",
                    justifyContent: "center",
                   transition: "all 0.3s ease-in-out",
                    borderRadius: "10px",
                    fontSize: "0.8rem",
                    "&:hover": { bgcolor: "rgba(255, 255, 255, 0.28)" },
                  }}
                >
                  {showAllTags ? "Ver menos" : "Ver mais"}
                </Button>
              )}
            </Box>

            {/* Botão Limpar Filtros - sempre fixo no final */}
            <Button
              variant="contained"
              fullWidth
              onClick={() => {
                setCategoria("");
                setPlataforma("");
                setSeguidores([0, 100]);
                setAvaliacao(0);
                setTagsSelecionadas([]);
                setSearchTag(""); // ✅ Limpa também a pesquisa de tags
              }}
              sx={{
                mt: 2,
                borderRadius: "12px",
                bgcolor: "#ff00ae5b",
                textTransform: "none",
                backdropFilter: "blur(10px)",
                transition: "all 0.3s ease-in-out",
                fontWeight: "600",
                "&:hover": { bgcolor: "#ff00a679", fontSize: "0.8rem" ,},
              }}
            >
              Limpar Filtros
            </Button>
          </Box>
      {/* Lista de Influenciadores */}
       <Box
             flex={1}
  display="grid"
  gridTemplateColumns="repeat(3, 1fr)" // sempre 3 colunas iguais
  gap={4}
  pl={3}
  pb={20}
  sx={{
    alignItems: "start",      // evita que os itens se estiquem verticalmente
    alignContent: "start",    // evita stretch das linhas do grid
    gridAutoRows: "auto",     // garante que cada linha tenha altura natural
  }}
          >
            {filtrados.length > 0 ? (
              filtrados.map((inf, i) => <InfluencerCard key={i} {...inf} />)
            ) : (
              <Typography variant="h3" fontWeight="bold" color="white" textAlign="center" gridColumn="1/-1">
                Nenhum influenciador encontrado
              </Typography>
            )}
          </Box>
    </Box>
    </Box>
    </Box>
  );
};

export default Influenciadores;