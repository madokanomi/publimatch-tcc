import React from 'react';
import { useState, useEffect } from 'react';
import {
    Modal, Box, Typography, Button, CircularProgress, Card,
    CardMedia, CardContent, CardActions, Divider, IconButton, Backdrop,
} from '@mui/material';
import { useNotificationModal } from '../scenes/global/NotificationContext';
import { useTheme } from '@emotion/react';
import { tokens } from '../theme';
import TiptapContent from './TiptapContent';
import axios from 'axios';
import { useAuth } from '../auth/AuthContext';
import { motion, AnimatePresence } from "framer-motion";
import CloseIcon from '@mui/icons-material/Close';
import CampaignIcon from '@mui/icons-material/Campaign';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { useNavigate } from 'react-router-dom';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import FinalizationRequestContent from './FinalizationRequestContent';
import { useConversation } from '../scenes/chat/ConversationContext'; 

const MotionBox = motion(Box);

const StatusDisplay = ({ status, message, colors }) => {
    const style = {
        width: '100%', maxWidth: 450, color: "white",
        background: "linear-gradient(145deg, rgba(24, 6, 49, 0.9), rgba(15, 2, 31, 0.9))",
        border: "1px solid rgba(255, 255, 255, 0.2)", backdropFilter: "blur(12px)",
        borderRadius: "24px", p: 4, textAlign: 'center', display: 'flex',
        flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 300,
    };
    const isSuccess = status === 'success';
    return (
        <MotionBox sx={style} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }}>
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 10 }}>
                {isSuccess ? <CheckCircleOutlineIcon sx={{ fontSize: 80, color: colors.greenAccent[500] }} /> : <ErrorOutlineIcon sx={{ fontSize: 80, color: colors.redAccent[500] }} />}
            </motion.div>
            <Typography variant="h4" sx={{ mt: 3 }}>{message}</Typography>
        </MotionBox>
    );
};

const ConfirmationContent = ({ onConfirm, onClose, colors }) => {
    const confirmationModalStyle = {
        width: '100%', maxWidth: 400, color: "white",
        background: "linear-gradient(145deg, rgba(30, 10, 55, 0.95), rgba(20, 5, 35, 0.95))",
        border: "1px solid rgba(255, 255, 255, 0.2)", backdropFilter: "blur(15px)",
        borderRadius: "20px", p: 4, textAlign: 'center',
    };
    return (
        <MotionBox sx={confirmationModalStyle} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 20 } }} exit={{ scale: 0.8, opacity: 0 }}>
            <QuestionAnswerIcon sx={{ fontSize: 50, color:'white', mb: 2 }} />
            <Typography variant="h4" component="h2" sx={{ mb: 3 }}>Inscrição realizada com sucesso!</Typography>
            <Typography variant="h5" sx={{ mb: 4, color: colors.grey[300] }}>Deseja enviar uma mensagem para o agente da campanha?</Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
                <Button onClick={onClose} sx={{ color: colors.grey[300], textTransform: 'none', borderRadius: '10px' }}>Não, fechar</Button>
                <Button onClick={onConfirm} variant="contained" sx={{ fontWeight: 'bold', textTransform: 'none', borderRadius: '10px', background: "#ff00d4" }}>Sim, enviar mensagem</Button>
            </Box>
        </MotionBox>
    );
};

