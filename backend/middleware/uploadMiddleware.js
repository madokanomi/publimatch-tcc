import multer from 'multer';
import path from 'path';

// Configura o Multer para processar os ficheiros em memória
const storage = multer.memoryStorage();

// Função para filtrar e aceitar apenas ficheiros de imagem
function checkFileType(file, cb) {
  const filetypes = /jpeg|jpg|png|gif|webp/; 
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Apenas imagens são permitidas!'));
  }
}

const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
  limits: { fileSize: 5 * 1024 * 1024 } // Limite de 5MB por imagem
});

export default upload;
