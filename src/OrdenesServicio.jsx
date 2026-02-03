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
  const [filtroSidebar, setFiltroSidebar] = useState("Pendientes"); // Filtro por defecto: Pendientes

  const estados = [
    "PENDIENTE DE VISITA",
    "PENDIENTE DE REPUESTO",
    "REPARADO",
    "SUGERENCIA DE CAMBIO",
    "FINALIZADO",
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
    const estado = order.estado || '';
    const statusRaw = ext && ext.status ? ext.status : (order.status || '');
    const esPendiente = !(statusRaw === 'Tu orden ha finalizado' || estado === 'FINALIZADO' || estado === 'ANULADA' || estado === 'REPARADO');
    return (
      <div className="order-details-modern">
        <h2 className="detail-title">📋 Detalles de la Orden</h2>
        
        <div className="detail-grid">
          <div className="detail-item">
            <span className="detail-icon">📅</span>
            <div className="detail-content">
              <span className="detail-label">Fecha</span>
              <span className="detail-value">{order.fecha}</span>
            </div>
          </div>
          
          <div className="detail-item">
            <span className="detail-icon">👤</span>
            <div className="detail-content">
              <span className="detail-label">Cliente</span>
              <span className="detail-value">{order.cliente}</span>
            </div>
          </div>
          
          <div className="detail-item">
            <span className="detail-icon">📞</span>
            <div className="detail-content">
              <span className="detail-label">Teléfono</span>
              <span className="detail-value">{order.telefono || 'No especificado'}</span>
            </div>
          </div>
          
          <div className="detail-item">
            <span className="detail-icon">🔢</span>
            <div className="detail-content">
              <span className="detail-label">Número de Orden</span>
              <span className="detail-value">{order.numero_orden}</span>
            </div>
          </div>
          
          <div className="detail-item">
            <span className="detail-icon">📱</span>
            <div className="detail-content">
              <span className="detail-label">Modelo</span>
              <span className="detail-value">{mostrarResuelto ? 'RESUELTO' : (ext === undefined ? 'Cargando...' : ext && ext.model ? ext.model : (ext === null ? 'Error' : 'N/A'))}</span>
            </div>
          </div>
          
          <div className="detail-item">
            <span className="detail-icon">🏷️</span>
            <div className="detail-content">
              <span className="detail-label">Marca</span>
              <span className="detail-value">{mostrarResuelto ? 'RESUELTO' : (ext === undefined ? 'Cargando...' : ext && ext.brand ? ext.brand : (ext === null ? 'Error' : 'N/A'))}</span>
            </div>
          </div>
          
          <div className="detail-item full-width">
            <span className="detail-icon">🔧</span>
            <div className="detail-content">
              <span className="detail-label">Falla</span>
              <span className="detail-value">{mostrarResuelto ? 'RESUELTO' : (ext === undefined ? 'Cargando...' : ext === null ? 'Error' : ((ext.damage && ext.damage.trim()) ? ext.damage : (ext.reportedDamage && ext.reportedDamage.trim() ? ext.reportedDamage : 'Sin información')))}</span>
            </div>
          </div>
          
          <div className="detail-item">
            <span className="detail-icon">📊</span>
            <div className="detail-content">
              <span className="detail-label">Status</span>
              <span className="detail-value">{mostrarResuelto ? 'RESUELTO' : (ext === undefined ? 'Cargando...' : ext && ext.status ? ext.status : (ext === null ? 'Error' : order.status || 'N/A'))}</span>
            </div>
          </div>
          
          <div className="detail-item">
            <span className="detail-icon">⏱️</span>
            <div className="detail-content">
              <span className="detail-label">Días Transcurridos</span>
              <span className="detail-value">{calculateDaysElapsed(order.fecha)}</span>
            </div>
          </div>
          
          <div className="detail-item">
            <span className="detail-icon">🎯</span>
            <div className="detail-content">
              <span className="detail-label">Estado</span>
              <span className="detail-value">{order.estado}</span>
            </div>
          </div>
          
          <div className="detail-item">
            <span className="detail-icon">👨‍💼</span>
            <div className="detail-content">
              <span className="detail-label">Gestor</span>
              <span className="detail-value">{order.gestor || 'No asignado'}</span>
            </div>
          </div>
        </div>
        
        {order.archivo && (
          <div className="detail-archivo">
            <span className="detail-icon">📎</span>
            <div className="detail-content">
              <span className="detail-label">Archivo Adjunto</span>
              {order.archivo.startsWith("http") ? (
                <a href={order.archivo} target="_blank" rel="noopener noreferrer" className="archivo-link">
                  Ver archivo
                </a>
              ) : (
                <a href={`https://caqukltkvvsfairqphjf.supabase.co/storage/v1/object/public/archivos/${order.archivo}`} target="_blank" rel="noopener noreferrer" className="archivo-link">
                  Ver archivo
                </a>
              )}
            </div>
          </div>
        )}
        
        <div className="detail-actions">
          <button className="btn-detail-edit" onClick={() => { setIsEditOrderModalOpen(true); setOrdenAEditar(order); }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Editar Orden
          </button>
          <button className="btn-detail-update" onClick={() => setIsUpdateStateModalOpen(true)}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0119.5-3M22 12.5a10 10 0 01-19.5 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Actualizar Estado
          </button>
          {esPendiente && (
            <button className="btn-detail-finalize" onClick={(e) => handleQuickFinalize(order, e)}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{marginRight: '8px'}}>
                <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Finalizar Orden
            </button>
          )}
        </div>
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

  // Nueva función para marcar como finalizado con un click
  const handleQuickFinalize = async (orden, e) => {
    e.stopPropagation();
    
    const confirmar = window.confirm(
      `¿Deseas marcar la orden ${orden.numero_orden} como FINALIZADA?`
    );
    
    if (!confirmar) return;

    const { error } = await supabase
      .from("ordenes_servicio")
      .update({ 
        estado: "FINALIZADO",
        status: "Tu orden ha finalizado"
      })
      .eq("id", orden.id);

    if (!error) {
      setShowActualizadoModal(true);
      setTimeout(() => setShowActualizadoModal(false), 1500);
      
      // Refrescar todas las órdenes
      const { data: ordenesActualizadas } = await supabase
        .from("ordenes_servicio")
        .select("*")
        .eq("tienda_usuario", miTienda);
      setOrdenes(ordenesActualizadas || []);
    } else {
      console.error("Error al actualizar:", error);
      alert("Error al actualizar la orden: " + (error.message || "Desconocido"));
    }
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
    
    // Filtro sidebar mejorado con soporte dinámico
    let matchesSidebar = true;
    const status = orden.status || '';
    const estado = orden.estado || '';
    
    if (filtroSidebar === "Pendientes") {
      // Mostrar órdenes que NO estén finalizadas, resueltas ni rechazadas
      matchesSidebar = 
        status !== 'Tu orden ha finalizado' && 
        !estado.includes('FINALIZADO') && 
        !estado.includes('ANULADA') &&
        !estado.includes('RECHAZADA') &&
        estado !== 'REPARADO';
    } else if (filtroSidebar === "Todas") {
      matchesSidebar = true;
    } else if (filtroSidebar === "Finalizadas") {
      matchesSidebar = status === 'Tu orden ha finalizado' || estado === 'FINALIZADO' || estado === 'REPARADO';
    } else if (filtroSidebar === "Anuladas") {
      matchesSidebar = estado === 'ANULADA';
    } else {
      // Para cualquier otro filtro, buscar por Status
      matchesSidebar = status === filtroSidebar;
    }
    
    return matchesSearch && matchesFilter && matchesTienda && matchesUser && matchesSidebar;
  });

  // Obtener todos los status únicos de las órdenes
  const todosLosStatus = [...new Set(ordenes.map(o => o.status).filter(Boolean))];
  
  // Métricas para las tarjetas
  const metricas = {
    total: ordenes.length,
    pendientes: ordenes.filter(o => {
      const status = o.status || '';
      const estado = o.estado || '';
      return status !== 'Tu orden ha finalizado' && 
             !estado.includes('FINALIZADO') && 
             !estado.includes('ANULADA') &&
             !estado.includes('RECHAZADA') &&
             estado !== 'REPARADO';
    }).length,
    finalizadas: ordenes.filter(o => o.status === 'Tu orden ha finalizado' || o.estado === 'FINALIZADO' || o.estado === 'REPARADO').length,
    enReparacion: ordenes.filter(o => o.status === 'Tu artículo está en proceso de reparación').length,
    enRevision: ordenes.filter(o => o.status === 'Tu artículo está en proceso de revisión').length,
    recibidas: ordenes.filter(o => o.status === 'Tu orden ha sido recibida').length,
    anuladas: ordenes.filter(o => o.estado === 'ANULADA').length,
  };
  
  // Crear filtros dinámicos basados en Status
  const filtrosDinamicos = [
    { nombre: 'Pendientes', count: metricas.pendientes },
    { nombre: 'Todas', count: metricas.total },
    { nombre: 'Finalizadas', count: metricas.finalizadas },
    ...todosLosStatus.map(status => ({
      nombre: status,
      count: ordenes.filter(o => o.status === status).length
    })),
    { nombre: 'Anuladas', count: metricas.anuladas },
  ];

  return (
    <div className="ordenes-layout">
      {/* Sidebar de filtros */}
      <aside className="ordenes-sidebar">
        <div className="sidebar-section">
          <div className="sidebar-title">Filtros</div>
          <div className="sidebar-filters">
            {filtrosDinamicos.map((filtro) => {
              return (
                <div
                  key={filtro.nombre}
                  className={`filter-item ${filtroSidebar === filtro.nombre ? "active" : ""}`}
                  onClick={() => setFiltroSidebar(filtro.nombre)}
                >
                  <span>{filtro.nombre}</span>
                  <span className="filter-badge">{filtro.count}</span>
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
              {filteredOrdenes.length} órdenes • {metricas.pendientes} pendientes
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
          <div className="metric-card total">
            <div className="metric-icon">📊</div>
            <div className="metric-info">
              <div className="metric-label">Total Órdenes</div>
              <div className="metric-value">{metricas.total}</div>
            </div>
          </div>
          <div className="metric-card pending">
            <div className="metric-icon">⏳</div>
            <div className="metric-info">
              <div className="metric-label">Pendientes</div>
              <div className="metric-value">{metricas.pendientes}</div>
            </div>
          </div>
          <div className="metric-card finished">
            <div className="metric-icon">✅</div>
            <div className="metric-info">
              <div className="metric-label">Finalizadas</div>
              <div className="metric-value">{metricas.finalizadas}</div>
            </div>
          </div>
          <div className="metric-card repair">
            <div className="metric-icon">🔧</div>
            <div className="metric-info">
              <div className="metric-label">En Reparación</div>
              <div className="metric-value">{metricas.enReparacion}</div>
            </div>
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
                  <th className="th-fecha">
                    <div className="th-content">
                      <svg className="th-icon" width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
                        <path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="2"/>
                      </svg>
                      <span>Fecha</span>
                    </div>
                  </th>
                  <th className="th-cliente">
                    <div className="th-content">
                      <svg className="th-icon" width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="8" r="5" stroke="currentColor" strokeWidth="2"/>
                        <path d="M20 21a8 8 0 10-16 0" stroke="currentColor" strokeWidth="2"/>
                      </svg>
                      <span>Cliente</span>
                    </div>
                  </th>
                  <th className="th-telefono">
                    <div className="th-content">
                      <svg className="th-icon" width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" stroke="currentColor" strokeWidth="2"/>
                      </svg>
                      <span>Teléfono</span>
                    </div>
                  </th>
                  <th className="th-orden">
                    <div className="th-content">
                      <svg className="th-icon" width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke="currentColor" strokeWidth="2"/>
                        <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke="currentColor" strokeWidth="2"/>
                      </svg>
                      <span>Nº Orden</span>
                    </div>
                  </th>
                  <th className="th-modelo">
                    <div className="th-content">
                      <svg className="th-icon" width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <rect x="5" y="2" width="14" height="20" rx="2" stroke="currentColor" strokeWidth="2"/>
                        <path d="M12 18h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                      <span>Modelo</span>
                    </div>
                  </th>
                  <th className="th-marca">
                    <div className="th-content">
                      <svg className="th-icon" width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" stroke="currentColor" strokeWidth="2"/>
                        <circle cx="7" cy="7" r="1" fill="currentColor"/>
                      </svg>
                      <span>Marca</span>
                    </div>
                  </th>
                  <th className="th-falla">
                    <div className="th-content">
                      <svg className="th-icon" width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="currentColor" strokeWidth="2"/>
                        <path d="M12 9v4M12 17h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                      <span>Falla</span>
                    </div>
                  </th>
                  <th className="th-status">
                    <div className="th-content">
                      <svg className="th-icon" width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                        <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                      <span>Status</span>
                    </div>
                  </th>
                  <th className="th-dias">
                    <div className="th-content">
                      <svg className="th-icon" width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                        <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                      <span>Días</span>
                    </div>
                  </th>
                  <th className="th-gestor">
                    <div className="th-content">
                      <svg className="th-icon" width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="2"/>
                        <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
                      </svg>
                      <span>Gestor</span>
                    </div>
                  </th>
                  <th className="th-estado">
                    <div className="th-content">
                      <svg className="th-icon" width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M22 11.08V12a10 10 0 11-5.93-9.14" stroke="currentColor" strokeWidth="2"/>
                        <path d="M22 4L12 14.01l-3-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                      <span>Estado</span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredOrdenes.map((orden) => {
                  const ext = corOneData.hasOwnProperty(orden.numero_orden)
                    ? corOneData[orden.numero_orden]
                    : undefined;
                  const statusRaw = ext && ext.status ? ext.status : (orden.status || '');
                  const estado = orden.estado || '';
                  const statusValue = statusRaw.toLowerCase();
                  
                  let statusClass = '';
                  if (statusRaw === 'Tu orden ha finalizado' || estado === 'FINALIZADO' || estado === 'REPARADO') statusClass = 'status-finalizado';
                  else if (statusRaw === 'Tu artículo está en proceso de reparación') statusClass = 'status-proceso';
                  else if (statusRaw === 'Tu artículo está en proceso de revisión') statusClass = 'status-revision';
                  else if (statusRaw === 'Tu orden ha sido recibida') statusClass = 'status-recibida';
                  else if (statusValue.includes('anulado') || statusValue.includes('anulada') || estado === 'ANULADA') statusClass = 'status-anulada';
                  else if (estado === 'PENDIENTE DE VISITA') statusClass = 'status-pendiente';
                  else if (estado === 'PENDIENTE DE REPUESTO') statusClass = 'status-pendiente-repuesto';
                  
                  const diasOcultar = statusValue.includes('anulado') || statusValue.includes('anulada') || statusValue.includes('rechazada') || statusValue.includes('finalizada') || statusRaw === 'Tu orden ha finalizado' || estado === 'FINALIZADO' || estado === 'ANULADA';
                  
                  const esPendiente = estado !== 'FINALIZADO' && estado !== 'ANULADA' && estado !== 'REPARADO' && statusRaw !== 'Tu orden ha finalizado';
                  
                  return (
                    <tr key={orden.id} onClick={() => handleRowClick(orden)} className="table-row-hover">
                      <td className="td-fecha">{orden.fecha}</td>
                      <td className="td-cliente">{orden.cliente}</td>
                      <td className="td-telefono">{orden.telefono || '-'}</td>
                      <td className="td-orden">
                        <div className="orden-numero-cell">
                          <span className="orden-numero-text">{orden.numero_orden}</span>
                          <div className="orden-numero-actions">
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
                          </div>
                        </div>
                      </td>
                      <td className="td-modelo">{ext && ext.model ? ext.model : (orden.modelo || '-')}</td>
                      <td className="td-marca">{ext && ext.brand ? ext.brand : (orden.marca || '-')}</td>
                      <td className="td-falla">
                        <div className="falla-content" title={ext && (ext.damage || ext.reportedDamage) ? (ext.damage || ext.reportedDamage) : (orden.falla || '-')}>
                          {ext && (ext.damage || ext.reportedDamage) ? (ext.damage || ext.reportedDamage) : (orden.falla || '-')}
                        </div>
                      </td>
                      <td className="td-status">
                        <span className={`status-badge ${statusClass}`}>
                          {statusRaw || estado || 'Sin estado'}
                        </span>
                      </td>
                      <td className="td-dias">
                        <span className="dias-badge">{diasOcultar ? '--' : calculateDaysElapsed(orden.fecha)}</span>
                      </td>
                      <td className="td-gestor">{orden.gestor || '-'}</td>
                      <td className="td-estado">
                        {esPendiente ? (
                          <span className="pending-text">Pendiente</span>
                        ) : (
                          <span className="finalized-text">✓ Completada</span>
                        )}
                      </td>
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
          <div className="modal-container modal-agregar" onClick={e => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setIsAddOrderModalOpen(false)}>×</button>
            
            <h2 className="modal-title">➕ Agregar Orden de Servicio</h2>
            
            <form onSubmit={handleAddOrder} className="modal-form">
              <div className="form-grid-two">
                <div className="form-group-modern">
                  <label className="form-label-modern">
                    <span className="label-icon">📅</span>
                    Fecha
                  </label>
                  <input
                    type="date"
                    className="form-input-modern"
                    value={newOrder.fecha || ""}
                    onChange={(e) => handleInputChange("fecha", e.target.value)}
                    required
                  />
                </div>

                <div className="form-group-modern">
                  <label className="form-label-modern">
                    <span className="label-icon">👤</span>
                    Cliente
                  </label>
                  <input
                    type="text"
                    className="form-input-modern"
                    placeholder="Nombre del cliente"
                    value={newOrder.cliente || ""}
                    onChange={(e) => handleInputChange("cliente", e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-grid-two">
                <div className="form-group-modern">
                  <label className="form-label-modern">
                    <span className="label-icon">📞</span>
                    Teléfono
                  </label>
                  <input
                    type="text"
                    className="form-input-modern"
                    placeholder="0000-0000"
                    value={newOrder.telefono || ""}
                    onChange={(e) => handleInputChange("telefono", e.target.value)}
                    pattern="[0-9+\-]*"
                    title="Solo números y signos (+, -)"
                    required
                  />
                </div>

                <div className="form-group-modern">
                  <label className="form-label-modern">
                    <span className="label-icon">🔢</span>
                    Número de Orden
                  </label>
                  <input
                    type="text"
                    className="form-input-modern"
                    placeholder="Número de orden"
                    value={newOrder.numero_orden || ""}
                    onChange={(e) => handleInputChange("numero_orden", e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group-modern">
                <label className="form-label-modern">
                  <span className="label-icon">📎</span>
                  URL del archivo (opcional)
                </label>
                <input
                  type="text"
                  className="form-input-modern"
                  placeholder="https://..."
                  value={newOrder.archivo || ""}
                  onChange={(e) => handleInputChange("archivo", e.target.value)}
                />
              </div>

              <div className="modal-actions-modern">
                <button type="button" className="btn-modal-cancel" onClick={() => setIsAddOrderModalOpen(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-modal-confirm" disabled={isLoading}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{marginRight: '6px'}}>
                    <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
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
