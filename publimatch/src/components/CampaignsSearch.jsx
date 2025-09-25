// src/scenes/campaigns/CampaignsSearch.jsx

import React, { useState, useEffect } from 'react';
import {
    Box, Typography, TextField, InputAdornment, IconButton, Paper,
    FormControl, InputLabel, Select, MenuItem, Slider, FormGroup,
    FormControlLabel, Checkbox, Button, CircularProgress, Chip, ListItemIcon
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
// Importe o novo componente de linha e os ícones necessários
import CampaignSearchRow from './CampaignSearchRow'; // Corrigido o caminho
import { allCampaigns } from './CampaignsTable'; // Corrigido o caminho
import { FaYoutube, FaInstagram, FaTwitch, FaTwitter, FaTiktok } from 'react-icons/fa';
import { Groups, Category, AccessTimeFilled, AutoFixHigh } from '@mui/icons-material';

const CampaignsSearch = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredCampaigns, setFilteredCampaigns] = useState([]);
    const [allCampaignsData, setAllCampaignsData] = useState(allCampaigns);
    const [filters, setFilters] = useState({
        categoria: "",
        plataforma: "",
        faixaSeguidores: [0, 50],
        vagasAbertas: false,
    });

    const fetchCampaigns = () => {
        const storedData = localStorage.getItem('campaigns_data');
        if (storedData) {
            const data = JSON.parse(storedData);
            const currentTime = new Date().getTime();
            if (currentTime - data.timestamp < 2 * 60 * 1000) {
                return data.campaigns;
            } else {
                localStorage.removeItem('campaigns_data');
                return allCampaigns;
            }
        }
        return allCampaigns;
    };

    useEffect(() => {
        const initialCampaigns = fetchCampaigns();
        setAllCampaignsData(initialCampaigns);
        setFilteredCampaigns(initialCampaigns);
    }, []);

    useEffect(() => {
        const applyFilters = () => {
            let tempCampaigns = allCampaignsData.filter((campaign) => {
                const matchesSearch = campaign.name
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase());
                const matchesCategory =
                    filters.categoria === "" ||
                    (campaign.categorias && campaign.categorias.includes(filters.categoria));
                const matchesPlatform =
                    filters.plataforma === "" ||
                    (campaign.redesNecessarias && campaign.redesNecessarias.includes(filters.plataforma));
                const matchesOpenings =
                    !filters.vagasAbertas ||
                    (filters.vagasAbertas && (campaign.applications > 0)); 
                const [min, max] = filters.faixaSeguidores;
                const matchesFollowers = true;
                
                return (
                    matchesSearch &&
                    matchesCategory &&
                    matchesPlatform &&
                    matchesOpenings &&
                    matchesFollowers
                );
            });
            setFilteredCampaigns(tempCampaigns);
        };
        applyFilters();
    }, [searchTerm, filters, allCampaignsData]);

    const allCategories = [...new Set(allCampaignsData.flatMap((c) => c.categorias || []))]; // Adicionado || [] para evitar erro
    const allPlatforms = [
        ...new Set(allCampaignsData.flatMap((c) => c.redesNecessarias || [])),
    ];

    const handleFilterChange = (event) => {
        const { name, value } = event.target;
        setFilters((prevFilters) => ({ ...prevFilters, [name]: value }));
    };

    const handleSliderChange = (event, newValue) => {
        setFilters((prevFilters) => ({
            ...prevFilters,
            faixaSeguidores: newValue,
        }));
    };

    const handleCheckboxChange = (event) => {
        setFilters((prevFilters) => ({
            ...prevFilters,
            vagasAbertas: event.target.checked,
        }));
    };

    const clearFilters = () => {
        setFilters({
            categoria: "",
            plataforma: "",
            faixaSeguidores: [0, 50],
            vagasAbertas: false,
        });
        setSearchTerm("");
    };

    const formatSliderValue = (value) => {
        return value === 50 ? "50M+" : `${value}M`;
    };

    // NOVO gridTemplate: Adicionada uma coluna para a data de início
    const gridTemplate = "1.5fr 1fr 1fr 1fr 1fr 1fr";

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
                                    checked={filters.vagasAbertas}
                                    onChange={handleCheckboxChange}
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
                    {filteredCampaigns.length > 0 ? (
                        filteredCampaigns.map((campaign) => (
                            <CampaignSearchRow
                                key={campaign.id}
                                campaign={campaign}
                            />
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