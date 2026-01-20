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

  useEffect(() => {
    if (!email) return;

    axios.get(`http://localhost:5000/api/users/${email}`)
      .then(res => setUser(res.data))
      .catch(err => console.error(err));

    axios.get("http://localhost:5000/api/prizes")
      .then(res => setPremiDisponibili(res.data))
      .catch(err => console.error("Errore fetch premi:", err));
  }, [email]);

  const redeemPrize = async (premio) => {
    try {
      const res = await axios.put(
        `http://localhost:5000/api/users/${email}/redeem`,
        { premio }
      );
      setUser(res.data);
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
          🎯 <span className="highlight">{Math.max(0, nextReward - user.points)}</span> punti al prossimo premio
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
                  {premio.consigliato && <span className="tag consigliato">⭐ Consigliato</span>}
                  {premio.best && <span className="tag best">🔥 Best Value</span>}
                  <p className="validity">
                    Valido fino a: {new Date(premio.validUntil).toLocaleDateString()}
                  </p>
                  <div className="premio-actions">
                    <span className="premio-punti">{premio.pointsNeeded} pts</span>
                    <button
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
        <p className="punti-totali">Punti disponibili: <strong>{user.points}</strong></p>
      </div>

      <div className="riscatta-buttons-container">
        <button className="final-btn" onClick={() => navigate("/homepage")}>🏠 Home</button>
        <button className="final-btn" onClick={() => navigate("/catalogo-premi")}>🎁 Catalogo Premi</button>
      </div>
    </div>
  );
};

export default RiscattaPremio;
