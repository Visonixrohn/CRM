
import React, { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";
import Modal from "react-modal";
import "./Comisiones.css";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// Función utilitaria para calcular los días restantes del mes
function getDiasRestantesMes() {
  const hoy = new Date();
  const ultimoDia = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);
  return ultimoDia.getDate() - hoy.getDate();
}

// ...existing code...

// Reusable Card Component
const ComCard = ({ title, value, colorClass, icon, isNumberOnly }) => (
  <div className={`com-card ${colorClass}`}>
    <span className="com-card-icon">{icon}</span>
    <span className="com-card-title">{title}</span>
    <strong className="com-card-value">
      {isNumberOnly
        ? value
        : typeof value === "number"
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

  const [usuario, setUsuario] = useState(null);
  const [noData, setNoData] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Ahora usuario es texto, puedes usar un identificador local, correo o nombre
        let userId = localStorage.getItem("userId");
        if (!userId) {
          userId = prompt("Ingrese su identificador de usuario (ej: nombre o correo):");
          if (!userId) throw new Error("Debe ingresar un identificador de usuario.");
          localStorage.setItem("userId", userId);
        }
        setUsuario(userId);
        const { data, error } = await supabase
          .from("comisiones")
          .select("meta, comision_obtenida")
          .eq("usuario", userId)
          .single();
        if (error && error.code !== "PGRST116") {
          setError("Error al obtener datos de Supabase");
          console.error("Error al obtener datos de Supabase:", error);
        } else if (!data) {
          setNoData(true);
        } else {
          setMeta(data.meta);
          setComisionObtenida(data.comision_obtenida);
          setNoData(false);
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
  const hoy = new Date();
  const diasDelMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0).getDate();
  const diferenciaMeta = meta - comisionObtenida;
  const metaHoy = diasRestantes > 0 ? diferenciaMeta / diasRestantes : 0;
  const porcentajeAvance = meta > 0 ? (comisionObtenida / meta) * 100 : 0;
  let estadoActual = "";
  const montoProyectadoHoy = meta > 0 ? (hoy.getDate() / diasDelMes) * meta : 0;
  const montoAtrasado = Math.max(0, montoProyectadoHoy - comisionObtenida);
  if (porcentajeAvance < (hoy.getDate() / diasDelMes) * 100 - 5) {
    estadoActual = "Atrasado";
  } else if (porcentajeAvance > (hoy.getDate() / diasDelMes) * 100 + 5) {
    estadoActual = "Avanzado";
  } else {
    estadoActual = "Al día";
  }

  // Datos para la gráfica de avance
  const chartData = {
    labels: Array.from({ length: diasDelMes }, (_, i) => `${i + 1}`),
    datasets: [
      {
        label: "Meta acumulada",
        data: Array.from({ length: diasDelMes }, (_, i) => meta > 0 ? ((i + 1) / diasDelMes) * meta : 0),
        borderColor: "#6d28d9",
        backgroundColor: "rgba(109,40,217,0.1)",
        borderWidth: 2,
        pointRadius: 0,
        fill: false,
        tension: 0.2,
      },
      {
        label: "Comisión acumulada",
        data: Array.from({ length: diasDelMes }, (_, i) => (i + 1) === hoy.getDate() ? comisionObtenida : (i + 1) < hoy.getDate() ? (comisionObtenida / hoy.getDate()) * (i + 1) : null),
        borderColor: "#34d399",
        backgroundColor: "rgba(52,211,153,0.1)",
        borderWidth: 2,
        pointRadius: 0,
        fill: false,
        tension: 0.2,
      },
    ],
  };
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: true, position: "top" },
      title: { display: false },
      tooltip: { mode: "index", intersect: false },
    },
    scales: {
      x: { title: { display: true, text: "Día del mes" } },
      y: { title: { display: true, text: "Lempiras" }, beginAtZero: true },
    },
  };

  // Función para actualizar o insertar la comisión obtenida del usuario actual
  const upsertComisionObtenidaInSupabase = async (comisionValue) => {
    try {
      const { data } = await supabase
        .from("comisiones")
        .select("id")
        .eq("usuario", usuario)
        .single();

      const payload = { comision_obtenida: Number(comisionValue), usuario };
      if (data) {
        await supabase
          .from("comisiones")
          .update({ comision_obtenida: Number(comisionValue) })
          .eq("usuario", usuario);
      } else {
        await supabase.from("comisiones").insert(payload);
      }
    } catch (err) {
      console.error("Error en upsertComisionObtenidaInSupabase:", err);
      setError("Error al actualizar la comisión obtenida");
    }
  };

  const upsertMetaInSupabase = async (metaValue) => {
    try {
      const { data } = await supabase
        .from("comisiones")
        .select("id")
        .eq("usuario", usuario)
        .single();

      const payload = { meta: Number(metaValue), usuario };
      if (data) {
        await supabase
          .from("comisiones")
          .update({ meta: Number(metaValue) })
          .eq("usuario", usuario);
      } else {
        await supabase.from("comisiones").insert(payload);
      }
    } catch (err) {
      console.error("Error en upsertMetaInSupabase:", err);
      setError("Error al actualizar la meta");
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

  // Return principal del componente
  return (
    <>
      {loading ? (
        <div className="loading">Cargando datos...</div>
      ) : error ? (
        <div className="error">Error: {error}</div>
      ) : noData ? (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "80vh" }}>
          <button
            style={{ fontSize: 24, padding: "1em 2em", borderRadius: 8, background: "#007bff", color: "white", border: "none", cursor: "pointer" }}
            onClick={async () => {
              setLoading(true);
              setError(null);
              let userId = localStorage.getItem("userId");
              if (!userId) {
                userId = prompt("Ingrese su identificador de usuario (ej: nombre o correo):");
                if (!userId) {
                  setError("Debe ingresar un identificador de usuario.");
                  setLoading(false);
                  return;
                }
                localStorage.setItem("userId", userId);
              }
              const { error } = await supabase
                .from("comisiones")
                .insert({ meta: 0, comision_obtenida: 0, usuario: userId });
              if (error) {
                setError("Error al crear el espacio: " + error.message);
              } else {
                setNoData(false);
                setMeta(0);
                setComisionObtenida(0);
                setUsuario(userId);
              }
              setLoading(false);
            }}
          >
            Crear espacio
          </button>
          {error && <div style={{ color: "red", marginTop: 16 }}>{error}</div>}
        </div>
      ) : (
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
              title="Días Restantes  del Mes   "
              value={diasRestantes}
              colorClass="primary"
              icon="📆"
              isNumberOnly={true}
            />
            <ComCard
              title="Meta Diaria"
              value={metaHoy}
              colorClass="neutral"
              icon="📈"
            />
          </div>
          <div className="comisiones-actions-header" style={{ marginBottom: 24 }}>
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
          {/* Bloque de análisis visual */}
          <div className="comisiones-analisis-block" style={{
            width: "100%",
            maxWidth: 900,
            margin: "0 auto 2rem auto",
            background: "#fff",
            borderRadius: 16,
            boxShadow: "0 4px 16px rgba(0,0,0,0.07)",
            padding: "2rem 1rem",
            display: "flex",
            flexDirection: "column",
            alignItems: "center"
          }}>
            <h2 style={{ fontSize: "1.3rem", fontWeight: 600, marginBottom: 12, color: "#6d28d9" }}>Análisis del Mes</h2>
            <div
              className="analisis-cards-grid"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                gap: 16,
                width: "100%",
                marginBottom: 24,
                maxWidth: 700
              }}
            >
              <div className="analisis-card">
                <div className="analisis-card-title">Días del mes</div>
                <div className="analisis-card-value">{diasDelMes}</div>
              </div>
              <div className="analisis-card">
                <div className="analisis-card-title">Meta diaria</div>
                <div className="analisis-card-value">L{meta > 0 ? (meta / diasDelMes).toLocaleString("en-US", { minimumFractionDigits: 2 }) : "0.00"}</div>
              </div>
              <div className="analisis-card">
                <div className="analisis-card-title">Monto vendido</div>
                <div className="analisis-card-value">L{comisionObtenida.toLocaleString("en-US", { minimumFractionDigits: 2 })}</div>
              </div>
              <div className="analisis-card">
                <div className="analisis-card-title">Monto proyectado de hoy</div>
                <div className="analisis-card-value">L{montoProyectadoHoy.toLocaleString("en-US", { minimumFractionDigits: 2 })}</div>
              </div>
              <div className="analisis-card">
                <div className="analisis-card-title" style={{ color: "#f87171" }}>Monto atrasado</div>
                <div className="analisis-card-value" style={{ color: '#f87171' }}>L{montoAtrasado.toLocaleString("en-US", { minimumFractionDigits: 2 })}</div>
              </div>
              <div className="analisis-card">
                <div className="analisis-card-title">% de avance</div>
                <div className="analisis-card-value">{porcentajeAvance.toFixed(1)}%</div>
              </div>
              <div className="analisis-card">
                <div className="analisis-card-title">Estado actual</div>
                <div className="analisis-card-value" style={{ color: estadoActual === "Atrasado" ? "#f87171" : estadoActual === "Avanzado" ? "#34d399" : "#facc15" }}>{estadoActual}</div>
              </div>
            </div>
            <div className="analisis-chart-container">
              <Line data={chartData} options={chartOptions} />
            </div>
          </div>
          {/* Fin bloque de análisis visual */}
          <Modal
            isOpen={isModalOpen}
            onRequestClose={closeModal}
            contentLabel={`Actualizar ${currentAction === "meta" ? "Meta" : "Comisión Obtenida"}`}
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
                placeholder={`Ingrese ${currentAction === "meta" ? "la meta" : "la comisión obtenida"}`}
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
      )}
    </>
  );
}

export default Comisiones;
