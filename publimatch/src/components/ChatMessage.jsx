import React from 'react';
import { Box, Typography } from '@mui/material';

// Receba 'currentUserId' como prop
const ChatMessage = ({ message, currentUserId }) => {
    // ✅ LÓGICA CORRIGIDA: Compara o senderId da mensagem com o ID do usuário logado
    const isSender = message.senderId === currentUserId;

    // Função para formatar a data (pode ser melhorada com libs como date-fns)
    const formatTime = (isoString) => {
        if (!isoString) return "";
        const date = new Date(isoString);
        return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <Box
            display="flex"
            justifyContent={isSender ? 'flex-end' : 'flex-start'}
            mb={1} // Reduzi a margem para ficar mais agradável
        >
            <Box
                p={1.5} // Ajustei o padding
                borderRadius="16px"
                maxWidth="70%"
                sx={{
                    // ✅ APLICA O ESTILO CORRETO BASEADO EM QUEM ENVIOU
                    background: isSender
                        ? 'linear-gradient(90deg, #3e247270, #542c8d63)'
                        : 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)',
                    boxShadow: isSender ? '0 4px 15px rgba(0,0,0,0.2)' : 'none',
                }}
            >
                {/* ✅ USA O CAMPO 'text' DO MODELO DE MENSAGEM */}
                <Typography color="white" sx={{ wordWrap: 'break-word' }}>
                    {message.text}
                </Typography>
                <Typography
                    fontSize="11px"
                    color="rgba(255,255,255,0.6)"
                    mt={0.5}
                    textAlign={isSender ? 'right' : 'left'}
                >
                    {/* ✅ USA O CAMPO 'createdAt' E FORMATA A HORA */}
                    {formatTime(message.createdAt)}
                </Typography>
            </Box>
        </Box>
    );
};

export default ChatMessage;