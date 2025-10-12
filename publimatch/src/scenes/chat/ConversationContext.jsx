import React, { createContext, useContext, useState, useEffect } from "react";
import io from "socket.io-client";
import { useAuth } from "../../auth/AuthContext";
import { useSocket } from "../../data/SocketContext"; // 👈 IMPORTAR AQUI

export const ConversationContext = createContext();

export const useConversation = () => {
    return useContext(ConversationContext);
};

export const ConversationProvider = ({ children }) => {
    const [conversations, setConversations] = useState([]);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
   // ✅ CORRETO: Pega 'user' e renomeia para 'authUser' para não quebrar o resto do código
    // OU, de forma mais limpa, mude em todo o arquivo:
    const { user } = useAuth();

      const socket = useSocket(); 

    // ✅ EFEITO 1: BUSCAR TODAS AS CONVERSAS QUANDO O USUÁRIO LOGAR
    useEffect(() => {
      const getConversations = async () => {
            // if (authUser) { // 👈 ANTES
            if (user) { // ✅ DEPOIS
                try {
                    setLoading(true);
                    const res = await fetch("http://localhost:5001/api/chat", {
                        headers: {
                            // Inclui o token para que o backend saiba quem é o usuário
                            Authorization: `Bearer ${user.token}` 
                        }
                    });
                    const data = await res.json();
                    if (data.error) {
                        throw new Error(data.error);
                    }
                    setConversations(data);
                } catch (error) {
                    console.error("Erro ao buscar conversas:", error.message);
                    // Opcional: mostrar um toast/notificação de erro para o usuário
                } finally {
                    setLoading(false);
                }
            } else {
                // Se o usuário deslogar, limpa as conversas
                setConversations([]);
            }
        };

        getConversations();
    }, [user]);  // Este efeito roda sempre que o estado de autenticação mudar


 useEffect(() => {
        // Só adiciona o listener se a conexão do socket já existir
        if (!socket) return;

        const handleNewMessage = (newMessage) => {
            // 1. Se a mensagem recebida pertence à conversa que está aberta na tela,
            // adiciona ela à lista de mensagens para atualização instantânea.
            if (selectedConversation?._id === newMessage.conversationId) {
                setMessages((prevMessages) => [...prevMessages, newMessage]);
            }

            // 2. Atualiza a lista de conversas (sidebar) para refletir a nova mensagem,
            // colocando a conversa mais recente no topo.
            setConversations((prevConvos) => {
                const updatedConvos = prevConvos.map((convo) => {
                    if (convo._id === newMessage.conversationId) {
                        return {
                            ...convo,
                            lastMessage: {
                                text: newMessage.text,
                                senderId: newMessage.senderId,
                                createdAt: newMessage.createdAt,
                            },
                        };
                    }
                    return convo;
                });

                // Reordena para colocar a conversa atualizada no topo da lista
                const targetConvo = updatedConvos.find(c => c._id === newMessage.conversationId);
                const otherConvos = updatedConvos.filter(c => c._id !== newMessage.conversationId);
                
                // Se a conversa já existia na lista, move para o topo. Senão, mantém a ordem.
                return targetConvo ? [targetConvo, ...otherConvos] : updatedConvos;
            });
        };

        // Registra o listener no socket para o evento 'newMessage'
     socket.on("newMessage", handleNewMessage);

    return () => {
        socket.off("newMessage", handleNewMessage);
    };

// ✅ CORREÇÃO: Dependa apenas do ID, que é um valor estável.
}, [socket, selectedConversation?._id]); 


   return (
        <ConversationContext.Provider value={{
            conversations, setConversations,
            selectedConversation, setSelectedConversation,
            messages, setMessages,
            loading,
        }}>
            {children}
        </ConversationContext.Provider>
    );
};
