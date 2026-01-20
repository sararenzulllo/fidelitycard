import React, { useState } from "react"; 
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../styles/Auth.css";

const Register = ({ setIsLoggedIn }) => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Le password non coincidono");
      return;
    }

    try {
      const res = await axios.post("http://localhost:5000/api/auth/register", {
        name,
        email: email.toLowerCase(),
        password,
      });

      if (res.data?.message === "Registrazione riuscita") {
        localStorage.setItem("userEmail", email.toLowerCase());
        setIsLoggedIn(true);
        toast.success("Registrazione effettuata con successo!");
        navigate("/homepage");
      } else {
        toast.error(res.data?.message || "Errore nella registrazione");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Errore nella registrazione");
    }
  };

  return (
    <div className="auth-page">
      <ToastContainer />
      <div className="auth-card">
        <h2>Registrazione</h2>
        <form onSubmit={handleRegister}>
          <input
            type="text"
            placeholder="Nome"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Conferma Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          <button type="submit">Registrati</button>
        </form>
        <p className="register-text">
          Hai già un account? <span onClick={() => navigate("/login")}>Accedi</span>
        </p>
      </div>
    </div>
  );
};

export default Register;
