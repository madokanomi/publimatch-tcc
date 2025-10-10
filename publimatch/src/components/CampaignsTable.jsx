// src/components/CampaignsTable.jsx

import React, { useState, useEffect } from 'react';
import { 
    Box, 
    Typography, 
    CircularProgress, 
    Collapse, 
    IconButton, 
    Divider,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Button,
    TextField
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import CampaignRow from './CampaignRow';
import axios from 'axios';
import { useAuth } from '../auth/AuthContext';

const CampaignsTable = () => {
    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { user } = useAuth();
    const [showHidden, setShowHidden] = useState(false);
    
    // --- Estados para o popup de OCULTAR ---
    const [hideDialogOpen, setHideDialogOpen] = useState(false);
    const [hideDialogContent, setHideDialogContent] = useState({ title: '', text: '' });
    const [selectedCampaignIdForHide, setSelectedCampaignIdForHide] = useState(null);

    // --- Estados para o popup de CANCELAR ---
    const [cancelStep, setCancelStep] = useState(0); // 0: inativo, 1: confirmar nome, 2: confirmar senha
    const [campaignToCancel, setCampaignToCancel] = useState(null);
    const [nameInput, setNameInput] = useState('');
    const [passwordInput, setPasswordInput] = useState('');
    const [cancelDialogError, setCancelDialogError] = useState('');

    // --- Lógica para o popup de OCULTAR ---
    const handleConfirmToggleState = async () => {
        if (!selectedCampaignIdForHide) return;
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await axios.patch(`http://localhost:5001/api/campaigns/${selectedCampaignIdForHide}/state`, {}, config);
            setCampaigns(campaigns.map(c => c._id === selectedCampaignIdForHide ? data.campaign : c));
        } catch (err) {
            alert('Falha ao alterar a visibilidade da campanha.');
            console.error(err);
        } finally {
            handleCloseHideDialog();
        }
    };
    
    const handleToggleState = (id) => {
        const campaignToToggle = campaigns.find(c => c._id === id);
        if (!campaignToToggle) return;

        if (campaignToToggle.state === 'Hidden') {
            setHideDialogContent({
                title: 'Reativar Visibilidade',
                text: 'Tem certeza que quer deixar essa campanha visível novamente?'
            });
        } else {
            setHideDialogContent({
                title: 'Ocultar Campanha',
                text: 'Tem certeza de que deseja ocultar esta campanha?'
            });
        }
        setSelectedCampaignIdForHide(id);
        setHideDialogOpen(true);
    };

    const handleCloseHideDialog = () => {
        setHideDialogOpen(false);
        setSelectedCampaignIdForHide(null);
    };

    // --- Lógica para o popup de CANCELAR ---
    const handleCancelCampaign = (id) => {
        const campaign = campaigns.find(c => c._id === id);
        if (campaign) {
            setCampaignToCancel(campaign);
            setCancelStep(1);
        }
    };
    
    const handleCloseCancelDialog = () => {
        setCancelStep(0);
        setCampaignToCancel(null);
        setNameInput('');
        setPasswordInput('');
        setCancelDialogError('');
    };

    const handleNameConfirmation = () => {
        if (nameInput.trim() === campaignToCancel.title.trim()) {
            setCancelStep(2);
            setCancelDialogError('');
        } else {
            setCancelDialogError('O nome da campanha não corresponde.');
        }
    };
    
    const handlePasswordConfirmation = async () => {
        if (!passwordInput) {
            setCancelDialogError('A senha é obrigatória.');
            return;
        }
        
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await axios.post(
                `http://localhost:5001/api/campaigns/${campaignToCancel._id}/cancel`, 
                { password: passwordInput }, 
                config
            );
            
            setCampaigns(campaigns.map(c => c._id === campaignToCancel._id ? data.campaign : c));
            handleCloseCancelDialog();

        } catch (err) {
            if (err.response && err.response.status === 401) {
                setCancelDialogError('Senha incorreta. Por favor, tente novamente.');
            } else {
                alert('Ocorreu um erro ao cancelar a campanha.');
                handleCloseCancelDialog();
            }
            console.error(err);
        }
    };

    useEffect(() => {
        async function fetchCampaigns() {
            try {
                const config = { headers: { Authorization: `Bearer ${user.token}` } };
                const { data } = await axios.get('http://localhost:5001/api/campaigns', config);
                setCampaigns(data);
            } catch (err) {
                setError(err.response?.data?.message || 'Erro ao buscar campanhas.');
            } finally {
                setLoading(false);
            }
        }
        if (user) {
            fetchCampaigns();
        } else {
            setLoading(false);
        }
    }, [user]);

    if (loading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;
    }
    if (error) {
        return <Typography color="error" sx={{ p: 4, textAlign: 'center' }}>{error}</Typography>;
    }
    
    const gridTemplate = '2fr 1fr 1.5fr 1.5fr 1fr 1fr 1fr';
    const visibleCampaigns = campaigns.filter(c => c.state !== 'Hidden');
    const hiddenCampaigns = campaigns.filter(c => c.state === 'Hidden');

    return (
        <React.Fragment>
            <Box
                sx={{
                    display: 'grid', gridTemplateColumns: gridTemplate, gap: 2, p: 2, pr: '96px',
                    borderBottom: '1px solid rgba(255,255,255,0.2)', fontWeight: 'bold',
                    fontSize: '0.9em', textTransform: 'uppercase',
                }}
            >
                <Typography>Campanha</Typography>
                <Typography sx={{ textAlign: 'center' }}>Status</Typography>
                <Typography sx={{ textAlign: 'center' }}>Duração</Typography>
                <Typography sx={{ textAlign: 'center' }}>Pagamento</Typography>
                <Typography sx={{ textAlign: 'center' }}>Inscrições</Typography>
                <Typography sx={{ textAlign: 'center' }}>Privacidade</Typography>
                <Typography sx={{ textAlign: 'center' }}>Influencers</Typography>
            </Box>

            <Box sx={{ mt: 2 }}>
                {visibleCampaigns.length > 0 ? (
                    visibleCampaigns.map((campaign) => (
                        <CampaignRow 
                            key={campaign._id}
                            campaign={campaign} 
                            gridTemplate={gridTemplate}
                            showActions={true} 
                            onToggleState={handleToggleState}
                            onCancelCampaign={handleCancelCampaign}
                        />
                    ))
                ) : (
                    <Typography sx={{ textAlign: 'center', mt: 4 }}>Nenhuma campanha visível encontrada.</Typography>
                )}
            </Box>

            {hiddenCampaigns.length > 0 && (
                <Box sx={{ pt: 4 }}>
                    <Box
                        onClick={() => setShowHidden(!showHidden)}
                        sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', pb: 1 }}
                    >
                        <Typography variant="overline" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                            Campanhas Ocultas ({hiddenCampaigns.length})
                        </Typography>
                        <IconButton size="small" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                            {showHidden ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                        </IconButton>
                    </Box>
                    <Divider sx={{ borderColor: 'rgba(255,255,255,0.2)', mb: 2 }} />

                    <Collapse in={showHidden} timeout="auto" unmountOnExit>
                        <Box sx={{ pt: 1 }}>
                            {hiddenCampaigns.map((campaign) => (
                                <CampaignRow 
                                    key={campaign._id}
                                    campaign={campaign} 
                                    gridTemplate={gridTemplate}
                                    showActions={true} 
                                    onToggleState={handleToggleState}
                                    onCancelCampaign={handleCancelCampaign}
                                />
                            ))}
                        </Box>
                    </Collapse>
                </Box>
            )}

            {/* Diálogo de confirmação para OCULTAR */}
            <Dialog
                open={hideDialogOpen}
                onClose={handleCloseHideDialog}
                aria-labelledby="alert-dialog-hide-title"
                aria-describedby="alert-dialog-hide-description"
                sx={{ 
                    "& .MuiPaper-root": { 
                        backgroundColor: "rgba(255, 255, 255, 0.64)", 
                        color: "#610069ff", 
                        backdropFilter:"blur(30px)", 
                        borderRadius:'20px' 
                    } 
                }}
            >
                <DialogTitle id="alert-dialog-hide-title">
                    {hideDialogContent.title}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-hide-description" sx={{color:"#4f4f4fff"}}>
                        {hideDialogContent.text}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseHideDialog} sx={{color:"#540069ff"}}>
                        Cancelar
                    </Button>
                    <Button onClick={handleConfirmToggleState} sx={{fontWeight:'bold', color:"#540069ff"}} autoFocus>
                        Confirmar
                    </Button>
                </DialogActions>
            </Dialog>
            
            {/* Diálogo de confirmação para CANCELAR */}
            <Dialog
                open={cancelStep > 0}
                onClose={handleCloseCancelDialog}
                sx={{ 
                    "& .MuiPaper-root": { 
                        backgroundColor: "rgba(255, 255, 255, 0.64)", 
                        color: "#610069ff", 
                        backdropFilter:"blur(30px)", 
                        borderRadius:'20px',
                        width: '400px'
                    } 
                }}
            >
                {cancelStep === 1 && campaignToCancel && (
                    <>
                        <DialogTitle>Cancelar "{campaignToCancel.title}"</DialogTitle>
                        <DialogContent>
                            <DialogContentText sx={{color:"#4f4f4fff", mb: 2}}>
                                Para confirmar, digite o nome da campanha no campo abaixo.
                            </DialogContentText>
                            <TextField
                                autoFocus
                                margin="dense"
                                label="Nome da Campanha"
                                type="text"
                                fullWidth
                                variant="standard"
                                value={nameInput}
                                onChange={(e) => setNameInput(e.target.value)}
                                error={!!cancelDialogError}
                                helperText={cancelDialogError}
                            />
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={handleCloseCancelDialog} sx={{color:"#540069ff"}}>Cancelar</Button>
                            <Button onClick={handleNameConfirmation} sx={{fontWeight:'bold', color:"#540069ff"}}>
                                Próximo
                            </Button>
                        </DialogActions>
                    </>
                )}

                {cancelStep === 2 && (
                    <>
                        <DialogTitle>Confirmação de Segurança</DialogTitle>
                        <DialogContent>
                            <DialogContentText sx={{color:"#4f4f4fff", mb: 2}}>
                                Para concluir o cancelamento, por favor, digite sua senha.
                            </DialogContentText>
                            <TextField
                                autoFocus
                                margin="dense"
                                label="Sua Senha"
                                type="password"
                                fullWidth
                                variant="standard"
                                value={passwordInput}
                                onChange={(e) => {
                                    setPasswordInput(e.target.value);
                                    if(cancelDialogError) setCancelDialogError('');
                                }}
                                error={!!cancelDialogError}
                                helperText={cancelDialogError}
                            />
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={handleCloseCancelDialog} sx={{color:"#540069ff"}}>Cancelar</Button>
                            <Button onClick={handlePasswordConfirmation} sx={{fontWeight:'bold'}} color="error">
                                Confirmar Cancelamento
                            </Button>
                        </DialogActions>
                    </>
                )}
            </Dialog>
        </React.Fragment>
    );
};

export default CampaignsTable;