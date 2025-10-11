import React, { useState, useEffect } from "react";
import { Pin, PinOff } from "lucide-react";
import Header from "../../components/Header";
import { useNavigate } from "react-router-dom";
// 1. IMPORTAR COMPONENTES DO FRAMER MOTION
import { motion, AnimatePresence } from "framer-motion";
import { useConversation } from "./ConversationContext"; // Ajuste o caminho se necessário
import { useAuth } from "../../auth/AuthContext"; // Para obter o ID do usuário logado
import { Box, CircularProgress, Typography } from "@mui/material";
// ✅ BÔNUS: Função para formatar a data de forma mais amigável
import { formatDistanceToNowStrict } from 'date-fns';
import { ptBR } from 'date-fns/locale';
// Mock das conversas (sem alteração)
const initialConversas = [
  { id: 1, nome: "Paulo Gostavo", msg: "Quando será a entrega da publi?", hora: "09:10 PM", img: "https://streaming-guide.spiegel.de/wp-content/uploads/2025/04/Sonic3.png", pinned: false },
  { id: 2, nome: "Adelaide Bonds", msg: "Foi um ótimo projeto!", hora: "03:25 AM", img: "https://pt.quizur.com/_image?href=https://img.quizur.com/f/img5dcb5b1b1e39b5.94302652.jpg?lastEdited=1573608227&w=600&h=600&f=webp", pinned: false },
  { id: 3, nome: "Leonardo Bigods", msg: "Podemos conversar?", hora: "ONTEM", img: "https://media.istockphoto.com/id/490622582/pt/foto/frente-retrato-de-um-jovem-rapaz-com-dobrado-armas.jpg?s=1024x1024&w=is&k=20&c=FdaTxk--KKYHvDfKx6lTjhxGHn6TuZ4lF4HzKWcHIo0=", pinned: false },
  { id: 4, nome: "Franklin", msg: "Alright!", hora: "SÁBADO", img: "https://play-lh.googleusercontent.com/8l75wNoiL143-qvTGelnuBFO0xT_CqIni8Co2ER53Ig1LuPVZiowotP0P9lh840tk2Lr", pinned: false },
  { id: 5, nome: "Maria Silva", msg: "Preciso falar com você urgente", hora: "HOJE", img: "https://overplay.com.br/wp-content/uploads/2025/09/yoshi-and-the-mysterious-book-555x555.webp", pinned: false },
  { id: 6, nome: "João Santos", msg: "Obrigado pela ajuda!", hora: "ONTEM", img: "https://img.freepik.com/fotos-gratis/homem-jovem-e-sensivel-pensando_23-2149459724.jpg?semt=ais_incoming&w=740&q=80", pinned: false },
  { id: 7, nome: "Clara Nunes", msg: "Vamos marcar a reunião?", hora: "HOJE", img: "https://randomuser.me/api/portraits/women/65.jpg", pinned: false },
  { id: 8, nome: "Rafael Oliveira", msg: "Recebi o pagamento, obrigado!", hora: "ONTEM", img: "https://randomuser.me/api/portraits/men/44.jpg", pinned: false },
];

// 2. DEFINIR VARIANTES PARA AS ANIMAÇÕES
const listVariants = {
  visible: { 
    opacity: 1,
    transition: {
      when: "beforeChildren",
      staggerChildren: 0.08, // Efeito escalonado na entrada
    },
  },
  hidden: { opacity: 0 },
};

const itemVariants = {
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } },
  hidden: { opacity: 0, y: 20 },
  exit: { opacity: 0, x: -50, transition: { duration: 0.2 } }, // Animação de saída
};


const generateConsistentColor = (name) => {
    if (!name) return '#6366f1'; // Uma cor padrão

    const colors = [
        '#ef4444', '#f97316', '#eab308', '#84cc16', '#22c55e', 
        '#14b8a6', '#06b6d4', '#3b82f6', '#8b5cf6', '#d946ef'
    ];
    
    // Gera um número a partir do nome
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    // Usa o número para escolher uma cor da lista
    const index = Math.abs(hash % colors.length);
    return colors[index];
};

