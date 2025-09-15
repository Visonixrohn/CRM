import React, { useState } from 'react';
import './ModalGestionarGestion.css';

const opcionesTipo = [
  { value: 'CONTADO', label: 'Contado' },
  { value: 'CREDITO', label: 'Crédito' }
];

function getTodayISO() {
  const today = new Date();
  return today.toISOString().split('T')[0];
}

const ModalGestionarGestion = ({ open, onClose, onSave, initialData = {} }) => {
  const [articulo, setArticulo] = useState(initialData.articulo || '');
  const [tipo, setTipo] = useState(initialData.tipo || 'CONTADO');
  const [fecha, setFecha] = useState(initialData.fecha || getTodayISO());

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ articulo, tipo, fecha });
  };

  React.useEffect(() => {
    if (open) {
      setArticulo(initialData.articulo || '');
      setTipo(initialData.tipo || 'CONTADO');
      setFecha(initialData.fecha || getTodayISO());
    }
  }, [open, initialData]);

  if (!open) return null;

  return (
    <div className="modal-gestionar-gestion-overlay">
      <div className="modal-gestionar-gestion">
        <button className="close-btn" onClick={onClose}>&times;</button>
        <h2>Gestionar Cliente</h2>
        <form onSubmit={handleSubmit}>
          <label>
            Artículo:
            <input
              type="text"
              value={articulo}
              onChange={e => setArticulo(e.target.value)}
              required
            />
          </label>
          <label>
            Tipo:
            <select value={tipo} onChange={e => setTipo(e.target.value)} required>
              {opcionesTipo.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </label>
          <label>
            Fecha de acuerdo:
            <input
              type="date"
              value={fecha}
              onChange={e => setFecha(e.target.value)}
              required
            />
          </label>
          <button type="submit" className="guardar-btn">Guardar</button>
        </form>
      </div>
    </div>
  );
};

export default ModalGestionarGestion;
