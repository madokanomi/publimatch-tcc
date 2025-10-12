import React, { useState, useEffect } from "react";
import { 
    Box, Typography, Avatar, Rating, IconButton, 
    Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button,
    CircularProgress, Tooltip
} from "@mui/material";
import { Instagram, YouTube, Twitter, CheckCircleOutline, CancelOutlined } from "@mui/icons-material";
import { FaTwitch, FaTiktok } from 'react-icons/fa';
import { useAuth } from "../auth/AuthContext";
import axios from "axios";

// Função para formatar a data para "há X tempo"
const formatTimeAgo = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    
    let interval = seconds / 31536000; // Anos
    if (interval > 1) return `há ${Math.floor(interval)} anos`;
    
    interval = seconds / 2592000; // Meses
    if (interval > 1) return `há ${Math.floor(interval)} meses`;
    
    interval = seconds / 86400; // Dias
    if (interval > 1) return `há ${Math.floor(interval)} dias`;
    
    interval = seconds / 3600; // Horas
    if (interval > 1) return `há ${Math.floor(interval)} horas`;
    
    interval = seconds / 60; // Minutos
    if (interval > 1) return `há ${Math.floor(interval)} min`;
    
    return "agora";
};

const SocialIcon = ({ network }) => {
    const iconStyle = { color: "rgba(255,255,255,0.7)", fontSize: '20px' };
    switch (network) {
        case "instagram": return <Tooltip title="Instagram"><Instagram sx={iconStyle} /></Tooltip>;
        case "youtube": return <Tooltip title="YouTube"><YouTube sx={iconStyle} /></Tooltip>;
        case "twitter": return <Tooltip title="Twitter"><Twitter sx={iconStyle} /></Tooltip>;
        case "twitch": return <Tooltip title="Twitch"><FaTwitch style={iconStyle} /></Tooltip>;
        case "tiktok": return <Tooltip title="TikTok"><FaTiktok style={iconStyle} /></Tooltip>;
        default: return null;
    }
};

