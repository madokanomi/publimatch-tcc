import React from 'react';
import PropTypes from 'prop-types';
import {
    Modal,
    Box,
    Typography,
    Button,
    CircularProgress,
} from '@mui/material';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import { motion } from 'framer-motion';

// Para usar a animação no Box do MUI
const MotionBox = motion(Box);

const FinalizationRequestContent = ({ notification, onConfirm, onDecline, colors, isSubmitting }) => {
    
    // ✅ Estilo unificado, igual ao do ConfirmationContent
    const cardStyle = {
        width: '100%',
        maxWidth: 400, // Ajustado para 400px para ficar idêntico
        color: "white",
        background: "linear-gradient(145deg, rgba(30, 10, 55, 0.95), rgba(20, 5, 35, 0.95))",
        border: "1px solid rgba(255, 255, 255, 0.2)",
        backdropFilter: "blur(15px)",
        borderRadius: "20px",
        p: 4,
        textAlign: 'center',
    };

    return (
        <MotionBox
            sx={cardStyle}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 20 } }}
            exit={{ scale: 0.8, opacity: 0 }}
        >
            {/* ✅ Estilo do ícone padronizado para combinar */}
            <TaskAltIcon sx={{ fontSize: 50, color: 'white', mb: 2 }} />

            <Typography variant="h4" component="h2" sx={{ mb: 1, fontWeight: 'bold' }}>
                Solicitação para Finalizar Campanha
            </Typography>
            <Typography variant="h5" sx={{ mb: 4, color: colors.grey[300] }}>
                {notification?.subtitle || "O participante solicita a finalização do contrato."}
            </Typography>
            
            {isSubmitting ? (
                // ✅ Spinner com a cor rosa padrão para consistência
                <CircularProgress sx={{ color: '#ff00d4' }} />
            ) : (
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
                    {/* ✅ Estilo do botão secundário simplificado para combinar */}
                    <Button onClick={onDecline} sx={{ color: colors.grey[300], textTransform: 'none', borderRadius: '10px' }}>
                        Rejeitar
                    </Button>
                    {/* ✅ Estilo do botão primário com a cor rosa padrão do sistema */}
                    <Button
                        onClick={onConfirm}
                        variant="contained"
                        sx={{
                            fontWeight: 'bold',
                            textTransform: 'none',
                            borderRadius: '10px',
                            background: "#ff00d4", // Cor principal
                            '&:hover': {
                                background: "#c400a5" // Um tom mais escuro para o hover
                            }
                        }}
                    >
                        Confirmar Finalização
                    </Button>
                </Box>
            )}
        </MotionBox>
    );
};

// Validação de propriedades (sem alterações)
FinalizationRequestContent.propTypes = {
    notification: PropTypes.object.isRequired,
    onConfirm: PropTypes.func.isRequired,
    onDecline: PropTypes.func.isRequired,
    colors: PropTypes.object.isRequired,
    isSubmitting: PropTypes.bool,
};

export default FinalizationRequestContent;