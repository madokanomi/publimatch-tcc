import {
  Box, Typography, TextField, Slider, Button, Chip, Rating, Dialog,
  DialogContent, Avatar, IconButton, Fade, Skeleton
} from "@mui/material";
import { forwardRef, useMemo, useState, useEffect } from "react";
import Header from "../../../components/Header";
import InfluencerCard from "../../../components/InfluencerCard"; 
import { Autocomplete } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { Star, Favorite, Visibility, Groups, Verified } from "@mui/icons-material"; // Verified importado
import { SiTwitch } from "react-icons/si";
import YouTubeIcon from "@mui/icons-material/YouTube";
import InstagramIcon from "@mui/icons-material/Instagram";
import MusicNoteIcon from "@mui/icons-material/MusicNote";
import { motion, AnimatePresence } from "framer-motion";


const MAX_FOLLOWERS = 80000; 

// Função auxiliar para formatar números (K, M) e Notas
const formatNumber = (num) => {
  if (num === undefined || num === null) return "0";
  const n = parseFloat(num);
  
  if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
  if (n >= 1000) return (n / 1000).toFixed(1) + "K";
  
  // Se for pequeno (tipo nota 4.8), mostra o decimal. 
  // Se for inteiro (5 ou 100), mostra sem decimal.
  return Number.isInteger(n) ? n.toString() : n.toFixed(1);
};

const formatLabel = (value) => {
    if (value >= 1000000) return (value / 1000000).toFixed(1) + "B"; // Bilhões
    if (value >= 1000) return (value / 1000).toFixed(1) + "M";       // Milhões
    return value + "K";                                              // Milhares
  };

