import React from "react";
import { Box, Typography } from "@mui/material";
import { useNavigate } from 'react-router-dom';

const ConversationCard = ({ id, nome, msg, hora, img }) => {
  const navigate = useNavigate();

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
    <Box
      sx={{ // Usando a prop 'sx' do MUI
        width: 45,
        height: 45,
        borderRadius: "50%",
        backgroundImage: `url(${img})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    />
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