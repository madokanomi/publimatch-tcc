// pages/campanha/index.jsx

import React from 'react';
import { Box } from '@mui/material';
import { motion } from 'framer-motion';
import CampaignsHeader from '../../components/CampaignsHeader';
import CampaignsTable from '../../components/CampaignsTable';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.2 }
    }
};

const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
        y: 0,
        opacity: 1,
        transition: { duration: 0.5 }
    }
};

const CampaignsPage = () => {
    return (
        <Box
            sx={{
                width: '100%',
                height: '100vh', // A altura já está definida aqui, o que é ótimo!
                p: 3,
                overflowY: 'auto',
                // ... estilos da barra de rolagem ...
                '&::-webkit-scrollbar': { width: '8px', borderRadius: '4px' },
                '&::-webkit-scrollbar-track': { background: 'rgba(255, 255, 255, 0.1)', borderRadius: '4px' },
                '&::-webkit-scrollbar-thumb': {
                    background: 'rgba(255, 255, 255, 0.3)',
                    borderRadius: '4px',
                    '&:hover': { background: 'rgba(255, 255, 255, 0.5)' },
                },
            }}
        >
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                // ALTERAÇÃO: Adicionar estilo para criar o layout flexível
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%' // Garante que este contêiner preencha a altura do Box pai
                }}
            >
                <motion.div variants={itemVariants}>
                    <CampaignsHeader />
                </motion.div>
                
                <motion.div variants={itemVariants}>
                    <CampaignsTable />
                </motion.div>
            </motion.div>
        </Box>
    );
};

export default CampaignsPage;