// backend/controllers/campaignController.js

import Campaign from '../models/campaignModel.js';
import User from '../models/userModel.js';
import cloudinary from '../config/cloudinaryConfig.js';

// --- FUNÇÃO AUXILIAR PARA UPLOAD (sem alterações) ---
const uploadToCloudinary = (file) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { folder: "campaigns_logos" },
            (error, result) => {
                if (error) {
                    console.error("Cloudinary Upload Error:", error);
                    reject(new Error("Falha no upload da imagem."));
                } else {
                    resolve(result);
                }
            }
        );
        stream.end(file.buffer);
    });
};

// --- createCampaign (sem alterações) ---
export const createCampaign = async (req, res) => {
    try {
        const {
            title, privacy, minFollowers, minViews,
            startDate, endDate, paymentType, paymentValueExact,
            paymentValueMin, paymentValueMax
        } = req.body;

        let logoUrl = '';
        if (req.file) {
            const result = await uploadToCloudinary(req.file);
            logoUrl = result.secure_url;
        } else {
            res.status(400);
            throw new Error('A imagem da campanha (logo) é obrigatória.');
        }

        const description = JSON.parse(req.body.description);
        const categories = JSON.parse(req.body.categories);
        const requiredSocials = JSON.parse(req.body.requiredSocials);

        if (!title || !description || !paymentType) {
            return res.status(400).json({ message: 'Título, Descrição e Tipo de Pagamento são obrigatórios.' });
        }
        
        const campaignData = {
            title, description, privacy, categories,
            minFollowers, minViews, requiredSocials,
            startDate, endDate, paymentType,
            logo: logoUrl,
            brandName: req.user.name,
            createdBy: req.user._id
        };

        if (paymentType === 'Exato') {
            campaignData.paymentValueExact = paymentValueExact;
        } else if (paymentType === 'Aberto') {
            campaignData.paymentValueMin = paymentValueMin;
            campaignData.paymentValueMax = paymentValueMax;
        }
        
        const campaign = await Campaign.create(campaignData);
        res.status(201).json(campaign);

    } catch (error) {
        console.error("ERRO DETALHADO AO CRIAR CAMPANHA:", error);
        res.status(500).json({ message: 'Erro no servidor ao criar campanha', error: error.message });
    }
};

// --- getCampaigns (sem alterações) ---
export const getCampaigns = async (req, res) => {
    try {
        const campaigns = await Campaign.find({ createdBy: req.user._id }).sort({ createdAt: -1 });
        res.status(200).json(campaigns);
    } catch (error) {
        res.status(500).json({ message: 'Erro no servidor ao buscar campanhas', error: error.message });
    }
};

// --- getCampaignById (sem alterações) ---
export const getCampaignById = async (req, res) => {
    try {
        const campaign = await Campaign.findById(req.params.id).populate('createdBy', 'name email');
        if (!campaign) {
            return res.status(404).json({ message: 'Campanha não encontrada.' });
        }
        res.status(200).json(campaign);
    } catch (error) {
        res.status(500).json({ message: 'Erro no servidor ao buscar campanha', error: error.message });
    }
};

// --- updateCampaign (sem alterações) ---
export const updateCampaign = async (req, res) => {
    try {
        const campaign = await Campaign.findById(req.params.id);

        if (!campaign) {
            return res.status(404).json({ message: 'Campanha não encontrada.' });
        }
        if (campaign.createdBy.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Usuário não autorizado a modificar esta campanha.' });
        }

        const updateData = { ...req.body };
        delete updateData.createdBy;
        delete updateData.participatingInfluencers;

        if (req.file) {
            const result = await uploadToCloudinary(req.file);
            updateData.logo = result.secure_url;
        }

        try {
            if (updateData.description && typeof updateData.description === 'string') {
                updateData.description = JSON.parse(updateData.description);
            }
            if (updateData.categories && typeof updateData.categories === 'string') {
                updateData.categories = JSON.parse(updateData.categories);
            }
            if (updateData.requiredSocials && typeof updateData.requiredSocials === 'string') {
                updateData.requiredSocials = JSON.parse(updateData.requiredSocials);
            }
        } catch (parseError) {
            return res.status(400).json({ message: "Dados em formato inválido." });
        }
        
        const updatedCampaign = await Campaign.findByIdAndUpdate(req.params.id, updateData, {
            new: true,
            runValidators: true
        });
        res.status(200).json(updatedCampaign);
    } catch (error) {
        res.status(500).json({ message: 'Erro no servidor ao atualizar campanha', error: error.message });
    }
};

// --- ANTIGA FUNÇÃO deleteCampaign REMOVIDA ---

