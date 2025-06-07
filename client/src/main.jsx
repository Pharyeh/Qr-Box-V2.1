// client/src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { SymbolProvider } from './context/SymbolContext.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <SymbolProvider>
      <App />
    </SymbolProvider>
  </React.StrictMode>,
);
