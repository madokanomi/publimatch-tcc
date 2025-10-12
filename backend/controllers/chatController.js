import Conversation from '../models/conversationModel.js';
import Message from '../models/messageModel.js';

// ❌ REMOVA a linha de importação do socket, pois ele virá pelo 'req'
// import { getReceiverSocketId, io } from '../socket/socket.js';

// Enviar uma mensagem

export const sendMessage = async (req, res) => {
    try {
        // ✅ 1. PEGUE 'io' DO OBJETO 'req' (injetado pelo middleware)
        const { io } = req;
        const { text } = req.body;
        const { receiverId } = req.params;
        const sender = req.user; // O objeto do usuário logado já contém nome, ID, etc.
        const senderId = sender._id;

        // ... (sua lógica para encontrar ou criar a conversa continua a mesma)
        let conversation = await Conversation.findOne({
            participants: { $all: [senderId, receiverId] },
        });
        if (!conversation) {
            conversation = await Conversation.create({
                participants: [senderId, receiverId],
            });
        }
        // ... (fim da lógica de conversa)

        const newMessage = new Message({
            senderId,
            receiverId,
            text,
        });

        // Salva a mensagem e atualiza a conversa
        if (newMessage) {
            conversation.messages.push(newMessage._id);
            conversation.lastMessage = newMessage._id;
            await Promise.all([conversation.save(), newMessage.save()]);
        }
        
        // ✅ 2. LÓGICA DO SOCKET.IO CORRIGIDA
        // O 'receiverId' é o nome da "sala" do destinatário.
        // Nós emitimos para essa sala. Simples assim.
        
        // ✅ 3. CRIE UM PAYLOAD COMPLETO PARA O TOAST
        // O frontend precisa de mais do que apenas a mensagem.
        const toastPayload = {
            senderName: sender.name,
            message: newMessage.text,
            avatar: sender.profileImageUrl,
            senderId: sender._id, // Importante para o frontend não notificar a si mesmo
            conversationId: conversation._id, // Útil para navegação
        };

        // Emitimos o evento 'new_message' para a sala do destinatário
        io.to(receiverId).emit("new_message", toastPayload);
        
        // Bônus: também emitimos a mensagem completa para a sala do remetente,
        // para que a UI dele possa ser atualizada em tempo real se ele estiver com 2 abas abertas.
        io.to(senderId).emit("new_message", toastPayload);


        res.status(201).json(newMessage);

    } catch (error) {
        console.error("Erro em sendMessage: ", error.message);
        res.status(500).json({ error: "Erro interno do servidor" });
    }
};

// Obter mensagens de uma conversa (não precisa de alteração)
export const getMessages = async (req, res) => {
    try {
        const { otherUserId } = req.params;
        const senderId = req.user._id;

        const conversation = await Conversation.findOne({
            participants: { $all: [senderId, otherUserId] },
        }).populate("messages");

        if (!conversation) return res.status(200).json([]);

        res.status(200).json(conversation.messages);

    } catch (error) {
        console.error("Erro em getMessages: ", error.message);
        res.status(500).json({ error: "Erro interno do servidor" });
    }
};

// Obter conversas do usuário (não precisa de alteração)
// ... (imports)

export const getConversations = async (req, res) => {
    try {
        const loggedInUserId = req.user._id;

        const conversations = await Conversation.find({ participants: loggedInUserId })
            .populate({
                path: 'participants',
                select: 'name profileImageUrl' 
            })
            // ✅ NOVO: Popula a informação da última mensagem de cada conversa
            .populate({
                path: 'lastMessage',
                select: 'text senderId createdAt'
            })
            // ✅ NOVO: Ordena as conversas pela data de atualização (mais recentes primeiro)
            .sort({ updatedAt: -1 });

        // A filtragem de conversas válidas continua sendo uma boa prática
        const validConversations = conversations.filter(convo => {
            return convo.participants.length >= 2 && convo.participants.every(p => p !== null);
        });
        
        res.status(200).json(validConversations);

    } catch (error) {
        console.error("Erro em getConversations: ", error.message);
        res.status(500).json({ error: "Erro interno do servidor" });
    }
};

// ... (resto do seu controller)

export const deleteConversation = async (req, res) => {
    try {
        const { conversationId } = req.params;
        const userId = req.user._id;

        const conversation = await Conversation.findById(conversationId);

        if (!conversation) {
            return res.status(404).json({ error: "Conversa não encontrada." });
        }

        // Verifica se o usuário faz parte da conversa
        if (!conversation.participants.includes(userId)) {
            return res.status(403).json({ error: "Não autorizado a deletar esta conversa." });
        }

        // Deleta as mensagens associadas e depois a conversa
        await Message.deleteMany({ _id: { $in: conversation.messages } });
        await Conversation.findByIdAndDelete(conversationId);

        res.status(200).json({ message: "Conversa deletada com sucesso." });
    } catch (error) {
        console.error("Erro em deleteConversation: ", error.message);
        res.status(500).json({ error: "Erro interno do servidor" });
    }
};

export const ensureConversation = async (req, res) => {
    try {
        const loggedInUserId = req.user._id; // Do seu middleware de autenticação
        const { userId: otherUserId } = req.body;

        if (!otherUserId) {
            return res.status(400).json({ message: "O ID do outro usuário é necessário." });
        }

        // Tenta encontrar uma conversa existente com ambos os participantes
        let conversation = await Conversation.findOne({
            participants: { $all: [loggedInUserId, otherUserId] },
        }).populate("participants", "-password"); // Popula os dados dos usuários

        // Se a conversa não existir, crie uma nova
        if (!conversation) {
            conversation = new Conversation({
                participants: [loggedInUserId, otherUserId],
            });
            await conversation.save();
            // Popula os dados dos participantes após salvar para retornar o objeto completo
            conversation = await conversation.populate("participants", "-password");
        }

        res.status(200).json(conversation);

    } catch (error) {
        console.error("Erro em ensureConversation: ", error.message);
        res.status(500).json({ error: "Erro interno do servidor" });
    }
};

