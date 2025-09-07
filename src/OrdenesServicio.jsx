import React, { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";
import Modal from "react-modal";
import "./OrdenesServicio.css";

const OrdenesServicio = () => {
  const [ordenes, setOrdenes] = useState([]);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    fecha: "",
    cliente: "",
    numero_orden: "",
    archivo: null,
    articulo: "",
    dias_trascurridos: 0,
    estado: "",
  });
  const [selectedOrden, setSelectedOrden] = useState(null);
  const [isAddOrderModalOpen, setIsAddOrderModalOpen] = useState(false);
  const [newOrder, setNewOrder] = useState({
    fecha: new Date().toISOString().split("T")[0], // Fecha por defecto: hoy
    cliente: "",
    numero_orden: "",
    articulo: "",
    estado: "",
    archivo: null,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isUpdateStateModalOpen, setIsUpdateStateModalOpen] = useState(false);
  const [selectedState, setSelectedState] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterState, setFilterState] = useState("");

  const estados = [
    "PENDIENTE DE VISITA",
    "PENDIENTE DE REPUESTO",
    "REPARADO",
    "SUGERENCIA DE CAMBIO",
    "RECHAZADO",
  ];

  useEffect(() => {
    fetchOrdenes();
  }, []);

  const fetchOrdenes = async () => {
    const { data, error } = await supabase.from("ordenes_servicio").select("*");
    if (error) {
      console.error("Error fetching ordenes:", error);
    } else {
      setOrdenes(data);
    }
  };

  const handleAddOrder = async (e) => {
    e.preventDefault();

    // Verificar si el usuario está autenticado
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error("Usuario no autenticado");
      return;
    }

    setIsLoading(true);

    let archivoUrl = null;
    if (newOrder.archivo) {
      const uniqueFileName = `ordenes/${Date.now()}-${newOrder.archivo.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("archivos")
        .upload(uniqueFileName, newOrder.archivo);

      if (uploadError) {
        console.error("Error al subir el archivo:", uploadError);
        setIsLoading(false);
        setIsAddOrderModalOpen(false);
        setNewOrder({
          fecha: new Date().toISOString().split("T")[0], // Resetear a la fecha actual
          cliente: "",
          numero_orden: "",
          articulo: "",
          estado: "",
          archivo: null,
        });
        return;
      }

      archivoUrl = uploadData.path;
    }

    const { error } = await supabase.from("ordenes_servicio").insert([
      {
        ...newOrder,
        archivo: archivoUrl,
      },
    ]);

    if (error) {
      console.error("Error al guardar la orden:", error);
    } else {
      console.log("Orden guardada exitosamente");
      setIsSuccessModalOpen(true);
    }

    setIsLoading(false);
    setIsAddOrderModalOpen(false);
    setNewOrder({
      fecha: new Date().toISOString().split("T")[0], // Resetear a la fecha actual
      cliente: "",
      numero_orden: "",
      articulo: "",
      estado: "",
      archivo: null,
    });
    fetchOrdenes();
  };

  const handleRowClick = (orden) => {
    setSelectedOrden(orden);
    setIsDetailModalOpen(true);
  };

  const handleUpdateState = async () => {
    if (!selectedOrden || !selectedState) return;

    const { error } = await supabase
      .from("ordenes_servicio")
      .update({ estado: selectedState })
      .eq("numero_orden", selectedOrden.numero_orden);

    if (error) {
      console.error("Error al actualizar el estado:", error);
    } else {
      console.log("Estado actualizado exitosamente");
      setSelectedOrden({ ...selectedOrden, estado: selectedState });
      setIsUpdateStateModalOpen(false);
    }
  };

  const calculateDaysElapsed = (fecha) => {
    const today = new Date();
    const orderDate = new Date(fecha);
    const timeDiff = today - orderDate;
    return Math.floor(timeDiff / (1000 * 60 * 60 * 24));
  };

  const renderOrderDetails = (order) => (
    <div className="order-details">
      <h3>Detalles de la Orden</h3>
      <p>
        <strong>Fecha:</strong> {order.fecha}
      </p>
      <p>
        <strong>Cliente:</strong> {order.cliente}
      </p>
      <p>
        <strong>Número de Orden:</strong> {order.numero_orden}
      </p>
      <p>
        <strong>Artículo:</strong> {order.articulo}
      </p>
      <p>
        <strong>Días Transcurridos:</strong> {calculateDaysElapsed(order.fecha)}
      </p>
      <p>
        <strong>Estado:</strong> {order.estado}
      </p>
      {order.archivo && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginTop: "10px",
          }}
        >
          <iframe
            src={`https://caqukltkvvsfairqphjf.supabase.co/storage/v1/object/public/archivos/${order.archivo}`}
            title="Vista previa del archivo"
            style={{ width: "80%", height: "500px", border: "none" }}
          ></iframe>
        </div>
      )}
      <button onClick={() => setIsUpdateStateModalOpen(true)}>
        Actualizar Estado
      </button>
    </div>
  );

  const handleInputChange = (field, value) => {
    if (field === "dias_trascurridos" && isNaN(value)) {
      value = 0; // Asegurar que no se asigne NaN
    }
    setNewOrder({ ...newOrder, [field]: value });
  };

  const filteredOrdenes = ordenes.filter((orden) => {
    const matchesSearch =
      orden.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
      orden.numero_orden.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterState ? orden.estado === filterState : true;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="ordenes-container">
      <header className="ordenes-header">
        <h1>Órdenes de Servicio</h1>
        <input
          type="text"
          placeholder="Buscar por cliente o número de orden"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-bar"
        />
        <div className="filter-buttons">
          {estados.map((estado) => {
            // Generar clase para color
            const estadoClass = estado
              .toLowerCase()
              .replace(/\s+/g, "-")
              .replace(/[áéíóú]/g, (m) => ({á:'a',é:'e',í:'i',ó:'o',ú:'u'}[m]));
            return (
              <button
                key={estado}
                className={`filter-button ${estadoClass} ${filterState === estado ? "active" : ""}`}
                onClick={() =>
                  setFilterState(filterState === estado ? "" : estado)
                }
              >
                {estado}
              </button>
            );
          })}
        </div>
      </header>

      <table className="ordenes-table">
        <thead>
          <tr>
            <th>FECHA</th>
            <th>CLIENTE</th>
            <th>NÚMERO DE ORDEN</th>
            <th>ARTÍCULO</th>
            <th>ESTADO</th>
            <th>DIAS</th>
          </tr>
        </thead>
        <tbody>
          {filteredOrdenes.map((orden) => (
            <tr key={orden.id} onClick={() => handleRowClick(orden)}>
              <td>{orden.fecha}</td>
              <td>{orden.cliente}</td>
              <td>{orden.numero_orden}</td>
              <td>{orden.articulo}</td>
              <td
                className={`estado-${orden.estado
                  .replace(/\s+/g, "-")
                  .toLowerCase()}`}
              >
                {orden.estado}
              </td>
              <td>{calculateDaysElapsed(orden.fecha)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Botón flotante */}
      <button
        className="floating-btn"
        onClick={() => setIsAddOrderModalOpen(true)}
      >
        +
      </button>

      {selectedOrden ? (
        <div className="modal-overlay">
          <div className="order-details-modal fade-in">
            {renderOrderDetails(selectedOrden)}
            <button onClick={() => setSelectedOrden(null)}>Cerrar</button>
          </div>
        </div>
      ) : (
        isAddOrderModalOpen && (
          <div className="modal-overlay">
            <div className="AddOrderForm fade-in">
              <h2>Agregar Orden de Servicio</h2>
              <form onSubmit={handleAddOrder}>
                <input
                  type="date"
                  value={newOrder.fecha || ""}
                  onChange={(e) => handleInputChange("fecha", e.target.value)}
                  required
                />
                <input
                  type="text"
                  placeholder="Cliente"
                  value={newOrder.cliente || ""}
                  onChange={(e) => handleInputChange("cliente", e.target.value)}
                  required
                />
                <input
                  type="text"
                  placeholder="Número de Orden"
                  value={newOrder.numero_orden || ""}
                  onChange={(e) =>
                    handleInputChange("numero_orden", e.target.value)
                  }
                  required
                />
                <input
                  type="text"
                  placeholder="Artículo"
                  value={newOrder.articulo || ""}
                  onChange={(e) =>
                    handleInputChange("articulo", e.target.value)
                  }
                  required
                />
                <select
                  value={newOrder.estado || ""}
                  onChange={(e) => handleInputChange("estado", e.target.value)}
                  required
                >
                  <option value="" disabled>
                    Selecciona un estado
                  </option>
                  {estados.map((estado) => (
                    <option key={estado} value={estado}>
                      {estado}
                    </option>
                  ))}
                </select>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={(e) =>
                    handleInputChange("archivo", e.target.files[0])
                  }
                  required
                />
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <button type="submit" disabled={isLoading}>
                    {isLoading ? "Guardando..." : "Guardar"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAddOrderModalOpen(false)}
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )
      )}

      {isSuccessModalOpen && (
        <div className="modal-overlay">
          <div className="modal fade-in">
            <h2>¡Orden guardada exitosamente!</h2>
            <button onClick={() => setIsSuccessModalOpen(false)}>Cerrar</button>
          </div>
        </div>
      )}

      {isUpdateStateModalOpen && (
        <div className="modal-overlay">
          <div className="update-state-modal fade-in">
            <h3>Actualizar Estado</h3>
            <div className="estado-buttons">
              {estados.map((estado) => (
                <button
                  key={estado}
                  className={`estado-button ${
                    selectedState === estado ? "active" : ""
                  }`}
                  onClick={() => setSelectedState(estado)}
                >
                  {estado}
                </button>
              ))}
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: "20px",
              }}
            >
              <button onClick={handleUpdateState}>Guardar</button>
              <button onClick={() => setIsUpdateStateModalOpen(false)}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdenesServicio;
