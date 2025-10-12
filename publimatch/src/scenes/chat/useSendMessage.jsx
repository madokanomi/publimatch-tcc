// src/scenes/chat/useSendMessage.jsx

import { useState } from "react";
import { useConversation } from "./ConversationContext";
import { useAuth } from "../../auth/AuthContext";
import axios from "axios";

const useSendMessage = () => {
    const [loading, setLoading] = useState(false);
    const { messages, setMessages, selectedConversation } = useConversation();
    
    // ❌ PROBLEMA: O hook retorna 'user', não 'authUser'.
    // const { authUser } = useAuth();
    
    // ✅ CORREÇÃO:
    const { user } = useAuth();

    const sendMessage = async (text, receiverId) => {
        // ✅ A GUARDA AGORA USA A VARIÁVEL CORRETA
        if (!user || !user.token) {
            console.error("Erro: Tentativa de enviar mensagem sem um usuário autenticado.");
            return;
        }

        if (!selectedConversation) return;
        setLoading(true);

        try {
            const res = await axios.post(
                `http://localhost:5001/api/chat/send/${receiverId}`,
                { text },
                {
                    headers: {
                        "Content-Type": "application/json",
                        // ✅ O TOKEN AGORA SERÁ ENVIADO CORRETAMENTE
                        Authorization: `Bearer ${user.token}`,
                    },
                }
            );

            const data = res.data;
            if (data.error) {
                throw new Error(data.error);
            }

            // Esta linha atualiza a tela do remetente com a resposta do servidor. Está perfeita.
           setMessages((prevMessages) => [...prevMessages, data])

        } catch (error) {
            console.error("Erro ao enviar mensagem:", error);
        } finally {
            setLoading(false);
        }
    };

    return { sendMessage, loading };
};

export default useSendMessage;