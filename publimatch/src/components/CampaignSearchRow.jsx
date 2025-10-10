// src/components/CampaignSearchRow.jsx

import React from 'react';
import { Box, Typography, IconButton, Card, Avatar, Tooltip, Chip } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { FaYoutube, FaInstagram, FaTwitter, FaTiktok } from 'react-icons/fa';
import { Groups, Category, AccessTimeFilled, AutoFixHigh, EventNote } from '@mui/icons-material';

const SocialMediaIcon = ({ platform }) => {
    const socialMediaIcons = {
        youtube: <FaYoutube />,
        instagram: <FaInstagram />,
        twitter: <FaTwitter />,
        tiktok: <FaTiktok />,
    };
    const icon = socialMediaIcons[platform?.toLowerCase()]; // Adicionado optional chaining para segurança
    return icon ? (
        <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', color: 'white' }}>
            {icon}
        </Box>
    ) : null;
};

const CampaignSearchRow = ({ campaign }) => {
    const navigate = useNavigate();

    // Funções auxiliares (pode copiar ou adaptar se necessário do CampaignRow)
    const formatDate = (dateString) => {
        if (!dateString) return 'Indefinida';
        const date = new Date(dateString);
        // Usar 'pt-BR' e 'UTC' para garantir consistência, como no CampaignRow
        return date.toLocaleDateString('pt-BR', { timeZone: 'UTC' });
    };

    return (
        <Card
            // ALTERAÇÃO: Adicionando um parâmetro de URL "view=about" e usando _id
            onClick={() => navigate(`/campaign/${campaign._id}?view=about`)} // Use campaign._id aqui
            sx={{
                // ESTILIZAÇÃO DE FUNDO COM A IMAGEM
                backgroundImage: `linear-gradient(90deg, rgba(22, 7, 83, 0.8), rgba(81, 4, 61, 0.7)), url(${campaign.logo})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                backdropFilter: "blur(10px)",
                borderRadius: "12px",
                mb: 1.5,
                cursor: "pointer",
                transition: "all 0.2s ease-in-out",
                "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: "0 4px 20px rgba(255, 55, 235, 0.25)",
                },
            }}
        >
            <Box
                sx={{
                    display: "grid",
                    // Mantido o gridTemplateColumns da busca
                    gridTemplateColumns: "1.5fr 1fr 1fr 1fr 1fr 1fr",
                    gap: 2,
                    alignItems: "center",
                    p: 2,
                    minHeight: "80px",
                    // Adicionado um background semi-transparente para melhor legibilidade do texto
                    backgroundColor: 'rgba(0, 0, 0, 0.2)',
                }}
            >
                {/* Coluna Nome e Logo (Agora apenas o nome, a logo está no fundo) */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    {/* A logo não será mais um Avatar aqui, pois está no fundo */}
                    <Typography variant="subtitle1" fontWeight={700} color="white">
                        {campaign.title} {/* Usando campaign.title para o nome da campanha */}
                    </Typography>
                </Box>

                {/* Coluna Data de Início */}
                <Box display="flex" alignItems="center" gap={1}>
                    <Tooltip title="Data de Início">
                        <EventNote sx={{ color: "rgba(255,255,255,0.7)" }} />
                    </Tooltip>
                    <Typography sx={{ color: "rgba(255,255,255,0.7)" }}>{formatDate(campaign.startDate)}</Typography>
                </Box>

                {/* Coluna Data de Término */}
                <Box display="flex" alignItems="center" gap={1}>
                    <Tooltip title="Data de Término">
                        <AccessTimeFilled sx={{ color: "rgba(255,255,255,0.7)" }} />
                    </Tooltip>
                    <Typography sx={{ color: "rgba(255,255,255,0.7)" }}>{formatDate(campaign.endDate)}</Typography>
                </Box>

                {/* Coluna Categorias */}
                <Box display="flex" alignItems="center" flexWrap="wrap" gap={0.5}>
                    <Tooltip title="Categorias">
                        <Category sx={{ color: "rgba(255,255,255,0.7)" }} />
                    </Tooltip>
                    {campaign.categories?.slice(0, 2).map((cat, index) => (
                        <Chip
                            key={index}
                            label={cat}
                            size="small"
                            sx={{
                                backgroundColor: "rgba(255,255,255,0.1)",
                                color: "white",
                                fontWeight: "bold",
                            }}
                        />
                    ))}
                </Box>

                {/* Coluna Vagas Abertas */}
                <Box display="flex" alignItems="center" gap={1}>
                    <Tooltip title="Vagas Abertas">
                        <Groups sx={{ color: "rgba(255,255,255,0.7)" }} />
                    </Tooltip>
                    <Typography fontWeight={500} color="white">{campaign.applications || 0}</Typography>
                </Box>

                {/* Coluna Redes Sociais */}
                <Box display="flex" alignItems="center" gap={1}>
                    <Tooltip title="Redes Necessárias">
                        <AutoFixHigh sx={{ color: "rgba(255,255,255,0.7)" }} />
                    </Tooltip>
                    <Box display="flex" gap={1}>
                        {campaign.requiredSocials?.map((social, index) => (
                            <Tooltip key={index} title={social}>
                                <SocialMediaIcon platform={social} />
                            </Tooltip>
                        ))}
                    </Box>
                </Box>
            </Box>
        </Card>
    );
};

export default CampaignSearchRow;