import React, { useState, useEffect } from "react";
import { Container, Card, Grid, Flex, Box, Heading, Text, Input, Button, IconWrapper, Badge } from './designSystem';
import { FaTruck, FaPlus, FaUser, FaSearch, FaFilter, FaMapMarkerAlt, FaWhatsapp, FaPhone, FaClock } from "react-icons/fa";
import { supabase } from "./supabaseClient";
import ChoferModal from "./ChoferModal";
import ChoferDetalleModal from "./ChoferDetalleModal";
import ActualizarEstatusModal from "./components/ActualizarEstatusModal";
import ActualizarDatosModal from "./components/ActualizarDatosModal";
import DetalleEntregaModal from "./components/DetalleEntregaModal";
import AgregarEntregaForm from "./AgregarEntregaForm";

const estados = ["Pendiente", "Entregado", "Rechazado", "Reprogramado"];
const tiposEntrega = ["TODOS", "TIENDA", "DOMICILIO", "BODEGA SPS", "BODEGA TG"];

function tiempoTranscurrido(fecha, estatus) {
  if (estatus && estatus.toLowerCase() === "entregado") return "✔️";
  if (estatus && estatus.toLowerCase() === "rechazado") return "Rechazado";
  if (!fecha) return "-";
  const fechaEntrega = new Date(fecha);
  const ahora = new Date();
  const diffMs = ahora - fechaEntrega;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHrs = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHrs / 24);
  if (diffDays > 0) return `${diffDays} días`;
  if (diffHrs > 0) return `${diffHrs} horas`;
  if (diffMins > 0) return `${diffMins} minutos`;
  return "ahora";
}

