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

  // Determina se siamo in locale
  const isLocal = !process.env.NODE_ENV || process.env.NODE_ENV === "development";

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get("/api/products");
        setProducts(res.data);

        const initialQuantities = {};
        res.data.forEach(p => (initialQuantities[p._id] = 1));
        setQuantities(initialQuantities);

      } catch (err) {
        console.error(err);
        setMessage("❌ Impossibile caricare i prodotti");
        setTimeout(() => setMessage(""), 3000);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const updateQuantity = (id, delta) => {
    setQuantities(prev => ({
      ...prev,
      [id]: Math.max(1, (prev[id] || 1) + delta)
    }));
  };

  const deleteProduct = async (id) => {
    if (!window.confirm("Sei sicuro di voler eliminare questo prodotto?")) return;
    try {
      await axios.delete(`/api/products/${id}`);
      setProducts(products.filter(p => p._id !== id));
      setMessage("✅ Prodotto eliminato!");
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      console.error(err);
      setMessage("❌ Errore eliminazione prodotto");
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const addToCart = (product) => {
    const qty = quantities[product._id] || 1;
    const storedCart = JSON.parse(localStorage.getItem("cart")) || [];
    const newCartItem = { ...product, quantity: qty };
    const newCart = [...storedCart, newCartItem];
    localStorage.setItem("cart", JSON.stringify(newCart));
    setMessage(`✅ "${product.name}" aggiunto al carrello (x${qty})!`);
    setTimeout(() => setMessage(""), 3000);
  };

  if (loading) return <p className="loading">⏳ Caricamento prodotti...</p>;

  return (
    <div className="products-container">
      <h1>📦 Catalogo Prodotti</h1>

      <button className="add-btn" onClick={() => navigate("/aggiungi-prodotto")}>
        ➕ Aggiungi prodotto
      </button>

      {message && <div className="page-message">{message}</div>}

      <div className="products-table">
        {products.map((p, i) => (
          <div key={p._id} className={`product-row ${i % 2 === 0 ? "even" : "odd"}`}>
            <div className="product-image">
              {p.image && (
                <img
                  src={isLocal ? `/images/${p.image}` : `/images/${p.image}`}
                  alt={p.name}
                  width={150}
                />
              )}
            </div>
            <div className="product-info">
              <h2>{p.name}</h2>
              <p>{p.description}</p>
            </div>
            <div className="product-stats">
              <p>💰 Prezzo: <span className="stat-value price">€{p.price}</span></p>
              <p>⭐ Punti: <span className="stat-value points">{p.points}</span></p>
            </div>
            <div className="product-actions">
              <button onClick={() => deleteProduct(p._id)}>Elimina</button>

              <div className="quantity-controls">
                <button onClick={() => updateQuantity(p._id, -1)}>−</button>
                <span>{quantities[p._id] || 1}</span>
                <button onClick={() => updateQuantity(p._id, 1)}>+</button>
              </div>

              <button className="add-to-cart-btn" onClick={() => addToCart(p)}>
                🛒 Aggiungi al carrello
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Products;
