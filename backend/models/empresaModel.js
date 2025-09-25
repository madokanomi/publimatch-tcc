// models/empresa.model.js

import mongoose from 'mongoose';

const empresaSchema = new mongoose.Schema({
    nomeEmpresa: { type: String, required: true },
    cnpj: { type: String, unique: true },
    contatoPrincipal: {
        nome: { type: String, required: true },
        email: { type: String, required: true, unique: true }
    },
    statusAssinatura: {
        type: String,
        enum: ['ativa', 'inativa', 'suspensa', 'cancelada'],
        default: 'ativa'
    },
    dataFimAssinatura: { type: Date },
    // Guarda o ID da solicitação original para referência
    solicitacaoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Solicitacao' }
}, { timestamps: true });

const Empresa = mongoose.model('Empresa', empresaSchema);

export default Empresa;