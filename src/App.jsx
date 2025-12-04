import BottomBar from "./BottomBar";
import MisGastos from "./MisGastos";
import Seguimiento from "./Seguimiento";
import "./App.css";
import Push from "./push";
import PushMovil from "./pushmovil";
import { requestFirebaseNotificationPermission, onFirebaseMessage } from "./firebaseNotifications";
import NotificationToast from "./NotificationToast";

import { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";
import Login from "./Login";
import LoginMobile from "./LoginMobile";
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
import Promedios from "./Promedios";
import LoadingScreen from "./LoadingScreen";
import Gestion from "./Gestion";
import TablaFiltradaPorEstado from "./TablaFiltradaPorEstado";
import Cotizaciones from "./Cotizaciones";
import ResetPassword from "./ResetPassword";
import Configuraciones from "./Configuraciones";
import { Routes, Route, useLocation, Navigate, useNavigate } from "react-router-dom";
import Admin from "./Admin";
import CarteraClientes from "./Aprendisaje";

function App() {
  const navigate = useNavigate();
  const location = useLocation();

  // Navegación para BottomBar
  function handleBottomBarNavigate(key) {
    if (key === "cartera") {
      navigate("/aprendisaje");
    } else {
      navigate(key === "comisiones" ? "/" : `/${key}`);
    }
  }
  // Detectar si es móvil (debe ir antes de cualquier uso de isMobile)
  let isMobile = false;
  if (typeof window !== "undefined") {
    isMobile = window.innerWidth <= 768;
  }

  // HOOKS SIEMPRE AL INICIO
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [user, setUser] = useState(null);
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
  const [bottomBarExpanded, setBottomBarExpanded] = useState(false);
  const [notif, setNotif] = useState({ open: false, title: '', body: '' });
  // Exponer setNotif global para que push.js y pushmovil.js puedan disparar notificaciones internas
  useEffect(() => {
    window.setNotif = setNotif;
    return () => { window.setNotif = null; };
  }, []);

  // Mostrar notificación de entregas pendientes al recargar la app
  useEffect(() => {
    async function checkEntregasPendientes() {
      const userId = localStorage.getItem("userId");
      if (!userId) return;
      const { data: user, error: userError } = await supabase
        .from("profiles")
        .select("id, nombre")
        .eq("id", userId)
        .maybeSingle();
      if (userError || !user) return;
      const hoy = new Date();
      const yyyy = hoy.getFullYear();
      const mm = String(hoy.getMonth() + 1).padStart(2, '0');
      const dd = String(hoy.getDate()).padStart(2, '0');
      const hoyStr = `${yyyy}-${mm}-${dd}`;
      const { data: entregas, error: entregasError } = await supabase
        .from("entregas_pendientes")
        .select("id, cliente, fecha_entrega, estatus")
        .eq("usuario_id", user.id);
      if (entregasError || !entregas) return;
      const pendientes = entregas.filter(e => {
        if (String(e.estatus).toLowerCase() === 'entregado') return false;
        return e.fecha_entrega === hoyStr || e.fecha_entrega < hoyStr;
      });
      if (pendientes.length > 0) {
        let body = pendientes.map(e => {
          let estado = e.fecha_entrega === hoyStr ? 'para hoy' : 'atrasada';
          return `${e.cliente} = ${estado}`;
        }).join('\n');
        setNotif({
          open: true,
          title: 'Entregas pendientes',
          body: `Hola ${user.nombre || ''}!\nTienes estas entregas pendientes:\n${body}`
        });
      }
    }
    checkEntregasPendientes();
  }, []);
  const [page, setPage] = useState(() => {
    return localStorage.getItem("crm-vista-actual") || "comisiones";
  });
  // Pantalla de carga inicial
  const [showSplash, setShowSplash] = useState(true);


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
      else {
        setUser(data);
        localStorage.setItem("user", JSON.stringify(data));
      }
    })();
  }, []);

  // Solicitar permiso de notificaciones push al cargar la app (solo Android)
  useEffect(() => {
    if (/android/i.test(navigator.userAgent)) {
      requestFirebaseNotificationPermission();
      onFirebaseMessage((payload) => {
        setNotif({
          open: true,
          title: payload.notification?.title || 'Notificación',
          body: payload.notification?.body || '',
        });
      });
    }
  }, []);

  // Guardar la vista actual en localStorage cada vez que cambia
  useEffect(() => {
    if (page) {
      localStorage.setItem("crm-vista-actual", page);
    }
  }, [page]);

  // Splash screen
  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 1000);
    return () => clearTimeout(timer);
  }, []);


  // Si la URL contiene ?fromNotif=1, navega a /entregas (solo una vez)
  useEffect(() => {
    if (location.search.includes('fromNotif=1') && location.pathname !== '/entregas') {
      navigate('/entregas', { replace: true });
    }
  }, [location, navigate]);

  // --- RETURNS CONDICIONALES ---
  if (showSplash) return <LoadingScreen />;
  if (location.pathname.startsWith('/reset-password')) {
    return <ResetPassword />;
  }
  if (!user) {
    if (isMobile) return <LoginMobile onLogin={setUser} />;
    return <Login onLogin={setUser} />;
  }

  // Handlers y helpers para navegación y sidebar
  // Mantener el sidebar siempre abierto en versión desktop.
  const toggleSidebar = () => setSidebarOpen(true);
  const closeSidebar = () => {
    // no-op para evitar que se cierre el sidebar
  };
  const handleOverlayClick = () => {
    // no-op para mantener el sidebar abierto
  };
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
  const handleCotizacionesClick = () => {
    setPage("cotizaciones");
    if (!isMobile) closeSidebar();
  };

  // Handler para menú: en móvil expande BottomBar, en desktop abre sidebar
  const handleMenuClick = () => {
    if (isMobile) {
      setBottomBarExpanded(true);
    } else {
      toggleSidebar();
    }
  };
  // Handlers para ModalInput
  const handleModalClose = () => setModal((m) => ({ ...m, open: false }));
  const handleModalSave = () => {
    if (modal.setter) modal.setter(modal.value);
    setModal((m) => ({ ...m, open: false }));
  };

  if (showSplash) return <LoadingScreen />;

  return (
    <>
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
                setPage={setPage}
              />} />
                <Route path="/mis-gastos" element={<MisGastos />} />
              <Route path="/entregas" element={<Entregas />} />
              <Route path="/ordenes" element={<OrdenesServicio />} />
              <Route path="/calculadoras" element={<Calculadoras />} />
              <Route path="/razones" element={<Razones />} />
              <Route path="/tiendas" element={<Tiendas />} />
              <Route path="/documentos" element={<Documentos />} />
              <Route path="/clientes-nuevos" element={<ClientesNuevos />} />
              <Route path="/cotizaciones" element={<Cotizaciones />} />
              <Route path="/actualizaciones" element={<Actualizaciones />} />
              <Route path="/promedios" element={<Promedios />} />
              <Route path="/gestion" element={<Gestion />} />
              <Route path="/gestion/no_contestan" element={<TablaFiltradaPorEstado estado="no_contestan" />} />
              <Route path="/gestion/no_quiere" element={<TablaFiltradaPorEstado estado="no_quiere" />} />
              <Route path="/gestion/si_quiere" element={<TablaFiltradaPorEstado estado="si_quiere" />} />
              <Route path="/gestion/a_eliminar" element={<TablaFiltradaPorEstado estado="a_eliminar" />} />
              <Route path="/seguimiento" element={<Seguimiento />} />
              {user && user.rol === "superadmin" && (
                <Route path="/admin" element={<Admin />} />
              )}
              <Route path="/configuraciones" element={<Configuraciones />} />
              <Route path="/aprendisaje" element={<CarteraClientes />} />
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
            onNavigate={handleBottomBarNavigate}
            active={page}
            expanded={bottomBarExpanded}
            onCloseExpand={() => setBottomBarExpanded(false)}
            onLogout={async () => {
              await supabase.auth.signOut();
              setUser(null);
              localStorage.removeItem("user");
            }}
          />
        )}
      </div>
      <NotificationToast
        open={notif.open}
        title={notif.title}
        body={notif.body}
        onClose={() => setNotif(n => ({ ...n, open: false }))}
        onViewEntregas={() => {
          setNotif(n => ({ ...n, open: false }));
          navigate('/entregas');
        }}
      />
    </>
  );
}

export default App;
