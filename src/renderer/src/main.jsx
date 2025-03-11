import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter, Routes, Route } from 'react-router-dom';
import './styles/global.css';
import App from './screens/home/index.jsx';
import EditPage from './screens/edit/index.jsx';
import { AppProviders } from './context/index.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AppProviders>
      <HashRouter>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/edit" element={<EditPage />} />
        </Routes>
      </HashRouter>
    </AppProviders>
  </React.StrictMode>
);
