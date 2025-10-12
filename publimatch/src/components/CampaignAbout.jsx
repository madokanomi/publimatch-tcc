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
            <Dialog open={openCandidacyDialog} onClose={handleCloseCandidacyDialog} sx={{ "& .MuiPaper-root": { backgroundColor: "rgba(20, 1, 19, 0.6)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "16px", color: "white" } }}>
                <DialogTitle sx={{ textAlign: 'center', color: '#b32fff', fontWeight: 'bold' }}>Selecione o Influenciador que deseja participar da campanha</DialogTitle>
                <DialogContent>
                    <Autocomplete
                        key={autocompleteKey}
                        options={availableInfluencers}
                        loading={loadingInfluencers}
                        value={selectedInfluencer}
                        getOptionLabel={(option) => option.name}
                        isOptionEqualToValue={(option, value) => option._id === value._id}
                        onChange={(event, newValue) => setSelectedInfluencer(newValue)}
                        renderInput={(params) => (
                            <TextField {...params} placeholder="Insira o nome do criador"
                                InputProps={{ ...params.InputProps, endAdornment: (<>{loadingInfluencers ? <CircularProgress color="inherit" size={20} /> : null}{params.InputProps.endAdornment}</>),
                                    startAdornment: (
                                        <Box sx={{ pr: 1, display: 'flex', alignItems: 'center' }}>
                                            <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 32, height: 32 }}>
                                                {selectedInfluencer && selectedInfluencer.profileImageUrl ? (
                                                    <img src={selectedInfluencer.profileImageUrl} alt={selectedInfluencer.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}/>
                                                ) : (<Star sx={{ color: 'white' }} />)}
                                            </Avatar>
                                        </Box>
                                    ),
                                }}
                                sx={{ "& .MuiOutlinedInput-root": { backgroundColor: "rgba(255, 255, 255, 0.1)", borderRadius: "16px", "& fieldset": { borderColor: "rgba(255, 255, 255, 0.2)" }, "&:hover fieldset": { borderColor: "rgba(255, 255, 255, 0.4)" }, "&.Mui-focused fieldset": { borderColor: "#FF37EB" }, color: "white" }, "& .MuiInputLabel-root": { color: "rgba(255, 255, 255, 0.7)" }, "& .MuiInputBase-input::placeholder": { color: "rgba(255, 255, 255, 0.6)" } }}
                            />
                        )}
                        renderOption={(props, option) => (
                            <Box component="li" {...props} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Avatar src={option.profileImageUrl} alt={option.name} />
                                <Typography>{option.name}</Typography>
                            </Box>
                        )}
                        noOptionsText="Nenhum influenciador disponível para esta campanha."
                    />
                </DialogContent>
                <DialogActions sx={{ justifyContent: 'center', p: 3, gap: 2 }}>
                    <Button onClick={handleCloseCandidacyDialog} variant="contained" startIcon={<Close />} sx={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', color: 'white', borderRadius: '16px', '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.2)' } }}>Cancelar</Button>
                    <Button onClick={handleConfirmCandidacy} variant="contained" startIcon={<Check />} disabled={!selectedInfluencer} sx={{ background: "linear-gradient(90deg, #FF37EB 0%, #B32FFF 100%)", color: 'white', borderRadius: '16px', '&:disabled': { opacity: 0.5, color: 'white' } }}>Confirmar</Button>
                </DialogActions>
            </Dialog>
            <Dialog open={openSuccessDialog} onClose={handleCloseSuccessDialog} sx={{ "& .MuiPaper-root": { backgroundColor: "rgba(20, 1, 19, 0.6)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "16px", color: "white", textAlign: "center" } }}>
                <DialogTitle><Typography variant="h6" fontWeight="bold">Candidatura Enviada!</Typography></DialogTitle>
                <DialogContent><DialogContentText sx={{ color: 'rgba(255,255,255,0.8)' }}>Sua candidatura foi enviada com sucesso para análise.</DialogContentText></DialogContent>
                <DialogActions sx={{ justifyContent: 'center' }}><Button onClick={handleCloseSuccessDialog} variant="contained" sx={{ background: "linear-gradient(90deg, #FF37EB 0%, #B32FFF 100%)", color: 'white', borderRadius: '16px' }}>OK</Button></DialogActions>
            </Dialog>
            <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={handleCloseSnackbar} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
                <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%', backgroundColor: '#2e7d32', color: 'white', fontWeight: 'bold' }}>Sua candidatura foi enviada com sucesso!</Alert>
            </Snackbar>
        </Box>
    );
};

export default CampaignAbout;