import React, { useEffect, useRef } from 'react';
import GASelectorRows from './GASelectorRows';
import styles from './GASelectorRowsModal.module.css';

const GASelectorRowsModal = ({ open, onClose, rows, setRows }) => {
  // Manejo de historial para botón atrás
  const firstRender = useRef(true);
  useEffect(() => {
    if (open) {
      if (!firstRender.current) {
        window.history.pushState({ modal: 'gaSelectorRows' }, '');
      }
      const handlePop = (e) => {
        if (open) onClose();
      };
      window.addEventListener('popstate', handlePop);
      return () => {
        window.removeEventListener('popstate', handlePop);
        if (!firstRender.current && open) {
          window.history.back();
        }
      };
    }
    firstRender.current = false;
  }, [open]);
  if (!open) return null;
  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <button className={styles.closeBtn} onClick={onClose}>×</button>
        <h3>Precios y GA</h3>
        <GASelectorRows rows={rows} setRows={setRows} />
      </div>
    </div>
  );
};

export default GASelectorRowsModal;
