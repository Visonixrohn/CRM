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
        <div key={idx} className={styles.mobileRow}>
          <label>Precio:</label>
          <input
            type="number"
            value={row.precio}
            onChange={e => setRow(idx)(r => ({ ...r, precio: Number(e.target.value) }))}
            className={styles.input}
            min={0}
          />
          <label>Depto:</label>
          <select
            value={row.depto}
            onChange={e => setRow(idx)(r => ({ ...r, depto: e.target.value }))}
            className={styles.select}
          >
            <option value="">Depto</option>
            {gaRegistros.map(g => (
              <option key={g.id} value={g.depto}>{g.depto}</option>
            ))}
          </select>
          <label>Total:</label>
          <input
            type="number"
            value={row.total}
            readOnly
            className={styles.input}
            placeholder="Total"
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
