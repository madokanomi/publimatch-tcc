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
} from "@mui/material";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DeleteIcon from "@mui/icons-material/Delete";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";
import { useParams, useNavigate } from "react-router-dom";

// Dados de exemplo para todas as conversas
let allConversations = [
  {
    id: 1,
    user: {
      name: "Paulo Gostavo",
      img: "https://streaming-guide.spiegel.de/wp-content/uploads/2025/04/Sonic3.png",
    },
    messages: [
      { text: "Oi, eu tenho interesse de participar dessa campanha.", sender: "other", time: "10:30 PM" },
      { date: "27/05" },
      { text: "Olá, Paulo Gostavo, conferimos e o seu cliente se encaixa perfeitamente no perfil que procuramos.", sender: "me", time: "10:35 PM" },
      { text: "Estamos ansiosos para a campanha do seu cliente. A equipe de criação está desenvolvendo materiais inovadores que capturarão a essência da marca e ressoarão com o público-alvo.", sender: "other", time: "10:40 PM" },
      { date: "28/05" },
      { text: "Temos de contactar a sua agencia nos próximos dias para realizar a campanha.", sender: "me", time: "09:00 PM" },
      { date: "Ontem" },
      { text: "Quando será a entrega da Publi", sender: "other", time: "09:10 PM" },
    ],
  },
  {
    id: 2,
    user: {
      name: "Adelaide Bonds",
      img: "https://pt.quizur.com/_image?href=https://img.quizur.com/f/img5dcb5b1b1e39b5.94302652.jpg?lastEdited=1573608227&w=600&h=600&f=webp",
    },
    messages: [
      { text: "Muito Obrigado pela sua participação, foi de grande ajuda para nosso projeto!", sender: "me", time: "10:50 AM" },
      { text: "Foi um ótimo projeto!", sender: "other", time: "03:25 AM" },
    ],
  },
  {
    id: 3,
    user: {
      name: "Leonardo Bigods",
      img: "https://media.istockphoto.com/id/490622582/pt/foto/frente-retrato-de-um-jovem-rapaz-com-dobrado-armas.jpg?s=1024x1024&w=is&k=20&c=FdaTxk--KKYHvDfKx6lTjhxGHn6TuZ4lF4HzKWcHIo0=",
    },
    messages: [{ date: "Ontem" }, { text: "Podemos Conversar?", sender: "other", time: "11:53 PM" }],
  },
  {
    id: 4,
    user: {
      name: "Franklin",
      img: "https://play-lh.googleusercontent.com/8l75wNoiL143-qvTGelnuBFO0xT_CqIni8Co2ER53Ig1LuPVZiowotP0P9lh840tk2Lr",
    },
    messages: [
      { text: "Hello! I would like to know more about the campaing on KomoNew", sender: "other", time: "07:30 PM" },
      { date: "23/06" },
      { text: 'We are making a campaign about the launch of the new app "Publimatch", that is made by Komonew', sender: "me", time: "08:37 PM" },
      { date: "24/06" },
      { text: "Aight man, what should i do to participate?", sender: "other", time: "08:30 AM" },
      { text: "Just make a little ad showing our product and Official page on one of your videos!", sender: "me", time: "08:35 AM" },
      { date: "Sábado" },
      { text: "Alright!" },
    ],
  },
];

const ChatWindow = () => {
  const { chatId } = useParams();
  const navigate = useNavigate();

  // Encontrar a conversa atual
  const initialChat = allConversations.find((c) => c.id.toString() === chatId);

  // Estados
  const [currentChat, setCurrentChat] = useState(initialChat);
  const [inputText, setInputText] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);

  const isMenuOpen = Boolean(anchorEl);

  // refs para scroll
  const messagesRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Atualiza a conversa quando o chatId muda
  useEffect(() => {
    const newChat = allConversations.find((c) => c.id.toString() === chatId);
    setCurrentChat(newChat);
  }, [chatId]);

  // Scroll automático para o final
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "auto", block: "end" });
  }, [currentChat?.messages?.length]);

  const handleMenuClick = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleGoBack = () => navigate("/conversas");

  // Scroll automático para o final
const scrollToBottom = () => {
  messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
};

