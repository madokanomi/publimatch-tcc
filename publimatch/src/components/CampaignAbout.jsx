import { useState } from "react";
import {
    Box,
    Typography,
    List,
    ListItem,
    ListItemText,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    TextField,
    Autocomplete,
    Avatar,
    Snackbar, // MODIFICAÇÃO 1: Importar Snackbar
    Alert,    // MODIFICAÇÃO 1: Importar Alert
} from "@mui/material";
import { Star, Check, Close } from "@mui/icons-material";
import { influencers } from "../data/mockInfluencer";

// MODIFICAÇÃO 2: Importar o hook de autenticação e as ROLES
import { useAuth } from "../auth/AuthContext"; // Ajuste o caminho se necessário
import { ROLES } from "../data/mockUsers"; // Ajuste o caminho se necessário

const CampaignAbout = ({ campaign, isAboutOnlyView }) => {
    // MODIFICAÇÃO 3: Acessar os dados do usuário logado
    const { user } = useAuth();

    // ESTADOS PARA OS POP-UPS E DADOS SELECIONADOS
    const [openCandidacyDialog, setOpenCandidacyDialog] = useState(false);
    const [selectedInfluencer, setSelectedInfluencer] = useState(null);
    const [openSuccessDialog, setOpenSuccessDialog] = useState(false);
    const [availableInfluencers, setAvailableInfluencers] = useState(influencers);
    const [autocompleteKey, setAutocompleteKey] = useState(0);

    // MODIFICAÇÃO 4: Novo estado para o Snackbar do influenciador
    const [openSnackbar, setOpenSnackbar] = useState(false);


    // MODIFICAÇÃO 5: Lógica condicional baseada no papel do usuário
    const handleCandidatarCampanha = () => {
        if (!user) return; // Proteção caso não haja usuário

        if (user.role === ROLES.INFLUENCER_AGENT) {
            // Comportamento para Agente de Influenciador: abre o pop-up
            setOpenCandidacyDialog(true);
            setAutocompleteKey(prevKey => prevKey + 1);
        } else if (user.role === ROLES.INFLUENCER) {
            // Comportamento para Influenciador: mostra o snackbar diretamente
            console.log(`Candidatura do influenciador ${user.username} enviada para a campanha "${campaign.name}"`);
            setOpenSnackbar(true);
        }
    };

    const handleCloseCandidacyDialog = () => {
        setOpenCandidacyDialog(false);
        setSelectedInfluencer(null);
    };

    const handleConfirmCandidacy = () => {
        // Lógica de cadastro aqui
        console.log(`Candidatura confirmada para a campanha "${campaign.name}" com o influenciador:`, selectedInfluencer);

        setAvailableInfluencers(prev => prev.filter(inf => inf.id !== selectedInfluencer.id));

        setOpenCandidacyDialog(false);
        setOpenSuccessDialog(true);
    };

    const handleCloseSuccessDialog = () => {
        setOpenSuccessDialog(false);
        setSelectedInfluencer(null);
    };
    
    // MODIFICAÇÃO 6: Função para fechar o Snackbar
    const handleCloseSnackbar = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setOpenSnackbar(false);
    };

    return (
        <Box
            sx={{
                p: 4,
                borderRadius: "12px",
                backgroundColor: "rgba(20, 1, 19, 0.6)",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                height: '100%',
                overflowY: 'auto',
                "&::-webkit-scrollbar": { width: "8px" },
                "&::-webkit-scrollbar-track": { background: "rgba(0, 0, 0, 0.2)", borderRadius: "10px" },
                "&::-webkit-scrollbar-thumb": { backgroundColor: "rgba(255, 255, 255, 0.3)", borderRadius: "10px", border: "2px solid transparent", backgroundClip: "content-box" },
                "&::-webkit-scrollbar-thumb:hover": { backgroundColor: "rgba(255, 255, 255, 0.5)" }
            }}
        >
            {/* Título da campanha e descrição inicial */}
            <Typography
                sx={{
                    fontSize: "1.7rem",
                    fontWeight: "bold",
                    color: "white",
                    mb: 1,
                }}
            >
                {campaign.name}
            </Typography>
            <Typography variant="body1" color="rgba(255, 255, 255, 0.8)" mb={3}>
                {campaign.description?.split('.')[0] + '.' || "Descrição breve da campanha."}
            </Typography>

            {/* Briefing Completo da Campanha */}
            <Typography
                variant="h6"
                fontWeight={600}
                color="white"
                mb={2}
                mt={4}
            >
                Briefing Completo da Campanha:
            </Typography>

            {/* Objetivo */}
            <Typography variant="h5" color="white" mb={1} fontWeight={700}>
                Objetivo
            </Typography>
            <List sx={{ color: "rgba(255, 255, 255, 0.9)", mb: 3, py: 0 }}>
                {campaign.objective && Array.isArray(campaign.objective) ? (
                    campaign.objective.map((item, index) => (
                        <ListItem disablePadding key={index} sx={{ pl: 2, mb: 0.5 }}>
                            <Typography component="span" sx={{ fontSize: "1.4rem", lineHeight: 1.2, mr: 1.5 }}>•</Typography>
                            <ListItemText
                                primary={<Typography variant="body1">{item}</Typography>}
                                sx={{ my: 0 }}
                            />
                        </ListItem>
                    ))
                ) : (
                    <ListItem disablePadding sx={{ pl: 2 }}>
                        <Typography component="span" sx={{ fontSize: "1.4rem", lineHeight: 1.2, mr: 1.5 }}>•</Typography>
                        <ListItemText
                            primary={<Typography variant="body1">{campaign.objective || "Objetivo não definido."}</Typography>}
                            sx={{ my: 0 }}
                        />
                    </ListItem>
                )}
            </List>

            {/* Público-Alvo */}
            <Typography variant="h5" color="white" mb={1} fontWeight={700}>
                Público-Alvo
            </Typography>
            <List sx={{ color: "rgba(255, 255, 255, 0.9)", mb: 3, py: 0 }}>
                {campaign.target && Array.isArray(campaign.target) ? (
                    campaign.target.map((item, index) => (
                        <ListItem disablePadding key={index} sx={{ pl: 2, mb: 0.5 }}>
                            <Typography component="span" sx={{ fontSize: "1.4rem", lineHeight: 1.2, mr: 1.5 }}>•</Typography>
                            <ListItemText
                                primary={<Typography variant="body1">{item}</Typography>}
                                sx={{ my: 0 }}
                            />
                        </ListItem>
                    ))
                ) : (
                    <ListItem disablePadding sx={{ pl: 2 }}>
                        <Typography component="span" sx={{ fontSize: "1.4rem", lineHeight: 1.2, mr: 1.5 }}>•</Typography>
                        <ListItemText
                            primary={<Typography variant="body1">{campaign.target || "Público não definido."}</Typography>}
                            sx={{ my: 0 }}
                        />
                    </ListItem>
                )}
            </List>

            {/* Tom de Voz */}
            <Typography variant="h5" color="white" mb={1} fontWeight={700}>
                Tom de Voz
            </Typography>
            <Typography variant="body1" color="rgba(255, 255, 255, 0.9)" mb={3}>
                {campaign.tone || "Não especificado."}
            </Typography>

            {/* Botão "Candidatar Campanha" */}
            {isAboutOnlyView && (
                <Box sx={{ mt: 3, mb: 1, display: 'flex', justifyContent: 'center' }}>
                    <Button
                        variant="contained"
                        startIcon={<Star />}
                        onClick={handleCandidatarCampanha}
                        sx={{
                            background: "linear-gradient(90deg, #FF37EB 0%, #B32FFF 100%)",
                            color: "white",
                            borderRadius: "25px",
                            px: 5,
                            py: 1.5,
                            fontWeight: "bold",
                            fontSize: "1.1rem",
                            textTransform: "none",
                            boxShadow: "0 4px 15px rgba(255, 55, 235, 0.4)",
                            transition: "all 0.3s ease",
                            "&:hover": {
                                transform: "translateY(-2px)",
                                boxShadow: "0 6px 20px rgba(255, 55, 235, 0.6)",
                            },
                        }}
                    >
                        Candidatar Campanha
                    </Button>
                </Box>
            )}

            {/* Pop-up para selecionar o influenciador (APENAS PARA AGENTE) */}
            <Dialog
                open={openCandidacyDialog}
                onClose={handleCloseCandidacyDialog}
                sx={{
                    "& .MuiPaper-root": {
                        backgroundColor: "rgba(20, 1, 19, 0.6)",
                        backdropFilter: "blur(20px)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: "16px",
                        color: "white",
                    }
                }}
            >
                <DialogTitle sx={{ textAlign: 'center', color: '#b32fff' }}>
                    <Typography variant="h6" fontWeight="bold">
                        Selecione o Influenciador que deseja participar da campanha
                    </Typography>
                </DialogTitle>
                <DialogContent>
                    <Autocomplete
                        key={autocompleteKey}
                        options={availableInfluencers}
                        getOptionLabel={(option) => option.nome}
                        isOptionEqualToValue={(option, value) => option.id === value.id}
                        onChange={(event, newValue) => {
                            setSelectedInfluencer(newValue);
                        }}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                placeholder="Insira o nome do criador"
                                InputProps={{
                                    ...params.InputProps,
                                    startAdornment: (
                                        <Box sx={{ pr: 1, display: 'flex', alignItems: 'center' }}>
                                            <Avatar sx={{
                                                bgcolor: 'rgba(255,255,255,0.2)',
                                                width: 32,
                                                height: 32,
                                            }}>
                                                {selectedInfluencer && selectedInfluencer.imagem ? (
                                                    <img
                                                        src={selectedInfluencer.imagem}
                                                        alt={selectedInfluencer.nome}
                                                        style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
                                                    />
                                                ) : (
                                                    <Star sx={{ color: 'white' }} />
                                                )}
                                            </Avatar>
                                        </Box>
                                    ),
                                }}
                                sx={{
                                    "& .MuiOutlinedInput-root": {
                                        backgroundColor: "rgba(255, 255, 255, 0.1)",
                                        borderRadius: "16px",
                                        "& fieldset": { borderColor: "rgba(255, 255, 255, 0.2)" },
                                        "&:hover fieldset": { borderColor: "rgba(255, 255, 255, 0.4)" },
                                        "&.Mui-focused fieldset": { borderColor: "#FF37EB" },
                                        color: "white",
                                    },
                                    "& .MuiInputLabel-root": { color: "rgba(255, 255, 255, 0.7)" },
                                    "& .MuiInputBase-input::placeholder": { color: "rgba(255, 255, 255, 0.6)" },
                                }}
                            />
                        )}
                        renderOption={(props, option) => (
                            <Box component="li" {...props} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Avatar src={option.imagem} alt={option.nome} />
                                <Typography>{option.nome}</Typography>
                            </Box>
                        )}
                        noOptionsText="Nenhum influenciador encontrado."
                    />
                </DialogContent>
                <DialogActions sx={{ justifyContent: 'center', p: 3, gap: 2 }}>
                    <Button onClick={handleCloseCandidacyDialog} variant="contained" startIcon={<Close />} sx={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', color: 'white', borderRadius: '16px', '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.2)' } }}>
                        Cancelar
                    </Button>
                    <Button onClick={handleConfirmCandidacy} variant="contained" startIcon={<Check />} disabled={!selectedInfluencer} sx={{ background: "linear-gradient(90deg, #FF37EB 0%, #B32FFF 100%)", color: 'white', borderRadius: '16px', '&:disabled': { opacity: 0.5, color: 'white' } }}>
                        Confirmar
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Pop-up de sucesso (APENAS PARA AGENTE) */}
            <Dialog
                open={openSuccessDialog}
                onClose={handleCloseSuccessDialog}
                sx={{
                    "& .MuiPaper-root": {
                        backgroundColor: "rgba(20, 1, 19, 0.6)",
                        backdropFilter: "blur(20px)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: "16px",
                        color: "white",
                        textAlign: "center"
                    }
                }}
            >
                <DialogTitle>
                    <Typography variant="h6" fontWeight="bold">
                        Cadastro Realizado!
                    </Typography>
                </DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{ color: 'rgba(255,255,255,0.8)' }}>
                        Sua candidatura foi enviada com sucesso.
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ justifyContent: 'center' }}>
                    <Button onClick={handleCloseSuccessDialog} variant="contained" sx={{ background: "linear-gradient(90deg, #FF37EB 0%, #B32FFF 100%)", color: 'white', borderRadius: '16px' }}>
                        OK
                    </Button>
                </DialogActions>
            </Dialog>

            {/* MODIFICAÇÃO 7: Snackbar para confirmação do influenciador */}
            <Snackbar
                open={openSnackbar}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert
                    onClose={handleCloseSnackbar}
                    severity="success"
                    sx={{ width: '100%', backgroundColor: '#2e7d32', color: 'white', fontWeight: 'bold' }}
                >
                    Sua candidatura foi enviada com sucesso!
                </Alert>
            </Snackbar>

        </Box>
    );
};

export default CampaignAbout;