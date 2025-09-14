import BottomBar from "./BottomBar";
import "./App.css";
import Push from "./push";
import PushMovil from "./pushmovil";

import { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";
import Login from "./Login";
import ModalInput from "./ModalInput";
import Header from "./Header";
import HeaderMovil from "./HeaderMovil";
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
import Gestion from "./Gestion";
import Cotizaciones from "./Cotizaciones";
import ResetPassword from "./ResetPassword";
import Configuraciones from "./Configuraciones";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";

function App() {
  // Detectar si es móvil (debe ir antes de cualquier uso de isMobile)
  let isMobile = false;
  if (typeof window !== "undefined") {
    isMobile = window.innerWidth <= 768;
  }

  // Inhabilitar botón atrás en móviles
  useEffect(() => {
    if (!isMobile) return;
    const handler = (e) => {
      e.preventDefault();
      window.history.pushState(null, '', window.location.href);
    };
    window.history.pushState(null, '', window.location.href);
    window.addEventListener('popstate', handler);
    return () => window.removeEventListener('popstate', handler);
  }, [isMobile]);

  // Mostrar pantalla de reset si la URL contiene /reset-password
  if (window.location.pathname.startsWith('/reset-password')) {
    return <ResetPassword />;
  }

  const handleCotizacionesClick = () => {
    setPage("cotizaciones");
    if (!isMobile) closeSidebar();
  };
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);
  // Eliminar page y setPage, ya no se usan

  // Ya no se guarda la vista actual en localStorage
  const [meta, setMeta] = useState(35000);
  const [comisionObtenida, setComisionObtenida] = useState(0);
  const [ventaPorCliente, setVentaPorCliente] = useState(0);
  const [metaHoy, setMetaHoy] = useState(0);
  const [comisionHoy, setComisionHoy] = useState(0);
  const [choferModal, setChoferModal] = useState(false);
  const [chofer, setChofer] = useState({ nombre: "", contacto: "" });
  const [modal, setModal] = useState({
    open: false,
    label: "",
    value: "",
    setter: null,
    isMoney: false,
  });
  // Handlers y helpers para navegación y sidebar (forzar redeploy)
  const toggleSidebar = () => setSidebarOpen((open) => !open);
  const closeSidebar = () => setSidebarOpen(false);
  const handleOverlayClick = () => closeSidebar();

  // Handlers para navegación desde Sidebar (solo cierran sidebar en desktop)
  const handleComisionesClick = () => {
    setPage("comisiones");
    if (!isMobile) closeSidebar();
  };
  const handleEntregasClick = () => {
    setPage("entregas");
    if (!isMobile) closeSidebar();
  };
  const handleOrdenesClick = () => {
    setPage("ordenes");
    if (!isMobile) closeSidebar();
  };
  const handleCalculadoraClick = () => {
    setPage("calculadoras");
    if (!isMobile) closeSidebar();
  };
  const handleRazonesClick = () => {
    setPage("razones");
    if (!isMobile) closeSidebar();
  };
  const handleTiendasClick = () => {
    setPage("tiendas");
    if (!isMobile) closeSidebar();
  };
  const handleDocumentosClick = () => {
    setPage("documentos");
    if (!isMobile) closeSidebar();
  };
  const handleClientesNuevosClick = () => {
    setPage("clientes-nuevos");
    if (!isMobile) closeSidebar();
  };
  const handleActualizacionesClick = () => {
    setPage("actualizaciones");
    if (!isMobile) closeSidebar();
  };
  const handleGestionClick = () => {
    setPage("gestion");
    if (!isMobile) closeSidebar();
  };

  // Handlers para ModalInput
  const handleModalClose = () => setModal((m) => ({ ...m, open: false }));
  const handleModalSave = () => {
    if (modal.setter) modal.setter(modal.value);
    setModal((m) => ({ ...m, open: false }));
  };
  // Cerrar sidebar al hacer click fuera (en móvil/tablet)
  const [bottomBarExpanded, setBottomBarExpanded] = useState(false);

  // Recuperar usuario autenticado al cargar la app
  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      setUser(null);
      return;
    }
    (async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();
      if (error || !data) setUser(null);
      else setUser(data);
    })();
  }, []);

  // Mostrar pantalla de reset si la URL contiene /reset-password
  const location = useLocation();
  if (location.pathname.startsWith('/reset-password')) {
    return <ResetPassword />;
  }
  if (!user) return <Login onLogin={setUser} />;

  // (isMobile ya está declarado arriba)

  // Handler para menú: en móvil expande BottomBar, en desktop abre sidebar
  const handleMenuClick = () => {
    if (isMobile) {
      setBottomBarExpanded(true);
    } else {
      toggleSidebar();
    }
  };

  return (
    <>
      <Push />
      <PushMovil />
      <div id="app-layout" className={sidebarOpen ? "sidebar-open" : ""}>
        {!isMobile && (
          <Header onMenuClick={handleMenuClick} actions={[]} user={user} />
        )}
        {isMobile && (
          <HeaderMovil
            onMenu={() => setBottomBarExpanded(true)}
          />
        )}
        <div className="layout-container">
          <Sidebar
            open={sidebarOpen}
            setUser={setUser}
            closeSidebar={closeSidebar}
          />
          <div id="main-content">
            <Routes>
              <Route path="/" element={<Comisiones
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
                setPage={() => {}}
              />} />
              <Route path="/entregas" element={<Entregas />} />
              <Route path="/ordenes" element={<OrdenesServicio />} />
              <Route path="/calculadoras" element={<Calculadoras />} />
              <Route path="/razones" element={<Razones />} />
              <Route path="/tiendas" element={<Tiendas />} />
              <Route path="/documentos" element={<Documentos />} />
              <Route path="/clientes-nuevos" element={<ClientesNuevos />} />
              <Route path="/cotizaciones" element={<Cotizaciones />} />
              <Route path="/actualizaciones" element={<Actualizaciones />} />
              <Route path="/gestion" element={<Gestion />} />
              <Route path="/configuraciones" element={<Configuraciones />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
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
        {/* BottomBar solo en móviles */}
        {isMobile && (
          <BottomBar
            onNavigate={setPage}
            active={page}
            expanded={bottomBarExpanded}
            onCloseExpand={() => setBottomBarExpanded(false)}
            onLogout={async () => {
              await supabase.auth.signOut();
              setUser(null);
            }}
          />
        )}
      </div>
    </>
  );
}

export default App;