// Atualiza o scroll sempre que a lista de mensagens muda
useEffect(() => {
  if (messagesEndRef.current) {
    messagesEndRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
  }
}, [currentChat?.messages]);

// Alterar handleSendMessage
const handleSendMessage = () => {
  if (inputText.trim() !== "") {
    const now = new Date();
    const time = `${now.getHours()}:${now.getMinutes() < 10 ? "0" : ""}${now.getMinutes()}`;
    const newMessage = { text: inputText.trim(), sender: "me", time };

    setCurrentChat((prevChat) => ({
      ...prevChat,
      messages: [...prevChat.messages, newMessage],
    }));
    setInputText("");

    // Scroll automático considerando o input
    setTimeout(() => {
      if (messagesRef.current) {
        messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
      }
    }, 50); // delay pequeno para garantir que a mensagem já foi renderizada
  }
};

  // Abrir diálogo de confirmação
  const handleDeleteConversation = () => {
    setOpenConfirmDialog(true);
    handleMenuClose();
  };

  // Confirmar exclusão
  const confirmDelete = () => {
    // Remove a conversa do array global
    allConversations = allConversations.filter((c) => c.id.toString() !== chatId);
    setOpenConfirmDialog(false);

    // Volta para a lista de conversas
    navigate("/conversas");
  };

  // Cancelar exclusão
  const cancelDelete = () => setOpenConfirmDialog(false);

  if (!currentChat) {
    return       <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          height: "50vh",
        }}
      >
        <Typography sx={{ fontWeight: "bold", color: "white", mb: 2 }}>
          Conversa não encontrada.
        </Typography>
        <Button
        sx={{backgroundColor: "#00000035", fontWeight: "bold", borderRadius: "16px", px: 3, py: 1, "&:hover": {backgroundColor: "#00000055"}}}
          variant="contained"
          color="primary"
          onClick={() => navigate(-1)} // Volta para a página anterior
        >
          Voltar
        </Button>
      </Box>
  }

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
          <img
            src={currentChat.user.img}
            alt={currentChat.user.name}
            style={{ width: 50, height: 50, borderRadius: "40%", objectFit: 'cover'}}
          />
          <Typography variant="h4" fontWeight="bold" color="white">
            {currentChat.user.name}
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

      {/* Mensagens */}
      <Box
        ref={messagesRef}
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
        {currentChat.messages && currentChat.messages.length > 0 ? (
          currentChat.messages.map((item, index) =>
            item.date ? (
              <Box key={index} textAlign="center" my={2}>
                <Typography
                  fontSize="12px"
                  color="rgba(255,255,255,0.6)"
                  sx={{
                    position: "relative",
                    "&::before, &::after": {
                      content: '""',
                      position: "absolute",
                      top: "50%",
                      width: "40%",
                      height: "1px",
                      backgroundColor: "rgba(255,255,255,0.3)",
                    },
                    "&::before": { left: 0 },
                    "&::after": { right: 0 },
                  }}
                >
                  {item.date}
                </Typography>
              </Box>
            ) : (
              <ChatMessage key={index} message={item} />
            )
          )
        ) : (
          <Box display="flex" alignItems="center" justifyContent="center" height="100%">
            <Typography color="rgba(255,255,255,0.6)">Nenhuma mensagem neste chat.</Typography>
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
        <ChatInput inputText={inputText} setInputText={setInputText} onSendMessage={handleSendMessage} />
      </Box>

      {/* Diálogo de confirmação */}
      <Dialog
        open={openConfirmDialog}
        onClose={cancelDelete}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        sx={{ "& .MuiPaper-root": { backgroundColor: "rgba(255, 255, 255, 0.64)", color: "#610069ff", backdropFilter:"blur(30px)", borderRadius:'20px' } }}
      >
        <DialogTitle id="alert-dialog-title">{"Confirmar exclusão"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description" sx={{color:"#4f4f4fff"}}>
            Tem certeza de que deseja apagar esta conversa? Essa ação não poderá ser desfeita.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelDelete} sx={{color:"#540069ff"}}>
            Cancelar
          </Button>
          <Button onClick={confirmDelete} sx={{fontWeight:'bold'}}color="error" autoFocus>
            Apagar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ChatWindow;
