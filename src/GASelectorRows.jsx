import React, { useEffect, useState } from 'react';
import styles from './GASelectorRow.module.css';
import { supabase } from './supabaseClient';

const GASelectorRow = ({ onAddRow, gaRegistros, row, setRow, gaEnabled, setGaEnabled }) => {
  const [precioInputValue, setPrecioInputValue] = useState('');

  useEffect(() => {
    setPrecioInputValue(row.precio === 0 ? '' : String(row.precio));
  }, [row.precio]);
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
    <div className={styles.rowContainer} style={{background:'#f8fafc',borderRadius:8,padding:12,boxShadow:'0 1px 6px #0001',marginBottom:12}}>
      <label style={{fontWeight:'bold',color:'#1976d2'}}>Precio:</label>
      <input
        type="text"
        inputMode="decimal"
        placeholder="Precio en Lps"
        value={precioInputValue.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
        onChange={e => {
          let val = e.target.value.replace(/,/g, '');
          const parts = val.split('.');
          if (parts.length > 2) val = parts[0] + '.' + parts.slice(1).join('');
          setRow(r => ({ ...r, precio: val === '' ? 0 : Number(val) }));
          setPrecioInputValue(val);
        }}
        className={styles.input}
        min={0}
        style={{marginRight:8}}
        onBlur={() => {
          setPrecioInputValue(row.precio === 0 ? '' : Number(row.precio).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
        }}
      />
      <label style={{fontWeight:'bold',color:'#1976d2'}}>Articulo:</label>
      <input
        type="text"
        placeholder="Nombre del artículo"
        value={row.articulo || ''}
        onChange={e => setRow(r => ({ ...r, articulo: e.target.value }))}
        className={styles.input}
        style={{marginRight:8}}
      />
      <label style={{fontWeight:'bold',color:'#1976d2'}}>GA:</label>
      <select
        value={row.depto}
        onChange={e => setRow(r => ({ ...r, depto: e.target.value }))}
        className={styles.select}
      >
        <option value="">Selecciona GA</option>
        {gaRegistros.map(g => (
          <option key={g.id} value={g.depto}>{g.depto}</option>
        ))}
      </select>
      <label style={{fontWeight:'bold',color:'#1976d2'}}>Total:</label>
      <input
        type="text"
        value={row.total === 0 ? '' : row.total.toLocaleString('en-US')}
        readOnly
        className={styles.input}
        placeholder="Total"
        style={{marginRight:8}}
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
