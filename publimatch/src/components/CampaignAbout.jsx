// src/components/CampaignAbout.jsx

import { useState } from "react";
import {
    Box,
    Typography,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    TextField,
    Autocomplete,
    Avatar,
    Snackbar,
    Alert,
    CircularProgress
} from "@mui/material";
import { Star, Check, Close } from "@mui/icons-material";
import { useAuth } from "../auth/AuthContext"; 
import { ROLES } from "../data/mockUsers"; 
import TiptapContent from "./TiptapContent";
import axios from 'axios';

const CampaignAbout = ({ campaign, isAboutOnlyView }) => {
    const { user } = useAuth();

    const [openCandidacyDialog, setOpenCandidacyDialog] = useState(false);
    const [selectedInfluencer, setSelectedInfluencer] = useState(null);
    const [openSuccessDialog, setOpenSuccessDialog] = useState(false);
    const [availableInfluencers, setAvailableInfluencers] = useState([]);
    const [loadingInfluencers, setLoadingInfluencers] = useState(false);
    const [autocompleteKey, setAutocompleteKey] = useState(0);
    const [openSnackbar, setOpenSnackbar] = useState(false);

    const handleCandidatarCampanha = async () => {
        if (!user) return;

        if (user.role?.trim() === ROLES.INFLUENCER_AGENT?.trim()) {
            try {
                setLoadingInfluencers(true);
                const config = { headers: { Authorization: `Bearer ${user.token}` } };
                
                const { data } = await axios.get(
                    `http://localhost:5001/api/influencers?campaignId=${campaign._id}`,
                    config
                );

                setAvailableInfluencers(data);
                setOpenCandidacyDialog(true);
                setAutocompleteKey(prevKey => prevKey + 1);
            } catch (error) {
                console.error("Erro ao buscar influenciadores:", error.response?.data?.message || error.message);
                alert("Não foi possível carregar seus influenciadores. Tente novamente.");
            } finally {
                setLoadingInfluencers(false);
            }
        } else if (user.role?.trim() === ROLES.INFLUENCER?.trim()) {
            try {
                const config = { headers: { Authorization: `Bearer ${user.token}` } };
                await axios.post(`http://localhost:5001/api/applications/apply/${campaign._id}`, {}, config);
                setOpenSnackbar(true);
            } catch (error) {
                 console.error("Erro ao enviar candidatura:", error.response?.data?.message || error.message);
                 alert(error.response?.data?.message || "Ocorreu um erro ao se candidatar.");
            }
        }
    };

    const handleCloseCandidacyDialog = () => {
        setOpenCandidacyDialog(false);
        setSelectedInfluencer(null);
        setAvailableInfluencers([]);
    };

    const handleConfirmCandidacy = async () => {
    if (!selectedInfluencer) return;

    try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        // A MUDANÇA ESTÁ AQUI: Enviamos o _id do perfil do influenciador
        const body = { influencerId: selectedInfluencer._id }; 
        
        await axios.post(
            `http://localhost:5001/api/applications/apply/${campaign._id}`, 
            body, 
            config
        );

        setAvailableInfluencers(prev => prev.filter(inf => inf._id !== selectedInfluencer._id));
        
        setOpenCandidacyDialog(false);
        setOpenSuccessDialog(true);
        setSelectedInfluencer(null);

    } catch (error) {
        const errorMessage = error.response?.data?.message || "";
        console.error("Erro ao enviar candidatura:", errorMessage);
        
        if (errorMessage.includes("já se candidatou")) {
            setAvailableInfluencers(prev => prev.filter(inf => inf._id !== selectedInfluencer._id));
            setSelectedInfluencer(null);
        } else {
            alert(errorMessage || "Ocorreu um erro ao confirmar a candidatura.");
            setOpenCandidacyDialog(false);
        }
    }
};

    const handleCloseSuccessDialog = () => {
        setOpenSuccessDialog(false);
    };
    
    const handleCloseSnackbar = (event, reason) => {
        if (reason === 'clickaway') return;
        setOpenSnackbar(false);
    };

    const canApply = user && (user.role === ROLES.INFLUENCER || user.role === ROLES.INFLUENCER_AGENT);

    return (
        <Box sx={{ p: 4, borderRadius: "12px", backgroundColor: "rgba(20, 1, 19, 0.6)", backdropFilter: "blur(10px)", border: "1px solid rgba(255, 255, 255, 0.1)", height: '100%', overflowY: 'auto', "&::-webkit-scrollbar": { width: "8px" }, "&::-webkit-scrollbar-track": { background: "rgba(0, 0, 0, 0.2)", borderRadius: "10px" }, "&::-webkit-scrollbar-thumb": { backgroundColor: "rgba(255, 255, 255, 0.3)", borderRadius: "10px", border: "2px solid transparent", backgroundClip: "content-box" }, "&::-webkit-scrollbar-thumb:hover": { backgroundColor: "rgba(255, 255, 255, 0.5)" } }}>
            <Typography sx={{ fontSize: "1.7rem", fontWeight: "bold", color: "white", mb: 1 }}>{campaign.title || campaign.name}</Typography>
            <Typography variant="h6" fontWeight={600} color="white" mb={2} mt={-2}>Briefing Completo da Campanha:</Typography>
            {campaign.description ? (<TiptapContent content={campaign.description} />) : (<Typography variant="body1" color="rgba(255, 255, 255, 0.8)">Descrição não fornecida.</Typography>)}
            {isAboutOnlyView && canApply && (
                <Box sx={{ mt: 3, mb: 1, display: 'flex', justifyContent: 'center' }}>
                    <Button variant="contained" startIcon={<Star />} onClick={handleCandidatarCampanha} disabled={loadingInfluencers} sx={{ background: "linear-gradient(90deg, #FF37EB 0%, #B32FFF 100%)", color: "white", borderRadius: "25px", px: 5, py: 1.5, fontWeight: "bold", fontSize: "1.1rem", textTransform: "none", boxShadow: "0 4px 15px rgba(255, 55, 235, 0.4)", transition: "all 0.3s ease", "&:hover": { transform: "translateY(-2px)", boxShadow: "0 6px 20px rgba(255, 55, 235, 0.6)" } }}>
                        {loadingInfluencers ? 'Carregando...' : 'Candidatar Campanha'}
                    </Button>
                </Box>
            )}
            
            {/* ✨ MODAL AGORA COM FUNDO BRANCO E INPUTS ESCUROS ✨ */}
            <Dialog 
                open={openCandidacyDialog} 
                onClose={handleCloseCandidacyDialog} 
                sx={{ 
                    "& .MuiPaper-root": { 
                        backgroundColor: "white", 
                        borderRadius: "16px", 
                        color: "#333", // Texto escuro
                        boxShadow: "0 10px 40px rgba(0,0,0,0.2)"
                    } 
                }}
            >
                <DialogTitle sx={{ textAlign: 'center', color: '#b32fff', fontWeight: 'bold' }}>Selecione o Influenciador que deseja participar da campanha</DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{ textAlign: 'center', mb: 2, color: '#555' }}>
                        Escolha um dos seus influenciadores cadastrados para aplicar.
                    </DialogContentText>
                  <Autocomplete
    key={autocompleteKey}
    options={availableInfluencers}
    loading={loadingInfluencers}
    value={selectedInfluencer}
    getOptionLabel={(option) => option.name}
    isOptionEqualToValue={(option, value) => option._id === value._id}
    onChange={(event, newValue) => setSelectedInfluencer(newValue)}
    
    // ✨ FIX 1: Estilizando o Menu Flutuante (Dropdown)
    // Garante fundo branco na lista e cores do sistema no hover
    slotProps={{
        paper: {
            sx: {
                backgroundColor: "white", // Fundo do menu branco
                color: "#333",            // Texto das opções escuro
                borderRadius: "12px",
                marginTop: "8px",
                boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                "& .MuiAutocomplete-option": {
                    // Hover com tom roxo do sistema
                    "&:hover": {
                        backgroundColor: "rgba(179, 47, 255, 0.08)", 
                        color: "#b32fff"
                    },
                    // Item selecionado com roxo mais forte
                    "&.Mui-selected": {
                        backgroundColor: "rgba(179, 47, 255, 0.15)",
                        color: "#b32fff",
                        fontWeight: "bold"
                    }
                }
            }
        }
    }}

    renderInput={(params) => (
        <TextField 
            {...params} 
            placeholder="Insira o nome do criador"
            InputProps={{ 
                ...params.InputProps, 
                endAdornment: (
                    <>
                        {loadingInfluencers ? <CircularProgress color="inherit" size={20} /> : null}
                        {params.InputProps.endAdornment}
                    </>
                ),
                startAdornment: (
                    <Box sx={{ pr: 1, display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ bgcolor: '#eee', width: 32, height: 32 }}>
                            {selectedInfluencer && selectedInfluencer.profileImageUrl ? (
                                <img src={selectedInfluencer.profileImageUrl} alt={selectedInfluencer.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}/>
                            ) : (<Star sx={{ color: '#bbb' }} />)}
                        </Avatar>
                    </Box>
                ),
            }}
            // ✨ FIX 2: Estilos do Input (Campo de digitação)
            sx={{ 
                "& .MuiOutlinedInput-root": { 
                    backgroundColor: "#f5f5f5", // Fundo cinza claro
                    borderRadius: "16px", 
                    color: "#333", // Cor base do texto
                    
                    "& fieldset": { borderColor: "#e0e0e0" }, 
                    "&:hover fieldset": { borderColor: "#bdbdbd" }, 
                    "&.Mui-focused fieldset": { 
                        borderColor: "#b32fff", // Roxo do sistema no foco
                        borderWidth: "2px"
                    }, 
                }, 
                // Força a cor do texto digitado para evitar herança de tema dark
                "& .MuiInputBase-input": { 
                    color: "#333 !important",
                    "-webkit-text-fill-color": "#333 !important", // Garante compatibilidade Webkit
                },
                "& .MuiInputBase-input::placeholder": { color: "#888" } 
            }}
        />
    )}
    renderOption={(props, option) => (
        <Box component="li" {...props} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar src={option.profileImageUrl} alt={option.name} sx={{ width: 32, height: 32 }} />
            <Typography>{option.name}</Typography>
        </Box>
    )}
    noOptionsText="Nenhum influenciador disponível."
