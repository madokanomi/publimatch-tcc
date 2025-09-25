import React from "react";
import { Box } from "@mui/material";
import ConversationCard from "./ConversationCard.jsx";

const ConversationList = ({ conversas }) => {
  return (
    <Box
      flex={1}
      overflow="auto"
      display="flex"
      flexDirection="column"
      gap="10px"
      sx={{
        "&::-webkit-scrollbar": { width: "6px" },
        "&::-webkit-scrollbar-thumb": {
          background: "rgba(255,255,255,0.3)",
          borderRadius: "10px",
        },
      }}
    >
      {conversas.map((c) => (
        <ConversationCard key={c.id} {...c} />
      ))}
    </Box>
  );
};

export default ConversationList;
