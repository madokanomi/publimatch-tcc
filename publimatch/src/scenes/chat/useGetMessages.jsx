// src/scenes/chat/useGetMessages.jsx

import { useEffect, useState } from "react";
import { useConversation } from "./ConversationContext";
import { useAuth } from "../../auth/AuthContext";
import axios from "axios";

const useGetMessages = () => {
    const [loading, setLoading] = useState(false);
    const { setMessages, selectedConversation } = useConversation();
    const { user } = useAuth();

    useEffect(() => {
        const getMessages = async () => {
            setLoading(true);
            try {
                // A lógica para encontrar o outro usuário permanece a mesma
                const otherUser = selectedConversation.participants.find(p => p && p._id !== user?._id);

                if (!otherUser) {
                    console.warn("Não foi possível encontrar o outro participante na conversa.");
                    setMessages([]);
                    return;
                }

                const res = await axios.get(
                    `/api/chat/${otherUser._id}`,
                    {
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

        // A condição de execução permanece a mesma
        if (selectedConversation?._id && user) {
            getMessages();
        } else {
            // Garante que ao desmarcar uma conversa, a lista de mensagens seja limpa.
            setMessages([]);
        }

    // ✅ A MUDANÇA CRÍTICA ESTÁ AQUI ✅
    // O useEffect agora depende APENAS do ID da conversa selecionada.
    // Ele não será mais acionado por re-renderizações causadas por
    // atualizações no objeto 'selectedConversation' ou no array 'messages'.
    // Ele SÓ RODA quando o ID da conversa efetivamente mudar.
    }, [selectedConversation?._id, user, setMessages]);
     // 'user' está aqui para recarregar caso o usuário mude.
     // 'setMessages' está aqui para seguir a recomendação do linter de hooks.

    return { loading };
};

export default useGetMessages;