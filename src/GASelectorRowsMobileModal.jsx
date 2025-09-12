import React, { useEffect, useRef } from 'react';
import styles from './GASelectorRowsMobileModal.module.css';
import GASelectorRowsMobile from './GASelectorRowsMobile';

const GASelectorRowsMobileModal = ({ open, onClose, rows, setRows }) => {
  // Manejo de historial para botón atrás
  const firstRender = useRef(true);
  useEffect(() => {
    if (open) {
      if (!firstRender.current) {
        window.history.pushState({ modal: 'gaSelectorRowsMobile' }, '');
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
        <h3>Precios y GA (Móvil)</h3>
        <GASelectorRowsMobile rows={rows} setRows={setRows} />
      </div>
    </div>
  );
};

export default GASelectorRowsMobileModal;
