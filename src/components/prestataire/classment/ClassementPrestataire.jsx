import React, { useEffect, useState } from "react";
import "./classement.css";

const ClassementPrestataires = () => {
  const [classement, setClassement] = useState([]);

  useEffect(() => {
    const fetchClassement = async () => {
      try {
        const res = await fetch(
          "http://localhost:5000/prestataires/classement"
        );
        const data = await res.json();
        setClassement(data);
      } catch (err) {
        console.error("Erreur récupération classement:", err);
      }
    };

    fetchClassement();
  }, []);

  return (
    <div className="classement-container">
      <h2>🏆 Classement des Prestataires</h2>
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Nom</th>
            <th>Email</th>
            <th>Note Moyenne</th>
            <th>Nombre d'Avis</th>
          </tr>
        </thead>
        <tbody>
          {classement.map((entry, index) => {
            const prestataire = entry.PrestataireUser;
            return (
              <tr key={entry.prestataire_id}>
                <td>{index + 1}</td>
                <td>{prestataire?.fullName || "Inconnu"}</td>
                <td>{prestataire?.email || "Inconnu"}</td>
                <td>{parseFloat(entry.average_note).toFixed(2)} ⭐</td>
                <td>{entry.total_avis}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default ClassementPrestataires;
