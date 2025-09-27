// src/scenes/campaigns/CampaignsSearch.jsx

import React, { useState, useEffect } from "react";
import {
     Box, Typography, TextField, InputAdornment, IconButton,
    FormControl, Select, MenuItem, Slider, FormGroup,
    FormControlLabel, Checkbox, Button, CircularProgress
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
// Importe o novo componente de linha e os ícones necessários
import CampaignSearchRow from "./CampaignSearchRow"; // Corrigido o caminho

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
const allCategories = [
  "Comida",
  "Jogos",
  "Lifestyle",
  "Família",
  "Entretenimento",
  "Vlogs",
  "Comédia",
  "Música",
  "Terror",
  "Arte",
  "Livros",
  "Automóveis",
  "Tecnologia",
  "Luxo",
  "Saúde",
  "Fitness",
];
const allPlatforms = ["instagram", "youtube", "twitch", "tiktok", "twitter"];

const CampaignsSearch = () => {
  const { user } = useAuth();

  // Estados para a busca e os filtros
  const [searchTerm, setSearchTerm] = useState("");
const [filters, setFilters] = useState({
    categoria: "",
    plataforma: "",
    faixaSeguidores: 0,
    vagasAbertas: false,
  });

  // Estados para os dados da API
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
      if (filters.categoria) params.append("category", filters.categoria);
      if (filters.plataforma) params.append("platform", filters.plataforma);
      if (filters.faixaSeguidores > 0) params.append("minFollowers", filters.faixaSeguidores);
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


  // Handlers para os filtros
  const handleFilterChange = (event) => {
    const { name, value, checked, type } = event.target;
    setFilters((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSliderChange = (event, newValue) => {
    setFilters((prev) => ({ ...prev, minFollowers: newValue }));
  };

const clearFilters = () => {
    setSearchTerm("");
    setFilters({
      categoria: "",
      plataforma: "",
      faixaSeguidores: 0,
      vagasAbertas: false,
    });
  };

   const gridTemplate = "1.5fr 1fr 1fr 1fr 1fr 1fr";

  const formatSliderValue = (value) => `${value}k`;
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
          <Typography variant="body2" fontWeight="500">
            Categoria
          </Typography>
          <TextField
            fullWidth
            size="small"
            select
            name="categoria"
            value={filters.categoria}
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
            {allCategories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </TextField>

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
            Faixa de Seguidores (milhões)
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
