import "./OrdenesServicioNew.css";
import "./ModalesNew.css";
import React, { useState, useEffect } from "react";
import EditarOrdenModal from "./EditarOrdenModal";
import { fetchOrdenCorOne } from "./utils/fetchOrdenCorOne";
import { supabase } from "./supabaseClient";
import OrdenesServicioCardMovil from "./components/OrdenesServicioCardMovil";
import "./components/OrdenesServicioCard.css";

const OrdenesServicio = () => {
  const [verTodasTienda, setVerTodasTienda] = useState(false);
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
  const [isUpdateStateModalOpen, setIsUpdateStateModalOpen] = useState(false);
  const [selectedState, setSelectedState] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterState, setFilterState] = useState("");
  const [filtroSidebar, setFiltroSidebar] = useState("Todas");

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
    const userId = localStorage.getItem("userId");
    const matchesSearch =
      orden.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
      orden.numero_orden.toLowerCase().includes(searchTerm.toLowerCase());
    // Filtrar por STATUS si hay filtro seleccionado
    const matchesFilter = filterState ? (orden.status === filterState) : true;
    // Solo mostrar órdenes según interruptor
    const matchesTienda = miTienda ? orden.tienda_usuario === miTienda : true;
    const matchesUser = verTodasTienda ? true : orden.user_id === userId;
    
    // Filtro sidebar por status
    let matchesSidebar = true;
    const status = orden.status || '';
    if (filtroSidebar === "Activas") {
      matchesSidebar = status !== 'Tu orden ha finalizado';
    } else if (filtroSidebar === "Finalizadas") {
      matchesSidebar = status === 'Tu orden ha finalizado';
    } else if (filtroSidebar === "En Reparación") {
      matchesSidebar = status === 'Tu artículo está en proceso de reparación';
    } else if (filtroSidebar === "En Revisión") {
      matchesSidebar = status === 'Tu artículo está en proceso de revisión';
    } else if (filtroSidebar === "Recibidas") {
      matchesSidebar = status === 'Tu orden ha sido recibida';
    }
    
    return matchesSearch && matchesFilter && matchesTienda && matchesUser && matchesSidebar;
  });

  // Métricas para las tarjetas
  const metricas = {
    total: ordenes.length,
    activas: ordenes.filter(o => (o.status || '') !== 'Tu orden ha finalizado').length,
    finalizadas: ordenes.filter(o => o.status === 'Tu orden ha finalizado').length,
    enReparacion: ordenes.filter(o => o.status === 'Tu artículo está en proceso de reparación').length,
    enRevision: ordenes.filter(o => o.status === 'Tu artículo está en proceso de revisión').length,
    recibidas: ordenes.filter(o => o.status === 'Tu orden ha sido recibida').length,
  };

  return (
    <div className="ordenes-layout">
      {/* Sidebar de filtros */}
      <aside className="ordenes-sidebar">
        <div className="sidebar-section">
          <div className="sidebar-title">Filtros</div>
          <div className="sidebar-filters">
            {["Todas", "Activas", "Finalizadas", "En Reparación", "En Revisión", "Recibidas"].map((filtro) => {
              let count = 0;
              if (filtro === "Todas") count = metricas.total;
              else if (filtro === "Activas") count = metricas.activas;
              else if (filtro === "Finalizadas") count = metricas.finalizadas;
              else if (filtro === "En Reparación") count = metricas.enReparacion;
              else if (filtro === "En Revisión") count = metricas.enRevision;
              else if (filtro === "Recibidas") count = metricas.recibidas;
              
              return (
                <div
                  key={filtro}
                  className={`filter-item ${filtroSidebar === filtro ? "active" : ""}`}
                  onClick={() => setFiltroSidebar(filtro)}
                >
                  <span>{filtro}</span>
                  <span className="filter-badge">{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="sidebar-section">
          <div className="switch-container">
            <span className="switch-label">Ver todas de la tienda</span>
            <label className="switch">
              <input
                type="checkbox"
                checked={verTodasTienda}
                onChange={() => setVerTodasTienda(v => !v)}
              />
              <span className="slider"></span>
            </label>
          </div>
        </div>
      </aside>

      {/* Contenido principal */}
      <main className="ordenes-main">
        {/* Header con título y acciones */}
        <div className="ordenes-header-new">
          <div className="header-title-section">
            <h1>Órdenes de Servicio</h1>
            <p className="header-subtitle">
              {filteredOrdenes.length} órdenes • {metricas.activas} activas
            </p>
          </div>
          <div className="header-actions-new">
            <button
              className="btn-action btn-secondary-new"
              onClick={async () => {
                setIsLoading(true);
                for (const orden of filteredOrdenes) {
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
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0119.5-3M22 12.5a10 10 0 01-19.5 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {isLoading ? 'Actualizando...' : 'Actualizar Mis Órdenes'}
            </button>
            <button
              className="btn-action btn-primary-new"
              onClick={() => setIsAddOrderModalOpen(true)}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              Nueva Orden
            </button>
          </div>
        </div>

        {/* Barra de búsqueda */}
        <div className="search-bar-new">
          <svg className="search-icon-new" width="20" height="20" viewBox="0 0 24 24" fill="none">
            <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
            <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <input
            type="text"
            placeholder="Buscar por cliente o número de orden..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input-new"
          />
        </div>

        {/* Métricas */}
        <div className="metrics-grid">
          <div className="metric-card active">
            <div className="metric-label">Total Órdenes</div>
            <div className="metric-value">{metricas.total}</div>
          </div>
          <div className="metric-card pending">
            <div className="metric-label">Activas</div>
            <div className="metric-value">{metricas.activas}</div>
          </div>
          <div className="metric-card finished">
            <div className="metric-label">Finalizadas</div>
            <div className="metric-value">{metricas.finalizadas}</div>
          </div>
          <div className="metric-card repair">
            <div className="metric-label">En Reparación</div>
            <div className="metric-value">{metricas.enReparacion}</div>
          </div>
        </div>

        {showActualizadoModal && (
          <div style={{
            position: 'fixed',
            top: '20%',
            left: '50%',
            transform: 'translate(-50%, 0)',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            padding: '16px 32px',
            borderRadius: '12px',
            boxShadow: '0 8px 32px rgba(102, 126, 234, 0.4)',
            zIndex: 9999,
            fontSize: '1.1em',
            textAlign: 'center',
            fontWeight: '600',
          }}>
            ✓ Actualizado
          </div>
        )}

        {/* Tabla Desktop */}
        <div className="tabla-ordenes-scroll">
          <div className="tabla-ordenes-inner">
            <table className="ordenes-table-new">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Cliente</th>
                  <th>Teléfono</th>
                  <th>Nº Orden</th>
                  <th>Modelo</th>
                  <th>Marca</th>
                  <th>Falla</th>
                  <th>Status</th>
                  <th>Días</th>
                  <th>Creador</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrdenes.map((orden) => {
                  const ext = corOneData.hasOwnProperty(orden.numero_orden)
                    ? corOneData[orden.numero_orden]
                    : undefined;
                  const statusRaw = ext && ext.status ? ext.status : (orden.status || '');
                  const statusValue = statusRaw.toLowerCase();
                  
                  let statusClass = '';
                  if (statusRaw === 'Tu orden ha finalizado') statusClass = 'status-finalizado';
                  else if (statusRaw === 'Tu artículo está en proceso de reparación') statusClass = 'status-proceso';
                  else if (statusRaw === 'Tu artículo está en proceso de revisión') statusClass = 'status-revision';
                  else if (statusRaw === 'Tu orden ha sido recibida') statusClass = 'status-recibida';
                  else if (statusValue.includes('anulado') || statusValue.includes('anulada')) statusClass = 'status-anulada';
                  
                  const diasOcultar = statusValue.includes('anulado') || statusValue.includes('anulada') || statusValue.includes('rechazada') || statusValue.includes('finalizada') || statusRaw === 'Tu orden ha finalizado';
                  
                  return (
                    <tr key={orden.id} onClick={() => handleRowClick(orden)}>
                      <td>{orden.fecha}</td>
                      <td>{orden.cliente}</td>
                      <td>{orden.telefono || '-'}</td>
                      <td style={{whiteSpace: 'nowrap'}}>
                        {orden.numero_orden}
                        <button
                          className="icon-button"
                          onClick={e => {
                            e.stopPropagation();
                            navigator.clipboard.writeText(orden.numero_orden);
                          }}
                          title="Copiar número de orden"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <rect x="9" y="9" width="13" height="13" rx="2" stroke="#667eea" strokeWidth="2"/>
                            <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" stroke="#667eea" strokeWidth="2"/>
                          </svg>
                        </button>
                        <button
                          className="icon-button"
                          onClick={e => {
                            e.stopPropagation();
                            handleConsultarCorOne(orden.numero_orden);
                          }}
                          title="Actualizar datos"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <circle cx="11" cy="11" r="8" stroke="#667eea" strokeWidth="2"/>
                            <path d="M21 21l-4.35-4.35" stroke="#667eea" strokeWidth="2" strokeLinecap="round"/>
                          </svg>
                          {loadingCorOne[orden.numero_orden] && <span style={{marginLeft:2}}>...</span>}
                        </button>
                      </td>
                      <td>{ext && ext.model ? ext.model : (orden.modelo || '-')}</td>
                      <td>{ext && ext.brand ? ext.brand : (orden.marca || '-')}</td>
                      <td>{ext && (ext.damage || ext.reportedDamage) ? (ext.damage || ext.reportedDamage) : (orden.falla || '-')}</td>
                      <td>
                        <span className={`status-badge ${statusClass}`}>
                          {statusRaw || 'Sin estado'}
                        </span>
                      </td>
                      <td>{diasOcultar ? '--' : calculateDaysElapsed(orden.fecha)}</td>
                      <td>{orden.gestor || '-'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Cards móviles */}
        <div className="ordenes-cards-mobile">
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
      </main>

      {/* Modal de detalles de orden */}
      {selectedOrden && (
        <div
          className="modal-overlay"
          onClick={e => {
            if (e.target.classList.contains('modal-overlay')) {
              setSelectedOrden(null);
            }
          }}
        >
          <div className="modal-container" onClick={e => e.stopPropagation()}>
            {renderOrderDetails(selectedOrden)}
            <button className="btn-cancel" onClick={() => setSelectedOrden(null)}>Cerrar</button>
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

      {/* Modal agregar orden */}
      {isAddOrderModalOpen && (
        <div
          className="modal-overlay"
          onClick={e => {
            if (e.target.classList.contains('modal-overlay')) {
              setIsAddOrderModalOpen(false);
            }
          }}
        >
          <div className="modal-container" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Agregar Orden de Servicio</h2>
              <button className="modal-close" onClick={() => setIsAddOrderModalOpen(false)}>×</button>
            </div>
            <form className="modal-body" onSubmit={handleAddOrder}>
              <div className="form-group">
                <label className="form-label">Fecha</label>
                <input
                  type="date"
                  className="form-input"
                  value={newOrder.fecha || ""}
                  onChange={(e) => handleInputChange("fecha", e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Cliente</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Nombre del cliente"
                  value={newOrder.cliente || ""}
                  onChange={(e) => handleInputChange("cliente", e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Teléfono</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="0000-0000"
                  value={newOrder.telefono || ""}
                  onChange={(e) => handleInputChange("telefono", e.target.value)}
                  pattern="[0-9+\-]*"
                  title="Solo números y signos (+, -)"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Número de Orden</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Número de orden"
                  value={newOrder.numero_orden || ""}
                  onChange={(e) => handleInputChange("numero_orden", e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">URL del archivo (opcional)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="https://..."
                  value={newOrder.archivo || ""}
                  onChange={(e) => handleInputChange("archivo", e.target.value)}
                />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={() => setIsAddOrderModalOpen(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-confirm" disabled={isLoading}>
                  {isLoading ? "Guardando..." : "Guardar Orden"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal actualizar estado */}
      {isUpdateStateModalOpen && selectedOrden && (
        <div className="modal-overlay" onClick={() => setIsUpdateStateModalOpen(false)}>
          <div className="modal-container" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Actualizar Estado</h2>
              <button className="modal-close" onClick={() => setIsUpdateStateModalOpen(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Selecciona el nuevo estado</label>
                <select
                  className="form-input"
                  value={selectedState}
                  onChange={(e) => setSelectedState(e.target.value)}
                >
                  <option value="">-- Seleccionar --</option>
                  {estados.map((estado) => (
                    <option key={estado} value={estado}>
                      {estado}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setIsUpdateStateModalOpen(false)}>
                Cancelar
              </button>
              <button className="btn-confirm" onClick={handleUpdateState}>
                Actualizar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdenesServicio;
