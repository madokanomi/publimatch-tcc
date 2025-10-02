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
    Button
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
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedCampaignId, setSelectedCampaignId] = useState(null);

    const handleConfirmToggleState = async () => {
        if (!selectedCampaignId) return;
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await axios.patch(`http://localhost:5001/api/campaigns/${selectedCampaignId}/state`, {}, config);
            setCampaigns(campaigns.map(c => c._id === selectedCampaignId ? data.campaign : c));
        } catch (err) {
            alert('Falha ao alterar a visibilidade da campanha.');
            console.error(err);
        } finally {
            handleCloseDialog();
        }
    };
    
    const handleToggleState = (id) => {
        setSelectedCampaignId(id);
        setDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setDialogOpen(false);
        setSelectedCampaignId(null);
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
    const openCampaigns = campaigns.filter(c => c.state === 'Open' || c.state === undefined);
    const hiddenCampaigns = campaigns.filter(c => c.state === 'Hidden');

    return (
        // ALTERAÇÃO 1: Voltamos a usar React.Fragment, removendo o Box com display:flex e height:100%
        <React.Fragment>
            {/* Cabeçalho da tabela (sem alterações) */}
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

            {/* ALTERAÇÃO 2: Painel de cima volta a ser um Box simples, sem flex, minHeight ou overflow */}
            <Box sx={{ mt: 2 }}>
                {openCampaigns.length > 0 ? (
                    openCampaigns.map((campaign) => (
                        <CampaignRow 
                            key={campaign._id}
                            campaign={campaign} 
                            gridTemplate={gridTemplate}
                            showActions={true} 
                            onToggleState={handleToggleState}
                        />
                    ))
                ) : (
                    <Typography sx={{ textAlign: 'center', mt: 4 }}>Nenhuma campanha aberta encontrada.</Typography>
                )}
            </Box>

            {/* Seção de Ocultos */}
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
                         {/* ALTERAÇÃO 3: Removido maxHeight e overflowY. O conteúdo agora expande a página. */}
                         <Box sx={{ pt: 1 }}>
                            {hiddenCampaigns.map((campaign) => (
                                <CampaignRow 
                                    key={campaign._id}
                                    campaign={campaign} 
                                    gridTemplate={gridTemplate}
                                    showActions={true} 
                                    onToggleState={handleToggleState}
                                />
                            ))}
                        </Box>
                    </Collapse>
                </Box>
            )}

            {/* Diálogo de confirmação (sem alterações) */}
            <Dialog
                open={dialogOpen}
                onClose={handleCloseDialog}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
                sx={{ 
                    "& .MuiPaper-root": { 
                        backgroundColor: "rgba(255, 255, 255, 0.64)", 
                        color: "#610069ff", 
                        backdropFilter:"blur(30px)", 
                        borderRadius:'20px' 
                    } 
                }}
            >
                <DialogTitle id="alert-dialog-title">
                    {"Confirmar Alteração de Visibilidade"}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description" sx={{color:"#4f4f4fff"}}>
                        Tem certeza de que deseja alterar a visibilidade desta campanha?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog} sx={{color:"#540069ff"}}>
                        Cancelar
                    </Button>
                    <Button onClick={handleConfirmToggleState} sx={{fontWeight:'bold', color:"#540069ff"}} autoFocus>
                        Confirmar
                    </Button>
                </DialogActions>
            </Dialog>
        </React.Fragment>
    );
};

export default CampaignsTable;