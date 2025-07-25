// src/index.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './components/App.jsx';
import { BrowserRouter } from 'react-router-dom';
import '@ant-design/v5-patch-for-react-19';

// ตรวจสอบว่าเป็น Production mode หรือไม่ เพื่อกำหนด basename ให้ถูกต้อง
const basename = import.meta.env.PROD ? '/mroi' : '/';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <BrowserRouter basename={basename}>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);