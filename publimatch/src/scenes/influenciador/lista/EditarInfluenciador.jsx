import React, { useState, useMemo, useEffect } from "react";
import { Box, CircularProgress, Button, TextField, Typography, Avatar, Chip, Stack, IconButton, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from "@mui/material";
import { Formik } from "formik";
import * as yup from "yup";
import useMediaQuery from "@mui/material/useMediaQuery";
import Header from "../../../components/Header";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import InstagramIcon from "@mui/icons-material/Instagram";
import YouTubeIcon from "@mui/icons-material/YouTube";
import TiktokIcon from "@mui/icons-material/MusicNote";
import { SiTwitch } from "react-icons/si";
import { styled } from "@mui/material/styles";
import { AiFillCloseCircle, AiFillEdit } from "react-icons/ai";
import CloseIcon from "@mui/icons-material/Close";
import EmailIcon from '@mui/icons-material/Email';
import SecurityIcon from '@mui/icons-material/Security';
import { useNavigate, useParams } from 'react-router-dom';
import MenuIcon from "@mui/icons-material/Menu";
import ArrowBack from "@mui/icons-material/ArrowBack";
import axios from 'axios';
import TiptapEditor from "../../../components/TipTapEditor";

// importa os influencers existentes
import { influencers } from "../../../data/mockInfluencer";

const glassDialogStyle = {
  sx: {
    borderRadius: "15px",
    backgroundColor: 'rgba(255, 255, 255, 0.75)', // Branco com 75% de opacidade
    backdropFilter: "blur(10px)",
    boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.15)',
    border: "1px solid rgba(255, 255, 255, 0.18)",
    width: '100%',
    maxWidth: '500px'
  }
};

const initialValues = {
  exibitionName: "",
  realName: "",
  age: "",
  description: "",
 aboutMe: null,
  categories: [],
  social: {
    tiktok: "",
    instagram: "",
    youtube: "",
    twitch: "",
  },
};

// estilização dos campos (copiado do cadastro para manter aparência idêntica)
const CustomTextField = styled(TextField)({
  "& .MuiFilledInput-root": {
    borderRadius: "15px",
    backgroundColor: "#f5f5f51f",
    transition: "all 0.3s ease",
    "&:hover": {
      backgroundColor: "#eaeaea",
    },
    "&:before, &:after": { display: "none" },
    "&.Mui-focused": {
      backgroundColor: "#fff",
      boxShadow: "0px 0px 1px 2px #db1db5ff",
      borderRadius: "5px",
      color: "#db1db5ff",
    },
    "&.Mui-error": {
      boxShadow: "0px 0px 1px 2px #ff0077ff",
    },
  },
  "& .MuiInputLabel-root": {
    color: "#d2d2d2ff",
    "&.Mui-focused": { color: "#BF28B0", fontWeight: "normal" },
  },
});

const Descricao = styled(TextField)({
  "& .MuiFilledInput-root": {
    borderRadius: "15px",
    backgroundColor: "#0000003e",
    transition: "all 0.3s ease",
    "&:hover": { backgroundColor: "#0000007a" },
    "&:before, &:after": { display: "none" },
    "&.Mui-focused": {
      backgroundColor: "#0000007c",
      boxShadow: "0px 0px 1px 2px #ffeafbff",
      borderRadius: "5px",
      color: "#fff",
    },
    "&.Mui-error": { boxShadow: "0px 0px 1px 2px #ff0077ff" },
  },
  "& .MuiInputLabel-root": {
    color: "#d2d2d2ff",
    "&.Mui-focused": { color: "#ff82b4ff", fontWeight: "normal" },
  },
});

const userSchema = yup.object().shape({
  exibitionName: yup.string().required("Campo Obrigatório"),
  realName: yup.string().required("Campo Obrigatório"),
  age: yup.number().required("Campo Obrigatório").positive().integer(),
  description: yup.string().required("Campo Obrigatório"),
  aboutMe: yup.mixed()
    .required("Campo Obrigatório")
    .test(
      "is-not-empty",
      "O campo 'Sobre mim' é obrigatório.",
      (value) => value && value.content && !(value.content.length === 1 && !value.content[0].content)
    ),
});