// --- NOVA FUNÇÃO PARA OCULTAR/MOSTRAR CAMPANHA ---
export const updateCampaignState = async (req, res) => {
    try {
        const campaign = await Campaign.findById(req.params.id);

        if (!campaign) {
            return res.status(404).json({ message: 'Campanha não encontrada.' });
        }

        if (campaign.createdBy.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Usuário não autorizado a modificar esta campanha.' });
        }

        // Alterna o estado: se for 'Hidden', vira 'Open', e vice-versa.
        campaign.state = campaign.state === 'Hidden' ? 'Open' : 'Hidden';

        await campaign.save();

        res.status(200).json({ message: `Campanha agora está ${campaign.state}`, campaign });

    } catch (error) {
        res.status(500).json({ message: 'Erro no servidor ao atualizar estado da campanha', error: error.message });
    }
};

export const updateCampaignStatus = async (req, res) => {
    try {
        const campaign = await Campaign.findById(req.params.id);

        if (!campaign) {
            return res.status(404).json({ message: 'Campanha não encontrada.' });
        }
        if (campaign.createdBy.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Usuário não autorizado.' });
        }
        const { status } = req.body;
        if (!status) {
            return res.status(400).json({ message: 'Novo status é obrigatório.'});
        }
        campaign.status = status;
        await campaign.save();
        res.status(200).json({ message: `Status atualizado para ${status}`, campaign });
    } catch (error) {
        res.status(500).json({ message: 'Erro no servidor ao atualizar status.', error: error.message });
    }
};

// --- searchCampaigns (sem alterações) ---
export const searchCampaigns = async (req, res) => {
    try {
        // 1. Pega os parâmetros da URL enviados pelo frontend
        const { title, category, platform, minFollowers, openSlots, minViews } = req.query;

        // 2. Cria um objeto de consulta base
        // Apenas campanhas públicas ('Open') e com status 'Aberta' devem aparecer na busca por padrão
        const query = { status: { $nin: ['Concluída', 'Cancelada'] } };

        // 3. Adiciona os filtros ao objeto de consulta dinamicamente
        if (title) {
            // Usa regex para busca por texto parcial e insensível a maiúsculas/minúsculas
            query.title = { $regex: title, $options: 'i' };
        }
        if (category) {
            // Verifica se a categoria existe no array 'categories' da campanha
            query.categories = { $in: [category] };
        }
        if (platform) {
            // Verifica se a plataforma existe no array 'requiredSocials' da campanha
            query.requiredSocials = { $in: [platform] };
        }
        if (minFollowers && parseInt(minFollowers, 10) > 0) {
            // Converte o valor do slider (que está em 'k') para um número e compara
            // ATENÇÃO: Veja a nota sobre o seu Model abaixo!
            const followerCount = parseInt(minFollowers, 10);
            query.minFollowers = { $lte: followerCount };
        }

         if (minViews && parseInt(minViews, 10) > 0) {
            const viewsCount = parseInt(minViews, 10);
            query.minViews = { $lte: viewsCount };
        }

        if (openSlots === 'true') {
            // Se o checkbox 'Vagas Abertas' estiver marcado, filtra por status 'Aberta'
            query.status = 'Aberta';
        }

        // 4. Executa a busca com os filtros montados
        const campaigns = await Campaign.find(query)
            .populate('createdBy', 'name') // Popula com o nome da marca/empresa
            .sort({ createdAt: -1 }); // Ordena pelas mais recentes

        res.status(200).json(campaigns);

    } catch (error) {
        console.error("ERRO AO PESQUISAR CAMPANHAS:", error);
        res.status(500).json({ message: 'Erro no servidor ao pesquisar campanhas', error: error.message });
    }
};

export const cancelCampaignWithPassword = async (req, res) => {
    try {
        const { password } = req.body;
        const campaignId = req.params.id;
        const userId = req.user._id; // ID do usuário logado (vem do middleware 'protect')

        // 1. Validação básica
        if (!password) {
            return res.status(400).json({ message: 'A senha é obrigatória.' });
        }

        // 2. Encontrar o usuário no banco de dados, incluindo a senha
        const user = await User.findById(userId).select('+password');
        if (!user) {
            return res.status(404).json({ message: 'Usuário não encontrado.' });
        }

        // 3. Verificar se a senha fornecida está correta
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Senha incorreta.' });
        }

        // 4. Se a senha estiver correta, prossiga para cancelar a campanha
        const campaign = await Campaign.findById(campaignId);
        if (!campaign) {
            return res.status(404).json({ message: 'Campanha não encontrada.' });
        }

        // 5. Verifique se o usuário é o dono da campanha
        if (campaign.createdBy.toString() !== userId.toString()) {
            return res.status(403).json({ message: 'Usuário não autorizado a cancelar esta campanha.' });
        }

        // 6. Altere o status e salve
        campaign.status = 'Cancelada';
        await campaign.save();

        res.status(200).json({ message: 'Campanha cancelada com sucesso.', campaign });

    } catch (error) {
        console.error("ERRO AO CANCELAR CAMPANHA COM SENHA:", error);
        res.status(500).json({ message: 'Erro no servidor ao cancelar campanha.' });
    }
};