const EntregasNew = () => {
  const [entregas, setEntregas] = useState([]);
  const [detalle, setDetalle] = useState(null);
  const [showAgregar, setShowAgregar] = useState(false);
  const [choferModal, setChoferModal] = useState(false);
  const [choferModalType, setChoferModalType] = useState("formulario");
  const [chofer, setChofer] = useState(null);
  const [user, setUser] = useState(null);
  const [filtroEstatus, setFiltroEstatus] = useState("");
  const [filtroNoGestionados, setFiltroNoGestionados] = useState(false);
  const [filtroTipoEntrega, setFiltroTipoEntrega] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [detalleModal, setDetalleModal] = useState({ open: false, entrega: null });
  const [estatusModal, setEstatusModal] = useState({ open: false, entrega: null });
  const [datosModal, setDatosModal] = useState({ open: false, entrega: null });

  // Obtener usuario autenticado
  useEffect(() => {
    const getUser = async () => {
      const userId = localStorage.getItem("userId");
      if (!userId) return;
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .maybeSingle();
        if (error || !data) throw error;
        setUser(data);
      } catch (e) {
        console.error("Error al obtener usuario:", e);
      }
    };
    getUser();
  }, []);

  // Cargar chofer
  const fetchChofer = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from("choferes")
        .select("*")
        .eq("usuario_id", user.id)
        .single();
      if (error && error.code !== 'PGRST116') throw error;
      setChofer(data || null);
    } catch (e) {
      setChofer(null);
    }
  };

  useEffect(() => {
    fetchChofer();
  }, [user]);

  // Obtener entregas
  const fetchEntregas = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from("entregas_pendientes")
        .select("*")
        .eq("usuario_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      setEntregas(data || []);
    } catch (e) {
      console.error("Error al obtener entregas:", e);
    }
  };

  useEffect(() => {
    fetchEntregas();
  }, [user]);

  // Contador de entregas sin entregar
  const pendientesSinEntregar = entregas.filter(
    e => String(e.estatus || '').toLowerCase() !== 'entregado'
  ).length;

  // Conteos por tipo de entrega
  const conteoTipos = {
    'TODOS': entregas.filter(e => 
      String(e.estatus || '').toLowerCase() !== 'entregado' && 
      String(e.estatus || '').toLowerCase() !== 'rechazado'
    ).length,
    'TIENDA': entregas.filter(e => 
      e.tipo_entrega === 'TIENDA' && 
      String(e.estatus || '').toLowerCase() !== 'entregado' && 
      String(e.estatus || '').toLowerCase() !== 'rechazado'
    ).length,
    'DOMICILIO': entregas.filter(e => 
      e.tipo_entrega === 'DOMICILIO' && 
      String(e.estatus || '').toLowerCase() !== 'entregado' && 
      String(e.estatus || '').toLowerCase() !== 'rechazado'
    ).length,
    'BODEGA SPS': entregas.filter(e => 
      e.tipo_entrega === 'BODEGA SPS' && 
      String(e.estatus || '').toLowerCase() !== 'entregado' && 
      String(e.estatus || '').toLowerCase() !== 'rechazado'
    ).length,
    'BODEGA TG': entregas.filter(e => 
      e.tipo_entrega === 'BODEGA TG' && 
      String(e.estatus || '').toLowerCase() !== 'entregado' && 
      String(e.estatus || '').toLowerCase() !== 'rechazado'
    ).length,
  };

  // Filtrar entregas
  const entregasFiltradas = entregas
    .filter((e) => {
      if ((!filtroEstatus || filtroEstatus === "") && (e.estatus === "Entregado" || e.estatus === "Rechazado")) return false;
      const matchesEstatus = filtroEstatus ? e.estatus === filtroEstatus : true;
      const matchesTipoEntrega = filtroTipoEntrega ? e.tipo_entrega === filtroTipoEntrega : true;
      const matchesBusqueda = busqueda
        ? e.cliente.toLowerCase().includes(busqueda.toLowerCase()) ||
          e.factura.toLowerCase().includes(busqueda.toLowerCase())
        : true;
      const matchesNoGestionados = filtroNoGestionados ? (e.gestionada || '').toLowerCase() === 'no gestionada' : true;
      return matchesEstatus && matchesTipoEntrega && matchesBusqueda && matchesNoGestionados;
    })
    .sort((a, b) => {
      const hoy = new Date();
      const yyyy = hoy.getFullYear();
      const mm = String(hoy.getMonth() + 1).padStart(2, '0');
      const dd = String(hoy.getDate()).padStart(2, '0');
      const hoyStr = `${yyyy}-${mm}-${dd}`;
      const getFecha = (e) => (e.fecha_entrega ? e.fecha_entrega : '');
      const getEstatus = (e) => (e.estatus || '').toLowerCase();
      
      const aAtrasada = getFecha(a) < hoyStr && getEstatus(a) !== 'entregado';
      const bAtrasada = getFecha(b) < hoyStr && getEstatus(b) !== 'entregado';
      if (aAtrasada !== bAtrasada) return bAtrasada - aAtrasada;
      
      const aHoy = getFecha(a) === hoyStr && getEstatus(a) !== 'entregado';
      const bHoy = getFecha(b) === hoyStr && getEstatus(b) !== 'entregado';
      if (aHoy !== bHoy) return bHoy - aHoy;
      
      return (getFecha(b) > getFecha(a)) ? 1 : -1;
    });

  // Agregar entrega
  const handleAdd = async (nuevo) => {
    if (!user) return false;
    try {
      const { error } = await supabase
        .from("entregas_pendientes")
        .insert([{ ...nuevo, usuario_id: user.id }]);
      if (error) throw error;
      await fetchEntregas();
      return true;
    } catch (e) {
      return false;
    }
  };

  // Guardar chofer
  const handleSaveChofer = async ({ nombre, contacto }) => {
    if (!user) return;
    try {
      if (chofer) {
        await supabase
          .from("choferes")
          .update({ nombre, telefono: contacto })
          .eq("usuario_id", user.id);
      } else {
        await supabase
          .from("choferes")
          .insert([{ nombre, telefono: contacto, usuario_id: user.id }]);
      }
      await fetchChofer();
      setChoferModalType("detalle");
    } catch (e) {
      alert("Error al guardar chofer: " + (e.message || e));
    }
  };

  const getEstatusBadgeColor = (estatus) => {
    switch (estatus?.toLowerCase()) {
      case 'entregado': return 'green';
      case 'rechazado': return 'red';
      case 'reprogramado': return 'amber';
      default: return 'blue';
    }
  };

  return (
    <Container>
      <Flex direction="column" gap="6">
        {/* Header con info del chofer */}
        <Card variant="elevated" css={{ background: '$blue3' }}>
          <Flex align="center" justify="space-between" wrap="wrap" gap="4">
            <Flex align="center" gap="3">
              <IconWrapper color="blue" size="large">
                <FaUser size={24} />
              </IconWrapper>
              <Box>
                <Heading size="5" css={{ color: '$blue12' }}>
                  {chofer ? `${chofer.nombre || 'Sin nombre'}` : 'Sin chofer registrado'}
                </Heading>
                <Text size="2" css={{ color: '$blue11' }}>
                  {chofer ? `Tel: ${chofer.telefono || 'Sin número'}` : 'Configura tu chofer para entregas'}
                </Text>
              </Box>
            </Flex>
            <Badge color="amber" css={{ fontSize: '$3', px: '$4', py: '$2' }}>
              <FaTruck /> {pendientesSinEntregar} sin entregar
            </Badge>
          </Flex>
        </Card>

        {/* Barra de búsqueda y botones */}
        <Flex gap="3" wrap="wrap" align="center">
          <Box css={{ flex: 1, minWidth: 250, position: 'relative' }}>
            <IconWrapper 
              color="slate" 
              css={{ 
                position: 'absolute', 
                left: '$3', 
                top: '50%', 
                transform: 'translateY(-50%)',
                pointerEvents: 'none'
              }}
            >
              <FaSearch />
            </IconWrapper>
            <Input
              type="text"
              placeholder="Buscar por cliente o factura..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              css={{ pl: '$10' }}
            />
          </Box>
          <Button variant="primary" onClick={() => setShowAgregar(true)}>
            <FaPlus /> Agregar entrega
          </Button>
          <Button variant="secondary" onClick={() => {
            setChoferModal(true);
            setChoferModalType(chofer ? "detalle" : "formulario");
          }}>
            <FaUser /> Chofer
          </Button>
        </Flex>

        {/* Filtros de tipo de entrega */}
        <Card>
          <Flex direction="column" gap="3">
            <Flex align="center" gap="2">
              <IconWrapper color="blue">
                <FaFilter />
              </IconWrapper>
              <Text weight="medium">Filtrar por tipo de entrega</Text>
            </Flex>
            <Flex gap="2" wrap="wrap">
              {tiposEntrega.map(tipo => (
                <Button
                  key={tipo}
                  variant={filtroTipoEntrega === tipo ? "primary" : "ghost"}
                  size="small"
                  onClick={() => setFiltroTipoEntrega(filtroTipoEntrega === tipo ? "" : tipo)}
                >
                  {tipo} {conteoTipos[tipo] !== undefined && `(${conteoTipos[tipo]})`}
                </Button>
              ))}
            </Flex>
          </Flex>
        </Card>

        {/* Filtros de estatus */}
        <Flex gap="2" wrap="wrap">
          {estados.map(estado => (
            <Button
              key={estado}
              variant={filtroEstatus === estado ? getEstatusBadgeColor(estado) : "ghost"}
              onClick={() => setFiltroEstatus(filtroEstatus === estado ? "" : estado)}
            >
              {estado}
            </Button>
          ))}
          <Button
            variant={filtroNoGestionados ? "warning" : "ghost"}
            onClick={() => setFiltroNoGestionados(!filtroNoGestionados)}
          >
            No gestionadas
          </Button>
        </Flex>

        {/* Grid de entregas */}
        {entregasFiltradas.length === 0 ? (
          <Card variant="elevated">
            <Flex direction="column" align="center" justify="center" gap="3" css={{ py: '$8' }}>
              <IconWrapper color="slate" size="large">
                <FaTruck size={48} />
              </IconWrapper>
              <Heading size="4" css={{ color: '$slate11' }}>
                No hay entregas
              </Heading>
              <Text css={{ color: '$slate10' }}>
                {busqueda || filtroEstatus ? 'No se encontraron entregas con los filtros aplicados' : 'Agrega tu primera entrega para comenzar'}
              </Text>
            </Flex>
          </Card>
        ) : (
          <Grid columns={{ '@initial': '1', '@tablet': '2', '@laptop': '3' }} gap="4">
            {entregasFiltradas.map((entrega) => {
              const esAtrasada = entrega.fecha_entrega && entrega.fecha_entrega < new Date().toISOString().split('T')[0] && entrega.estatus?.toLowerCase() !== 'entregado';
              
              return (
                <Card 
                  key={entrega.id} 
                  variant="interactive"
                  css={{ 
                    borderLeft: esAtrasada ? '4px solid $red9' : '4px solid $blue9',
                    cursor: 'pointer'
                  }}
                  onClick={() => setDetalleModal({ open: true, entrega })}
                >
                  <Flex direction="column" gap="3">
                    <Flex align="center" justify="space-between">
                      <Text weight="bold" size="4">{entrega.cliente}</Text>
                      <Badge color={getEstatusBadgeColor(entrega.estatus)}>
                        {entrega.estatus || 'Pendiente'}
                      </Badge>
                    </Flex>
                    
                    <Box>
                      <Text size="2" css={{ color: '$slate11' }}>Factura: {entrega.factura}</Text>
                      <Text size="2" css={{ color: '$slate11' }}>Artículo: {entrega.articulo || 'N/A'}</Text>
                      {entrega.tipo_entrega && (
                        <Badge color="violet" css={{ mt: '$2' }}>{entrega.tipo_entrega}</Badge>
                      )}
                    </Box>

                    <Flex align="center" gap="2" css={{ color: '$slate11' }}>
                      <FaClock />
                      <Text size="2">
                        {entrega.fecha_entrega || 'Sin fecha'} - {tiempoTranscurrido(entrega.fecha_entrega, entrega.estatus)}
                      </Text>
                    </Flex>

                    {entrega.cel && (
                      <Flex gap="2">
                        <Button 
                          size="small" 
                          variant="success"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(`https://wa.me/504${entrega.cel.replace(/[^\d]/g, "")}`, '_blank');
                          }}
                        >
                          <FaWhatsapp /> WhatsApp
                        </Button>
                        <Button 
                          size="small" 
                          variant="secondary"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.location.href = `tel:${entrega.cel}`;
                          }}
                        >
                          <FaPhone /> Llamar
                        </Button>
                      </Flex>
                    )}
                  </Flex>
                </Card>
              );
            })}
          </Grid>
        )}
      </Flex>

      {/* Modales */}
      {showAgregar && (
        <AgregarEntregaForm
          open={showAgregar}
          onClose={() => setShowAgregar(false)}
          onAdd={async (nueva) => {
            const success = await handleAdd(nueva);
            if (success) {
              setShowAgregar(false);
              alert("Entrega agregada exitosamente");
            } else {
              alert("Error al agregar entrega");
            }
          }}
        />
      )}

      {choferModal && choferModalType === "formulario" && (
        <ChoferModal
          open={choferModal}
          onClose={() => setChoferModal(false)}
          onSave={handleSaveChofer}
          initialData={chofer}
        />
      )}

      {choferModal && choferModalType === "detalle" && chofer && (
        <ChoferDetalleModal
          open={choferModal}
          chofer={chofer}
          onClose={() => setChoferModal(false)}
          onEdit={() => setChoferModalType("formulario")}
        />
      )}

      {/* Modal de detalle */}
      {detalleModal.open && (
        <DetalleEntregaModal
          open={detalleModal.open}
          entrega={detalleModal.entrega}
          onClose={() => setDetalleModal({ open: false, entrega: null })}
          onActualizarEstatus={() => {
            setEstatusModal({ open: true, entrega: detalleModal.entrega });
            setDetalleModal({ open: false, entrega: null });
          }}
          onActualizarDatos={() => {
            setDatosModal({ open: true, entrega: detalleModal.entrega });
            setDetalleModal({ open: false, entrega: null });
          }}
        />
      )}

      {/* Modal de actualizar estatus */}
      {estatusModal.open && (
        <ActualizarEstatusModal
          open={estatusModal.open}
          entrega={estatusModal.entrega}
          onClose={() => {
            setEstatusModal({ open: false, entrega: null });
            setDetalleModal({ open: true, entrega: estatusModal.entrega });
          }}
          onUpdated={async () => {
            await fetchEntregas();
            setEstatusModal({ open: false, entrega: null });
          }}
        />
      )}

      {/* Modal de actualizar datos */}
      {datosModal.open && (
        <ActualizarDatosModal
          open={datosModal.open}
          entrega={datosModal.entrega}
          onClose={() => {
            setDatosModal({ open: false, entrega: null });
            setDetalleModal({ open: true, entrega: datosModal.entrega });
          }}
          onUpdated={async () => {
            await fetchEntregas();
            setDatosModal({ open: false, entrega: null });
          }}
        />
      )}
    </Container>
  );
};

export default EntregasNew;