/>
                </DialogContent>
                <DialogActions sx={{ justifyContent: 'center', p: 3, gap: 2 }}>
                    <Button 
                        onClick={handleCloseCandidacyDialog} 
                        variant="outlined" 
                        startIcon={<Close />} 
                        sx={{ 
                            borderColor: "#ddd", 
                            color: "#666", 
                            borderRadius: '16px', 
                            '&:hover': { backgroundColor: "#f5f5f5", borderColor: "#ccc" } 
                        }}
                    >
                        Cancelar
                    </Button>
                    <Button 
                        onClick={handleConfirmCandidacy} 
                        variant="contained" 
                        startIcon={<Check />} 
                        disabled={!selectedInfluencer} 
                        sx={{ 
                            background: "linear-gradient(90deg, #FF37EB 0%, #B32FFF 100%)", 
                            color: 'white', 
                            borderRadius: '16px', 
                            '&:disabled': { opacity: 0.5, background: "#ccc", boxShadow: "none" } 
                        }}
                    >
                        Confirmar
                    </Button>
                </DialogActions>
            </Dialog>
            <Dialog open={openSuccessDialog} onClose={handleCloseSuccessDialog} sx={{ "& .MuiPaper-root": { backgroundColor: "white", borderRadius: "16px", color: "#333", textAlign: "center" } }}>
                <DialogTitle><Typography variant="h6" fontWeight="bold" color="#2e7d32">Candidatura Enviada!</Typography></DialogTitle>
                <DialogContent><DialogContentText sx={{ color: '#666' }}>Sua candidatura foi enviada com sucesso para análise.</DialogContentText></DialogContent>
                <DialogActions sx={{ justifyContent: 'center' }}><Button onClick={handleCloseSuccessDialog} variant="contained" sx={{ background: "linear-gradient(90deg, #FF37EB 0%, #B32FFF 100%)", color: 'white', borderRadius: '16px' }}>OK</Button></DialogActions>
            </Dialog>
            <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={handleCloseSnackbar} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
                <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%', backgroundColor: '#2e7d32', color: 'white', fontWeight: 'bold' }}>Sua candidatura foi enviada com sucesso!</Alert>
            </Snackbar>
        </Box>
    );
};

export default CampaignAbout;
