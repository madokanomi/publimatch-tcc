// src/scenes/campaigns/CampaignsRegister.jsx

import React, { useState } from 'react';
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
  FormatBold,
  FormatItalic,
  FormatUnderlined,
  StrikethroughS,
  ArrowBack
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

import { SiTwitch, SiTiktok } from 'react-icons/si';
import axios from 'axios'; // 👈 1. IMPORTE O AXIOS
import { useAuth } from '../../auth/AuthContext'; 

const availableCategories = [
    'Comida', 'Jogos', 'Lifestyle', 'Família', 'Entretenimento', 
    'Vlogs', 'Comédia', 'Música', 'Terror', 'Arte', 'Livros', 
    'Automóveis', 'Tecnologia', 'Luxo', 'Saúde', 'Fitness'
];

// Função para extrair todas as categorias únicas do array de campanhas
const getAllUniqueCategories = (campaigns) => {
  const allCategories = campaigns.flatMap(c => c.categorias);
  return [...new Set(allCategories)];
};

const CampaignsRegister = () => {
  const navigate = useNavigate();
   const { user } = useAuth();
  const allCategories = availableCategories;

  // Estados para os campos do formulário
  const [privacy, setPrivacy] = useState(false);
  const [title, setTitle] = useState('');
  const [image, setImage] = useState(null);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [minFollowers, setMinFollowers] = useState('');
  const [minViews, setMinViews] = useState('');
  const [selectedSocials, setSelectedSocials] = useState([]);
  const [description, setDescription] = useState('');

const [startDate, setStartDate] = useState('');
const [endDate, setEndDate] = useState('');
const [paymentType, setPaymentType] = useState('Indefinido'); // O novo padrão
const [paymentValueExact, setPaymentValueExact] = useState('');
const [paymentValueMin, setPaymentValueMin] = useState('');
const [paymentValueMax, setPaymentValueMax] = useState('');
  const allSocials = ['instagram', 'youtube', 'twitch', 'tiktok'];

  const handleCategoryClick = (category) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const handleSocialClick = (social) => {
    setSelectedSocials((prev) =>
      prev.includes(social)
        ? prev.filter((s) => s !== social)
        : [...prev, social]
    );
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(URL.createObjectURL(file));
    }
  };

  const handleImageDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      setImage(URL.createObjectURL(file));
    }
  };

  const getSocialIcon = (social) => {
    switch (social) {
      case 'instagram':
        return <Instagram />;
      case 'youtube':
        return <YouTube />;
      case 'twitch':
        return <SiTwitch />;
      case 'tiktok':
        return <SiTiktok />;
      default:
        return null;
    }
  };

