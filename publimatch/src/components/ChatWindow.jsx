// src/scenes/chat/ChatWindow.jsx

import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  ListItemButton // Importado para tornar a lista clicável
} from "@mui/material";
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DeleteIcon from "@mui/icons-material/Delete";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";
import { useParams, useNavigate } from "react-router-dom";
import { useConversation } from "../scenes/chat/ConversationContext"; 
import useGetMessages from "../scenes/chat/useGetMessages";
import useSendMessage from "../scenes/chat/useSendMessage";
import axios from "axios";
import { useAuth } from "../auth/AuthContext";

const generateConsistentColor = (name) => {
    if (!name) return '#6366f1';
    const colors = [
        '#ef4444', '#f97316', '#eab308', '#84cc16', '#22c55e',
        '#14b8a6', '#06b6d4', '#3b82f6', '#8b5cf6', '#d946ef'
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash % colors.length);
    return colors[index];
};

const ChatWindow = () => {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth(); // Pegamos o user e o token daqui

  const {
        conversations,
        selectedConversation,
        setSelectedConversation,
        messages,
        loading: conversationsLoading
    } = useConversation();

  const { loading: messagesLoading } = useGetMessages();
  const { sendMessage } = useSendMessage();

  const [inputText, setInputText] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const isMenuOpen = Boolean(anchorEl);
  const messagesEndRef = useRef(null);
  
  // Estados do Modal de Influenciadores
  const [agentModalOpen, setAgentModalOpen] = useState(false);
  const [agentInfluencers, setAgentInfluencers] = useState([]);
  const [modalLoading, setModalLoading] = useState(false);

  // Efeito 1: Selecionar conversa
  useEffect(() => {
        if (conversationsLoading) return;

        const conversationFound = conversations.find((c) => c._id === chatId);

        if (conversationFound) {
            if (!selectedConversation || selectedConversation._id !== conversationFound._id) {
                setSelectedConversation(conversationFound);
            }
        } else {
            console.log("Conversa não encontrada. Redirecionando...");
            navigate("/conversas");
        }
    }, [chatId, conversations, conversationsLoading, selectedConversation, setSelectedConversation, navigate]);

    // Efeito 2: Scroll
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

  const handleSendMessage = async () => {
        if (!selectedConversation) return;
        const otherUser = selectedConversation.participants.find(p => p._id !== user?._id);
        if (!otherUser) return;

        if (inputText.trim() !== "") {
            await sendMessage(inputText, otherUser._id);
            setInputText("");
        }
    };
    
  const confirmDelete = async () => {
    if (!selectedConversation) return;
    try {
     const config = { headers: { Authorization: `Bearer ${user.token}` } };
     await axios.delete(`http://localhost:5001/api/chat/${selectedConversation._id}`, config);
      setOpenConfirmDialog(false);
      navigate("/conversas");
    } catch (error) {
      console.error("Erro ao deletar conversa:", error);
    }
  };

  // ✅ LÓGICA CORRIGIDA DO MODAL DE AGENTE
  const handleOpenAgentModal = async () => {
    const otherUser = selectedConversation.participants.find(p => p._id !== user?._id);
    if (!otherUser) return;

    setAgentModalOpen(true);
    setModalLoading(true);
    
    try {
      // Usa o token direto do useAuth
      const config = { headers: { Authorization: `Bearer ${user.token}` } };

      // Chama a API (certifique-se que a porta está certa, ex: 5001)
      const { data } = await axios.get(
            `http://localhost:5001/api/influencers/agente/${otherUser._id}`, 
            config
        );
      
      setAgentInfluencers(data);
    } catch (error) {
      console.error("Erro ao buscar influenciadores do agente:", error);
      setAgentInfluencers([]); 
    } finally {
      setModalLoading(false);
    }
  };

  const handleCloseAgentModal = () => {
    setAgentModalOpen(false);
  };

  const handleGoBack = () => {
    setSelectedConversation(null);
    navigate("/conversas");
  };
  
  const handleMenuClick = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);
  
  const handleDeleteConversation = () => {
    setOpenConfirmDialog(true);
    handleMenuClose();
  };
  
  const cancelDelete = () => setOpenConfirmDialog(false);

  if (conversationsLoading) {
      return (
          <Box display="flex" justifyContent="center" alignItems="center" height="100%">
              <CircularProgress color="inherit" />
          </Box>
      );
  }
  
  if (!selectedConversation) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                <Typography sx={{ color: "white", fontWeight: "bold" }}>
                    Selecione uma conversa para começar
                </Typography>
            </Box>
        );
    }

  const validParticipants = selectedConversation.participants.filter(p => p);
  const otherUser = validParticipants.find(p => p._id !== user?._id);
  const initial = otherUser?.name ? otherUser.name[0].toUpperCase() : '?';
  const hasValidImage = otherUser?.profileImageUrl && !otherUser.profileImageUrl.includes("default"); // Ajuste conforme sua lógica de imagem padrão
  
  // ✅ CORREÇÃO: Mostra o botão SE o outro usuário for um Agente de Influenciadores
  const showAgentButton = otherUser?.role === 'INFLUENCER_AGENT';

  return (
    <Box
      sx={{
        flex: 1,
        height: "90%",
        justifyContent: "center",
        position: "relative",
        borderRadius: "16px",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        mr: "40px",
        ml: "40px",
      }}
    >
      {/* Header */}
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        p={1.5}
        backgroundColor="rgba(0, 0, 0, 0.15)"
        border="1px solid rgba(255, 255, 255, 0.14)"
        borderRadius="20px"
        sx={{ backdropFilter: "blur(20px)" }}
      >
        <Box display="flex" alignItems="center" gap={1.5}>
          <IconButton onClick={handleGoBack} sx={{ color: "white" }}>
            <ArrowBackIcon />
          </IconButton>
          
            {hasValidImage ? (
                <img
                    src={otherUser.profileImageUrl}
                    alt={otherUser.name}
                    style={{ width: 50, height: 50, borderRadius: "40%", objectFit: "cover" }}
                />
            ) : (
                <Box
                    sx={{
                        width: 50, height: 50, borderRadius: '40%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        backgroundColor: generateConsistentColor(otherUser?.name),
                        color: 'white', fontSize: '24px', fontWeight: 'bold',
                    }}
                >
                    {initial}
                </Box>
            )}
          <Typography variant="h4" fontWeight="bold" color="white">
            {otherUser?.name}
          </Typography>

          {/* Botão de Ver Influenciadores (Interrogação) */}
          {showAgentButton && (
            <IconButton
              onClick={handleOpenAgentModal}
              sx={{
                color: 'white',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                ml: 1,
                '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.3)' },
                width: '28px',
                height: '28px',
                padding: 0,
                borderRadius: '50%'
              }}
            >
              <HelpOutlineIcon sx={{ fontSize: '18px' }} /> 
            </IconButton>
          )}
        </Box>
        <Box>
          <IconButton onClick={handleMenuClick} sx={{ color: "white" }}>
            <MoreHorizIcon />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={isMenuOpen}
            onClose={handleMenuClose}
            sx={{
              "& .MuiPaper-root": {
                backgroundColor: "rgba(255, 255, 255, 1)",
                color: "#610069ff",
                borderRadius: "10px",
              },
            }}
          >
            <MenuItem onClick={handleDeleteConversation}>
              <DeleteIcon sx={{ mr: 1 }} />
              Apagar Conversa
            </MenuItem>
          </Menu>
        </Box>
      </Box>

      {/* Lista de Mensagens */}
      <Box
        flexGrow={1}
        p={2}
        sx={{
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: 1,
          pb: "120px",
          "&::-webkit-scrollbar": { width: "6px" },
          "&::-webkit-scrollbar-thumb": {
            background: "rgba(255,255,255,0.3)",
            borderRadius: "10px",
          },
        }}
      >
        {messagesLoading ? (
          <Box display="flex" justifyContent="center" alignItems="center" height="100%">
            <CircularProgress color="inherit" />
          </Box>
        ) : messages.length > 0 ? (
            messages.map((msg) => (
                <ChatMessage
                    key={msg._id}
                    message={msg}
                    currentUserId={user._id}
                />
          ))
        ) : (
          <Box display="flex" alignItems="center" justifyContent="center" height="100%">
            <Typography color="rgba(255,255,255,0.6)">
              Nenhuma mensagem neste chat.
            </Typography>
          </Box>
        )}
        <div ref={messagesEndRef} />
      </Box>

      {/* Input */}
      <Box sx={{ position: "absolute", left: 24, right: 24, bottom: 24, background: "transparent", zIndex: 30 }}>
        <ChatInput
          inputText={inputText}
          setInputText={setInputText}
          onSendMessage={handleSendMessage}
        />
      </Box>

      {/* Diálogo de confirmação de exclusão */}
      <Dialog
        open={openConfirmDialog}
        onClose={cancelDelete}
        sx={{
          "& .MuiPaper-root": {
            backgroundColor: "rgba(255, 255, 255, 0.64)",
            color: "#610069ff",
            backdropFilter: "blur(30px)",
            borderRadius: "20px",
          },
        }}
      >
        <DialogTitle>{"Confirmar exclusão"}</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: "#4f4f4fff" }}>
            Tem certeza de que deseja apagar esta conversa?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelDelete} sx={{ color: "#540069ff" }}>Cancelar</Button>
          <Button onClick={confirmDelete} sx={{ fontWeight: "bold" }} color="error">Apagar</Button>
        </DialogActions>
      </Dialog>

      {/* ✅ DIÁLOGO DOS INFLUENCIADORES (MODAL) */}
      <Dialog
        open={agentModalOpen}
        onClose={handleCloseAgentModal}
        sx={{
            "& .MuiPaper-root": {
            backgroundColor: "rgba(255, 255, 255, 0.9)", // Fundo um pouco mais sólido para leitura
            color: "#610069ff",
            backdropFilter: "blur(30px)",
            borderRadius: "20px",
            minWidth: "320px",
            maxHeight: "500px" // Limite de altura
            },
        }}
        >
        <DialogTitle fontWeight="bold">
            Influenciadores de {otherUser?.name}
        </DialogTitle>
        <DialogContent dividers>
            {modalLoading ? (
            <Box display="flex" justifyContent="center" my={3}>
                <CircularProgress color="inherit" />
            </Box>
            ) : (
            <List>
                {agentInfluencers.length > 0 ? (
                agentInfluencers.map((influ) => (
                    // ✅ Usando ListItemButton para permitir clique e navegação
                    <ListItemButton 
                        key={influ._id} 
                        onClick={() => {
                            navigate(`/influencer/${influ._id}`); // Ajuste a rota para o seu padrão de perfil
                            handleCloseAgentModal();
                        }}
                    >
                    <ListItemAvatar>
                        <Avatar src={influ.profileImageUrl} alt={influ.name}>
                        {influ.name[0]}
                        </Avatar>
                    </ListItemAvatar>
                    <ListItemText 
                        primary={influ.name} 
                        secondary={`${influ.niches?.join(", ") || "Sem nicho"}`} // Mostra nichos como secundário
                        sx={{
                            "& .MuiListItemText-primary": { color: "#4f4f4fff", fontWeight: "bold" },
                            "& .MuiListItemText-secondary": { color: "rgba(0,0,0,0.5)", fontSize: "0.8rem" }
                        }}
                    />
                    </ListItemButton>
                ))
                ) : (
                <Typography sx={{ color: "#4f4f4fff", textAlign: 'center', p: 2 }}>
                    Nenhum influenciador encontrado.
                </Typography>
                )}
            </List>
            )}
        </DialogContent>
        <DialogActions>
            <Button onClick={handleCloseAgentModal} sx={{ color: "#540069ff", fontWeight: 'bold' }}>
            Fechar
            </Button>
        </DialogActions>
        </Dialog>

    </Box>
  );
};

export default ChatWindow;