// Componente auxiliar de comparação
const StatComparator = ({ icon, label, value1, value2, unit = "" }) => {
  const v1 = parseFloat(value1 || 0);
  const v2 = parseFloat(value2 || 0);
  
  // Lógica para destacar o maior valor
  const isValue1Winner = v1 > v2;
  const isValue2Winner = v2 > v1;
  
  const winnerStyle = { color: "#00ff95", fontWeight: "bold", transform: "scale(1.1)" };
  const defaultStyle = { color: "white" };

  return (
    <Box display="flex" justifyContent="space-between" alignItems="center" width="100%" py={1.5} px={2} my={0.5} sx={{ background: "rgba(0,0,0,0.2)", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.1)" }}>
      {/* Exibe o valor formatado */}
      <Typography sx={{ transition: "all 0.3s ease", ...(isValue1Winner ? winnerStyle : defaultStyle) }}>
        {formatNumber(v1)}{unit}
      </Typography>
      
      <Box display="flex" alignItems="center" gap={1} color="rgba(255,255,255,0.7)">
        {icon}<Typography variant="body2">{label}</Typography>
      </Box>
      
      <Typography sx={{ transition: "all 0.3s ease", ...(isValue2Winner ? winnerStyle : defaultStyle) }}>
        {formatNumber(v2)}{unit}
      </Typography>
    </Box>
  );
};

const MotionBox = motion(Box);

const AnimatedDialogPaper = forwardRef((props, ref) => (
  <MotionBox
    ref={ref}
    initial={{ y: 30, opacity: 0 }}
    animate={{
      y: 0,
      opacity: 1,
      boxShadow: ["0px 10px 80px rgba(255, 0, 212, 0.6)", "0px 10px 40px rgba(0,0,0,0.7)"],
      transition: {
        type: "spring", damping: 25, stiffness: 200,
        boxShadow: { duration: 0.8, ease: "easeInOut" }
      }
    }}
    exit={{
      y: 30,
      opacity: 0,
      transition: { duration: 0.2 }
    }}
    sx={{
      borderRadius: "24px",
      background: "linear-gradient(145deg, #1806319b, #0f021f91)",
      border: "1px solid rgba(255,255,255,0.2)",
      color: "white",
      backdropFilter: "blur(10px)",
      overflow: "hidden",
    }}
    {...props}
  />
));

const Influenciadores = () => {
  const [influencers, setInfluencers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filtros
  const [search, setSearch] = useState("");
  const [categoria, setCategoria] = useState("");
  const [inputValueCategoria, setInputValueCategoria] = useState("");
  const [plataforma, setPlataforma] = useState("");
 const [seguidores, setSeguidores] = useState([0, MAX_FOLLOWERS]); // Slider em Milhões
  const [avaliacao, setAvaliacao] = useState(0);
  const [tagsSelecionadas, setTagsSelecionadas] = useState([]);
  const [searchTag, setSearchTag] = useState("");
  const [showAllTags, setShowAllTags] = useState(false);
  
  // Controle de Comparação e Ocultos
  const [influencersParaComparar, setInfluencersParaComparar] = useState([]);
  const [ocultos, setOcultos] = useState([]);

  // Buscar influenciadores do backend
  useEffect(() => {
    const fetchInfluencers = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        
        const response = await fetch('http://localhost:5001/api/influencers/all', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Erro ao buscar influenciadores');
        }

        const data = await response.json();
        
        const transformedData = data.map(inf => {
            const socialObj = inf.social || {};
            const redesArray = Object.keys(socialObj)
                .filter(key => socialObj[key])
                .map(key => key.toLowerCase());

            // Garante que stats existam mesmo se vierem vazios
            const rawStats = inf.aggregatedStats || {};
            
            const stats = { 
                followers: rawStats.followers || inf.followersCount || 0, 
                views: rawStats.views || inf.views || 0, 
                likes: rawStats.likes || inf.curtidas || 0, 
                engagementRate: rawStats.engagementRate || inf.engagementRate || 0 
            };

            return {
              id: inf._id,
              _id: inf._id,
              name: inf.name,
              realName: inf.realName,
              profileImageUrl: inf.profileImageUrl || '/default-avatar.png',
              backgroundImageUrl: inf.backgroundImageUrl || '',
              niches: inf.niches || [],
              social: socialObj,
              redes: redesArray, 
              description: inf.description || '',
              tags: inf.tags || [], 
              // Usa exatamente a mesma lógica que o InfluencerCard usa
              avaliacao: inf.avaliacao || 0,
              aggregatedStats: stats,
              isVerified: inf.isVerified || false // ✅ Carrega o status de verificação
            };
        });

        setInfluencers(transformedData);
        setError(null);
      } catch (err) {
        console.error('Erro ao buscar influenciadores:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchInfluencers();
  }, []);

  const handleOcultar = (id) => {
    setOcultos((prev) => [...prev, id]);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 120 }},
  };

  const todasCategorias = useMemo(() => {
    return Array.from(new Set(influencers.flatMap((inf) => inf.niches || [])));
  }, [influencers]);

  const todasTags = useMemo(() => {
    return Array.from(new Set(influencers.flatMap((inf) => inf.tags || [])));
  }, [influencers]);


  const handleSelecionarParaComparar = (influencer) => {
    setInfluencersParaComparar((prev) => {
      const jaSelecionado = prev.find((inf) => inf.id === influencer.id);
      if (jaSelecionado) return prev.filter((inf) => inf.id !== influencer.id);
      if (prev.length < 2) return [...prev, influencer];
       return [prev[1], influencer];
    });
  };

  const handleFecharComparacao = () => {
    setInfluencersParaComparar([]);
  };

  const filtrados = useMemo(() => {
    // 1. Filtragem Padrão
    const listaFiltrada = influencers.filter((inf) => {
      // Usa o stats corrigido
      const seguidoresReais = inf.aggregatedStats.followers || 0;
      const seguidoresEmMil = seguidoresReais / 1000;
      
      const matchPlataforma = plataforma 
        ? (inf.redes && inf.redes.includes(plataforma.toLowerCase())) 
        : true;

      return (
        !ocultos.includes(inf._id) &&
        inf.name.toLowerCase().includes(search.toLowerCase()) &&
        (categoria ? inf.niches.includes(categoria) : true) &&
        matchPlataforma &&
        seguidoresEmMil >= seguidores[0] && 
        seguidoresEmMil <= seguidores[1] && 
        inf.avaliacao >= avaliacao &&
        (tagsSelecionadas.length > 0
          ? tagsSelecionadas.every((tag) => inf.tags.includes(tag))
          : true)
      );
    });

    // 2. ✅ ORDENAÇÃO: VERIFICADOS NO TOPO, NÃO VERIFICADOS NO "FUNDÃO"
    return listaFiltrada.sort((a, b) => {
        // Converte booleano para número (true = 1, false = 0)
        const verifiedA = a.isVerified ? 1 : 0;
        const verifiedB = b.isVerified ? 1 : 0;
        
        // Ordena decrescente (1 vem antes de 0)
        return verifiedB - verifiedA;
    });

  }, [influencers, search, categoria, plataforma, seguidores, avaliacao, tagsSelecionadas, ocultos]);

  const inf1 = influencersParaComparar[0];
  const inf2 = influencersParaComparar[1];

  return (
     <Fade in={true} timeout={800}>
    <Box ml="25px">
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Header title="Pesquisa" subtitle="De influenciadores" />
      </Box>

      <Box
        height="calc(100vh - 120px)"
        overflow="auto"
        sx={{
          overflowY: "auto", transition: "all 0.3s ease-in-out", "&::-webkit-scrollbar": { width: "10px" }, "&::-webkit-scrollbar-track": { background: "rgba(255, 255, 255, 0.1)", borderRadius: "10px", }, "&::-webkit-scrollbar-thumb": { background: "rgba(255, 255, 255, 0.3)", borderRadius: "10px", }, "&::-webkit-scrollbar-thumb:hover": { background: "rgba(255, 255, 255, 0.6)", },
        }}
      >
        <Box display="flex" p={2} gap={2}>
          {/* Sidebar de Filtros */}
          <Box
            flex="0 0 22vw" p={3} borderRadius="24px"
            sx={{
              background: "linear-gradient(180deg, rgba(18, 18, 42, 0.76) 0%, rgba(10, 10, 25, 0.6) 100%)", backdropFilter: "blur(12px)", color: "white", height: "70vh", position: "sticky", top: "20px", alignSelf: "flex-start", boxShadow: "0 8px 20px rgba(0,0,0,0.4)", display: "flex", flexDirection: "column",
            }}
          >
            <Typography variant="h5" fontWeight="bold" mb={2}> Filtros avançados </Typography>
            <Box sx={{ flex: 1, overflowY: "auto", overflowX: "visible", width: "100%", pr: 5, "&::-webkit-scrollbar": { width: "6px" }, "&::-webkit-scrollbar-track": { background: "rgba(255, 255, 255, 0.1)", borderRadius: "10px", }, "&::-webkit-scrollbar-thumb": { background: "rgba(255, 255, 255, 0.3)", borderRadius: "10px", }, }} >
              
              <Typography variant="body2" fontWeight="500"> Nome </Typography>
              <TextField 
                fullWidth size="small" placeholder="Buscar por nome..." 
                value={search} onChange={(e) => setSearch(e.target.value)} 
                sx={{ mb: 2, mt: 0.5, bgcolor: "rgba(255,255,255,0.1)", borderRadius: "10px", "& .MuiOutlinedInput-input": { color: "white" }, "& fieldset": { border: "none" } }} 
              />

              <Typography variant="body2" fontWeight="500"> Categoria </Typography>
              <Autocomplete
                options={todasCategorias} value={categoria || null} onChange={(_, newValue) => setCategoria(newValue || "")} inputValue={inputValueCategoria} onInputChange={(_, newInputValue) => { setInputValueCategoria(newInputValue); }}
                renderInput={(params) => (<TextField {...params} placeholder="Todas" size="small" sx={{ mb: 2, mt: 0.5, bgcolor: "rgba(255,255,255,0.1)", borderRadius: "10px", "& .MuiOutlinedInput-input": { color: "white" }, "& fieldset": { border: "none" }, "& svg": { color: "white" }, }} />)}
                sx={{ "& .MuiAutocomplete-popupIndicator": { color: "white" }, "& .MuiAutocomplete-clearIndicator": { color: "white" }, }} freeSolo
              />
              <Typography variant="body2" fontWeight="500"> Plataforma </Typography>
              <TextField fullWidth size="small" select value={plataforma} onChange={(e) => setPlataforma(e.target.value)} SelectProps={{ native: true }} sx={{ mb: 2, mt: 0.5, bgcolor: "rgba(255,255,255,0.1)", borderRadius: "10px", "& .MuiOutlinedInput-input": { color: "white" }, "& fieldset": { border: "none" }, "& svg": { color: "white" }, }}>
                <option value="">Todas</option> <option value="youtube">YouTube</option> <option value="twitch">Twitch</option> <option value="instagram">Instagram</option> <option value="tiktok">TikTok</option>
              </TextField>
           <Typography variant="body2" fontWeight="500" mb={1}> Faixa de Seguidores </Typography>
              <Slider 
                value={seguidores} 
                onChange={(_, v) => setSeguidores(v)} 
                valueLabelDisplay="auto" 
                valueLabelFormat={formatLabel} // ✅ Usa a formatação K / M / B
                min={0} 
                max={MAX_FOLLOWERS} // ✅ Vai até 1 Bilhão
                step={10} // Passo de 10k para ficar mais fluido
                sx={{ 
                  marginLeft: "10px", 
                  mb: 2, 
                  color: "#ff00d4", 
                  "& .MuiSlider-thumb": { bgcolor: "white", border: "2px solid #ff00d4" }, 
                  "& .MuiSlider-track": { bgcolor: "#ff00d4" } 
                }} 
              />
              <Typography variant="body2" fontWeight="500" mt={1}> Avaliação mínima </Typography>
              <Rating value={avaliacao} onChange={(_, v) => setAvaliacao(v)} precision={0.5} sx={{ mb: 2, "& .MuiRating-iconFilled": { color: "gold" }, "& .MuiRating-iconEmpty": { color: "rgba(255,255,255,0.3)" }, }} />
              <Typography variant="body2" fontWeight="500" mb={1}> Tags </Typography>
              <TextField fullWidth size="small" placeholder="Buscar tag..." value={searchTag} onChange={(e) => setSearchTag(e.target.value)} sx={{ mb: 1, bgcolor: "rgba(255,255,255,0.1)", borderRadius: "10px", "& .MuiOutlinedInput-input": { color: "white", fontSize: "0.85rem" }, "& fieldset": { border: "none" }, }} />
              <Box display="flex" flexWrap="wrap" gap={1} mb={1}>
                {(showAllTags ? todasTags : todasTags.slice(0, 5) ).filter((tag) => tag.toLowerCase().includes(searchTag.toLowerCase())) .map((tag, idx) => (<Chip key={idx} label={tag} size="small" onClick={() => setTagsSelecionadas((prev) => prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag] )} sx={{ bgcolor: tagsSelecionadas.includes(tag) ? "#ff00d4" : "rgba(255,255,255,0.1)", color: "white", borderRadius: "10px", cursor: "pointer", "&:hover": { bgcolor: "rgba(255,255,255,0.2)" }, }} /> ))}
              </Box>
              {todasTags.length > 5 && (<Button onClick={() => setShowAllTags(!showAllTags)} size="small" variant="contained" fullWidth sx={{ mb: 2, color: "white", textTransform: "none", backgroundColor: "rgba(255,255,255,0.1)", alignContent: "center", alignItems: "center", justifyContent: "center", transition: "all 0.3s ease-in-out", borderRadius: "10px", fontSize: "0.8rem", "&:hover": { bgcolor: "rgba(255, 255, 255, 0.28)" }, }}> {showAllTags ? "Ver menos" : "Ver mais"} </Button> )}
            </Box>
            <Button variant="contained" fullWidth onClick={() => { setCategoria(""); setInputValueCategoria(""); setPlataforma(""); setSeguidores([0, 100]); setAvaliacao(0); setTagsSelecionadas([]); setSearchTag(""); setSearch(""); }} sx={{ mt: 2, borderRadius: "12px", bgcolor: "#ff00ae5b", textTransform: "none", backdropFilter: "blur(10px)", transition: "all 0.3s ease-in-out", fontWeight: "600", "&:hover": { bgcolor: "#ff00a679", fontSize: "0.8rem" ,}, }}>
              Limpar Filtros
            </Button>
          </Box>
          {/* Lista de Influenciadores */}
    <Box component={motion.div} key={filtrados.map(f => f.id).join('-')} variants={containerVariants} initial="hidden" animate="visible" flex={1} display="grid" gridTemplateColumns="repeat(auto-fill, minmax(350px, 1fr))" gap={4} pl={3} pb={20} sx={{ justifyContent: 'flex-start', alignContent: 'flex-start' }}>
              {loading ? (
                [...Array(8)].map((_, index) => (
                  <motion.div key={index} variants={itemVariants}>
                    <Skeleton variant="rectangular" animation="wave" width="100%" height={450} sx={{ borderRadius: "24px", bgcolor: 'rgba(255,255,255,0.1)' }} />
                  </motion.div>
                ))
              ) : error ? (
                <Typography variant="h4" color="error" textAlign="center" gridColumn="1/-1">
                  Erro ao carregar: {error}
                </Typography>
              ) : filtrados.length > 0 ? (
                filtrados.map((inf) => (
                  <motion.div key={inf.id} variants={itemVariants}>
                    <InfluencerCard
                      influencer={inf}
                      onCompararClick={() => handleSelecionarParaComparar(inf)}
                      estaSelecionado={influencersParaComparar.some((i) => i.id === inf.id)}
                      onOcultar={handleOcultar}
                    />
                  </motion.div>
                ))
              ) : (
                <Typography variant="h3" fontWeight="bold" color="white" textAlign="center" gridColumn="1/-1">
                  Nenhum influenciador encontrado
                </Typography>
              )}
            </Box>
          </Box>
        </Box>
      
      <AnimatePresence>
        {influencersParaComparar.length === 2 && (
          <Dialog
            open={true}
            onClose={handleFecharComparacao}
            PaperComponent={AnimatedDialogPaper}
            maxWidth="lg"
          >
            <IconButton onClick={handleFecharComparacao} sx={{ position: "absolute", right: 12, top: 12, color: "white", zIndex: 10 }}>
              <CloseIcon />
            </IconButton>
            {inf1 && inf2 && (
              <DialogContent sx={{ p: 0, position: "relative" }}>
                <Box display="flex" alignItems="stretch" sx={{ overflow: 'hidden' }}>
                  {/* ESQUERDA (Inf 1) */}
                  <Box flex={1} p={4} display="flex" flexDirection="column" alignItems="center" gap={1.5}>
                    <Avatar src={inf1.profileImageUrl} sx={{ width: 140, height: 140, border: "4px solid white", mb: 1 }} />
                    <Box display="flex" alignItems="center" gap={1}>
                        <Typography variant="h4" fontWeight="bold" textAlign="center">{inf1.name}</Typography>
                        {inf1.isVerified && <Verified sx={{ color: "#00d4ff" }} />}
                    </Box>
                    <Typography variant="body1" color="rgba(255,255,255,0.7)" textAlign="center">{inf1.realName}</Typography>
                    <Box display="flex" gap={1.5} mt={1}>
                      {inf1.redes?.includes("tiktok") && <MusicNoteIcon />}
                      {inf1.redes?.includes("twitch") && <SiTwitch style={{ fontSize: 22 }} />}
                      {inf1.redes?.includes("instagram") && <InstagramIcon />}
                      {inf1.redes?.includes("youtube") && <YouTubeIcon />}
                    </Box>
                  </Box>

                  {/* MEIO (VS) */}
                  <Box display="flex" alignItems="center" px={2}>
                    <Box display="flex" alignItems="center" justifyContent="center" sx={{ width: 80, height: 80, borderRadius: '50%', background: '#ffffff0b', color: 'white', border: '3px solid white', boxShadow: '0 0 25px #ff00d4', zIndex: 5 }}>
                      <Typography variant="h4" fontWeight="900" sx={{ textShadow: '0 0 5px rgba(0,0,0,0.5)'}}>VS</Typography>
                    </Box>
                  </Box>

                  {/* DIREITA (Inf 2) */}
                  <Box flex={1} p={4} display="flex" flexDirection="column" alignItems="center" gap={1.5}>
                    <Avatar src={inf2.profileImageUrl} sx={{ width: 140, height: 140, border: "4px solid white", mb: 1 }} />
                    <Box display="flex" alignItems="center" gap={1}>
                        <Typography variant="h4" fontWeight="bold" textAlign="center">{inf2.name}</Typography>
                        {inf2.isVerified && <Verified sx={{ color: "#00d4ff" }} />}
                    </Box>
                    <Typography variant="body1" color="rgba(255,255,255,0.7)" textAlign="center">{inf2.realName}</Typography>
                    <Box display="flex" gap={1.5} mt={1}>
                      {inf2.redes?.includes("tiktok") && <MusicNoteIcon />}
                      {inf2.redes?.includes("twitch") && <SiTwitch style={{ fontSize: 22 }} />}
                      {inf2.redes?.includes("instagram") && <InstagramIcon />}
                      {inf2.redes?.includes("youtube") && <YouTubeIcon />}
                    </Box>
                  </Box>
                </Box>

                {/* ESTATÍSTICAS COMPARATIVAS */}
                <Box px={5} pb={4} mt={-2}>
                  <StatComparator icon={<Favorite />} label="Curtidas" value1={inf1.aggregatedStats?.likes} value2={inf2.aggregatedStats?.likes} />
                  <StatComparator icon={<Visibility />} label="Views" value1={inf1.aggregatedStats?.views} value2={inf2.aggregatedStats?.views} />
                  <StatComparator icon={<Groups />} label="Seguidores" value1={inf1.aggregatedStats?.followers} value2={inf2.aggregatedStats?.followers} />
                  
                  {/* CORREÇÃO AQUI: Agora usa inf.avaliacao direto */}
                  <StatComparator icon={<Star />} label="Avaliação" value1={inf1.avaliacao} value2={inf2.avaliacao} />
                  
                  {/* Barras de Engajamento Aumentadas */}
                <Box mt={3}>
                    {(() => {
                        // 10% de engajamento preenche 100% da barra (barras maiores)
                        const MAX_SCALE = 10; 

                        const rate1 = parseFloat(inf1.aggregatedStats?.engagementRate || 0);
                        const rate2 = parseFloat(inf2.aggregatedStats?.engagementRate || 0);
                        
                        const width1 = Math.min((rate1 / MAX_SCALE) * 100, 100);
                        const width2 = Math.min((rate2 / MAX_SCALE) * 100, 100);

                        return (
                          <>
                            <Box mb={2}>
                              <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                                <Typography variant="body2" fontWeight="bold">{inf1.name}</Typography>
                                <Typography variant="body2" fontWeight="bold" color="#ff00d4">{rate1.toFixed(2)}%</Typography>
                              </Box>
                              <Box sx={{ height: '12px', width: '100%', bgcolor: 'rgba(255,255,255,0.1)', borderRadius: '10px', overflow: 'hidden' }}>
                                <motion.div 
                                  initial={{ width: 0 }}
                                  animate={{ width: `${width1}%` }}
                                  transition={{ duration: 1, ease: "easeOut" }}
                                  style={{ height: '100%', background: '#ff00d4', borderRadius: '10px', boxShadow: '0 0 10px #ff00d4' }}
                                />
                              </Box>
                            </Box>

                            <Box>
                              <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                                <Typography variant="body2" fontWeight="bold">{inf2.name}</Typography>
                                <Typography variant="body2" fontWeight="bold" color="#00ff95">{rate2.toFixed(2)}%</Typography>
                              </Box>
                              <Box sx={{ height: '12px', width: '100%', bgcolor: 'rgba(255,255,255,0.1)', borderRadius: '10px', overflow: 'hidden' }}>
                                <motion.div 
                                  initial={{ width: 0 }}
                                  animate={{ width: `${width2}%` }}
                                  transition={{ duration: 1, ease: "easeOut" }}
                                  style={{ height: '100%', background: '#00ff95', borderRadius: '10px', boxShadow: '0 0 10px #00ff95' }}
                                />
                              </Box>
                            </Box>
                            
                            <Typography variant="caption" color="rgba(255,255,255,0.4)" display="block" textAlign="center" mt={1}>
                              *Escala de engajamento baseada em {MAX_SCALE}%
                            </Typography>
                          </>
                        );
                    })()}
                  </Box>
                </Box>
              </DialogContent>
            )}
          </Dialog>
        )}
      </AnimatePresence>
    </Box>
    </Fade>
  );
};

export default Influenciadores;