const CampaignCandidates = ({ campaign }) => {
    const [candidateList, setCandidateList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const { user } = useAuth();
    
    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogContent, setDialogContent] = useState({ title: '', message: '' });
    const [selectedApplicationId, setSelectedApplicationId] = useState(null);

    useEffect(() => {
        const fetchCandidates = async () => {
            if (!campaign?._id || !user?.token) return;
            try {
                setLoading(true);
                const config = { headers: { Authorization: `Bearer ${user.token}` } };
                const { data } = await axios.get(
                    `http://localhost:5001/api/applications/campaign/${campaign._id}`,
                    config
                );

                // Adiciona dados aleatórios de avaliação E SEGUIDORES para cada candidatura
                const augmentedData = data.map(application => ({
                    ...application,
                    randomStats: {
                        followers: (Math.random() * 25).toFixed(1), // Gera um número de seguidores entre 0.0M e 25.0M
                        rating: (Math.random() * 2 + 3).toFixed(1), // Gera uma nota entre 3.0 e 5.0
                        ratingCount: Math.floor(Math.random() * 2000) + 100,
                    }
                }));

                setCandidateList(augmentedData);
            } catch (err) {
                setError(err.response?.data?.message || "Erro ao buscar candidaturas.");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchCandidates();
    }, [campaign, user]);

    const handleUpdateStatus = async (applicationId, status) => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.put(
                `http://localhost:5001/api/applications/${applicationId}/status`,
                { status },
                config
            );
            
            setSelectedApplicationId(applicationId);
            setDialogContent({
                title: `Influenciador ${status === 'aprovada' ? 'Aprovado' : 'Rejeitado'}`,
                message: `A candidatura foi marcada como ${status}.`
            });
            setDialogOpen(true);
        } catch (err) {
            alert(err.response?.data?.message || `Erro ao ${status} candidatura.`);
            console.error(err);
        }
    };

    const handleCloseDialog = () => {
        if (selectedApplicationId) {
            setCandidateList(prevList => 
                prevList.filter(app => app._id !== selectedApplicationId)
            );
        }
        setDialogOpen(false);
        setSelectedApplicationId(null);
    };

    const ratingColor = "#FFD700"; 
    const actionPink = "rgb(255, 0, 212)";
    const gridTemplate = "2.5fr 1.5fr 1.5fr 1.5fr 1fr 0.5fr";

    if (loading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;
    }
    if (error) {
        return <Typography color="error" sx={{ textAlign: 'center', p: 4 }}>{error}</Typography>;
    }

    return (
        <Box sx={{ backgroundColor: "rgba(20, 1, 19, 0.6)", p: 3, borderRadius: "12px", border: "1px solid rgba(255, 255, 255, 0.1)", height: '100%' }}>
            <Box sx={{ display: "grid", gridTemplateColumns: gridTemplate, gap: 2, py: 1.5, px: 2, alignItems: "center", color: "rgba(255,255,255,0.6)", fontWeight: "bold", textTransform: 'uppercase', fontSize: '0.8rem' }}>
                <Typography variant="caption" fontWeight="bold">Nome</Typography>
                <Typography variant="caption" fontWeight="bold">Seguidores</Typography>
                <Typography variant="caption" fontWeight="bold">Avaliação</Typography>
                <Typography variant="caption" fontWeight="bold">Redes Sociais</Typography>
                <Typography variant="caption" fontWeight="bold">Solicitação enviada</Typography>
                <Typography variant="caption" fontWeight="bold"></Typography>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: '12px', mt: 2, overflowY: 'auto', maxHeight: 'calc(100% - 60px)' }}>
                {candidateList.length > 0 ? (
                    candidateList.map((application) => {
                        const influencer = application.influencer;
                        const randomStats = application.randomStats || {}; 
                        if (!influencer) return null;

                        return (
                            <Box key={application._id} sx={{ position: 'relative', backgroundColor: "rgba(255, 255, 255, 0.05)", borderRadius: "16px", overflow: 'hidden', transition: 'background-color 0.3s', '&:hover': { backgroundColor: "rgba(255, 255, 255, 0.1)" } }}>
                                <Box sx={{ display: "grid", gridTemplateColumns: gridTemplate, gap: 2, py: 2, px: 2, alignItems: "center" }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Avatar src={influencer.profileImageUrl} alt={influencer.name} sx={{ width: 48, height: 48, borderRadius: "12px" }} variant="rounded" />
                                        <Box>
                                            <Typography color="white" fontWeight="bold">{influencer.name} - {influencer.realName}</Typography>
                                            <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.7)" }}>Se candidatou para participar na campanha.</Typography>
                                        </Box>
                                    </Box>
                                    <Typography color="white" fontWeight="bold">{randomStats.followers}M</Typography>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                                        <Rating name={`rating-${influencer._id}`} value={parseFloat(randomStats.rating) || 0} precision={0.5} readOnly sx={{ color: ratingColor, '& .MuiRating-iconEmpty': { color: 'rgba(255,255,255,0.3)' }}} />
                                        <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.7)" }}>{randomStats.rating || 'N/A'} ({randomStats.count || 0})</Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                        {Object.keys(influencer.social || {}).filter(key => influencer.social[key]).map(net => <SocialIcon key={net} network={net} />)}
                                    </Box>
                                    <Typography color="white" fontWeight="bold">{formatTimeAgo(application.createdAt)}</Typography>
                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                        <Tooltip title="Aprovar Candidatura">
                                            <IconButton onClick={() => handleUpdateStatus(application._id, 'aprovada')} sx={{ backgroundColor: 'rgba(255, 0, 212, 0.2)', '&:hover': { backgroundColor: 'rgba(255, 0, 212, 0.3)' }, borderRadius: '8px' }}>
                                                <CheckCircleOutline sx={{ color: actionPink }} />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Rejeitar Candidatura">
                                            <IconButton onClick={() => handleUpdateStatus(application._id, 'rejeitada')} sx={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.2)' }, borderRadius: '8px' }}>
                                                <CancelOutlined sx={{ color: 'rgba(255,255,255,0.7)' }} />
                                            </IconButton>
                                        </Tooltip>
                                    </Box>
                                </Box>
                            </Box>
                        );
                    })
                ) : (
                    <Typography sx={{ textAlign: 'center', color: 'rgba(255,255,255,0.7)', p: 4 }}>
                        Ainda não há candidaturas para esta campanha.
                    </Typography>
                )}
            </Box>

            <Dialog open={dialogOpen} onClose={handleCloseDialog} PaperProps={{ sx: { backgroundColor: "rgba(40, 2, 39, 0.85)", color: "white", backdropFilter: "blur(10px)", borderRadius: '20px', border: "1px solid rgba(255, 255, 255, 0.1)" } }}>
                <DialogTitle sx={{ color: actionPink, fontWeight: 'bold' }}>{dialogContent.title}</DialogTitle>
                <DialogContent><DialogContentText sx={{ color: "rgba(255, 255, 255, 0.8)" }}>{dialogContent.message}</DialogContentText></DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog} sx={{ color: actionPink, fontWeight: 'bold' }}>OK</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default CampaignCandidates;