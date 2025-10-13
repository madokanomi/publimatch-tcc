import React, { useState, useMemo } from 'react'; // 1. Adicionado useMemo
import axios from 'axios';
import { useAuth } from '../auth/AuthContext';
import { influencers } from '../data/mockInfluencer'; // 2. Importado o mock
import {
    Box,
    Typography,
    Rating,
    TextField,
    Button,
    Chip,
    Autocomplete,
    IconButton,
    InputAdornment,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Avatar,
    Alert
} from '@mui/material';
import { StarRounded, ArrowBack } from '@mui/icons-material';

const ReviewInfluencer = ({ influencer, campaign, onClose }) => {
    // --- ESTADOS DO FORMULÁRIO ---
    const [rating, setRating] = useState(4);
    const [title, setTitle] = useState(`Avaliação sobre ${influencer.name}`);
    const [comment, setComment] = useState('');
    const [tags, setTags] = useState([]);

    // --- ESTADOS DE CONTROLE DA UI ---
    const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
    const [openSuccessDialog, setOpenSuccessDialog] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const { user } = useAuth();

    // 3. Lógica para criar a lista de tags dinamicamente a partir do mock
    const allAvailableTags = useMemo(() => {
        const tagsSet = new Set();
        influencers.forEach(influencer => {
            influencer.tags?.forEach(tag => { // Usando o campo "tags"
                tagsSet.add(tag);
            });
        });
        return Array.from(tagsSet).sort(); // Retorna um array ordenado de tags únicas
    }, []);

    const handleConfirmSubmit = async () => {
        handleCloseConfirm();
        setSubmitting(true);
        setError('');

        const reviewData = {
            rating,
            title,
            comment,
            tags,
            influencerId: influencer._id,
            campaignId: campaign._id,
        };

        try {
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user.token}`,
                },
            };
            await axios.post('http://localhost:5001/api/reviews', reviewData, config);
            setOpenSuccessDialog(true);
        } catch (err) {
            const message = err.response?.data?.message || 'Ocorreu um erro ao enviar a avaliação.';
            setError(message);
            console.error(err);
        } finally {
            setSubmitting(false);
        }
    };

    const handleCloseSuccess = () => {
        setOpenSuccessDialog(false);
        onClose();
    };

    const handleOpenConfirm = () => {
        setError('');
        setOpenConfirmDialog(true);
    };

    const handleCloseConfirm = () => setOpenConfirmDialog(false);

    const dialogSx = {
        "& .MuiPaper-root": {
            backgroundColor: "rgba(235, 222, 235, 0.8)",
            color: "#610069ff",
            backdropFilter: "blur(20px)",
            borderRadius: '20px',
            border: '1px solid rgba(255, 255, 255, 0.2)'
        }
    };

    return (
        <Box
            sx={{
                backgroundColor: "rgba(20, 1, 19, 0.6)", p: 3, borderRadius: "12px",
                border: "1px solid rgba(255, 255, 255, 0.1)", height: '100%', color: 'white',
                overflowY: 'auto', display: 'flex', flexDirection: 'column',
                "&::-webkit-scrollbar": { width: "8px" },
                "&::-webkit-scrollbar-track": { background: "rgba(0, 0, 0, 0.2)", borderRadius: "10px" },
                "&::-webkit-scrollbar-thumb": { backgroundColor: "rgba(255, 255, 255, 0.3)", borderRadius: "10px" },
                "&::-webkit-scrollbar-thumb:hover": { backgroundColor: "rgba(255, 255, 255, 0.5)" }
            }}
        >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <IconButton onClick={onClose} sx={{ color: 'white', mr: 1 }}> <ArrowBack /> </IconButton>
                <StarRounded sx={{ mr: 1.5, fontSize: '2rem' }} />
                <Typography variant="h5" fontWeight="bold">Avaliação</Typography>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2, backgroundColor: 'rgba(255, 102, 114, 0.2)', color: 'white' }}>{error}</Alert>}

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 2fr' }, gap: 4, flex: 1 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center', textAlign: 'center' }}>
                    <Typography variant="h5">Avalie o influenciador</Typography>
                    <Typography fontWeight="bold" variant="h6">{influencer.name}</Typography>
                    <Rating
                        name="influencer-rating"
                        value={rating}
                        onChange={(event, newValue) => { setRating(newValue); }}
                        emptyIcon={<StarRounded style={{ opacity: 0.35 }} fontSize="inherit" />}
                        icon={<StarRounded fontSize="inherit" />}
                        sx={{ '& .MuiRating-iconFilled': { color: 'white' }, fontSize: '3rem' }}
                    />
                    <Typography sx={{ mt: 2, width: '100%' }} align="left">Adicionar Tags</Typography>
                    <Autocomplete
                        freeSolo
                        multiple
                        fullWidth
                        options={allAvailableTags} // 4. Usando a lista de tags do mock
                        value={tags}
                        onChange={(event, newValue) => { setTags(newValue); }}
                        getOptionLabel={(option) => option}
                        renderTags={(value, getTagProps) =>
                            value.map((option, index) => (
                                <Chip
                                    label={option}
                                    {...getTagProps({ index })}
                                    sx={{ backgroundColor: 'rgba(255,255,255,0.1)', color: 'white' }}
                                />
                            ))
                        }
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                variant="outlined"
                                placeholder={tags.length > 0 ? '' : 'Pesquise ou adicione tags'}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '8px',
                                        '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.2)' },
                                        '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.5)' },
                                        '&.Mui-focused fieldset': { borderColor: 'white' },
                                    },
                                    '& .MuiInputBase-input': { color: 'white' },
                                    '.MuiChip-root': { color: 'white', backgroundColor: 'rgba(255,255,255,0.15)' }
                                }}
                            />
                        )}
                    />
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Typography>Título da Avaliação</Typography>
                    <TextField
                        fullWidth
                        variant="outlined"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <Chip
                                        avatar={<Avatar alt={campaign.title} src={campaign.logo} />}
                                        label={campaign.title}
                                        sx={{ backgroundColor: 'rgba(255,255,255,0.1)', color: 'white', '.MuiAvatar-root': { width: 24, height: 24 } }}
                                    />
                                </InputAdornment>
                            ),
                        }}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '8px',
                                '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.2)' },
                                '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.5)' },
                            },
                            '& .MuiInputBase-input': { color: 'white' },
                        }}
                    />

                    {/* 5. A BARRA DE FORMATAÇÃO FOI REMOVIDA DAQUI */}

                    <TextField
                        fullWidth
                        multiline
                        rows={8}
                        placeholder="Digite aqui a descrição da sua avaliação..."
                        variant="outlined"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                backgroundColor: 'rgba(255,255,255,0.05)',
                                borderRadius: '8px', // 6. Borda arredondada ajustada
                                '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.2)'},
                                '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.5)' },
                            },
                            '& .MuiInputBase-input': { color: 'white' },
                        }}
                    />
                </Box>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <Button
                    onClick={handleOpenConfirm}
                    disabled={submitting}
                    variant="contained"
                    startIcon={<StarRounded />}
                    sx={{
                        backgroundColor: 'white', color: '#8A2BE2', fontWeight: 'bold',
                        borderRadius: '12px', px: 4, py: 1.5, textTransform: 'none',
                        fontSize: '1rem', '&:hover': { backgroundColor: '#f0f0f0' }
                    }}
                >
                    {submitting ? 'Enviando...' : 'Enviar Avaliação'}
                </Button>
            </Box>

            <Dialog open={openConfirmDialog} onClose={handleCloseConfirm} sx={dialogSx}>
                <DialogTitle>{"Confirmar Avaliação"}</DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{ color: "#4f4f4fff" }}>
                        Tem certeza de que deseja enviar esta avaliação?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseConfirm} sx={{ color: "#540069ff" }}>
                        Cancelar
                    </Button>
                    <Button onClick={handleConfirmSubmit} sx={{ fontWeight: 'bold', color: 'rgb(205, 0, 100)' }} autoFocus>
                        Confirmar
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={openSuccessDialog} onClose={handleCloseSuccess} sx={dialogSx}>
                <DialogTitle>{"Avaliação Realizada!"}</DialogTitle>
                <DialogActions>
                    <Button onClick={handleCloseSuccess} sx={{ fontWeight: 'bold', color: '#540069ff' }} autoFocus>
                        Certo
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ReviewInfluencer;