const handleRegisterCampaign = async () => {
    // Adiciona uma verificação de segurança
    if (!user || !user.token) {
        alert("Você precisa estar logado para criar uma campanha.");
        return;
    }
        // Validação básica (pode melhorar)
        if (!title || !description) {
            alert("Título e Descrição são obrigatórios!");
            return;
        }

        // Monta o objeto de dados PARA ENVIAR AO BACKEND
        // Os nomes das chaves devem bater com o seu campaignModel.js
       const campaignData = {
    title: title,
    description: description,
    privacy: privacy ? "Privada" : "Pública",
    categories: selectedCategories,
    minFollowers: minFollowers,
    minViews: minViews,
    requiredSocials: selectedSocials,
 paymentType, // Envia o tipo selecionado
    paymentValueExact: Number(paymentValueExact) || 0,
    paymentValueMin: Number(paymentValueMin) || 0,
    paymentValueMax: Number(paymentValueMax) || 0,
    startDate: startDate,   // 👈 Adicionado
    endDate: endDate,       // 👈 Adicionado
};

        try {
            // FAZ A CHAMADA DE API
            await axios.post(
                'http://localhost:5001/api/campaigns', // URL do seu endpoint
                campaignData, // Os dados que você quer enviar
                {
                    headers: {
                        Authorization: `Bearer ${user.token}` // O Passe VIP!
                    }
                }
            );

            // Se a chamada deu certo, navega para a página anterior
            navigate(-1);

        } catch (error) {
            console.error("Erro ao cadastrar campanha:", error);
            // Idealmente, mostrar um alerta de erro para o usuário
            alert("Não foi possível cadastrar a campanha. Erro: " + (error.response?.data?.message || error.message));
        }
    };

  return (
    <Box
      sx={{
        p: 4,
        color: 'white',
        maxHeight: '100vh',
        overflowY: 'auto',
        '&::-webkit-scrollbar': {
          width: '8px',
        },
        '&::-webkit-scrollbar-track': {
          background: 'transparent',
        },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: 'rgba(255, 255, 255, 0.3)',
          borderRadius: '10px',
        },
        '&::-webkit-scrollbar-thumb:hover': {
          backgroundColor: 'rgba(255, 255, 255, 0.5)',
        },
      }}
    >
      <Box display="flex" alignItems="center" mb={3}>
        <IconButton onClick={() => navigate(`/campanha`)} sx={{ color: "white" }}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h5" fontWeight="bold" sx={{ ml: 2 }}>
          Cadastro de Campanha
        </Typography>
        <FormControlLabel
          control={
            <Switch
              checked={privacy}
              onChange={(e) => setPrivacy(e.target.checked)}
              sx={{
                '& .MuiSwitch-track': {
                  backgroundColor: privacy ? '#BF28B0' : 'rgba(255,255,255,0.2)', // Cor alterada
                },
                '& .MuiSwitch-thumb': {
                  backgroundColor: 'white',
                },
              }}
            />
          }
          label={<Typography color="white">Privacidade: {privacy ? 'Privada' : 'Pública'}</Typography>}
          labelPlacement="start"
        />
      </Box>

      {/* Inputs Principais */}
      <Box
        sx={{
          backgroundColor: 'rgba(255,255,255,0.05)',
          p: 3,
          borderRadius: '12px',
          mb: 4,
        }}
      >
        <Typography sx={{ color: 'rgba(255,255,255,0.8)', mb: 1 }}>Título da Campanha</Typography>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Título da Campanha"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          InputProps={{
            sx: {
              borderRadius: '8px',
              backgroundColor: 'rgba(255,255,255,0.1)',
              '& fieldset': { border: 'none' },
              '& input': { color: 'white' },
            },
          }}
        />

        <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
  <Box sx={{ flex: 1 }}>
    <Typography sx={{ color: 'rgba(255,255,255,0.8)', mb: 1 }}>Pagamento ao Influenciador</Typography>
    <FormControl component="fieldset">
        <RadioGroup
            row
            value={paymentType}
            onChange={(e) => setPaymentType(e.target.value)}
        >
            <FormControlLabel value="Indefinido" control={<Radio sx={{color: 'rgba(255,255,255,0.7)', '&.Mui-checked': {color: '#BF28B0'}}} />} label="Indefinido (A combinar)" />
            <FormControlLabel value="Aberto" control={<Radio sx={{color: 'rgba(255,255,255,0.7)', '&.Mui-checked': {color: '#BF28B0'}}} />} label="Faixa de Valor" />
            <FormControlLabel value="Exato" control={<Radio sx={{color: 'rgba(255,255,255,0.7)', '&.Mui-checked': {color: '#BF28B0'}}} />} label="Valor Exato" />
        </RadioGroup>
    </FormControl>
    
    {/* Campo para VALOR EXATO */}
    {paymentType === 'Exato' && (
        <TextField
            fullWidth
            type="number"
            label="Valor Exato"
            variant="outlined"
            placeholder="Ex: 5000"
            value={paymentValueExact}
            onChange={(e) => setPaymentValueExact(e.target.value)}
            InputProps={{ 
                startAdornment: <InputAdornment position="start" sx={{color: 'white'}}>R$</InputAdornment>,
                sx: { borderRadius: '8px', mt:1, backgroundColor: 'rgba(255,255,255,0.1)', '& fieldset': { border: 'none' }, '& input': { color: 'white' } } 
            }}
        />
    )}

    {/* Campos para FAIXA DE VALOR */}
    {paymentType === 'Aberto' && (
        <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
            <TextField
                fullWidth
                type="number"
                label="Valor Mínimo"
                variant="outlined"
                placeholder="Ex: 1000"
                value={paymentValueMin}
                onChange={(e) => setPaymentValueMin(e.target.value)}
                InputProps={{ 
                    startAdornment: <InputAdornment position="start" sx={{color: 'white'}}>R$</InputAdornment>,
                    sx: { borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.1)', '& fieldset': { border: 'none' }, '& input': { color: 'white' } } 
                }}
            />
            <TextField
                fullWidth
                type="number"
                label="Valor Máximo"
                variant="outlined"
                placeholder="Ex: 3000"
                value={paymentValueMax}
                onChange={(e) => setPaymentValueMax(e.target.value)}
                InputProps={{ 
                    startAdornment: <InputAdornment position="start" sx={{color: 'white'}}>R$</InputAdornment>,
                    sx: { borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.1)', '& fieldset': { border: 'none' }, '& input': { color: 'white' } } 
                }}
            />
        </Box>
    )}
