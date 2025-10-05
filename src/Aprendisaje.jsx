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
  const [fechaCompra, setFechaCompra] = useState("");
  const [tipoCliente, setTipoCliente] = useState("");
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
    if (!nombre || !tipoCliente || !celular || !fechaCompra) {
      setError("Completa todos los campos.");
      setLoading(false);
      return;
    }
    const { error } = await supabase
      .from("cartera_clientes")
      .insert({
        nombre,
        tipo_cliente: tipoCliente,
        celular,
        fecha_compra: fechaCompra,
        tipo,
        usuario: userId
      });
    if (error) {
      setError("Error al guardar el cliente.");
    } else {
      setNombre("");
      setTipoCliente("");
      setCelular("");
      setFechaCompra("");
      fetchClientes();
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ textAlign: "center", marginBottom: 32 }}>Cartera de Clientes</h2>
  {/* Formulario único para agregar/editar clientes */}
      <form onSubmit={editId ? handleUpdateCliente : handleAddCliente} style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap", alignItems: "flex-end", justifyContent: "center" }}>
        <select value={editId ? editTipo : tipo} onChange={e => editId ? setEditTipo(e.target.value) : setTipo(e.target.value)} style={{ padding: 8, borderRadius: 4 }}>
          {tipos.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <input type="text" value={editId ? editNombre : nombre} onChange={e => editId ? setEditNombre(e.target.value) : setNombre(e.target.value)} placeholder="Nombre" style={{ padding: 8, borderRadius: 4, width: 140 }} required />
        <input type="text" value={editId ? editTipoCliente : tipoCliente} onChange={e => editId ? setEditTipoCliente(e.target.value) : setTipoCliente(e.target.value)} placeholder="Tipo de cliente" style={{ padding: 8, borderRadius: 4, width: 140 }} required />
        <input type="text" value={editId ? editCelular : celular} onChange={e => editId ? setEditCelular(e.target.value) : setCelular(e.target.value)} placeholder="Celular" style={{ padding: 8, borderRadius: 4, width: 120 }} required />
        <input type="date" value={editId ? editFechaCompra : fechaCompra} onChange={e => editId ? setEditFechaCompra(e.target.value) : setFechaCompra(e.target.value)} style={{ padding: 8, borderRadius: 4 }} required />
        <button type="submit" disabled={loading} style={{ background: '#a21caf', color: '#fff', padding: '8px 16px', borderRadius: 4, border: 'none', fontWeight: 'bold' }}>{loading ? (editId ? "Actualizando..." : "Guardando...") : (editId ? "Actualizar" : "Agregar")}</button>
        {editId && (
          <button type="button" onClick={() => { setEditId(null); setEditTipo(""); setEditNombre(""); setEditTipoCliente(""); setEditCelular(""); setEditFechaCompra(""); }} style={{ background: '#888', color: '#fff', padding: '8px 16px', borderRadius: 4, border: 'none', fontWeight: 'bold' }}>Cancelar</button>
        )}
      </form>
      {error && <div style={{ color: 'red', marginBottom: 12 }}>{error}</div>}
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
