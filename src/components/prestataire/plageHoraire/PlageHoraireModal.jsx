// components/PlageHoraireModal.jsx
import React, { useState, useEffect } from "react";
import './plageHoraire.css'
const PlageHoraireModal = ({ show, onClose, serviceId, token }) => {
  const [plages, setPlages] = useState([]);
  const [form, setForm] = useState({
    jour: "lundi",
    heure_debut: "",
    heure_fin: "",
  });

  useEffect(() => {
    if (serviceId) {
      fetch(`http://localhost:5000/disponibilites/service/${serviceId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => setPlages(data))
        .catch((err) => console.error(err));
    }
  }, [serviceId, show]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAdd = async () => {
    const res = await fetch("http://localhost:5000/disponibilites", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ ...form, service_id: serviceId }),
    });
    const data = await res.json();
    if (res.ok) {
      setPlages([...plages, data.dispo]);
      setForm({ jour: "lundi", heure_debut: "", heure_fin: "" });
    } else {
      alert(data.message);
    }
  };

  if (!show) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>Plages horaires</h2>
        <div>
          <label>Jour</label>
          <select name="jour" value={form.jour} onChange={handleChange}>
            {[
              "lundi",
              "mardi",
              "mercredi",
              "jeudi",
              "vendredi",
              "samedi",
              "dimanche",
            ].map((j) => (
              <option key={j} value={j}>
                {j}
              </option>
            ))}
          </select>
          <label>Heure début</label>
          <input
            type="time"
            name="heure_debut"
            value={form.heure_debut}
            onChange={handleChange}
          />
          <label>Heure fin</label>
          <input
            type="time"
            name="heure_fin"
            value={form.heure_fin}
            onChange={handleChange}
          />
          <button onClick={handleAdd}>Ajouter</button>
        </div>
        <h4>Déjà ajoutées:</h4>
        <ul>
          {plages.map((p) => (
            <li key={p.id}>
              {p.jour} : {p.heure_debut} - {p.heure_fin}
            </li>
          ))}
        </ul>
        <div className="modal-footer">
          <button className="cancel" onClick={onClose}>
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlageHoraireModal;
