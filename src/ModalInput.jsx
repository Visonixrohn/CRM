import React, { useEffect, useRef } from "react";
import "./ModalInput.css";

const ModalInput = ({ open, label, value, onClose, onSave, isMoney }) => {
  const [inputValue, setInputValue] = React.useState(value);

  React.useEffect(() => {
    setInputValue(value);
  }, [value, open]);

  // Manejo de historial para botón atrás
  const firstRender = useRef(true);
  useEffect(() => {
    if (open) {
      if (!firstRender.current) {
        window.history.pushState({ modal: 'modalInput' }, '');
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
    <div className="modal-bg">
      <div className="modal-input">
        <h3>{label}</h3>
        <input
          type="number"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          autoFocus
        />
        <div className="modal-actions">
          <button onClick={onClose}>Cancelar</button>
          <button
            onClick={() => onSave(isMoney ? Number(inputValue) : inputValue)}
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalInput;
