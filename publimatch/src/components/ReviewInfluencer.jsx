// src/components/ReviewInfluencer.jsx

import React, { useState } from 'react';
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
  Avatar, // 1. IMPORTAÇÃO DO AVATAR
} from '@mui/material';
import { StarRounded, ArrowBack, FormatBold, FormatItalic, FormatUnderlined, StrikethroughS } from '@mui/icons-material';

const tagOptions = ['Criativo', 'Agradável', 'Atencioso', 'Pontual', 'Profissional', 'Engajado'];

const ReviewInfluencer = ({ influencer, campaign, onClose, allInfluencers }) => {
  const [rating, setRating] = useState(4);
  const [tags, setTags] = useState(influencer.tags || []);
  
  const allAvailableTags = [...new Set(allInfluencers.flatMap(inf => inf.tags))];

  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [openSuccessDialog, setOpenSuccessDialog] = useState(false);

  const handleOpenConfirm = () => setOpenConfirmDialog(true);
  const handleCloseConfirm = () => setOpenConfirmDialog(false);

  const handleConfirmSubmit = () => {
    handleCloseConfirm();
    setOpenSuccessDialog(true);
  };

  const handleCloseSuccess = () => {
    setOpenSuccessDialog(false);
    onClose();
  };

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
        backgroundColor: "rgba(20, 1, 19, 0.6)",
        p: 3,
        borderRadius: "12px",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        height: '100%',
        color: 'white',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        "&::-webkit-scrollbar": { width: "8px" },
        "&::-webkit-scrollbar-track": { background: "rgba(0, 0, 0, 0.2)", borderRadius: "10px" },
        "&::-webkit-scrollbar-thumb": { backgroundColor: "rgba(255, 255, 255, 0.3)", borderRadius: "10px", border: "2px solid transparent", backgroundClip: "content-box" },
        "&::-webkit-scrollbar-thumb:hover": { backgroundColor: "rgba(255, 255, 255, 0.5)" }
      }}
    >
      {/* Cabeçalho */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={onClose} sx={{ color: 'white', mr: 1 }}>
          <ArrowBack />
        </IconButton>
        <StarRounded sx={{ mr: 1.5, fontSize: '2rem' }} />
        <Typography variant="h5" fontWeight="bold">Avaliação</Typography>
      </Box>

      {/* Conteúdo Principal */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 2fr' }, gap: 4, flex: 1 }}>
        {/* Coluna da Esquerda */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center', textAlign: 'center' }}>
          <Typography variant="h5">Avalie o influenciador</Typography>
          <Typography fontWeight="bold" variant="h6">{influencer.nome}</Typography>
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
            options={allAvailableTags}
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
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    borderRadius: '8px',
                    '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.2)' },
                    '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.5)' },
                    '&.Mui-focused fieldset': { borderColor: 'white' },
                  },
                  '& .MuiInputBase-input': { color: 'white' },
                }}
              />
            )}
          />
        </Box>

        {/* Coluna da Direita */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography>Título da Avaliação</Typography>
            <TextField
              fullWidth
              variant="outlined"
              defaultValue={`Avaliação sobre ${influencer.nome}`}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    {/* 2. ALTERAÇÃO DO ÍCONE PELA LOGO */}
                    <Chip
                      avatar={
                        <Avatar 
                          alt={campaign.name} 
                          src={campaign.logo} 
                        />
                      }
                      label={campaign.name}
                      sx={{ backgroundColor: 'rgba(255,255,255,0.1)', color: 'white', '.MuiAvatar-root': { width: 24, height: 24} }}
                    />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    borderRadius: '8px',
                  '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.2)' },
                  '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.5)' },
                },
                '& .MuiInputBase-input': { color: 'white' },
              }}
            />

            <Box sx={{ p:1, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '8px 8px 0 0', border: '1px solid rgba(255,255,255,0.2)', borderBottom: 'none' }}>
                <IconButton size="small" sx={{color: 'white'}}><FormatBold /></IconButton>
                <IconButton size="small" sx={{color: 'white'}}><FormatItalic /></IconButton>
                <IconButton size="small" sx={{color: 'white'}}><FormatUnderlined /></IconButton>
                <IconButton size="small" sx={{color: 'white'}}><StrikethroughS /></IconButton>
            </Box>
            <TextField
                fullWidth
                multiline
                rows={8}
                placeholder="Digite aqui a descrição"
                variant="outlined"
                sx={{
                    '& .MuiOutlinedInput-root': {
                        backgroundColor: 'rgba(255,255,255,0.05)',
                        borderRadius: '0 0 8px 8px',
                        '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.2)', borderTop: 'none' },
                        '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.5)' },
                    },
                    '& .MuiInputBase-input': { color: 'white' },
                }}
            />
        </Box>
      </Box>

      {/* Botão de Envio e Pop-ups */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <Button
          onClick={handleOpenConfirm}
          variant="contained"
          startIcon={<StarRounded />}
          sx={{
            backgroundColor: 'white', color: '#8A2BE2', fontWeight: 'bold',
            borderRadius: '12px', px: 4, py: 1.5, textTransform: 'none',
            fontSize: '1rem', '&:hover': { backgroundColor: '#f0f0f0' }
          }}
        >
          Enviar Avaliação
        </Button>
      </Box>

      <Dialog open={openConfirmDialog} onClose={handleCloseConfirm} sx={dialogSx}>
        <DialogTitle>{"Confirmar Avaliação"}</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{color:"#4f4f4fff"}}>
            Tem certeza de que deseja enviar esta avaliação?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirm} sx={{color:"#540069ff"}}>
            Cancelar
          </Button>
          <Button onClick={handleConfirmSubmit} sx={{fontWeight:'bold', color: 'rgb(205, 0, 100)'}} autoFocus>
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openSuccessDialog} onClose={handleCloseSuccess} sx={dialogSx}>
        <DialogTitle>{"Avaliação Realizada!"}</DialogTitle>
        <DialogActions>
          <Button onClick={handleCloseSuccess} sx={{fontWeight:'bold', color: '#540069ff'}} autoFocus>
            Certo
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ReviewInfluencer;