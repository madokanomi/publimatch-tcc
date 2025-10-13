import React, { useMemo } from 'react';
import { Box, Typography, Chip, Rating, CircularProgress, Avatar, Tooltip } from "@mui/material";
import StarIcon from "@mui/icons-material/Star";

const AvaliacoesEspc = ({ reviews = [], isLoading, canSeeDetailedReviews = false }) => {


    const stats = useMemo(() => {
        if (!reviews || reviews.length === 0) {
            return {
                averageRating: 0,
                ratingText: "Sem Avaliações",
                topTags: [],
            };
        }

        const totalRating = reviews.reduce((acc, review) => acc + review.rating, 0);
        const averageRating = totalRating / reviews.length;

        let ratingText = "Regular";
        if (averageRating >= 4.5) ratingText = "Excelente!";
        else if (averageRating >= 4.0) ratingText = "Muito Bom!";
        else if (averageRating >= 3.0) ratingText = "Bom";

        const tagCounts = reviews
            .flatMap(review => review.tags)
            .reduce((acc, tag) => {
                acc[tag] = (acc[tag] || 0) + 1;
                return acc;
            }, {});

        const topTags = Object.entries(tagCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 4)
            .map(item => item[0]);

        return { averageRating, ratingText, topTags };
    }, [reviews]);

    if (isLoading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="40vh">
                <CircularProgress />
            </Box>
        );
    }
    
    if (reviews.length === 0) {
        return (
             <Box pl={5} pr={5} sx={{backgroundColor: "rgba(27, 27, 27, 0.26)", borderRadius:"20px", p:3, backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.1)", textAlign: 'center'}}>
                <Typography variant="h6" color="white">Nenhuma Avaliação Encontrada</Typography>
                <Typography variant="body2" color="rgba(255,255,255,0.7)">Este influenciador ainda não recebeu avaliações.</Typography>
            </Box>
        )
    }

    return (
        <Box pl={5} pr={5} sx={{backgroundColor: "rgba(27, 27, 27, 0.26)", borderRadius:"20px", p:3, backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.1)"}}>
            <Box display="flex" gap={4}>
                <Box flex={1} display="flex" flexDirection="column" alignItems="center" justifyContent="center" sx={{ p: 4, textAlign: "center" }}>
                    <Typography variant="h1" fontWeight="bold" color="white" sx={{ fontSize: "120px", lineHeight: 1 }}>
                        {stats.averageRating.toFixed(1)}
                    </Typography>
                    <Rating 
                        value={stats.averageRating} 
                        readOnly 
                        precision={0.5}
                        emptyIcon={<StarIcon style={{ opacity: 0.3, color: 'white' }} fontSize="inherit" />}
                        icon={<StarIcon style={{ color: '#FFD700' }} fontSize="inherit" />}
                        sx={{ fontSize: 32, mb: 2 }}
                    />
                    <Typography variant="h4" fontWeight="bold" color="white" mb={1}>
                        {stats.ratingText}
                    </Typography>
                    <Box display="flex" gap={1} flexWrap="wrap" justifyContent="center">
                        {stats.topTags.map((tag, i) => (
                            <Chip key={i} label={tag} size="small" sx={{ bgcolor: "rgba(255,255,255,0.2)", color: "white", fontWeight: "bold", borderRadius: "15px" }}/>
                        ))}
                    </Box>
                </Box>

                <Box flex={1.2}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                        <Typography variant="h6" color="white"> Mais Recentes </Typography>
                    </Box>
                    
                    {reviews.slice(0, 2).map((review) => (
                        <Box key={review._id} mb={3} p={3} sx={{ backgroundColor: "rgba(255,255,255,0.08)", borderRadius: "15px", border: "1px solid rgba(255,255,255,0.1)" }}>
                            <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                                <Box>
                                    {review.campaign?.title && (
                                        <Typography variant="caption" color="rgba(255,255,255,0.7)" fontWeight="medium" mb={0.2} display="block">
                                            Campanha: {review.campaign.title}
                                        </Typography>
                                    )}
                                    <Typography variant="body1" color="white" fontWeight="bold" mb={0.5}>
                                        {review.title}
                                    </Typography>
                                    <Typography variant="caption" color="rgba(255,255,255,0.6)">
                                        {new Date(review.createdAt).toLocaleDateString('pt-BR')}
                                    </Typography>
                                </Box>
                                <Box sx={{ mt: review.campaign?.title ? 2.5 : 0 }}>
                                    <Tooltip title={review.campaign?.title || 'Campanha'}>
                                        <Avatar 
                                            src={review.campaign?.logo}
                                            sx={{ width: 32, height: 32 }}
                                        >
                                            {review.campaign?.title ? review.campaign.title.charAt(0).toUpperCase() : 'C'}
                                        </Avatar>
                                    </Tooltip>
                                </Box>
                            </Box>
                            <Box display="flex" alignItems="center" gap={0.5} mb={2}>
                                <Rating value={review.rating} readOnly size="small" emptyIcon={<StarIcon style={{ opacity: 0.3, color: 'white' }} fontSize="inherit" />} />
                                <Typography variant="body2" color="white" fontWeight="bold" ml={1}>{review.rating.toFixed(1)}</Typography>
                                <Box ml={2} display="flex" gap={1}>
                                    {review.tags.slice(0, 3).map((tag, i) => (
                                        <Chip key={i} label={tag} size="small" sx={{bgcolor: "rgba(76, 175, 80, 0.2)", color: "#4caf50", fontSize: "10px"}} />
                                    ))}
                                </Box>
                            </Box>
                         {canSeeDetailedReviews ? (
                                <Typography variant="body2" color="rgba(255,255,255,0.8)" lineHeight={1.6}>
                                    {review.comment || "Nenhum comentário adicional."}
                                </Typography>
                            ) : (
                                <Typography variant="body2" fontStyle="italic" color="rgba(255,255,255,0.5)" lineHeight={1.6}>
                                    O conteúdo detalhado desta avaliação é visível apenas para Agentes de Publicidade.
                                </Typography>
                            )}
                            
                        </Box>
                    ))}
                </Box>
            </Box>
        </Box>
    );
};

export default AvaliacoesEspc;