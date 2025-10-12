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
import { useNavigate } from 'react-router-dom';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import FinalizationRequestContent from './FinalizationRequestContent';
// No topo de CampaignNotificationModal.jsx
import { useConversation } from '../scenes/chat/ConversationContext'; // ✅ Importe o hook
const MotionBox = motion(Box);



const StatusDisplay = ({ status, message, colors }) => {
    const style = {
        width: '100%',
        maxWidth: 450,
        color: "white",
        background: "linear-gradient(145deg, rgba(24, 6, 49, 0.9), rgba(15, 2, 31, 0.9))",
        border: "1px solid rgba(255, 255, 255, 0.2)",
        backdropFilter: "blur(12px)",
        borderRadius: "24px",
        p: 4,
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 300, // Garante uma altura mínima
    };

    const isSuccess = status === 'success';

    return (
        <MotionBox
            sx={style}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
        >
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 10 }}>
                {isSuccess ? (
                    <CheckCircleOutlineIcon sx={{ fontSize: 80, color: colors.greenAccent[500] }} />
                ) : (
                    <ErrorOutlineIcon sx={{ fontSize: 80, color: colors.redAccent[500] }} />
                )}
            </motion.div>
            <Typography variant="h4" sx={{ mt: 3 }}>
                {message}
            </Typography>
        </MotionBox>
    );
};


const ConfirmationContent = ({ onConfirm, onClose, colors }) => {
    // << MUDANÇA 2: Removemos as propriedades de posicionamento absoluto. O Modal pai vai centralizar.
    const confirmationModalStyle = {
        width: '100%',
        maxWidth: 400,
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
            sx={confirmationModalStyle}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 20 } }}
            exit={{ scale: 0.8, opacity: 0 }}
        >
            <QuestionAnswerIcon sx={{ fontSize: 50, color:'white', mb: 2 }} />
            <Typography variant="h4" component="h2" sx={{ mb: 3 }}>
                Inscrição realizada com sucesso!
            </Typography>
            <Typography variant="h5" sx={{ mb: 4, color: colors.grey[300] }}>
                Deseja enviar uma mensagem para o agente da campanha?
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
                <Button onClick={onClose} sx={{ color: colors.grey[300], textTransform: 'none', borderRadius: '10px' }}>
                    Não, fechar
                </Button>
                <Button
                    onClick={onConfirm}
                    variant="contained"
                    sx={{
                        fontWeight: 'bold', textTransform: 'none', borderRadius: '10px',
                        background: "#ff00d4" ,
                    }}
                >
                    Sim, enviar mensagem
                </Button>
            </Box>
        </MotionBox>
    );
};


