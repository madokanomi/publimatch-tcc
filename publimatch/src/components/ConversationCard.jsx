import React from "react";
import { Box, Typography } from "@mui/material";
import { useNavigate } from 'react-router-dom';


const generateConsistentColor = (name) => {
    if (!name) return '#6366f1'; // Uma cor padrão

    const colors = [
        '#ef4444', '#f97316', '#eab308', '#84cc16', '#22c55e', 
        '#14b8a6', '#06b6d4', '#3b82f6', '#8b5cf6', '#d946ef'
    ];
    
    // Gera um número a partir do nome
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    // Usa o número para escolher uma cor da lista
    const index = Math.abs(hash % colors.length);
    return colors[index];
};

const ConversationCard = ({ id, nome, msg, hora, img, pinned, onPin, onClick }) => {
  const navigate = useNavigate();

   const initial = nome ? nome[0].toUpperCase() : '?';

  const handleCardClick = () => {
    navigate(`/conversa/${id}`);
  };

  return (
    <Box
      onClick={handleCardClick}
      display="flex"
      alignItems="center"
      justifyContent="space-between"
      bgcolor="rgba(255,255,255,0.1)"
      borderRadius="12px"
      p="12px"
      sx={{
        transition: "background 0.2s",
        "&:hover": { backgroundColor: "rgba(255,255,255,0.2)", cursor: "pointer" },
      }}
    >
   <Box display="flex" alignItems="center">
    {img ? (
                        <img 
                            src={img}  
                            style={{ 
                                width: '52px', height: '52px', borderRadius: '50%',
                                border: '2px solid rgba(255,255,255,0.1)', objectFit: 'cover'
                            }} 
                        />
                    ) : (
                        <div style={{
                            width: '52px', height: '52px', borderRadius: '50%',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            backgroundColor: generateConsistentColor(nome),
                            color: 'white', fontSize: '22px', fontWeight: 'bold',
                            border: '2px solid rgba(255,255,255,0.1)',
                        }}>
                            {initial}
                        </div>
                    )}
    <Box ml={2}>
      <Typography fontWeight="bold" color="white">{nome}</Typography>
      <Typography fontSize="14px" color="rgba(255,255,255,0.7)">
        {msg}
      </Typography>
    </Box>
  </Box>
  <Typography fontSize="12px" color="rgba(255,255,255,0.7)">
    {hora}
  </Typography>
</Box>
  );
};

export default ConversationCard;