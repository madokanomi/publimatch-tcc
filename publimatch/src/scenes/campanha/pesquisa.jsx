import React from 'react';
import { Box } from '@mui/material';
import CampaignsSearch from '../../components/CampaignsSearch';

// 1. IMPORTAR O 'MOTION' DA FRAMER-MOTION
import { motion } from 'framer-motion';

// 2. DEFINIR AS VARIANTES DA ANIMAÇÃO (ESTADO INICIAL E FINAL)
// Podemos definir isso fora do componente para evitar recriação a cada renderização.
const pageVariants = {
  initial: {
    opacity: 0,
    y: 20, // Começa 20px para baixo
  },
  animate: {
    opacity: 1,
    y: 0, // Move para a posição original
    transition: {
      duration: 0.6,
      ease: 'easeOut',
    },
  },
  exit: { // Opcional: Define a animação de saída se a página estiver dentro de um <AnimatePresence>
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.3,
      ease: 'easeIn',
    }
  }
};

const CampaignSearchPage = () => {
    return (
        // 3. APLICAR A ANIMAÇÃO AO CONTAINER PRINCIPAL DA PÁGINA
        <Box
            component={motion.div} // Converte o Box do MUI em um componente de animação
            initial="initial"        // Define o estado inicial da animação
            animate="animate"        // Define o estado final
            exit="exit"              // Define o estado de saída (opcional)
            variants={pageVariants}  // Passa as variantes que definimos acima
            sx={{ width: '100%', height: '100vh', p: 3, overflowY: 'auto' }}
        >
            <CampaignsSearch />
        </Box>
    );
};

export default CampaignSearchPage;