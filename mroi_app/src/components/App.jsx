// src/components/App.jsx
import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import Tools from './tools_draw';
import Devices from './devices';
import  Navbar  from './navbar';

function App() {
  return (
    <>
        <Navbar/>
      <Routes>
        <Route path="/" element={<Devices />} />
        <Route path="/tools" element={<Tools />} />
      </Routes>
    </>
  );
}

export default App;