const CampaignNotificationModal = () => {
    const { user } = useAuth(); 
    const { setSelectedConversation, setConversations, conversations } = useConversation();
    const navigate = useNavigate();
    const { isModalOpen, closeModal, campaignDetails, isLoading, removeNotification, currentNotification } = useNotificationModal();
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const [status, setStatus] = useState('idle'); 
    const [message, setMessage] = useState('');
    const [showSendMessageModal, setShowSendMessageModal] = useState(false);

    // ✅ FUNÇÃO MODIFICADA: Envio automático de mensagem
    const handleConfirmSendMessage = async () => {
        const adAgentId = campaignDetails?.createdBy?._id;
        const campaignTitle = campaignDetails?.title; 

        if (!adAgentId) {
            console.error("ID do Agente não encontrado.");
            return;
        }

        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            // 1. Garante conversa
            const { data: conversationData } = await axios.post(`http://localhost:5001/api/chat/ensure`, { userId: adAgentId }, config);

            // 2. Atualiza Contexto
            const conversationExists = conversations.some(c => c._id === conversationData._id);
            if (!conversationExists) {
                setConversations(prevConvos => [conversationData, ...prevConvos]);
            }
            setSelectedConversation(conversationData);

            // 3. ✨ ENVIA MENSAGEM AUTOMÁTICA ✨
            const autoMessage = `Olá! Acabei de aceitar o convite para a campanha "${campaignTitle}". Estou à disposição para começarmos! 🚀`;
            
            // ✅ CORREÇÃO:
            // A rota é /send/:receiverId e o body espera apenas o { text }
            await axios.post(`http://localhost:5001/api/chat/send/${adAgentId}`, {
                text: autoMessage
            }, config);

            closeModal();
            navigate(`/conversa/${conversationData._id}`);

        } catch (error) {
            console.error("Erro ao garantir ou criar a conversa:", error);
            setMessage("Erro ao iniciar chat.");
            setStatus('error');
        }
    };

    const handleRejectFinalization = () => {
        setStatus('loading');
        if (currentNotification) removeNotification(currentNotification.id);
        setMessage("A solicitação de finalização foi rejeitada.");
        setStatus('success'); 
    };

    const handleConfirmFinalize = async () => {
        if (!campaignDetails?._id) { setMessage("Erro: ID da campanha não encontrado."); setStatus('error'); return; }
        setStatus('loading');
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.put(`http://localhost:5001/api/campaigns/${campaignDetails._id}/finalize`, {}, config);
            setMessage("Campanha finalizada com sucesso!");
            setStatus('success');
            if (currentNotification) removeNotification(currentNotification.id);
        } catch (error) {
            setMessage(error.response?.data?.message || "Ocorreu um erro ao finalizar a campanha.");
            setStatus('error');
        }
    };

    useEffect(() => {
        if ((status === 'success' && !showSendMessageModal) || status === 'error') {
            const timer = setTimeout(() => { closeModal(); }, 2500);
            return () => clearTimeout(timer);
        }
    }, [status, showSendMessageModal, closeModal]);

    useEffect(() => {
        if (!isModalOpen) {
            setTimeout(() => { setStatus('idle'); setMessage(''); }, 300);
        }
    }, [isModalOpen]);

    const handleApply = async () => {
        if (!currentNotification || !currentNotification.entityId) { setMessage("Erro: Notificação inválida."); setStatus('error'); return; }
        const inviteId = typeof currentNotification.entityId === 'object' ? currentNotification.entityId._id : currentNotification.entityId;
        if (!inviteId) { setMessage("Erro crítico: ID do convite não encontrado."); setStatus('error'); return; }

        setStatus('loading');
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.patch(`http://localhost:5001/api/invites/${inviteId}/status`, { status: 'ACCEPTED' }, config);
            window.dispatchEvent(new CustomEvent('campaignsUpdated'));
            if (currentNotification) removeNotification(currentNotification.id);
            setStatus('idle');
            setShowSendMessageModal(true);
        } catch (error) {
            setMessage(error.response?.data?.message || "Ocorreu um erro ao aceitar o convite.");
            setStatus('error');
        }
    };

    const handleCloseConfirmation = () => { setShowSendMessageModal(false); setMessage("Sua inscrição foi confirmada!"); setStatus('success'); };
    const handleDecline = () => {
        setStatus('loading');
        if (currentNotification) removeNotification(currentNotification.id);
        setMessage(`Você recusou a campanha "${ campaignDetails?.title|| 'desconhecida'}".`);
        setStatus('success'); 
    };

    const modalStyle = {
        width: '100%', maxWidth: 550, color: "white",
        background: "linear-gradient(145deg, rgba(24, 6, 49, 0.9), rgba(15, 2, 31, 0.9))",
        border: "1px solid rgba(255, 255, 255, 0.2)", backdropFilter: "blur(12px)",
        borderRadius: "24px", overflow: 'hidden', display: 'flex', flexDirection: 'column',
    };

    return (
          <Modal open={isModalOpen} onClose={closeModal} closeAfterTransition slots={{ backdrop: Backdrop }} slotProps={{ backdrop: { timeout: 500, sx: { backdropFilter: 'blur(5px)', backgroundColor: 'rgba(0, 0, 0, 0.5)' } } }} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AnimatePresence mode="wait">
                {isLoading || status === 'loading' ? (
                    <Box key="loading"><CircularProgress sx={{ color: '#ff00d4' }} /></Box>
               ) : status === 'success' || status === 'error' ? (
                <StatusDisplay key="status" status={status} message={message} colors={colors} />
                ) : showSendMessageModal ? (
                    <ConfirmationContent key="confirmation" onConfirm={handleConfirmSendMessage} onClose={handleCloseConfirmation} colors={colors} />
            ) : currentNotification?.type === 'FINALIZE_REQUEST' ? (
                <FinalizationRequestContent key="finalize" notification={currentNotification} onConfirm={handleConfirmFinalize} onDecline={handleRejectFinalization} colors={colors} isSubmitting={status === 'loading'} />
            ) : (
                    <MotionBox key="invitation" sx={modalStyle} initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1, boxShadow: "0px 10px 80px rgba(255, 0, 212, 0.3)", transition: { type: "spring", damping: 25, stiffness: 200 } }} exit={{ y: 30, opacity: 0, transition: { duration: 0.2 } }}>
                        {campaignDetails ? (
                                <Card sx={{ background: 'transparent', boxShadow: 'none', display: 'flex', flexDirection: 'column', maxHeight: '90vh' }}>
                                <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                        <CampaignIcon sx={{ color: "#ff00d4" }} />
                                        <Typography variant="h5" fontWeight="bold">Convite para Campanha</Typography>
                                    </Box>
                                    <IconButton onClick={closeModal} size="small" sx={{ color: 'white' }}><CloseIcon /></IconButton>
                                </Box>
                                <CardMedia component="img" height="220" image={campaignDetails.logo || 'https://images.unsplash.com/photo-1557804506-669a67965ba0'} alt={`Imagem da campanha ${campaignDetails.name}`} sx={{ objectFit: 'cover' }} />
                                <CardContent sx={{ flexGrow: 1, overflowY: 'auto', p: 3, "&::-webkit-scrollbar": { width: "10px", marginRight: "10px" }, "&::-webkit-scrollbar-track": { background: "rgba(255, 255, 255, 0.1)", borderRadius: "10px" }, "&::-webkit-scrollbar-thumb": { background: "rgba(255, 255, 255, 0.3)", borderRadius: "10px" }, "&::-webkit-scrollbar-thumb:hover": { background: "rgba(255, 255, 255, 0.6)" } }}>
                                    <Typography variant="h4" component="h2" sx={{ color: colors.grey[200], mb: 1 }}>{currentNotification?.title}</Typography>
                                    <Typography variant="h2" component="h3" fontWeight="900" gutterBottom sx={{ color: '#ff00d4', textShadow: '0 0 8px rgba(255, 0, 212, 0.36)' }}>{campaignDetails?.title}</Typography>
                                    <Box sx={{ color: colors.grey[200], mt: 2, fontFamily: 'sans-serif' }}><TiptapContent content={campaignDetails.description} /></Box>
                                </CardContent>
                                <Divider sx={{ borderColor: 'rgba(255,255,255,0.2)' }} />
                                <CardActions sx={{ p: 3, justifyContent: 'flex-end', gap: 2 }}>
                                    <Button onClick={handleDecline} sx={{ color: colors.grey[300], borderRadius: '10px', bgcolor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', textTransform: 'none', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)', borderColor: 'rgba(255,255,255,0.3)' } }}>Recusar</Button>
                                    <Button onClick={handleApply} variant="contained" startIcon={<RocketLaunchIcon />} sx={{ fontWeight: 'bold', borderRadius: '10px', px: 3, py: 1, textTransform: 'none', background: 'linear-gradient(45deg, #ff00d4 30%, #c400a5 90%)', boxShadow: '0 0 20px rgba(255, 0, 212, 0.6)', transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out', '&:hover': { transform: 'scale(1.05)', boxShadow: '0 0 30px rgba(255, 0, 212, 0.8)' } }}>Aceitar Convite</Button>
                                </CardActions>
                                    </Card>
                                          ) : null}
                    </MotionBox>
            )}
        </AnimatePresence>
    </Modal>
    );
};
export default CampaignNotificationModal;