const CampaignNotificationModal = () => {
    const { user } = useAuth(); 
       const { setSelectedConversation, setConversations, conversations } = useConversation();

     const navigate = useNavigate();
    const { 
        isModalOpen, closeModal, campaignDetails, isLoading,
        removeNotification, 
        currentNotification // ✅ MUDANÇA 1: Receba o objeto completo
    } = useNotificationModal();
    
     console.log("Objeto da Campanha recebido:", campaignDetails);
const handleConfirmSendMessage = async () => {
        const adAgentId = campaignDetails?.createdBy?._id;

        if (!adAgentId) {
            console.error("ID do Agente de Publicidade não encontrado. Impossível iniciar chat.");
            // Adicione um feedback para o usuário aqui, se desejar
            return;
        }

        try {
            // ✅ 3. VÁ ATÉ A "RECEPÇÃO" (BACKEND) PEDIR A CHAVE
            // Esta rota vai encontrar a conversa existente ou criar uma nova.
            const config = {
                headers: { Authorization: `Bearer ${user.token}` },
            };
            const { data: conversationData } = await axios.post(
                `http://localhost:5001/api/chat/ensure`, 
                { userId: adAgentId },
                config
            );

            // ✅ 4. GUARDE A CHAVE NO SEU "BOLSO GLOBAL" (O CONTEXTO)
                   
        // 1. Adiciona a nova conversa à lista principal, evitando duplicatas.
        // Isso garante que a lista `conversations` esteja sempre atualizada.
                // Verifica se a conversa já não está na lista para evitar duplicatas
            const conversationExists = conversations.some(c => c._id === conversationData._id);

            if (!conversationExists) {
                // Adiciona a nova conversa no topo da lista
                setConversations(prevConvos => [conversationData, ...prevConvos]);
            }

            // 4. Defina a conversa recém-criada/encontrada como a selecionada
            setSelectedConversation(conversationData);

            // ✅ FIM DA CORREÇÃO

            closeModal();
            navigate(`/conversa/${conversationData._id}`);

        } catch (error) {
            console.error("Erro ao garantir ou criar a conversa:", error);
            // Mostre um erro para o usuário aqui
        }
    };

const handleRejectFinalization = () => {
    setStatus('loading');
    // A única ação é remover a notificação
    if (currentNotification) {
        removeNotification(currentNotification.id);
    }
    // E mostrar uma mensagem clara para o usuário
    setMessage("A solicitação de finalização foi rejeitada.");
    setStatus('success'); 
};

const handleConfirmFinalize = async () => {
        if (!campaignDetails?._id) {
            setMessage("Erro: ID da campanha não encontrado.");
            setStatus('error');
            return;
        }
        setStatus('loading');
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.put(`http://localhost:5001/api/campaigns/${campaignDetails._id}/finalize`, {}, config);
            
            setMessage("Campanha finalizada com sucesso!");
            setStatus('success');

            if (currentNotification) {
                removeNotification(currentNotification.id);
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || "Ocorreu um erro ao finalizar a campanha.";
            setMessage(errorMessage);
            setStatus('error');
        }
    };

    
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const [status, setStatus] = useState('idle'); // 'idle', 'loading', 'success', 'error'
    const [message, setMessage] = useState('');
const [showSendMessageModal, setShowSendMessageModal] = useState(false);


  useEffect(() => {
        if ((status === 'success' && !showSendMessageModal) || status === 'error') {
            const timer = setTimeout(() => {
                closeModal();
            }, 2500);
            return () => clearTimeout(timer);
        }
    }, [status, showSendMessageModal, closeModal]);


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
    // Verificação de segurança inicial
    if (!currentNotification || !currentNotification.entityId) {
        setMessage("Erro: Notificação ou entidade relacionada inválida.");
        setStatus('error');
        return;
    }

    // ✅ A CORREÇÃO PRINCIPAL ESTÁ AQUI
    // Extrai o ID de forma segura, não importa se entityId é um objeto ou uma string.
    const inviteId = typeof currentNotification.entityId === 'object' 
                   ? currentNotification.entityId._id 
                   : currentNotification.entityId;

    if (!inviteId) {
        setMessage("Erro crítico: ID do convite não pôde ser extraído da notificação.");
        setStatus('error');
        return;
    }

    setStatus('loading');
    try {
        const config = {
            headers: {
                Authorization: `Bearer ${user.token}`,
            },
        };

        await axios.patch(
            `http://localhost:5001/api/invites/${inviteId}/status`,
            { status: 'ACCEPTED' },
            config
        );

        window.dispatchEvent(new CustomEvent('campaignsUpdated'));

        if (currentNotification) {
            removeNotification(currentNotification.id);
        }
        
        setStatus('idle');
        setShowSendMessageModal(true);

    } catch (error) {
        console.error("Erro detalhado ao aceitar o convite:", error); // Adicione um log mais detalhado
        const errorMessage = error.response?.data?.message || "Ocorreu um erro ao aceitar o convite.";
        setMessage(errorMessage);
        setStatus('error');
    }
};


       const handleCloseConfirmation = () => {
        setShowSendMessageModal(false);
        setMessage("Sua inscrição foi confirmada!");
        setStatus('success'); // Agora sim ativamos a tela de sucesso final.
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
 console.log("🕵️‍♀️ DEBUG - Notificação Atual:", currentNotification);


    return (
        
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
        sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
        }}
    >
              <AnimatePresence mode="wait">
                
                {/* ETAPA 1: Lidar com os estados de feedback primeiro. Isso está perfeito. */}
                {isLoading || status === 'loading' ? (
                    <Box key="loading"><CircularProgress sx={{ color: '#ff00d4' }} /></Box>
               ) : status === 'success' || status === 'error' ? (
                <StatusDisplay
                    key="status"
                    status={status}
                    message={message}
                    colors={colors}
                />
                ) : showSendMessageModal ? (
                    <ConfirmationContent key="confirmation" onConfirm={handleConfirmSendMessage} onClose={handleCloseConfirmation} colors={colors} />
                
                // ETAPA 2: Decidir qual conteúdo principal mostrar
            ) : currentNotification?.type === 'FINALIZE_REQUEST' ? (
    <FinalizationRequestContent
        key="finalize"
        notification={currentNotification}
        onConfirm={handleConfirmFinalize}
        
        // ✅ A CORREÇÃO PRINCIPAL ESTÁ AQUI
        // Trocamos handleDecline por handleRejectFinalization
        onDecline={handleRejectFinalization}
        
        colors={colors}
        isSubmitting={status === 'loading'}
    />
) : (
                    // ETAPA 3: Mostrar o convite como padrão
                    <MotionBox
                        key="invitation"
                        sx={modalStyle}
                        initial={{ y: 30, opacity: 0 }}
                        animate={{ y: 0, opacity: 1, boxShadow: "0px 10px 80px rgba(255, 0, 212, 0.3)", transition: { type: "spring", damping: 25, stiffness: 200 } }}
                        exit={{ y: 30, opacity: 0, transition: { duration: 0.2 } }}
                    >
                        {/* ✅ CORREÇÃO PRINCIPAL: As verificações de status duplicadas foram REMOVIDAS daqui.
                            Este bloco agora só se preocupa em mostrar os detalhes da campanha. */}
                        {campaignDetails ? (
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
                                          ) : null
                    }
                </MotionBox>
            )}
        </AnimatePresence>
    </Modal>
    );
};

export default CampaignNotificationModal;