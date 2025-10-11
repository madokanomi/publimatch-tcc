import React from 'react';
import { useState, useEffect } from 'react';
import {
    Modal,
    Box,
    Typography,
    Button,
    CircularProgress,
    Card,
    CardMedia,
    CardContent,
    CardActions,
    Divider,
    IconButton,
    Backdrop,
} from '@mui/material';
import { useNotificationModal } from '../scenes/global/NotificationContext';
import { useTheme } from '@emotion/react';
import { tokens } from '../theme';
import TiptapContent from './TiptapContent';
import axios from 'axios';
import { useAuth } from '../auth/AuthContext';
// Animações e Ícones no estilo do sistema
import { motion, AnimatePresence } from "framer-motion";
import CloseIcon from '@mui/icons-material/Close';
import CampaignIcon from '@mui/icons-material/Campaign';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

const MotionBox = motion(Box);

const CampaignNotificationModal = () => {
    const { user } = useAuth(); 
    const { 
        isModalOpen, closeModal, campaignDetails, isLoading,
        removeNotification, 
        currentNotification // ✅ MUDANÇA 1: Receba o objeto completo
    } = useNotificationModal();
    
     console.log("Objeto da Campanha recebido:", campaignDetails);

    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const [status, setStatus] = useState('idle'); // 'idle', 'loading', 'success', 'error'
    const [message, setMessage] = useState('');

 useEffect(() => {
        if (status === 'success' || status === 'error') {
            const timer = setTimeout(() => {
                closeModal();
            }, 2500); // Fecha após 2.5 segundos

            return () => clearTimeout(timer);
        }
    }, [status, closeModal]);

    // Efeito para resetar o estado quando o modal é fechado
    useEffect(() => {
        if (!isModalOpen) {
            // Pequeno delay para a animação de saída terminar antes de resetar
            setTimeout(() => {
                setStatus('idle');
                setMessage('');
            }, 300);
        }
    }, [isModalOpen]);

    const handleApply = async () => {
        if (!campaignDetails?._id) {
            setMessage("Erro: ID da campanha não encontrado.");
            setStatus('error');
            return;
        }

        setStatus('loading'); // ✅ FEEDBACK IMEDIATO PARA O USUÁRIO

        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };

            const { data } = await axios.post(
                `http://localhost:5001/api/campaigns/${campaignDetails._id}/apply`,
                {}, 
                config
            );

             if (currentNotification) { // ✅ MUDANÇA 2: Use o ID do objeto
            removeNotification(currentNotification.id);
        }
            
            setMessage(data.message);
            setStatus('success');

        } catch (error) {
            const errorMessage = error.response?.data?.message || "Ocorreu um erro ao aplicar para a campanha.";
            setMessage(errorMessage);
            setStatus('error');
        }
    };

     const handleDecline = () => {
        setStatus('loading');
        if (currentNotification) { // ✅ MUDANÇA 3: Use o ID do objeto
            removeNotification(currentNotification.id);
        }
        // Use o nome da campanha para a mensagem de recusa
        setMessage(`Você recusou a campanha "${ campaignDetails?.title|| 'desconhecida'}".`);
        setStatus('success'); 
    };
    // Estilos do conteúdo do modal, SEM posicionamento
    const modalStyle = {
        // As 4 linhas de posicionamento foram removidas daqui
        width: '100%',
        maxWidth: 550,
        color: "white",
        background: "linear-gradient(145deg, rgba(24, 6, 49, 0.9), rgba(15, 2, 31, 0.9))",
        border: "1px solid rgba(255, 255, 255, 0.2)",
        backdropFilter: "blur(12px)",
        borderRadius: "24px",
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
           
    };

    return (
        <AnimatePresence>
            {isModalOpen && (
                <Modal
                    open={isModalOpen}
                    onClose={closeModal}
                    closeAfterTransition
                    slots={{ backdrop: Backdrop }}
                    slotProps={{
                        backdrop: {
                            timeout: 500,
                            sx: {
                                backdropFilter: 'blur(5px)',
                                backgroundColor: 'rgba(0, 0, 0, 0.5)'
                            }
                        },
                    }}
                    // 👇 MUDANÇA PRINCIPAL AQUI: Centralizando o Modal com Flexbox
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                     
                    }}
                >
                    <MotionBox
                        sx={modalStyle}
                        initial={{ y: 30, opacity: 0 }}
                        animate={{
                            y: 0,
                            opacity: 1,
                            boxShadow: "0px 10px 80px rgba(255, 0, 212, 0.3)",
                            transition: { type: "spring", damping: 25, stiffness: 200 }
                        }}
                        exit={{ y: 30, opacity: 0, transition: { duration: 0.2 } }}
                    >
                        {status === 'loading' || isLoading ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 450 }}>
                                <CircularProgress sx={{ color: '#ff00d4' }} />
                            </Box>
                        ) : status === 'success' ? (
                            <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: 450, p: 3, textAlign: 'center' }}>
                                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 10 }}>
                                    <CheckCircleOutlineIcon sx={{ fontSize: 80, color: colors.greenAccent[500] }} />
                                </motion.div>
                                <Typography variant="h4" sx={{ mt: 3 }}>{message}</Typography>
                            </Box>
                        ) : status === 'error' ? (
                            <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: 450, p: 3, textAlign: 'center' }}>
                                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 10 }}>
                                    <ErrorOutlineIcon sx={{ fontSize: 80, color: colors.redAccent[500] }} />
                                </motion.div>
                                <Typography variant="h4" sx={{ mt: 3 }}>{message}</Typography>
                            </Box>
                        ) : campaignDetails && (
                            <Card sx={{ background: 'transparent', boxShadow: 'none', display: 'flex', flexDirection: 'column', maxHeight: '90vh' }}>

                                {/* CABEÇALHO PERSONALIZADO */}
                                <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                        <CampaignIcon sx={{ color: "#ff00d4" }} />
                                        <Typography variant="h5" fontWeight="bold">
                                            Convite para Campanha
                                        </Typography>
                                    </Box>
                                    <IconButton onClick={closeModal} size="small" sx={{ color: 'white' }}>
                                        <CloseIcon />
                                    </IconButton>
                                </Box>

 <CardMedia
    component="img"
    height="220"
    image={campaignDetails.logo || 'https://images.unsplash.com/...'} // ✅ ALTERADO AQUI
    alt={`Imagem da campanha ${campaignDetails.name}`}
    sx={{ objectFit: 'cover' }}
/>

                                {/* CONTEÚDO */}
                                <CardContent sx={{ flexGrow: 1, overflowY: 'auto', p: 3,   "&::-webkit-scrollbar": { width: "10px", marginRight: "10px" },
        "&::-webkit-scrollbar-track": { background: "rgba(255, 255, 255, 0.1)", borderRadius: "10px" },
        "&::-webkit-scrollbar-thumb": { background: "rgba(255, 255, 255, 0.3)", borderRadius: "10px" },
        "&::-webkit-scrollbar-thumb:hover": { background: "rgba(255, 255, 255, 0.6)" }, }}>
                                        <Typography 
                                        variant="h4" 
                                        component="h2"
                                        sx={{ color: colors.grey[200], mb: 1 }}
                                    >
                                        {currentNotification?.title}
                                    </Typography>
                                    
                                    {/* NOME DA CAMPANHA */}
                                    <Typography
                                        variant="h2"
                                        component="h3"
                                        fontWeight="900"
                                        gutterBottom
                                        sx={{
                                            color: '#ff00d4',
                                            textShadow: '0 0 8px rgba(255, 0, 212, 0.36)'
                                        }}
                                    >
                                        {campaignDetails?.title}
                                    </Typography>
                                    <Box sx={{ color: colors.grey[200], mt: 2, fontFamily: 'sans-serif' }}>
                                        <TiptapContent content={campaignDetails.description} />
                                    </Box>
                                </CardContent>

                                <Divider sx={{ borderColor: 'rgba(255,255,255,0.2)' }} />

                                {/* AÇÕES (BOTÕES) */}
                                <CardActions sx={{ p: 3, justifyContent: 'flex-end', gap: 2 }}>
                                    <Button
                                        onClick={handleDecline}
                                        sx={{
                                            color: colors.grey[300],
                                            borderRadius: '10px',
                                            bgcolor: 'rgba(255,255,255,0.05)',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            textTransform: 'none',
                                            '&:hover': {
                                                bgcolor: 'rgba(255,255,255,0.1)',
                                                borderColor: 'rgba(255,255,255,0.3)'
                                            }
                                        }}
                                    >
                                        Recusar
                                    </Button>
                                    <Button
                                        onClick={handleApply}
                                        variant="contained"
                                        startIcon={<RocketLaunchIcon />}
                                        sx={{
                                            fontWeight: 'bold',
                                            borderRadius: '10px',
                                            px: 3,
                                            py: 1,
                                            textTransform: 'none',
                                            background: 'linear-gradient(45deg, #ff00d4 30%, #c400a5 90%)',
                                            boxShadow: '0 0 20px rgba(255, 0, 212, 0.6)',
                                            transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                                            '&:hover': {
                                                transform: 'scale(1.05)',
                                                boxShadow: '0 0 30px rgba(255, 0, 212, 0.8)',
                                            }
                                        }}
                                    >
                                        Aceitar Convite
                                    </Button>
                                </CardActions>
                            </Card>
                        )}
                    </MotionBox>
                </Modal>
            )}
        </AnimatePresence>
    );
};

export default CampaignNotificationModal;