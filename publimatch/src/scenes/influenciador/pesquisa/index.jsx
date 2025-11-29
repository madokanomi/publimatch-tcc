import {
  Box, Typography, TextField, Slider, Button, Chip, Rating, Dialog,
  DialogContent, Avatar, IconButton, Fade, Skeleton
} from "@mui/material";
import { forwardRef, useMemo, useState, useEffect } from "react";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import Header from "../../../components/Header";
import InfluencerCard from "../../../components/InfluencerCard";
import { influencers } from "../../../data/mockInfluencer";
import { Autocomplete } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { Star, Favorite, Visibility, Groups } from "@mui/icons-material";
import { SiTwitch } from "react-icons/si";
import YouTubeIcon from "@mui/icons-material/YouTube";
import InstagramIcon from "@mui/icons-material/Instagram";
import MusicNoteIcon from "@mui/icons-material/MusicNote";
import axios from 'axios';
import { motion, AnimatePresence } from "framer-motion";

// Componente auxiliar (sem alterações)
const StatComparator = ({ icon, label, value1, value2, unit = "" }) => {
  const isValue1Winner = value1 > value2;
  const isValue2Winner = value2 > value1;
  const winnerStyle = { color: "#00ff95", fontWeight: "bold", transform: "scale(1.1)" };
  const defaultStyle = { color: "white" };
  return (
    <Box display="flex" justifyContent="space-between" alignItems="center" width="100%" py={1.5} px={2} my={0.5} sx={{ background: "rgba(0,0,0,0.2)", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.1)" }}>
      <Typography sx={{ transition: "all 0.3s ease", ...(isValue1Winner ? winnerStyle : defaultStyle) }}>{value1}{unit}</Typography>
      <Box display="flex" alignItems="center" gap={1} color="rgba(255,255,255,0.7)">{icon}<Typography variant="body2">{label}</Typography></Box>
      <Typography sx={{ transition: "all 0.3s ease", ...(isValue2Winner ? winnerStyle : defaultStyle) }}>{value2}{unit}</Typography>
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
  const [search, setSearch] = useState("");
  const [categoria, setCategoria] = useState("");
  const [inputValueCategoria, setInputValueCategoria] = useState("");
  const [plataforma, setPlataforma] = useState("");
  const [seguidores, setSeguidores] = useState([0, 100]);
  const [avaliacao, setAvaliacao] = useState(0);
  const [tagsSelecionadas, setTagsSelecionadas] = useState([]);
  const [searchTag, setSearchTag] = useState("");
  const [showAllTags, setShowAllTags] = useState(false);
  const [influencersParaComparar, setInfluencersParaComparar] = useState([]);
  const [ocultos, setOcultos] = useState([]);

  // Buscar influenciadores do backend
  useEffect(() => {
     const fetchInfluencers = async () => {
      try {
        setLoading(true);
        
        // A busca de 'todos' pode não precisar de token, mas é boa prática enviar
        // caso a rota se torne protegida no futuro.
const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        
        // 🎯 AQUI ESTÁ A MUDANÇA PRINCIPAL: Usar a rota '/api/influencers/all'
        const response = await fetch('/api/influencers/all', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          // Tenta ler a mensagem de erro do backend, se houver
          const errorData = await response.json().catch(() => ({ message: 'Erro ao buscar influenciadores' }));
          throw new Error(errorData.message || 'Erro de rede');
        }


        const data = await response.json();
        
        // Transformar dados do backend para o formato esperado pelo frontend
        const transformedData = data.map(inf => {
            // Se o backend não fornecer esses dados, podemos simular ou deixar 0.
            // O ideal é que o backend envie esses valores.
            const followersInMillions = (inf.followersCount || 0) / 1000000;
            const engagement = parseFloat(inf.engagementRate || 0);
            
    
               const randomFollowers = parseFloat((Math.random() * (50 - 0.1) + 0.1).toFixed(1));
            const randomEngagement = parseFloat((Math.random() * (100 - 0.5) + 0.5).toFixed(1));
            const randomAvaliacao = parseFloat((Math.random() * (5 - 3.5) + 3.5).toFixed(1));
            
   
            const randomViews = parseFloat((randomFollowers * (Math.random() * 3 + 0.5)).toFixed(1));
            const randomInscritos = parseFloat((randomFollowers * (Math.random() * 0.9 + 0.2)).toFixed(1));
    
            const randomLikes = parseFloat((randomFollowers * (Math.random() * 0.7 + 0.1)).toFixed(1));
          
            return {
              // --- Dados diretos do Backend ---
         id: inf._id,
        _id: inf._id,
        name: inf.name,
        realName: inf.realName,
        profileImageUrl: inf.profileImageUrl || '/default-avatar.png',
        backgroundImageUrl: inf.backgroundImageUrl || '',
        niches: inf.niches || [],
        social: inf.social || {},
        description: inf.description || '',
        
        // AQUI: Usamos as Top 3 Tags calculadas no controller
        tags: inf.topTags || [], 

        // AQUI: Usamos a avaliação real calculada no controller
        avaliacao: inf.calculatedRating || 0,

        // --- Dados Simulados (pois o backend ainda não tem integração com API do youtube/insta para isso) ---
        followersCount: randomFollowers,
        engagementRate: 4.5, // Exemplo fixo ou random
        views: 1.2,
        inscritos: 0.5,
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
  console.log("Recalculando categorias...");
 return Array.from(new Set(influencers.flatMap((inf) => inf.niches)));
}, [influencers]);


 const todasTags = useMemo(() => {
  console.log("Recalculando tags...");
  return Array.from(new Set(influencers.flatMap((inf) => inf.tags)));
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
  console.log("REFILTRANDO A LISTA de", influencers.length, "influenciadores...");
  return influencers.filter((inf) => {
    // ✅ CORREÇÃO: Acessar 'followersCount' diretamente, sem parseFloat
    const seg = inf.followersCount; 
    return (
      !ocultos.includes(inf._id) && // Usar _id que vem do backend
      inf.name.toLowerCase().includes(search.toLowerCase()) && // Usar 'name'
      (categoria ? inf.niches.includes(categoria) : true) && // Usar 'niches'
      // O filtro de plataforma precisa de uma correção para verificar o objeto 'social'
      (plataforma ? inf.social[plataforma] : true) &&
      seg >= seguidores[0] &&
      seg <= seguidores[1] &&
      inf.avaliacao >= avaliacao &&
      (tagsSelecionadas.length > 0
        ? tagsSelecionadas.every((tag) => inf.tags.includes(tag))
        : true)
    );
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
              <Typography variant="body2" fontWeight="500" mb={1}> Faixa de Seguidores (milhões) </Typography>
              <Slider value={seguidores} onChange={(_, v) => setSeguidores(v)} valueLabelDisplay="auto" min={0} max={100} sx={{ marginLeft: "10px", mb: 2, color: "#ff00d4", "& .MuiSlider-thumb": { bgcolor: "white", border: "2px solid #ff00d4", }, "& .MuiSlider-track": { bgcolor: "#ff00d4" }, }} />
              <Typography variant="body2" fontWeight="500" mt={1}> Avaliação mínima </Typography>
              <Rating value={avaliacao} onChange={(_, v) => setAvaliacao(v)} precision={0.5} sx={{ mb: 2, "& .MuiRating-iconFilled": { color: "gold" }, "& .MuiRating-iconEmpty": { color: "rgba(255,255,255,0.3)" }, }} />
              <Typography variant="body2" fontWeight="500" mb={1}> Tags </Typography>
              <TextField fullWidth size="small" placeholder="Buscar tag..." value={searchTag} onChange={(e) => setSearchTag(e.target.value)} sx={{ mb: 1, bgcolor: "rgba(255,255,255,0.1)", borderRadius: "10px", "& .MuiOutlinedInput-input": { color: "white", fontSize: "0.85rem" }, "& fieldset": { border: "none" }, }} />
              <Box display="flex" flexWrap="wrap" gap={1} mb={1}>
                {(showAllTags ? todasTags : todasTags.slice(0, 5) ).filter((tag) => tag.toLowerCase().includes(searchTag.toLowerCase())) .map((tag, idx) => (<Chip key={idx} label={tag} size="small" onClick={() => setTagsSelecionadas((prev) => prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag] )} sx={{ bgcolor: tagsSelecionadas.includes(tag) ? "#ff00d4" : "rgba(255,255,255,0.1)", color: "white", borderRadius: "10px", cursor: "pointer", "&:hover": { bgcolor: "rgba(255,255,255,0.2)" }, }} /> ))}
              </Box>
              {todasTags.length > 5 && (<Button onClick={() => setShowAllTags(!showAllTags)} size="small" variant="contained" fullWidth sx={{ mb: 2, color: "white", textTransform: "none", backgroundColor: "rgba(255,255,255,0.1)", alignContent: "center", alignItems: "center", justifyContent: "center", transition: "all 0.3s ease-in-out", borderRadius: "10px", fontSize: "0.8rem", "&:hover": { bgcolor: "rgba(255, 255, 255, 0.28)" }, }}> {showAllTags ? "Ver menos" : "Ver mais"} </Button> )}
            </Box>
            <Button variant="contained" fullWidth onClick={() => { setCategoria(""); setInputValueCategoria(""); setPlataforma(""); setSeguidores([0, 100]); setAvaliacao(0); setTagsSelecionadas([]); setSearchTag(""); }} sx={{ mt: 2, borderRadius: "12px", bgcolor: "#ff00ae5b", textTransform: "none", backdropFilter: "blur(10px)", transition: "all 0.3s ease-in-out", fontWeight: "600", "&:hover": { bgcolor: "#ff00a679", fontSize: "0.8rem" ,}, }}>
              Limpar Filtros
            </Button>
          </Box>
          {/* Lista de Influenciadores */}
    <Box component={motion.div} key={filtrados.map(f => f.id).join('-')} variants={containerVariants} initial="hidden" animate="visible" flex={1} display="grid" gridTemplateColumns="repeat(auto-fill, minmax(350px, 1fr))" gap={4} pl={3} pb={20} sx={{ justifyContent: 'flex-start', alignContent: 'flex-start' }}>
              {loading ? (
                // Se estiver carregando, mostra 8 skeletons
                [...Array(8)].map((_, index) => (
                  <motion.div key={index} variants={itemVariants}>
                    <Skeleton variant="rectangular" animation="wave" width="100%" height={450} sx={{ borderRadius: "24px", bgcolor: 'rgba(255,255,255,0.1)' }} />
                  </motion.div>
                ))
              ) : error ? (
                // Se der erro, mostra a mensagem de erro
                <Typography variant="h4" color="error" textAlign="center" gridColumn="1/-1">
                  Erro ao carregar: {error}
                </Typography>
              ) : filtrados.length > 0 ? (
                // Se tiver dados, mostra os cards
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
                // Se não tiver dados (após carregar), mostra a mensagem de "não encontrado"
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
                  <Box flex={1} p={4} display="flex" flexDirection="column" alignItems="center" gap={1.5}>
                    <Avatar src={inf1.imagem} sx={{ width: 140, height: 140, border: "4px solid white", mb: 1 }} />
                    <Typography variant="h4" fontWeight="bold" textAlign="center">{inf1.nome}</Typography>
                    <Typography variant="body1" color="rgba(255,255,255,0.7)" textAlign="center">{inf1.nomeReal}</Typography>
                    <Box display="flex" gap={1.5} mt={1}>
                      {inf1.redes.includes("tiktok") && <MusicNoteIcon />} {inf1.redes.includes("twitch") && <SiTwitch style={{ fontSize: 22 }} />} {inf1.redes.includes("instagram") && <InstagramIcon />} {inf1.redes.includes("youtube") && <YouTubeIcon />}
                    </Box>
                  </Box>
                  <Box display="flex" alignItems="center" px={2}>
                    <Box display="flex" alignItems="center" justifyContent="center" sx={{ width: 80, height: 80, borderRadius: '50%', background: '#ffffff0b', color: 'white', border: '3px solid white', boxShadow: '0 0 25px #ff00d4', zIndex: 5 }}>
                      <Typography variant="h4" fontWeight="900" sx={{ textShadow: '0 0 5px rgba(0,0,0,0.5)'}}>VS</Typography>
                    </Box>
                  </Box>
                  <Box flex={1} p={4} display="flex" flexDirection="column" alignItems="center" gap={1.5}>
                    <Avatar src={inf2.imagem} sx={{ width: 140, height: 140, border: "4px solid white", mb: 1 }} />
                    <Typography variant="h4" fontWeight="bold" textAlign="center">{inf2.nome}</Typography>
                    <Typography variant="body1" color="rgba(255,255,255,0.7)" textAlign="center">{inf2.nomeReal}</Typography>
                    <Box display="flex" gap={1.5} mt={1}>
                      {inf2.redes.includes("tiktok") && <MusicNoteIcon />} {inf2.redes.includes("twitch") && <SiTwitch style={{ fontSize: 22 }} />} {inf2.redes.includes("instagram") && <InstagramIcon />} {inf2.redes.includes("youtube") && <YouTubeIcon />}
                    </Box>
                  </Box>
                </Box>
                <Box px={5} pb={4} mt={-2}>
                  <StatComparator icon={<Favorite />} label="Curtidas" value1={inf1.seguidores} value2={inf2.seguidores} unit="M" />
                  <StatComparator icon={<Visibility />} label="Views" value1={inf1.views} value2={inf2.views} unit="M" />
                  <StatComparator icon={<Groups />} label="Inscritos" value1={inf1.inscritos} value2={inf2.inscritos} unit="M" />
                  <StatComparator icon={<Star />} label="Avaliação" value1={inf1.avaliacao} value2={inf2.avaliacao} />
                  <Box mt={2}>
                    <Box>
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                        <Typography variant="body2" fontWeight="bold">{inf1.nome}</Typography>
                        <Typography variant="body2" fontWeight="bold" color="#ff00d4">{inf1.engajamento}%</Typography>
                      </Box>
                      <Box sx={{ height: '10px', width: '100%', bgcolor: 'rgba(255,255,255,0.1)', borderRadius: '10px' }}>
                        <Box sx={{ height: '100%', width: `${inf1.engajamento}%`, bgcolor: '#ff00d4', borderRadius: '10px', transition: 'width 0.5s ease-in-out', boxShadow: '0 0 10px #ff00d4' }}/>
                      </Box>
                    </Box>
                    <Box mt={2}>
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                        <Typography variant="body2" fontWeight="bold">{inf2.nome}</Typography>
                        <Typography variant="body2" fontWeight="bold" color="#00ff95">{inf2.engajamento}%</Typography>
                      </Box>
                      <Box sx={{ height: '10px', width: '100%', bgcolor: 'rgba(255,255,255,0.1)', borderRadius: '10px' }}>
                        <Box sx={{ height: '100%', width: `${inf2.engajamento}%`, bgcolor: '#00ff95', borderRadius: '10px', transition: 'width 0.5s ease-in-out', boxShadow: '0 0 10px #00ff95' }}/>
                      </Box>
                    </Box>
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