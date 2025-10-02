import "./EstadoButtons.css";
import React, { useState, useEffect } from "react";
import EditarOrdenModal from "./EditarOrdenModal";
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
  const [showActualizadoModal, setShowActualizadoModal] = useState(false);
  const [ordenes, setOrdenes] = useState([]);
  const [corOneData, setCorOneData] = useState({}); // { [numero_orden]: { brand, model, status } }
  const [loadingCorOne, setLoadingCorOne] = useState({}); // { [numero_orden]: boolean }
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
  const [isEditOrderModalOpen, setIsEditOrderModalOpen] = useState(false);
  const [ordenAEditar, setOrdenAEditar] = useState(null);
  const [newOrder, setNewOrder] = useState({
  fecha: new Date().toISOString().split("T")[0], // Fecha por defecto: hoy
  cliente: "",
  numero_orden: "",
  telefono: "",
  archivo: "",
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
        // Ya no se consulta cor-one automáticamente
        setCorOneData({});
        setLoadingCorOne({});
      }
    };
    fetchOrdenes();
  }, [miTienda]);

  // Consulta bajo demanda
  const handleConsultarCorOne = async (numero_orden) => {
    setLoadingCorOne(prev => ({ ...prev, [numero_orden]: true }));
    try {
      const ext = await fetchOrdenCorOne(numero_orden);
      setCorOneData(prev => ({ ...prev, [numero_orden]: ext }));
      // Guardar en Supabase los datos consultados
      if (ext) {
        await supabase
          .from("ordenes_servicio")
          .update({
            modelo: ext.model || null,
            marca: ext.brand || null,
            falla: (ext.damage && ext.damage.trim()) ? ext.damage : (ext.reportedDamage && ext.reportedDamage.trim() ? ext.reportedDamage : null),
            status: ext.status || null,
          })
          .eq("numero_orden", numero_orden);
        // Refrescar órdenes para mostrar los datos actualizados
        const { data: ordenesActualizadas } = await supabase
          .from("ordenes_servicio")
          .select("*");
        setOrdenes(ordenesActualizadas);
        // Mostrar modal de actualizado
        setShowActualizadoModal(true);
        setTimeout(() => setShowActualizadoModal(false), 1000);
      }
    } catch (e) {
      setCorOneData(prev => ({ ...prev, [numero_orden]: null }));
    } finally {
      setLoadingCorOne(prev => ({ ...prev, [numero_orden]: false }));
    }
  };

  const handleAddOrder = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Validación de campos requeridos
    const camposObligatorios = ["fecha", "cliente", "numero_orden", "telefono"];
    for (const campo of camposObligatorios) {
      if (!newOrder[campo] || newOrder[campo].toString().trim() === "") {
        alert(`El campo '${campo}' es obligatorio.`);
        setIsLoading(false);
        return;
      }
    }

    // Ya no se sube archivo, solo se guarda la URL escrita
    const archivoUrl = newOrder.archivo || null;
    const userId = localStorage.getItem("userId");
    const { error } = await supabase.from("ordenes_servicio").insert([
      {
        fecha: newOrder.fecha,
        cliente: newOrder.cliente,
        numero_orden: newOrder.numero_orden,
        telefono: newOrder.telefono,
        archivo: archivoUrl,
        tienda_usuario: miTienda,
        user_id: userId,
        gestor: gestor,
      },
    ]);

    if (error) {
      console.error("Error al guardar la orden:", error);
      alert("Error al guardar la orden. Verifica los datos e intenta de nuevo.");
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
      telefono: "",
      estado: "PENDIENTE DE VISITA",
      archivo: "",
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

  // Guardar cambios de edición
  const handleSaveEditOrder = async (form) => {
    if (!ordenAEditar) return;
    setIsLoading(true);
    const { id, ...rest } = form;
    const { error } = await supabase
      .from("ordenes_servicio")
      .update(rest)
      .eq("id", ordenAEditar.id);
    if (!error) {
      // Refrescar órdenes
      const { data: ordenesActualizadas } = await supabase
        .from("ordenes_servicio")
        .select("*");
      setOrdenes(ordenesActualizadas);
      setIsEditOrderModalOpen(false);
      setOrdenAEditar(null);
    } else {
      alert("Error al actualizar la orden");
    }
    setIsLoading(false);
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
          <strong>Falla:</strong> {mostrarResuelto ? 'RESUELTO' : (ext === undefined ? 'Cargando...' : ext === null ? 'Error' : ((ext.damage && ext.damage.trim()) ? ext.damage : (ext.reportedDamage && ext.reportedDamage.trim() ? ext.reportedDamage : 'Sin información')))}
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
          <div style={{ display: "flex", justifyContent: "center", marginTop: "10px" }}>
            {/* Si es una URL http(s), mostrar link, si no, mostrar como antes */}
            {order.archivo.startsWith("http") ? (
              <a href={order.archivo} target="_blank" rel="noopener noreferrer">Ver archivo</a>
            ) : (
              <iframe src={`https://caqukltkvvsfairqphjf.supabase.co/storage/v1/object/public/archivos/${order.archivo}`} />
            )}
          </div>
        )}
        <button onClick={() => { setIsEditOrderModalOpen(true); setOrdenAEditar(order); }}>Editar</button>
        <button onClick={() => setIsUpdateStateModalOpen(true)}>
          Actualizar Estado
        </button>
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
    // Filtrar por STATUS si hay filtro seleccionado
    const matchesFilter = filterState ? (orden.status === filterState) : true;
    // Solo mostrar órdenes de la tienda del usuario
    const matchesTienda = miTienda ? orden.tienda_usuario === miTienda : true;
    return matchesSearch && matchesFilter && matchesTienda;
  });

  return (
  <div className="ordenes-container">
      {/* Botones de acciones principales */}
      <div style={{margin: '10px 0', display: 'flex', gap: '12px'}}>
        <button
          style={{
            background: '#1976d2',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '8px 18px',
            fontWeight: 'bold',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
          }}
          onClick={async () => {
            setIsLoading(true);
            for (const orden of filteredOrdenes) {
              // Solo actualizar órdenes del usuario actual y que no tengan status 'Tu orden ha finalizado'
              const status = orden.status || '';
              if (
                orden.user_id === localStorage.getItem('userId') &&
                status !== 'Tu orden ha finalizado'
              ) {
                await handleConsultarCorOne(orden.numero_orden);
              }
            }
            setIsLoading(false);
          }}
          disabled={isLoading}
        >
          {isLoading ? 'Actualizando...' : 'Actualizar todas mis órdenes'}
        </button>
        <button
          style={{
            background: '#0d1a3a',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '8px 18px',
            fontWeight: 'bold',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
          }}
          onClick={() => setIsAddOrderModalOpen(true)}
        >
          Agregar orden
        </button>
      </div>
      {showActualizadoModal && (
        <div style={{
          position: 'fixed',
          top: '20%',
          left: '50%',
          transform: 'translate(-50%, 0)',
          background: '#1976d2',
          color: 'white',
          padding: '16px 32px',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
          zIndex: 9999,
          fontSize: '1.2em',
          textAlign: 'center',
        }}>
          Actualizado
        </div>
      )}
      <header className="ordenes-header">
  <h1 style={{ textAlign: 'center', width: '100%', margin: '0 auto' }}>Órdenes de Servicio</h1>
        {/* Contador de órdenes activas */}
        <div  style={{ textAlign: 'center', width: '100%', margin: '0 auto' }}>
          Órdenes activas: {
            filteredOrdenes.filter(o => {
              const status = o.status || '';
              return status !== 'Tu orden ha finalizado';
            }).length
          }
        </div>
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
        {/* Filtros dinámicos por STATUS */}
        <div className="filter-buttons">
          {[...new Set(filteredOrdenes.map(o => o.status).filter(Boolean))].map((status) => {
            const statusClass = status
              .toLowerCase()
              .replace(/\s+/g, "-")
              .replace(
                /[áéíóú]/g,
                (m) => ({ á: "a", é: "e", í: "i", ó: "o", ú: "u" }[m])
              );
            return (
              <button
                key={status}
                className={`filter-button ${statusClass} ${
                  filterState === status ? "active" : ""
                }`}
                onClick={() =>
                  setFilterState(filterState === status ? "" : status)
                }
              >
                {status}
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
              onConsultarCorOne={() => handleConsultarCorOne(orden.numero_orden)}
              loadingCorOne={!!loadingCorOne[orden.numero_orden]}
            />
          );
        })}
      </div>
      {/* Tabla solo visible en desktop por CSS */}
      <div className="ordenes-servicio-table-container">
        <table className="ordenes-table">
          <thead>
            <tr style={{ background: '#0d1a3a' }}>
              <th style={{ color: '#fff', background: '#0d1a3a' }}>FECHA</th>
              <th style={{ color: '#fff', background: '#0d1a3a' }}>CLIENTE</th>
              <th style={{ color: '#fff', background: '#0d1a3a' }}>TELÉFONO</th>
              <th style={{ color: '#fff', background: '#0d1a3a' }}>NÚMERO DE ORDEN</th>
              {/* <th>ARTÍCULO</th> */}
              <th style={{ color: '#fff', background: '#0d1a3a' }}>MODELO</th>
              <th style={{ color: '#fff', background: '#0d1a3a' }}>MARCA</th>
              <th style={{ color: '#fff', background: '#0d1a3a' }}>FALLA</th>
              <th style={{ color: '#fff', background: '#0d1a3a' }}>STATUS</th>
              <th style={{ color: '#fff', background: '#0d1a3a' }}>DIAS</th>
              <th style={{ color: '#fff', background: '#0d1a3a' }}>GESTOR</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrdenes.map((orden) => {
              const ext = corOneData.hasOwnProperty(orden.numero_orden)
                ? corOneData[orden.numero_orden]
                : undefined;
              // Colores para status según texto específico
              const statusRaw = ext && ext.status ? ext.status : (orden.status || '');
              const statusValue = statusRaw.toLowerCase();
              let statusColor = '#e0e0e0', statusTextColor = '#333';
              if (statusRaw === 'Tu orden ha finalizado') {
                statusColor = '#43a047'; statusTextColor = '#fff'; // verde
              } else if (statusRaw === 'Tu artículo está en proceso de reparación') {
                statusColor = '#1976d2'; statusTextColor = '#fff'; // azul
              } else if (statusRaw === 'Tu artículo está en proceso de revisión') {
                statusColor = '#ff9800'; statusTextColor = '#fff'; // naranja oscuro
              } else if (statusRaw === 'Tu orden ha sido recibida') {
                statusColor = '#ffe600'; statusTextColor = '#333'; // amarillo
              } else if (statusValue.includes('anulado') || statusValue.includes('anulada') || statusValue.includes('rechazada')) {
                statusColor = '#e57373'; statusTextColor = '#fff';
              } else if (statusValue.includes('finalizada') || statusValue.includes('finalizado')) {
                statusColor = '#1976d2'; statusTextColor = '#fff';
              } else if (statusValue.includes('pendiente')) {
                statusColor = '#ffb300'; statusTextColor = '#fff';
              } else if (statusValue.includes('reparado')) {
                statusColor = '#43a047'; statusTextColor = '#fff';
              } else if (statusValue.includes('sugerencia')) {
                statusColor = '#8e24aa'; statusTextColor = '#fff';
              }
              // Mostrar -- en días si status es anulado, anulada, rechazada, finalizada o 'Tu orden ha finalizado'
              const diasOcultar = statusValue.includes('anulado') || statusValue.includes('anulada') || statusValue.includes('rechazada') || statusValue.includes('finalizada') || statusRaw === 'Tu orden ha finalizado';
              return (
                <tr key={orden.id} onClick={() => handleRowClick(orden)}>
                  <td data-label="Fecha">{orden.fecha}</td>
                  <td data-label="Cliente">{orden.cliente}</td>
                  <td data-label="Teléfono">{orden.telefono || ''}</td>
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
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        handleConsultarCorOne(orden.numero_orden);
                      }}
                      title="Consultar modelo, marca y status"
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        marginLeft: 4,
                        padding: 0,
                        verticalAlign: 'middle',
                      }}
                    >
                      {/* Icono lupa */}
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{verticalAlign: 'middle'}}>
                        <circle cx="11" cy="11" r="7" stroke="#6366f1" strokeWidth="2" fill="#fff"/>
                        <line x1="16" y1="16" x2="21" y2="21" stroke="#6366f1" strokeWidth="2"/>
                      </svg>
                      {loadingCorOne[orden.numero_orden] && <span style={{marginLeft:4, fontSize:10}}>...</span>}
                    </button>
                  </td>
                  {/* <td data-label="Artículo">{orden.articulo}</td> */}
                  <td data-label="Modelo">{ext && ext.model ? ext.model : (orden.modelo || '')}</td>
                  <td data-label="Marca">{ext && ext.brand ? ext.brand : (orden.marca || '')}</td>
                  <td data-label="Falla">{ext && (ext.damage || ext.reportedDamage) ? (ext.damage ? ext.damage : ext.reportedDamage) : (orden.falla || '')}</td>
                  <td data-label="Status">
                    <span style={{
                      display: 'inline-block',
                      background: statusColor,
                      color: statusTextColor,
                      borderRadius: '16px',
                      padding: '2px 14px',
                      fontWeight: 'bold',
                      fontSize: '0.95em',
                      minWidth: '80px',
                      textAlign: 'center',
                      boxShadow: '0 1px 4px rgba(0,0,0,0.08)'
                    }}>{ext && ext.status ? ext.status : (orden.status || '')}</span>
                  </td>
                  <td data-label="Días">{diasOcultar ? '--' : calculateDaysElapsed(orden.fecha)}</td>
                  <td data-label="Gestor">{orden.gestor}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Botón fijo solo escritorio eliminado por solicitud del usuario */}

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
          {/* Modal de edición */}
          <EditarOrdenModal
            isOpen={isEditOrderModalOpen}
            onClose={() => { setIsEditOrderModalOpen(false); setOrdenAEditar(null); }}
            orden={selectedOrden}
            onSave={(form) => { setOrdenAEditar(selectedOrden); handleSaveEditOrder(form); }}
          />
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
                placeholder="Teléfono"
                value={newOrder.telefono || ""}
                onChange={(e) => handleInputChange("telefono", e.target.value)}
                pattern="[0-9+\-]*"
                title="Solo números y signos (+, -)"
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
                placeholder="URL del archivo (opcional)"
                value={newOrder.archivo || ""}
                onChange={(e) => handleInputChange("archivo", e.target.value)}
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
        {/* Modal de actualización de estado eliminado */}
      )}
    </div>
  );
};

export default OrdenesServicio;
