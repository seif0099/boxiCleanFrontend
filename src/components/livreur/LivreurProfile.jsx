import React, { useEffect, useState } from "react";
import axios from "axios";
import "./livreurProfile.css";

const LivreurProfile = () => {
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    nom: "",
    prenom: "",
    telephone: "",
    adresse: "",
    ville: "",
    code_postal: "",
    type_vehicule: "",
    numero_vehicule: "",
    zone_livraison: "",
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await axios.get("http://localhost:5000/livreur/profil", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setProfile(res.data);
      setForm({
        nom: res.data.nom || "",
        prenom: res.data.prenom || "",
        telephone: res.data.telephone || "",
        adresse: res.data.adresse || "",
        ville: res.data.ville || "",
        code_postal: res.data.code_postal || "",
        type_vehicule: res.data.type_vehicule || "",
        numero_vehicule: res.data.numero_vehicule || "",
        zone_livraison: res.data.zone_livraison || "",
      });
    } catch (err) {
      console.error("Erreur chargement profil livreur:", err);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleUpdate = async () => {
    try {
      await axios.put("http://localhost:5000/livreur/profil", form, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setEditing(false);
      fetchProfile();
    } catch (err) {
      console.error("Erreur mise à jour profil livreur:", err);
    }
  };

  if (!profile) return <p>Chargement du profil...</p>;

  return (
    <div className="livreur-profile-container">
      <h2>👤 Mon Profil Livreur</h2>
      <div className="livreur-profile-fields">
        {[
          ["nom", "Nom"],
          ["prenom", "Prénom"],
          ["telephone", "Téléphone"],
          ["adresse", "Adresse"],
          ["ville", "Ville"],
          ["code_postal", "Code Postal"],
          ["zone_livraison", "Zone de Livraison"],
          ["type_vehicule", "Type de Véhicule"],
          ["numero_vehicule", "Numéro de Véhicule"],
        ].map(([field, label]) => (
          <div key={field}>
            <label>{label} :</label>
            {editing ? (
              <input name={field} value={form[field]} onChange={handleChange} />
            ) : (
              <p>{profile[field] || "Non renseigné(e)"}</p>
            )}
          </div>
        ))}
      </div>
      {editing ? (
        <div className="livreur-profile-actions">
          <button onClick={handleUpdate}>💾 Enregistrer</button>
          <button onClick={() => setEditing(false)}>❌ Annuler</button>
        </div>
      ) : (
        <button onClick={() => setEditing(true)}>✏️ Modifier mes infos</button>
      )}
    </div>
  );
};

export default LivreurProfile;
