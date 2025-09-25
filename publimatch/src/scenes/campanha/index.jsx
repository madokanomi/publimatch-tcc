import React from 'react';
import { Box } from '@mui/material';
import { motion } from 'framer-motion'; // 1. Importar o motion
import CampaignsHeader from '../../components/CampaignsHeader';
import CampaignsTable from '../../components/CampaignsTable';

// 2. Definir as variantes da animação
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.2 // Atraso entre a animação dos filhos
        }
    }
};

const itemVariants = {
    hidden: { y: 20, opacity: 0 }, // Começa 20px para baixo e invisível
    visible: {
        y: 0,
        opacity: 1, // Termina na posição original e visível
        transition: {
            duration: 0.5
        }
    }
};

const CampaignsPage = () => {
    return (
        <Box // Este Box externo ainda controla o scroll e padding
            sx={{
                width: '100%',
                height: '100vh',
                p: 3,
                overflowY: 'auto',
                '&::-webkit-scrollbar': {
                    width: '8px',
                    borderRadius: '4px',
                },
                '&::-webkit-scrollbar-track': {
                    background: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '4px',
                },
                '&::-webkit-scrollbar-thumb': {
                    background: 'rgba(255, 255, 255, 0.3)',
                    borderRadius: '4px',
                    '&:hover': {
                        background: 'rgba(255, 255, 255, 0.5)',
                    },
                },
            }}
        >
            {/* 3. Usar motion.div como container para aplicar as variantes */}
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
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