import React, { useState } from "react";
import "./ChoferModal.css";

const ChoferModal = ({ open, onClose, onSave }) => {
  const [nombre, setNombre] = useState("");
  const [contacto, setContacto] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(false);

  if (!open) return null;

  const handleSave = () => {
    onSave({ nombre, contacto });
    setShowConfirmation(true);
    setTimeout(() => {
      setShowConfirmation(false);
      onClose();
    }, 2000); // Cerrar el modal de confirmación después de 2 segundos
  };

  return (
    <div className="chofer-modal-bg">
      <div className="chofer-modal">
        <h4>Datos del Chofer</h4>
        <input
          type="text"
          placeholder="Nombre del chofer"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
        />
        <input
          type="text"
          placeholder="Contacto del chofer"
          value={contacto}
          onChange={(e) => setContacto(e.target.value)}
        />

        <div className="chofer-modal-btns">
          <button className="chofer-guardar" onClick={handleSave}>
            Guardar
          </button>
          <button className="chofer-cerrar" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
      {showConfirmation && (
        <div className="chofer-modal-bg">
          <div
            className="chofer-modal"
            style={{
              backgroundColor: "#4caf50",
              color: "#fff",
              textAlign: "center",
              padding: "20px",
              borderRadius: "12px",
            }}
          >
            <h4>¡Éxito!</h4>
            <p>Datos guardados correctamente.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChoferModal;
