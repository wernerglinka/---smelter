import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter, Routes, Route } from 'react-router-dom';
import './assets/index.css';
import App from './App';
import EditPage from './screens/EditPage';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HashRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/edit" element={<EditPage />} />
      </Routes>
    </HashRouter>
  </React.StrictMode>
)
