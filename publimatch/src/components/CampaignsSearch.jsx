// src/scenes/campaigns/CampaignsSearch.jsx

import React, { useState, useEffect, useMemo } from "react";
import {
     Box, Typography, TextField, InputAdornment, IconButton,
    FormControl, Select, MenuItem, Slider, FormGroup,
    FormControlLabel, Checkbox, Button, CircularProgress, Chip
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
// Importe o novo componente de linha e os ícones necessários
import CampaignSearchRow from "./CampaignSearchRow"; // Corrigido o caminho
import { influencers } from "../data/mockInfluencer"

import {
  FaYoutube,
  FaInstagram,
  FaTwitch,
  FaTwitter,
  FaTiktok,
} from "react-icons/fa";
import {
  Groups,
  Category,
  AccessTimeFilled,
  AutoFixHigh,
} from "@mui/icons-material";
import { useAuth } from "../auth/AuthContext";
import axios from "axios";

const allPlatforms = ["instagram", "youtube", "twitch", "tiktok", "twitter"];

const CampaignsSearch = () => {

  const allCategories = useMemo(() => {
    const categoriesSet = new Set();
    influencers.forEach(influencer => {
        influencer.categorias.forEach(category => {
            categoriesSet.add(category);
        });
    });
    return Array.from(categoriesSet).sort();
}, []);

  const { user } = useAuth();

  // Estados para a busca e os filtros
  const [searchTerm, setSearchTerm] = useState("");
const [filters, setFilters] = useState({
    categorias: [], 
    plataforma: "",
    faixaSeguidores: 0,
    faixaVisualizacoes: 0,
    vagasAbertas: false,
  });

  // Estados para os dados da API
  const [categorySearch, setCategorySearch] = useState('');
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Efeito que busca os dados na API sempre que a busca ou os filtros mudam
  useEffect(() => {
    if (!user) return;

    // Debounce: Aguarda 500ms após o usuário parar de digitar para fazer a busca
    const delayDebounceFn = setTimeout(() => {
      fetchCampaigns();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, filters, user]);


const fetchCampaigns = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append("title", searchTerm);
      if (filters.categorias.length > 0) params.append("category", filters.categorias[0]);
      if (filters.plataforma) params.append("platform", filters.plataforma);
      if (filters.faixaSeguidores > 0) params.append("minFollowers", filters.faixaSeguidores * 1000000);
      if (filters.faixaVisualizacoes > 0) params.append("minViews", filters.faixaVisualizacoes * 1000000);
      if (filters.vagasAbertas) params.append("openSlots", filters.vagasAbertas);
      

      const config = {
        headers: { Authorization: `Bearer ${user.token}` },
        params: params,
      };

      const { data } = await axios.get(
        "http://localhost:5001/api/campaigns/search",
        config
      );
      setCampaigns(data);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Erro ao buscar campanhas.");
      setCampaigns([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryClick = (category) => {
        setFilters((prev) => {
            const newCategories = prev.categorias.includes(category)
                ? prev.categorias.filter((c) => c !== category)
                : [...prev.categorias, category];
            return { ...prev, categorias: newCategories };
        });
    };

  // Handlers para os filtros
  const handleFilterChange = (event) => {
    const { name, value, checked, type } = event.target;
    setFilters((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSliderChange = (event, newValue) => {
    setFilters((prev) => ({ ...prev, faixaSeguidores: newValue }));
  };

  const handleViewsSliderChange = (event, newValue) => {
  setFilters((prev) => ({ ...prev, faixaVisualizacoes: newValue }));
};

const formatViewsValue = (value) => `${value}M`; 

const clearFilters = () => {
    setSearchTerm("");
    setCategorySearch("");
    setFilters({
      categoria: [],
      plataforma: "",
      faixaSeguidores: 0,
      faixaVisualizacoes: 0,
      vagasAbertas: false,
    });
  };

   const gridTemplate = "1.5fr 1fr 1fr 1fr 1fr 1fr";

  const formatSliderValue = (value) => `${value}M`;
  return (
    <Box
      sx={{
        height: "100%",
        p: 3,
        display: "flex",
        gap: 3,
        overflow: "hidden",
      }}
    >
      {/* Lado Esquerdo - Filtros Avançados */}
      <Box
        width="350px"
        flexShrink={0}
        p={3}
        borderRadius="24px"
        sx={{
          background:
            "linear-gradient(180deg, rgba(18, 18, 42, 0.76) 0%, rgba(10, 10, 25, 0.6) 100%)",
          backdropFilter: "blur(12px)",
          color: "white",
          height: "100%",
          position: "sticky",
          top: "20px",
          alignSelf: "flex-start",
          boxShadow: "0 8px 20px rgba(0,0,0,0.4)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Typography variant="h6" fontWeight="bold" mb={2}>
          Filtros avançados
        </Typography>
        <Box
          sx={{
            flex: 1,
            overflowY: "auto",
            overflowX: "hidden",
            width: "100%",
            pr: 1,
            "&::-webkit-scrollbar": {
              width: "6px",
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
          {/* Campos de filtro (mesmos do seu código) */}
<TextField
    fullWidth
    size="small"
    label="Buscar categoria..."
    value={categorySearch}
    onChange={(e) => setCategorySearch(e.target.value)}
    sx={{
        mb: 1.5,
        '& .MuiOutlinedInput-root': {
            borderRadius: "10px",
            backgroundColor: 'rgba(255,255,255,0.1)',
            '& fieldset': { borderColor: 'transparent' },
            '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
            '&.Mui-focused fieldset': { borderColor: '#BF28B0' },
        },
        '& .MuiInputBase-input': { color: 'white' },
        '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.5)' },
        '& .MuiInputLabel-root.Mui-focused': { color: '#BF28B0' },
    }}
/>
<Box display="flex" flexWrap="wrap" gap={1} sx={{ mb: 2 }}>
    {allCategories
        .filter((cat) => cat.toLowerCase().includes(categorySearch.toLowerCase()))
        .slice(0, 3)
        .map((category) => (
            <Chip
                key={category}
    label={category}
    onClick={() => handleCategoryClick(category)}
    sx={{
        backgroundColor: filters.categorias.includes(category) ? '#BF28B0' : 'rgba(255,255,255,0.1)',
        color: 'white',
        fontWeight: 'bold',
        borderRadius: '8px',
        '&:hover': {
            backgroundColor: filters.categorias.includes(category) ? '#a9239d' : 'rgba(255,255,255,0.2)',
        }
    }}
            />
        ))
    }
</Box>

          <Typography variant="body2" fontWeight="500">
            Plataforma
          </Typography>
          <TextField
            fullWidth
            size="small"
            select
            name="plataforma"
            value={filters.plataforma}
            onChange={handleFilterChange}
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
            {allPlatforms.map((platform) => (
              <option key={platform} value={platform}>
                {platform.charAt(0).toUpperCase() + platform.slice(1)}
              </option>
            ))}
          </TextField>

          <Typography variant="body2" fontWeight="500" mb={1}>
            Mínimo de seguidores (milhões)
          </Typography>
          <Box sx={{ width: "calc(100% - 20px)", ml: "10px" }}>
            <Slider
                           value={filters.faixaSeguidores} 
              onChange={handleSliderChange}
              valueLabelDisplay="auto"
              valueLabelFormat={formatSliderValue}
              min={0}
              max={50}
              step={1}
              sx={{
                color: "#ff00d4",
                "& .MuiSlider-thumb": {
                  bgcolor: "white",
                  border: "2px solid #ff00d4",
                },
                "& .MuiSlider-track": { bgcolor: "#ff00d4" },
              }}
            />
          </Box>

          <Typography variant="body2" fontWeight="500" mb={1}>
  Mínimo de Visualizações (milhares)
</Typography>
<Box sx={{ width: "calc(100% - 20px)", ml: "10px" }}>
  <Slider
    value={filters.faixaVisualizacoes} 
    onChange={handleViewsSliderChange} // Nova função
    valueLabelDisplay="auto"
    valueLabelFormat={formatViewsValue} // Nova função
    min={0}
    max={50} // Ex: de 0 a 1000k (1 milhão) de views
    step={1}  // Pulos de 10k
    sx={{
        color: "#ff00d4",
        "& .MuiSlider-thumb": {
            bgcolor: "white",
            border: "2px solid #ff00d4",
        },
        "& .MuiSlider-track": { bgcolor: "#ff00d4" },
    }}
  />
</Box>

          <FormGroup sx={{ mb: 2 }}>
            <FormControlLabel
              control={
                <Checkbox
                  name="vagasAbertas" // Adicionado
                  checked={filters.vagasAbertas} // Corrigido
                  onChange={handleFilterChange} // Corrigido
                  sx={{
                    color: "#ff00d4",
                    "&.Mui-checked": {
                      color: "#ff00d4",
                    },
                  }}
                />
              }
              label={
                <Typography variant="body2" fontWeight="500" color="white">
                  Vagas Abertas
                </Typography>
              }
            />
          </FormGroup>
        </Box>
        <Button
          variant="contained"
          fullWidth
          onClick={clearFilters}
          sx={{
            mt: 2,
            borderRadius: "12px",
            bgcolor: "#ff00ae5b",
            textTransform: "none",
            backdropFilter: "blur(10px)",
            transition: "all 0.3s ease-in-out",
            fontWeight: "600",
            color: "white",
            "&:hover": { bgcolor: "#ff00a679", fontSize: "0.8rem" },
          }}
        >
          Limpar Filtros
        </Button>
      </Box>

      {/* Lado Direito - Lista de Campanhas */}
      <Box
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Header da Tabela (Layout Simplificado) */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: gridTemplate,
            gap: 2,
            p: 2,
            borderBottom: "1px solid rgba(255,255,255,0.2)",
            fontWeight: "bold",
            fontSize: "0.9em",
            textTransform: "uppercase",
            textAlign: "left",
            mb: 2,
          }}
        >
          <Typography>Nome</Typography>
          <Typography>Data de Início</Typography>
          <Typography>Data de Término</Typography>
          <Typography>Categorias</Typography>
          <Typography>Vagas Abertas</Typography>
          <Typography>Redes Necessárias</Typography>
        </Box>

        <Box
          sx={{
            flexGrow: 1,
            overflowY: "auto",
            pr: 1,
            "&::-webkit-scrollbar": {
              width: "6px",
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
                {loading ? (
                        // 1. Mostra "carregando" enquanto busca
                        <Box display="flex" justifyContent="center" mt={4}><CircularProgress /></Box>
                    ) : error ? (
                        // 2. Mostra o erro se a API falhar
                        <Typography color="error" textAlign="center" mt={4}>{error}</Typography>
                    ) : campaigns.length > 0 ? (
                        // 3. Mostra os resultados se tudo der certo
                        campaigns.map((campaign) => (
                            <CampaignSearchRow key={campaign._id} campaign={campaign} />
                        ))
                    ) : (
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              height="100%"
            >
              <Typography color="rgba(255,255,255,0.6)">
                Nenhuma campanha encontrada.
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default CampaignsSearch;
