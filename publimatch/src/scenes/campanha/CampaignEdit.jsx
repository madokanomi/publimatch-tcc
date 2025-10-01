// src/scenes/campaigns/CampaignEdit.jsx

import React, { useState, useEffect, useMemo } from 'react'; // Adicionado useMemo
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box, Typography, Button, TextField, Chip, IconButton, Switch,
    FormControlLabel, Snackbar, Alert, CircularProgress, FormControl,
    RadioGroup, Radio, InputAdornment
} from '@mui/material';
import {
    ArrowBack, CameraAltOutlined, Instagram, YouTube,
    DeleteForeverOutlined
} from '@mui/icons-material';
import { SiTwitch, SiTiktok } from 'react-icons/si';
import axios from 'axios';
import { useAuth } from '../../auth/AuthContext';
import TiptapEditor from '../../components/TipTapEditor';
import { influencers } from '../../data/mockInfluencer'; // Importa a fonte de dados

const allSocials = ['instagram', 'youtube', 'twitch', 'tiktok'];

const CampaignEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    // Gera a lista de categorias dinamicamente a partir do mock
    const allCategories = useMemo(() => {
        const categoriesSet = new Set();
        influencers.forEach(influencer => {
            influencer.categorias.forEach(category => {
                categoriesSet.add(category);
            });
        });
        return Array.from(categoriesSet).sort();
    }, []);

    const [formData, setFormData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    const [imagePreview, setImagePreview] = useState(null);
    const [newImageFile, setNewImageFile] = useState(null);
    
    const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });

    // Estados para a nova funcionalidade de categorias
    const [categorySearch, setCategorySearch] = useState('');
    const [showAllCategories, setShowAllCategories] = useState(false);

    useEffect(() => {
        if (!user) return;
        const fetchCampaign = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${user.token}` } };
                const { data } = await axios.get(`http://localhost:5001/api/campaigns/${id}`, config);
                
                const sanitizedData = {
                    ...data,
                    title: data.title || '',
                    privacy: data.privacy === 'Privada',
                    minFollowers: data.minFollowers || '',
                    minViews: data.minViews || '',
                    paymentType: data.paymentType || 'Indefinido',
                    paymentValueExact: data.paymentValueExact || '',
                    paymentValueMin: data.paymentValueMin || '',
                    paymentValueMax: data.paymentValueMax || '',
                    startDate: data.startDate ? new Date(data.startDate).toISOString().split('T')[0] : '',
                    endDate: data.endDate ? new Date(data.endDate).toISOString().split('T')[0] : '',
                    description: typeof data.description === 'string' ? JSON.parse(data.description) : (data.description || null),
                    categories: data.categories || [],
                    requiredSocials: data.requiredSocials || [],
                };
                
                setFormData(sanitizedData);
                setImagePreview(data.logo || null);
            } catch (err) {
                setError('Não foi possível carregar os dados da campanha.');
                console.error("Erro ao buscar campanha:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchCampaign();
    }, [id, user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSwitchChange = (e) => {
        const { name, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: checked }));
    };

    const handleArrayChange = (field, value) => {
        setFormData(prev => {
            const currentArray = prev[field] || [];
            const newArray = currentArray.includes(value)
                ? currentArray.filter(item => item !== value)
                : [...currentArray, value];
            return { ...prev, [field]: newArray };
        });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImagePreview(URL.createObjectURL(file));
            setNewImageFile(file);
        }
    };

    const handleImageDrop = (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file) {
            setImagePreview(URL.createObjectURL(file));
            setNewImageFile(file);
        }
    };

    const handleSave = async () => {
        if (!user) return;

        const dataToSend = new FormData();
        
        Object.keys(formData).forEach(key => {
            if (key === 'createdBy' || key === 'participatingInfluencers') {
                return;
            }
            if (key === 'privacy') {
                dataToSend.append(key, formData[key] ? 'Privada' : 'Pública');
            } else if (key === 'description' || key === 'categories' || key === 'requiredSocials') {
                dataToSend.append(key, JSON.stringify(formData[key]));
            } else {
                dataToSend.append(key, formData[key]);
            }
        });
        
        if (newImageFile) {
            dataToSend.append('logo', newImageFile);
        }

        try {
            await axios.put(`http://localhost:5001/api/campaigns/${id}`, dataToSend, {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            });
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
    
    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><CircularProgress /></Box>;
    if (error) return <Typography color="error" sx={{ p: 4, textAlign: 'center' }}>{error}</Typography>;
    if (!formData) return null;

    return (
        <Box
            sx={{
                p: 4, color: 'white', height: '100%', maxHeight: '100vh', overflowY: 'auto',
                '&::-webkit-scrollbar': { width: '8px' }, '&::-webkit-scrollbar-track': { background: 'transparent' },
                '&::-webkit-scrollbar-thumb': { backgroundColor: 'rgba(255, 255, 255, 0.3)', borderRadius: '10px' },
                '&::-webkit-scrollbar-thumb:hover': { backgroundColor: 'rgba(255, 255, 255, 0.5)' },
                '.ProseMirror': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    color: 'white',
                    padding: '1rem',
                    minHeight: '250px',
                    borderBottomLeftRadius: '8px',
                    borderBottomRightRadius: '8px',
                },
                '.ProseMirror:focus': {
                    outline: 'none',
                },
                '.ProseMirror p.is-editor-empty:first-child::before': {
                    content: 'attr(data-placeholder)',
                    float: 'left',
                    color: 'rgba(255, 255, 255, 0.7)',
                    pointerEvents: 'none',
                    height: 0,
                },
            }}
        >
            <Box display="flex" alignItems="center" mb={3}>
                <IconButton onClick={() => navigate(`/campanha`)} sx={{ color: "white" }}> <ArrowBack /> </IconButton>
                <Typography variant="h5" fontWeight="bold" sx={{ ml: 2, flexGrow: 1 }}> Editar Campanha </Typography>
                <FormControlLabel
                    control={<Switch name="privacy" checked={formData.privacy} onChange={handleSwitchChange} sx={{ '& .MuiSwitch-track': { backgroundColor: formData.privacy ? '#BF28B0' : 'rgba(255,255,255,0.2)' }, '& .MuiSwitch-thumb': { backgroundColor: 'white' } }} />}
                    label={<Typography color="white">Privacidade: {formData.privacy ? 'Privada' : 'Pública'}</Typography>}
                    labelPlacement="start"
                />
            </Box>

            <Box sx={{ backgroundColor: 'rgba(255,255,255,0.05)', p: 3, borderRadius: '12px', mb: 4 }}>
                <Typography sx={{ color: 'rgba(255,255,255,0.8)', mb: 1 }}>Título da Campanha</Typography>
                <TextField fullWidth variant="outlined" placeholder="Título da Campanha" name="title" value={formData.title} onChange={handleChange} InputProps={{ sx: { borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.1)', '& fieldset': { border: 'none' }, '& input': { color: 'white' } } }} />
                
                <Box mt={3}>
                    <Box sx={{ display: 'flex', gap: 2, mb: 1, alignItems: 'center' }}>
                         <Box sx={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography sx={{ color: 'rgba(255,255,255,0.8)' }}>Pagamento ao Influenciador</Typography>
                            <FormControl>
                                <RadioGroup row name="paymentType" value={formData.paymentType} onChange={handleChange}>
                                    <FormControlLabel value="Indefinido" control={<Radio size="small" sx={{ color: 'rgba(255,255,255,0.7)', '&.Mui-checked': { color: '#BF28B0' } }} />} label={<Typography sx={{ fontSize: '0.9rem' }}>Indefinido</Typography>} />
                                    <FormControlLabel value="Aberto" control={<Radio size="small" sx={{ color: 'rgba(255,255,255,0.7)', '&.Mui-checked': { color: '#BF28B0' } }} />} label={<Typography sx={{ fontSize: '0.9rem' }}>Faixa</Typography>} />
                                    <FormControlLabel value="Exato" control={<Radio size="small" sx={{ color: 'rgba(255,255,255,0.7)', '&.Mui-checked': { color: '#BF28B0' } }} />} label={<Typography sx={{ fontSize: '0.9rem' }}>Exato</Typography>} />
                                </RadioGroup>
                            </FormControl>
                        </Box>
                        <Box sx={{ flex: 1 }}> <Typography sx={{ color: 'rgba(255,255,255,0.8)' }}>Data de Início</Typography> </Box>
                        <Box sx={{ flex: 1 }}> <Typography sx={{ color: 'rgba(255,255,255,0.8)' }}>Data de Término</Typography> </Box>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Box sx={{ flex: 1 }}>
                            {formData.paymentType === 'Indefinido' && <TextField fullWidth disabled value="Pagamento a combinar" InputProps={{ sx: { borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.1)', '&.Mui-disabled': { backgroundColor: 'rgba(255,255,255,0.1)' }, '& .MuiInputBase-input.Mui-disabled': { color: 'rgba(255,255,255,0.5)', '-webkit-text-fill-color': 'rgba(255,255,255,0.5)' }, '& fieldset': { border: 'none' }, } }} />}
                            {formData.paymentType === 'Exato' && <TextField fullWidth type="number" name="paymentValueExact" value={formData.paymentValueExact} onChange={handleChange} variant="outlined" placeholder="Ex: 5000" InputProps={{ sx: { borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.1)', '& fieldset': { border: 'none' }, '& input': { color: 'white' } }, startAdornment: <InputAdornment position="start" sx={{ color: 'white' }}>R$</InputAdornment> }} />}
                            {formData.paymentType === 'Aberto' && (
                                <Box sx={{ display: 'flex', gap: 2 }}>
                                    <TextField fullWidth type="number" name="paymentValueMin" value={formData.paymentValueMin} onChange={handleChange} variant="outlined" placeholder="Mín: 1000" InputProps={{ sx: { borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.1)', '& fieldset': { border: 'none' }, '& input': { color: 'white' } }, startAdornment: <InputAdornment position="start" sx={{ color: 'white' }}>R$</InputAdornment> }} />
                                    <TextField fullWidth type="number" name="paymentValueMax" value={formData.paymentValueMax} onChange={handleChange} variant="outlined" placeholder="Máx: 3000" InputProps={{ sx: { borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.1)', '& fieldset': { border: 'none' }, '& input': { color: 'white' } }, startAdornment: <InputAdornment position="start" sx={{ color: 'white' }}>R$</InputAdornment> }} />
                                </Box>
                            )}
                        </Box>
                        <Box sx={{ flex: 1 }}>
                            <TextField fullWidth type="date" name="startDate" value={formData.startDate} onChange={handleChange} variant="outlined" InputProps={{ sx: { borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.1)', '& fieldset': { border: 'none' }, '& input': { color: 'white', colorScheme: 'dark' } } }} />
                        </Box>
                        <Box sx={{ flex: 1 }}>
                            <TextField fullWidth type="date" name="endDate" value={formData.endDate} onChange={handleChange} variant="outlined" disabled={!formData.startDate} InputProps={{ sx: { borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.1)', '& fieldset': { border: 'none' }, '& input': { color: 'white', colorScheme: 'dark' } } }} />
                        </Box>
                    </Box>
                </Box>
                
                <Box sx={{ mt: 3, border: '2px dashed rgba(255,255,255,0.2)', borderRadius: '12px', cursor: 'pointer', position: 'relative', height: '250px', display: 'flex', alignItems: 'center', justifyContent: 'center', '&:hover': { borderColor: 'rgba(255,255,255,0.5)' } }} onDrop={handleImageDrop} onDragOver={(e) => e.preventDefault()} onClick={() => document.getElementById('image-upload-edit').click()}>
                    {imagePreview ? <Box component="img" src={imagePreview} alt="Pré-visualização" sx={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '10px' }} /> : <Box sx={{ textAlign: 'center' }}><CameraAltOutlined sx={{ fontSize: '4rem', color: 'rgba(255,255,255,0.5)' }} /><Typography color="rgba(255,255,255,0.5)" mt={1}>Insira a imagem da campanha</Typography></Box>}
                    <input id="image-upload-edit" type="file" accept="image/*" hidden onChange={handleImageChange} />
                </Box>
            </Box>

            <Box sx={{ backgroundColor: 'rgba(255,255,255,0.05)', p: 3, borderRadius: '12px', mb: 4 }}>
                <Typography sx={{ color: 'rgba(255,255,255,0.8)', mb: 2 }}>Detalhes da Segmentação</Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 3, alignItems: 'flex-start' }}>
                    
                    <Box>
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 1 }}>Categorias de Influenciador</Typography>
                        <TextField
                            fullWidth
                            size="small"
                            label="Buscar categoria..."
                            value={categorySearch}
                            onChange={(e) => setCategorySearch(e.target.value)}
                             sx={{
                                mb: 1.5,
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: "8px",
                                    backgroundColor: 'rgba(255,255,255,0.1)',
                                    '& fieldset': { borderColor: 'transparent' },
                                    '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                                    '&.Mui-focused fieldset': { borderColor: '#BF28B0' },
                                },
                                '& .MuiInputBase-input': { color: 'white' },
                                '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.5)' },
                                '& .MuiInputLabel-root.Mui-focused': { color: '#BF28B0' },
                            }}
                        />
                        <Box>
                            <Box display="flex" flexWrap="wrap" gap={1}>
                                {(showAllCategories ? allCategories : allCategories.slice(0, 10))
                                    .filter((cat) => cat.toLowerCase().includes(categorySearch.toLowerCase()))
                                    .map((category) => (
                                        <Chip
                                            key={category}
                                            label={category}
                                            onClick={() => handleArrayChange('categories', category)}
                                            deleteIcon={formData.categories.includes(category) ? <DeleteForeverOutlined /> : null}
                                            onDelete={formData.categories.includes(category) ? () => handleArrayChange('categories', category) : undefined}
                                            sx={{
                                                backgroundColor: formData.categories.includes(category) ? '#BF28B0' : 'rgba(255,255,255,0.1)',
                                                color: 'white',
                                                fontWeight: 'bold',
                                                borderRadius: '8px',
                                                '& .MuiChip-deleteIcon': { color: 'white', '&:hover': { color: 'rgba(255,255,255,0.7)' } },
                                                '&:hover': {
                                                    backgroundColor: formData.categories.includes(category) ? '#a9239d' : 'rgba(255,255,255,0.2)',
                                                }
                                            }}
                                        />
                                    ))
                                }
                            </Box>
                        </Box>
                        {allCategories.length > 10 && (
                            <Button
                                onClick={() => setShowAllCategories(!showAllCategories)}
                                size="small"
                                fullWidth
                                sx={{ 
                                    mt: 1.5, 
                                    color: "white", 
                                    textTransform: "none", 
                                    backgroundColor: "rgba(255, 255, 255, 0.1)", 
                                    borderRadius: "8px",
                                    "&:hover": { bgcolor: "rgba(255, 255, 255, 0.2)" } 
                                }}
                            >
                                {showAllCategories ? "Ver menos" : "Ver mais"}
                            </Button>
                        )}
                    </Box>
                    
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Box>
                            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 1 }}>Mínimo de seguidores:</Typography>
                            <TextField fullWidth name="minFollowers" value={formData.minFollowers} onChange={handleChange} variant="outlined" placeholder="Ex: 10000" InputProps={{ sx: { borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.1)', '& fieldset': { border: 'none' }, '& input': { color: 'white' } } }} />
                        </Box>
                        <Box>
                            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 1 }}>Mínimo de visualizações:</Typography>
                            <TextField fullWidth name="minViews" value={formData.minViews} onChange={handleChange} variant="outlined" placeholder="Ex: 5000" InputProps={{ sx: { borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.1)', '& fieldset': { border: 'none' }, '& input': { color: 'white' } } }} />
                        </Box>
                        <Box>
                            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 1 }}>Redes Sociais</Typography>
                             <Box>
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                   {allSocials.map((social) => (<IconButton key={social} onClick={() => handleArrayChange('requiredSocials', social)} sx={{ color: 'white', backgroundColor: formData.requiredSocials.includes(social) ? '#BF28B0' : 'rgba(255,255,255,0.1)', '&:hover': { backgroundColor: formData.requiredSocials.includes(social) ? '#a9239d' : 'rgba(255,255,255,0.2)', }, }} > {getSocialIcon(social)} </IconButton>))}
                                </Box>
                            </Box>
                        </Box>
                    </Box>

                </Box>
            </Box>

            <Box sx={{ backgroundColor: 'rgba(255,255,255,0.05)', p: 3, borderRadius: '12px', mb: 4 }}>
                <Typography sx={{ color: 'rgba(255,255,255,0.8)', mb: 1 }}>Detalhes da Campanha</Typography>
                <TiptapEditor
                    content={formData.description}
                    onContentChange={(jsonContent) => {
                        setFormData(prev => ({...prev, description: jsonContent}));
                    }}
                />
            </Box>

            <Box sx={{ textAlign: 'center', pb: 4 }}>
                <Button onClick={handleSave} sx={{ mt: 2, borderRadius: "30px", transition: "all 0.2s ease-in-out", background: "#FFFFFF", boxShadow: "0px 0px 24.5px 4px rgba(255, 55, 235, 0.25)", color: "#BF28B0", fontWeight: "900", fontSize: "18px", px: 6, py: 1.5, textTransform: "none", "&:hover": { borderRadius: "10px", background: "#ffffff", color: "#a9239d", boxShadow: "none" }, }} >
                    Salvar Alterações
                </Button>
            </Box>
            
            <Snackbar open={notification.open} autoHideDuration={4000} onClose={handleNotificationClose}>
                <Alert onClose={handleNotificationClose} severity={notification.severity} sx={{ width: '100%' }}>{notification.message}</Alert>
            </Snackbar>
        </Box>
    );
};

export default CampaignEdit;