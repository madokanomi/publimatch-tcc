// config/db.js

const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config(); // Garante que as variáveis do .env sejam carregadas

const connectDB = async () => {
  try {
    // Tenta conectar ao MongoDB usando a string do seu arquivo .env
    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log(`🔌 MongoDB Conectado: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Erro ao conectar com o MongoDB: ${error.message}`);
    // Se a conexão falhar, encerra o processo do servidor
    process.exit(1);
  }
};

module.exports = connectDB;