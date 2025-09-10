import React, { useEffect, useState } from 'react';
import styles from './GASelectorRow.module.css';
import { supabase } from './supabaseClient';

const GASelectorRow = ({ onAddRow, gaRegistros, row, setRow, gaEnabled, setGaEnabled }) => {
  // row: { precio, depto, total }
  // gaEnabled: boolean
  // setRow: function to update row state
  // setGaEnabled: function to update gaEnabled state

  useEffect(() => {
    if (!row.depto || !gaRegistros.length) {
      setRow(r => ({ ...r, total: r.precio }));
      return;
    }
    const registro = gaRegistros.find(g => g.depto === row.depto);
    if (registro && gaEnabled) {
      const porcentaje = Number(registro.porcentaje) / 100;
      setRow(r => ({ ...r, total: r.precio + (r.precio * porcentaje) }));
    } else {
      setRow(r => ({ ...r, total: r.precio }));
    }
  }, [row.precio, row.depto, gaEnabled, gaRegistros]);

  return (
    <div className={styles.rowContainer}>
      <label>Precio: </label>
      <input
        type="number"
        placeholder="Precio en Lps"
        value={row.precio}
        onChange={e => setRow(r => ({ ...r, precio: Number(e.target.value) }))}
        className={styles.input}
        min={0}
      />
      <label>Articulo: </label>
      <select
        value={row.depto}
        onChange={e => setRow(r => ({ ...r, depto: e.target.value }))}
        className={styles.select}
      >
        <option value="">Depto</option>
        {gaRegistros.map(g => (
          <option key={g.id} value={g.depto}>{g.depto}</option>
        ))}
      </select>
      <label>Total: </label>
      <input
        type="number"
        value={row.total}
        readOnly
        className={styles.input}
        placeholder="Total"
      />
      <label className={styles.switchLabel} style={{display:'flex',alignItems:'center',gap:4}}>
        <span>GA</span>
        <span className={styles.switch}>
          <input
            type="checkbox"
            checked={gaEnabled}
            onChange={e => setGaEnabled(e.target.checked)}
          />
          <span className={styles.slider}></span>
        </span>
        <span style={{marginLeft:4}}>{gaEnabled ? 'Sí' : 'No'}</span>
      </label>
      <button type="button" className={styles.addBtn} onClick={onAddRow}>+</button>
    </div>
  );
};

const GASelectorRows = ({ rows, setRows }) => {
  const [gaRegistros, setGaRegistros] = useState([]);

  useEffect(() => {
    async function fetchGA() {
      const { data } = await supabase.from('ga_registros').select();
      setGaRegistros(data || []);
    }
    fetchGA();
  }, []);

  const handleAddRow = () => {
    setRows(r => [...r, { precio: 0, depto: '', total: 0, gaEnabled: true }]);
  };

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

  return (
    <div>
      {rows.map((row, idx) => (
        <GASelectorRow
          key={idx}
          row={row}
          setRow={setRow(idx)}
          gaEnabled={row.gaEnabled}
          setGaEnabled={setGaEnabled(idx)}
          gaRegistros={gaRegistros}
          onAddRow={handleAddRow}
        />
      ))}
    </div>
  );
};

export default GASelectorRows;
