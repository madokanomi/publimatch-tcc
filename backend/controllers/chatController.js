import Conversation from '../models/conversationModel.js';
import Message from '../models/messageModel.js';

/**
 * @desc    Garante que exista uma conversa entre o usuário logado e o alvo.
 *          Se existir, retorna ela. Se não, cria e retorna.
 * @route   POST /api/chat/ensure
 */
export const ensureConversation = async (req, res) => {
    try {
        const loggedInUserId = req.user._id;
        const { userId: otherUserId } = req.body;

        if (!otherUserId) {
            return res.status(400).json({ message: "O ID do outro usuário é necessário." });
        }

        if (loggedInUserId.toString() === otherUserId.toString()) {
            return res.status(400).json({ message: "Não é possível criar um chat consigo mesmo." });
        }

        // 1. Tenta encontrar conversa existente
        // Usamos $all para garantir que ambos os IDs estejam no array participants
        let conversation = await Conversation.findOne({
            participants: { $all: [loggedInUserId, otherUserId] },
        })
        .populate("participants", "name profileImageUrl email") // Popula dados dos usuários
        .populate("lastMessage");

        // 2. Se achou, retorna ela
        if (conversation) {
            return res.status(200).json(conversation);
        }

        // 3. Se não achou, cria uma nova
        const newConversation = await Conversation.create({
            participants: [loggedInUserId, otherUserId],
            messages: []
        });

        // 4. Popula a nova conversa para retornar o objeto completo ao frontend
        const fullConversation = await Conversation.findById(newConversation._id)
            .populate("participants", "name profileImageUrl email");

        res.status(201).json(fullConversation);

    } catch (error) {
        console.error("Erro em ensureConversation: ", error.message);
        res.status(500).json({ error: "Erro interno do servidor" });
    }
};

/**
 * @desc    Envia uma mensagem
 * @route   POST /api/chat/send/:receiverId
 */
export const sendMessage = async (req, res) => {
    try {
        // Assume que você tem um middleware colocando io e getReceiverSocketId no req
        // Se não tiver, importe-os diretamente de '../socket/socket.js'
        const { io, getReceiverSocketId } = req; 
        
        const { text } = req.body;
        const { receiverId } = req.params;
        const senderId = req.user._id;

        // Procura conversa existente
        let conversation = await Conversation.findOne({
            participants: { $all: [senderId, receiverId] },
        });

        // Se não existir, cria (fallback caso ensure não tenha sido chamado)
        if (!conversation) {
           conversation = await Conversation.create({
               participants: [senderId, receiverId],
           });
        }
        
        const newMessage = new Message({
            senderId,
            receiverId,
            text,
        });

        if (newMessage) {
            conversation.messages.push(newMessage._id);
            conversation.lastMessage = newMessage._id;
            
            // Salva em paralelo
            await Promise.all([conversation.save(), newMessage.save()]);
        }

        // Prepara payload para o socket
        const messagePayload = newMessage.toObject();
        messagePayload.conversationId = conversation._id;

        // Socket.io (Realtime)
        // Verifica se a função existe no req antes de chamar
        if (getReceiverSocketId && io) {
            const receiverSocketId = getReceiverSocketId(receiverId);
            if (receiverSocketId) {
                io.to(receiverSocketId).emit("newMessage", messagePayload);
            }
        }

        res.status(201).json(messagePayload);

    } catch (error) {
        console.error("Erro em sendMessage: ", error.message);
        res.status(500).json({ error: "Erro interno do servidor" });
    }
};

/**
 * @desc    Obtém mensagens de uma conversa
 * @route   GET /api/chat/:otherUserId
 */
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

/**
 * @desc    Obtém lista de conversas do usuário
 * @route   GET /api/chat
 */
export const getConversations = async (req, res) => {
    try {
        const loggedInUserId = req.user._id;

        const conversations = await Conversation.find({ participants: loggedInUserId })
            .populate({
                path: 'participants',
                select: 'name profileImageUrl email' 
            })
            .populate({
                path: 'lastMessage',
                select: 'text senderId createdAt'
            })
            .sort({ updatedAt: -1 }); // Mais recentes primeiro

        // Remove conversas quebradas (ex: usuário deletado)
        const validConversations = conversations.filter(convo => {
            return convo.participants && convo.participants.length >= 2 && convo.participants.every(p => p !== null);
        });
        
        res.status(200).json(validConversations);

    } catch (error) {
        console.error("Erro em getConversations: ", error.message);
        res.status(500).json({ error: "Erro interno do servidor" });
    }
};

/**
 * @desc    Deleta uma conversa
 * @route   DELETE /api/chat/:conversationId
 */
export const deleteConversation = async (req, res) => {
    try {
        const { conversationId } = req.params;
        const userId = req.user._id;

        const conversation = await Conversation.findById(conversationId);

        if (!conversation) {
            return res.status(404).json({ error: "Conversa não encontrada." });
        }

        // Verifica se o usuário faz parte da conversa antes de deletar
        if (!conversation.participants.includes(userId)) {
            return res.status(403).json({ error: "Não autorizado a deletar esta conversa." });
        }

        // Deleta as mensagens associadas
        if (conversation.messages && conversation.messages.length > 0) {
            await Message.deleteMany({ _id: { $in: conversation.messages } });
        }
        
        await Conversation.findByIdAndDelete(conversationId);

        res.status(200).json({ message: "Conversa deletada com sucesso." });
    } catch (error) {
        console.error("Erro em deleteConversation: ", error.message);
        res.status(500).json({ error: "Erro interno do servidor" });
    }
};