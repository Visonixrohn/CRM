import React from 'react';
import styles from './GASelectorRowsMobile.module.css';
import { supabase } from './supabaseClient';

const GASelectorRowsMobile = ({ rows, setRows }) => {
  // Puedes simplificar la UI para móviles aquí
  // Por ejemplo, mostrar solo una fila a la vez o usar un diseño tipo lista
  // Aquí se muestra una versión simple tipo lista
  const [gaRegistros, setGaRegistros] = React.useState([]);

  React.useEffect(() => {
    async function fetchGA() {
      const { data } = await supabase.from('ga_registros').select();
      setGaRegistros(data || []);
    }
    fetchGA();
  }, []);

  const setRow = idx => updater => {
    setRows(r => {
      const copy = [...r];
      copy[idx] = typeof updater === 'function' ? updater(copy[idx]) : updater;
      return copy;
    });
  };

  const setGaEnabled = idx => val => {
    setRows(r => {
      const copy = [...r];
      copy[idx].gaEnabled = typeof val === 'function' ? val(copy[idx].gaEnabled) : val;
      return copy;
    });
  };

  const handleAddRow = () => {
    setRows(r => [...r, { precio: 0, depto: '', total: 0, gaEnabled: true }]);
  };

  return (
    <div className={styles.mobileContainer}>
      {rows.map((row, idx) => (
        <div key={idx} className={styles.mobileRow} style={{background:'#f8fafc',borderRadius:8,padding:12,boxShadow:'0 1px 6px #0001',marginBottom:12}}>
          <label style={{fontWeight:'bold',color:'#1976d2'}}>Precio:</label>
          <input
            type="text"
            value={row.precio === 0 ? '' : Number(row.precio).toLocaleString('en-US')}
            onChange={e => {
              let val = e.target.value.replace(/,/g, '');
              if (!/^\d*$/.test(val)) return;
              setRow(idx)(r => ({ ...r, precio: val === '' ? 0 : Number(val) }));
            }}
            className={styles.input}
            min={0}
            inputMode="numeric"
            pattern="[0-9,]*"
            placeholder="Precio"
            style={{marginBottom:6}}
          />
          <label style={{fontWeight:'bold',color:'#1976d2'}}>Articulo:</label>
          <input
            type="text"
            placeholder="Nombre del artículo"
            value={row.articulo || ''}
            onChange={e => setRow(idx)(r => ({ ...r, articulo: e.target.value }))}
            className={styles.input}
            style={{marginBottom:6}}
          />
          <label style={{fontWeight:'bold',color:'#1976d2'}}>GA:</label>
          <select
            value={row.depto}
            onChange={e => setRow(idx)(r => ({ ...r, depto: e.target.value }))}
            className={styles.select}
          >
            <option value="">Selecciona GA</option>
            {gaRegistros.map(g => (
              <option key={g.id} value={g.depto}>{g.depto}</option>
            ))}
          </select>
          <label style={{fontWeight:'bold',color:'#1976d2'}}>Total:</label>
          <input
            type="number"
            value={row.total}
            readOnly
            className={styles.input}
            placeholder="Total"
            style={{marginBottom:6}}
          />
          <label className={styles.switchLabel}>
            <span>GA</span>
            <input
              type="checkbox"
              checked={row.gaEnabled}
              onChange={e => setGaEnabled(idx)(e.target.checked)}
            />
            <span>{row.gaEnabled ? 'Sí' : 'No'}</span>
          </label>
          <button type="button" className={styles.addBtn} onClick={handleAddRow}>+</button>
        </div>
      ))}
    </div>
  );
};

export default GASelectorRowsMobile;
