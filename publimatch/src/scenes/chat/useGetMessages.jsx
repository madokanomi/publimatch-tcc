import { useEffect, useState } from "react";
import { useConversation } from "./ConversationContext";
import { useAuth } from "../../auth/AuthContext";
import axios from "axios";

const useGetMessages = () => {
    const [loading, setLoading] = useState(false);
    const { setMessages, selectedConversation } = useConversation();
    
    // ✅ CORREÇÃO 1: Usar 'user' em vez de 'authUser'.
    const { user } = useAuth();

    useEffect(() => {
        const getMessages = async () => {
            // A verificação de 'selectedConversation' e 'user' já garante que temos tudo para prosseguir.
            setLoading(true);
            try {
                // A lógica para encontrar o outro usuário agora usa a variável correta.
                const otherUser = selectedConversation.participants.find(p => p && p._id !== user?._id);

                if (!otherUser) {
                    console.warn("Não foi possível encontrar o outro participante na conversa.");
                    setMessages([]);
                    return;
                }

                // ✅ CORREÇÃO 2: Adicionar o header de autorização na requisição GET.
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

        // ✅ CORREÇÃO 3: Condição mais robusta para executar o fetch.
        //    Só busca as mensagens se tivermos uma conversa selecionada E um usuário logado.
        if (selectedConversation?._id && user) {
            getMessages();
        } else {
            // Se não houver conversa selecionada, garante que a lista de mensagens esteja vazia.
            setMessages([]);
        }

    // A dependência agora é 'user', não 'authUser'.
    }, [selectedConversation, setMessages, user]);

    return { loading };
};

export default useGetMessages;