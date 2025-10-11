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
} from "@mui/material";
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
    if (!name) return '#6366f1'; // Uma cor padrão se o nome não existir
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
    const { user } = useAuth();

  // ✅ FONTE ÚNICA DA VERDADE: Apenas dados do Contexto e Hooks
   const {
        conversations,
        selectedConversation,
        setSelectedConversation,
        messages,
        loading: conversationsLoading // Renomeado para não conflitar!
    } = useConversation();

 const { loading: messagesLoading } = useGetMessages();
  const { sendMessage, loading: sendingLoading } = useSendMessage();

  // ✅ ESTADO LOCAL: Apenas para controlar elementos da UI
  const [inputText, setInputText] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const isMenuOpen = Boolean(anchorEl);
  const messagesEndRef = useRef(null);

  // ✅ EFEITO 1: Seleciona a conversa correta no Contexto quando a URL muda
 useEffect(() => {
        // 1. Se a lista de conversas ainda está carregando, espere.
        // A próxima renderização (quando o loading terminar) reativará este efeito.
        if (conversationsLoading) {
            return;
        }

        // 2. Se as conversas já carregaram, encontre a que corresponde à URL.
        const conversationFound = conversations.find((c) => c._id === chatId);

        if (conversationFound) {
            // 3. Se a conversa foi encontrada e ainda não está selecionada no contexto, selecione-a.
            if (!selectedConversation || selectedConversation._id !== conversationFound._id) {
                setSelectedConversation(conversationFound);
            }
        } else {
            // 4. Se o loading terminou e a conversa NÃO foi encontrada, a URL é inválida. Redirecione.
            console.log("Conversa não encontrada após carregamento. Redirecionando...");
            navigate("/conversas");
        }
    }, [
        chatId,
        conversations,
        conversationsLoading, // A dependência mais importante!
        selectedConversation,
        setSelectedConversation,
        navigate,
    ]);

    // ✅ EFEITO 2: Scroll automático (agora com a lógica correta)
    useEffect(() => {
        // Rola para a mensagem mais recente sempre que a lista de mensagens mudar.
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]); // Este efeito depende APENAS das mensagens.



  // ✅ FUNÇÃO DE ENVIO: Usa o hook 'useSendMessage'
 const handleSendMessage = async () => {
        if (!selectedConversation) return; // Safety check
        
        // ANTES:
        // const otherUser = selectedConversation.participants.find(p => p._id !== authUser?._id);
        // DEPOIS:
        const otherUser = selectedConversation.participants.find(p => p._id !== user?._id);

        if (!otherUser) return;

        if (inputText.trim() !== "") {
            await sendMessage(inputText, otherUser._id);
            setInputText("");
        }
    };
    
  
    // ✅ FUNÇÃO DE DELETAR: Faz a chamada para a API
  const confirmDelete = async () => {
    if (!selectedConversation) return;
    try {
      // Idealmente, isso também seria um hook (ex: useDeleteConversation)
     await axios.delete(`/api/chat/${selectedConversation._id}`);
      setOpenConfirmDialog(false);
      navigate("/conversas");
    } catch (error) {
      console.error("Erro ao deletar conversa:", error);
    }
  };

  const handleGoBack = () => {
    setSelectedConversation(null); // Limpa o estado global ao sair
    navigate("/conversas");
  };
  
  // Funções de UI que permanecem
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

  // Encontra o outro usuário na conversa para exibir nome e foto
  const validParticipants = selectedConversation.participants.filter(p => p);
    // ANTES:
    // const otherUser = validParticipants.find(p => p._id !== authUser?._id);
    // DEPOIS:
    const otherUser = validParticipants.find(p => p._id !== user?._id);
  const initial = otherUser?.name ? otherUser.name[0].toUpperCase() : '?';
 const hasValidImage = otherUser?.profileImageUrl && otherUser.profileImageUrl !== "URL_DA_SUA_IMAGEM_PADRAO.png";

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
      {/* Header do Chat */}
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
          {/* ✅ A MUDANÇA PRINCIPAL ESTÁ AQUI */}
                    {hasValidImage ? (
                        <img
                            src={otherUser.profileImageUrl}
                            alt={otherUser.name}
                            style={{
                                width: 50,
                                height: 50,
                                borderRadius: "40%",
                                objectFit: "cover",
                            }}
                        />
                    ) : (
                        <Box
                            sx={{
                                width: 50,
                                height: 50,
                                borderRadius: '40%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor: generateConsistentColor(otherUser?.name),
                                color: 'white',
                                fontSize: '24px',
                                fontWeight: 'bold',
                            }}
                        >
                            {initial}
                        </Box>
                    )}
          <Typography variant="h4" fontWeight="bold" color="white">
            {otherUser?.name}
          </Typography>
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

      {/* Mensagens (BLOCO CORRIGIDO) */}
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
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            height="100%"
          >
            {/* Lembre-se de importar o CircularProgress */}
            <CircularProgress color="inherit" />
          </Box>
        ) : messages.length > 0 ? (
                  messages.map((msg) => (
                        <ChatMessage
                            key={msg._id}
                            message={msg}
                            // ANTES:
                            // currentUserId={authUser._id}
                            // DEPOIS:
                            currentUserId={user._id}
                        />
          ))
        ) : (
          <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            height="100%"
          >
            <Typography color="rgba(255,255,255,0.6)">
              Nenhuma mensagem neste chat.
            </Typography>
          </Box>
        )}
        <div ref={messagesEndRef} />
      </Box>

      {/* Input de Mensagem */}
      <Box
        sx={{
          position: "absolute",
          left: 24,
          right: 24,
          bottom: 24,
          background: "transparent",
          zIndex: 30,
        }}
      >
        <ChatInput
          inputText={inputText}
          setInputText={setInputText}
          onSendMessage={handleSendMessage}
        />
      </Box>

      {/* Diálogo de confirmação */}
      <Dialog
        open={openConfirmDialog}
        onClose={cancelDelete}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        sx={{
          "& .MuiPaper-root": {
            backgroundColor: "rgba(255, 255, 255, 0.64)",
            color: "#610069ff",
            backdropFilter: "blur(30px)",
            borderRadius: "20px",
          },
        }}
      >
        <DialogTitle id="alert-dialog-title">
          {"Confirmar exclusão"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText
            id="alert-dialog-description"
            sx={{ color: "#4f4f4fff" }}
          >
            Tem certeza de que deseja apagar esta conversa? Essa ação não poderá
            ser desfeita.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelDelete} sx={{ color: "#540069ff" }}>
            Cancelar
          </Button>
          <Button
            onClick={confirmDelete}
            sx={{ fontWeight: "bold" }}
            color="error"
            autoFocus
          >
            Apagar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ChatWindow;
