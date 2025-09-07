import BottomBar from "./BottomBar";

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
  // Estado y lógica para el prompt de instalación PWA
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstall, setShowInstall] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstall(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') setShowInstall(false);
    }
  };
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [page, setPage] = useState(() => {
    return localStorage.getItem("crm-vista-actual") || "comisiones";
  });

  // Guardar la vista actual en localStorage cada vez que cambia
  useEffect(() => {
    if (page) {
      localStorage.setItem("crm-vista-actual", page);
    }
  }, [page]);
  const [meta, setMeta] = useState(35000);
  const [comisionObtenida, setComisionObtenida] = useState(0);
  const [ventaPorCliente, setVentaPorCliente] = useState(0);
  const [metaHoy, setMetaHoy] = useState(0);
  const [comisionHoy, setComisionHoy] = useState(0);
  const [choferModal, setChoferModal] = useState(false);
  const [chofer, setChofer] = useState({ nombre: "", contacto: "" });
  const [modal, setModal] = useState({ open: false, label: "", value: "", setter: null, isMoney: false });
  // Handlers y helpers para navegación y sidebar (forzar redeploy)
  const toggleSidebar = () => setSidebarOpen((open) => !open);
  const closeSidebar = () => setSidebarOpen(false);
  const handleOverlayClick = () => closeSidebar();

  // Handlers para navegación desde Sidebar (solo cierran sidebar en desktop)
  const handleComisionesClick = () => { setPage("comisiones"); if (!isMobile) closeSidebar(); };
  const handleEntregasClick = () => { setPage("entregas"); if (!isMobile) closeSidebar(); };
  const handleOrdenesClick = () => { setPage("ordenes"); if (!isMobile) closeSidebar(); };
  const handleCalculadoraClick = () => { setPage("calculadoras"); if (!isMobile) closeSidebar(); };
  const handleRazonesClick = () => { setPage("razones"); if (!isMobile) closeSidebar(); };
  const handleTiendasClick = () => { setPage("tiendas"); if (!isMobile) closeSidebar(); };
  const handleDocumentosClick = () => { setPage("documentos"); if (!isMobile) closeSidebar(); };
  const handleClientesNuevosClick = () => { setPage("clientes-nuevos"); if (!isMobile) closeSidebar(); };
  const handleActualizacionesClick = () => { setPage("actualizaciones"); if (!isMobile) closeSidebar(); };

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
    const session = supabase.auth.getSession ? null : null; // fallback para versiones viejas
    (async () => {
      const { data, error } = await supabase.auth.getUser();
      if (data && data.user) setUser(data.user);
    })();
    // Suscribirse a cambios de sesión
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session && session.user) setUser(session.user);
      else setUser(null);
    });
    return () => {
      if (listener && listener.subscription) listener.subscription.unsubscribe();
    };
  }, []);

  if (!user) return <Login onLogin={setUser} />;

  // Detectar si es móvil
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;

  // Handler para menú: en móvil expande BottomBar, en desktop abre sidebar
  const handleMenuClick = () => {
    if (isMobile) {
      setBottomBarExpanded(true);
    } else {
      toggleSidebar();
    }
  };

  return (
    <div id="app-layout">
      <Header onMenuClick={handleMenuClick} actions={[]} />
      {/* Overlay para cerrar sidebar en móvil/tablet */}
      {sidebarOpen && !bottomBarExpanded && isMobile && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.18)",
            zIndex: 1000,
          }}
          onClick={handleOverlayClick}
        />
      )}
      {/* Sidebar solo en desktop */}
      {!isMobile && (
        <Sidebar
          open={sidebarOpen}
          onClose={closeSidebar}
          onComisionesClick={handleComisionesClick}
          onEntregasClick={handleEntregasClick}
          onOrdenesClick={handleOrdenesClick}
          onCalculadoraClick={handleCalculadoraClick}
          onRazonesClick={handleRazonesClick}
          onTiendasClick={handleTiendasClick}
          onDocumentosClick={handleDocumentosClick}
          onClientesNuevosClick={handleClientesNuevosClick}
          onActualizacionesClick={handleActualizacionesClick}
          setUser={setUser}
        />
      )}
      {/* BottomBar solo en móvil */}
      <BottomBar
        onNavigate={(p) => {
          setPage(p);
          closeSidebar();
        }}
        active={page}
        expanded={bottomBarExpanded}
        onCloseExpand={() => setBottomBarExpanded(false)}
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
      {/* Botón flotante para instalar la app como PWA */}
      {showInstall && (
        <button
          style={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            zIndex: 3000,
            background: '#4f46e5',
            color: '#fff',
            border: 'none',
            borderRadius: 12,
            padding: '12px 20px',
            fontSize: '1.1rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
            cursor: 'pointer',
          }}
          onClick={handleInstallClick}
        >
          Instalar app
        </button>
      )}
    </div>
  );
}

export default App;
