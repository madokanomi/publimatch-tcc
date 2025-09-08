import { Box, Button, TextField, Typography, Avatar, Chip, Stack, IconButton, Icon } from "@mui/material";
import { Formik } from "formik";
import * as yup from "yup";
import useMediaQuery from "@mui/material/useMediaQuery";
import Header from "../../components/Header";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import InstagramIcon from "@mui/icons-material/Instagram";
import YouTubeIcon from "@mui/icons-material/YouTube";
import SportsEsportsIcon from "@mui/icons-material/SportsEsports";
import TiktokIcon from "@mui/icons-material/MusicNote"; // substitua por ícone customizado se quiser
import XIcon from '@mui/icons-material/X';
import { InputAdornment } from "@mui/material";
import { styled } from "@mui/material/styles";

const initialValues = {
  exibitionName: "",
  realName: "",
  age: "",
  description: "",
  aboutMe: "",
  categories: ["Comédia", "Reação"],
  social:{
    tiktok:"",
    instagram:"",
    youtube:"",
    twitch:"",
  },
};

const CustomTextField = styled(TextField)({
  "& .MuiFilledInput-root": {
    borderRadius: "15px",
    backgroundColor: "#f5f5f51f",
    transition:"all 0.3s ease",
   
    "&:hover": {
      backgroundColor: "#eaeaea",
    },
        "&:before, &:after": {
      display: "none",  // <---- remove a linha de baixo
    },
    "&.Mui-focused": {
      backgroundColor: "#fff",
      boxShadow: "0px 0px 1px 2px #db1db5ff",
      outlineOffset:"-10px",
      borderRadius:"5px",
       color:"#db1db5ff",
    },
    "&.Mui-error": {
       boxShadow: "0px 0px 1px 2px #ff0077ff",
    },
  },
  "& .MuiInputLabel-root": {
    color: "#d2d2d2ff",
    "&.Mui-focused": {
      color: "#BF28B0",
        fontWeight:"normal",
    },
  },
  "& .MuiFormHelperText-root": {
    fontSize: "0.8rem",
    color: "red",
  },
});

const Descricao = styled(TextField)({
  "& .MuiFilledInput-root": {
    borderRadius: "15px",
    backgroundColor: "#0000003e",
    transition:"all 0.3s ease",
   
    "&:hover": {
      backgroundColor: "#0000007a",
    },
        "&:before, &:after": {
      display: "none",  // <---- remove a linha de baixo
    },
    "&.Mui-focused": {
      backgroundColor: "#0000007c",
      boxShadow: "0px 0px 1px 2px #ffeafbff",
      outlineOffset:"-10px",
      borderRadius:"5px",
       color:"#ffffffff",
    },
    "&.Mui-error": {
       boxShadow: "0px 0px 1px 2px #ff0077ff",
    },
  },
  "& .MuiInputLabel-root": {
    color: "#d2d2d2ff",
    "&.Mui-focused": {
      color: "#ff82b4ff",
        fontWeight:"normal",
    },
  },
  "& .MuiFormHelperText-root": {
    fontSize: "0.8rem",
    color: "red",
  },
});

const userSchema = yup.object().shape({
    exibitionName:  yup.string().required("Campo Obrigatório"),
        realName: yup.string().required("Campo Obrigatório"),
        age: yup.number().required("Campo Obrigatório").positive().integer(),
        description: yup.string().required("Campo Obrigatório"),
        aboutMe: yup.string().required("Campo Obrigatório"),
    });

const Form = () => {
  const IsNonMobile = useMediaQuery("(min-width:600px)");

  const handleFormSubmit = (values) => {
    console.log(values);
  };

  return (
    <Box m="20px">
      <Header
        title="Cadastro de Influenciador"
        subtitle="Insira as informações do influenciador"
      />

      <Formik
        onSubmit={handleFormSubmit}
        initialValues={initialValues}
        validationSchema={userSchema}
      >
        {({ values, 
        errors, touched, 
        handleBlur, 
        handleChange, 
        handleSubmit}) =>
        (
            <form onSubmit={handleSubmit}>
                <Box display="grid" gap="20px"  
                gridTemplateColumns="repeat(4, minmax(0, 1fr))"
                    sx={{
                        "& > div": {gridColumn: IsNonMobile ? undefined: "span 4"}
                    }}>
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
                sx={{ gridColumn: "span 2",}}
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

              {/* Upload da imagem de fundo */}
              <Box
                gridColumn="span 3"
                display="flex"
                justifyContent="center"
                alignItems="center"
                flexDirection="column"
                 border="1px dashed #ffffff79"
                borderRadius="10px"
                p="20px"
                sx={{
                  backgroundColor:"#ffffff34",
                }}
              >
                <IconButton component="label">
                  <AddPhotoAlternateIcon fontSize="large" sx={{ width: 70, height: 70}} />
                  <input hidden accept="image/*" type="file" />
                </IconButton>
                <Typography variant="body2">Insira a imagem de fundo</Typography>
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
                       sx={{
                  backgroundColor:"#ffffff34",
                }}
              >
                <IconButton component="label">
                <Avatar sx={{ width: 70, height: 70, color:"white", backgroundColor:"#ffffff2c"}} />
                  <input hidden accept="image/*" type="file" />
                </IconButton>
                   <Typography variant="body2">Insira a foto de perfil</Typography>
              </Box>

              {/* Categorias */}
              <Box gridColumn="span 2">
                <Typography variant="subtitle1">Categorias</Typography>
                <Stack direction="row" spacing={1} mt={1}>
                  {values.categories.map((cat, index) => (
                    <Chip
                      key={index}
                      label={cat}
                      onDelete={() => console.log("remover", cat)}
                      color="#fffff"
                      variant="outlined"
                    />
                  ))}
                </Stack>
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
                    InputProps={{ startAdornment: <TiktokIcon sx={{marginTop:"9px",}} />,
                   }}
                  />
                  <CustomTextField
                    variant="filled"
                    label="Instagram"
                    name="social.instagram"
                    onChange={handleChange}
                    value={values.social.instagram}
                  InputProps={{ startAdornment: <InstagramIcon sx={{marginTop:"9px",}} />,
                 }}
                  />
                  <CustomTextField
                    variant="filled"
                    label="YouTube"
                    name="social.youtube"
                    onChange={handleChange}
                    value={values.social.youtube}
                    InputProps={{ startAdornment: <YouTubeIcon sx={{marginTop:"9px",}} /> }}
  
/>
                </Stack>
              </Box>

              {/* Breve descritivo */}
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
              <Button type="submit"  sx={{
                    mt: 2, 
                    borderRadius:"30px",
                     transition: "all 0.2s ease-in-out",
                    background: "#FFFFFF",
                    boxShadow: "0px 0px 24.5px 4px rgba(255, 55, 235, 0.25)",
                    color: "#BF28B0",
                    fontWeight: "900",
                    fontSize: "18px",
                    paddingLeft: "60px",
                    paddingRight: "60px",
                    textTransform: "none",

                    "&:hover" : {
                        borderRadius:"10px",
                        background: "#ffffff46",
                        color:"white",
                        boxShadow: "none",

                    }
                }}>
                Cadastrar Influenciador
              </Button>
                </Box>
            </form>
        )}

      </Formik>
    </Box>
  );
};

export default Form;
