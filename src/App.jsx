
import { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";
import Login from "./Login";
import ModalInput from "./ModalInput";
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
import Actualizaciones from "./Actualizaciones";
import LoadingScreen from "./LoadingScreen";

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // Cerrar sidebar al hacer click fuera (en móvil/tablet)
  useEffect(() => {
    if (!sidebarOpen || window.innerWidth > 768) return;
    const handleClick = (e) => {
      const sidebar = document.querySelector('.sidebar');
      if (sidebar && !sidebar.contains(e.target)) {
        setSidebarOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [sidebarOpen]);
  // Cierra el sidebar al hacer click fuera (overlay)
  const handleOverlayClick = () => setSidebarOpen(false);
  // Guardar/restaurar la vista actual
  const [page, setPage] = useState(() => {
    return localStorage.getItem("crm-vista-actual") || "comisiones";
  });

  // Guardar la vista cada vez que cambie
  useEffect(() => {
    localStorage.setItem("crm-vista-actual", page);
  }, [page]);
  const [user, setUser] = useState(null);
  // Eliminar loading, ya no se usará para recarga
  const [meta, setMeta] = useState(35000);
  const [comisionObtenida, setComisionObtenida] = useState(0);
  const [ventaPorCliente, setVentaPorCliente] = useState(0);
  const [metaHoy, setMetaHoy] = useState(0);
  const [comisionHoy, setComisionHoy] = useState(0);
  const [choferModal, setChoferModal] = useState(false);
  const [chofer, setChofer] = useState({ nombre: "", contacto: "" });
  const [modal, setModal] = useState({ open: false, label: "", value: "", setter: null, isMoney: false });

  useEffect(() => {
    document.title = "CRM-MIGUEL";
  }, []);

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data?.user || null);
    };
    getUser();
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user || null);
      }
    );
    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  const toggleSidebar = () => setSidebarOpen((open) => !open);
  // Cerrar sidebar siempre al seleccionar una vista
  const closeSidebar = () => setSidebarOpen(false);
  const handleComisionesClick = () => { setPage("comisiones"); closeSidebar(); };
  const handleEntregasClick = () => { setPage("entregas"); closeSidebar(); };
  const handleOrdenesClick = () => { setPage("ordenes"); closeSidebar(); };
  const handleCalculadoraClick = () => { setPage("calculadoras"); closeSidebar(); };
  const handleRazonesClick = () => { setPage("razones"); closeSidebar(); };
  const handleTiendasClick = () => { setPage("tiendas"); closeSidebar(); };
  const handleDocumentosClick = () => { setPage("documentos"); closeSidebar(); };
  const handleClientesNuevosClick = () => { setPage("clientes-nuevos"); closeSidebar(); };
  const handleActualizacionesClick = () => { setPage("actualizaciones"); closeSidebar(); };

  const handleModalSave = async (newValue) => {
    if (modal.setter) {
      modal.setter(newValue);
      const columnMap = { Meta: "meta", "Comisión obtenida": "comision_obtenida" };
      const column = columnMap[modal.label];
      if (!column) return;
      await supabase.from("comisiones").update({ [column]: newValue }).eq("id", 1);
    }
    setModal({ ...modal, open: false });
  };
  const handleModalClose = () => setModal({ ...modal, open: false });

  // Ya no mostrar LoadingScreen al recargar
  if (!user) return <Login onLogin={setUser} />;

  return (
    <div id="app-layout">
      <Header onMenuClick={toggleSidebar} actions={[]} />
      {/* Overlay para cerrar sidebar en móvil/tablet */}
      {sidebarOpen && window.innerWidth <= 768 && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.2)",
            zIndex: 999,
          }}
          onClick={handleOverlayClick}
        />
      )}
      <div id="main-content-layout">
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
          onActualizacionesClick={handleActualizacionesClick}
        />
        <div id="main-content">
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
              handleUpdate={() => {}}
            />
          )}
          {page === "entregas" && <Entregas />}
          {page === "ordenes" && <OrdenesServicio />}
          {page === "calculadoras" && <Calculadoras />}
          {page === "razones" && <Razones />}
          {page === "tiendas" && <Tiendas />}
          {page === "documentos" && <Documentos />}
          {page === "clientes-nuevos" && <ClientesNuevos />}
          {page === "actualizaciones" && <Actualizaciones />}
        </div>
      </div>
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
    </div>
  );
}

export default App;
