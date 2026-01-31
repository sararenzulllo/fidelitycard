import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/OrdersList.css";

const OrdersList = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const email = localStorage.getItem("userEmail")?.toLowerCase();
  const API_URL = process.env.REACT_APP_API_URL || "";

  useEffect(() => {
    if (!email) {
      setLoading(false);
      return;
    }

    const fetchOrders = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/orders`, { params: { email } });
        setOrders(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Errore fetch ordini:", err);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();

    const interval = setInterval(fetchOrders, 5000); // auto refresh ordini ogni 5s
    return () => clearInterval(interval);
  }, [email, API_URL]);

  if (loading) return <p>⏳ Caricamento ordini...</p>;
  if (!email) return <p>❌ Utente non loggato</p>;

  return (
    <div className="orderslist-container">
      <h1 className="title">📦 Ordini Effettuati</h1>

      {orders.length === 0 ? (
        <p className="empty">Nessun ordine effettuato</p>
      ) : (
        <div className="orders-grid">
          {orders.map((order) => (
            <div key={order._id} className="order-card">
              <h3>Ordine #{order._id}</h3>
              <p>📅 {new Date(order.date).toLocaleDateString()}</p>
              <p>💰 Totale: €{order.total.toFixed(2)}</p>
              <p>⭐ Punti: {order.pointsEarned}</p>
              {order.usedReward && <p>🎁 Premio utilizzato: {order.usedReward}</p>}
              <div className="order-products">
                {order.products?.map((p, i) => (
                  <p key={i}>• {p.name} × {p.quantity || 1}</p>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="orders-buttons-wrapper">
        <div className="orders-buttons-container">
          <button onClick={() => navigate("/homepage")}>🏠 Home</button>
          <button onClick={() => navigate("/catalogo-prodotti")}>📦 Catalogo Prodotti</button>
          <button onClick={() => navigate("/ordini")}>🛒 Ordina Prodotti</button>
        </div>
      </div>
    </div>
  );
};

export default OrdersList;
