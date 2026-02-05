import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/Products.css";

const Products = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [quantities, setQuantities] = useState({});

  const fetchProducts = async () => {
    try {
      const res = await axios.get("/api/products");
      setProducts(res.data);

      const initialQuantities = {};
      res.data.forEach(p => (initialQuantities[p._id] = 1));
      setQuantities(initialQuantities);
    } catch (err) {
      setMessage("❌ Errore caricamento prodotti");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const updateQuantity = (id, delta) => {
    setQuantities(prev => ({
      ...prev,
      [id]: Math.max(1, (prev[id] || 1) + delta)
    }));
  };

  const addToCart = (product) => {
    const qty = quantities[product._id] || 1;
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    cart.push({ ...product, quantity: qty });
    localStorage.setItem("cart", JSON.stringify(cart));

    setMessage(`✅ ${product.name} aggiunto al carrello`);
    setTimeout(() => setMessage(""), 3000);
  };

  if (loading) return <p className="loading">⏳ Caricamento...</p>;

  return (
    <div className="products-page">
      <h1 className="products-title">🛒 Catalogo Prodotti</h1>

      <button
        className="add-btn"
        onClick={() => navigate("/aggiungi-prodotto")}
      >
        ➕ Aggiungi Prodotto
      </button>

      {message && <div className="page-message">{message}</div>}

      <div className="products-card">
        <div className="products-grid">
          {products.map(p => (
            <div key={p._id} className="product-item">
              {p.image && (
                <img
                  src={`/images/${p.image}`}
                  alt={p.name}
                  className="product-img"
                />
              )}

              <h2>{p.name}</h2>
              <p className="desc">{p.description}</p>

              <div className="stats">
                <span>💰 €{p.price}</span>
                <span>⭐ {p.points} punti</span>
              </div>

              <div className="quantity-controls">
                <button onClick={() => updateQuantity(p._id, -1)}>−</button>
                <span>{quantities[p._id]}</span>
                <button onClick={() => updateQuantity(p._id, 1)}>+</button>
              </div>

              <button
                className="add-cart"
                onClick={() => addToCart(p)}
              >
                🛒 Aggiungi
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="bottom-buttons">
        <button onClick={() => navigate("/")}>🏠 Home</button>
        <button onClick={() => navigate("/ordini")}>📦 Ordina</button>
        <button onClick={() => navigate("/orders-list")}>📝 Ordini</button>
      </div>
    </div>
  );
};

export default Products;
