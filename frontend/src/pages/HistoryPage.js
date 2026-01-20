import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/HistoryPage.css";

const HistoryPage = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const email = localStorage.getItem("userEmail")?.toLowerCase();

  const fetchHistory = async () => {
    if (!email) {
      setError("Utente non loggato");
      setLoading(false);
      return;
    }

    try {
      const res = await axios.get(
        `http://localhost:5000/api/users/history/email/${email}`
      );
      setHistory(res.data || []);
    } catch (err) {
      console.error("Errore fetch storico:", err);
      setError("Impossibile caricare lo storico punti");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  if (loading) return <p className="loading">⏳ Caricamento storico...</p>;
  if (error) return <p className="error">❌ {error}</p>;

  const groupedByMonth = history.reduce((acc, item) => {
    const date = new Date(item.date);
    const key = `${date.getMonth() + 1}-${date.getFullYear()}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});

  return (
    <div className="history-container" >
      <h2>📜 Storico punti</h2>

      {history.length === 0 ? (
        <p>Nessun movimento punti</p>
      ) : (
        Object.keys(groupedByMonth).map((monthKey) => {
          const items = groupedByMonth[monthKey];
          const [month, year] = monthKey.split("-");
          return (
            <div key={monthKey} className="month-block">
              <h3>
                📅 {new Date(year, month - 1).toLocaleString("default", { month: "long" })} {year}
              </h3>
              <table>
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Descrizione</th>
                    <th>Punti</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((h, index) => (
                    <tr
                      key={index}
                      className={
                        h.points > 0
                          ? "green-row"
                          : h.action?.toLowerCase().includes("premio")
                          ? "yellow-row"
                          : ""
                      }
                    >
                      <td>{new Date(h.date).toLocaleDateString()}</td>
                      <td>{h.action || h.description}</td>
                      <td className="points">{h.points > 0 ? `+${h.points}` : h.points}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        })
      )}
    </div>
  );
};

export default HistoryPage;
