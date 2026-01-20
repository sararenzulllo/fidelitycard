import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Welcome from "./pages/Welcome";
import Login from "./pages/Login";
import Register from "./pages/Register";
import HomePage from "./pages/HomePage";
import Products from "./pages/Products";
import Orders from "./pages/Orders";
import FidelityCard from "./pages/FidelityCard";
import AddProduct from "./pages/AddProduct";
import CatalogoPremi from "./pages/CatalogoPremi";
import HistoryPage from "./pages/HistoryPage";
import FAQSupport from "./pages/FAQSupport";
import OrdersList from "./pages/OrdersList";
import Recommendations from "./pages/Recommendations";
import RiscattaPremio from "./pages/RiscattaPremio";
import Recensioni from "./pages/Recensioni";

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
