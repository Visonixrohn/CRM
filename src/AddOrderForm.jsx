import React, { useState, useRef, useEffect } from "react";
import "./AddOrderForm.css";

const AddOrderFormF = ({ supabase }) => {
  const [isAddOrderModalOpen, setIsAddOrderModalOpen] = useState(false);
  const [newOrder, setNewOrder] = useState({
    fecha: "",
    cliente: "",
    numero_orden: "",
    articulo: "",
    dias_trascurridos: 0,
    estado: "",
  });

  const handleAddOrder = async () => {
    const { error } = await supabase.from("ordenes_servicio").insert([newOrder]);
    if (error) {
      console.error("Error al guardar la orden:", error);
    } else {

      setIsAddOrderModalOpen(false);
      setNewOrder({
        fecha: "",
        cliente: "",
        numero_orden: "",
        articulo: "",
        dias_trascurridos: 0,
        estado: "",
      });
    }
  };

  return (
    <>
      <button className="btn btn-primary" onClick={() => setIsAddOrderModalOpen(true)}>
        ➕ Agregar Orden
      </button>

      {isAddOrderModalOpen && (
        <ModalBackHandler onClose={() => setIsAddOrderModalOpen(false)}>
          <div className="modal-bg">
            <div className="modal-card">
            <h3 className="modal-title">Nueva Orden de Servicio</h3>

            <div className="form-grid">
              <div className="form-group">
                <label>Fecha</label>
                <input
                  type="date"
                  value={newOrder.fecha}
                  onChange={(e) => setNewOrder({ ...newOrder, fecha: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Cliente</label>
                <input
                  type="text"
                  placeholder="Nombre del cliente"
                  value={newOrder.cliente}
                  onChange={(e) => setNewOrder({ ...newOrder, cliente: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Número de Orden</label>
                <input
                  type="text"
                  placeholder="Número de orden"
                  value={newOrder.numero_orden}
                  onChange={(e) => setNewOrder({ ...newOrder, numero_orden: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Artículo</label>
                <input
                  type="text"
                  placeholder="Artículo"
                  value={newOrder.articulo}
                  onChange={(e) => setNewOrder({ ...newOrder, articulo: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Días Tras. Orden</label>
                <input
                  type="number"
                  min="0"
                  value={newOrder.dias_trascurridos}
                  onChange={(e) =>
                    setNewOrder({ ...newOrder, dias_trascurridos: parseInt(e.target.value) || 0 })
                  }
                />
              </div>

              <div className="form-group">
                <label>Estado</label>
                <select
                  value={newOrder.estado}
                  onChange={(e) => setNewOrder({ ...newOrder, estado: e.target.value })}
                >
                  <option value="">Seleccionar</option>
                  <option value="Pendiente">Pendiente</option>
                  <option value="En Proceso">En Proceso</option>
                  <option value="Completado">Completado</option>
                </select>
              </div>
            </div>

            <div className="modal-actions">
              <button className="btn btn-success" onClick={handleAddOrder}>
                Guardar Orden
              </button>
              <button
                className="btn btn-danger"
                onClick={() => setIsAddOrderModalOpen(false)}
              >
                Cancelar
              </button>
            </div>
          </div>
        </ModalBackHandler>
// --- Handler para back button en modales ---
function ModalBackHandler({ children, onClose }) {
  const firstRender = useRef(true);
  useEffect(() => {
    if (!firstRender.current) {
      window.history.pushState({ modal: 'addOrderForm' }, '');
    }
    const handlePop = (e) => {
      onClose();
    };
    window.addEventListener('popstate', handlePop);
    return () => {
      window.removeEventListener('popstate', handlePop);
      if (!firstRender.current) {
        window.history.back();
      }
    };
    // eslint-disable-next-line
  }, []);
  useEffect(() => {
    firstRender.current = false;
  }, []);
  return children;
}
      )}
    </>
  );
};

export default AddOrderFormF;
