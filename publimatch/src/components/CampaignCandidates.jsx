// src/components/CampaignCandidates.jsx

// ALTERAÇÃO: Importando useState e componentes do Dialog
import React, { useState } from "react";
import { 
    Box, Typography, Avatar, Rating, IconButton, 
    Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button 
} from "@mui/material";
import { influencers as initialInfluencers } from "../data/mockInfluencer"; 
import { Instagram, YouTube, Twitter, CheckCircleOutline, CancelOutlined } from "@mui/icons-material";
import { FaTwitch, FaTiktok } from 'react-icons/fa';

const SocialIcon = ({ network }) => {
    const iconStyle = { color: "rgba(255,255,255,0.7)", fontSize: '20px' };
    switch (network) {
        case "instagram": return <Instagram sx={iconStyle} />;
        case "youtube": return <YouTube sx={iconStyle} />;
        case "twitter": return <Twitter sx={iconStyle} />;
        case "twitch": return <FaTwitch style={iconStyle} />;
        case "tiktok": return <FaTiktok style={iconStyle} />;
        default: return null;
    }
};

const CampaignCandidates = ({ campaign }) => {
    // ALTERAÇÃO: Gerenciando a lista de influenciadores com estado para permitir a remoção
    const [candidateList, setCandidateList] = useState(initialInfluencers);

    // ALTERAÇÃO: Estados para controlar o diálogo (pop-up)
    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogContent, setDialogContent] = useState({ title: '', message: '' });
    const [selectedInfluencerId, setSelectedInfluencerId] = useState(null);

    const ratingColor = "#FFD700"; 
    const actionPink = "rgb(255, 0, 212)";
    const gridTemplate = "2.5fr 1.5fr 1.5fr 1.5fr 1fr 0.5fr";
    const timeAgoOptions = ["1 Dia", "2 Dias", "5 Dias", "1 Semana", "1 Mês"];

    // ALTERAÇÃO: Função para lidar com a aceitação de um candidato
    const handleAccept = (influencerId) => {
        setSelectedInfluencerId(influencerId);
        setDialogContent({
            title: "Influenciador Aceito",
            message: "O influenciador foi aceito e adicionado à campanha."
        });
        setDialogOpen(true);
    };

    // ALTERAÇÃO: Função para lidar com a negação de um candidato
    const handleDeny = (influencerId) => {
        setSelectedInfluencerId(influencerId);
        setDialogContent({
            title: "Influenciador Negado",
            message: "A candidatura do influenciador foi negada."
        });
        setDialogOpen(true);
    };

    // ALTERAÇÃO: Função para fechar o diálogo e remover o influenciador da lista
    const handleCloseDialog = () => {
        if (selectedInfluencerId) {
            setCandidateList(prevList => 
                prevList.filter(inf => inf.id !== selectedInfluencerId)
            );
        }
        setDialogOpen(false);
        setSelectedInfluencerId(null);
    };


    return (
        <Box
            sx={{
                backgroundColor: "rgba(20, 1, 19, 0.6)",
                p: 3,
                borderRadius: "12px",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                height: '100%',
                mb:"100px",
                overflowY: 'hiden',
                "&::-webkit-scrollbar": { width: "8px" },
                "&::-webkit-scrollbar-track": { background: "rgba(0, 0, 0, 0.2)", borderRadius: "10px" },
                "&::-webkit-scrollbar-thumb": { backgroundColor: "rgba(255, 255, 255, 0.3)", borderRadius: "10px", border: "2px solid transparent", backgroundClip: "content-box" },
                "&::-webkit-scrollbar-thumb:hover": { backgroundColor: "rgba(255, 255, 255, 0.5)" }
            }}
        >
            {/* Títulos das colunas */}
            <Box
                sx={{
                    display: "grid",
                    gridTemplateColumns: gridTemplate,
                    gap: 2,
                    py: 1.5,
                    px: 2,
                    alignItems: "center",
                    color: "rgba(255,255,255,0.6)",
                    fontWeight: "bold",
                    textTransform: 'uppercase',
                    fontSize: '0.8rem',
                }}
            >
                <Typography variant="caption" fontWeight="bold">Nome</Typography>
                <Typography variant="caption" fontWeight="bold">Seguidores</Typography>
                <Typography variant="caption" fontWeight="bold">Avaliação</Typography>
                <Typography variant="caption" fontWeight="bold">Redes Sociais</Typography>
                <Typography variant="caption" fontWeight="bold">Solicitação enviada</Typography>
                <Typography variant="caption" fontWeight="bold"></Typography>
            </Box>

            {/* Dados dos Candidatos */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: '12px', mt: 2 }}>
                {candidateList.map((influencer, index) => ( // ALTERAÇÃO: Mapeando a lista do estado
                    <Box key={influencer.id} sx={{ 
                        position: 'relative',
                        backgroundColor: "rgba(255, 255, 255, 0.05)",
                        borderRadius: "16px",
                        overflow: 'hidden',
                        transition: 'background-color 0.3s',
                        '&:hover': {
                            backgroundColor: "rgba(255, 255, 255, 0.1)",
                        }
                    }}>
                        <Box
                            sx={{
                                display: "grid",
                                gridTemplateColumns: gridTemplate,
                                gap: 2,
                                py: 2,
                                px: 2,
                                alignItems: "center",
                            }}
                        >
                            {/* ... (código do nome, seguidores, etc. permanece o mesmo) ... */}
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Avatar src={influencer.imagem} alt={influencer.nome} sx={{ width: 48, height: 48, borderRadius: "12px" }} variant="rounded" />
                                <Box>
                                    <Typography color="white" fontWeight="bold">{influencer.nome} - {influencer.nomeReal}</Typography>
                                    <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.7)" }}>Se candidatou para participar na campanha.</Typography>
                                </Box>
                            </Box>
                            <Typography color="white" fontWeight="bold">{influencer.seguidores}M</Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                                <Rating name={`rating-${influencer.id}`} value={influencer.avaliacao} precision={0.5} readOnly sx={{ color: ratingColor, '& .MuiRating-iconEmpty': { color: 'rgba(255,255,255,0.3)' }}} />
                                <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.7)" }}>{influencer.avaliacao} ({Math.floor(Math.random() * 2000) + 1000})</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', gap: 1 }}>{influencer.redes.map(net => <SocialIcon key={net} network={net} />)}</Box>
                            <Typography color="white" fontWeight="bold">{timeAgoOptions[index % timeAgoOptions.length]}</Typography>
                            
                            {/* Botões de Ação */}
                            <Box sx={{ display: 'flex', gap: 1 }}>
                                {/* ALTERAÇÃO: Adicionando onClick para chamar a função handleAccept */}
                                <IconButton onClick={() => handleAccept(influencer.id)} sx={{ backgroundColor: 'rgba(255, 0, 212, 0.2)', '&:hover': { backgroundColor: 'rgba(255, 0, 212, 0.3)' }, borderRadius: '8px' }}>
                                    <CheckCircleOutline sx={{ color: actionPink }} />
                                </IconButton>
                                {/* ALTERAÇÃO: Adicionando onClick para chamar a função handleDeny */}
                                <IconButton onClick={() => handleDeny(influencer.id)} sx={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.2)' }, borderRadius: '8px' }}>
                                    <CancelOutlined sx={{ color: 'rgba(255,255,255,0.7)' }} />
                                </IconButton>
                            </Box>
                        </Box>
                    </Box>
                ))}
            </Box>

            {/* ALTERAÇÃO: Componente Dialog para o pop-up de notificação */}
            <Dialog
                open={dialogOpen}
                onClose={handleCloseDialog}
                PaperProps={{
                    sx: {
                        backgroundColor: "rgba(40, 2, 39, 0.85)", // Fundo roxo escuro e semi-transparente
                        color: "white",
                        backdropFilter: "blur(10px)",
                        borderRadius: '20px',
                        border: "1px solid rgba(255, 255, 255, 0.1)"
                    }
                }}
            >
                <DialogTitle sx={{ color: actionPink, fontWeight: 'bold' }}>
                    {dialogContent.title}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{ color: "rgba(255, 255, 255, 0.8)" }}>
                        {dialogContent.message}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog} sx={{ color: actionPink, fontWeight: 'bold' }}>
                        OK
                    </Button>
                </DialogActions>
            </Dialog>

        </Box>
    );
};

export default CampaignCandidates;