const EditarInfluenciador = () => {
   const { id } = useParams(); // Pega o ID da URL
  const navigate = useNavigate();
  const IsNonMobile = useMediaQuery("(min-width:600px)");

  // Estado para os dados do formulário, inicializado com valores vazios
  const [formData, setFormData] = useState(initialValues);

  // Estados para controle da UI
  const [tagsSelecionadas, setTagsSelecionadas] = useState([]);
  const [searchTag, setSearchTag] = useState("");
  const [showAllTags, setShowAllTags] = useState(false);
  const [novaTag, setNovaTag] = useState("");
  const [erroCategorias, setErroCategorias] = useState("");
 const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [formValuesToSubmit, setFormValuesToSubmit] = useState(null);

  // Estados para as imagens
  const [imagemFundo, setImagemFundo] = useState(null); // Preview URL
  const [imagemPerfil, setImagemPerfil] = useState(null); // Preview URL
  const [arquivoImagemFundo, setArquivoImagemFundo] = useState(null); // Arquivo para upload
  const [arquivoImagemPerfil, setArquivoImagemPerfil] = useState(null); // Arquivo para upload

  // Estados de controle de loading e diálogos
  const [isLoading, setIsLoading] = useState(true); // Começa true para carregar os dados
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  // Busca e combina todas as categorias disponíveis
  const todasCategorias = useMemo(() => {
    const set = new Set();
    influencers.forEach((inf) =>
      inf.categorias.forEach((cat) => set.add(cat))
    );
    return Array.from(set).sort();
  }, []);
  // procura o influenciador pelo id no mock


  useEffect(() => {
    const fetchInfluencerData = async () => {
      setIsLoading(true);
   try {
              const userInfo = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user'));
                const token = userInfo ? userInfo.token : null;
                if (!token) throw new Error('Usuário não autenticado.');

                const { data } = await axios.get(`http://localhost:5001/api/influencers/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                // ✅ 4. TRATAR O CAMPO 'aboutMe' VINDO DA API
                let aboutMeContent = null;
                if (data.aboutMe) {
                    try {
                        // Tenta converter o texto (JSON string) para um objeto
                        aboutMeContent = JSON.parse(data.aboutMe);
                    } catch (e) {
                        // Se falhar (for texto puro antigo), cria um objeto Tiptap a partir do texto
                        aboutMeContent = {
                            type: 'doc',
                            content: [{ type: 'paragraph', content: [{ type: 'text', text: data.aboutMe }] }],
                        };
                    }
                }

        setFormData({
          exibitionName: data.name || "",
          realName: data.realName || "",
          age: data.age || "",
          description: data.description || "",
       aboutMe: aboutMeContent,
          social: data.social || initialValues.social,
        categories: data.niches || [],
        });
   setTagsSelecionadas(data.niches || []);
        setImagemPerfil(data.profileImageUrl || null);
        setImagemFundo(data.backgroundImageUrl || null);
      } catch (error) {
        setErrorMessage("Falha ao carregar dados do influenciador. Tente novamente.");
        setShowErrorDialog(true);
      } finally {
        setIsLoading(false);
      }
    };
    fetchInfluencerData();
  }, [id]);

 const handleFormSubmit = (values) => {
    // A validação de categorias continua aqui
    if (tagsSelecionadas.length === 0) {
      setErroCategorias("Selecione ao menos uma categoria.");
      return;
    }
    setErroCategorias("");

    // Armazena os valores do formulário e abre o diálogo de confirmação
    setFormValuesToSubmit(values);
    setIsConfirmDialogOpen(true);
  };

  // ✅ 3. CRIE A FUNÇÃO 'executeSubmit' PARA FAZER A CHAMADA À API
  const executeSubmit = async () => {
    if (!formValuesToSubmit) return; // Checagem de segurança

    // Fecha o diálogo de confirmação
    setIsConfirmDialogOpen(false);
    setIsSubmitting(true);

    const dataToSubmit = new FormData();
    dataToSubmit.append('exibitionName', formValuesToSubmit.exibitionName);
    dataToSubmit.append('realName', formValuesToSubmit.realName);
    dataToSubmit.append('age', formValuesToSubmit.age);
    dataToSubmit.append('description', formValuesToSubmit.description);
    dataToSubmit.append('aboutMe', JSON.stringify(formValuesToSubmit.aboutMe));
    dataToSubmit.append('niches', tagsSelecionadas.join(','));
    dataToSubmit.append('social', JSON.stringify(formValuesToSubmit.social));

    if (arquivoImagemPerfil) dataToSubmit.append('profileImage', arquivoImagemPerfil);
    if (arquivoImagemFundo) dataToSubmit.append('backgroundImage', arquivoImagemFundo);

    try {
   const userInfo = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user'));
      const token = userInfo ? userInfo.token : null;
      if (!token) throw new Error('Autenticação expirada.');
      
      await axios.put(`http://localhost:5001/api/influencers/${id}`, dataToSubmit, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Mostra o diálogo de sucesso ao invés de navegar diretamente
      setShowSuccessDialog(true);
    } catch (error) {
      const message = error.response?.data?.message || "Ocorreu um erro inesperado.";
      setErrorMessage(message);
      setShowErrorDialog(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddCategoria = () => {
    if (novaTag.trim() && !todasCategorias.includes(novaTag)) {
      if (tagsSelecionadas.length >= 2) {
        setErroCategorias("Você só pode selecionar até 2 categorias.");
        return;
      }
      // atualiza o array local de categorias (não altera o mock original de todasCategorias diretamente)
      setTagsSelecionadas((prev) => [...prev, novaTag]);
      setNovaTag("");
      setErroCategorias("");
    }
  };

    // se não encontrou, mostra mensagem simples (mantendo a aparência)
if (isLoading) {
  return (
     <Box 
      display="flex" 
      justifyContent="center" 
      alignItems="center" 
      sx={{ height: 'calc(100vh - 120px)' }} // Ocupa a altura útil da tela
    >
      <CircularProgress color="primary" />
    </Box>
  );
}

if (showErrorDialog) {
  return (
    <Box m="20px">
      <Header title="Editar Influenciador" subtitle="Influenciador não encontrado" />
      <Box mt={4} display="flex" flexDirection="column" alignItems="center" gap={2}>
        <Typography color="white">{errorMessage}</Typography>
        <Button variant="contained" onClick={() => navigate(-1)} sx={{ textTransform: "none" }}>
          Voltar
        </Button>
      </Box>
    </Box>
  );
}

  return (
     <Box 
    height="calc(100vh - 120px)"  // ajusta para altura da tela menos header/topbar
    overflow="auto"               // ativa o scroll vertical
    transition="all 0.3s ease-in-out"                // evita que a barra sobreponha conteúdo
 sx={{
  transition:"all 0.3s ease-in-out",
    willChange: "width",
    /* Custom scrollbar */
    "&::-webkit-scrollbar": {
      width: "10px",
      marginRight:"10px",               // largura da scrollbar
    },
    "&::-webkit-scrollbar-track": {
      background: "rgba(255, 255, 255, 0.1)", // cor do fundo da scrollbar
      borderRadius: "10px",
    },
    "&::-webkit-scrollbar-thumb": {
      background: "rgba(255, 255, 255, 0.3)", // cor da parte que você arrasta
      borderRadius: "10px",
    },
    "&::-webkit-scrollbar-thumb:hover": {
      background: "rgba(255, 255, 255, 0.6)", // muda a cor ao passar o mouse
    },
     '.tiptap-wrapper .ProseMirror': {
                    backgroundColor: "#0000003e",
                    padding: "16.5px 14px",
                    color: "white",
                    minHeight: '120px',
                    transition: "background-color 0.3s ease",
                    '&:hover': { backgroundColor: "#0000007a" },
                    '& p.is-editor-empty:first-child::before': {
                        content: 'attr(data-placeholder)',
                        float: 'left',
                        color: '#d2d2d2ff',
                        pointerEvents: 'none',
                        height: 0,
                    },
                },
                '.tiptap-wrapper.is-focused': {
                    backgroundColor: "#0000007c",
                    boxShadow: "0px 0px 1px 2px #ffeafbff",
                },
                 '.tiptap-wrapper .tiptap-toolbar': {
                    backgroundColor: 'transparent',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
                },

  }}
>
    <Box m="20px">
      {/* Botão de voltar */}
      <Button
        startIcon={<MenuIcon sx={{ mr: 1 }} />}
        onClick={() => navigate(-1)}
        sx={{
          backgroundColor: "rgba(22, 0, 61, 0.38)",
          color: "white",
          px: 2,
          py: 1,
          borderRadius: "20px",
          backdropFilter: "blur(10px)",
          textTransform: "none",
          fontSize: "15px",
          fontWeight: "500",
          mb: 4, // espaço abaixo
          "&:hover": {
            backgroundColor: "rgba(0, 0, 0, 0.23)",
          },
        }}
      >
        <ArrowBack sx={{ width: "10%", mr: 1 }} />
        <Typography
          variant="overline"
          fontWeight={700}
          sx={{ letterSpacing: 1.4, opacity: 0.8 }}
        >
          Voltar
        </Typography>
      </Button>
      <Header
        title="Editar Influenciador"
        subtitle={`Editando: ${formData.nome || formData.exibitionName || "--"}`}
      />

      <Formik
     onSubmit={handleFormSubmit}
  initialValues={formData}
  validationSchema={userSchema}
  enableReinitialize
      >
        {({ values, errors, touched, handleBlur, handleChange, handleSubmit, setFieldValue }) => (
          <form onSubmit={handleSubmit}>
            <Box
              display="grid"
              gap="20px"
              gridTemplateColumns="repeat(4, minmax(0, 1fr))"
              sx={{
                "& > div": { gridColumn: IsNonMobile ? undefined : "span 4" },
              }}
            >
              {/* Nome de Exibição */}
              <CustomTextField
                fullWidth
                variant="filled"
                type="text"
                label="Nome de Exibição"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.exibitionName}
                name="exibitionName"
                error={!!touched.exibitionName && !!errors.exibitionName}
                helperText={touched.exibitionName && errors.exibitionName}
                sx={{ gridColumn: "span 2" }}
              />

              {/* Nome Real */}
              <CustomTextField
                fullWidth
                variant="filled"
                type="text"
                label="Nome Real"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.realName}
                name="realName"
                error={!!touched.realName && !!errors.realName}
                helperText={touched.realName && errors.realName}
                sx={{ gridColumn: "span 1" }}
              />

              {/* Idade */}
              <CustomTextField
                fullWidth
                variant="filled"
                type="number"
                label="Idade"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.age}
                name="age"
                error={!!touched.age && !!errors.age}
                helperText={touched.age && errors.age}
                sx={{ gridColumn: "span 1" }}
              />

              {/* Upload imagem de fundo */}
              <Box
                gridColumn="span 3"
                border="1px dashed #ffffff79"
                borderRadius="10px"
                sx={{
                  width: "100%",
                  height: 200,
                  backgroundColor: "#ffffff34",
                  backgroundImage: imagemFundo ? `url(${imagemFundo})` : formData.imagemFundo ? `url(${formData.imagemFundo})` : "none",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  position: "relative",
                }}
              >
                {!imagemFundo && !formData.imagemFundo && (
                  <Box textAlign="center">
                    <IconButton component="label">
                      <AddPhotoAlternateIcon fontSize="large" sx={{ width: 70, height: 70 }} />
                    <input
  hidden
  accept="image/*"
  type="file"
  onChange={(e) => {
    const file = e.target.files[0];
    if (file) {
      setImagemFundo(URL.createObjectURL(file)); // Atualiza o preview visual
      setArquivoImagemFundo(file); // ✅ CORREÇÃO: Armazena o arquivo para envio
    }
  }}
/>
                    </IconButton>
                    <Typography variant="body2">Insira a imagem de fundo</Typography>
                  </Box>
                )}

                {(imagemFundo || formData.imagemFundo) && (
                  <>
                    <IconButton
                      onClick={() => {
                        setImagemFundo(null);
                        // se existir imagem no mock, mantemos a original até alterar
                        if (formData.imagemFundo) setImagemFundo(null);
                      }}
                      sx={{
                        position: "absolute",
                        top: 5,
                        right: 5,
                        color: "white",
                        "&:hover": { backgroundColor: "rgba(0,0,0,0.7)" },
                      }}
                    >
                      <AiFillCloseCircle size={24} />
                    </IconButton>

                    <IconButton
                      component="label"
                      sx={{
                        position: "absolute",
                        top: 5,
                        right: 40,
                        color: "white",
                        "&:hover": { backgroundColor: "rgba(0,0,0,0.7)" },
                      }}
                    >
                      <AiFillEdit size={24} />
                   <input
  hidden
  accept="image/*"
  type="file"
  onChange={(e) => {
    const file = e.target.files[0];
    if (file) {
      setImagemFundo(URL.createObjectURL(file)); // Atualiza o preview visual
      setArquivoImagemFundo(file); // ✅ CORREÇÃO: Armazena o arquivo para envio
    }
  }}
/>
                    </IconButton>
                  </>
                )}
              </Box>

              {/* Foto de perfil */}
              <Box
                gridColumn="span 1"
                display="flex"
                justifyContent="center"
                alignItems="center"
                flexDirection="column"
                border="1px dashed #ffffff79"
                borderRadius="10px"
                p="20px"
                sx={{ backgroundColor: "#ffffff34", position: "relative" }}
              >
                <IconButton component="label" sx={{ p: 0 }}>
                  <Avatar
                    src={imagemPerfil || formData.imagem || formData.avatar || ""}
                    sx={{
                      width: 120,
                      height: 120,
                      color: "white",
                      backgroundColor: imagemPerfil ? "transparent" : "#ffffff2c",
                      cursor: "pointer",
                    }}
                  />
                <input
  hidden
  accept="image/*"
  type="file"
  onChange={(e) => {
    const file = e.target.files[0];
    if (file) {
      setImagemPerfil(URL.createObjectURL(file)); // Atualiza o preview visual
      setArquivoImagemPerfil(file); // ✅ CORREÇÃO: Armazena o arquivo para envio
    }
  }}
/>
                </IconButton>

                {!imagemPerfil && !formData.imagem && (
                  <Typography variant="body2" mt={1}>Clique no avatar para adicionar a foto</Typography>
                )}

                { (imagemPerfil || formData.imagem) && (
                  <IconButton
                    onClick={() => setImagemPerfil(null)}
                    sx={{
                      position: "absolute",
                      top: 5,
                      right: 5,
                      color: "white",
                      "&:hover": { backgroundColor: "rgba(0,0,0,0.7)" },
                    }}
                  >
                    <AiFillCloseCircle size={24} />
                  </IconButton>
                )}

                { (imagemPerfil || formData.imagem) && (
                  <IconButton
                    component="label"
                    sx={{
                      position: "absolute",
                      top: 5,
                      right: 40,
                      color: "white",
                      "&:hover": { backgroundColor: "rgba(0,0,0,0.7)" },
                    }}
                  >
                    <AiFillEdit size={24} />
                 <input
  hidden
  accept="image/*"
  type="file"
  onChange={(e) => {
    const file = e.target.files[0];
    if (file) {
      setImagemPerfil(URL.createObjectURL(file)); // Atualiza o preview visual
      setArquivoImagemPerfil(file); // ✅ CORREÇÃO: Armazena o arquivo para envio
    }
  }}
/>
                  </IconButton>
                )}
              </Box>

              {/* Categorias */}
              <Box gridColumn="span 2">
                <Typography variant="body2" fontWeight="500" mb={1}>
                  Categorias
                </Typography>

                <TextField
                  fullWidth
                  size="small"
                  placeholder="Buscar categoria..."
                  value={searchTag}
                  onChange={(e) => setSearchTag(e.target.value)}
                  sx={{
                    mb: 1,
                    bgcolor: "rgba(255,255,255,0.1)",
                    borderRadius: "10px",
                    "& .MuiOutlinedInput-input": { color: "white", fontSize: "0.85rem" },
                    "& fieldset": { border: "none" },
                  }}
                />

                <Box display="flex" flexWrap="wrap" gap={1} mb={1}>
                  {(showAllTags ? todasCategorias : todasCategorias.slice(0, 5))
                    .filter((tag) => tag.toLowerCase().includes(searchTag.toLowerCase()))
                    .map((tag, idx) => (
                      <Chip
                        key={idx}
                        label={tag}
                        size="medium"
                        onClick={() => {
                          if (tagsSelecionadas.includes(tag)) {
                            setTagsSelecionadas((prev) => prev.filter((t) => t !== tag));
                            setErroCategorias("");
                          } else {
                            if (tagsSelecionadas.length >= 2) {
                              setErroCategorias("Você só pode selecionar até 2 categorias.");
                              return;
                            }
                            setTagsSelecionadas((prev) => [...prev, tag]);
                            setErroCategorias("");
                          }
                        }}
                        sx={{
                          bgcolor: tagsSelecionadas.includes(tag) ? "#ff00d4" : "rgba(255, 255, 255, 0.1)",
                          color: "white",
                          borderRadius: "10px",
                          cursor: "pointer",
                          "&:hover": { bgcolor: "rgba(125, 0, 149, 0.2)" },
                        }}
                      />
                    ))}
                </Box>

                {todasCategorias.length > 5 && (
                  <Button
                    onClick={() => setShowAllTags(!showAllTags)}
                    size="small"
                    variant="contained"
                    fullWidth
                    sx={{
                      mb: 2,
                      color: "white",
                      textTransform: "none",
                      backgroundColor: "rgba(255, 255, 255, 0.23)",
                      borderRadius: "10px",
                      fontSize: "0.8rem",
                      "&:hover": { bgcolor: "rgba(255, 255, 255, 0.28)" },
                    }}
                  >
                    {showAllTags ? "Ver menos" : "Ver mais"}
                  </Button>
                )}

                <Box display="flex" gap={1}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Adicionar nova categoria..."
                    value={novaTag}
                    onChange={(e) => setNovaTag(e.target.value)}
                    sx={{
                      bgcolor: "rgba(0, 0, 0, 0.21)",
                      borderRadius: "10px",
                      "& .MuiOutlinedInput-input": { color: "white", fontSize: "0.85rem" },
                      "& fieldset": { border: "none" },
                    }}
                  />
                  <Button
                    variant="contained"
                    onClick={handleAddCategoria}
                    sx={{
                      color: "#ffffffff",
                      textTransform: "none",
                      backgroundColor: "#0000006f",
                      borderRadius: "10px",
                      fontSize: "0.8rem",
                      "&:hover": { bgcolor: "#00000080" },
                    }}
                  >
                    Adicionar
                  </Button>
                </Box>
                {erroCategorias && (
                  <Typography variant="caption" sx={{ color: "#ff4d6d", display: "block", mt: 1, fontWeight: "bold" }}>
                    {erroCategorias}
                  </Typography>
                )}
              </Box>

              {/* Redes sociais */}
              <Box gridColumn="span 2">
                <Typography variant="subtitle1">Redes Sociais</Typography>
                <Stack spacing={1} mt={1}>
                  <CustomTextField
                    variant="filled"
                    label="TikTok"
                    name="social.tiktok"
                    onChange={handleChange}
                    value={values.social.tiktok}
                    InputProps={{ startAdornment: <TiktokIcon sx={{ marginTop: "9px" }} /> }}
                  />
                  <CustomTextField
                    variant="filled"
                    label="Instagram"
                    name="social.instagram"
                    onChange={handleChange}
                    value={values.social.instagram}
                    InputProps={{ startAdornment: <InstagramIcon sx={{ marginTop: "9px" }} /> }}
                  />
                  <CustomTextField
                    variant="filled"
                    label="YouTube"
                    name="social.youtube"
                    onChange={handleChange}
                    value={values.social.youtube}
                    InputProps={{ startAdornment: <YouTubeIcon sx={{ marginTop: "9px" }} /> }}
                  />
                  <CustomTextField
                    variant="filled"
                    label="Twitch"
                    name="social.twitch"
                    onChange={handleChange}
                    value={values.social.twitch}
                    InputProps={{ startAdornment: <SiTwitch size={20} style={{ marginRight: 8 }} /> }}
                  />
                </Stack>
              </Box>

              {/* Descrição */}
              <Descricao
                fullWidth
                variant="filled"
                label="Breve descritivo"
                multiline
                rows={2}
                name="description"
                value={values.description}
                onChange={handleChange}
                error={!!touched.description && !!errors.description}
                helperText={touched.description && errors.description}
                sx={{ gridColumn: "span 4" }}
              />

              {/* Sobre mim */}
                                             <Box gridColumn="span 4">
                                    <Typography variant="body1" sx={{ color: '#d2d2d2ff', mb: 1, ml: 0.5 }}>
                                        Sobre mim
                                    </Typography>
                                    <Box
                                        className="tiptap-wrapper"
                                        sx={{
                                            borderRadius: "15px",
                                            overflow: 'hidden',
                                            border: !!touched.aboutMe && !!errors.aboutMe ? '1px solid #ff0077ff' : 'none',
                                            boxShadow: !!touched.aboutMe && !!errors.aboutMe ? '0px 0px 1px 2px #ff0077ff' : 'none',
                                            transition: 'all 0.3s ease',
                                        }}
                                    >
                                        <TiptapEditor
                                            content={values.aboutMe} // Passa o conteúdo inicial
                                            onContentChange={(jsonContent) => {
                                                setFieldValue('aboutMe', jsonContent);
                                            }}
                                            placeholder="Fale um pouco sobre você, sua carreira..."
                                        />
                                    </Box>
                                    {touched.aboutMe && errors.aboutMe && (
                                        <Typography sx={{ ml: 2, mt: 1 }} variant="caption" color="error">
                                            {errors.aboutMe}
                                        </Typography>
                                    )}
                                </Box>
                            </Box>

     

            <Box display="flex" justifyContent="center" mt="20px">
              <Button
                type="submit"
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
                  "&:hover": {
                    borderRadius: "10px",
                    background: "#ffffff46",
                    color: "white",
                    boxShadow: "none",
                  },
                }}
              >
                Salvar Alterações
              </Button>
            </Box>
          </form>
        )}
      </Formik>
<Dialog
        open={isConfirmDialogOpen}
        onClose={() => setIsConfirmDialogOpen(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        PaperProps={glassDialogStyle} // ✅ ESTILO APLICADO AQUI
      >
        <DialogTitle id="alert-dialog-title" sx={{ color: '#1a1a1a', fontWeight: 'bold' }}>
          Confirmar Alterações
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description" sx={{ color: '#555555' }}>
            Você tem certeza que deseja salvar as alterações neste perfil?
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: '16px 24px' }}>
          <Button onClick={() => setIsConfirmDialogOpen(false)} color="primary">
            Cancelar
          </Button>
          <Button onClick={executeSubmit} autoFocus variant="contained" color="primary">
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>

      {/* --- DIÁLOGO DE SUCESSO ESTILIZADO --- */}
      <Dialog
        open={showSuccessDialog}
        onClose={() => navigate(-1)}
        PaperProps={glassDialogStyle} // ✅ ESTILO APLICADO AQUI
      >
        <DialogTitle sx={{ color: '#1a1a1a', fontWeight: 'bold' }}>
            Sucesso!
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: '#555555' }}>
            As informações do influenciador foram atualizadas com sucesso.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: '16px 24px' }}>
          <Button onClick={() => navigate(-1)} autoFocus variant="contained" color="success">
            OK
          </Button>
        </DialogActions>
      </Dialog>
   
    </Box>
    </Box>
  );
};

export default EditarInfluenciador;
