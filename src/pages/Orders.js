import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/Orders.css";

const Orders = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [appliedReward, setAppliedReward] = useState(null);

  const email = localStorage.getItem("userEmail")?.toLowerCase();
  const API_URL = process.env.REACT_APP_API_URL || "";

  useEffect(() => {
    const fetchUser = async () => {
      if (!email) { setLoading(false); return; }
      try {
        const res = await axios.get(`${API_URL}/api/users?email=${email}`);
        setUser(res.data);
        const storedCart = JSON.parse(localStorage.getItem("cart")) || [];
        setCart(storedCart);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [email, API_URL]);

  const removeFromCart = (index) => {
    const newCart = cart.filter((_, i) => i !== index);
    setCart(newCart);
    localStorage.setItem("cart", JSON.stringify(newCart));
  };


  const applyReward = (reward) => {
    if (appliedReward?.name === reward.name) {
      setAppliedReward(null);
      setMessage("❌ Premio rimosso");
      setTimeout(() => setMessage(""), 3000);
      return;
    }

    if (reward.type === "discount" && user.rewards?.includes(reward.name)) {
      setMessage("❌ Sconto già usato!");
      setTimeout(() => setMessage(""), 3000);
      return;
    }

    setAppliedReward(reward);
    setMessage(`✅ Premio applicato: ${reward.name}`);
    setTimeout(() => setMessage(""), 3000);
  };

  const totalPoints = cart.reduce((acc, p) => acc + Number(p.points || 0), 0);
  const totalPrice = cart.reduce((acc, p) => acc + Number(p.price || 0), 0);
  const finalPrice = appliedReward?.type === "discount"
    ? totalPrice * (1 - appliedReward.value / 100)
    : totalPrice;

  const confirmOrder = async () => {
    if (!user || !cart.length) return;

    try {
      const resUser = await axios.put(`${API_URL}/api/users?email=${email}`, {
        order: {
          products: cart,
          pointsEarned: totalPoints,
          usedReward: appliedReward?.name || null
        }
      });

      setUser(resUser.data.user);

      await axios.post(`${API_URL}/api/orders`, {
        utente: email,
        products: cart,
        total: finalPrice,
        pointsEarned: totalPoints
      });


      setCart([]);
      setAppliedReward(null);
      localStorage.removeItem("cart");

      setMessage(`🎉 Ordine confermato! Punti guadagnati: ${totalPoints}`);
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.message || "❌ Errore conferma ordine");
    }
  };

  if (loading) return <p className="loading">⏳ Caricamento...</p>;
  if (!email) return <p className="error">❌ Devi fare il login</p>;
  if (!user) return <p className="error">❌ Utente non trovato</p>;

  return (
    <div className="orders-container">
      <h1>🛒 Carrello</h1>
      {message && <div className="page-message">{message}</div>}

      {cart.length === 0 ? (
        <p className="empty-cart">Carrello vuoto</p>
      ) : (
        <div className="cart-container">
          <ul>
            {cart.map((item, i) => (
              <li key={i}>
                <div className="cart-item-info">
                  <span className="cart-item-name">{item.name}</span>
                  <div className="cart-item-details">
                    <span>{item.points} punti</span>
                    <span>€{Number(item.price || 0).toFixed(2)}</span>
                  </div>
                </div>
                <button className="remove-btn" onClick={() => removeFromCart(i)}>×</button>
              </li>
            ))}
          </ul>

          <p>Totale punti: <strong>{totalPoints}</strong></p>
          <p>Totale prezzo: <strong>{finalPrice.toFixed(2)}</strong></p>
          <button className="confirm-btn" onClick={confirmOrder}>✅ Conferma ordine</button>
        </div>
      )}

      {user.rewards?.length > 0 && (
        <div className="rewards-apply">
          <p>🎁 Premi riscattabili:</p>
          <div className="rewards-list">
            {user.rewards.map((r, i) => {
              const rewardObj = r.includes("Sconto") 
                ? { name: r, type: "discount", value: parseInt(r.match(/\d+/)[0]) } 
                : { name: r, type: "gift" };
              return (
                <button
                  key={i}
                  className={`reward-btn ${appliedReward?.name === rewardObj.name ? "selected-reward" : ""}`}
                  onClick={() => applyReward(rewardObj)}
                >
                  {r}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="orders-buttons-wrapper">
        <div className="orders-buttons-container">
          <button onClick={() => navigate("/homepage")}>🏠 Home</button>
          <button onClick={() => navigate("/catalogo-prodotti")}>📦 Catalogo</button>
          <button onClick={() => navigate("/orders-list")}>📋 Lista Ordini</button>
        </div>
      </div>
    </div>
  );
};

export default Orders;
