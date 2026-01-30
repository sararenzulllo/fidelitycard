import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Welcome from './pages/Welcome.js';
import Login from './pages/Login.js';
import Register from './pages/Register.js';
import HomePage from './pages/HomePage.js';
import Products from './pages/Products.js';
import Orders from './pages/Orders.js';
import FidelityCard from './pages/FidelityCard.js';
import AddProduct from './pages/AddProduct.js';
import CatalogoPremi from './pages/CatalogoPremi.js';
import HistoryPage from './pages/HistoryPage.js';
import FAQSupport from './pages/FAQSupport.js';
import OrdersList from './pages/OrdersList.js';
import Recommendations from './pages/Recommendations.js';
import RiscattaPremio from './pages/RiscattaPremio.js';
import Recensioni from './pages/Recensioni.js';

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const email = localStorage.getItem("userEmail");
    if (email) setIsLoggedIn(true);
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/login" element={<Login setIsLoggedIn={setIsLoggedIn} />} />
        <Route path="/register" element={<Register setIsLoggedIn={setIsLoggedIn} />} />
        <Route path="/homepage" element={isLoggedIn ? <HomePage /> : <Navigate to="/" />} />
        <Route path="/catalogo-prodotti" element={isLoggedIn ? <Products /> : <Navigate to="/" />} />
        <Route path="/ordini" element={isLoggedIn ? <Orders /> : <Navigate to="/" />} />
        <Route path="/aggiungi-prodotto" element={isLoggedIn ? <AddProduct /> : <Navigate to="/" />} />
        <Route path="/history" element={isLoggedIn ? <HistoryPage /> : <Navigate to="/" />} />
        <Route path="/faq-support" element={isLoggedIn ? <FAQSupport /> : <Navigate to="/" />} />
        <Route path="/orders-list" element={isLoggedIn ? <OrdersList /> : <Navigate to="/" />} />
        <Route path="/catalogo-premi" element={isLoggedIn ? <CatalogoPremi /> : <Navigate to="/" />} />
        <Route path="/recommendations" element={isLoggedIn ? <Recommendations /> : <Navigate to="/" />} />
        <Route path="/riscatta-premio" element={isLoggedIn ? <RiscattaPremio /> : <Navigate to="/" />} />
        <Route path="/fidelity-card" element={isLoggedIn ? <FidelityCard /> : <Navigate to="/" />} />
        <Route path="*" element={<Navigate to="/" />} />
        <Route path="/recensioni" element={<Recensioni />} />
      </Routes>
    </Router>
  );
};

export default App;
