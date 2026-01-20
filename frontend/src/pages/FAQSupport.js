import React, { useState } from "react";
import axios from "axios";
import "../styles/FAQSupport.css";

const FAQSupport = () => {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [openIndex, setOpenIndex] = useState(null);
  const [confirmationMessage, setConfirmationMessage] = useState("");

  const faqs = [
    { 
      question: "Come posso accumulare punti?", 
      answer: "Accumuli punti ogni volta che effettui un acquisto nel nostro store. La quantità di punti dipende dall'importo speso." 
    },
    { 
      question: "Come posso riscattare i miei premi?", 
      answer: "Vai nella sezione 'Riscatta Premio' dalla dashboard, seleziona il premio desiderato e conferma il riscatto se hai abbastanza punti." 
    },
    { 
      question: "Come posso aggiornare i miei dati personali?", 
      answer: "Puoi aggiornare nome, email e password dalla dashboard utente, nella sezione 'Profilo'." 
    },
    { 
      question: "Cosa faccio se ho problemi con il mio account?", 
      answer: "Se riscontri problemi, puoi contattarci tramite il form di supporto qui sotto. Risponderemo il prima possibile." 
    },
    { 
      question: "Posso trasferire i miei punti ad un altro utente?", 
      answer: "Al momento non è possibile trasferire punti tra utenti. Ogni account accumula e gestisce i propri punti." 
    },
    { 
      question: "Quanto tempo ci vuole per aggiornare i punti dopo un acquisto?", 
      answer: "I punti vengono aggiornati automaticamente entro pochi minuti dall'acquisto completato." 
    },
    { 
      question: "Posso riscattare premi parzialmente con punti?", 
      answer: "No, ogni premio richiede il totale dei punti necessari per il riscatto. Non è possibile usare punti parziali." 
    },
    { 
      question: "Come faccio a sapere quanti punti ho accumulato?", 
      answer: "Puoi vedere il totale dei tuoi punti nella sezione 'Fidelity Card' della dashboard." 
    },
    { 
      question: "Cosa devo fare se non ricevo un premio riscattato?", 
      answer: "Contatta il supporto tramite il form qui sotto, fornendo i dettagli del premio e la data del riscatto. Ti aiuteremo a risolvere il problema." 
    }
  ];

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // ✅ Usa la variabile d'ambiente per Render
      await axios.post(`${process.env.REACT_APP_API_URL}/support`, formData);

      setFormData({ name: "", email: "", message: "" });

      // Mostra popup di conferma
      setConfirmationMessage("Messaggio inviato! Ti risponderemo al più presto.");
      setTimeout(() => setConfirmationMessage(""), 2500);

    } catch (err) {
      console.error(err);

      setConfirmationMessage("❌ Errore nell'invio del messaggio.");
      setTimeout(() => setConfirmationMessage(""), 2500);
    }
  };

  const toggleFAQ = (index) =>
    setOpenIndex(openIndex === index ? null : index);

  return (
    <div className="faq-container">

      {/* POPUP DI CONFERMA */}
      {confirmationMessage && (
        <div className="faq-popup">
          {confirmationMessage}
        </div>
      )}

      <h2>❓ FAQ & Supporto Clienti</h2>

      <div style={{ marginBottom: "50px" }}>
        {faqs.map((faq, i) => {
          const isOpen = openIndex === i;
          return (
            <div key={i} className="faq-item">
              <div
                className={`faq-question ${isOpen ? "open" : "closed"}`}
                onClick={() => toggleFAQ(i)}
              >
                {faq.question}
                <span className={isOpen ? "open" : ""}>+</span>
              </div>

              {isOpen && <div className="faq-answer">{faq.answer}</div>}
            </div>
          );
        })}
      </div>

      <h3>💬 Contatta il Supporto</h3>
      <form className="faq-form" onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          placeholder="Nome"
          value={formData.name}
          onChange={handleChange}
          required
        />

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
        />

        <textarea
          name="message"
          placeholder="Scrivi il tuo messaggio..."
          value={formData.message}
          onChange={handleChange}
          required
          rows={5}
        />

        <button type="submit">Invia Messaggio</button>
      </form>
    </div>
  );
};

export default FAQSupport;
