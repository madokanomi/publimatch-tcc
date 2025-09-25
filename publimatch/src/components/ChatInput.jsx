import React from 'react';
import { Box, InputBase, IconButton } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';

const ChatInput = ({ inputText, setInputText, onSendMessage }) => {
    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            onSendMessage();
        }
    };

    return (
        <Box
            display="flex"
            alignItems="center"
            bgcolor="rgba(255,255,255,0.1)"
         
            borderRadius="16px"
            p={1}
            mt={2}
            sx={{backdropFilter: 'blur(20px)'}}
        >
            <InputBase
                placeholder="Digite sua mensagem"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                sx={{
                    ml: 1,
                    flex: 1,
                    color: 'white',
                    "& input::placeholder": {
                        color: 'rgba(255, 255, 255, 0.83)',
                    },
                }}
            />
            <IconButton onClick={onSendMessage} sx={{ color: 'white' }}>
                <SendIcon />
            </IconButton>
        </Box>
    );
};

export default ChatInput;