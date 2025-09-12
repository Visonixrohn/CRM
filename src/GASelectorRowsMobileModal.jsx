import React from 'react';
import styles from './GASelectorRowsMobileModal.module.css';
import GASelectorRowsMobile from './GASelectorRowsMobile';

const GASelectorRowsMobileModal = ({ open, onClose, rows, setRows }) => {
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
