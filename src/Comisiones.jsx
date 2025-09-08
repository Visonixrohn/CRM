import React, { useState, useEffect } from "react";
import "./Comisiones.css";
// import { Line } from "react-chartjs-2";
// import {
//   Chart as ChartJS,
//   CategoryScale,
//   LinearScale,
//   PointElement,
//   LineElement,
//   Title,
//   Tooltip,
//   Legend,
// } from "chart.js";
import { supabase } from "./supabaseClient";
import Modal from "react-modal";

// ChartJS.register(
//   CategoryScale,
//   LinearScale,
//   PointElement,
//   LineElement,
//   Title,
//   Tooltip,
//   Legend
// );

// Set app element for react-modal
Modal.setAppElement("#root");

function getDiasRestantesMes() {
  const hoy = new Date();
  const ultimoDia = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);
  return ultimoDia.getDate() - hoy.getDate();
}

// Reusable Card Component
const ComCard = ({ title, value, colorClass, icon }) => (
  <div className={`com-card ${colorClass}`}>
    <span className="com-card-icon">{icon}</span>
    <span className="com-card-title">{title}</span>
    <strong className="com-card-value">
      {typeof value === "number"
        ? `L${value.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`
        : value}
    </strong>
  </div>
);

// Reusable Button Component
const ActionButton = ({ onClick, label, icon }) => (
  <button className="header-round-btn" onClick={onClick} title={label}>
    {icon} {label}
  </button>
);

const Comisiones = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalInputValue, setModalInputValue] = useState("");
  const [currentAction, setCurrentAction] = useState(null);
  const [meta, setMeta] = useState(0);
  const [comisionObtenida, setComisionObtenida] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("comisiones")
          .select("meta, comision_obtenida")
          .eq("id", 1)
          .single();

        if (error && error.code !== "PGRST116") {
          setError("Error al obtener datos de Supabase");
          console.error("Error al obtener datos de Supabase:", error);
        } else if (!data) {
          // Si no existe el registro, lo crea con valores por defecto
          await supabase.from("comisiones").insert({ id: 1, meta: 0, comision_obtenida: 0 });
          setMeta(0);
          setComisionObtenida(0);
        } else {
          setMeta(data.meta);
          setComisionObtenida(data.comision_obtenida);
        }
      } catch (err) {
        setError("Error inesperado al obtener datos");
        console.error("Error inesperado al obtener datos:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const diasRestantes = getDiasRestantesMes();
  const diferenciaMeta = meta - comisionObtenida;
  const metaHoy = diasRestantes > 0 ? diferenciaMeta / diasRestantes : 0;



  const upsertMetaInSupabase = async (metaValue) => {
    try {
      const { data, error } = await supabase
        .from("comisiones")
        .select("id")
        .eq("id", 1)
        .single();

      if (error && error.code !== "PGRST116") throw error;

      const payload = {
        id: 1,
        meta: Number(metaValue),
        comision_obtenida: comisionObtenida,
      };
      if (data) {
        await supabase
          .from("comisiones")
          .update({ meta: Number(metaValue) })
          .eq("id", 1);
      } else {
        await supabase.from("comisiones").upsert(payload);
      }
    } catch (err) {
      console.error("Error en upsertMetaInSupabase:", err);
      setError("Error al actualizar la meta");
    }
  };

  const upsertComisionObtenidaInSupabase = async (comisionValue) => {
    try {
      const { data, error } = await supabase
        .from("comisiones")
        .select("id")
        .eq("id", 1)
        .single();

      if (error && error.code !== "PGRST116") throw error;

      const payload = { id: 1, meta, comision_obtenida: Number(comisionValue) };
      if (data) {
        await supabase
          .from("comisiones")
          .update({ comision_obtenida: Number(comisionValue) })
          .eq("id", 1);
      } else {
        await supabase.from("comisiones").upsert(payload);
      }
    } catch (err) {
      console.error("Error en upsertComisionObtenidaInSupabase:", err);
      setError("Error al actualizar la comisión obtenida");
    }
  };

  const openModal = (action) => {
    setCurrentAction(action);
    setModalInputValue("");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalInputValue("");
    setCurrentAction(null);
  };

  const handleModalSave = async () => {
    if (!modalInputValue || modalInputValue < 0) {
      setError("Por favor, ingrese un valor válido");
      return;
    }
    if (currentAction === "meta") {
      await upsertMetaInSupabase(modalInputValue);
      setMeta(Number(modalInputValue));
    } else if (currentAction === "comision") {
      await upsertComisionObtenidaInSupabase(modalInputValue);
      setComisionObtenida(Number(modalInputValue));
    }
    closeModal();
  };

  if (loading) {
    return <div className="loading">Cargando datos...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  return (
    <div className="comisiones-container">
      <header className="comisiones-header">
        <h1 className="comisiones-title">📊 Dashboard de Comisiones</h1>
      </header>

      <div className="comisiones-cards-grid">
        <ComCard title="Meta" value={meta} colorClass="meta" icon="🎯" />
        <ComCard
          title="Comisión Obtenida"
          value={comisionObtenida}
          colorClass="success"
          icon="💵"
        />
        <ComCard
          title="Diferencia a Meta"
          value={diferenciaMeta}
          colorClass="danger"
          icon="📊"
        />
        <ComCard
          title="Días Restantes"
          value={diasRestantes}
          colorClass="primary"
          icon="📆"
        />
        <ComCard
          title="Meta Diaria"
          value={metaHoy}
          colorClass="neutral"
          icon="📈"
        />
      </div>

      <div className="comisiones-actions-header">
        <ActionButton
          onClick={() => openModal("meta")}
          label="Actualizar Meta"
          icon="🎯"
        />
        <ActionButton
          onClick={() => openModal("comision")}
          label="Actualizar Comisión"
          icon="💵"
        />
      </div>



      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        contentLabel={`Actualizar ${
          currentAction === "meta" ? "Meta" : "Comisión Obtenida"
        }`}
        className="modal-content"
        overlayClassName="modal-overlay"
      >
        <h2>
          Actualizar {currentAction === "meta" ? "Meta" : "Comisión Obtenida"}
        </h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleModalSave();
          }}
        >
          <input
            type="number"
            value={modalInputValue}
            onChange={(e) => setModalInputValue(e.target.value)}
            placeholder={`Ingrese ${
              currentAction === "meta" ? "la meta" : "la comisión obtenida"
            }`}
            min="0"
            step="0.01"
            required
            className="modal-input"
          />
          {error && <p className="modal-error">{error}</p>}
          <div className="modal-buttons">
            <button type="submit" className="modal-button save">
              Guardar
            </button>
            <button
              type="button"
              onClick={closeModal}
              className="modal-button cancel"
            >
              Cancelar
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Comisiones;
