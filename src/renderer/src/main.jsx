import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter, Routes, Route } from 'react-router-dom';
import './styles/global.css';
//import './assets/index.css';
import App from './screens/home/index.jsx';
import EditPage from './screens/edit/index.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HashRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/edit" element={<EditPage />} />
      </Routes>
    </HashRouter>
  </React.StrictMode>
);
