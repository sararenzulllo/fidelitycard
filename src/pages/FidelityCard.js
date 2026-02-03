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

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler
);

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

  const fetchUser = async () => {
    if (!email) { setLoading(false); return; }
    try {
      const res = await axios.get(`/api/users?email=${email}`);
      setUser(res.data);
      setBirthDate(res.data.dateOfBirth ? new Date(res.data.dateOfBirth).toISOString().split("T")[0] : "");
    } catch (err) {
      console.error(err);
      setUser(null);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchUser(); }, [email]);

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

  const dailyBonus = async () => {
    try {
      const res = await axios.put(`/api/users?email=${email}`, { dailyLogin: true });
      setUser(res.data.user);
      alert("🎉 Bonus giornaliero aggiunto!");
    } catch (err) {
      console.error(err);
      if (err.response?.status === 400) {
        alert(err.response.data.message); // Mostra "Bonus giornaliero già ricevuto oggi!"
      } else {
        alert("Errore bonus giornaliero");
      }
    }
  };

  const addQrPoints = async () => {
    try {
      if (!user?._id) return;
      const res = await axios.put(`/api/users?email=${email}`, { addPoints: 50 });
      setUser(res.data.user);
      alert("🎉 Hai ricevuto 50 punti!");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Errore nell'aggiunta punti QR");
    }
  };

  const handleShare = async (type) => {
    try {
      if (!user?._id) return;

      const res = await axios.put(`/api/users?email=${email}`, { shareType: type });
      setUser(res.data.user);

      const shareText = `Ho appena guadagnato punti con la mia Fidelity Card!`;
      const shareUrl = window.location.href;

      if (type === "whatsapp") {
        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + " " + shareUrl)}`, "_blank");
      } else if (type === "email") {
        window.open(`mailto:?subject=Guarda la mia Fidelity Card&body=${encodeURIComponent(shareText + " " + shareUrl)}`, "_blank");
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Errore nella condivisione");
    }
  };

  if (loading) return <p>⏳ Caricamento...</p>;
  if (!user) return <p>❌ Utente non trovato</p>;

  const currentLevel = levels.slice().reverse().find(lvl => user.points >= lvl.points) || levels[0];
  const nextLevel = levels.find(lvl => lvl.points > user.points) || levels[levels.length - 1];
  const pointsToNext = Math.max(0, nextLevel.points - user.points);

  const progress = currentLevel.points === nextLevel.points
    ? 100
    : Math.max(0, Math.min(100, ((user.points - currentLevel.points) / (nextLevel.points - currentLevel.points)) * 100));

  const chartData = {
    labels: Array.isArray(user.history) ? user.history.map(h => new Date(h.date).toLocaleDateString()) : [],
    datasets: [{
      label: "Punti accumulati",
      data: Array.isArray(user.history) ? user.history.map(h => Number(h.points.toFixed(2))) : [],
      borderColor: "#2196f3",
      backgroundColor: "rgba(33,150,243,0.2)",
      tension: 0.4,
      pointRadius: 6,
      pointHoverRadius: 8,
      pointBackgroundColor: "#42a5f5",
      pointHoverBackgroundColor: "#0d47a1",
      fill: true
    }]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: { backgroundColor: "#2196f3", titleColor: "#fff", bodyColor: "#fff", padding: 10, cornerRadius: 8 }
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: "#0d47a1", font: { weight: 600 } } },
      y: { grid: { color: "rgba(33,150,243,0.2)" }, ticks: { color: "#0d47a1", font: { weight: 600 } } }
    }
  };

  return (
    <div className="fidelity-page">
      <div className="fidelity-container">
        <h1 className="fidelity-main-title">🃏 La tua Fidelity Card</h1>

        <div className="progress-box">
          <p className="missing-points" style={{ color: "#195e8c" , fontSize: "17px" }}>
            🎯 Ti mancano{" "}
            <strong style={{ color: "#bb3108" }}>{pointsToNext.toFixed(2)}</strong> punti per arrivare al livello{" "}
            <span style={{ color: "#13a99a" }}>{nextLevel.name}</span>
          </p>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${progress}%`, background: "linear-gradient(90deg, #7da9d4, #0d47a1)" }}
            />
          </div>
        </div>

        <div className="quick-actions">
          <button onClick={dailyBonus}>🎁 Login giornaliero</button>
          <button onClick={() => handleShare("whatsapp")}>📱 Condividi WhatsApp (+5 punti)</button>
          <button onClick={() => handleShare("email")}>✉️ Condividi Email (+5 punti)</button>
        </div>

        <div className="user-info full-width-info">
          <h2>Informazioni utente</h2>
          <div className="info-row"><span className="label">Nome:</span><span className="value">{user.name}</span></div>
          <div className="info-row"><span className="label">Email:</span><span className="value">{user.email}</span></div>
          <div className="info-row">
            <span className="label">Data nascita:</span>
            <input type="date" value={birthDate} onChange={e => setBirthDate(e.target.value)} />
            <button onClick={saveBirthDate} className="qr-button">Salva</button>
          </div>
          <div className="info-row">
            <span className="label">Punti totali:</span>
            <span className="value">{user.points.toFixed(2)}</span>
          </div>
          <div className="info-row">
            <span className="label">Livello attuale:</span>
            <span className="value">{currentLevel.name}</span>
          </div>
        </div>

        <div className="qr-section">
          <h3>📱 Mostra questo QR al negozio</h3>
          <p className="qr-info-text">
           Mostrando questo QR code all’operatore, la tua email verrà registrata e riceverai una conferma via email dell’accredito di 50 punti sul tuo account.
          </p>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
            <QRCodeSVG value={user.email} size={220} bgColor="#ffffff" fgColor="#0d47a1" />
            <button className="qr-button" onClick={addQrPoints}>🔓 Scansione QR (+50 punti)</button>
          </div>
        </div>

        <div className="rewards-section">
          <div className="rewards-grid">
            <div className="reward-box">
              <h4>🎁Premi riscattati</h4>
              {user.rewards?.length ? user.rewards.map((r,i)=><p key={i}>{r}</p>) : <p>❌ Nessun premio riscattato</p>}
            </div>
          </div>
        </div>

        <div className="chart-container">
          <Line data={chartData} options={chartOptions} />
        </div>
      </div>
    </div>
  );
};

export default FidelityCard;
