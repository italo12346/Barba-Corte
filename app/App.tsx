import React from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import store from './src/store'; 
import Header from './src/components/Header';
import Home from './src/pages/Home';
import Profile from './src/pages/Profile'; 
/**
 * Arquivo principal da aplicação (App.js)
 * Aqui conectamos o Redux (Provider) e o Roteamento (Router)
 */
export default function App() {
  return (
    <Provider store={store}>
      <Router>
        <Header />
        
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/perfil" element={<Profile />} />
            
          </Routes>
        </main>
      </Router>
    </Provider>
  );
}
