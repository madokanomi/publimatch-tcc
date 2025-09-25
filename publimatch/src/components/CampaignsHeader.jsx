// src/components/CampaignsHeader.jsx

import React from 'react';
import { Box, Typography, Button } from '@mui/material';
// Removemos a importação de AddIcon, pois não será mais usado
// import AddIcon from '@mui/icons-material/Add'; 
import { useNavigate } from 'react-router-dom';

const CampaignsHeader = () => {
    const navigate = useNavigate();

    const handleNewCampaignClick = () => {
        navigate('/campanhas/cadastrar');
    };

    return (
        <Box
            sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                p: 3,
                pb: 2,
                color: 'white',
            }}
        >
            <Typography variant="h2" fontWeight="bold">
                Campanhas
            </Typography>
            <Button
                variant="contained"
                // Removido: startIcon={<AddIcon />}
                onClick={handleNewCampaignClick}
                sx={{
                    mt: 0,
                    borderRadius: "30px",
                    transition: "all 0.2s ease-in-out",
                    background: "#FFFFFF",
                    boxShadow: "0px 0px 24.5px 4px rgba(255, 55, 235, 0.25)",
                    color: "#BF28B0",
                    fontWeight: "800",
                    textTransform: "none",
                    height: '40px',
                    // Adicionado para centralizar o conteúdo do botão
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    "&:hover": {
                        borderRadius: "10px",
                        background: "#ffffff46",
                        color: "white",
                        boxShadow: "none",
                        letterSpacing: 1,
                        fontSize: "13px",
                    }
                }}
            >
                <Typography 
                    variant="overline"
                    fontWeight={700}
                    sx={{ letterSpacing: 1.4, opacity: 0.8, fontSize: "13px" }}
                >
                    Cadastrar Campanha
                </Typography>
            </Button>
        </Box>
    );
};

export default CampaignsHeader;