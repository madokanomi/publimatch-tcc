import mongoose from 'mongoose';

const solicitacaoSchema = new mongoose.Schema({
    tipoCadastro: { 
        type: String, 
        required: true, 
        enum: ['Influenciador', 'Agencia', 'Empresa'] 
    },
    nomeContato: { type: String, required: true },
    emailContato: { type: String, required: true, lowercase: true, unique: true },
    documento: { type: String },
    
    nomeAgenciaOuEmpresa: { type: String },
    website: { type: String },
    redesSociais: { type: String },
    nicho: { type: String },
    seguidores: { type: Number },
    descricao: { type: String },
    
    // 👇 ADICIONE ESTE NOVO CAMPO AQUI 👇
    detalhesEquipe: {
        agentesPublicidade: { type: Number, default: 0 },
        agentesInfluenciador: { type: Number, default: 0 }
    },
    
    status: {
        type: String,
        enum: ['pendente', 'aprovado', 'rejeitado'],
        default: 'pendente'
    },
}, { timestamps: true });

solicitacaoSchema.index({ emailContato: 1 }, { unique: true });

const Solicitacao = mongoose.model('Solicitacao', solicitacaoSchema);

export default Solicitacao;