import React from "react";

const ChoferDetalleModal = ({ open, chofer, onClose, onEdit }) => {
  if (!open) return null;

  console.log("Datos recibidos en ChoferDetalleModal:", chofer); // Verificar los datos recibidos

  return (
    <div
      className="modern-modal-bg"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.5)", color: "#000" }}
    >
      <div
        className="modern-modal"
        style={{
          backgroundColor: "#fff",
          borderRadius: "12px",
          padding: "20px",
          color: "#1e293b",
        }}
      >
        <h4 style={{ color: "#4f46e5", marginBottom: "16px" }}>
          Detalles del Chofer
        </h4>
        <div>
          <p style={{ marginBottom: "8px" }}>
            <b>Nombre:</b> {chofer?.nombre}
          </p>
          <p style={{ marginBottom: "8px" }}>
            <b>Teléfono:</b> {chofer?.telefono}
          </p>
        </div>
        <div style={{ display: "flex", gap: "1rem", marginTop: 16 }}>
          <button
            className="modern-agregar"
            style={{
              backgroundColor: "#4f46e5",
              color: "#fff",
              padding: "10px 20px",
              borderRadius: "8px",
              border: "none",
              cursor: "pointer",
            }}
            onClick={onEdit}
          >
            Editar
          </button>
          <button
            className="modern-cerrar"
            style={{
              backgroundColor: "#ef4444",
              color: "#fff",
              padding: "10px 20px",
              borderRadius: "8px",
              border: "none",
              cursor: "pointer",
            }}
            onClick={onClose}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChoferDetalleModal;
