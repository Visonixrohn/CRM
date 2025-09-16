
import React, { useState, useMemo } from "react";
import SeguimientoCardMobile from "./SeguimientoCardMobile";
import "./SeguimientoCardMobile.css";
import useSeguimiento from "./useSeguimiento";
import ModalEditarSeguimiento from "./ModalEditarSeguimiento";
import ModalAgregarSeguimiento from "./ModalAgregarSeguimiento";
import ModalAgregarSeguimientoMobile from "./ModalAgregarSeguimientoMobile";
import "./ModalAgregarSeguimientoMobile.css";
import { supabase } from "./supabaseClient";

const ESTADOS = [
  { label: "Gestionado", color: "#22c55e" },
  { label: "Reprogramado", color: "#fbbf24" },
  { label: "Facturado", color: "#6366f1" },
  { label: "Rechazado", color: "#ef4444" },
];

const colorEstado = (estado) => {
  const found = ESTADOS.find(e => e.label.toLowerCase() === (estado || "").toLowerCase());
  return found ? found.color : "#64748b";
};


const Seguimiento = () => {
  const { datos, loading, error, refetch } = useSeguimiento();
  const [busqueda, setBusqueda] = useState("");
  const [filtro, setFiltro] = useState("");
  const [modal, setModal] = useState({ open: false, row: null });
  const [modalAgregar, setModalAgregar] = useState(false);
  const [loadingAgregar, setLoadingAgregar] = useState(false);
  const [copiadoId, setCopiadoId] = useState(null);
  const userId = localStorage.getItem("userId");

  const handleAgregar = async (form) => {
    setLoadingAgregar(true);
    const registro = { ...form, id_usuario: userId };
    await supabase.from("seguimiento").insert([registro]);
    setLoadingAgregar(false);
    setModalAgregar(false);
    await refetch();
  };

  const handleOpenModal = (row) => setModal({ open: true, row });
  const handleCloseModal = () => setModal({ open: false, row: null });
  const handleSaveModal = async (valores) => {
    if (!modal.row) return;
    await supabase
      .from("seguimiento")
      .update({ estado: valores.estado, fecha_de_acuerdo: valores.fecha_de_acuerdo })
      .eq("id", modal.row.id);
    await refetch();
  };

  const datosFiltrados = useMemo(() => {
    const hoy = new Date().toISOString().split('T')[0];
    const arr = (datos || [])
      .filter(row => {
        // Solo mostrar filas del usuario logueado
        if (!userId || String(row.id_usuario) !== String(userId)) return false;
        const matchBusqueda =
          !busqueda ||
          (row.nombre_cliente && row.nombre_cliente.toLowerCase().includes(busqueda.toLowerCase())) ||
          (row.dni && row.dni.toLowerCase().includes(busqueda.toLowerCase())) ||
          (row.cel && row.cel.toLowerCase().includes(busqueda.toLowerCase())) ||
          (row.articulo && row.articulo.toLowerCase().includes(busqueda.toLowerCase()));
        const matchFiltro = !filtro || (row.estado && row.estado.toLowerCase() === filtro.toLowerCase());
        return matchBusqueda && matchFiltro;
      });
    // Ordenar: primero los de hoy, luego los pasados
    return arr.sort((a, b) => {
      const fa = (a.fecha_de_acuerdo || '').slice(0, 10);
      const fb = (b.fecha_de_acuerdo || '').slice(0, 10);
      if (fa === hoy && fb !== hoy) return -1;
      if (fa !== hoy && fb === hoy) return 1;
      // Si ambos son de hoy o ambos no, ordenar descendente por fecha
      return (fb || '').localeCompare(fa || '');
    });
  }, [datos, busqueda, filtro, userId]);

  return (
    <div style={{ padding: 24, position: 'relative' }}>
      <h2>Seguimiento</h2>
      {/* Botón y modal solo desktop */}
      <div className="seguimiento-agregar-desktop">
        <button
          onClick={() => setModalAgregar(true)}
          style={{
            position: 'fixed',
            bottom: 32,
            right: 32,
            background: '#2563eb',
            color: '#fff',
            border: 'none',
            borderRadius: '50%',
            width: 56,
            height: 56,
            fontSize: 32,
            boxShadow: '0 4px 16px #0003',
            cursor: 'pointer',
            zIndex: 1000
          }}
          title="Agregar seguimiento"
        >
          +
        </button>
        <ModalAgregarSeguimiento
          open={modalAgregar}
          onClose={() => setModalAgregar(false)}
          onSave={handleAgregar}
          loading={loadingAgregar}
        />
      </div>
      {/* Botón y modal solo móvil */}
      <div className="seguimiento-agregar-mobile">
        <button
          onClick={() => setModalAgregar(true)}
          style={{
            position: 'fixed',
            bottom: 120,
            right: 20,
            background: '#2563eb',
            color: '#fff',
            border: 'none',
            borderRadius: '50%',
            width: 56,
            height: 56,
            fontSize: 32,
            boxShadow: '0 4px 16px #0003',
            cursor: 'pointer',
            zIndex: 1000
          }}
          title="Agregar seguimiento"
        >
          +
        </button>
        <ModalAgregarSeguimientoMobile
          open={modalAgregar}
          onClose={() => setModalAgregar(false)}
          onSave={handleAgregar}
          loading={loadingAgregar}
        />
      </div>
  <div style={{ display: "flex", gap: 12, marginBottom: 18, flexWrap: "wrap" }}>

        <input
          type="text"
          placeholder="Buscar cliente, DNI, cel, artículo..."
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          style={{ padding: 8, borderRadius: 8, border: "1px solid #cbd5e1", minWidth: 220 }}
        />
        {ESTADOS.map(e => (
          <button
            key={e.label}
            onClick={() => setFiltro(filtro === e.label ? "" : e.label)}
            style={{
              background: filtro === e.label ? e.color : "#f1f5f9",
              color: filtro === e.label ? "#fff" : e.color,
              border: `1.5px solid ${e.color}`,
              borderRadius: 8,
              padding: "8px 16px",
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            {e.label}
          </button>
        ))}
        <button
          onClick={() => { setFiltro(""); setBusqueda(""); refetch(); }}
          style={{ background: "#e0e7ef", color: "#334155", border: "1px solid #cbd5e1", borderRadius: 8, padding: "8px 16px", fontWeight: 500, marginLeft: 8 }}
        >
          Limpiar
        </button>
      </div>
      {loading ? (
        <div style={{ color: "#64748b", marginTop: 32 }}>Cargando...</div>
      ) : error ? (
        <div style={{ color: "#ef4444", marginTop: 32 }}>Error: {error}</div>
      ) : (
        <>
          {/* Cards móviles */}
          <div className="seguimiento-cards-mobile" style={{ marginBottom: 24 }}>
            {datosFiltrados && datosFiltrados.length === 0 ? (
              <div style={{ textAlign: "center", color: "#64748b", padding: 24 }}>Sin resultados</div>
            ) : (
              datosFiltrados && datosFiltrados.map(row => (
                <SeguimientoCardMobile key={row.id} row={row} onClick={handleOpenModal} />
              ))
            )}
          </div>
          {/* Tabla solo desktop */}
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", background: "#fff", borderRadius: 12, boxShadow: "0 2px 12px #0001" }} className="seguimiento-table-desktop">
              <thead>
                <tr style={{ background: "#f1f5f9" }}>
                  <th style={{ padding: 10 }}>Cliente</th>
                  <th style={{ padding: 10 }}>DNI</th>
                  <th style={{ padding: 10 }}>Cel</th>
                  <th style={{ padding: 10 }}>Artículo</th>
                  <th style={{ padding: 10 }}>Tipo</th>
                  <th style={{ padding: 10 }}>Fecha de acuerdo</th>
                  <th style={{ padding: 10 }}>Estado</th>
                </tr>
              </thead>
              <tbody>
                {datosFiltrados && datosFiltrados.length === 0 ? (
                  <tr><td colSpan={7} style={{ textAlign: "center", color: "#64748b", padding: 24 }}>Sin resultados</td></tr>
                ) : (
                  datosFiltrados && datosFiltrados.map(row => (
                    <tr
                      key={row.id}
                      style={{ borderBottom: "1px solid #e5e7eb", cursor: "pointer" }}
                      onClick={() => handleOpenModal(row)}
                    >
                      <td style={{ padding: 10 }}>{row.nombre_cliente}</td>
                      <td style={{ padding: 10 }}>
                        {row.dni}
                        <button
                          title="Copiar DNI"
                          style={{
                            marginLeft: 8,
                            background: copiadoId === row.id ? '#e0f2fe' : '#f1f5f9',
                            border: '1.5px solid #2563eb',
                            borderRadius: 6,
                            cursor: 'pointer',
                            padding: '2px 6px',
                            verticalAlign: 'middle',
                            transition: 'background 0.2s, border 0.2s',
                            color: '#2563eb',
                            outline: 'none',
                            fontSize: 0
                          }}
                          onMouseOver={e => e.currentTarget.style.background = '#e0f2fe'}
                          onMouseOut={e => e.currentTarget.style.background = copiadoId === row.id ? '#e0f2fe' : '#f1f5f9'}
                          onClick={e => {
                            e.stopPropagation();
                            if (navigator && navigator.clipboard) {
                              navigator.clipboard.writeText(row.dni);
                              setCopiadoId(row.id);
                              setTimeout(() => setCopiadoId(null), 1200);
                            }
                          }}
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{verticalAlign:'middle',display:'block'}}>
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                          </svg>
                        </button>
                        {copiadoId === row.id && <span style={{color:'#22c55e',fontSize:12,marginLeft:4}}>¡Copiado!</span>}
                      </td>
                      <td style={{ padding: 10 }}>
                        {row.cel}
                        {row.cel && (
                          <>
                            <a
                              href={`https://web.whatsapp.com/send?phone=504${row.cel.replace(/[^\d]/g, "")}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="Chatear por WhatsApp"
                              style={{ marginLeft: 8, color: '#25D366', fontSize: '1.2em', verticalAlign: 'middle', textDecoration: 'none' }}
                              onClick={ev => ev.stopPropagation()}
                            >
                              <svg width="20" height="20" viewBox="0 0 32 32" fill="currentColor" style={{verticalAlign:'middle'}}>
                                <path d="M16 3C9.373 3 4 8.373 4 15c0 2.385.832 4.584 2.236 6.393L4 29l7.824-2.05C13.41 27.633 14.686 28 16 28c6.627 0 12-5.373 12-12S22.627 3 16 3zm0 22c-1.13 0-2.238-.188-3.287-.558l-.235-.08-4.646 1.217 1.24-4.527-.153-.236C7.188 19.238 7 18.13 7 17c0-4.963 4.037-9 9-9s9 4.037 9 9-4.037 9-9 9zm5.29-6.709c-.26-.13-1.54-.76-1.78-.85-.24-.09-.41-.13-.58.13-.17.26-.67.85-.82 1.02-.15.17-.3.19-.56.06-.26-.13-1.09-.4-2.08-1.28-.77-.68-1.29-1.52-1.44-1.78-.15-.26-.02-.4.11-.53.11-.11.26-.29.39-.44.13-.15.17-.26.26-.43.09-.17.04-.32-.02-.45-.06-.13-.58-1.4-.8-1.92-.21-.51-.43-.44-.58-.45-.15-.01-.32-.01-.5-.01-.17 0-.45.06-.68.28-.23.22-.9.88-.9 2.15s.92 2.49 1.05 2.66c.13.17 1.81 2.77 4.39 3.78.61.21 1.09.33 1.46.42.61.13 1.16.11 1.6.07.49-.05 1.54-.63 1.76-1.24.22-.61.22-1.13.15-1.24-.07-.11-.24-.17-.5-.3z"/>
                              </svg>
                            </a>
                          </>
                        )}
                      </td>
                      <td style={{ padding: 10 }}>{row.articulo}</td>
                      <td style={{ padding: 10 }}>{row.tipo}</td>
                      <td style={{ padding: 10 }}>{row.fecha_de_acuerdo}</td>
                      <td style={{ padding: 10 }}>
                        <span
                          style={{
                            display: 'inline-block',
                            background: colorEstado(row.estado),
                            color: '#fff',
                            borderRadius: 16,
                            padding: '6px 18px',
                            fontWeight: 700,
                            fontSize: '0.98em',
                            boxShadow: '0 2px 8px #0002',
                            letterSpacing: 1,
                            border: 'none',
                            minWidth: 90,
                            textAlign: 'center',
                            transition: 'background 0.2s',
                          }}
                        >
                          {row.estado}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <ModalEditarSeguimiento
            open={modal.open}
            row={modal.row}
            onClose={handleCloseModal}
            onSave={handleSaveModal}
          />
        </>
      )}
    </div>
  );
};

export default Seguimiento;
