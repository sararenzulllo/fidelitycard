import React, { useEffect, useState } from "react"; 
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/CatalogoPremi.css";

const CatalogoPremi = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [catalogo, setCatalogo] = useState([]);
  const [newPrizeName, setNewPrizeName] = useState("");
  const [newPrizePoints, setNewPrizePoints] = useState(0);
  const [newPrizeValidUntil, setNewPrizeValidUntil] = useState("");

  const email = localStorage.getItem("userEmail")?.toLowerCase();

  const fetchData = async () => {
    if (!email) { setLoading(false); return; }
    try {
      const [userRes, catalogRes] = await Promise.all([
        axios.get(`${process.env.REACT_APP_API_URL || ""}/api/users?email=${email}`), 
        axios.get(`${process.env.REACT_APP_API_URL || ""}/api/prizes`)
      ]);
      setUser(userRes.data);
      setCatalogo(catalogRes.data);
    } catch (err) {
      console.error(err);
      setUser(null);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [email]);

  const addPrize = async () => {
    if (!newPrizeName || newPrizePoints <= 0 || !newPrizeValidUntil) {
      alert("Inserisci tutti i dati del premio!");
      return;
    }
    try {
      const res = await axios.post(`${process.env.REACT_APP_API_URL || ""}/api/prizes`, {
        name: newPrizeName,
        pointsNeeded: Number(newPrizePoints.toFixed(2)),
        validUntil: newPrizeValidUntil
      });
      setCatalogo(prev => [...prev, res.data]);
      setNewPrizeName(""); 
      setNewPrizePoints(0); 
      setNewPrizeValidUntil("");
      alert("Premio aggiunto con successo!");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Errore durante aggiunta premio");
    }
  };

  const deletePrize = async (id) => {
    if (!window.confirm("Sei sicuro di voler eliminare questo premio?")) return;
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL || ""}/api/prizes?id=${id}`);
      setCatalogo(prev => prev.filter(p => p._id !== id));
      alert("Premio eliminato con successo!");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Errore eliminazione premio");
    }
  };

  if (loading) return <p style={{ textAlign: "center" }}>⏳ Caricamento catalogo...</p>;
  if (!email) return <p style={{ textAlign: "center", color: "red" }}>❌ Utente non loggato</p>;
  if (!user) return <p style={{ textAlign: "center", color: "red" }}>❌ Utente non trovato</p>;

  const validPrizes = catalogo.filter(p => new Date(p.validUntil) >= new Date());

  return (
    <div className="catalogo-page">
      <h1 className="catalogo-title">🎁 Catalogo Premi</h1>
      <p className="catalogo-punti">
        Punti disponibili: {Number(user.points).toFixed(2)}
      </p>

      <div className="add-prize-form">
        <input
          type="text"
          placeholder="Nome premio"
          value={newPrizeName}
          onChange={e => setNewPrizeName(e.target.value)}
        />
        <input
          type="number"
          placeholder="Punti necessari"
          value={newPrizePoints}
          onChange={e => setNewPrizePoints(e.target.value)}
        />
        <input
          type="date"
          value={newPrizeValidUntil}
          onChange={e => setNewPrizeValidUntil(e.target.value)}
        />
        <button className="add-prize-btn" onClick={addPrize}>➕ Aggiungi premio</button>
      </div>

      <div className="catalogo-grid">
        {validPrizes.map((premio) => {
          const ottenuto = user.rewards?.includes(premio.name);
          const raggiungibile = user.points >= premio.pointsNeeded;
          let badgeClass = "bloccato";
          if (ottenuto) badgeClass = "ottenuto";
          else if (raggiungibile) badgeClass = "disponibile";

          return (
            <div key={premio._id} className="catalogo-card">
              <h3>{premio.name}</h3>
              <p>🎯 {Number(premio.pointsNeeded).toFixed(2)} punti</p>
              <p className="validity">Valido fino a: {new Date(premio.validUntil).toLocaleDateString()}</p>
              <span className={`badge ${badgeClass}`}>
                {ottenuto ? "Ottenuto" : raggiungibile ? "Disponibile" : "Bloccato"}
              </span>
              <button className="delete-btn" onClick={() => deletePrize(premio._id)}>❌ Elimina premio</button>
            </div>
          );
        })}
      </div>

      <div className="catalogo-buttons-container">
        <button className="green-btn" onClick={() => navigate("/homepage")}>🏠 Home</button>
        <button className="green-btn" onClick={() => navigate("/riscatta-premio")}>🎁 Riscatta premio</button>
      </div>
    </div>
  );
};

export default CatalogoPremi;
