import React, { useState } from 'react';
import { supabase } from './supabaseClient';

const GAForm = ({ onClose }) => {
  const [depto, setDepto] = useState('');
  const [porcentaje, setPorcentaje] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    if (!depto || !porcentaje) {
      setError('Completa todos los campos');
      setLoading(false);
      return;
    }
    const { error } = await supabase.from('ga_registros').insert({ depto, porcentaje: Number(porcentaje) });
    if (error) {
      setError('Error al registrar: ' + error.message);
    } else {
      setSuccess('¡Registro exitoso!');
      setDepto('');
      setPorcentaje('');
      setTimeout(() => {
        setSuccess(null);
        onClose();
      }, 1200);
    }
    setLoading(false);
  };

  return (
    <div style={{ background: '#fff', padding: 20, borderRadius: 8, boxShadow: '0 2px 8px #0002', maxWidth: 320 }}>
      <h3>Registrar GA</h3>
      <form onSubmit={handleSubmit}>
        <label>
          Departamento:
          <input type="text" value={depto} onChange={e => setDepto(e.target.value)} required disabled={loading} />
        </label>
        <br />
        <label>
          Porcentaje:
          <input type="number" value={porcentaje} onChange={e => setPorcentaje(e.target.value)} required min={0} max={100} step={0.01} disabled={loading} />
        </label>
        <br />
        <button type="submit" disabled={loading}>{loading ? 'Registrando...' : 'Registrar'}</button>
        <button type="button" onClick={onClose} style={{ marginLeft: 8 }} disabled={loading}>Cancelar</button>
      </form>
      {success && <div style={{color:'green',marginTop:8}}>{success}</div>}
      {error && <div style={{color:'red',marginTop:8}}>{error}</div>}
    </div>
  );
};

export default GAForm;