const ConversationCard = ({ id, nome, msg, hora, img, pinned, onPin, onClick }) => {
  const navigate = useNavigate();

   const initial = nome ? nome[0].toUpperCase() : '?';

  const handleCardClick = () => {
    navigate(`/conversa/${id}`);
  };
  // O estado 'isHovered' não é mais necessário, Framer Motion cuidará disso
  
  const handlePinClick = (e) => {
    e.stopPropagation();
    onPin(id);
  };

  return (
    // 3. TRANSFORMAR O CARD EM UM COMPONENTE ANIMADO
    <motion.div
      // A prop 'layout' é a MÁGICA que anima a mudança de posição ao fixar/desafixar
      layout
      transition={{ type: 'spring', stiffness: 400, damping: 35 }}
      variants={itemVariants}
      // Animação de entrada e saída
      initial="hidden"
      animate="visible"
      exit="exit"
      // Efeitos de hover declarativos
      whileHover={{
        translateY: -3,
        boxShadow: '0 12px 24px rgba(0,0,0,0.4)',
        backgroundColor: pinned ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255,255,255,0.12)'
      }}
      onClick={() => onClick(id)}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px', marginBottom: '8px', borderRadius: '16px',
        border: pinned ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid rgba(255,255,255,0.1)',
        background: pinned ? 'rgba(99, 102, 241, 0.15)' : 'rgba(255,255,255,0.08)',
        cursor: 'pointer', backdropFilter: 'blur(10px)', position: 'relative', overflow: 'hidden'
      }}
    >
      {pinned && (
        <motion.div 
            layoutId="underline" // Anima a linha colorida
            style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: '2px',
            background: 'linear-gradient(90deg, #6366f1, #8b5cf6, #ec4899)'
          }} 
        />
      )}
      
      <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
        <div style={{ position: 'relative' }}>
      {img ? (
                        <img 
                            src={img}  
                            style={{ 
                                width: '52px', height: '52px', borderRadius: '50%',
                                border: '2px solid rgba(255,255,255,0.1)', objectFit: 'cover'
                            }} 
                        />
                    ) : (
                        <div style={{
                            width: '52px', height: '52px', borderRadius: '50%',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            backgroundColor: generateConsistentColor(nome),
                            color: 'white', fontSize: '22px', fontWeight: 'bold',
                            border: '2px solid rgba(255,255,255,0.1)',
                        }}>
                            {initial}
                        </div>
                    )}
          <div style={{ position: 'absolute', bottom: '2px', right: '2px', width: '12px', height: '12px', backgroundColor: '#10b981', borderRadius: '50%', border: '2px solid #1a1a2e' }} />
        </div>
        
        <div style={{ marginLeft: '12px', flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h3 style={{ fontWeight: '600', color: 'white', fontSize: '16px', margin: '0', letterSpacing: '-0.01em' }}>{nome}</h3>
            {pinned && <Pin size={14} color="#6366f1" fill="#6366f1" />}
          </div>
          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', margin: '4px 0 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '200px' }}>{msg}</p>
        </div>
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
        <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{hora}</span>
        
        {/* 4. TORNAR O BOTÃO DE FIXAR ANIMADO TAMBÉM */}
        <motion.button
          onClick={handlePinClick}
          whileHover={{ 
            scale: 1.15, 
            backgroundColor: pinned ? 'rgba(239, 68, 68, 0.3)' : 'rgba(99, 102, 241, 0.2)'
          }}
          whileTap={{ scale: 0.95 }}
          style={{
            width: '32px', height: '32px', borderRadius: '50%', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            backgroundColor: pinned ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255,255,255,0.1)',
            border: 'none', cursor: 'pointer',
          }}
        >
          {pinned ? <PinOff size={16} color="#ef4444" /> : <Pin size={16} color="rgba(255,255,255,0.7)" />}
        </motion.button>
      </div>
    </motion.div>
  );
};

