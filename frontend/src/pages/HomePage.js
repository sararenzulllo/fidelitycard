import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/HomePage.css";

const featureCards = [
  { title: "Accumulare Punti", description: "Ad ogni acquisto guadagni punti che potrai usare per premi esclusivi.", icon: "⭐" },
  { title: "Riscattare Premi", description: "Trasforma i tuoi punti in regali e offerte personalizzate.", icon: "🎁" },
  { title: "Offerte Personalizzate", description: "Scopri promozioni pensate solo per te in base ai tuoi acquisti.", icon: "🎯" },
  { title: "Gestione Ordini", description: "Controlla i tuoi ordini, lo storico e lo stato di consegna.", icon: "🛒" },
  { title: "Lascia Recensioni", description: "Condividi la tua esperienza e aiuta altri utenti a scegliere.", icon: "📝" },
];

const HomePage = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/welcome");
  };

  return (
    <div className="homepage-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <h2 className="sidebar-title">Menu</h2>

        <div className="menu-section">
          <h3>La tua Carta</h3>
          <button onClick={() => navigate("/fidelity-card")}>📊 La tua Carta</button>
          <button onClick={() => navigate("/history")}>📜 Storico Punti</button>
        </div>

        <div className="menu-section">
          <h3>Prodotti & Ordini</h3>
          <button onClick={() => navigate("/catalogo-prodotti")}>📦 Catalogo Prodotti</button>
          <button onClick={() => navigate("/ordini")}>🛒 Ordina Prodotti</button>
          <button onClick={() => navigate("/orders-list")}>📋 Lista Ordini</button>
        </div>

        <div className="menu-section">
          <h3>Premi</h3>
          <button onClick={() => navigate("/catalogo-premi")}>🎁 Catalogo Premi</button>
          <button onClick={() => navigate("/riscatta-premio")}>🎉 Riscatta Premio</button>
        </div>

        <div className="menu-section">
          <h3>Supporto & Offerte</h3>
          <button onClick={() => navigate("/faq-support")}>❓ FAQ / Support</button>
          <button onClick={() => navigate("/recommendations")}>🎯 Offerte & Consigli</button>
          <button onClick={() => navigate("/recensioni")}>📝 Lascia una Recensione</button>
        </div>

        <button className="btn-logout" onClick={handleLogout}>🔒 Logout</button>
      </aside>

      {/* Descrizione centrale */}
      <main className="main-content">
        <div className="fidelity-description">
          <h1 className="fidelity-title">🎉 FidelityCard360</h1>
          <p className="fidelity-intro">
            Benvenuto nella tua FidelityCard interattiva! Accumula punti, scopri offerte personalizzate
            e riscatta premi esclusivi. Usa il menu laterale per navigare tra le varie funzionalità.
          </p>

          <div className="features-grid">
            {featureCards.map((feature, index) => (
              <div key={index} className="feature-card">
                <div className="feature-icon">{feature.icon}</div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-desc">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default HomePage;
