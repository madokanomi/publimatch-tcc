import React, { createContext, useContext, useState, useEffect } from "react";
import io from "socket.io-client";
import { useAuth } from "../../auth/AuthContext";

export const ConversationContext = createContext();

export const useConversation = () => {
    return useContext(ConversationContext);
};

export const ConversationProvider = ({ children }) => {
    const [conversations, setConversations] = useState([]);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [socket, setSocket] = useState(null);
   // ✅ CORRETO: Pega 'user' e renomeia para 'authUser' para não quebrar o resto do código
    // OU, de forma mais limpa, mude em todo o arquivo:
    const { user } = useAuth();

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
        if (user) {
            const newSocket = io("http://localhost:5001", {
                query: {
                  userId: user._id,
                },
            });
            setSocket(newSocket);

            // A função de limpeza desconecta o socket quando o usuário desloga
            return () => newSocket.close();
        } else {
            if (socket) {
                socket.close();
                setSocket(null);
            }
        }
    }, [user]);

    // ✅ EFEITO 3 (NOVO): GERENCIA OS EVENT LISTENERS DO SOCKET
    // Este efeito escuta por novas mensagens e depende do socket existir.
    useEffect(() => {
        // Só adiciona o listener se o socket estiver conectado
        if (!socket) return;

        const handleNewMessage = (newMessage) => {
            // Atualiza as mensagens se o chat estiver aberto
            if (selectedConversation?._id === newMessage.conversationId) {
                setMessages((prev) => [...prev, newMessage]);
            }
            
            // Atualiza a lista de conversas para mostrar a última mensagem e reordenar
            setConversations(prevConvos => {
                const updatedConvos = prevConvos.map(convo => {
                    if (convo._id === newMessage.conversationId) {
                        return {
                            ...convo,
                            lastMessage: {
                                text: newMessage.text, // Corrigido de 'message' para 'text'
                                sender: newMessage.senderId,
                                createdAt: newMessage.createdAt || new Date().toISOString(),
                            }
                        };
                    }
                    return convo;
                });

                // Encontra a conversa atualizada
                const targetConvo = updatedConvos.find(c => c._id === newMessage.conversationId);
                // Filtra as outras conversas
                const otherConvos = updatedConvos.filter(c => c._id !== newMessage.conversationId);
                // Coloca a conversa atualizada no topo e retorna
                return [targetConvo, ...otherConvos];
            });
        };

        socket.on("newMessage", handleNewMessage);

        // A função de limpeza remove o listener para evitar duplicações
        return () => socket.off("newMessage", handleNewMessage);

    }, [socket, selectedConversation, setConversations]); // Depende do socket e da conversa selecionada
// Adicionado setConversations para a atualização bônus

   return (
        <ConversationContext.Provider value={{
            conversations, setConversations,
            selectedConversation, setSelectedConversation,
            messages, setMessages,
            loading,
            socket
        }}>
            {children}
        </ConversationContext.Provider>
    );
};
