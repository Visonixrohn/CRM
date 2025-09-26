import "./EstadoButtons.css";
import React, { useState, useEffect } from "react";
import { fetchOrdenCorOne } from "./utils/fetchOrdenCorOne";
import { supabase } from "./supabaseClient";
import Modal from "react-modal";
import { CSVLink } from "react-csv";
import "./OrdenesServicioTabla.css";
import "./botonordenmovil.css";
import "./ordendeskopagregar.css";
import "./OrdenesServicioFiltroBtn.css";
import "./OrdenesServicioForm.css";
import "./OrdenesServicioDetalle.css";
import "./OrdenesServicioActualizarEstado.css";
import "./OrdenesServicioBusqueda.css";
import OrdenesServicioCard from "./components/OrdenesServicioCard";
import OrdenesServicioCardMovil from "./components/OrdenesServicioCardMovil";
import "./components/OrdenesServicioCard.css";
import OrdenesServicioFiltroMovil from "./components/OrdenesServicioFiltroMovil";
import "./components/OrdenesServicioFiltroMovil.css";
import BotonFlotanteMovil from "./components/BotonFlotanteMovil";

const OrdenesServicio = () => {
  const [ordenes, setOrdenes] = useState([]);
  const [corOneData, setCorOneData] = useState({}); // { [numero_orden]: { brand, model, status } }
  const [miTienda, setMiTienda] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [gestor, setGestor] = useState("");
  const [formData, setFormData] = useState({
    fecha: "",
    cliente: "",
    numero_orden: "",
    archivo: null,
    dias_trascurridos: 0,
    estado: "",
  });
  const [selectedOrden, setSelectedOrden] = useState(null);
  const [isAddOrderModalOpen, setIsAddOrderModalOpen] = useState(false);
  const [newOrder, setNewOrder] = useState({
    fecha: new Date().toISOString().split("T")[0], // Fecha por defecto: hoy
    cliente: "",
    numero_orden: "",
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

  // Obtener tienda y nombre del usuario logueado
  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!userId) return;
    (async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("mi_tienda, nombre")
        .eq("id", userId)
        .maybeSingle();
      if (!error && data) {
        if (data.mi_tienda) setMiTienda(data.mi_tienda);
        if (data.nombre) setGestor(data.nombre);
      }
    })();
  }, []);

  useEffect(() => {
    if (!miTienda) return;
    const fetchOrdenes = async () => {
      const { data, error } = await supabase
        .from("ordenes_servicio")
        .select("*")
        .eq("tienda_usuario", miTienda);
      if (error) {
        console.error("Error fetching ordenes:", error);
      } else {
        setOrdenes(data);
        // Buscar datos extra de cor-one solo para estados permitidos
        const estadosPermitidos = [
          "PENDIENTE DE VISITA",
          "PENDIENTE DE REPUESTO"
        ];
        Promise.all(
          (data || []).map(async (orden) => {
            if (!orden.numero_orden) return [orden.numero_orden, null];
            if (!estadosPermitidos.includes(orden.estado)) return [orden.numero_orden, null];
            const ext = await fetchOrdenCorOne(orden.numero_orden);
            return [orden.numero_orden, ext];
          })
        ).then((results) => {
          const extData = {};
          results.forEach(([num, ext]) => {
            if (num && ext) extData[num] = ext;
          });
          setCorOneData(extData);
        });
      }
    };
    fetchOrdenes();
  }, [miTienda]);

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
          estado: "",
          archivo: null,
        });
        return;
      }

      archivoUrl = uploadData.path;
    }

    const userId = localStorage.getItem("userId");
    const { error } = await supabase.from("ordenes_servicio").insert([
      {
        ...newOrder,
        articulo: null,
        archivo: archivoUrl,
        tienda_usuario: miTienda,
        user_id: userId,
        gestor: gestor,
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

  const renderOrderDetails = (order) => {
    // Obtener datos externos si existen
    const ext = corOneData && order.numero_orden ? corOneData[order.numero_orden] : undefined;
    const estadosPermitidos = ["PENDIENTE DE VISITA", "PENDIENTE DE REPUESTO"];
    const mostrarResuelto = !estadosPermitidos.includes(order.estado);
    return (
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
          <strong>Modelo:</strong> {mostrarResuelto ? 'RESUELTO' : (ext === undefined ? 'Cargando...' : ext && ext.model ? ext.model : (ext === null ? 'Error' : ''))}
        </p>
        <p>
          <strong>Marca:</strong> {mostrarResuelto ? 'RESUELTO' : (ext === undefined ? 'Cargando...' : ext && ext.brand ? ext.brand : (ext === null ? 'Error' : ''))}
        </p>
        <p>
          <strong>Status:</strong> {mostrarResuelto ? 'RESUELTO' : (ext === undefined ? 'Cargando...' : ext && ext.status ? ext.status : (ext === null ? 'Error' : ''))}
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
        {/* Botón flotante solo móvil para agregar orden */}
        <BotonFlotanteMovil onClick={() => setIsAddOrderModalOpen(true)} icon={"+"} label="Agregar orden" />
      </div>
    );
  };

  const handleInputChange = (field, value) => {
    if (field === "dias_trascurridos" && isNaN(value)) {
      value = 0;
    }
    // Ignorar cambios en "articulo"
    if (field === "articulo") return;
    setNewOrder({ ...newOrder, [field]: value });
  };

  const filteredOrdenes = ordenes.filter((orden) => {
    const matchesSearch =
      orden.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
      orden.numero_orden.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterState ? orden.estado === filterState : true;
    // Solo mostrar órdenes de la tienda del usuario
    const matchesTienda = miTienda ? orden.tienda_usuario === miTienda : true;
    return matchesSearch && matchesFilter && matchesTienda;
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
      <div className="solo-movil">
        {filteredOrdenes.map((orden) => {
          const ext = corOneData.hasOwnProperty(orden.numero_orden)
            ? corOneData[orden.numero_orden]
            : undefined;
          const estadosPermitidos = ["PENDIENTE DE VISITA", "PENDIENTE DE REPUESTO"];
          const mostrarResuelto = !estadosPermitidos.includes(orden.estado);
          return (
            <OrdenesServicioCardMovil
              key={orden.id}
              orden={orden}
              onVerDetalle={handleRowClick}
              ext={mostrarResuelto ? { model: 'RESUELTO', brand: 'RESUELTO', status: 'RESUELTO' } : ext}
            />
          );
        })}
      </div>
      {/* Tabla solo visible en desktop por CSS */}
      <div className="ordenes-servicio-table-container">
        <table className="ordenes-table">
          <thead>
            <tr>
              <th>FECHA</th>
              <th>CLIENTE</th>
              <th>NÚMERO DE ORDEN</th>
              {/* <th>ARTÍCULO</th> */}
              <th>MODELO</th>
              <th>MARCA</th>
              <th>STATUS</th>
              <th>ESTADO</th>
              <th>DIAS</th>
              <th>GESTOR</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrdenes.map((orden) => {
              const ext = corOneData.hasOwnProperty(orden.numero_orden)
                ? corOneData[orden.numero_orden]
                : undefined;
              return (
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
                  {/* <td data-label="Artículo">{orden.articulo}</td> */}
                  <td data-label="Modelo">
                    {(() => {
                      const estadosPermitidos = ["PENDIENTE DE VISITA", "PENDIENTE DE REPUESTO"];
                      if (!estadosPermitidos.includes(orden.estado)) return 'RESUELTO';
                      return ext === undefined ? 'Cargando...' : ext && ext.model ? ext.model : (ext === null ? 'Error' : '');
                    })()}
                  </td>
                  <td data-label="Marca">
                    {(() => {
                      const estadosPermitidos = ["PENDIENTE DE VISITA", "PENDIENTE DE REPUESTO"];
                      if (!estadosPermitidos.includes(orden.estado)) return 'RESUELTO';
                      return ext === undefined ? 'Cargando...' : ext && ext.brand ? ext.brand : (ext === null ? 'Error' : '');
                    })()}
                  </td>
                  <td data-label="Status">
                    {(() => {
                      const estadosPermitidos = ["PENDIENTE DE VISITA", "PENDIENTE DE REPUESTO"];
                      if (!estadosPermitidos.includes(orden.estado)) return 'RESUELTO';
                      return ext === undefined ? 'Cargando...' : ext && ext.status ? ext.status : (ext === null ? 'Error' : '');
                    })()}
                  </td>
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
                  <td data-label="Gestor">{orden.gestor}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Botón flotante solo móvil */}
      <BotonFlotanteMovil onClick={() => setIsAddOrderModalOpen(true)} icon={"+"} label="Agregar orden" />
      {/* Botón fijo solo escritorio */}
      <button
        className="btn-agregar-orden-desktop"
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