</Box>
    <Box sx={{ flex: 1 }}>
        <Typography sx={{ color: 'rgba(255,255,255,0.8)', mb: 1 }}>Data de Início</Typography>
        <TextField
            fullWidth
            type="date"
            variant="outlined"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            InputProps={{ sx: { borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.1)', '& fieldset': { border: 'none' }, '& input': { color: 'white' } } }}
        />
    </Box>
    <Box sx={{ flex: 1 }}>
        <Typography sx={{ color: 'rgba(255,255,255,0.8)', mb: 1 }}>Data de Término</Typography>
        <TextField
            fullWidth
            type="date"
            variant="outlined"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            InputProps={{ sx: { borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.1)', '& fieldset': { border: 'none' }, '& input': { color: 'white' } } }}
        />
    </Box>
</Box>

        <Box
          sx={{
            mt: 3,
            border: '2px dashed rgba(255,255,255,0.2)',
            borderRadius: '12px',
            p: 4,
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'border-color 0.3s ease',
            '&:hover': {
              borderColor: 'rgba(255,255,255,0.5)',
            },
            position: 'relative',
          }}
          onDrop={handleImageDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => document.getElementById('image-upload').click()}
        >
          {image ? (
            <Box
              component="img"
              src={image}
              alt="Pré-visualização da Imagem"
              sx={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '10px' }}
            />
          ) : (
            <Box>
              <CameraAltOutlined sx={{ fontSize: '4rem', color: 'rgba(255,255,255,0.5)' }} />
              <Typography color="rgba(255,255,255,0.5)" mt={1}>
                Insira a imagem da campanha
              </Typography>
            </Box>
          )}
          <input
            id="image-upload"
            type="file"
            accept="image/*"
            hidden
            onChange={handleImageChange}
          />
        </Box>
      </Box>

      {/* Detalhes de Segmentação */}
      <Box
        sx={{
          backgroundColor: 'rgba(255,255,255,0.05)',
          p: 3,
          borderRadius: '12px',
          mb: 4,
        }}
      >
        <Typography sx={{ color: 'rgba(255,255,255,0.8)', mb: 2 }}>Detalhes da Segmentação</Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="body2" sx={{ mb: 1 }}>Categorias de Influenciador</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {allCategories.map((category) => (
                <Chip
                  key={category}
                  label={category}
                  onClick={() => handleCategoryClick(category)}
                  deleteIcon={selectedCategories.includes(category) ? <DeleteForeverOutlined /> : null}
                  onDelete={selectedCategories.includes(category) ? () => handleCategoryClick(category) : null}
                  sx={{
                    backgroundColor: selectedCategories.includes(category) ? '#BF28B0' : 'rgba(255,255,255,0.1)', // Cor alterada
                    color: selectedCategories.includes(category) ? 'white' : 'white', // Cor do texto alterada
                    fontWeight: 'bold',
                    borderRadius: '8px',
                    '& .MuiChip-deleteIcon': {
                      color: selectedCategories.includes(category) ? 'white' : 'white', // Cor do ícone alterada
                      '&:hover': { color: 'rgba(255,255,255,0.7)' },
                    },
                  }}
                />
              ))}
            </Box>
          </Box>
          
          <Box sx={{ flex: 1 }}>
            <Typography variant="body2" sx={{ mb: 1 }}>Quantidade mínima de seguidores:</Typography>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Ex: 5K, 100K, 1M"
              value={minFollowers}
              onChange={(e) => setMinFollowers(e.target.value)}
              InputProps={{
                sx: {
                  borderRadius: '8px',
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  '& fieldset': { border: 'none' },
                  '& input': { color: 'white' },
                },
              }}
            />
          </Box>
          
          <Box sx={{ flex: 1 }}>
            <Typography variant="body2" sx={{ mb: 1 }}>Quantidade mínima de visualizações:</Typography>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Ex: 5K, 100K, 1M"
              value={minViews}
              onChange={(e) => setMinViews(e.target.value)}
              InputProps={{
                sx: {
                  borderRadius: '8px',
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  '& fieldset': { border: 'none' },
                  '& input': { color: 'white' },
                },
              }}
            />
          </Box>
          
          <Box sx={{ flex: 1 }}>
            <Typography variant="body2" sx={{ mb: 1 }}>Redes Sociais</Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {allSocials.map((social) => (
                <IconButton
                  key={social}
                  onClick={() => handleSocialClick(social)}
                  sx={{
                    color: selectedSocials.includes(social) ? 'white' : 'white', // Cor do ícone alterada
                    backgroundColor: selectedSocials.includes(social) ? '#BF28B0' : 'rgba(255,255,255,0.1)', // Cor alterada
                    '&:hover': {
                      backgroundColor: selectedSocials.includes(social) ? '#BF28B0' : 'rgba(255,255,255,0.2)', // Cor alterada
                    },
                  }}
                >
                  {getSocialIcon(social)}
                </IconButton>
              ))}
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Detalhes da Campanha */}
      <Box
        sx={{
          backgroundColor: 'rgba(255,255,255,0.05)',
          p: 3,
          borderRadius: '12px',
          mb: 4,
        }}
      >
        <Typography sx={{ color: 'rgba(255,255,255,0.8)', mb: 2 }}>Detalhes da Campanha</Typography>
        
        <Box sx={{ display: 'flex', mb: 1 }}>
          <IconButton sx={{ color: 'white' }}><FormatBold /></IconButton>
          <IconButton sx={{ color: 'white' }}><FormatItalic /></IconButton>
          <IconButton sx={{ color: 'white' }}><FormatUnderlined /></IconButton>
          <IconButton sx={{ color: 'white' }}><StrikethroughS /></IconButton>
        </Box>
        
        <TextField
          fullWidth
          multiline
          rows={6}
          variant="outlined"
          placeholder="Digite aqui a descrição"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          InputProps={{
            sx: {
              borderRadius: '8px',
              backgroundColor: 'rgba(255,255,255,0.1)',
              '& fieldset': { border: 'none' },
              '& textarea': { color: 'white' },
            },
          }}
        />
      </Box>

      {/* Botão de Cadastro */}
      <Box sx={{ textAlign: 'center' }}>
        <Button
          onClick={handleRegisterCampaign}
          sx={{
            mt: 2,
            borderRadius: "30px",
            transition: "all 0.2s ease-in-out",
            background: "#FFFFFF",
            boxShadow: "0px 0px 24.5px 4px rgba(255, 55, 235, 0.25)",
            color: "#BF28B0",
            fontWeight: "900",
            fontSize: "18px",
            px: 6,
            textTransform: "none",
            "&:hover": { borderRadius: "10px", background: "#ffffff46", color: "white", boxShadow: "none" },
          }}
        >
          Cadastrar Campanha
        </Button>
      </Box>
    </Box>
  );
};

export default CampaignsRegister;