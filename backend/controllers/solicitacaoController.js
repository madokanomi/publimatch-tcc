import crypto from 'crypto';
import Solicitacao from '../models/solicitacaoModel.js';
import User from '../models/userModel.js';
import Empresa from '../models/empresaModel.js';
import { sendWelcomeEmail } from '../config/email.js';

// @desc    Criar uma nova solicitação de cadastro
// @route   POST /api/solicitacoes
// @access  Público
export const criarSolicitacao = async (req, res) => {
    try {
        const { emailContato, documento } = req.body;
        const query = { $or: [{ emailContato: emailContato }] };

        if (documento) {
            query.$or.push({ documento: documento });
        }

        const solicitacaoExistente = await Solicitacao.findOne(query);

        if (solicitacaoExistente) {
            const errorMessage = solicitacaoExistente.emailContato === emailContato
                ? 'Uma solicitação com este e-mail já existe.'
                : 'Uma solicitação com este documento já existe.';
            return res.status(400).json({ message: errorMessage });
        }
        
        const novaSolicitacao = await Solicitacao.create(req.body);
        res.status(201).json({ 
            message: 'Solicitação recebida com sucesso!',
            solicitacao: novaSolicitacao 
        });

    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Já existe uma solicitação com este e-mail ou documento.' });
        }
        res.status(500).json({ message: 'Erro no servidor', error: error.message });
    }
};

// @desc    Buscar todas as solicitações pendentes
// @route   GET /api/solicitacoes/pendentes
// @access  Privado (Admin)
export const getSolicitacoesPendentes = async (req, res) => {
    try {
        const solicitacoes = await Solicitacao.find({ status: 'pendente' }).sort({ createdAt: -1 });
        res.status(200).json(solicitacoes);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar solicitações', error: error.message });
    }
};

// @desc    Aprovar ou Rejeitar uma solicitação
// @route   PUT /api/solicitacoes/:id
// @access  Privado (Admin)
export const updateSolicitacaoStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const solicitacao = await Solicitacao.findById(req.params.id);

        if (!solicitacao || solicitacao.status !== 'pendente') {
            return res.status(400).json({ message: 'Solicitação inválida ou já processada.' });
        }

        if (status === 'aprovado') {
            const setupUserAndSendEmail = async (userData) => {
                const userExists = await User.findOne({ email: userData.email });
                if (userExists) {
                    throw new Error(`Um usuário com o e-mail ${userData.email} já existe.`);
                }

                const setupToken = crypto.randomBytes(32).toString('hex');
                const passwordSetupToken = crypto.createHash('sha256').update(setupToken).digest('hex');
                const passwordSetupExpires = Date.now() + 24 * 60 * 60 * 1000;

                const newUser = await User.create({
                    ...userData,
                    password: 'password-not-set',
                    passwordSetupToken,
                    passwordSetupExpires
                });
                
                const setupLink = `http://localhost:3000/criar-senha/${setupToken}`;
                await sendWelcomeEmail(newUser.email, newUser.name, setupLink);
            };

            // Lógica para Empresas e Agências
            if (['Empresa', 'Agencia'].includes(solicitacao.tipoCadastro)) {
                const empresaExistente = await Empresa.findOne({ cnpj: solicitacao.documento });
                if (empresaExistente) {
                    return res.status(400).json({ message: `Uma empresa com o CNPJ ${solicitacao.documento} já existe.` });
                }

                const nomeDaEmpresa = solicitacao.nomeAgenciaOuEmpresa || solicitacao.nomeContato;

                // 1. Cria a entidade da Empresa
                const novaEmpresa = await Empresa.create({
                    nomeEmpresa: nomeDaEmpresa,
                    cnpj: solicitacao.documento,
                    contatoPrincipal: { nome: solicitacao.nomeContato, email: solicitacao.emailContato },
                    solicitacaoId: solicitacao._id
                });
                
                // 2. Cria APENAS o usuário de contato principal (o admin da empresa)
                await setupUserAndSendEmail({
                    name: solicitacao.nomeContato,
                    email: solicitacao.emailContato,
                    role: solicitacao.tipoCadastro === 'Empresa' ? 'AD_AGENT' : 'INFLUENCER_AGENT',
                    empresaId: novaEmpresa._id,
                    isCompanyAdmin: true // Define este usuário como o admin da empresa
                });

                // Os loops que criavam usuários aleatórios foram completamente removidos.

            } else { // Lógica para Influenciador individual
                await setupUserAndSendEmail({
                    name: solicitacao.nomeContato,
                    email: solicitacao.emailContato,
                    role: 'INFLUENCER',
                });
            }
        }

        // Atualiza o status da solicitação
        solicitacao.status = status;
        await solicitacao.save();
        res.status(200).json({ message: `Solicitação ${status} com sucesso.` });
    } catch (error) {
        console.error("ERRO NO BACKEND:", error);
        res.status(500).json({ message: 'Erro no servidor ao processar solicitação', error: error.message });
    }
};