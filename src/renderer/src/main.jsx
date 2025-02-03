import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { theme } from './styles/theme';
import './styles/global.css';
import App from './screens/home/index.jsx';
import EditPage from './screens/edit/index.jsx';
import NewPage from './screens/new/index.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <HashRouter>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/edit" element={ <EditPage /> } />
          <Route path="/new" element={ <NewPage /> } />
        </Routes>
      </HashRouter>
    </ThemeProvider>
  </React.StrictMode>
);
