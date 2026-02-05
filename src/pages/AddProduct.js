import React, { useState } from "react";
import axios from "axios";
import "../styles/AddProduct.css";

const AddProduct = ({ fetchProducts }) => {
  const isLocal = !process.env.NODE_ENV || process.env.NODE_ENV === "development";

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [points, setPoints] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imageName, setImageName] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();       
    e.stopPropagation();       
    setSuccessMsg("");
    setErrorMsg("");

  
    if (!name || !price || !points || !description || (isLocal ? !imageFile : !imageName)) {
      setErrorMsg("❌ Compila tutti i campi!");
      return;
    }

    try {
      setLoading(true);

      if (isLocal) {
        const formData = new FormData();
        formData.append("name", name);
        formData.append("price", Number(price));
        formData.append("points", Number(points));
        formData.append("description", description);
        formData.append("image", imageFile);

        await axios.post("/api/products", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await axios.post("/api/products", {
          name,
          price: Number(price),
          points: Number(points),
          description,
          image: imageName,
        });
      }

      
      setName("");
      setPrice("");
      setPoints("");
      setDescription("");
      setImageFile(null);
      setImageName("");
      setSuccessMsg("✅ Prodotto aggiunto correttamente!");
      setErrorMsg("");

     
      if (fetchProducts) await fetchProducts();

    } catch (err) {
      console.error("Errore aggiunta prodotto:", err.response?.data || err.message);
      setErrorMsg("❌ Errore aggiunta prodotto. Controlla i dati e riprova.");
      setSuccessMsg("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-product-container">
      <h1>Aggiungi Prodotto</h1>

      {successMsg && <p className="success-msg">{successMsg}</p>}
      {errorMsg && <p className="error-msg">{errorMsg}</p>}

      <form onSubmit={handleSubmit} className="add-product-form">
        <input
          type="text"
          placeholder="Nome prodotto"
          value={name}
          onChange={e => setName(e.target.value)}
          required
        />

        <input
          type="number"
          placeholder="Prezzo"
          value={price}
          onChange={e => setPrice(e.target.value)}
          required
        />

        <input
          type="number"
          placeholder="Punti"
          value={points}
          onChange={e => setPoints(e.target.value)}
          required
        />

        <textarea
          placeholder="Descrizione"
          value={description}
          onChange={e => setDescription(e.target.value)}
          rows={4}
          required
        />

        {isLocal ? (
          <input
            type="file"
            accept="image/*"
            onChange={e => setImageFile(e.target.files[0])}
            required
          />
        ) : (
          <input
            type="text"
            placeholder="Nome immagine già presente in /public/images"
            value={imageName}
            onChange={e => setImageName(e.target.value)}
            required
          />
        )}

        <button type="submit" disabled={loading}>
          {loading ? "⏳ Aggiunta in corso..." : "Aggiungi Prodotto"}
        </button>
      </form>
    </div>
  );
};

export default AddProduct;
