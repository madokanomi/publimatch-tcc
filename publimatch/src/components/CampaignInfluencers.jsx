// src/components/CampaignInfluencers.jsx

import React, { useState } from 'react';
import { Box, Typography, Avatar, LinearProgress } from "@mui/material";
import { influencers } from "../data/mockInfluencer"; // A lista completa já é importada aqui
import { Instagram, YouTube, Twitter, StarRounded } from "@mui/icons-material";
import { FaTwitch, FaTiktok } from 'react-icons/fa';
import ReviewInfluencer from './ReviewInfluencer';

const SocialIcon = ({ network }) => {
    // ... (código do SocialIcon sem alterações)
    switch (network) {
        case "instagram": return <Instagram sx={{ color: "rgba(255,255,255,0.7)" }} />;
        case "youtube": return <YouTube sx={{ color: "rgba(255,255,255,0.7)" }} />;
        case "twitter": return <Twitter sx={{ color: "rgba(255,255,255,0.7)" }} />;
        case "twitch": return <FaTwitch style={{ color: "rgba(255,255,255,0.7)", fontSize: '24px' }} />;
        case "tiktok": return <FaTiktok style={{ color: "rgba(255,255,255,0.7)", fontSize: '24px' }} />;
        default: return null;
    }
};

const CampaignInfluencers = ({ campaign }) => {
    const [reviewingInfluencer, setReviewingInfluencer] = useState(null);

    const campaignInfluencers = influencers; 
    const publicacoes = 26;
    const plataforma = "Stories, publicações e vídeos";
    const conversao = "85%";
    const gridTemplate = "2.5fr 1.5fr 1.5fr 1fr 1.5fr 1fr";
    const primaryPink = "rgb(255, 0, 212)"; 
    const lightPinkBg = "rgba(255, 0, 212, 0.2)";

    if (reviewingInfluencer) {
        return (
            <ReviewInfluencer 
                influencer={reviewingInfluencer}
                campaign={campaign}
                onClose={() => setReviewingInfluencer(null)}
                // ALTERAÇÃO AQUI: Passa a lista completa de influenciadores como prop
                allInfluencers={campaignInfluencers}
            />
        );
    }
    
    return (
        <Box
            sx={{
                backgroundColor: "rgba(20, 1, 19, 0.6)",
                p: 3,
                borderRadius: "12px",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                height: '100%',
                mb:"100px",
                overflowY: 'hidden',
                "&::-webkit-scrollbar": { width: "8px" },
                "&::-webkit-scrollbar-track": { background: "rgba(0, 0, 0, 0.2)", borderRadius: "10px" },
                "&::-webkit-scrollbar-thumb": { backgroundColor: "rgba(255, 255, 255, 0.3)", borderRadius: "10px", border: "2px solid transparent", backgroundClip: "content-box" },
                "&::-webkit-scrollbar-thumb:hover": { backgroundColor: "rgba(255, 255, 255, 0.5)" }
            }}
        >
            {/* O resto do JSX da lista de influenciadores continua igual... */}
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
                <Typography variant="caption" fontWeight="bold">Visualizações atingidas</Typography>
                <Typography variant="caption" fontWeight="bold">Publicações realizadas</Typography>
                <Typography variant="caption" fontWeight="bold">Redes Sociais</Typography>
                <Typography variant="caption" fontWeight="bold">Realizado em</Typography>
                <Typography variant="caption" fontWeight="bold">Conversão</Typography>
            </Box>

            {/* Dados dos influenciadores */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: '12px', mt: 2 }}>
                {campaignInfluencers.map((inf) => (
                    <Box key={inf.id} sx={{ 
                        position: 'relative',
                        backgroundColor: "rgba(255, 255, 255, 0.05)",
                        borderRadius: "16px",
                        overflow: 'hidden',
                        transition: 'background-color 0.3s',
                        '&:hover': {
                            backgroundColor: "rgba(255, 255, 255, 0.1)",
                        }
                    }}>
                        <Box sx={{
                            display: "grid",
                            gridTemplateColumns: gridTemplate,
                            gap: 2,
                            py: 2,
                            px: 2,
                            alignItems: "center",
                        }}>
                            {/* Foto e Nome */}
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Avatar src={inf.imagem} alt={inf.nome} sx={{ width: 48, height: 48, borderRadius: "12px" }} variant="rounded" />
                                <Box>
                                    <Typography color="white" fontWeight="bold">{inf.nome}</Typography>
                                    <Box 
                                        onClick={() => setReviewingInfluencer(inf)}
                                        sx={{
                                            display: 'inline-flex', alignItems: 'center', gap: 0.5,
                                            backgroundColor: 'rgba(179, 105, 245, 0.15)', borderRadius: '6px',
                                            px: 1, py: 0.25, mt: 0.5, cursor: 'pointer',
                                            transition: 'background-color 0.3s',
                                            '&:hover': {
                                                backgroundColor: 'rgba(179, 105, 245, 0.3)',
                                            }
                                        }}>
                                        <StarRounded sx={{ fontSize: '16px', color: 'white' }} />
                                        <Typography variant="caption" sx={{ color: 'white', fontWeight: 500 }}>
                                            Avaliar influenciador
                                        </Typography>
                                    </Box>
                                </Box>
                            </Box>

                            <Typography color="white" fontWeight="bold">{inf.views}M</Typography>
                            <Typography color="white" fontWeight="bold">{publicacoes}</Typography>
                            <Box sx={{ display: 'flex', gap: 1 }}>{inf.redes.map(net => <SocialIcon key={net} network={net} />)}</Box>
                            <Typography color="white" fontWeight="bold">{plataforma}</Typography>
                            <Typography color={primaryPink} fontWeight="bold">{conversao}</Typography>
                        </Box>
                        <LinearProgress variant="determinate" value={parseInt(conversao)} sx={{
                            position: 'absolute', bottom: 0, left: 0, width: '100%', height: '3px',
                            backgroundColor: lightPinkBg,
                            '& .MuiLinearProgress-bar': { backgroundColor: primaryPink }
                        }} />
                    </Box>
                ))}
            </Box>
        </Box>
    );
};

export default CampaignInfluencers;