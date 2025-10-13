// src/scenes/campaigns/CampaignsSearch.jsx

import React, { useState, useEffect, useMemo } from "react";
import {
    Box, Typography, TextField, Slider, FormGroup,
    FormControlLabel, Checkbox, Button, CircularProgress, Autocomplete, TableSortLabel
} from "@mui/material";
import CampaignSearchRow from "./CampaignSearchRow";
import { influencers } from "../data/mockInfluencer"
import { useAuth } from "../auth/AuthContext";
import axios from "axios";

const allPlatforms = ["instagram", "youtube", "twitch", "tiktok", "twitter"];

// Função para adicionar vagas aleatórias seguindo a regra especificada
const addRandomOpenSlots = (campaignsList) => {
    if (!campaignsList || campaignsList.length === 0) {
        return [];
    }

    const totalCampaigns = campaignsList.length;
    // Determina o número de campanhas que terão 0 vagas: 1 se houver poucas, senão 1 ou 2.
    const zerosToAssign = totalCampaigns <= 2 ? 1 : Math.floor(Math.random() * 2) + 1;

    // Cria uma cópia para não modificar o array original diretamente
    const campaignsCopy = [...campaignsList];
    
    // Embaralha o array para escolher aleatoriamente quais campanhas terão 0 vagas
    for (let i = campaignsCopy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [campaignsCopy[i], campaignsCopy[j]] = [campaignsCopy[j], campaignsCopy[i]];
    }

    // Associa os IDs das campanhas que terão 0 vagas
    const zeroSlotIds = new Set(campaignsCopy.slice(0, zerosToAssign).map(c => c._id));

    // Mapeia a lista original, adicionando a nova propriedade `randomOpenSlots`
    return campaignsList.map(campaign => ({
        ...campaign,
        randomOpenSlots: zeroSlotIds.has(campaign._id)
            ? 0 // Se o ID estiver no set, atribui 0
            : Math.floor(Math.random() * 25) + 1, // Senão, um número aleatório de 1 a 25
    }));
};


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

    const [searchTerm, setSearchTerm] = useState("");
    const [filters, setFilters] = useState({
        categoria: "", 
        plataforma: "",
        faixaSeguidores: 0,
        faixaVisualizacoes: 0,
        vagasAbertas: false,
    });

    // Estado para guardar os dados brutos da API + RNG
    const [allFetchedCampaigns, setAllFetchedCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [sortConfig, setSortConfig] = useState({ key: 'title', direction: 'asc' });

    useEffect(() => {
        if (!user) return;
        const delayDebounceFn = setTimeout(() => {
            fetchCampaigns();
        }, 500);
        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm, filters.categoria, filters.plataforma, filters.faixaSeguidores, filters.faixaVisualizacoes, user]); // Removido filters.vagasAbertas das dependências

    const fetchCampaigns = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (searchTerm) params.append("title", searchTerm);
            if (filters.categoria) params.append("category", filters.categoria);
            if (filters.plataforma) params.append("platform", filters.plataforma);
            if (filters.faixaSeguidores > 0) params.append("minFollowers", filters.faixaSeguidores * 1000000);
            if (filters.faixaVisualizacoes > 0) params.append("minViews", filters.faixaVisualizacoes * 1000000);
            // REMOVIDO: O filtro de vagas abertas não é mais enviado para a API
            // if (filters.vagasAbertas) params.append("openSlots", filters.vagasAbertas);
            
            const config = {
                headers: { Authorization: `Bearer ${user.token}` },
                params: params,
            };

            const { data } = await axios.get("http://localhost:5001/api/campaigns/search", config);
            
            // AQUI A MÁGICA ACONTECE: Adiciona os slots aleatórios aos dados recebidos
            const campaignsWithSlots = addRandomOpenSlots(data);
            setAllFetchedCampaigns(campaignsWithSlots);
            setError("");
        } catch (err) {
            setError(err.response?.data?.message || "Erro ao buscar campanhas.");
            setAllFetchedCampaigns([]);
        } finally {
            setLoading(false);
        }
    };

    // Filtra as campanhas no frontend com base no checkbox
    const filteredCampaigns = useMemo(() => {
        if (filters.vagasAbertas) {
            return allFetchedCampaigns.filter(campaign => campaign.randomOpenSlots > 0);
        }
        return allFetchedCampaigns;
    }, [allFetchedCampaigns, filters.vagasAbertas]);


    const sortedCampaigns = useMemo(() => {
    let sortableItems = [...filteredCampaigns];
    if (sortConfig.key !== null) {
        sortableItems.sort((a, b) => {
            const aValue = a[sortConfig.key];
            const bValue = b[sortConfig.key];
            if (aValue === null || aValue === undefined) return 1;
            if (bValue === null || bValue === undefined) return -1;
            if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
    }
    return sortableItems;
}, [filteredCampaigns, sortConfig]);


    const handleFilterChange = (event) => {
        const { name, value, checked, type } = event.target;
        setFilters((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handleSort = (key) => {
    const isAsc = sortConfig.key === key && sortConfig.direction === 'asc';
    setSortConfig({ key, direction: isAsc ? 'desc' : 'asc' });
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
        setFilters({
            categoria: "",
            plataforma: "",
            faixaSeguidores: 0,
            faixaVisualizacoes: 0,
            vagasAbertas: false,
        });
    };

    const gridTemplate = "1.5fr 1fr 1fr 1fr 1fr 1fr";
    const formatSliderValue = (value) => `${value}M`;

    const headers = [
    { key: 'title', label: 'Nome', align: 'left' },
    { key: 'startDate', label: 'Data de Início', align: 'left' },
    { key: 'endDate', label: 'Data de Término', align: 'left' },
    { key: 'categories', label: 'Categorias', align: 'left' },
    { key: 'randomOpenSlots', label: 'Vagas Abertas', align: 'left' },
    { key: 'requiredSocials', label: 'Redes Necessárias', align: 'left' }
];

    return (
        <Box sx={{ height: "100%", p: 3, display: "flex", gap: 3, overflow: "hidden" }}>
            {/* Box de Filtros (sem alterações visuais) */}
            <Box
                width="350px"
                flexShrink={0}
                p={3}
                borderRadius="24px"
                sx={{
                    background: "linear-gradient(180deg, rgba(18, 18, 42, 0.76) 0%, rgba(10, 10, 25, 0.6) 100%)",
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
                        "&::-webkit-scrollbar": { width: "6px" },
                        "&::-webkit-scrollbar-track": { background: "rgba(255, 255, 255, 0.1)", borderRadius: "10px" },
                        "&::-webkit-scrollbar-thumb": { background: "rgba(255, 255, 255, 0.3)", borderRadius: "10px" },
                        "&::-webkit-scrollbar-thumb:hover": { background: "rgba(255, 255, 255, 0.6)" },
                    }}
                >
                    <Typography variant="body2" fontWeight="500"> Categoria </Typography>
                    <Autocomplete
                        options={allCategories}
                        value={filters.categoria || null}
                        onChange={(_, newValue) => {
                            setFilters(prev => ({...prev, categoria: newValue || ""}))
                        }}
                        renderInput={(params) => (
                            <TextField 
                                {...params} 
                                placeholder="Todas" 
                                size="small" 
                                sx={{ 
                                    mb: 2, 
                                    mt: 0.5, 
                                    bgcolor: "rgba(255,255,255,0.1)", 
                                    borderRadius: "10px", 
                                    "& .MuiOutlinedInput-input": { color: "white" }, 
                                    "& fieldset": { border: "none" }, 
                                    "& svg": { color: "white" }, 
                                }} 
                            />
                        )}
                        sx={{ 
                            "& .MuiAutocomplete-popupIndicator": { color: "white" }, 
                            "& .MuiAutocomplete-clearIndicator": { color: "white" },
                        }}
                        freeSolo
                    />
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
                        sx={{ mb: 2, mt: 0.5, bgcolor: "rgba(255,255,255,0.1)", borderRadius: "10px", "& .MuiOutlinedInput-input": { color: "white" }, "& fieldset": { border: "none" }, "& svg": { color: "white" } }}
                    >
                        <option value="">Todas</option>
                        {allPlatforms.map((platform) => ( <option key={platform} value={platform}> {platform.charAt(0).toUpperCase() + platform.slice(1)} </option> ))}
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
                            min={0} max={50} step={1}
                            sx={{ color: "#ff00d4", "& .MuiSlider-thumb": { bgcolor: "white", border: "2px solid #ff00d4" }, "& .MuiSlider-track": { bgcolor: "#ff00d4" } }}
                        />
                    </Box>
                    <Typography variant="body2" fontWeight="500" mb={1}>
                        Mínimo de Visualizações (milhões)
                    </Typography>
                    <Box sx={{ width: "calc(100% - 20px)", ml: "10px" }}>
                        <Slider
                            value={filters.faixaVisualizacoes} 
                            onChange={handleViewsSliderChange}
                            valueLabelDisplay="auto"
                            valueLabelFormat={formatViewsValue}
                            min={0} max={50} step={1}
                            sx={{ color: "#ff00d4", "& .MuiSlider-thumb": { bgcolor: "white", border: "2px solid #ff00d4" }, "& .MuiSlider-track": { bgcolor: "#ff00d4" } }}
                        />
                    </Box>
                    <FormGroup sx={{ mb: 2 }}>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    name="vagasAbertas"
                                    checked={filters.vagasAbertas}
                                    onChange={handleFilterChange}
                                    sx={{ color: "#ff00d4", "&.Mui-checked": { color: "#ff00d4" } }}
                                />
                            }
                            label={ <Typography variant="body2" fontWeight="500" color="white"> Vagas Abertas </Typography> }
                        />
                    </FormGroup>
                </Box>
                <Button
                    variant="contained" fullWidth onClick={clearFilters}
                    sx={{ mt: 2, borderRadius: "12px", bgcolor: "#ff00ae5b", textTransform: "none", backdropFilter: "blur(10px)", transition: "all 0.3s ease-in-out", fontWeight: "600", color: "white", "&:hover": { bgcolor: "#ff00a679", fontSize: "0.8rem" } }}
                >
                    Limpar Filtros
                </Button>
            </Box>

            <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
                <Box sx={{ display: "grid", gridTemplateColumns: gridTemplate, gap: 2, p: 2, borderBottom: "1px solid rgba(255,255,255,0.2)", fontWeight: "bold", fontSize: "0.9em", textTransform: "uppercase", textAlign: "left", mb: 2 }}>
    {headers.map((header) => (
        <TableSortLabel
            key={header.key}
            active={sortConfig.key === header.key}
            direction={sortConfig.key === header.key ? sortConfig.direction : 'asc'}
            onClick={() => handleSort(header.key)}
            sx={{
                color: 'white !important',
                '& .MuiTableSortLabel-icon': { color: 'white !important' },
            }}
        >
            {header.label}
        </TableSortLabel>
    ))}
</Box>
                <Box sx={{ flexGrow: 1, overflowY: "auto", pr: 1, "&::-webkit-scrollbar": { width: "6px" }, "&::-webkit-scrollbar-track": { background: "rgba(255, 255, 255, 0.1)", borderRadius: "10px" }, "&::-webkit-scrollbar-thumb": { background: "rgba(255, 255, 255, 0.3)", borderRadius: "10px" }, "&::-webkit-scrollbar-thumb:hover": { background: "rgba(255, 255, 255, 0.6)" } }}>
                    {loading ? (
                        <Box display="flex" justifyContent="center" mt={4}><CircularProgress /></Box>
                    ) : error ? (
                        <Typography color="error" textAlign="center" mt={4}>{error}</Typography>
                    ) : sortedCampaigns.length > 0 ? ( 
    sortedCampaigns.map((campaign) => (
        <CampaignSearchRow key={campaign._id} campaign={campaign} />
    ))
) : (
                        <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                            <Typography color="rgba(255,255,255,0.6)">Nenhuma campanha encontrada.</Typography>
                        </Box>
                    )}
                </Box>
            </Box>
        </Box>
    );
};

export default CampaignsSearch;