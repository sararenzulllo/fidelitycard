import React, { useEffect, useState } from "react";
import axios from "axios";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
} from "chart.js";
import { QRCodeSVG } from "qrcode.react";
import "../styles/FidelityCard.css";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

const FidelityCard = () => {
  const [user, setUser] = useState(null);
  const [birthDate, setBirthDate] = useState("");
  const [loading, setLoading] = useState(true);

  // ✅ URL API dinamico
  const API_URL = process.env.REACT_APP_API_URL;

  const email = localStorage.getItem("userEmail")?.toLowerCase();

  const levels = [
    { name: "Bronzo", points: 0 },
    { name: "Argento", points: 50 },
    { name: "Oro", points: 120 },
    { name: "Platino", points: 250 }
  ];

  useEffect(() => {
    const fetchUser = async () => {
      if (!email) return setLoading(false);
      try {
        const res = await axios.get(`${API_URL}/users/${email}`);
        setUser(res.data);
        setBirthDate(res.data.dateOfBirth ? new Date(res.data.dateOfBirth).toISOString().split("T")[0] : "");
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [email, API_URL]);

  const saveBirthDate = async () => {
    try {
      const res = await axios.put(`${API_URL}/users/${email}`, { dateOfBirth: birthDate });
      setUser(prev => ({ ...prev, dateOfBirth: res.data.dateOfBirth }));
      alert("Data salvata!");
    } catch (err) {
      console.error(err);
    }
  };

  const dailyBonus = async () => {
    try {
      const res = await axios.put(`${API_URL}/users/${email}/daily-login`);
      setUser(prev => ({
        ...prev,
        points: res.data.user.points,
        history: res.data.user.history || prev.history,
        rewards: res.data.user.rewards || prev.rewards
      }));
      alert("🎉 Bonus giornaliero aggiunto!");
    } catch (err) {
      alert(err.response?.data?.message);
    }
  };

  const addQrPoints = async () => {
    try {
      const res = await axios.put(`${API_URL}/users/${user._id}/add-points`, { points: 50 });
      setUser(prev => ({
        ...prev,
        points: res.data.points,
        history: res.data.history || prev.history,
        rewards: res.data.rewards || prev.rewards
      }));
      alert("🎉 Hai ricevuto 50 punti!");
    } catch (err) {
      console.error(err);
      alert("Errore nell'aggiunta dei punti");
    }
  };

  if (loading) return <p>⏳ Caricamento...</p>;
  if (!user) return <p>❌ Utente non trovato</p>;

  const currentLevel = levels.slice().reverse().find(lvl => user.points >= lvl.points) || levels[0];
  const nextLevel = levels.find(lvl => lvl.points > user.points) || levels[levels.length - 1];
  const pointsToNext = Math.max(0, nextLevel.points - user.points);
  const progress = Math.min(100, ((user.points - currentLevel.points) / (nextLevel.points - currentLevel.points)) * 100);

  const today = new Date();
  const premiAttivi = Array.isArray(user.rewards) ? user.rewards.filter(p => new Date(p.validUntil) >= today) : [];

  const chartData = {
    labels: Array.isArray(user.history) ? user.history.map(h => new Date(h.date).toLocaleDateString()) : [],
    datasets: [
      {
        label: "Punti accumulati",
        data: Array.isArray(user.history) ? user.history.map(h => h.points) : [],
        borderColor: "#cc0000",
        backgroundColor: "rgba(204,0,0,0.2)",
        tension: 0.4,
        pointRadius: 6,
        pointHoverRadius: 8,
        pointBackgroundColor: "#ff6666",
        pointHoverBackgroundColor: "#cc0000",
        fill: true
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#cc0000",
        titleColor: "#fff",
        bodyColor: "#fff",
        padding: 10,
        cornerRadius: 8
      }
    },
    scales: {
      x: { 
        grid: { display: false }, 
        ticks: { color: "#800000", font: { weight: 600 } } 
      },
      y: { 
        grid: { color: "rgba(204,0,0,0.2)" }, 
        ticks: { color: "#800000", font: { weight: 600 } } 
      }
    }
  };

  return (
    <div className="fidelity-page">
      <div className="fidelity-container">
        <h1>🃏 La tua Fidelity Card</h1>

        <div className="progress-box">
          <p className="missing-points">
            🎯 Ti mancano <strong>{pointsToNext}</strong> punti per arrivare al livello <span className="next-level">{nextLevel.name}</span>
          </p>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <div className="quick-actions">
          <button onClick={dailyBonus}>🎁 Login giornaliero</button>
          <a href={`mailto:?subject=Prova la mia App&body=Scarica qui: http://tuo-sito.com`} target="_blank" rel="noreferrer">
            <button>📧 Condivisione Email</button>
          </a>
          <a href={`https://api.whatsapp.com/send?text=Prova la mia App: http://tuo-sito.com`} target="_blank" rel="noreferrer">
            <button>💬 Condivisione WhatsApp</button>
          </a>
        </div>

        <div className="user-info">
          <h2>Informazioni utente</h2>
          <div className="info-row"><span className="label">Nome:</span> {user.name}</div>
          <div className="info-row"><span className="label">Email:</span> {user.email}</div>
          <div className="info-row">
            <span className="label">Data nascita:</span> 
            <input type="date" value={birthDate} onChange={e => setBirthDate(e.target.value)} />
            <button onClick={saveBirthDate}>Salva</button>
          </div>
          <div className="info-row"><span className="label">Punti totali:</span> {user.points}</div>
          <div className="info-row"><span className="label">Livello attuale:</span> {currentLevel.name}</div>
        </div>

        <div className="qr-section" style={{ textAlign: "center", margin: "30px 0" }}>
          <h3>📱 Mostra questo QR al negozio</h3>
          <p style={{ color: "#800000", marginBottom: "10px" }}>
            Quando mostrerai il tuo QR all’operatore, riceverai una conferma via email. Dopo questa conferma ti verranno aggiunti 50 punti al tuo account.
          </p>
          <QRCodeSVG 
            value={user.email}
            size={180}
            bgColor="#ffffff"
            fgColor="#cc0000"
          />
          <button 
            style={{ marginTop: "10px", padding: "10px 20px", borderRadius: "8px", backgroundColor: "#cc0000", color: "#fff", border: "none", cursor: "pointer" }}
            onClick={addQrPoints}
          >
            Scansione QR
          </button>
        </div>

        <div className="rewards-section">
          <h2>🏆 Premi ottenuti</h2>
          {Array.isArray(user.rewards) && user.rewards.length > 0 ? (
            <div className="rewards-grid">
              {user.rewards.map((r, i) => <div key={i} className="reward-card">{r}</div>)}
            </div>
          ) : (
            <p>Nessun premio ottenuto</p>
          )}
        </div>

        <div className="chart-section">
          <h3>Grafico punti</h3>
          <Line data={chartData} options={chartOptions} />
        </div>
      </div>
    </div>
  );
};

export default FidelityCard;
