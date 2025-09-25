import { Box, Typography } from "@mui/material";

const CampaignResults = ({ campaign }) => {
  return (
    <Box
      sx={{
        backgroundColor: "rgba(255,255,255,0.05)",
        p: 3,
        borderRadius: "12px",
      }}
    >
      <Typography variant="h6" color="white" mb={2}>
        Resultados
      </Typography>
      <Typography color="white">
        Visualizações: {campaign.views}
      </Typography>
      <Typography color="white">
        Engajamento: {campaign.engagement}
      </Typography>
      <Typography color="white">
        Conversão: {campaign.conversion}
      </Typography>
    </Box>
  );
};

export default CampaignResults;
