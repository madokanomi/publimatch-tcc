const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, select: false }, // Remova o 'select: false' por enquanto para facilitar o teste
    role: {
        type: String,
    required: true,
    enum: ['AD_AGENT', 'INFLUENCER_AGENT', 'INFLUENCER', 'ADMIN']
    },
        empresaId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Empresa', // Referência ao modelo que acabamos de criar
        default: null
    },
    // 👇 NOVO CAMPO PARA CONTROLAR O ACESSO DO USUÁRIO INDIVIDUAL 👇
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
}, { timestamps: true });

// Middleware (hook) que roda ANTES de salvar o documento no DB
userSchema.pre('save', async function(next) {
    // Se a senha não foi modificada, não precisa criptografar de novo
    if (!this.isModified('password')) {
        return next();
    }
    
    // Gera o "sal" e criptografa a senha
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};


const User = mongoose.model('User', userSchema);
module.exports = User;