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
  Legend,
  Filler
} from "chart.js";
import { QRCodeSVG } from "qrcode.react";
import "../styles/FidelityCard.css";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler);

const FidelityCard = () => {
  const [user, setUser] = useState(null);
  const [birthDate, setBirthDate] = useState("");
  const [loading, setLoading] = useState(true);

  const email = localStorage.getItem("userEmail")?.toLowerCase();

  const levels = [
    { name: "Bronzo", points: 0 },
    { name: "Argento", points: 50 },
    { name: "Oro", points: 120 },
    { name: "Platino", points: 250 }
  ];

  // =========================
  // Fetch utente
  // =========================
  const fetchUser = async () => {
    if (!email) {
      setLoading(false);
      return;
    }

    try {
      const res = await axios.get(`/api/users?email=${email}`);
      setUser(res.data);
      setBirthDate(res.data.dateOfBirth ? new Date(res.data.dateOfBirth).toISOString().split("T")[0] : "");
    } catch (err) {
      console.error("Errore fetch utente:", err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, [email]);

  // =========================
  // Salva data nascita
  // =========================
  const saveBirthDate = async () => {
    try {
      const res = await axios.put(`/api/users?email=${email}`, { dateOfBirth: birthDate });
      setUser(res.data.user);
      alert("Data salvata!");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Errore nel salvataggio");
    }
  };

  // =========================
  // Bonus giornaliero
  // =========================
  const dailyBonus = async () => {
    try {
      const res = await axios.put(`/api/users?email=${email}`, { dailyLogin: true });
      setUser(res.data.user);
      alert("🎉 Bonus giornaliero aggiunto!");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Errore bonus giornaliero");
    }
  };

  // =========================
  // Bonus QR
  // =========================
  const addQrPoints = async () => {
    try {
      if (!user?._id) return;
      const res = await axios.put(`/api/users?id=${user._id}`, { addPoints: 50 });
      setUser(res.data.user);
      alert("🎉 Hai ricevuto 50 punti!");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Errore nell'aggiunta punti QR");
    }
  };

  if (loading) return <p>⏳ Caricamento...</p>;
  if (!user) return <p>❌ Utente non trovato</p>;

  // =========================
  // Calcolo livelli
  // =========================
  const currentLevel = levels.slice().reverse().find(lvl => user.points >= lvl.points) || levels[0];
  const nextLevel = levels.find(lvl => lvl.points > user.points) || levels[levels.length - 1];
  const pointsToNext = Math.max(0, nextLevel.points - user.points);
  const progress = Math.min(100, ((user.points - currentLevel.points) / (nextLevel.points - currentLevel.points)) * 100);

  // =========================
  // Chart dati punti
  // =========================
  const chartData = {
    labels: Array.isArray(user.history) ? user.history.map(h => new Date(h.date).toLocaleDateString()) : [],
    datasets: [
      {
        label: "Punti accumulati",
        data: Array.isArray(user.history) ? user.history.map(h => h.points) : [],
        borderColor: "#cc4b00",
        backgroundColor: "rgba(204, 71, 0, 0.2)",
        tension: 0.4,
        pointRadius: 6,
        pointHoverRadius: 8,
        pointBackgroundColor: "#ffab66",
        pointHoverBackgroundColor: "#ff3700",
        fill: true
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#ec852c",
        titleColor: "#fff",
        bodyColor: "#fff",
        padding: 10,
        cornerRadius: 8
      }
    },
    scales: {
      x: { 
        grid: { display: false }, 
        ticks: { color: "#aa430b", font: { weight: 600 } } 
      },
      y: { 
        grid: { color: "rgba(204, 109, 0, 0.2)" }, 
        ticks: { color: "#bd4200", font: { weight: 600 } } 
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

        <div className="chart-container" style={{ marginTop: "30px" }}>
          <Line data={chartData} options={chartOptions} />
        </div>

        <div className="qr-section" style={{ textAlign: "center", margin: "30px 0" }}>
          <h3>📱 Mostra questo QR al negozio</h3>
          <QRCodeSVG value={user.email} size={180} bgColor="#ffffff" fgColor="#cc4101" />
          <button 
            style={{ marginTop: "10px", padding: "10px 20px", borderRadius: "8px", backgroundColor: "#d64a09", color: "#fff", border: "none", cursor: "pointer" }}
            onClick={addQrPoints}
          >
            Scansione QR
          </button>
        </div>
      </div>
    </div>
  );
};

export default FidelityCard;
