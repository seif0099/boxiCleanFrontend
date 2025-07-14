import React, { useEffect, useState } from "react";
import "./modal.css"; // Make sure this file styles the modal properly

const ServiceModal = ({ show, onClose, onSave, serviceToEdit }) => {
  const [formData, setFormData] = useState({
    nom_service: "",
    description: "",
    prix_base: "",
    duree_estimee: "",
    disponibilite: "",
    ville: "",
    region: "",
  });

  useEffect(() => {
    if (serviceToEdit) {
      setFormData({
        nom_service: serviceToEdit.nom_service || "",
        description: serviceToEdit.description || "",
        prix_base: serviceToEdit.prix_base || "",
        duree_estimee: serviceToEdit.duree_estimee || "",
        disponibilite: serviceToEdit.disponibilite || "",
        ville: serviceToEdit.ville || "",
        region: serviceToEdit.region || "",
      });
    } else {
      setFormData({
        nom_service: "",
        description: "",
        prix_base: "",
        duree_estimee: "",
        disponibilite: "",
        ville: "",
        region: "",
      });
    }
  }, [serviceToEdit]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData, serviceToEdit?.id);
  };

  if (!show) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>{serviceToEdit ? "Modifier le service" : "Ajouter un service"}</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="nom_service"
            placeholder="Nom du service"
            value={formData.nom_service}
            onChange={handleChange}
            required
          />
          <textarea
            name="description"
            placeholder="Description"
            value={formData.description}
            onChange={handleChange}
            required
          ></textarea>
          <input
            type="number"
            name="prix_base"
            placeholder="Prix de base"
            value={formData.prix_base}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="duree_estimee"
            placeholder="Durée estimée"
            value={formData.duree_estimee}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="disponibilite"
            placeholder="Disponibilité"
            value={formData.disponibilite}
            onChange={handleChange}
          />
          <input
            type="text"
            name="ville"
            placeholder="Ville"
            value={formData.ville}
            onChange={handleChange}
          />
          <input
            type="text"
            name="region"
            placeholder="Région"
            value={formData.region}
            onChange={handleChange}
          />

          <div className="modal-actions">
            <button type="submit">
              {serviceToEdit ? "Mettre à jour" : "Créer"}
            </button>
            <button type="button" onClick={onClose} className="cancel-btn">
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ServiceModal;
