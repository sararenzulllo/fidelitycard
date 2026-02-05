import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; 
import "../styles/RiscattaPremio.css";

const RiscattaPremio = () => {
  const [user, setUser] = useState(null);
  const [premiDisponibili, setPremiDisponibili] = useState([]);
  const [message, setMessage] = useState("");
  const email = localStorage.getItem("userEmail")?.toLowerCase();
  const navigate = useNavigate();

  const API_URL = process.env.REACT_APP_API_URL || "";

  useEffect(() => {
    if (!email) return;

    axios.get(`${API_URL}/api/users?email=${email}`)
      .then(res => setUser(res.data))
      .catch(err => console.error(err));

    axios.get(`${API_URL}/api/prizes`)
      .then(res => setPremiDisponibili(res.data))
      .catch(err => console.error("Errore fetch premi:", err));
  }, [email, API_URL]);

  const redeemPrize = async (premio) => {
    if (user.points < premio.punti) {
      setMessage("❌ Punti insufficienti");
      setTimeout(() => setMessage(""), 3000);
      return;
    }

    try {
      const res = await axios.put(`${API_URL}/api/users?email=${email}`, {
        redeemPrize: premio
      });

      setUser(prev => ({
        ...prev,
        points: Number((prev.points - premio.punti).toFixed(2)),
        rewards: [...prev.rewards, premio.nome]
      }));

      setMessage(`🎉 Hai riscattato: ${premio.nome}`);
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setMessage(err.response?.data?.message || "Errore nel riscatto");
      setTimeout(() => setMessage(""), 3000);
    }
  };

  if (!user) return <p className="loading">⏳ Caricamento...</p>;

  const nextReward = 50;
  const progress = Math.min(100, (user.points / nextReward) * 100);
  const today = new Date();
  const premiAttivi = premiDisponibili.filter(p => new Date(p.validUntil) >= today);

  return (
    <div className="riscatta-page">
      <h1 className="page-title">🎁 Riscatta il tuo Premio</h1>

      <div className="progress-box">
        <p className="missing-points">
          🎯 <span className="highlight">{Math.max(0, (nextReward - user.points).toFixed(2))}</span> punti al prossimo premio
        </p>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {message && <div className="success-message">{message}</div>}

      <section className="riscattati">
        <h3>Premi riscattati</h3>
        {user.rewards.length === 0 ? (
          <p className="empty">Nessun premio riscattato</p>
        ) : (
          <div className="badges">
            {user.rewards.map((r, i) => <span key={i} className="badge-ottenuto">{r}</span>)}
          </div>
        )}
      </section>

      <section className="premi-list">
        <h3 className="premi-disponibili-title">Premi Disponibili</h3>
        {premiAttivi.length === 0 ? (
          <p>Nessun premio disponibile al momento</p>
        ) : (
          <div className="premi-grid">
            {premiAttivi.map((premio, i) => {
              const alreadyRedeemed = user.rewards.includes(premio.name);
              const notEnoughPoints = user.points < premio.pointsNeeded;

              return (
                <div className="premio-card" key={i}>
                  <h4>{premio.name}</h4>
                  <p className="validity">
                    Valido fino a: {new Date(premio.validUntil).toLocaleDateString()}
                  </p>
                  <div className="premio-actions">
                    <span className="premio-punti">{premio.pointsNeeded.toFixed(2)} pts</span>
                    <button className="redeem-btn"
                      disabled={alreadyRedeemed || notEnoughPoints}
                      onClick={() => redeemPrize({ nome: premio.name, punti: premio.pointsNeeded })}
                    >
                      {alreadyRedeemed ? "Riscattato" : notEnoughPoints ? "Punti insufficienti" : "Riscatta"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <div className="punti-totali-container">
        <p className="punti-totali">
          Punti disponibili: <strong>{user.points.toFixed(2)}</strong>
        </p>
      </div>

      <div className="riscatta-buttons-container">
        <button className="green-btn" onClick={() => navigate("/homepage")}>🏠 Home</button>
        <button className="green-btn" onClick={() => navigate("/catalogo-premi")}>🎁 Catalogo Premi</button>
      </div>
    </div>
  );
};

export default RiscattaPremio;
