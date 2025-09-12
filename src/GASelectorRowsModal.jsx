import React from 'react';
import GASelectorRows from './GASelectorRows';
import styles from './GASelectorRowsModal.module.css';

const GASelectorRowsModal = ({ open, onClose, rows, setRows }) => {
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
