import "./EstadoButtons.css";
import React, { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";
import Modal from "react-modal";
import { CSVLink } from "react-csv";
import "./OrdenesServicioTabla.css";
import "./OrdenesServicioAgregarBtn.css";
import "./OrdenesServicioFiltroBtn.css";
import "./OrdenesServicioForm.css";
import "./OrdenesServicioDetalle.css";
import "./OrdenesServicioActualizarEstado.css";
import "./OrdenesServicioBusqueda.css";
import OrdenesServicioCard from "./components/OrdenesServicioCard";
import "./components/OrdenesServicioCard.css";
import OrdenesServicioFiltroMovil from "./components/OrdenesServicioFiltroMovil";
import "./components/OrdenesServicioFiltroMovil.css";

const OrdenesServicio = () => {
  const [ordenes, setOrdenes] = useState([]);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    fecha: "",
    cliente: "",
    numero_orden: "",
    archivo: null,
    articulo: "",
    dias_trascurridos: 0,
    estado: "",
  });
  const [selectedOrden, setSelectedOrden] = useState(null);
  const [isAddOrderModalOpen, setIsAddOrderModalOpen] = useState(false);
  const [newOrder, setNewOrder] = useState({
    fecha: new Date().toISOString().split("T")[0], // Fecha por defecto: hoy
    cliente: "",
    numero_orden: "",
    articulo: "",
    estado: "",
    archivo: null,
  });
  const [isLoading, setIsLoading] = useState(false);
  // Eliminado isSuccessModalOpen
  const [isUpdateStateModalOpen, setIsUpdateStateModalOpen] = useState(false);
  const [selectedState, setSelectedState] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterState, setFilterState] = useState("");

  const estados = [
    "PENDIENTE DE VISITA",
    "PENDIENTE DE REPUESTO",
    "REPARADO",
    "SUGERENCIA DE CAMBIO",
    "ANULADA",
  ];

  useEffect(() => {
    const fetchOrdenes = async () => {
      const { data, error } = await supabase
        .from("ordenes_servicio")
        .select("*");
      if (error) {
        console.error("Error fetching ordenes:", error);
      } else {
        setOrdenes(data);
      }
    };
    fetchOrdenes();
  }, []);

  const handleAddOrder = async (e) => {
    e.preventDefault();


    setIsLoading(true);

    let archivoUrl = null;
    if (newOrder.archivo) {
      const uniqueFileName = `ordenes/${Date.now()}-${newOrder.archivo.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("archivos")
        .upload(uniqueFileName, newOrder.archivo);

      if (uploadError) {
        console.error("Error al subir el archivo:", uploadError);
        // Refrescar la tabla y limpiar estado
        const { data: ordenesActualizadas } = await supabase
          .from("ordenes_servicio")
          .select("*");
        setOrdenes(ordenesActualizadas);
        setIsAddOrderModalOpen(false);
        setIsLoading(false);
        setNewOrder({
          fecha: new Date().toISOString().split("T")[0],
          cliente: "",
          numero_orden: "",
          articulo: "",
          estado: "",
          archivo: null,
        });
        return;
      }

      archivoUrl = uploadData.path;
    }

    const { error } = await supabase.from("ordenes_servicio").insert([
      {
        ...newOrder,
        archivo: archivoUrl,
      },
    ]);


    if (error) {
      console.error("Error al guardar la orden:", error);
      setIsAddOrderModalOpen(false);
    } else {
      setIsAddOrderModalOpen(false);
    }
    // Refrescar todas las órdenes SIEMPRE
    const { data: ordenesActualizadas } = await supabase
      .from("ordenes_servicio")
      .select("*");
    setOrdenes(ordenesActualizadas);
    setIsLoading(false);
    setNewOrder({
      fecha: new Date().toISOString().split("T")[0],
      cliente: "",
      numero_orden: "",
      articulo: "",
      estado: "",
      archivo: null,
    });
  };

  const handleRowClick = (orden) => {
    setSelectedOrden(orden);
    setIsDetailModalOpen(true);
  };

  const handleUpdateState = async () => {
    if (!selectedOrden || !selectedState) return;


    const { error } = await supabase
      .from("ordenes_servicio")
      .update({ estado: selectedState })
      .eq("numero_orden", selectedOrden.numero_orden);

    if (error) {
      console.error("Error al actualizar el estado:", error);
    } else {
      setSelectedOrden({ ...selectedOrden, estado: selectedState });
      setIsUpdateStateModalOpen(false);
      // Refrescar todas las órdenes
      const { data: ordenesActualizadas } = await supabase
        .from("ordenes_servicio")
        .select("*");
      setOrdenes(ordenesActualizadas);
    }
  };

  const calculateDaysElapsed = (fecha) => {
    const today = new Date();
    const orderDate = new Date(fecha);
    const timeDiff = today - orderDate;
    return Math.floor(timeDiff / (1000 * 60 * 60 * 24));
  };

  const renderOrderDetails = (order) => (
    <div className="order-details">
      <h3>Detalles de la Orden</h3>
      <p>
        <strong>Fecha:</strong> {order.fecha}
      </p>
      <p>
        <strong>Cliente:</strong> {order.cliente}
      </p>
      <p>
        <strong>Número de Orden:</strong> {order.numero_orden}
      </p>
      <p>
        <strong>Artículo:</strong> {order.articulo}
      </p>
      <p>
        <strong>Días Transcurridos:</strong> {calculateDaysElapsed(order.fecha)}
      </p>
      <p>
        <strong>Estado:</strong> {order.estado}
      </p>
      {order.archivo && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginTop: "10px",
          }}
        >
          <iframe
            src={`https://caqukltkvvsfairqphjf.supabase.co/storage/v1/object/public/archivos/${order.archivo}`}
            title="Vista previa del archivo"
            className="order-details-iframe"
          ></iframe>
        </div>
      )}
      <button onClick={() => setIsUpdateStateModalOpen(true)}>
        Actualizar Estado
      </button>
    </div>
  );

  const handleInputChange = (field, value) => {
    if (field === "dias_trascurridos" && isNaN(value)) {
      value = 0;
    }
    setNewOrder({ ...newOrder, [field]: value });
  };

  const filteredOrdenes = ordenes.filter((orden) => {
    const matchesSearch =
      orden.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
      orden.numero_orden.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterState ? orden.estado === filterState : true;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="ordenes-container">
      <header className="ordenes-header">
        <h1>Órdenes de Servicio</h1>
        <div className="osv-busqueda-barra-container">
          <input
            type="text"
            placeholder="Buscar por cliente o número de orden"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="osv-busqueda-barra"
          />
          <span className="osv-busqueda-icono">🔍</span>
        </div>
        <OrdenesServicioFiltroMovil estados={estados} filterState={filterState} setFilterState={setFilterState} />
        <div className="filter-buttons">
          {estados.map((estado) => {
            const estadoClass = estado
              .toLowerCase()
              .replace(/\s+/g, "-")
              .replace(
                /[áéíóú]/g,
                (m) => ({ á: "a", é: "e", í: "i", ó: "o", ú: "u" }[m])
              );
            return (
              <button
                key={estado}
                className={`filter-button ${estadoClass} ${
                  filterState === estado ? "active" : ""
                }`}
                onClick={() =>
                  setFilterState(filterState === estado ? "" : estado)
                }
              >
                {estado}
              </button>
            );
          })}
        </div>
      </header>

      {/* Cards móviles */}
      {filteredOrdenes.map((orden) => (
        <OrdenesServicioCard key={orden.id} orden={orden} onVerDetalle={handleRowClick} />
      ))}
      {/* Tabla solo visible en desktop por CSS */}
      <div className="ordenes-servicio-table-container">
        <table className="ordenes-table">
          <thead>
            <tr>
              <th>FECHA</th>
              <th>CLIENTE</th>
              <th>NÚMERO DE ORDEN</th>
              <th>ARTÍCULO</th>
              <th>ESTADO</th>
              <th>DIAS</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrdenes.map((orden) => (
              <tr key={orden.id} onClick={() => handleRowClick(orden)}>
                <td data-label="Fecha">{orden.fecha}</td>
                <td data-label="Cliente">{orden.cliente}</td>
                <td data-label="Número de Orden" style={{whiteSpace: 'nowrap'}}>
                  {orden.numero_orden}
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      navigator.clipboard.writeText(orden.numero_orden);
                    }}
                    title="Copiar número de orden"
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      marginLeft: 8,
                      padding: 0,
                      verticalAlign: 'middle',
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{verticalAlign: 'middle'}}>
                      <rect x="9" y="9" width="13" height="13" rx="2" stroke="#1976d2" strokeWidth="2" fill="#fff"/>
                      <rect x="3" y="3" width="13" height="13" rx="2" stroke="#1976d2" strokeWidth="2" fill="#e3f2fd"/>
                    </svg>
                  </button>
                </td>
                <td data-label="Artículo">{orden.articulo}</td>
                <td
                  data-label="Estado"
                  className={`estado-${(() => {
                    let estado = orden.estado
                      .toLowerCase()
                      .replace(/\s+/g, "-")
                      .replace(/[áéíóú]/g, m => ({ á: "a", é: "e", í: "i", ó: "o", ú: "u" }[m]));
                    if (estado === "anulada") return "anuladas";
                    return estado;
                  })()}`}
                >
                  {orden.estado}
                </td>
                <td data-label="Días">{calculateDaysElapsed(orden.fecha)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button
        className="btn-agregar-orden"
        onClick={() => setIsAddOrderModalOpen(true)}
      >+</button>

      {selectedOrden && (
        <div
          className="modal-overlay"
          onClick={e => {
            if (e.target.classList.contains('modal-overlay')) {
              setSelectedOrden(null);
            }
          }}
        >
          <div className="order-details-modal fade-in" onClick={e => e.stopPropagation()}>
            {renderOrderDetails(selectedOrden)}
            <button onClick={() => setSelectedOrden(null)}>Cerrar</button>
          </div>
        </div>
      )}

  {isAddOrderModalOpen && (
        <div
          className="modal-overlay"
          onClick={e => {
            // Solo cerrar si el click es en el fondo, no en el modal
            if (e.target.classList.contains('modal-overlay')) {
              setIsAddOrderModalOpen(false);
            }
          }}
        >
          <div className="AddOrderForm fade-in" onClick={e => e.stopPropagation()}>
            <h2>Agregar Orden de Servicio</h2>
            <form onSubmit={handleAddOrder}>
              <input
                type="date"
                value={newOrder.fecha || ""}
                onChange={(e) => handleInputChange("fecha", e.target.value)}
                required
              />
              <input
                type="text"
                placeholder="Cliente"
                value={newOrder.cliente || ""}
                onChange={(e) => handleInputChange("cliente", e.target.value)}
                required
              />
              <input
                type="text"
                placeholder="Número de Orden"
                value={newOrder.numero_orden || ""}
                onChange={(e) =>
                  handleInputChange("numero_orden", e.target.value)
                }
                required
              />
              <input
                type="text"
                placeholder="Artículo"
                value={newOrder.articulo || ""}
                onChange={(e) => handleInputChange("articulo", e.target.value)}
                required
              />
              <select
                value={newOrder.estado || ""}
                onChange={(e) => handleInputChange("estado", e.target.value)}
                required
              >
                <option value="" disabled>
                  Selecciona un estado
                </option>
                {estados.map((estado) => (
                  <option key={estado} value={estado}>
                    {estado}
                  </option>
                ))}
              </select>
              <input
                type="file"
                accept="application/pdf"
                onChange={(e) =>
                  handleInputChange("archivo", e.target.files[0])
                }
                required
              />
              <div className="form-actions">
                <button type="submit" disabled={isLoading}>
                  {isLoading ? "Guardando..." : "Guardar"}
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddOrderModalOpen(false)}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

  {/* Modal de éxito eliminado por solicitud del usuario */}

      {isUpdateStateModalOpen && (
        <div
          className="modal-overlay"
          onClick={e => {
            if (e.target.classList.contains('modal-overlay')) {
              setIsUpdateStateModalOpen(false);
            }
          }}
        >
          <div className="update-state-modal fade-in" onClick={e => e.stopPropagation()}>
            <h3>Actualizar Estado</h3>
            <div className="estado-buttons">
              {estados.map((estado) => {
                // Normalizar nombre para clase exclusiva
                let clase = "otro";
                if (
                  estado.toLowerCase().includes("pendiente") &&
                  estado.toLowerCase().includes("visita")
                ) {
                  clase = "pendiente-de-visita";
                } else if (
                  estado.toLowerCase().includes("pendiente") &&
                  estado.toLowerCase().includes("repuesto")
                ) {
                  clase = "pendiente-de-repuesto";
                } else if (estado.toLowerCase().includes("reparado")) {
                  clase = "reparado";
                } else if (estado.toLowerCase().includes("cambio")) {
                  clase = "sugerencia-de-cambio";
                }

                return (
                  <button
                    key={estado}
                    className={`estado-button ${clase}${
                      selectedState === estado ? " active" : ""
                    }`}
                    onClick={() => {
                      setSelectedState(estado);
                    }}
                  >
                    {estado}
                  </button>
                );
              })}
            </div>
            <div className="form-actions">
              <button onClick={handleUpdateState}>Guardar</button>
              <button onClick={() => setIsUpdateStateModalOpen(false)}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdenesServicio;
