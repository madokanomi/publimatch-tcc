// Imagem de avatar padrão, caso você a tenha em seus assets
import userPhoto from "../assets/user.png";

export const ROLES = {
  AD_AGENT: 'AGENTE_PUBLICIDADE',
  INFLUENCER_AGENT: 'INFLUENCER_AGENT',
  INFLUENCER: 'INFLUENCIADOR',
};

export const mockUsers = [
  // --- AGENTE DE PUBLICIDADE ---
  {
    id: 1,
    email: 'publicidade@email.com',
    password: 'password123',
    username: 'Agente de Publicidade',
    role: ROLES.AD_AGENT,
    cargo: "Agente de Publicidade Sênior",
    empresa: "Influex Mídia Digital",
    telefone: "+55 (13) 98765-4321",
    bio: "Especialista em marketing de influência com mais de 7 anos de experiência.",
    avatar: userPhoto,
    kpis: {
        campanhasAtivas: 8,
        orcamentoGerenciado: "R$ 1.2M",
        taxaSucesso: "92%",
        influencersGerenciados: 15,
    },
  },
  // --- AGENTE DE INFLUENCIADOR ---
  {
    id: 2,
    email: 'agenteinflu@email.com',
    password: 'password123',
    username: 'Agente do Influenciador',
    role: ROLES.INFLUENCER_AGENT,
    cargo: "Agente de Talentos Digitais",
    empresa: "Creators Connect",
    telefone: "+55 (11) 91234-5678",
    bio: "Foco no desenvolvimento de carreira de influenciadores e parcerias estratégicas.",
    avatar: "https://i.pravatar.cc/150?img=25",
    kpis: {
        campanhasAtivas: 12,
        orcamentoGerenciado: "R$ 850K",
        taxaSucesso: "95%",
        influencersGerenciados: 5,
    },
  },
  // --- INFLUENCIADOR ---
  {
    id: 3,
    email: 'influenciador@email.com',
    password: 'password123',
    username: 'Influenciador',
    role: ROLES.INFLUENCER,
    nomeReal: "João Victor",
    avaliacao: 4.8,
    seguidores: 1.2,
    views: 150,
    inscritos: 2.3,
    descricao: "Criando conteúdo que divirta e conecte pessoas.",
    engajamento: 83,
    categorias: ["Gamer", "Humor", "Crítica"],
    avatar: "https://i.pravatar.cc/150?img=68",
    imagemFundo: "https://pbs.twimg.com/media/Er3I6QAW4AE1TGr.jpg:large",
  },
];