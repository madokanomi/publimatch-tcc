import React from 'react';
import { Box, Typography } from '@mui/material';

const ChatMessage = ({ message }) => {
    const isSender = message.sender === 'me';
    
    return (
        <Box
            display="flex"
            justifyContent={isSender ? 'flex-end' : 'flex-start'}
            mb={2}
        >
            <Box
                bgcolor={isSender ? '#3E2472' : '#282C34'}
                p={2}
                borderRadius="16px"
                maxWidth="70%"
                sx={{
                    background: isSender ? 'linear-gradient(90deg, #100d258c, #3c125554)' : 'rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(20px)',
                }}
            >
                <Typography color="white">
                    {message.text}
                </Typography>
                <Typography 
                    fontSize="12px" 
                    color="rgba(255,255,255,0.6)"
                    mt={0.5}
                    textAlign={isSender ? 'right' : 'left'}
                >
                    {message.time}
                </Typography>
            </Box>
        </Box>
    );
};

export default ChatMessage;