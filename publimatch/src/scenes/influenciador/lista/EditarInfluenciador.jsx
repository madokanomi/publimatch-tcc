import React, { useState, useMemo, useEffect } from "react";
import { Box, Button, TextField, Typography, Avatar, Chip, Stack, IconButton, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from "@mui/material";
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

// importa os influencers existentes
import { influencers } from "../../../data/mockInfluencer";

const initialValues = {
  exibitionName: "",
  realName: "",
  age: "",
  description: "",
  aboutMe: "",
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
  aboutMe: yup.string().required("Campo Obrigatório"),
});

const EditarInfluenciador = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const influencerId = Number(id);

  const IsNonMobile = useMediaQuery("(min-width:600px)");

  // gera lista única de categorias a partir do mock
  const todasCategorias = useMemo(() => {
    const set = new Set();
    influencers.forEach((inf) =>
      (inf.categorias || inf.tags || []).forEach((cat) => set.add(cat))
    );
    return Array.from(set).sort();
  }, []);

  const [tagsSelecionadas, setTagsSelecionadas] = useState([]);
  const [searchTag, setSearchTag] = useState("");
  const [showAllTags, setShowAllTags] = useState(false);
  const [novaTag, setNovaTag] = useState("");
  const [erroCategorias, setErroCategorias] = useState("");
  const [imagemFundo, setImagemFundo] = useState(null);
  const [imagemPerfil, setImagemPerfil] = useState(null);
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [dialogStep, setDialogStep] = useState(1);
  const [influencerEmail, setInfluencerEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [formValues, setFormValues] = useState(null);

  // procura o influenciador pelo id no mock
  const influencer = useMemo(() => {
    return influencers.find((inf) => Number(inf.id) === influencerId);
  }, [influencerId]);

  // quando encontrar, pré-preenche estados (imagens e categorias)
  useEffect(() => {
    if (influencer) {
      setTagsSelecionadas(influencer.categorias || influencer.tags || []);
      setImagemPerfil(influencer.imagem || influencer.avatar || null);
      setImagemFundo(influencer.imagemFundo || null);
    }
  }, [influencer]);

  const handleCloseDialog = () => {
    setOpenConfirmDialog(false);
    setDialogStep(1);
    setInfluencerEmail("");
    setVerificationCode("");
  };

  const handleNextStep = () => setDialogStep((prev) => prev + 1);

  const handleFormikSubmit = (values) => {
    setFormValues(values); // guarda os valores
    setOpenConfirmDialog(true); // abre o diálogo
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

  // Atualiza o influenciador no mock (simulação)
  const handleUpdateInfluencer = (values) => {
    const idx = influencers.findIndex((inf) => Number(inf.id) === influencerId);
    if (idx > -1) {
      influencers[idx] = {
        ...influencers[idx],
        nome: values.exibitionName,
        nomeReal: values.realName,
        descricao: values.description,
        sobre: values.aboutMe,
        categorias: tagsSelecionadas,
        social: { ...(values.social || {}) },
        imagem: imagemPerfil || influencers[idx].imagem,
        imagemFundo: imagemFundo || influencers[idx].imagemFundo,
      };
      console.log("Influenciador atualizado:", influencers[idx]);
    } else {
      console.warn("Influenciador não encontrado para atualizar.");
    }
  };

  // monta valores iniciais para o form a partir do influenciador (ou usa fallback)
  const initialFormValues = useMemo(() => {
    if (!influencer) return initialValues;
    return {
      exibitionName: influencer.nome || influencer.exibitionName || "",
      realName: influencer.nomeReal || influencer.realName || "",
      age: influencer.idade || influencer.age || "",
      description: influencer.descricao || influencer.description || "",
      aboutMe: influencer.sobre || influencer.aboutMe || influencer.bio || "",
      categories: influencer.categorias || influencer.tags || [],
      social: {
        tiktok: influencer.social?.tiktok || influencer.tiktok || "",
        instagram: influencer.social?.instagram || influencer.instagram || "",
        youtube: influencer.social?.youtube || influencer.youtube || "",
        twitch: influencer.social?.twitch || influencer.twitch || "",
      },
    };
  }, [influencer]);

  if (!influencer) {
    // se não encontrou, mostra mensagem simples (mantendo a aparência)
    return (
      <Box m="20px">
        <Header title="Editar Influenciador" subtitle="Influenciador não encontrado" />
        <Box mt={4} display="flex" flexDirection="column" alignItems="center" gap={2}>
          <Typography color="white">Nenhum influenciador encontrado com o ID informado.</Typography>
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
        subtitle={`Editando: ${influencer.nome || influencer.exibitionName || "--"}`}
      />

      <Formik
        onSubmit={handleFormikSubmit}
        initialValues={initialFormValues}
        validationSchema={userSchema}
        enableReinitialize
      >
        {({ values, errors, touched, handleBlur, handleChange, handleSubmit }) => (
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
                  backgroundImage: imagemFundo ? `url(${imagemFundo})` : influencer.imagemFundo ? `url(${influencer.imagemFundo})` : "none",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  position: "relative",
                }}
              >
                {!imagemFundo && !influencer.imagemFundo && (
                  <Box textAlign="center">
                    <IconButton component="label">
                      <AddPhotoAlternateIcon fontSize="large" sx={{ width: 70, height: 70 }} />
                      <input
                        hidden
                        accept="image/*"
                        type="file"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) setImagemFundo(URL.createObjectURL(file));
                        }}
                      />
                    </IconButton>
                    <Typography variant="body2">Insira a imagem de fundo</Typography>
                  </Box>
                )}

                {(imagemFundo || influencer.imagemFundo) && (
                  <>
                    <IconButton
                      onClick={() => {
                        setImagemFundo(null);
                        // se existir imagem no mock, mantemos a original até alterar
                        if (influencer.imagemFundo) setImagemFundo(null);
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
                          if (file) setImagemFundo(URL.createObjectURL(file));
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
                    src={imagemPerfil || influencer.imagem || influencer.avatar || ""}
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
                      if (file) setImagemPerfil(URL.createObjectURL(file));
                    }}
                  />
                </IconButton>

                {!imagemPerfil && !influencer.imagem && (
                  <Typography variant="body2" mt={1}>Clique no avatar para adicionar a foto</Typography>
                )}

                { (imagemPerfil || influencer.imagem) && (
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

                { (imagemPerfil || influencer.imagem) && (
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
                        if (file) setImagemPerfil(URL.createObjectURL(file));
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
              <Descricao
                fullWidth
                variant="filled"
                label="Sobre mim"
                multiline
                rows={4}
                name="aboutMe"
                value={values.aboutMe}
                onChange={handleChange}
                error={!!touched.aboutMe && !!errors.aboutMe}
                helperText={touched.aboutMe && errors.aboutMe}
                sx={{ gridColumn: "span 4" }}
              />
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

      {/* Dialogo de confirmação - reaproveitado do cadastro */}
      <Dialog
        open={openConfirmDialog}
        onClose={handleCloseDialog}
        aria-labelledby="confirm-dialog-title"
        sx={{ "& .MuiPaper-root": { backgroundColor: "rgba(255, 255, 255, 0.81)", color: "#610069ff", backdropFilter:"blur(30px)", borderRadius:'20px', position: 'relative' } }}
      >
        <IconButton onClick={handleCloseDialog} sx={{ position: "absolute", top: 8, right: 8 }}>
          <CloseIcon />
        </IconButton>

        {dialogStep === 1 && (
          <>
            <DialogTitle id="confirm-dialog-title">{"Pergunta"}</DialogTitle>
            <DialogContent>
              <DialogContentText sx={{color:"#2a2a2aff"}}>
                O influenciador deseja utilizar a plataforma?
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDialogStep(4)} sx={{color:"#540069ff"}}>Não</Button>
              <Button onClick={handleNextStep} sx={{fontWeight:'bold'}} color="primary" autoFocus>
                Sim
              </Button>
            </DialogActions>
          </>
        )}

        {dialogStep === 2 && (
          <>
            <DialogTitle id="confirm-dialog-title">{"Email do influenciador"}</DialogTitle>
            <DialogContent>
              <TextField
                fullWidth
                label="Digite o email do influenciador"
                value={influencerEmail}
                onChange={(e) => setInfluencerEmail(e.target.value)}
                variant="outlined"
                InputProps={{ startAdornment: <EmailIcon sx={{ mr: 1, color: "#000" }} /> }}
                sx={{
                  mt: 1,
                  "& .MuiOutlinedInput-root": {
                    color: "#000000",
                    fontSize: "1rem",
                    "& fieldset": { borderColor: "#000000" },
                    "&:hover fieldset": { borderColor: "#000000" },
                    "&.Mui-focused fieldset": { borderColor: "#000000" },
                  },
                  "& .MuiInputLabel-root": { color: "#000000" },
                }}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog} sx={{ color: "#540069ff" }}>Cancelar</Button>
              <Button onClick={handleNextStep} disabled={!influencerEmail} sx={{ fontWeight: 'bold' }} color="primary">
                Enviar código
              </Button>
            </DialogActions>
          </>
        )}

        {dialogStep === 3 && (
          <>
            <DialogTitle id="confirm-dialog-title">{"Código de verificação"}</DialogTitle>
            <DialogContent>
              <TextField
                fullWidth
                label="Digite o código recebido no email"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                variant="outlined"
                InputProps={{ startAdornment: <SecurityIcon sx={{ mr: 1, color: "#000" }} /> }}
                sx={{
                  mt: 1,
                  "& .MuiOutlinedInput-root": {
                    color: "#000000",
                    fontSize: "1.2rem",
                    "& fieldset": { borderColor: "#000000" },
                    "&:hover fieldset": { borderColor: "#000000" },
                    "&.Mui-focused fieldset": { borderColor: "#000000" },
                  },
                  "& .MuiInputLabel-root": { color: "#000000" },
                }}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog} sx={{ color: "#540069ff" }}>Cancelar</Button>
              <Button
                onClick={() => {
                  if (formValues) handleUpdateInfluencer(formValues);
                  handleCloseDialog();
                  navigate(-1); // volta para a lista depois de salvar
                }}
                sx={{ fontWeight: 'bold' }}
                color="primary"
                autoFocus
              >
                Confirmar
              </Button>
            </DialogActions>
          </>
        )}

        {dialogStep === 4 && (
          <>
            <DialogTitle id="confirm-dialog-title">{"Confirmar Alterações"}</DialogTitle>
            <DialogContent>
              <DialogContentText sx={{ color: "#2a2a2aff" }}>
                Tem certeza que deseja salvar as alterações deste influenciador?
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog} sx={{ color: "#540069ff" }}>Cancelar</Button>
              <Button
                onClick={() => {
                  if (formValues) handleUpdateInfluencer(formValues);
                  handleCloseDialog();
                  navigate(-1);
                }}
                sx={{ fontWeight: 'bold' }}
                color="primary"
                autoFocus
              >
                Confirmar
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
    </Box>
  );
};

export default EditarInfluenciador;
