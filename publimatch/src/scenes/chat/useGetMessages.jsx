// src/scenes/chat/useGetMessages.jsx

import { useEffect, useState } from "react";
import { useConversation } from "./ConversationContext";
import { useAuth } from "../../auth/AuthContext";
import axios from "axios";

const useGetMessages = () => {
    const [loading, setLoading] = useState(false);
    // ✅ PASSO 1: Pegue o array de 'messages' também.
    const { messages, setMessages, selectedConversation } = useConversation();
    const { user } = useAuth();

    useEffect(() => {
        const getMessages = async () => {
            // Não faz nada se já houver mensagens para a conversa selecionada
            // Isso previne que a lista seja recarregada desnecessariamente
            if (messages.length > 0 && messages[0].conversationId === selectedConversation?._id) {
                return;
            }

            setLoading(true);
            try {
                const otherUser = selectedConversation.participants.find(p => p && p._id !== user?._id);
                if (!otherUser) {
                    setMessages([]);
                    return;
                }

                const res = await axios.get(
                    `/api/chat/${otherUser._id}`, {
                        headers: {
                            Authorization: `Bearer ${user.token}`
                        }
                    }
                );
                
                setMessages(res.data);

            } catch (error) {
                console.error("Erro ao buscar mensagens:", error);
                setMessages([]);
            } finally {
                setLoading(false);
            }
        };

        if (selectedConversation?._id && user) {
            getMessages();
        } else {
            setMessages([]);
        }

    // ✅ PASSO 2: Simplifique o array de dependências.
    // O efeito agora SÓ vai rodar quando a conversa selecionada (pelo seu ID) mudar.
    // Ele não vai mais rodar quando 'setMessages' for chamado por outro hook.
    }, [selectedConversation?._id, user, setMessages]); // Adicionado setMessages para seguir as regras do linter

    return { loading };
};

export default useGetMessages;