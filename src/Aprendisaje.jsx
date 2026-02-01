import React, { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";

const tipos = ["Crédito", "Contado"];

function CarteraClientes() {
  const [editId, setEditId] = useState(null);
  const [editTipo, setEditTipo] = useState("");
  const [editNombre, setEditNombre] = useState("");
  const [editTipoCliente, setEditTipoCliente] = useState("");
  const [editCelular, setEditCelular] = useState("");
  const [editFechaCompra, setEditFechaCompra] = useState("");
  const [showModal, setShowModal] = useState(false);
  const userId = localStorage.getItem("userId");
  const handleEdit = (cliente) => {
    setEditId(cliente.id);
    setEditTipo(cliente.tipo);
    setEditNombre(cliente.nombre);
    setEditTipoCliente(cliente.tipo_cliente);
    setEditCelular(cliente.celular);
    setEditFechaCompra(cliente.fecha_compra);
    setError(null);
  };

  const handleUpdateCliente = async (e) => {
    e.preventDefault();
    if (!editNombre || !editTipoCliente || !editCelular || !editFechaCompra || !editTipo) {
      setError("Completa todos los campos.");
      setLoading(false);
      return;
    }
    const { error } = await supabase
      .from("cartera_clientes")
      .update({
        nombre: editNombre,
        tipo_cliente: editTipoCliente,
        celular: editCelular,
        fecha_compra: editFechaCompra,
        tipo: editTipo,
        usuario: userId
      })
      .eq("id", editId);
    if (error) {
      setError("Error al actualizar el cliente.");
    } else {
      setEditId(null);
      setEditTipo("");
      setEditNombre("");
          usuario: userId
      setEditTipoCliente("");
      setEditCelular("");
      setEditFechaCompra("");
      fetchClientes();
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
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
  const [clientes, setClientes] = useState([]);
  const [tipo, setTipo] = useState("Crédito");
  const [nombre, setNombre] = useState("");
  const [celular, setCelular] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
          usuario: userId

  async function fetchClientes() {
    const { data, error } = await supabase
      .from("cartera_clientes")
      .select("id, nombre, tipo_cliente, celular, fecha_compra, tipo")
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
    if (!nombre || !celular) {
      setError("Completa todos los campos.");
      setLoading(false);
      return;
    }
    
    // Obtener la fecha actual en formato YYYY-MM-DD
    const fechaActual = new Date().toISOString().split('T')[0];
    
    const { error } = await supabase
      .from("cartera_clientes")
      .insert({
        nombre,
        tipo_cliente: "Cliente", // Valor por defecto
        celular,
        fecha_compra: fechaActual,
        tipo,
        usuario: userId
      });
    if (error) {
      setError("Error al guardar el cliente.");
    } else {
      setNombre("");
      setCelular("");
      setShowModal(false);
      fetchClientes();
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ textAlign: "center", marginBottom: 32 }}>Cartera de Clientes</h2>
      
      {/* Botón para abrir modal */}
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
        <button 
          onClick={() => setShowModal(true)} 
          style={{ background: '#a21caf', color: '#fff', padding: '12px 24px', borderRadius: 4, border: 'none', fontWeight: 'bold', fontSize: 16, cursor: 'pointer' }}
        >
          Agregar Cliente
        </button>
      </div>

      {/* Modal para agregar cliente */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', padding: 32, borderRadius: 8, maxWidth: 500, width: '90%', boxShadow: '0 4px 16px rgba(0,0,0,0.2)' }}>
            <h3 style={{ marginTop: 0, marginBottom: 24, textAlign: 'center' }}>Agregar Nuevo Cliente</h3>
            <form onSubmit={handleAddCliente}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 'bold' }}>Tipo de Cartera</label>
                <select 
                  value={tipo} 
                  onChange={e => setTipo(e.target.value)} 
                  style={{ padding: 10, borderRadius: 4, width: '100%', border: '1px solid #ddd', fontSize: 14 }}
                >
                  {tipos.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 'bold' }}>Nombre</label>
                <input 
                  type="text" 
                  value={nombre} 
                  onChange={e => setNombre(e.target.value)} 
                  placeholder="Nombre del cliente" 
                  style={{ padding: 10, borderRadius: 4, width: '100%', border: '1px solid #ddd', fontSize: 14, boxSizing: 'border-box' }} 
                  required 
                />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 'bold' }}>Celular</label>
                <input 
                  type="text" 
                  value={celular} 
                  onChange={e => setCelular(e.target.value)} 
                  placeholder="Número de celular" 
                  style={{ padding: 10, borderRadius: 4, width: '100%', border: '1px solid #ddd', fontSize: 14, boxSizing: 'border-box' }} 
                  required 
                />
              </div>
              {error && <div style={{ color: 'red', marginBottom: 16, textAlign: 'center' }}>{error}</div>}
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                <button 
                  type="submit" 
                  disabled={loading} 
                  style={{ background: '#a21caf', color: '#fff', padding: '10px 24px', borderRadius: 4, border: 'none', fontWeight: 'bold', cursor: 'pointer', fontSize: 14 }}
                >
                  {loading ? "Guardando..." : "Guardar"}
                </button>
                <button 
                  type="button" 
                  onClick={() => { setShowModal(false); setNombre(""); setCelular(""); setError(null); }} 
                  style={{ background: '#888', color: '#fff', padding: '10px 24px', borderRadius: 4, border: 'none', fontWeight: 'bold', cursor: 'pointer', fontSize: 14 }}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Formulario de edición (se muestra cuando editId existe) */}
      {editId && (
        <form onSubmit={handleUpdateCliente} style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap", alignItems: "flex-end", justifyContent: "center", background: '#f0f9ff', padding: 16, borderRadius: 8 }}>
          <select value={editTipo} onChange={e => setEditTipo(e.target.value)} style={{ padding: 8, borderRadius: 4 }}>
            {tipos.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <input type="text" value={editNombre} onChange={e => setEditNombre(e.target.value)} placeholder="Nombre" style={{ padding: 8, borderRadius: 4, width: 140 }} required />
          <input type="text" value={editTipoCliente} onChange={e => setEditTipoCliente(e.target.value)} placeholder="Tipo de cliente" style={{ padding: 8, borderRadius: 4, width: 140 }} required />
          <input type="text" value={editCelular} onChange={e => setEditCelular(e.target.value)} placeholder="Celular" style={{ padding: 8, borderRadius: 4, width: 120 }} required />
          <input type="date" value={editFechaCompra} onChange={e => setEditFechaCompra(e.target.value)} style={{ padding: 8, borderRadius: 4 }} required />
          <button type="submit" disabled={loading} style={{ background: '#a21caf', color: '#fff', padding: '8px 16px', borderRadius: 4, border: 'none', fontWeight: 'bold' }}>{loading ? "Actualizando..." : "Actualizar"}</button>
          <button type="button" onClick={() => { setEditId(null); setEditTipo(""); setEditNombre(""); setEditTipoCliente(""); setEditCelular(""); setEditFechaCompra(""); }} style={{ background: '#888', color: '#fff', padding: '8px 16px', borderRadius: 4, border: 'none', fontWeight: 'bold' }}>Cancelar</button>
        </form>
      )}
      
      <div style={{ display: "flex", gap: 32, flexWrap: "wrap", justifyContent: "center" }}>
        <div style={{ flex: 1, minWidth: 320 }}>
          <h3 style={{ textAlign: "center", marginBottom: 12 }}>Cartera de Crédito</h3>
          <table style={{ width: "100%", borderCollapse: "collapse", background: "#fff", borderRadius: 8, boxShadow: "0 2px 8px #0001" }}>
            <thead>
              <tr style={{ background: "#f3f3f3" }}>
                <th style={{ padding: 12, borderBottom: "1px solid #eee", textAlign: "left" }}>Nombre</th>
                <th style={{ padding: 12, borderBottom: "1px solid #eee", textAlign: "left" }}>Tipo de cliente</th>
                <th style={{ padding: 12, borderBottom: "1px solid #eee", textAlign: "left" }}>Celular</th>
                <th style={{ padding: 12, borderBottom: "1px solid #eee", textAlign: "left" }}>Fecha de compra</th>
                <th style={{ padding: 12, borderBottom: "1px solid #eee", textAlign: "center" }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {clientes.filter(c => c.tipo === "Crédito").length === 0 ? (
                <tr><td colSpan={5} style={{ padding: 24, textAlign: "center", color: "#888" }}>Sin clientes</td></tr>
              ) : (
                clientes.filter(c => c.tipo === "Crédito").map(c => (
                  <tr key={c.id}>
                    <td style={{ padding: 12 }}>{c.nombre}</td>
                    <td style={{ padding: 12 }}>{c.tipo_cliente}</td>
                    <td style={{ padding: 12 }}>{c.celular}</td>
                    <td style={{ padding: 12 }}>{c.fecha_compra}</td>
                    <td style={{ padding: 12, textAlign: 'center' }}>
                      <button onClick={() => handleEdit(c)} style={{ marginRight: 8, background: '#2563eb', color: '#fff', border: 'none', borderRadius: 4, padding: '4px 10px', fontWeight: 'bold', cursor: 'pointer' }}>Editar</button>
                      <button onClick={() => handleDelete(c.id)} style={{ background: '#dc2626', color: '#fff', border: 'none', borderRadius: 4, padding: '4px 10px', fontWeight: 'bold', cursor: 'pointer' }}>Eliminar</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div style={{ flex: 1, minWidth: 320 }}>
          <h3 style={{ textAlign: "center", marginBottom: 12 }}>Cartera de Contado</h3>
          <table style={{ width: "100%", borderCollapse: "collapse", background: "#fff", borderRadius: 8, boxShadow: "0 2px 8px #0001" }}>
            <thead>
              <tr style={{ background: "#f3f3f3" }}>
                <th style={{ padding: 12, borderBottom: "1px solid #eee", textAlign: "left" }}>Nombre</th>
                <th style={{ padding: 12, borderBottom: "1px solid #eee", textAlign: "left" }}>Tipo de cliente</th>
                <th style={{ padding: 12, borderBottom: "1px solid #eee", textAlign: "left" }}>Celular</th>
                <th style={{ padding: 12, borderBottom: "1px solid #eee", textAlign: "left" }}>Fecha de compra</th>
                <th style={{ padding: 12, borderBottom: "1px solid #eee", textAlign: "center" }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {clientes.filter(c => c.tipo === "Contado").length === 0 ? (
                <tr><td colSpan={5} style={{ padding: 24, textAlign: "center", color: "#888" }}>Sin clientes</td></tr>
              ) : (
                clientes.filter(c => c.tipo === "Contado").map(c => (
                  <tr key={c.id}>
                    <td style={{ padding: 12 }}>{c.nombre}</td>
                    <td style={{ padding: 12 }}>{c.tipo_cliente}</td>
                    <td style={{ padding: 12 }}>{c.celular}</td>
                    <td style={{ padding: 12 }}>{c.fecha_compra}</td>
                    <td style={{ padding: 12, textAlign: 'center' }}>
                      <button onClick={() => handleEdit(c)} style={{ marginRight: 8, background: '#2563eb', color: '#fff', border: 'none', borderRadius: 4, padding: '4px 10px', fontWeight: 'bold', cursor: 'pointer' }}>Editar</button>
                      <button onClick={() => handleDelete(c.id)} style={{ background: '#dc2626', color: '#fff', border: 'none', borderRadius: 4, padding: '4px 10px', fontWeight: 'bold', cursor: 'pointer' }}>Eliminar</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default CarteraClientes;
