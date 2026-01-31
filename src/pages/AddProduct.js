import React, { useState } from "react";
import axios from "axios";
import "../styles/AddProduct.css";

const AddProduct = () => {
  const isLocal = !process.env.NODE_ENV || process.env.NODE_ENV === "development";

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [points, setPoints] = useState("");
  const [quantity, setQuantity] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState(null);  // per locale
  const [imageName, setImageName] = useState("");    // per produzione
  const [successMsg, setSuccessMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (isLocal) {
        if (!imageFile) return alert("Seleziona un'immagine!");
        const formData = new FormData();
        formData.append("name", name);
        formData.append("price", Number(price));
        formData.append("points", Number(points));
        formData.append("quantity", Number(quantity));
        formData.append("description", description);
        formData.append("image", imageFile);

        await axios.post("/api/products", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        if (!imageName) return alert("Inserisci il nome dell'immagine già presente in /public/images!");
        await axios.post("/api/products", {
          name,
          price: Number(price),
          points: Number(points),
          quantity: Number(quantity),
          description,
          image: imageName,
        });
      }

      // Reset form
      setName("");
      setPrice("");
      setPoints("");
      setQuantity("");
      setDescription("");
      setImageFile(null);
      setImageName("");
      setSuccessMsg("Prodotto aggiunto correttamente!");
      setTimeout(() => setSuccessMsg(""), 3000);

    } catch (err) {
      console.error(err);
      alert("Errore aggiunta prodotto");
    }
  };

  return (
    <div className="add-product-container">
      <h1>Aggiungi Prodotto</h1>
      {successMsg && <p className="success-msg">{successMsg}</p>}

      <form onSubmit={handleSubmit} className="add-product-form">
        <input type="text" placeholder="Nome prodotto" value={name} onChange={e => setName(e.target.value)} required />
        <input type="number" placeholder="Prezzo" value={price} onChange={e => setPrice(e.target.value)} required />
        <input type="number" placeholder="Punti" value={points} onChange={e => setPoints(e.target.value)} required />
        <input type="number" placeholder="Quantità" value={quantity} onChange={e => setQuantity(e.target.value)} required />
        <textarea placeholder="Descrizione" value={description} onChange={e => setDescription(e.target.value)} rows={3} />

        {isLocal ? (
          <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files[0])} required />
        ) : (
          <input type="text" placeholder="Nome immagine già presente in /public/images" value={imageName} onChange={e => setImageName(e.target.value)} required />
        )}

        <button type="submit">Aggiungi Prodotto</button>
      </form>
    </div>
  );
};

export default AddProduct;
