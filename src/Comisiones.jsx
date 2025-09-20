
import React, { useState, useEffect } from "react";
import useClientesNuevos from "./useClientesNuevos";
import useGestionResumen from "./useGestionResumen";
import useClientesParaHoy from "./useClientesParaHoy";
import useActualizaciones from "./useActualizaciones";
import { supabase } from "./supabaseClient";
import Modal from "react-modal";
import "./Comisiones.css";
import ComisionesMobileCards from "./ComisionesMobileCards";
import { Doughnut } from "react-chartjs-2";
import ComCard from "./ComCard";
import "./ComCard.css";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

// Registro de elementos de Chart.js
ChartJS.register(ArcElement, Tooltip, Legend);
// Función utilitaria para calcular los días restantes del mes
function getDiasRestantesMes() {
  const hoy = new Date();
  const ultimoDia = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);
  return ultimoDia.getDate() - hoy.getDate();
     return value}

// Reusable Button Component
const ActionButton = ({ onClick, label, icon }) => (
  <button className="header-round-btn" onClick={onClick} title={label}>
    {icon} {label}
  </button>
);

const Comisiones = ({ setPage }) => {
  // Función para actualizar o insertar el gasto mensual del usuario actual
  const upsertGastoMensualInSupabase = async (gastoValue) => {
    try {
      const { data } = await supabase
        .from("comisiones")
        .select("id")
        .eq("usuario", usuario)
        .single();

      const payload = { gasto_mensual: Number(gastoValue), usuario };
      if (data) {
        await supabase
          .from("comisiones")
          .update({ gasto_mensual: Number(gastoValue) })
          .eq("usuario", usuario);
      } else {
        await supabase.from("comisiones").insert(payload);
      }
    } catch (err) {
      console.error("Error en upsertGastoMensualInSupabase:", err);
      setError("Error al actualizar el gasto mensual");
    }
  };
  // Tarjetas de gestión
  const [update, setUpdate] = useState(0);
  const { total, gestionadosHoy } = useGestionResumen(update);
  const pendientes = total - gestionadosHoy;
  // Clientes para hoy (estado Gestionado y fecha hoy)
  const { cantidad: clientesParaHoy, loading: loadingClientesParaHoy, error: errorClientesParaHoy } = useClientesParaHoy();
  // --- Lógica para obtener entregas pendientes del usuario actual ---
  // Estado para cards de entregas
  const [entregasPendientes, setEntregasPendientes] = useState([]);
  const [entregasPendientesAtrasadas, setEntregasPendientesAtrasadas] = useState(0);
  const [entregasParaHoy, setEntregasParaHoy] = useState(0);
  const [entregasNoGestionadas, setEntregasNoGestionadas] = useState(0);
  useEffect(() => {
    async function fetchEntregasPendientes() {
      let userId = localStorage.getItem("userId");
      if (!userId) return;
      try {
        const { data, error } = await supabase
          .from("entregas_pendientes")
          .select("id, fecha_entrega, estatus, gestionada")
          .eq("usuario_id", userId);
        if (error) return;
        setEntregasPendientes(data);
        // Calcular atrasadas, para hoy y no gestionadas
        const hoy = new Date();
        const yyyy = hoy.getFullYear();
        const mm = String(hoy.getMonth() + 1).padStart(2, '0');
        const dd = String(hoy.getDate()).padStart(2, '0');
        const hoyStr = `${yyyy}-${mm}-${dd}`;
        setEntregasPendientesAtrasadas(data.filter(e => e.fecha_entrega < hoyStr && String(e.estatus).toLowerCase() !== 'entregado').length);
        setEntregasParaHoy(data.filter(e => e.fecha_entrega === hoyStr && String(e.estatus).toLowerCase() !== 'entregado').length);
        setEntregasNoGestionadas(data.filter(e => (e.gestionada || '').toLowerCase() === 'no gestionada' && String(e.estatus).toLowerCase() !== 'entregado').length);
      } catch (e) {}
    }
    fetchEntregasPendientes();
  }, []);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalInputValue, setModalInputValue] = useState("");
  const [currentAction, setCurrentAction] = useState(null);
  const [meta, setMeta] = useState(0);
  const [comisionObtenida, setComisionObtenida] = useState(0);
  const [gastoMensual, setGastoMensual] = useState(0);
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
        // Si no hay nombre en localStorage, buscarlo en Supabase
        let nombre = localStorage.getItem("nombre");
        if (!nombre && userId) {
          const { data: profile, error: errorProfile } = await supabase
            .from("profiles")
            .select("nombre")
            .eq("id", userId)
            .maybeSingle();
          if (profile && profile.nombre) {
            localStorage.setItem("nombre", profile.nombre);
          }
        }
        const { data, error } = await supabase
          .from("comisiones")
          .select("meta, comision_obtenida, gasto_mensual")
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
          setGastoMensual(data.gasto_mensual || 0);
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
    } else if (currentAction === "gasto_mensual") {
      await upsertGastoMensualInSupabase(modalInputValue);
      setGastoMensual(Number(modalInputValue));
    }
    closeModal();
  };

  // Obtener datos de clientes nuevos y actualizaciones
  const { clientes: clientesNuevos = [] } = useClientesNuevos();
  const { datos: actualizaciones = [] } = useActualizaciones();
  const clientesNuevosSinTomar = clientesNuevos.filter(c => c.STATUS !== "Tomado").length;
  const actualizacionesSinTomar = actualizaciones.filter(a => a.STATUS !== "Tomado").length;

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
            <h1 className="comisiones-title">
              {(() => {
                // Saludo dinámico según la hora
                const hora = new Date().getHours();
                let saludo = "Hola";
                if (hora >= 5 && hora < 12) saludo = "Buenos días";
                else if (hora >= 12 && hora < 19) saludo = "Buenas tardes";
                else saludo = "Buenas noches";
                // Buscar nombre real del usuario si está en localStorage
                let nombre = localStorage.getItem("nombre");
                // Si no hay nombre, usar el identificador
                if (!nombre && usuario) nombre = usuario;
                return `${saludo}${nombre ? ", " + nombre : ""}. El avance de tus resultados económicos son estos:`;
              })()}
            </h1>
          </header>
          {/* Cards para mobile y desktop */}
          <div className="comisiones-cards-responsive">
            <div className="comisiones-cards-desktop">
              <ComCard title="Meta" value={`L${meta.toLocaleString('en-US', { minimumFractionDigits: 2 })}`} icon="🎯" />
              <ComCard title="Comisión Obtenida" value={`L${comisionObtenida.toLocaleString('en-US', { minimumFractionDigits: 2 })}`} icon="💵" />
              <ComCard title="Diferencia a Meta" value={`L${diferenciaMeta.toLocaleString('en-US', { minimumFractionDigits: 2 })}`} icon="📊" />
              <ComCard title="Días Restantes del Mes" value={diasRestantes} icon="📆" />
              <ComCard title="Meta Diaria" value={`L${metaHoy.toLocaleString('en-US', { minimumFractionDigits: 2 })}`} icon="📈" />
              <ComCard title="Mi gasto mensual" value={`L${gastoMensual.toLocaleString('en-US', { minimumFractionDigits: 2 })}`} icon="💳" />
              <ComCard title="Clientes Gestionados" value={gestionadosHoy} icon="✅" />
              <ComCard title="Clientes Pendientes" value={pendientes} icon="⏳" />
              {Array.isArray(entregasPendientes) && entregasPendientes.length > 0 && entregasPendientesAtrasadas > 0 && (
                <ComCard title="Entregas Atrasadas" value={entregasPendientesAtrasadas} icon="⏰" className="warning" />
              )}
              {Array.isArray(entregasPendientes) && entregasPendientes.length > 0 && entregasParaHoy > 0 && (
                <ComCard title="Entregas para Hoy" value={entregasParaHoy} icon="📅" className="info" />
              )}
              {Array.isArray(entregasPendientes) && entregasPendientes.length > 0 && entregasNoGestionadas > 0 && (
                <ComCard title="No Gestionadas" value={entregasNoGestionadas} icon="🕓" className="danger" />
              )}
              <ComCard title="Clientes para hoy" value={loadingClientesParaHoy ? 'Cargando...' : (errorClientesParaHoy ? 'Error' : clientesParaHoy)} icon="📋" />
            </div>
            <div className="comisiones-cards-mobile">
              <ComisionesMobileCards
                meta={meta}
                comisionObtenida={comisionObtenida}
                diferenciaMeta={diferenciaMeta}
                diasRestantes={diasRestantes}
                metaHoy={metaHoy}
                entregasPendientesAtrasadas={entregasPendientesAtrasadas}
                entregasParaHoy={entregasParaHoy}
                entregasNoGestionadas={entregasNoGestionadas}
                gastoMensual={gastoMensual}
              />
            </div>
          </div>
          <div className="comisiones-actions-header" style={{ marginBottom: 24, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
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
            <ActionButton
              onClick={() => openModal("gasto_mensual")}
              label="Mis gasto mensual"
              icon="💳"
              style={{ background: '#a21caf', color: '#fff' }}
            />
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
            {clientesNuevosSinTomar > 0 && (
              <button
                className="header-round-btn info"
                style={{background:'#2563eb',color:'#fff'}} 
                onClick={() => setPage && setPage('clientes-nuevos')}
              >
                Clientes nuevos: {clientesNuevosSinTomar}
              </button>
            )}
            {actualizacionesSinTomar > 0 && (
              <button
                className="header-round-btn warning"
                style={{background:'#fbbf24',color:'#fff'}} 
                onClick={() => setPage && setPage('actualizaciones')}
              >
                Actualizaciones: {actualizacionesSinTomar}
              </button>
            )}
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
                <div className="analisis-card-title">Cobertura de gasto mensual</div>
                <div className="analisis-card-value">L{(comisionObtenida - gastoMensual).toLocaleString("en-US", { minimumFractionDigits: 2 })}</div>
              </div>
              <div className="analisis-card">
                <div className="analisis-card-title">% de cobertura de gasto mensual</div>
                <div className="analisis-card-value">{gastoMensual > 0 ? ((comisionObtenida / gastoMensual) * 100).toFixed(1) : 0}%</div>
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
              <div style={{position: 'relative', width: '100%', height: '100%'}}>
                <Doughnut
                  data={{
                    labels: (typeof meta === 'number' && meta > 0)
                      ? ["Comisión Obtenida", "Restante a Meta"]
                      : ["Sin meta definida"],
                    datasets: [
                      (typeof meta === 'number' && meta > 0)
                        ? {
                            data: [
                              typeof comisionObtenida === 'number' && comisionObtenida > 0 ? comisionObtenida : 0,
                              Math.max(0, meta - (typeof comisionObtenida === 'number' && comisionObtenida > 0 ? comisionObtenida : 0))
                            ],
                            backgroundColor: ["#3612bbff", "#9da0a7ff"],
                            borderWidth: 0,
                            borderColor: ["transparent", "transparent"],
                            hoverOffset: 16,
                            cutout: "65%",
                          }
                        : {
                            data: [1],
                            backgroundColor: ["#f3f4f6"],
                            borderWidth: 0,
                            borderColor: ["transparent"],
                            hoverOffset: 0,
                            cutout: "65%",
                          }
                    ]
                  }}
                  options={{
                    plugins: {
                      legend: {
                        display: typeof meta === 'number' && meta > 0,
                        position: "bottom",
                        labels: {
                          color: "#1e293b",
                          font: { size: 16, weight: "bold" },
                          padding: 24,
                        },
                      },
                      tooltip: {
                        enabled: typeof meta === 'number' && meta > 0,
                        callbacks: {
                          label: function(context) {
                            let label = context.label || "";
                            if (label) label += ": ";
                            if (context.parsed !== null) label += `L${context.parsed.toLocaleString("en-US", {minimumFractionDigits:2, maximumFractionDigits:2})}`;
                            return label;
                          }
                        }
                      }
                    },
                    cutout: "65%",
                    responsive: true,
                    maintainAspectRatio: false,
                  }}
                  style={{ filter: "drop-shadow(0 8px 32px #34d39933)" }}
                />
                {(!(typeof meta === 'number' && meta > 0)) && (
                  <div style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.2rem",
                    color: "#888",
                    background: "rgba(255,255,255,0.7)",
                    borderRadius: 18,
                    pointerEvents: "none"
                  }}>
                    Sin datos para mostrar
                  </div>
                )}
              </div>
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
