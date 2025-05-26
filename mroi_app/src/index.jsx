// src/index.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './components/App.jsx';
import { BrowserRouter } from 'react-router-dom'; 
import '@ant-design/v5-patch-for-react-19';

const root = ReactDOM.createRoot(document.getElementById('root'));
//--------- this code will render two time just in develop mode  not in production mode --------
// root.render( 
//   <React.StrictMode>
//     <BrowserRouter> 
//       <App />
//     </BrowserRouter>
//   </React.StrictMode>
// );
root.render(
  <BrowserRouter> 
    <App />
  </BrowserRouter>
);
