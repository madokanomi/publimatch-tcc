import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box, Typography, Button, TextField, Chip, IconButton, Switch,
    FormControlLabel, Snackbar, Alert, CircularProgress, FormControl,
    RadioGroup, Radio, InputAdornment
} from '@mui/material';
import {
    ArrowBack, CameraAltOutlined, Instagram, YouTube,
    DeleteForeverOutlined, FormatBold, FormatItalic,
    FormatUnderlined, StrikethroughS
} from '@mui/icons-material';
import { SiTwitch, SiTiktok } from 'react-icons/si';
import axios from 'axios';
import { useAuth } from '../../auth/AuthContext';

// Listas estáticas para os seletores do formulário, iguais ao de cadastro
const allCategories = ['Comida', 'Jogos', 'Lifestyle', 'Família', 'Entretenimento', 'Vlogs', 'Comédia', 'Música', 'Terror', 'Arte', 'Livros', 'Automóveis', 'Tecnologia', 'Luxo', 'Saúde', 'Fitness'];
const allSocials = ['instagram', 'youtube', 'twitch', 'tiktok'];

const CampaignEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    // Estado único para todos os dados do formulário, carregamento e notificações
    const [formData, setFormData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [imagePreview, setImagePreview] = useState('');
    const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });

    // Efeito para buscar os dados da campanha na API
    useEffect(() => {
        if (!user) return;
        const fetchCampaign = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${user.token}` } };
                const { data } = await axios.get(`http://localhost:5001/api/campaigns/${id}`, config);
                const sanitizedData = {
                    ...data,
                    categories: data.categories || [],
                    requiredSocials: data.requiredSocials || [],
                    privacy: data.privacy === 'Privada',
                    startDate: data.startDate ? new Date(data.startDate).toISOString().split('T')[0] : '',
                    endDate: data.endDate ? new Date(data.endDate).toISOString().split('T')[0] : '',
                };
                setFormData(sanitizedData);
                setImagePreview(data.imageUrl || '');
            } catch (err) {
                setError('Não foi possível carregar os dados da campanha.');
            } finally {
                setLoading(false);
            }
        };
        fetchCampaign();
    }, [id, user]);

    // Funções para manipular o formulário
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'switch' ? checked : value }));
    };

    const handleChipClick = (type, value) => {
        const currentValues = formData[type] || [];
        const newValues = currentValues.includes(value)
            ? currentValues.filter(item => item !== value)
            : [...currentValues, value];
        setFormData(prev => ({ ...prev, [type]: newValues }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) setImagePreview(URL.createObjectURL(file));
    };

    const handleImageDrop = (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file) setImagePreview(URL.createObjectURL(file));
    };
    
    // Função para SALVAR as alterações
    const handleSave = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const dataToSave = { ...formData, privacy: formData.privacy ? 'Privada' : 'Pública' };
            await axios.put(`http://localhost:5001/api/campaigns/${id}`, dataToSave, config);
            setNotification({ open: true, message: 'Campanha atualizada com sucesso!', severity: 'success' });
            setTimeout(() => navigate('/campanha'), 2000);
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Erro ao salvar a campanha.';
            setNotification({ open: true, message: errorMessage, severity: 'error' });
        }
    };

    const handleNotificationClose = () => setNotification({ ...notification, open: false });

    const getSocialIcon = (social) => {
        switch (social) {
            case 'instagram': return <Instagram />;
            case 'youtube': return <YouTube />;
            case 'twitch': return <SiTwitch />;
            case 'tiktok': return <SiTiktok />;
            default: return null;
        }
    };

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;
    if (error) return <Typography color="error" sx={{ p: 4, textAlign: 'center' }}>{error}</Typography>;
    if (!formData) return null;

    return (
        <Box sx={{ p: 4, color: 'white', maxHeight: '100vh', overflowY: 'auto' }}>
            {/* Cabeçalho */}
            <Box display="flex" alignItems="center" mb={3}>
                <IconButton onClick={() => navigate('/campanha')} sx={{ color: "white" }}><ArrowBack /></IconButton>
                <Typography variant="h5" fontWeight="bold" sx={{ ml: 2, flexGrow: 1 }}>Editar Campanha</Typography>
                <FormControlLabel
                    control={<Switch name="privacy" checked={formData.privacy} onChange={handleChange} sx={{ '& .MuiSwitch-track': { backgroundColor: formData.privacy ? '#BF28B0' : 'rgba(255,255,255,0.2)' }, '& .MuiSwitch-thumb': { backgroundColor: 'white' } }} />}
                    label={<Typography>Privacidade: {formData.privacy ? 'Privada' : 'Pública'}</Typography>}
                    labelPlacement="start"
                />
            </Box>

            {/* Inputs Principais */}
            <Box sx={{ backgroundColor: 'rgba(255,255,255,0.05)', p: 3, borderRadius: '12px', mb: 4 }}>
                <Typography sx={{ color: 'rgba(255,255,255,0.8)', mb: 1 }}>Título da Campanha</Typography>
                <TextField fullWidth variant="outlined" name="title" value={formData.title} onChange={handleChange} InputProps={{ sx: { borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.1)', '& fieldset': { border: 'none' }, '& input': { color: 'white' } } }} />
                
                {/* Datas e Pagamento */}
                <Box sx={{ display: 'flex', gap: 2, mt: 3, alignItems: 'flex-start' }}>
                    <Box sx={{ flex: 1 }}>
                        <Typography sx={{ color: 'rgba(255,255,255,0.8)', mb: 1 }}>Pagamento ao Influenciador</Typography>
                        <FormControl component="fieldset">
                            <RadioGroup row name="paymentType" value={formData.paymentType} onChange={handleChange}>
                                <FormControlLabel value="Indefinido" control={<Radio sx={{color: 'rgba(255,255,255,0.7)', '&.Mui-checked': {color: '#BF28B0'}}} />} label="Indefinido" />
                                <FormControlLabel value="Aberto" control={<Radio sx={{color: 'rgba(255,255,255,0.7)', '&.Mui-checked': {color: '#BF28B0'}}} />} label="Faixa de Valor" />
                                <FormControlLabel value="Exato" control={<Radio sx={{color: 'rgba(255,255,255,0.7)', '&.Mui-checked': {color: '#BF28B0'}}} />} label="Valor Exato" />
                            </RadioGroup>
                        </FormControl>
                        {formData.paymentType === 'Exato' && <TextField fullWidth type="number" name="paymentValueExact" label="Valor Exato" variant="outlined" value={formData.paymentValueExact} onChange={handleChange} InputProps={{ startAdornment: <InputAdornment position="start" sx={{color: 'white'}}>R$</InputAdornment>, sx: { borderRadius: '8px', mt:1, backgroundColor: 'rgba(255,255,255,0.1)', '& fieldset': { border: 'none' }, '& input': { color: 'white' } } }} />}
                        {formData.paymentType === 'Aberto' && <Box sx={{ display: 'flex', gap: 2, mt: 1 }}><TextField fullWidth type="number" name="paymentValueMin" label="Valor Mínimo" variant="outlined" value={formData.paymentValueMin} onChange={handleChange} InputProps={{ startAdornment: <InputAdornment position="start" sx={{color: 'white'}}>R$</InputAdornment>, sx: { borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.1)', '& fieldset': { border: 'none' }, '& input': { color: 'white' } } }} /><TextField fullWidth type="number" name="paymentValueMax" label="Valor Máximo" variant="outlined" value={formData.paymentValueMax} onChange={handleChange} InputProps={{ startAdornment: <InputAdornment position="start" sx={{color: 'white'}}>R$</InputAdornment>, sx: { borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.1)', '& fieldset': { border: 'none' }, '& input': { color: 'white' } } }} /></Box>}
                    </Box>
                    <Box sx={{ flex: 1 }}><Typography sx={{ color: 'rgba(255,255,255,0.8)', mb: 1 }}>Data de Início</Typography><TextField fullWidth type="date" name="startDate" variant="outlined" value={formData.startDate} onChange={handleChange} InputProps={{ sx: { borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.1)', '& fieldset': { border: 'none' }, '& input': { color: 'white' } } }} /></Box>
                    <Box sx={{ flex: 1 }}><Typography sx={{ color: 'rgba(255,255,255,0.8)', mb: 1 }}>Data de Término</Typography><TextField fullWidth type="date" name="endDate" variant="outlined" value={formData.endDate} onChange={handleChange} InputProps={{ sx: { borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.1)', '& fieldset': { border: 'none' }, '& input': { color: 'white' } } }} /></Box>
                </Box>
                
                {/* Upload de Imagem */}
                <Box sx={{ mt: 3, border: '2px dashed rgba(255,255,255,0.2)', borderRadius: '12px', p: 4, textAlign: 'center', cursor: 'pointer' }} onDrop={handleImageDrop} onDragOver={(e) => e.preventDefault()} onClick={() => document.getElementById('image-upload-edit').click()}>
                    {imagePreview ? <Box component="img" src={imagePreview} alt="Pré-visualização" sx={{ width: '100%', height: 'auto', maxHeight: 200, objectFit: 'contain', borderRadius: '10px' }} /> : <Box><CameraAltOutlined sx={{ fontSize: '4rem', color: 'rgba(255,255,255,0.5)' }} /><Typography color="rgba(255,255,255,0.5)" mt={1}>Insira a imagem da campanha</Typography></Box>}
                    <input id="image-upload-edit" type="file" accept="image/*" hidden onChange={handleImageChange} />
                </Box>
            </Box>

            {/* Detalhes de Segmentação */}
            <Box sx={{ backgroundColor: 'rgba(255,255,255,0.05)', p: 3, borderRadius: '12px', mb: 4 }}>
                <Typography sx={{ color: 'rgba(255,255,255,0.8)', mb: 2 }}>Detalhes da Segmentação</Typography>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                    <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" sx={{ mb: 1 }}>Categorias de Influenciador</Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            {allCategories.map((category) => <Chip key={category} label={category} onClick={() => handleChipClick('categories', category)} onDelete={formData.categories.includes(category) ? () => handleChipClick('categories', category) : undefined} deleteIcon={formData.categories.includes(category) ? <DeleteForeverOutlined /> : undefined} sx={{ color: 'white', fontWeight: 'bold', borderRadius: '8px', backgroundColor: formData.categories.includes(category) ? '#BF28B0' : 'rgba(255,255,255,0.1)', '& .MuiChip-deleteIcon': { color: 'white', '&:hover': { color: 'rgba(255,255,255,0.7)' } } }} />)}
                        </Box>
                    </Box>
                    <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" sx={{ mb: 1 }}>Mínimo de Seguidores</Typography>
                        <TextField fullWidth variant="outlined" name="minFollowers" placeholder="Ex: 5K, 100K" value={formData.minFollowers} onChange={handleChange} InputProps={{ sx: { borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.1)', '& fieldset': { border: 'none' }, '& input': { color: 'white' } } }} />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" sx={{ mb: 1 }}>Mínimo de Visualizações</Typography>
                        <TextField fullWidth variant="outlined" name="minViews" placeholder="Ex: 5K, 100K" value={formData.minViews} onChange={handleChange} InputProps={{ sx: { borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.1)', '& fieldset': { border: 'none' }, '& input': { color: 'white' } } }} />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" sx={{ mb: 1 }}>Redes Sociais</Typography>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            {allSocials.map((social) => <IconButton key={social} onClick={() => handleChipClick('requiredSocials', social)} sx={{ color: 'white', backgroundColor: formData.requiredSocials.includes(social) ? '#BF28B0' : 'rgba(255,255,255,0.1)', '&:hover': { backgroundColor: formData.requiredSocials.includes(social) ? '#BF28B0' : 'rgba(255,255,255,0.2)' } }}>{getSocialIcon(social)}</IconButton>)}
                        </Box>
                    </Box>
                </Box>
            </Box>

            {/* Detalhes da Campanha (Descrição) */}
            <Box sx={{ backgroundColor: 'rgba(255,255,255,0.05)', p: 3, borderRadius: '12px', mb: 4 }}>
                <Typography sx={{ color: 'rgba(255,255,255,0.8)', mb: 2 }}>Detalhes da Campanha</Typography>
                <Box sx={{ display: 'flex', mb: 1 }}>
                    <IconButton sx={{ color: 'white' }}><FormatBold /></IconButton>
                    <IconButton sx={{ color: 'white' }}><FormatItalic /></IconButton>
                    <IconButton sx={{ color: 'white' }}><FormatUnderlined /></IconButton>
                    <IconButton sx={{ color: 'white' }}><StrikethroughS /></IconButton>
                </Box>
                <TextField fullWidth multiline rows={6} name="description" placeholder="Digite aqui a descrição" value={formData.description} onChange={handleChange} InputProps={{ sx: { borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.1)', '& fieldset': { border: 'none' }, '& textarea': { color: 'white' } } }} />
            </Box>

            {/* Botão de Salvar */}
            <Box sx={{ textAlign: 'center' }}>
                <Button onClick={handleSave} sx={{ mt: 2, borderRadius: "30px", background: "#FFFFFF", color: "#BF28B0", fontWeight: "900", fontSize: "18px", px: 6, '&:hover': { background: '#eee' } }}>Salvar Alterações</Button>
            </Box>

            {/* Notificação Snackbar */}
            <Snackbar open={notification.open} autoHideDuration={4000} onClose={handleNotificationClose}>
                <Alert onClose={handleNotificationClose} severity={notification.severity} sx={{ width: '100%' }}>{notification.message}</Alert>
            </Snackbar>
        </Box>
    );
};

export default CampaignEdit;

