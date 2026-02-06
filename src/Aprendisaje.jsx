import React, { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";

const tipos = ["Crédito", "Contado"];

function CarteraClientes() {
  const [clientes, setClientes] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filtroTipo, setFiltroTipo] = useState("Todos");
  const [busqueda, setBusqueda] = useState("");
  const userId = localStorage.getItem("userId");

  // Estados para agregar
  const [nuevoCliente, setNuevoCliente] = useState({
    tipo: "Crédito",
    nombre: "",
    tipo_cliente: "Cliente",
    celular: "",
    producto: "",
    gestionar: "",
    notas: ""
  });

  // Estados para editar
  const [clienteEditando, setClienteEditando] = useState({
    id: null,
    tipo: "",
    nombre: "",
    tipo_cliente: "",
    celular: "",
    fecha_compra: "",
    producto: "",
    gestionar: "",
    notas: ""
  });

  async function fetchClientes() {
    const { data, error } = await supabase
      .from("cartera_clientes")
      .select("*")
      .order("fecha_compra", { ascending: false });
    if (!error && data) setClientes(data);
  }

  useEffect(() => {
    fetchClientes();
  }, []);

  const handleAddCliente = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    if (!nuevoCliente.nombre || !nuevoCliente.celular) {
      setError("Completa los campos requeridos: Nombre y Celular.");
      setLoading(false);
      return;
    }
    
    const fechaActual = new Date().toISOString().split('T')[0];
    
    const { error } = await supabase
      .from("cartera_clientes")
      .insert({
        nombre: nuevoCliente.nombre,
        tipo_cliente: nuevoCliente.tipo_cliente,
        celular: nuevoCliente.celular,
        fecha_compra: fechaActual,
        tipo: nuevoCliente.tipo,
        producto: nuevoCliente.producto || null,
        gestionar: nuevoCliente.gestionar || null,
        notas: nuevoCliente.notas || null,
        usuario: userId
      });
      
    if (error) {
      console.error("Error al guardar:", error);
      setError("Error al guardar el cliente.");
    } else {
      setNuevoCliente({
        tipo: "Crédito",
        nombre: "",
        tipo_cliente: "Cliente",
        celular: "",
        producto: "",
        gestionar: "",
        notas: ""
      });
      setShowAddModal(false);
      fetchClientes();
    }
    setLoading(false);
  };

  const handleEdit = (cliente) => {
    setClienteEditando({
      id: cliente.id,
      tipo: cliente.tipo,
      nombre: cliente.nombre,
      tipo_cliente: cliente.tipo_cliente,
      celular: cliente.celular,
      fecha_compra: cliente.fecha_compra,
      producto: cliente.producto || "",
      gestionar: cliente.gestionar || "",
      notas: cliente.notas || ""
    });
    setShowEditModal(true);
    setError(null);
  };

  const handleUpdateCliente = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    if (!clienteEditando.nombre || !clienteEditando.tipo_cliente || !clienteEditando.celular || !clienteEditando.fecha_compra) {
      setError("Completa todos los campos requeridos.");
      setLoading(false);
      return;
    }
    
    const { error } = await supabase
      .from("cartera_clientes")
      .update({
        nombre: clienteEditando.nombre,
        tipo_cliente: clienteEditando.tipo_cliente,
        celular: clienteEditando.celular,
        fecha_compra: clienteEditando.fecha_compra,
        tipo: clienteEditando.tipo,
        producto: clienteEditando.producto || null,
        gestionar: clienteEditando.gestionar || null,
        notas: clienteEditando.notas || null,
        usuario: userId
      })
      .eq("id", clienteEditando.id);
      
    if (error) {
      console.error("Error al actualizar:", error);
      setError("Error al actualizar el cliente.");
    } else {
      setShowEditModal(false);
      setClienteEditando({
        id: null,
        tipo: "",
        nombre: "",
        tipo_cliente: "",
        celular: "",
        fecha_compra: "",
        producto: "",
        gestionar: "",
        notas: ""
      });
      fetchClientes();
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!confirm("¿Estás seguro de eliminar este cliente?")) return;
    
    setLoading(true);
    setError(null);
    const { error } = await supabase
      .from("cartera_clientes")
      .delete()
      .eq("id", id);
      
    if (error) {
      setError("Error al eliminar el cliente.");
    } else {
      fetchClientes();
    }
    setLoading(false);
  };

  // Filtrar clientes
  const clientesFiltrados = clientes.filter(cliente => {
    const cumpleFiltroTipo = filtroTipo === "Todos" || cliente.tipo === filtroTipo;
    const cumpleBusqueda = 
      cliente.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      cliente.celular.includes(busqueda) ||
      (cliente.producto && cliente.producto.toLowerCase().includes(busqueda.toLowerCase()));
    return cumpleFiltroTipo && cumpleBusqueda;
  });

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto', background: '#f8fafc', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '32px', borderRadius: '16px', marginBottom: '32px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
        <h1 style={{ color: '#fff', margin: 0, fontSize: '32px', fontWeight: '700', textAlign: 'center' }}>
          📋 Cartera de Clientes
        </h1>
        <p style={{ color: '#e0e7ff', textAlign: 'center', margin: '8px 0 0 0', fontSize: '16px' }}>
          Gestiona y organiza tu cartera de clientes
        </p>
      </div>

      {/* Barra de acciones */}
      <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', marginBottom: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: '12px', flex: 1, flexWrap: 'wrap' }}>
            <input
              type="text"
              placeholder="🔍 Buscar por nombre, celular o producto..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              style={{ 
                flex: 1, 
                minWidth: '250px',
                padding: '12px 16px', 
                borderRadius: '8px', 
                border: '2px solid #e2e8f0', 
                fontSize: '14px',
                outline: 'none',
                transition: 'border 0.3s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#667eea'}
              onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
            />
            <select 
              value={filtroTipo} 
              onChange={(e) => setFiltroTipo(e.target.value)}
              style={{ 
                padding: '12px 16px', 
                borderRadius: '8px', 
                border: '2px solid #e2e8f0', 
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                background: '#fff'
              }}
            >
              <option value="Todos">📊 Todos</option>
              <option value="Crédito">💳 Crédito</option>
              <option value="Contado">💵 Contado</option>
            </select>
          </div>
          <button 
            onClick={() => setShowAddModal(true)}
            style={{ 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
              color: '#fff', 
              padding: '12px 28px', 
              borderRadius: '8px', 
              border: 'none', 
              fontWeight: '700', 
              fontSize: '15px', 
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
              transition: 'all 0.3s'
            }}
            onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
            onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
          >
            ➕ Agregar Cliente
          </button>
        </div>
      </div>

      {/* Estadísticas */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', borderLeft: '4px solid #667eea' }}>
          <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '8px' }}>Total Clientes</div>
          <div style={{ fontSize: '28px', fontWeight: '700', color: '#1e293b' }}>{clientes.length}</div>
        </div>
        <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', borderLeft: '4px solid #f59e0b' }}>
          <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '8px' }}>Crédito</div>
          <div style={{ fontSize: '28px', fontWeight: '700', color: '#1e293b' }}>{clientes.filter(c => c.tipo === "Crédito").length}</div>
        </div>
        <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', borderLeft: '4px solid #10b981' }}>
          <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '8px' }}>Contado</div>
          <div style={{ fontSize: '28px', fontWeight: '700', color: '#1e293b' }}>{clientes.filter(c => c.tipo === "Contado").length}</div>
        </div>
      </div>

      {/* Tabla de clientes */}
      <div style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                <th style={{ padding: '16px', textAlign: 'left', fontWeight: '700', color: '#475569', fontSize: '13px', textTransform: 'uppercase' }}>Tipo</th>
                <th style={{ padding: '16px', textAlign: 'left', fontWeight: '700', color: '#475569', fontSize: '13px', textTransform: 'uppercase' }}>Nombre</th>
                <th style={{ padding: '16px', textAlign: 'left', fontWeight: '700', color: '#475569', fontSize: '13px', textTransform: 'uppercase' }}>Tipo Cliente</th>
                <th style={{ padding: '16px', textAlign: 'left', fontWeight: '700', color: '#475569', fontSize: '13px', textTransform: 'uppercase' }}>Celular</th>
                <th style={{ padding: '16px', textAlign: 'left', fontWeight: '700', color: '#475569', fontSize: '13px', textTransform: 'uppercase' }}>Producto</th>
                <th style={{ padding: '16px', textAlign: 'left', fontWeight: '700', color: '#475569', fontSize: '13px', textTransform: 'uppercase' }}>F. Compra</th>
                <th style={{ padding: '16px', textAlign: 'left', fontWeight: '700', color: '#475569', fontSize: '13px', textTransform: 'uppercase' }}>Gestionar</th>
                <th style={{ padding: '16px', textAlign: 'center', fontWeight: '700', color: '#475569', fontSize: '13px', textTransform: 'uppercase' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {clientesFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: '48px', textAlign: 'center', color: '#94a3b8', fontSize: '16px' }}>
                    {busqueda || filtroTipo !== "Todos" ? "No se encontraron clientes con los filtros aplicados" : "No hay clientes registrados"}
                  </td>
                </tr>
              ) : (
                clientesFiltrados.map((cliente, index) => (
                  <tr 
                    key={cliente.id} 
                    style={{ 
                      borderBottom: '1px solid #f1f5f9',
                      background: index % 2 === 0 ? '#fff' : '#f8fafc',
                      transition: 'background 0.2s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.background = '#f0f9ff'}
                    onMouseOut={(e) => e.currentTarget.style.background = index % 2 === 0 ? '#fff' : '#f8fafc'}
                  >
                    <td style={{ padding: '16px' }}>
                      <span style={{ 
                        padding: '6px 12px', 
                        borderRadius: '6px', 
                        fontSize: '12px', 
                        fontWeight: '600',
                        background: cliente.tipo === "Crédito" ? '#fef3c7' : '#d1fae5',
                        color: cliente.tipo === "Crédito" ? '#92400e' : '#065f46'
                      }}>
                        {cliente.tipo === "Crédito" ? "💳" : "💵"} {cliente.tipo}
                      </span>
                    </td>
                    <td style={{ padding: '16px', fontWeight: '600', color: '#1e293b' }}>{cliente.nombre}</td>
                    <td style={{ padding: '16px', color: '#475569' }}>{cliente.tipo_cliente}</td>
                    <td style={{ padding: '16px', color: '#475569' }}>{cliente.celular}</td>
                    <td style={{ padding: '16px', color: '#475569' }}>{cliente.producto || '-'}</td>
                    <td style={{ padding: '16px', color: '#475569' }}>{cliente.fecha_compra}</td>
                    <td style={{ padding: '16px', color: '#475569' }}>
                      {cliente.gestionar ? (
                        <span style={{ fontSize: '12px', padding: '4px 8px', background: '#fef3c7', borderRadius: '4px', color: '#92400e' }}>
                          📅 {cliente.gestionar}
                        </span>
                      ) : '-'}
                    </td>
                    <td style={{ padding: '16px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                        <button 
                          onClick={() => handleEdit(cliente)}
                          style={{ 
                            background: '#3b82f6', 
                            color: '#fff', 
                            border: 'none', 
                            borderRadius: '6px', 
                            padding: '8px 14px', 
                            fontWeight: '600', 
                            cursor: 'pointer',
                            fontSize: '13px',
                            transition: 'all 0.2s'
                          }}
                          onMouseOver={(e) => e.target.style.background = '#2563eb'}
                          onMouseOut={(e) => e.target.style.background = '#3b82f6'}
                        >
                          ✏️ Editar
                        </button>
                        <button 
                          onClick={() => handleDelete(cliente.id)}
                          style={{ 
                            background: '#ef4444', 
                            color: '#fff', 
                            border: 'none', 
                            borderRadius: '6px', 
                            padding: '8px 14px', 
                            fontWeight: '600', 
                            cursor: 'pointer',
                            fontSize: '13px',
                            transition: 'all 0.2s'
                          }}
                          onMouseOver={(e) => e.target.style.background = '#dc2626'}
                          onMouseOut={(e) => e.target.style.background = '#ef4444'}
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Agregar Cliente */}
      {showAddModal && (
        <div style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          background: 'rgba(0,0,0,0.6)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          zIndex: 1000,
          backdropFilter: 'blur(4px)'
        }}>
          <div style={{ 
            background: '#fff', 
            padding: '32px', 
            borderRadius: '16px', 
            maxWidth: '600px', 
            width: '90%', 
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)' 
          }}>
            <h2 style={{ margin: '0 0 24px 0', color: '#1e293b', fontSize: '24px', fontWeight: '700' }}>
              ➕ Agregar Nuevo Cliente
            </h2>
            <form onSubmit={handleAddCliente}>
              <div style={{ display: 'grid', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#475569', fontSize: '14px' }}>
                    Tipo de Cartera <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <select 
                    value={nuevoCliente.tipo} 
                    onChange={(e) => setNuevoCliente({...nuevoCliente, tipo: e.target.value})}
                    style={{ 
                      padding: '12px', 
                      borderRadius: '8px', 
                      width: '100%', 
                      border: '2px solid #e2e8f0', 
                      fontSize: '14px',
                      boxSizing: 'border-box',
                      cursor: 'pointer'
                    }}
                  >
                    {tipos.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#475569', fontSize: '14px' }}>
                    Nombre <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input 
                    type="text" 
                    value={nuevoCliente.nombre} 
                    onChange={(e) => setNuevoCliente({...nuevoCliente, nombre: e.target.value})}
                    placeholder="Nombre completo del cliente" 
                    style={{ 
                      padding: '12px', 
                      borderRadius: '8px', 
                      width: '100%', 
                      border: '2px solid #e2e8f0', 
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }} 
                    required 
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#475569', fontSize: '14px' }}>
                    Tipo de Cliente
                  </label>
                  <input 
                    type="text" 
                    value={nuevoCliente.tipo_cliente} 
                    onChange={(e) => setNuevoCliente({...nuevoCliente, tipo_cliente: e.target.value})}
                    placeholder="Ej: Cliente, Distribuidor, etc." 
                    style={{ 
                      padding: '12px', 
                      borderRadius: '8px', 
                      width: '100%', 
                      border: '2px solid #e2e8f0', 
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }} 
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#475569', fontSize: '14px' }}>
                    Celular <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input 
                    type="text" 
                    value={nuevoCliente.celular} 
                    onChange={(e) => setNuevoCliente({...nuevoCliente, celular: e.target.value})}
                    placeholder="Número de celular" 
                    style={{ 
                      padding: '12px', 
                      borderRadius: '8px', 
                      width: '100%', 
                      border: '2px solid #e2e8f0', 
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }} 
                    required 
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#475569', fontSize: '14px' }}>
                    Producto
                  </label>
                  <input 
                    type="text" 
                    value={nuevoCliente.producto} 
                    onChange={(e) => setNuevoCliente({...nuevoCliente, producto: e.target.value})}
                    placeholder="Producto adquirido" 
                    style={{ 
                      padding: '12px', 
                      borderRadius: '8px', 
                      width: '100%', 
                      border: '2px solid #e2e8f0', 
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }} 
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#475569', fontSize: '14px' }}>
                    Fecha para Gestionar
                  </label>
                  <input 
                    type="date" 
                    value={nuevoCliente.gestionar} 
                    onChange={(e) => setNuevoCliente({...nuevoCliente, gestionar: e.target.value})}
                    style={{ 
                      padding: '12px', 
                      borderRadius: '8px', 
                      width: '100%', 
                      border: '2px solid #e2e8f0', 
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }} 
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#475569', fontSize: '14px' }}>
                    Notas
                  </label>
                  <textarea 
                    value={nuevoCliente.notas} 
                    onChange={(e) => setNuevoCliente({...nuevoCliente, notas: e.target.value})}
                    placeholder="Notas adicionales sobre el cliente..." 
                    rows={4}
                    style={{ 
                      padding: '12px', 
                      borderRadius: '8px', 
                      width: '100%', 
                      border: '2px solid #e2e8f0', 
                      fontSize: '14px',
                      boxSizing: 'border-box',
                      fontFamily: 'inherit',
                      resize: 'vertical'
                    }} 
                  />
                </div>
              </div>

              {error && (
                <div style={{ 
                  background: '#fee2e2', 
                  color: '#991b1b', 
                  padding: '12px', 
                  borderRadius: '8px', 
                  marginTop: '16px',
                  fontSize: '14px',
                  fontWeight: '600'
                }}>
                  {error}
                </div>
              )}

              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <button 
                  type="submit" 
                  disabled={loading} 
                  style={{ 
                    flex: 1,
                    background: loading ? '#94a3b8' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
                    color: '#fff', 
                    padding: '14px', 
                    borderRadius: '8px', 
                    border: 'none', 
                    fontWeight: '700', 
                    cursor: loading ? 'not-allowed' : 'pointer', 
                    fontSize: '15px',
                    transition: 'all 0.3s'
                  }}
                >
                  {loading ? "Guardando..." : "✓ Guardar Cliente"}
                </button>
                <button 
                  type="button" 
                  onClick={() => { 
                    setShowAddModal(false); 
                    setNuevoCliente({
                      tipo: "Crédito",
                      nombre: "",
                      tipo_cliente: "Cliente",
                      celular: "",
                      producto: "",
                      gestionar: "",
                      notas: ""
                    }); 
                    setError(null); 
                  }} 
                  style={{ 
                    flex: 1,
                    background: '#64748b', 
                    color: '#fff', 
                    padding: '14px', 
                    borderRadius: '8px', 
                    border: 'none', 
                    fontWeight: '700', 
                    cursor: 'pointer', 
                    fontSize: '15px',
                    transition: 'all 0.3s'
                  }}
                >
                  ✕ Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Editar Cliente */}
      {showEditModal && (
        <div style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          background: 'rgba(0,0,0,0.6)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          zIndex: 1000,
          backdropFilter: 'blur(4px)'
        }}>
          <div style={{ 
            background: '#fff', 
            padding: '32px', 
            borderRadius: '16px', 
            maxWidth: '600px', 
            width: '90%', 
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)' 
          }}>
            <h2 style={{ margin: '0 0 24px 0', color: '#1e293b', fontSize: '24px', fontWeight: '700' }}>
              ✏️ Editar Cliente
            </h2>
            <form onSubmit={handleUpdateCliente}>
              <div style={{ display: 'grid', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#475569', fontSize: '14px' }}>
                    Tipo de Cartera <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <select 
                    value={clienteEditando.tipo} 
                    onChange={(e) => setClienteEditando({...clienteEditando, tipo: e.target.value})}
                    style={{ 
                      padding: '12px', 
                      borderRadius: '8px', 
                      width: '100%', 
                      border: '2px solid #e2e8f0', 
                      fontSize: '14px',
                      boxSizing: 'border-box',
                      cursor: 'pointer'
                    }}
                  >
                    {tipos.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#475569', fontSize: '14px' }}>
                    Nombre <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input 
                    type="text" 
                    value={clienteEditando.nombre} 
                    onChange={(e) => setClienteEditando({...clienteEditando, nombre: e.target.value})}
                    placeholder="Nombre completo del cliente" 
                    style={{ 
                      padding: '12px', 
                      borderRadius: '8px', 
                      width: '100%', 
                      border: '2px solid #e2e8f0', 
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }} 
                    required 
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#475569', fontSize: '14px' }}>
                    Tipo de Cliente <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input 
                    type="text" 
                    value={clienteEditando.tipo_cliente} 
                    onChange={(e) => setClienteEditando({...clienteEditando, tipo_cliente: e.target.value})}
                    placeholder="Ej: Cliente, Distribuidor, etc." 
                    style={{ 
                      padding: '12px', 
                      borderRadius: '8px', 
                      width: '100%', 
                      border: '2px solid #e2e8f0', 
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }} 
                    required
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#475569', fontSize: '14px' }}>
                    Celular <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input 
                    type="text" 
                    value={clienteEditando.celular} 
                    onChange={(e) => setClienteEditando({...clienteEditando, celular: e.target.value})}
                    placeholder="Número de celular" 
                    style={{ 
                      padding: '12px', 
                      borderRadius: '8px', 
                      width: '100%', 
                      border: '2px solid #e2e8f0', 
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }} 
                    required 
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#475569', fontSize: '14px' }}>
                    Fecha de Compra <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input 
                    type="date" 
                    value={clienteEditando.fecha_compra} 
                    onChange={(e) => setClienteEditando({...clienteEditando, fecha_compra: e.target.value})}
                    style={{ 
                      padding: '12px', 
                      borderRadius: '8px', 
                      width: '100%', 
                      border: '2px solid #e2e8f0', 
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }} 
                    required 
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#475569', fontSize: '14px' }}>
                    Producto
                  </label>
                  <input 
                    type="text" 
                    value={clienteEditando.producto} 
                    onChange={(e) => setClienteEditando({...clienteEditando, producto: e.target.value})}
                    placeholder="Producto adquirido" 
                    style={{ 
                      padding: '12px', 
                      borderRadius: '8px', 
                      width: '100%', 
                      border: '2px solid #e2e8f0', 
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }} 
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#475569', fontSize: '14px' }}>
                    Fecha para Gestionar
                  </label>
                  <input 
                    type="date" 
                    value={clienteEditando.gestionar} 
                    onChange={(e) => setClienteEditando({...clienteEditando, gestionar: e.target.value})}
                    style={{ 
                      padding: '12px', 
                      borderRadius: '8px', 
                      width: '100%', 
                      border: '2px solid #e2e8f0', 
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }} 
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#475569', fontSize: '14px' }}>
                    Notas
                  </label>
                  <textarea 
                    value={clienteEditando.notas} 
                    onChange={(e) => setClienteEditando({...clienteEditando, notas: e.target.value})}
                    placeholder="Notas adicionales sobre el cliente..." 
                    rows={4}
                    style={{ 
                      padding: '12px', 
                      borderRadius: '8px', 
                      width: '100%', 
                      border: '2px solid #e2e8f0', 
                      fontSize: '14px',
                      boxSizing: 'border-box',
                      fontFamily: 'inherit',
                      resize: 'vertical'
                    }} 
                  />
                </div>
              </div>

              {error && (
                <div style={{ 
                  background: '#fee2e2', 
                  color: '#991b1b', 
                  padding: '12px', 
                  borderRadius: '8px', 
                  marginTop: '16px',
                  fontSize: '14px',
                  fontWeight: '600'
                }}>
                  {error}
                </div>
              )}

              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <button 
                  type="submit" 
                  disabled={loading} 
                  style={{ 
                    flex: 1,
                    background: loading ? '#94a3b8' : '#3b82f6', 
                    color: '#fff', 
                    padding: '14px', 
                    borderRadius: '8px', 
                    border: 'none', 
                    fontWeight: '700', 
                    cursor: loading ? 'not-allowed' : 'pointer', 
                    fontSize: '15px',
                    transition: 'all 0.3s'
                  }}
                >
                  {loading ? "Actualizando..." : "✓ Actualizar Cliente"}
                </button>
                <button 
                  type="button" 
                  onClick={() => { 
                    setShowEditModal(false); 
                    setClienteEditando({
                      id: null,
                      tipo: "",
                      nombre: "",
                      tipo_cliente: "",
                      celular: "",
                      fecha_compra: "",
                      producto: "",
                      gestionar: "",
                      notas: ""
                    }); 
                    setError(null); 
                  }} 
                  style={{ 
                    flex: 1,
                    background: '#64748b', 
                    color: '#fff', 
                    padding: '14px', 
                    borderRadius: '8px', 
                    border: 'none', 
                    fontWeight: '700', 
                    cursor: 'pointer', 
                    fontSize: '15px',
                    transition: 'all 0.3s'
                  }}
                >
                  ✕ Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default CarteraClientes;
