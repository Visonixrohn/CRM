import React, { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";

export default function MisGastos() {
  const [gastos, setGastos] = useState([]);
  const [total, setTotal] = useState(0);
  const [nombreGasto, setNombreGasto] = useState("");
  const [valorGasto, setValorGasto] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editId, setEditId] = useState(null);
  const [editNombre, setEditNombre] = useState("");
  const [editValor, setEditValor] = useState("");
  const userId = localStorage.getItem("userId");

  async function fetchGastos() {
    if (!userId) return;
    const { data, error } = await supabase
      .from("gastos_mensuales")
      .select("id, nombre_gasto, valor")
      .eq("usuario_id", userId);
    if (!error && data) {
      setGastos(data);
      setTotal(data.reduce((sum, g) => sum + Number(g.valor), 0));
    }
  }

  useEffect(() => {
    fetchGastos();
    // eslint-disable-next-line
  }, [userId]);

  const handleAddGasto = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    if (!nombreGasto || !valorGasto || isNaN(Number(valorGasto))) {
      setError("Completa ambos campos correctamente.");
      setLoading(false);
      return;
    }
    const { error } = await supabase
      .from("gastos_mensuales")
      .insert({
        usuario_id: userId,
        nombre_gasto: nombreGasto,
        valor: Number(valorGasto)
      });
    if (error) {
      setError("Error al guardar el gasto.");
    } else {
      setNombreGasto("");
      setValorGasto("");
      fetchGastos();
    }
    setLoading(false);
  };

  // ...existing code...
  const handleEdit = (gasto) => {
    setEditId(gasto.id);
    setEditNombre(gasto.nombre_gasto);
    setEditValor(gasto.valor);
    setError(null);
  };

  const handleUpdateGasto = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    if (!editNombre || !editValor || isNaN(Number(editValor))) {
      setError("Completa ambos campos correctamente.");
      setLoading(false);
      return;
    }
    const { error } = await supabase
      .from("gastos_mensuales")
      .update({ nombre_gasto: editNombre, valor: Number(editValor) })
      .eq("id", editId);
    if (error) {
      setError("Error al actualizar el gasto.");
    } else {
      setEditId(null);
      setEditNombre("");
      setEditValor("");
      fetchGastos();
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    setLoading(true);
    setError(null);
    const { error } = await supabase
      .from("gastos_mensuales")
      .delete()
      .eq("id", id);
    if (error) {
      setError("Error al eliminar el gasto.");
    } else {
      fetchGastos();
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: 24 }}>
      <h2>Mis Gastos Mensuales</h2>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
        <div style={{
          background: 'linear-gradient(90deg, #a21caf 60%, #9333ea 100%)',
          color: '#fff',
          padding: '24px 32px',
          borderRadius: 16,
          boxShadow: '0 4px 16px #0002',
          fontSize: 22,
          fontWeight: 'bold',
          minWidth: 260,
          textAlign: 'center',
          letterSpacing: 1,
          border: '2px solid #a21caf',
          display: 'flex',
          alignItems: 'center',
          gap: 12
        }}>
          <span role="img" aria-label="card">💳</span>
          Total Gastos: L{total.toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </div>
      </div>
      <form onSubmit={editId ? handleUpdateGasto : handleAddGasto} style={{ display: 'flex', gap: 12, marginBottom: 24, alignItems: 'flex-end' }}>
        <div>
          <label style={{ fontWeight: 'bold' }}>Nombre del gasto</label><br />
          <input
            type="text"
            value={editId ? editNombre : nombreGasto}
            onChange={e => editId ? setEditNombre(e.target.value) : setNombreGasto(e.target.value)}
            style={{ padding: 8, borderRadius: 4, border: '1px solid #ccc', width: 180 }}
            placeholder="Ej: Internet, gasolina..."
            required
          />
        </div>
        <div>
          <label style={{ fontWeight: 'bold' }}>Valor (monetario)</label><br />
          <input
            type="number"
            min="0"
            step="0.01"
            value={editId ? editValor : valorGasto}
            onChange={e => editId ? setEditValor(e.target.value) : setValorGasto(e.target.value)}
            style={{ padding: 8, borderRadius: 4, border: '1px solid #ccc', width: 120, textAlign: 'right' }}
            placeholder="L 0.00"
            required
          />
        </div>
        <button type="submit" disabled={loading} style={{ background: '#a21caf', color: '#fff', padding: '8px 16px', borderRadius: 4, border: 'none', fontWeight: 'bold' }}>
          {loading ? (editId ? 'Actualizando...' : 'Guardando...') : (editId ? 'Actualizar' : 'Agregar gasto')}
        </button>
        {editId && (
          <button type="button" onClick={() => { setEditId(null); setEditNombre(""); setEditValor(""); }} style={{ background: '#888', color: '#fff', padding: '8px 16px', borderRadius: 4, border: 'none', fontWeight: 'bold' }}>
            Cancelar
          </button>
        )}
      </form>
      {error && <div style={{ color: 'red', marginBottom: 12 }}>{error}</div>}
      <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px #0001' }}>
        <thead>
          <tr style={{ background: '#f3f3f3' }}>
            <th style={{ padding: 12, borderBottom: '1px solid #eee', textAlign: 'left', width: '50%' }}>Nombre del gasto</th>
            <th style={{ padding: 12, borderBottom: '1px solid #eee', textAlign: 'right', width: '25%' }}>Monto</th>
            <th style={{ padding: 12, borderBottom: '1px solid #eee', textAlign: 'center', width: '25%' }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {gastos.length === 0 ? (
            <tr>
              <td colSpan={3} style={{ padding: 24, textAlign: 'center', color: '#888' }}>No hay gastos registrados.</td>
            </tr>
          ) : (
            gastos.map(gasto => (
              <tr key={gasto.id}>
                <td style={{ padding: 12, borderBottom: '1px solid #eee', textAlign: 'left', verticalAlign: 'middle' }}>{gasto.nombre_gasto}</td>
                <td style={{ padding: 12, borderBottom: '1px solid #eee', textAlign: 'right', verticalAlign: 'middle' }}>L{Number(gasto.valor).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                <td style={{ padding: 12, borderBottom: '1px solid #eee', textAlign: 'center', verticalAlign: 'middle' }}>
                  <button onClick={() => handleEdit(gasto)} style={{ marginRight: 8, background: '#2563eb', color: '#fff', border: 'none', borderRadius: 4, padding: '4px 10px', fontWeight: 'bold', cursor: 'pointer' }}>Editar</button>
                  <button onClick={() => handleDelete(gasto.id)} style={{ background: '#dc2626', color: '#fff', border: 'none', borderRadius: 4, padding: '4px 10px', fontWeight: 'bold', cursor: 'pointer' }}>Eliminar</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
