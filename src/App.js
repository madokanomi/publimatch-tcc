import { ColorModeContext, useMode } from './theme';
import { CssBaseline, ThemeProvider} from "@mui/material";
import { Routes, Route } from 'react-router-dom';
import Topbar from "./scenes/global/Topbar.jsx";
import Sidebar from './scenes/global/Sidebar.jsx';
import Dashboard from  './scenes/dashboard';
import Campanha from  './scenes/campanha';
import Cadastrar from  './scenes/campanha/cadastrar.jsx';
import Ranking from './scenes/influenciador/ranking/index.jsx';
import PesquisaInflu from './scenes/influenciador/pesquisa/index.jsx';
import InfluencerProfile from './scenes/influenciador/pesquisa/sobre.jsx';

/* 
import Invoices from  './scenes/invoices';
import Contacts from  './scenes/contacts';
import Bar from  './scenes/bar';
import Form from  './scenes/form';
import Line from  './scenes/line';
import Pie from  './scenes/pie';
import FAQ from  './scenes/faq';
import Geography from  './scenes/geography';
import Calendar from './scenes/calendar' */


function App() {
  const [theme, colorMode] = useMode ();
  
  return (
    <ColorModeContext.Provider value={colorMode}>
    <ThemeProvider theme={theme}>
      <CssBaseline/>
    <div className="app">
      <Sidebar />
      <main className="content">
        <Topbar/>
        <Routes>
          <Route path="/" element = {<Dashboard />} />
         <Route path="/campanha" element = {<Campanha />} />
     <Route path="/influenciador/:id" element={<InfluencerProfile />} />
            <Route path="/campanha/cadastrar" element = {<Cadastrar />} />    
             <Route path="/influenciador/pesquisa" element = {<PesquisaInflu />} />
              <Route path="/influenciadores/ranking" element = {<Ranking />} />
                {/* 
              <Route path="/form" element = {<Form />} />
               <Route path="/bar" element = {<Bar />} />
               <Route path="/pie" element = {<Pie />} />
              <Route path="/line" element = {<Line />} />
               <Route path="/faq" element = {<FAQ />} />
               <Route path="/geography" element = {<Geography />} />
               <Route path="/calendar" element = {<Calendar />} /> */}
        </Routes>
      </main>
    </div>
    </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export default App;
