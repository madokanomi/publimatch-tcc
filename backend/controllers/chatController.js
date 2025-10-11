import Conversation from '../models/conversationModel.js';
import Message from '../models/messageModel.js';
import { getReceiverSocketId, io } from '../socket/socket.js'; // Importaremos do nosso arquivo de socket

// Enviar uma mensagem
export const sendMessage = async (req, res) => {
    try {
        const { text } = req.body;
        const { receiverId } = req.params;
        const senderId = req.user._id; // Supondo que você tenha um middleware de autenticação que adiciona o user ao req

        let conversation = await Conversation.findOne({
            participants: { $all: [senderId, receiverId] },
        });

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
        }

        // Isso vai rodar em paralelo, para otimizar
        await Promise.all([conversation.save(), newMessage.save()]);

        // LÓGICA DO SOCKET.IO
        const receiverSocketId = getReceiverSocketId(receiverId);
        if (receiverSocketId) {
            // io.to(<socket_id>).emit() é usado para enviar eventos para um cliente específico
            io.to(receiverSocketId).emit("newMessage", newMessage);
        }

        res.status(201).json(newMessage);
    } catch (error) {
        console.error("Erro em sendMessage: ", error.message);
        res.status(500).json({ error: "Erro interno do servidor" });
    }
};

// Obter mensagens de uma conversa
export const getMessages = async (req, res) => {
    try {
        const { otherUserId } = req.params;
        const senderId = req.user._id;

        const conversation = await Conversation.findOne({
            participants: { $all: [senderId, otherUserId] },
        }).populate("messages"); // .populate() substitui os IDs das mensagens pelos documentos completos

        if (!conversation) return res.status(200).json([]);

        const messages = conversation.messages;
        res.status(200).json(messages);

    } catch (error) {
        console.error("Erro em getMessages: ", error.message);
        res.status(500).json({ error: "Erro interno do servidor" });
    }
};

// Obter conversas do usuário
export const getConversations = async (req, res) => {
    try {
        const loggedInUserId = req.user._id;

        const conversations = await Conversation.find({ participants: loggedInUserId })
            .populate({
                path: 'participants',
                select: 'name profileImageUrl' // Selecione os campos que seu frontend precisa
            });

        // Lógica para formatar a saída para o seu frontend (opcional)

        res.status(200).json(conversations);

    } catch (error) {
        console.error("Erro em getConversations: ", error.message);
        res.status(500).json({ error: "Erro interno do servidor" });
    }
};