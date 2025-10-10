import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto'; // Importe o módulo crypto do Node.js

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true }, // Removido 'select: false' para facilitar o primeiro login
    role: {
        type: String,
        required: true,
        enum: ['AD_AGENT', 'INFLUENCER_AGENT', 'INFLUENCER', 'ADMIN']
    },
    empresaId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Empresa',
        default: null
    },
    status: {
        type: String,
        enum: ['ativo', 'suspenso'],
        default: 'ativo'
    },
    isCompanyAdmin: {
        type: Boolean,
        default: false
    },
    passwordResetToken: String,
    passwordResetExpires: Date,
    // 👇 NOVOS CAMPOS PARA O TOKEN DE CRIAÇÃO DE CONTA
    passwordSetupToken: String,
    passwordSetupExpires: Date,
}, { timestamps: true });

// Hook para criptografar a senha antes de salvar
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Método para comparar a senha
userSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// 👇 NOVO MÉTODO PARA GERAR O TOKEN DE CRIAÇÃO DE SENHA
userSchema.methods.getPasswordSetupToken = function() {
    // 1. Gera um token aleatório
    const setupToken = crypto.randomBytes(20).toString('hex');

    // 2. Criptografa o token para armazenar no banco de dados com segurança
    this.passwordSetupToken = crypto
        .createHash('sha256')
        .update(setupToken)
        .digest('hex');

    // 3. Define um tempo de validade (ex: 24 horas)
    this.passwordSetupExpires = Date.now() + 24 * 60 * 60 * 1000; // 24h

    // 4. Retorna o token NÃO criptografado para ser enviado por e-mail
    return setupToken;
};

const User = mongoose.model('User', userSchema);
export default User;