// src/components/CampaignRow.jsx

import React from 'react';
import { Box, Typography, IconButton, Card, Tooltip } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNavigate } from 'react-router-dom';

const CampaignRow = ({ campaign, gridTemplate, showActions, onRemove }) => {
    const navigate = useNavigate();

    const handleRemoveClick = (event) => {
        event.stopPropagation();
        onRemove(campaign._id);
    };

    const handleEditClick = (event) => {
        event.stopPropagation();
        navigate(`/campaigns/edit/${campaign._id}`);
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case "aberta": return "#A8E349";
            case "finalizada": return "#DF3A3A";
            case "planejamento": return "#4dabf5";
            default: return "white";
        }
    };

    const getPrivacyColor = (privacy) => {
        return privacy?.toLowerCase() === "pública" ? "#A8E349" : "#DF3A3A";
    };

    const displayPayment = () => {
        const { paymentType, paymentValueExact, paymentValueMin, paymentValueMax } = campaign;
        if (paymentType === 'Exato') {
            return `R$ ${paymentValueExact.toLocaleString('pt-BR')}`;
        }
        if (paymentType === 'Aberto') {
            return `R$ ${paymentValueMin.toLocaleString('pt-BR')} - ${paymentValueMax.toLocaleString('pt-BR')}`;
        }
        return 'A Combinar';
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Indefinida';
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR', { timeZone: 'UTC' });
    };

    return (
        <Card
            onClick={() => navigate(`/campaign/${campaign._id}`)}
            sx={{
                // ✨ A MÁGICA ACONTECE AQUI ✨
                backgroundImage: `linear-gradient(90deg, rgba(22, 7, 83, 0.8), rgba(81, 4, 61, 0.7)), url(${campaign.logo})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                // --- Fim da alteração ---
                backdropFilter: "blur(10px)",
                borderRadius: "12px",
                mb: 1.5,
                cursor: "pointer",
                transition: "all 0.2s ease-in-out",
                position: "relative",
                "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: "0 4px 20px rgba(255, 55, 235, 0.25)",
                },
            }}
        >
            {/* O resto do seu código permanece igual */}
            {showActions && (
                <Box 
                    sx={{
                        position: "absolute",
                        top: '50%',
                        right: 8,
                        transform: 'translateY(-50%)',
                        zIndex: 1,
                        display: "flex",
                        gap: 1,
                    }}
                >
                    <Tooltip title="Editar">
                        <IconButton
                            onClick={handleEditClick}
                            size="small"
                            sx={{ 
                                bgcolor: "rgba(255,255,255,0.1)", 
                                color: "white", 
                                "&:hover": { bgcolor: "rgba(255,255,255,0.2)" },
                                width: 32,
                                height: 32
                            }}
                        >
                            <EditIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Remover">
                        <IconButton
                            onClick={handleRemoveClick}
                            size="small"
                            sx={{ 
                                bgcolor: "rgba(255,0,0,0.1)", 
                                color: "#ff6b6b", 
                                "&:hover": { bgcolor: "rgba(255,0,0,0.2)" },
                                width: 32,
                                height: 32
                            }}
                        >
                            <DeleteIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </Box>
            )}

            <Box sx={{ 
                display: "grid", 
                gridTemplateColumns: gridTemplate, 
                gap: 2, 
                alignItems: "center", 
                p: 2, 
                minHeight: "80px",
                pr: '96px',
                // Adiciona um fundo sutil ao texto para garantir legibilidade
                // caso a imagem de fundo seja muito clara.
                backgroundColor: 'rgba(0, 0, 0, 0.2)'
            }}>
                <Typography variant="subtitle1" fontWeight={700}>{campaign.title}</Typography>
                <Typography sx={{ color: getStatusColor(campaign.status), fontWeight: 700, textAlign: 'center' }}>{campaign.status}</Typography>
                <Typography sx={{ textAlign: 'center' }}>{`${formatDate(campaign.startDate)} - ${formatDate(campaign.endDate)}`}</Typography>
                <Typography sx={{ fontWeight: 500, textAlign: 'center' }}>{displayPayment()}</Typography>
                <Typography sx={{ fontWeight: 500, textAlign: 'center' }}>{campaign.applications || 0}</Typography>
                <Typography sx={{ color: getPrivacyColor(campaign.privacy), fontWeight: 700, textAlign: 'center' }}>{campaign.privacy}</Typography>
                <Typography sx={{ fontWeight: 500, textAlign: 'center' }}>{campaign.influencers || 0}</Typography>
            </Box>
        </Card>
    );
};

export default CampaignRow;