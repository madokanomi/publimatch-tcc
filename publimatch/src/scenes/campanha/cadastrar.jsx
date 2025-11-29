// src/scenes/campaigns/CampaignsRegister.jsx

import React, { useState, useMemo } from 'react'; // Adicionado useMemo
import {
    Box,
    Typography,
    TextField,
    FormControlLabel,
    Switch,
    Chip,
    IconButton,
    Button,
    FormControl,
    Radio,
    RadioGroup,
    InputAdornment
} from '@mui/material';
import {
    CameraAltOutlined,
    Instagram,
    YouTube,
    DeleteForeverOutlined,
    ArrowBack
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { SiTwitch, SiTiktok } from 'react-icons/si';
import axios from 'axios';
import { useAuth } from '../../auth/AuthContext';
import TiptapEditor from '../../components/TipTapEditor';
import { influencers } from '../../data/mockInfluencer'; // ✨ 1. IMPORTA OS DADOS DOS INFLUENCERS

const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const CampaignsRegister = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    
    // ✨ 2. CRIA A LISTA DE CATEGORIAS DINAMICAMENTE A PARTIR DO MOCK ✨
    const allCategories = useMemo(() => {
        const categoriesSet = new Set();
        influencers.forEach(influencer => {
            influencer.categorias.forEach(category => {
                categoriesSet.add(category);
            });
        });
        // Converte o Set para Array e ordena
        return Array.from(categoriesSet).sort();
    }, []); // O array vazio significa que isso só será calculado uma vez

    // Estados para os campos do formulário
    const [privacy, setPrivacy] = useState(false);
    const [title, setTitle] = useState('');
    const [campaignImageFile, setCampaignImageFile] = useState(null);
    const [campaignImagePreview, setCampaignImagePreview] = useState(null);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [minFollowers, setMinFollowers] = useState('');
    const [minViews, setMinViews] = useState('');
    const [selectedSocials, setSelectedSocials] = useState([]);
    const [description, setDescription] = useState(null);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [paymentType, setPaymentType] = useState('Indefinido');
    const [paymentValueExact, setPaymentValueExact] = useState('');
    const [paymentValueMin, setPaymentValueMin] = useState('');
    const [paymentValueMax, setPaymentValueMax] = useState('');
    const [vagas, setVagas] = useState('');
    const [hashtag, setHashtag] = useState('');
    const [errors, setErrors] = useState({});
    const allSocials = ['instagram', 'youtube', 'twitch', 'tiktok'];
    

    const [categorySearch, setCategorySearch] = useState('');
    const [showAllCategories, setShowAllCategories] = useState(false);

    const minDateAllowed = new Date();
    minDateAllowed.setDate(minDateAllowed.getDate() - 14);
    const minDateString = formatDate(minDateAllowed);

    const handleCategoryClick = (category) => {
        if (errors.categories) setErrors(prev => ({ ...prev, categories: false }));
        setSelectedCategories((prev) =>
            prev.includes(category)
                ? prev.filter((c) => c !== category)
                : [...prev, category]
        );
    };

    const handleSocialClick = (social) => {
        if (errors.socials) setErrors(prev => ({ ...prev, socials: false }));
        setSelectedSocials((prev) =>
            prev.includes(social)
                ? prev.filter((s) => s !== social)
                : [...prev, social]
        );
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setCampaignImagePreview(URL.createObjectURL(file));
            setCampaignImageFile(file);
            if (errors.image) setErrors(prev => ({ ...prev, image: false }));
        }
    };

    const handleImageDrop = (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file) {
            setCampaignImagePreview(URL.createObjectURL(file));
            setCampaignImageFile(file);
            if (errors.image) setErrors(prev => ({ ...prev, image: false }));
        }
    };

    const getSocialIcon = (social) => {
        switch (social) {
            case 'instagram': return <Instagram />;
            case 'youtube': return <YouTube />;
            case 'twitch': return <SiTwitch />;
            case 'tiktok': return <SiTiktok />;
            default: return null;
        }
    };

    const handleStartDateChange = (e) => {
        const selectedDateValue = e.target.value;
        if (!selectedDateValue) {
            setErrors(prev => ({ ...prev, startDate: false }));
            setStartDate('');
            return;
        }
        const selectedDate = new Date(`${selectedDateValue}T00:00:00`);
        const minDate = new Date(`${minDateString}T00:00:00`);
        if (selectedDate < minDate) {
            setErrors(prev => ({ ...prev, startDate: true }));
            setStartDate(selectedDateValue);
        } else {
            setErrors(prev => ({ ...prev, startDate: false }));
            setStartDate(selectedDateValue);
            if (endDate) {
                const minEndDate = new Date(`${selectedDateValue}T00:00:00`);
                minEndDate.setDate(minEndDate.getDate() + 7);
                const currentEndDate = new Date(`${endDate}T00:00:00`);
                if (currentEndDate < minEndDate) {
                    setEndDate('');
                }
            }
        }
    };

    const handleEndDateChange = (e) => {
        const selectedEndDateValue = e.target.value;
        if (!selectedEndDateValue) {
            setErrors(prev => ({ ...prev, endDate: false }));
            setEndDate('');
            return;
        }
        const minEndDate = new Date(`${startDate}T00:00:00`);
        minEndDate.setDate(minEndDate.getDate() + 7);
        const selectedEndDate = new Date(`${selectedEndDateValue}T00:00:00`);
        if (selectedEndDate < minEndDate) {
            setErrors(prev => ({ ...prev, endDate: true }));
            setEndDate(selectedEndDateValue);
        } else {
            setErrors(prev => ({ ...prev, endDate: false }));
            setEndDate(selectedEndDateValue);
        }
    };
    
    const validateForm = () => {
        const newErrors = {};
        if (!title.trim()) newErrors.title = true;
        if (!hashtag.trim()) newErrors.hashtag = true;
        if (!campaignImageFile) newErrors.image = true;
        if (!startDate) {
            newErrors.startDate = true;
        } else if (new Date(`${startDate}T00:00:00`) < new Date(`${minDateString}T00:00:00`)) {
            newErrors.startDate = true;
        }
        if (!endDate) {
            newErrors.endDate = true;
        } else if (startDate && !newErrors.startDate) {
            const minEndDate = new Date(`${startDate}T00:00:00`);
            minEndDate.setDate(minEndDate.getDate() + 7);
            const currentEndDate = new Date(`${endDate}T00:00:00`);
            if (currentEndDate < minEndDate) {
                newErrors.endDate = true;
            }
        }
        if (paymentType === 'Exato' && !paymentValueExact) newErrors.paymentValueExact = true;
        if (paymentType === 'Aberto' && !paymentValueMin) newErrors.paymentValueMin = true;
        if (paymentType === 'Aberto' && !paymentValueMax) newErrors.paymentValueMax = true;
        if (selectedCategories.length === 0) newErrors.categories = true;
        if (!minFollowers.trim()) newErrors.minFollowers = true;
        if (!minViews.trim()) newErrors.minViews = true;
        if (selectedSocials.length === 0) newErrors.socials = true;
        if (!description || !description.content || (description.content.length === 1 && !description.content[0].content)) {
            newErrors.description = true;
        }

        if (!vagas || Number(vagas) <= 0) {
            newErrors.vagas = true;
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleRegisterCampaign = async () => {
        if (!user || !user.token) {
            alert("Você precisa estar logado para criar uma campanha.");
            return;
        }
        if (!validateForm()) {
            return;
        }

        const formData = new FormData();
        
        formData.append('title', title);
        formData.append('hashtag', hashtag.replace('#', '').trim());
        formData.append('privacy', privacy ? "Privada" : "Pública");
        formData.append('minFollowers', minFollowers);
        formData.append('minViews', minViews);
        formData.append('paymentType', paymentType);
        formData.append('paymentValueExact', Number(paymentValueExact) || 0);
        formData.append('paymentValueMin', Number(paymentValueMin) || 0);
        formData.append('paymentValueMax', Number(paymentValueMax) || 0);
        formData.append('startDate', startDate);
        formData.append('endDate', endDate);
        formData.append('vagas', Number(vagas));

        formData.append('description', JSON.stringify(description));
        formData.append('categories', JSON.stringify(selectedCategories));
        formData.append('requiredSocials', JSON.stringify(selectedSocials));

        if (campaignImageFile) {
            formData.append('logo', campaignImageFile);
        }

        try {
            await axios.post(
                'http://localhost:5001/api/campaigns',
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${user.token}`
                    }
                }
            );
            navigate(-1);
        } catch (error) {
            console.error("Erro ao cadastrar campanha:", error);
            alert("Não foi possível cadastrar a campanha. Erro: " + (error.response?.data?.message || error.message));
        }
    };

    const getTextFieldProps = (fieldName) => ({
        error: !!errors[fieldName],
        onChange: (e) => {
            if (fieldName === 'startDate') {
                handleStartDateChange(e);
                return;
            }
            if (fieldName === 'endDate') {
                handleEndDateChange(e);
                return;
            }

            let value = e.target.value;

            if (fieldName === 'hashtag') {
                value = value.replace(/\s/g, ''); // Remove todos os espaços (global)
            }

            const stateSetter = {
                title: setTitle,
                paymentValueExact: setPaymentValueExact,
                paymentValueMin: setPaymentValueMin,
                paymentValueMax: setPaymentValueMax,
                minFollowers: setMinFollowers,
                minViews: setMinViews,
                vagas: setVagas,
                hashtag: setHashtag
            };
            stateSetter[fieldName](e.target.value);
            if (errors[fieldName]) {
                setErrors(prev => ({ ...prev, [fieldName]: false }));
            }
        },
        InputProps: {
            sx: {
                borderRadius: '8px',
                backgroundColor: 'rgba(255,255,255,0.1)',
                '& fieldset': { border: 'none' },
                '&.Mui-error .MuiOutlinedInput-notchedOutline': {
                    border: '1px solid #d32f2f',
                },
                '& input, & textarea': { color: 'white' },
            }
        }
    });

    let minEndDateString;
    if (startDate) {
        const minEndDate = new Date(`${startDate}T00:00:00`);
        minEndDate.setDate(minEndDate.getDate() + 7);
        minEndDateString = formatDate(minEndDate);
    }

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
                <Typography variant="h5" fontWeight="bold" sx={{ ml: 2, flexGrow: 1 }}> Cadastro de Campanha </Typography>
                <FormControlLabel
                    control={
                        <Switch checked={privacy} onChange={(e) => setPrivacy(e.target.checked)}
                            sx={{
                                '& .MuiSwitch-track': { backgroundColor: privacy ? '#BF28B0' : 'rgba(255,255,255,0.2)' },
                                '& .MuiSwitch-thumb': { backgroundColor: 'white' },
                            }}
                        />
                    }
                    label={<Typography color="white">Privacidade: {privacy ? 'Privada' : 'Pública'}</Typography>}
                    labelPlacement="start"
                />
            </Box>

            <Box sx={{ backgroundColor: 'rgba(255,255,255,0.05)', p: 3, borderRadius: '12px', mb: 4 }}>
                <Typography sx={{ color: 'rgba(255,255,255,0.8)', mb: 1 }}>Título da Campanha</Typography>
                <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="Título da Campanha"
                    value={title}
                    {...getTextFieldProps('title')}
                />

                <Box mt={3}>
                    <Box sx={{ display: 'flex', gap: 2, mb: 1, alignItems: 'center' }}>
                        <Box sx={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography sx={{ color: 'rgba(255,255,255,0.8)' }}>Pagamento ao Influenciador</Typography>
                            <FormControl>
                                <RadioGroup row value={paymentType} onChange={(e) => setPaymentType(e.target.value)}>
                                    <FormControlLabel value="Indefinido" control={<Radio size="small" sx={{ color: 'rgba(255,255,255,0.7)', '&.Mui-checked': { color: '#BF28B0' } }} />} label={<Typography sx={{ fontSize: '0.9rem' }}>Indefinido</Typography>} />
                                    <FormControlLabel value="Aberto" control={<Radio size="small" sx={{ color: 'rgba(255,255,255,0.7)', '&.Mui-checked': { color: '#BF28B0' } }} />} label={<Typography sx={{ fontSize: '0.9rem' }}>Faixa</Typography>} />
                                    <FormControlLabel value="Exato" control={<Radio size="small" sx={{ color: 'rgba(255,255,255,0.7)', '&.Mui-checked': { color: '#BF28B0' } }} />} label={<Typography sx={{ fontSize: '0.9rem' }}>Exato</Typography>} />
                                </RadioGroup>
                            </FormControl>
                        </Box>
                        <Box sx={{ flex: 1 }}> <Typography sx={{ color: 'rgba(255,255,255,0.8)' }}>Data de Início</Typography> </Box>
                        <Box sx={{ flex: 1 }}> <Typography sx={{ color: 'rgba(255,255,255,0.8)' }}>Data de Término</Typography> </Box>

                        <Box sx={{ flex: 0.5 }}> <Typography sx={{ color: 'rgba(255,255,255,0.8)' }}>Vagas</Typography> </Box>
                    </Box>

                    

                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Box sx={{ flex: 1 }}>
                            {paymentType === 'Indefinido' && (
                                <TextField fullWidth disabled value="Pagamento a combinar"
                                    InputProps={{
                                        sx: {
                                            borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.1)',
                                            '&.Mui-disabled': { backgroundColor: 'rgba(255,255,255,0.1)' },
                                            '& .MuiInputBase-input.Mui-disabled': { color: 'rgba(255,255,255,0.5)', '-webkit-text-fill-color': 'rgba(255,255,255,0.5)' },
                                            '& fieldset': { border: 'none' },
                                        },
                                    }}
                                />
                            )}
                            {paymentType === 'Exato' && (
                                <TextField fullWidth type="number" variant="outlined" placeholder="Ex: 5000" value={paymentValueExact} {...getTextFieldProps('paymentValueExact')} InputProps={{ ...getTextFieldProps('paymentValueExact').InputProps, startAdornment: <InputAdornment position="start" sx={{ color: 'white' }}>R$</InputAdornment> }} />
                            )}
                            {paymentType === 'Aberto' && (
                                <Box sx={{ display: 'flex', gap: 2 }}>
                                    <TextField fullWidth type="number" variant="outlined" placeholder="Mín: 1000" value={paymentValueMin} {...getTextFieldProps('paymentValueMin')} InputProps={{ ...getTextFieldProps('paymentValueMin').InputProps, startAdornment: <InputAdornment position="start" sx={{ color: 'white' }}>R$</InputAdornment> }} />
                                    <TextField fullWidth type="number" variant="outlined" placeholder="Máx: 3000" value={paymentValueMax} {...getTextFieldProps('paymentValueMax')} InputProps={{ ...getTextFieldProps('paymentValueMax').InputProps, startAdornment: <InputAdornment position="start" sx={{ color: 'white' }}>R$</InputAdornment> }} />
                                </Box>
                            )}
                        </Box>
                        <Box sx={{ flex: 1 }}>
                            <TextField
                                fullWidth
                                type="date"
                                variant="outlined"
                                value={startDate}
                                {...getTextFieldProps('startDate')}
                                InputProps={{ ...getTextFieldProps('startDate').InputProps, sx: { ...getTextFieldProps('startDate').InputProps.sx, '& input': { color: 'white', colorScheme: 'dark' } } }}
                                inputProps={{ min: minDateString }}
                            />
                        </Box>
                        <Box sx={{ flex: 1 }}>
                            <TextField
                                fullWidth
                                type="date"
                                variant="outlined"
                                value={endDate}
                                {...getTextFieldProps('endDate')}
                                disabled={!startDate} 
                                InputProps={{ ...getTextFieldProps('endDate').InputProps, sx: { ...getTextFieldProps('endDate').InputProps.sx, '& input': { color: 'white', colorScheme: 'dark' } } }}
                                inputProps={{ min: minEndDateString }}
                            />
                        </Box>

                        <Box sx={{ flex: 0.5 }}>
                            <TextField
                                fullWidth
                                type="number"
                                variant="outlined"
                                placeholder="Ex: 10"
                                value={vagas}
                                {...getTextFieldProps('vagas')}
                                inputProps={{ min: 1 }} // Impede números negativos no input
                            />
                        </Box>
                    </Box>
                </Box>
                <Box sx={{
                    mt: 3, border: errors.image ? '2px dashed #d32f2f' : '2px dashed rgba(255,255,255,0.2)',
                    borderRadius: '12px', cursor: 'pointer', transition: 'border-color 0.3s ease',
                    '&:hover': { borderColor: errors.image ? '#d32f2f' : 'rgba(255,255,255,0.5)' },
                    position: 'relative', height: '250px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }} onDrop={handleImageDrop} onDragOver={(e) => e.preventDefault()} onClick={() => document.getElementById('image-upload').click()}>
                    
                    {campaignImagePreview ? (
                        <Box component="img" src={campaignImagePreview} alt="Pré-visualização da Imagem" sx={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '10px' }} />
                    ) : (
                        <Box sx={{ textAlign: 'center' }}>
                            <CameraAltOutlined sx={{ fontSize: '4rem', color: 'rgba(255,255,255,0.5)' }} />
                            <Typography color="rgba(255,255,255,0.5)" mt={1}> Insira a imagem da campanha </Typography>
                        </Box>
                    )}
                    <input id="image-upload" type="file" accept="image/*" hidden onChange={handleImageChange} />
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
    label="Buscar categoria..." // 1. MUDANÇA AQUI
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
                        <Box
                            sx={{
                                border: errors.categories ? '1px solid #d32f2f' : 'none',
                                borderRadius: '8px',
                                p: errors.categories ? 1 : 0
                            }}
                        >
                            <Box display="flex" flexWrap="wrap" gap={1}>
                                {(showAllCategories ? allCategories : allCategories.slice(0, 10))
                                    .filter((cat) => cat.toLowerCase().includes(categorySearch.toLowerCase()))
                                    .map((category) => (
                                        <Chip
                                            key={category}
                                            label={category}
                                            onClick={() => handleCategoryClick(category)}
                                            deleteIcon={selectedCategories.includes(category) ? <DeleteForeverOutlined /> : null}
                                            onDelete={selectedCategories.includes(category) ? () => handleCategoryClick(category) : undefined}
                                            sx={{
                                                backgroundColor: selectedCategories.includes(category) ? '#BF28B0' : 'rgba(255,255,255,0.1)',
                                                color: 'white',
                                                fontWeight: 'bold',
                                                borderRadius: '8px',
                                                '& .MuiChip-deleteIcon': { color: 'white', '&:hover': { color: 'rgba(255,255,255,0.7)' } },
                                                '&:hover': {
                                                    backgroundColor: selectedCategories.includes(category) ? '#a9239d' : 'rgba(255,255,255,0.2)',
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
                            <TextField fullWidth variant="outlined" placeholder="Ex: 10000" value={minFollowers} {...getTextFieldProps('minFollowers')} />
                        </Box>
                        <Box>
                            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 1 }}>Mínimo de visualizações:</Typography>
                            <TextField fullWidth variant="outlined" placeholder="Ex: 5000" value={minViews} {...getTextFieldProps('minViews')} />
                        </Box>
                        <Box>
                            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 1 }}>Redes Sociais</Typography>
                             <Box sx={{ border: errors.socials ? '1px solid #d32f2f' : 'none', borderRadius: '8px', p: errors.socials ? 1 : 0, display: 'inline-block' }}>
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                    {allSocials.map((social) => (<IconButton key={social} onClick={() => handleSocialClick(social)} sx={{ color: 'white', backgroundColor: selectedSocials.includes(social) ? '#BF28B0' : 'rgba(255,255,255,0.1)', '&:hover': { backgroundColor: selectedSocials.includes(social) ? '#a9239d' : 'rgba(255,255,255,0.2)', }, }} > {getSocialIcon(social)} </IconButton>))}
                                </Box>
                            </Box>
                        </Box>
                    </Box>

                </Box>
            </Box>

            <Box sx={{ backgroundColor: 'rgba(255,255,255,0.05)', p: 3, borderRadius: '12px', mb: 4 }}>
                <Typography sx={{ color: 'rgba(255,255,255,0.8)', mb: 1 }}>Detalhes da Campanha</Typography>
                
                <TiptapEditor 
                    onContentChange={(jsonContent) => {
                        setDescription(jsonContent);
                        if (errors.description) {
                            setErrors(prev => ({...prev, description: false}));
                        }
                    }}
                    error={!!errors.description}
                />
            </Box>

            <Box sx={{ 
                position: 'relative', // 1. O container do botão agora é relativo
                textAlign: 'center',  // 2. Isso mantém o botão centralizado
                pb: 4, 
                // 3. Mais padding-top no mobile para dar espaço para a hashtag
                pt: { xs: 12, md: 4 }, 
            }}>
                
                {/* 4. CAIXA DA HASHTAG */}
                <Box sx={{ 
                    // Em telas de celular (xs), é um bloco normal
                    position: { xs: 'relative', md: 'absolute' }, 
                    width: { xs: '100%', md: '30%' }, // <-- "menos comprida" (30%)
                    mb: { xs: 3, md: 0 }, // Margem abaixo só no mobile

                    // Em telas de desktop (md), é absoluto
                    left: { md: 0 },         // Canto esquerdo
                    bottom: { md: '32px' },   // Alinhado na base (32px = 8 * 4 (pb: 4))
                }}>
                    <Typography sx={{ color: 'rgba(255,255,255,0.8)', mb: 1 }}>
                        Hashtag Oficial
                    </Typography>
                    <TextField
                        fullWidth
                        size="small" // Mantém pequeno
                        variant="outlined"
                        placeholder="ex: macdonalds100anos"
                        value={hashtag}
                        {...getTextFieldProps('hashtag')}
                        InputProps={{
                            ...getTextFieldProps('hashtag').InputProps,
                            startAdornment: (
                                <InputAdornment position="start" sx={{ color: 'white' }}>
                                    #
                                </InputAdornment>
                            ),
                        }}
                    />
                </Box>
                
                {/* 5. SEU BOTÃO (EXATAMENTE COMO ESTAVA) */}
                <Button onClick={handleRegisterCampaign} sx={{ 
                    borderRadius: "30px", 
                    transition: "all 0.2s ease-in-out", 
                    background: "#FFFFFF", 
                    boxShadow: "0px 0px 24.5px 4px rgba(255, 55, 235, 0.25)", 
                    color: "#BF28B0", 
                    fontWeight: "900", 
                    fontSize: "18px", 
                    px: 6, py: 1.5, 
                    textTransform: "none", 
                    "&:hover": { borderRadius: "10px", background: "#ffffff", color: "#a9239d", boxShadow: "none" }, 
                }} >
                    Cadastrar Campanha
                </Button>
            </Box>
        </Box>
    );
};

export default CampaignsRegister;