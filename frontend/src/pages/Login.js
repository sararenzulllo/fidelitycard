import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../styles/Auth.css";

const Login = ({ setIsLoggedIn }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", {
        email: email.toLowerCase(),
        password,
      });

      const userEmail = res.data?.email || res.data?.user?.email;
      if (userEmail) {
        localStorage.setItem("userEmail", userEmail.toLowerCase());
        setIsLoggedIn(true);
        toast.success("Login effettuato con successo!");
        navigate("/homepage");
      } else {
        toast.error("Errore nel login");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Errore nel login");
    }
  };

  return (
    <div className="auth-page">
      <ToastContainer />
      <div className="auth-card">
        <h2>Login</h2>
        <form onSubmit={handleLogin}>
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <button type="submit">Login</button>
        </form>
        <p className="register-text">
          Non sei registrato? <span onClick={() => navigate("/register")}>Registrati</span>
        </p>
      </div>
    </div>
  );
};

export default Login;