const ConversationList = ({ conversas, onPin, onConversationClick }) => {
  // Ordena as conversas para garantir consistência
  const pinnedConversas = conversas.filter(c => c.pinned).sort((a,b) => a.id - b.id);
  const unpinnedConversas = conversas.filter(c => !c.pinned).sort((a,b) => a.id - b.id);

  return (
    // Envolvemos as listas com 'motion.div' para o efeito escalonado
    <motion.div variants={listVariants} initial="hidden" animate="visible">
      {/* 5. USAR AnimatePresence PARA ANIMAR A ENTRADA/SAÍDA DOS CARDS DAS LISTAS */}
      <AnimatePresence>
        {pinnedConversas.length > 0 && (
          <motion.div layout key="pinned-section" style={{ marginBottom: '16px' }}>
            <h4 style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', fontWeight: '600', margin: '0 0 12px 0', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Fixadas ({pinnedConversas.length})
            </h4>
            {pinnedConversas.map(c => ( <ConversationCard key={c.id} {...c} onPin={onPin} onClick={onConversationClick} /> ))}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {unpinnedConversas.length > 0 && (
          <motion.div layout key="unpinned-section">
            <h4 style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', fontWeight: '600', margin: '0 0 12px 0', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Todas as conversas
            </h4>
            {unpinnedConversas.map(c => ( <ConversationCard key={c.id} {...c} onPin={onPin} onClick={onConversationClick} /> ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};



const Conversations = () => {
    const navigate = useNavigate();
    const { conversations, loading } = useConversation();
    
    // ✅ CORREÇÃO 1: O hook retorna 'user', não 'authUser'.
    // Mude de 'authUser' para 'user'.
    const { user } = useAuth(); 
    
    const [pinnedIds, setPinnedIds] = useState([]);

    const handlePin = (conversationId) => {
        setPinnedIds(prev => 
            prev.includes(conversationId) 
                ? prev.filter(id => id !== conversationId) 
                : [...prev, conversationId]
        );
    };

    const handleConversationClick = (conversationId) => {
        navigate(`/conversa/${conversationId}`);
    };
    
    const formattedConversations = conversations.map(convo => {
        // ✅ CORREÇÃO 2: Use a variável 'user' na comparação.
        const otherParticipant = convo.participants.find(
            (p) => p?._id?.toString() !== user?._id?.toString()
        );
        // Proteção para o caso de não haver outro participante (ex: dados corrompidos)
        if (!otherParticipant) return null; 

        const lastMessageText = convo.lastMessage?.text || "Inicie uma conversa...";
        const lastMessageTime = convo.lastMessage?.createdAt || convo.updatedAt;
  const imageUrl = otherParticipant.profileImageUrl;
    // Consideramos a imagem válida apenas se a URL existir E não for a string do placeholder.
    const isValidImage = imageUrl && imageUrl !== "URL_DA_SUA_IMAGEM_PADRAO.png";
    // --- FIM DA MUDANÇA ---
        return {
            id: convo._id, // O ID para navegação é o ID da CONVERSA!
            nome: otherParticipant.name,
          img: isValidImage ? imageUrl : undefined, 
            msg: lastMessageText,
            hora: formatDistanceToNowStrict(new Date(lastMessageTime), { addSuffix: true, locale: ptBR }),
            pinned: pinnedIds.includes(convo._id), // Verifica se o ID está no nosso estado local
        };
    }).filter(Boolean); // .filter(Boolean) remove quaisquer resultados nulos do map


  const containerStyle = {
    padding: '24px', borderRadius: '24px', backgroundColor: 'rgba(0,0,0,0.3)',
    height: '69vh', display: 'flex', flexDirection: 'column',
    backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)',
    boxShadow: '0 20px 40px rgba(0,0,0,0.4)', position: 'relative', overflow: 'hidden',
  };

  const listWrapperStyle = { flex: 1, overflowY: 'auto', maxHeight: '70vh', paddingRight: '8px' };
  
  const scrollbarStyles = `
     .conversation-scroll::-webkit-scrollbar { width: 10px; }
     .conversation-scroll::-webkit-scrollbar-track { background: rgba(255, 255, 255, 0.1); border-radius: 10px; }
     .conversation-scroll::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.3); border-radius: 10px; }
     .conversation-scroll::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.6); }
     .conversation-scroll { scrollbar-width: thin; scrollbar-color: rgba(255,255,255,0.3) rgba(255,255,255,0.1); }`;

  return (
    <div style={{ padding: '25px', height: '100vh', position: 'relative' }}>
      <style>{scrollbarStyles}</style>

      <div style={{ position: 'relative', zIndex: 10 }}>
        <Header title="Conversas" subtitle="Sua caixa de mensagens" />

        <div style={containerStyle}>
     <div style={listWrapperStyle} className="conversation-scroll">
                        {/* ✅ 6. RENDERIZAÇÃO CONDICIONAL BASEADA NO ESTADO DO CONTEXTO */}
                        {loading ? (
                            <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                                <CircularProgress color="inherit" />
                            </Box>
                        ) : formattedConversations.length > 0 ? (
                            <ConversationList 
                                conversas={formattedConversations} 
                                onPin={handlePin} 
                                onConversationClick={handleConversationClick} 
                            />
                        ) : (
                            <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                                <Typography sx={{ color: "rgba(255,255,255,0.7)" }}>
                                    Nenhuma conversa encontrada.
                                </Typography>
                            </Box>
                        )}
                    </div>
        </div>
      </div>
    </div>
  );
};


export default Conversations;