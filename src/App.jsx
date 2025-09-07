import { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";
import Login from "./Login";
import ModalInput from "./ModalInput";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";

import Header from "./Header";
import ChoferModal from "./ChoferModal";
import Sidebar from "./Sidebar";
import Comisiones from "./Comisiones";
import Entregas from "./Entregas";
import OrdenesServicio from "./OrdenesServicio";
import Calculadoras from "./Calculadoras";
import Razones from "./Razones";
import Tiendas from "./Tiendas";
import Documentos from "./Documentos";
import ClientesNuevos from "./ClientesNuevos";
import Actualizaciones from "./Actualizaciones"; // Importar la nueva vista
import { useRef } from "react";
import LoadingScreen from "./LoadingScreen";

function App() {
  const [count, setCount] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [page, setPage] = useState("comisiones"); // Página inicial predeterminada
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Cambiar el título de la pestaña
  useEffect(() => {
    document.title = "CRM-MIGUEL";
  }, []);

  // Mantener sesión activa
  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data?.user || null);
    };
    getUser();
    // Escuchar cambios de sesión
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user || null);
      }
    );
    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  // Estados para comisiones
  const [meta, setMeta] = useState(35000);
  const [comisionObtenida, setComisionObtenida] = useState(0);
  const [ventaPorCliente, setVentaPorCliente] = useState(0);
  const [metaHoy, setMetaHoy] = useState(0);
  const [comisionHoy, setComisionHoy] = useState(0);

  // Función para alternar el sidebar
  const toggleSidebar = () => setSidebarOpen((open) => !open);

  const handleComisionesClick = () => {
    setPage("comisiones");
    setSidebarOpen(false);
  };

  const handleEntregasClick = () => {
    setPage("entregas");
    setSidebarOpen(false);
  };

  const handleOrdenesClick = () => {
    setPage("ordenes");
    setSidebarOpen(false);
  };

  const handleCalculadoraClick = () => {
    setPage("calculadoras");
    setSidebarOpen(false);
  };

  const handleRazonesClick = () => {
    setPage("razones");
    setSidebarOpen(false);
  };

  const handleTiendasClick = () => {
    setPage("tiendas");
    setSidebarOpen(false);
  };

  const handleDocumentosClick = () => {
    setPage("documentos");
    setSidebarOpen(false);
  };

  const handleClientesNuevosClick = () => {
    setPage("clientes-nuevos");
    setSidebarOpen(false);
  };

  const handleActualizacionesClick = () => {
    setPage("actualizaciones");
    setSidebarOpen(false);
  };

  // Estado para modal
  const [modal, setModal] = useState({
    open: false,
    label: "",
    value: 0,
    setter: null,
    isMoney: false,
  });

  const handleUpdate = (label, value, setter, isMoney = false) => {
    setModal({ open: true, label, value, setter, isMoney });
  };

  const handleModalSave = async (newValue) => {
    if (modal.setter) {
      modal.setter(newValue);

      // Mapear los nombres de las columnas
      const columnMap = {
        Meta: "meta",
        "Comisión obtenida": "comision_obtenida",
      };

      const column = columnMap[modal.label];

      if (!column) {
        console.error("Columna no válida para actualizar en Supabase.");
        return;
      }

      // Actualizar en Supabase
      const { error } = await supabase
        .from("comisiones")
        .update({ [column]: newValue })
        .eq("id", 1); // Asegúrate de usar el ID correcto

      if (error) {
        console.error("Error al actualizar en Supabase:", error);
      } else {
        console.log(`${modal.label} actualizado en Supabase.`);
      }
    }
    setModal({ ...modal, open: false });
  };

  const handleModalClose = () => setModal({ ...modal, open: false });

  const handleReset = () => {
    setMeta(0);
    setComisionObtenida(0);
    setVentaPorCliente(0);
    setMetaHoy(0);
    setComisionHoy(0);
  };

  // Estado para modal de chofer
  const [choferModal, setChoferModal] = useState(false);
  const [chofer, setChofer] = useState({ nombre: "", contacto: "" });

  // Eliminar los botones del header relacionados con comisiones
  const comisionesActions = null;

  // Agregar estado para controlar el modal de agregar órdenes
  const [isAddOrderModalOpen, setIsAddOrderModal] = useState(false);
  const [newOrder, setNewOrder] = useState({
    fecha: "",
    cliente: "",
    numero_orden: "",
    articulo: "",
    dias_trascurridos: 0,
    estado: "",
  });

  const handleAddOrder = async () => {
    const { error } = await supabase
      .from("ordenes_servicio")
      .insert([newOrder]);
    if (error) {
      console.error("Error al guardar la orden:", error);
    } else {
      console.log("Orden guardada exitosamente");
      setIsAddOrderModalOpen(false);
    }
  };

  useEffect(() => {
    setPage("comisiones"); // Asegura que siempre se cargue 'comisiones' al recargar
  }, []);

  if (loading) {
    return <LoadingScreen onComplete={() => setLoading(false)} />;
  }

  if (!user) {
    return <Login onLogin={setUser} />;
  }

  return (
    <>
      <Header onMenuClick={toggleSidebar} actions={comisionesActions} />
      <Sidebar
        open={sidebarOpen}
        onComisionesClick={handleComisionesClick}
        onEntregasClick={handleEntregasClick}
        onOrdenesClick={handleOrdenesClick}
        onCalculadoraClick={handleCalculadoraClick}
        onRazonesClick={handleRazonesClick}
        onTiendasClick={handleTiendasClick}
        onDocumentosClick={handleDocumentosClick}
        onClientesNuevosClick={handleClientesNuevosClick}
        onActualizacionesClick={handleActualizacionesClick} // Agregar el manejador para Actualizaciones
      />
      {page === "comisiones" && (
        <Comisiones
          meta={meta}
          setMeta={setMeta}
          comisionObtenida={comisionObtenida}
          setComisionObtenida={setComisionObtenida}
          ventaPorCliente={ventaPorCliente}
          setVentaPorCliente={setVentaPorCliente}
          metaHoy={metaHoy}
          setMetaHoy={setMetaHoy}
          comisionHoy={comisionHoy}
          setComisionHoy={setComisionHoy}
          handleUpdate={handleUpdate} // Pasar la función correctamente
        />
      )}
      {page === "entregas" && <Entregas />}
      {page === "ordenes" && <OrdenesServicio />}
      {page === "calculadoras" && <Calculadoras />}
      {page === "razones" && <Razones />}
      {page === "tiendas" && <Tiendas />}
      {page === "documentos" && <Documentos />}
      {page === "clientes-nuevos" && <ClientesNuevos />}
      {page === "actualizaciones" && <Actualizaciones />}{" "}
      {/* Agregar la nueva vista */}
      <ModalInput
        open={modal.open}
        label={modal.label}
        value={modal.value}
        onClose={handleModalClose}
        onSave={handleModalSave}
        isMoney={modal.isMoney}
      />
      <ChoferModal
        open={choferModal}
        onClose={() => setChoferModal(false)}
        onSave={(data) => {
          setChofer(data);
          setChoferModal(false);
        }}
      />
    </>
  );
}

export default App;
