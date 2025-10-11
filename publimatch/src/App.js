import { ColorModeContext, useMode } from "./theme";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { Routes, Route, Outlet} from "react-router-dom";

// Componentes de Layout e Autenticação
import ProtectedRoute from './auth/ProtectedRoute.jsx';
import RoleProtectedRoute from './auth/RoleProtectedRoute';
import Topbar from "./scenes/global/Topbar.jsx";
import Sidebar from "./scenes/global/Sidebar.jsx";
import { NotificationProvider } from './scenes/global/NotificationContext.jsx'; // Importe o Provedor
import CampaignNotificationModal from './components/CampaignNotificationModal.jsx'; // Importe o Modal

// Cenas (Páginas)
import Dashboard from "./scenes/dashboard";
import Login from './scenes/login/login.jsx';
import Solicitacoes from './scenes/admin/solicitacoes.jsx'; 
import Campanha from './scenes/campanha';
import CampaignsRegister from './scenes/campanha/cadastrar';
import CampaignSearchPage from './scenes/campanha/pesquisa.jsx';
import CampaignProfile from "./scenes/campanha/CampaignProfile.jsx";
import CampaignEdit from './scenes/campanha/CampaignEdit';
import ListaInflu from "./scenes/influenciador/lista/lista.jsx";
import CadastrarInflu from "./scenes/influenciador/lista/cadastro.jsx";
import EditarInfluenciador from "./scenes/influenciador/lista/EditarInfluenciador.jsx";
import Ranking from "./scenes/influenciador/ranking/index.jsx";
import PesquisaInflu from "./scenes/influenciador/pesquisa/index.jsx";
import InfluencerProfile from "./scenes/influenciador/pesquisa/sobre.jsx";
import Sobrespec from "./scenes/influenciador/lista/sobreEspc.jsx";
import Conversas from "./scenes/chat/index.jsx";
import TelaChat from "./scenes/chat/TelaChat.jsx";
import Configuracoes from "./scenes/perfil/config.jsx";
import PerfilAgente from "./scenes/perfil/perfil.jsx";
import CompanyAdminProtectedRoute from "./auth/CompanyAdminProtectedRoute.jsx";
import Equipe from "./scenes/empresa/equipe.jsx";
// CORREÇÃO 1: Definir as ROLES para corresponder ao backend.
// Esta é a "fonte da verdade" para as permissões no frontend.
export const ROLES = {
    ADMIN: 'ADMIN',
    AD_AGENT: 'AD_AGENT',
    INFLUENCER_AGENT: 'INFLUENCER_AGENT',
    INFLUENCER: 'INFLUENCER',
};

// Layout principal da aplicação (Sidebar + Topbar + Conteúdo)
const AppLayout = () => (
  <div className="app">
    <Sidebar />
    <main className="content">
      <Topbar />
      <Outlet />
    </main>
  </div>
);

function App() {
  const [theme, colorMode] = useMode();

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
         <NotificationProvider>
        <Routes>
          {/* ROTA PÚBLICA */}
          <Route path="/login" element={<Login />} />

          {/* ROTAS PROTEGIDAS (precisa estar logado para acessar) */}
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            {/* == Rotas COMUNS a TODOS os usuários logados == */}
            <Route index element={<Dashboard />} />
            <Route path="/perfil" element={<PerfilAgente />} />
            <Route path="/configuracoes" element={<Configuracoes />} />
            <Route path="/conversas" element={<Conversas />} />
            <Route path="/conversa/:chatId" element={<TelaChat />} />
            <Route path="/influenciadores/ranking" element={<Ranking />} />
            <Route path="/influenciador/pesquisa" element={<PesquisaInflu />} />
            <Route path="/influenciador/:id" element={<InfluencerProfile />} />
            <Route path="/campaign/:id" element={<CampaignProfile />} />
            
            {/* == Rota EXCLUSIVA para ADMIN == */}
           {/* == Rota EXCLUSIVA para ADMIN DA PLATAFORMA == */}
            <Route element={<RoleProtectedRoute allowedRoles={[ROLES.ADMIN]} />}>
              <Route path="/solicitacoes" element={<Solicitacoes />} />
            </Route>
            
            {/* 👇 2. ROTA EXCLUSIVA PARA ADMINS DE EMPRESA 👇 */}
            <Route element={<CompanyAdminProtectedRoute />}>
              <Route path="/equipe" element={<Equipe />} />
            </Route>
            
            {/* == Rotas EXCLUSIVAS para AGENTE DE PUBLICIDADE == */}
            <Route element={<RoleProtectedRoute allowedRoles={[ROLES.AD_AGENT]} />}>
              <Route path="/campanha" element={<Campanha />} />
              <Route path="/campanhas/cadastrar" element={<CampaignsRegister />} />
              <Route path="/campaigns/edit/:id" element={<CampaignEdit />} />
            </Route>

            {/* == Rotas EXCLUSIVAS para AGENTE DO INFLUENCIADOR == */}
            <Route element={<RoleProtectedRoute allowedRoles={[ROLES.INFLUENCER_AGENT]} />}>
              <Route path="/influenciador/lista" element={<ListaInflu />} />
              <Route path="/influenciador/cadastro" element={<CadastrarInflu />} />
              <Route path="/influenciador/editar/:id" element={<EditarInfluenciador />} />
              <Route path="/influenciadores/perfil/:id" element={<Sobrespec />} />
              
            </Route>

            {/* == Rotas para INFLUENCIADOR e seu AGENTE == */}
            <Route element={<RoleProtectedRoute allowedRoles={[ROLES.INFLUENCER_AGENT, ROLES.INFLUENCER]} />}>
              <Route path="/PesquisaCampanha" element={<CampaignSearchPage />} />
            </Route>
    
          </Route>
        </Routes>
         <CampaignNotificationModal />
         </NotificationProvider>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export default App;
