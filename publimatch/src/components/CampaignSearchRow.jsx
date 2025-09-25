// src/components/CampaignSearchRow.jsx

import React from 'react';
import { Box, Typography, IconButton, Card, Avatar, Tooltip, Chip } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { FaYoutube, FaInstagram, FaTwitter, FaTiktok } from 'react-icons/fa';
import { Groups, Category, AccessTimeFilled, AutoFixHigh, EventNote } from '@mui/icons-material'; // 👈 Adicionado EventNote

const SocialMediaIcon = ({ platform }) => {
    const socialMediaIcons = {
        youtube: <FaYoutube />,
        instagram: <FaInstagram />,
        twitter: <FaTwitter />,
        tiktok: <FaTiktok />,
    };
    const icon = socialMediaIcons[platform.toLowerCase()];
    return icon ? (
        <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', color: 'white' }}>
            {icon}
        </Box>
    ) : null;
};

const CampaignSearchRow = ({ campaign }) => {
    const navigate = useNavigate();

    return (
        <Card
            // ALTERAÇÃO: Adicionando um parâmetro de URL "view=about"
            onClick={() => navigate(`/campaign/${campaign.id}?view=about`)}
            sx={{
                backgroundImage: "linear-gradient(90deg, rgba(22, 7, 83, 0.8), rgba(81, 4, 61, 0.6))",
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
                    // NOVO gridTemplateColumns: Adicionada uma coluna extra
                    gridTemplateColumns: "1.5fr 1fr 1fr 1fr 1fr 1fr",
                    gap: 2,
                    alignItems: "center",
                    p: 2,
                    minHeight: "80px",
                }}
            >
                {/* Coluna Nome e Logo */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <Avatar
                        src={campaign.logo}
                        alt={campaign.name}
                        variant="rounded"
                        sx={{
                            width: 50,
                            height: 50,
                            border: "2px solid rgba(255,255,255,0.2)",
                        }}
                    />
                    <Typography variant="subtitle1" fontWeight={700} color="white">
                        {campaign.name}
                    </Typography>
                </Box>

                {/* Coluna Data de Início */}
                <Box display="flex" alignItems="center" gap={1}>
                    <Tooltip title="Data de Início">
                        <EventNote sx={{ color: "rgba(255,255,255,0.7)" }} />
                    </Tooltip>
                    <Typography sx={{ color: "rgba(255,255,255,0.7)" }}>{campaign.startDate}</Typography>
                </Box>

                {/* Coluna Data de Término */}
                <Box display="flex" alignItems="center" gap={1}>
                    <Tooltip title="Data de Término">
                        <AccessTimeFilled sx={{ color: "rgba(255,255,255,0.7)" }} />
                    </Tooltip>
                    <Typography sx={{ color: "rgba(255,255,255,0.7)" }}>{campaign.endDate}</Typography>
                </Box>

                {/* Coluna Categorias */}
                <Box display="flex" alignItems="center" flexWrap="wrap" gap={0.5}>
                    <Tooltip title="Categorias">
                        <Category sx={{ color: "rgba(255,255,255,0.7)" }} />
                    </Tooltip>
                    {campaign.categorias.slice(0, 2).map((cat, index) => (
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
                    <Typography fontWeight={500} color="white">{campaign.applications}</Typography>
                </Box>

                {/* Coluna Redes Sociais */}
                <Box display="flex" alignItems="center" gap={1}>
                    <Tooltip title="Redes Necessárias">
                        <AutoFixHigh sx={{ color: "rgba(255,255,255,0.7)" }} />
                    </Tooltip>
                    <Box display="flex" gap={1}>
                        {campaign.redesNecessarias.map((social, index) => (
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