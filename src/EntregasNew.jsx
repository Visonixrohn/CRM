import React, { useState, useEffect } from "react";
import { Container, Card, Grid, Flex, Box, Heading, Text, Input, Button, IconWrapper, Badge } from './designSystem';
import { FaTruck, FaPlus, FaUser, FaSearch, FaFilter, FaMapMarkerAlt, FaWhatsapp, FaPhone, FaClock } from "react-icons/fa";
import { supabase } from "./supabaseClient";
import ModalEstatus from "./components/ModalEstatus";
import ChoferModal from "./ChoferModal";
import ChoferDetalleModal from "./ChoferDetalleModal";
import ActualizarTipoEntregaModal from "./components/ActualizarTipoEntregaModal";
import ActualizarGestionadaModal from "./components/ActualizarGestionadaModal";
import ActualizarEstatusModal from "./components/ActualizarEstatusModal";
import ActualizarFechaEntregaModal from "./components/ActualizarFechaEntregaModal";
import EditFieldModal from "./EditFieldModal";
import EditUbicacionModal from "./EditUbicacionModal";
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
  const [entregaTipoModal, setEntregaTipoModal] = useState({ open: false, entrega: null });
  const [gestionadaModal, setGestionadaModal] = useState({ open: false, entrega: null });
  const [estatusModal, setEstatusModal] = useState({ open: false, entrega: null });
  const [fechaEntregaModal, setFechaEntregaModal] = useState({ open: false, entrega: null });
  const [editField, setEditField] = useState({ open: false, field: null, value: "", entrega: null });
  const [editUbicacion, setEditUbicacion] = useState({ open: false, entrega: null });

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

  // Actualizar estatus
  const handleUpdateEstatus = async (nuevo, tipoEntrega, gestionada) => {
    if (!detalle) return;
    try {
      const { error } = await supabase
        .from("entregas_pendientes")
        .update({ estatus: nuevo, tipo_entrega: tipoEntrega, gestionada })
        .eq("id", detalle.id)
        .eq("usuario_id", user.id);
      if (error) throw error;
      await fetchEntregas();
      setDetalle(null);
    } catch (e) {
      alert("Error al actualizar estatus: " + (e.message || e));
    }
  };

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

  // Actualizar fecha de entrega
  const handleActualizarFechaEntrega = async (nuevaFecha) => {
    if (!fechaEntregaModal.entrega) return;
    try {
      const { error } = await supabase
        .from("entregas_pendientes")
        .update({ fecha_entrega: nuevaFecha })
        .eq("id", fechaEntregaModal.entrega.id);
      if (error) throw error;
      await fetchEntregas();
    } catch (e) {
      alert("Error al actualizar la fecha de entrega: " + (e.message || e));
    }
    setFechaEntregaModal({ open: false, entrega: null });
  };

  // Actualizar campo editado
  const handleSaveEdit = async () => {
    if (!editField.field || !editField.entrega) return;
    try {
      const { error } = await supabase
        .from("entregas_pendientes")
        .update({ [editField.field]: editField.value })
        .eq("id", editField.entrega.id);
      if (error) throw error;
      await fetchEntregas();
      setEditField({ open: false, field: null, value: "", entrega: null });
    } catch (e) {
      alert("Error al actualizar: " + (e.message || e));
    }
  };

  // Guardar ubicación
  const handleSaveUbicacion = async (nuevaUbicacion) => {
    if (!editUbicacion.entrega) return;
    try {
      const { error } = await supabase
        .from("entregas_pendientes")
        .update({ ubicacion: nuevaUbicacion })
        .eq("id", editUbicacion.entrega.id);
      if (error) throw error;
      await fetchEntregas();
      setEditUbicacion({ open: false, entrega: null });
    } catch (e) {
      alert("Error al actualizar ubicación: " + (e.message || e));
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
                  onClick={() => setDetalle(entrega)}
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

      {detalle && (
        <ModalEstatus
          open={!!detalle}
          entrega={detalle}
          onClose={() => setDetalle(null)}
          onUpdateEstatus={handleUpdateEstatus}
          chofer={chofer}
          fetchEntregas={fetchEntregas}
          onEditField={(field, value) => setEditField({ open: true, field, value, entrega: detalle })}
          onEditUbicacion={() => setEditUbicacion({ open: true, entrega: detalle })}
          onUpdateTipo={() => setEntregaTipoModal({ open: true, entrega: detalle })}
          onUpdateGestionada={() => setGestionadaModal({ open: true, entrega: detalle })}
          onUpdateFecha={() => setFechaEntregaModal({ open: true, entrega: detalle })}
        />
      )}

      {entregaTipoModal.open && (
        <ActualizarTipoEntregaModal
          open={entregaTipoModal.open}
          entrega={entregaTipoModal.entrega}
          onClose={() => setEntregaTipoModal({ open: false, entrega: null })}
          onUpdate={fetchEntregas}
        />
      )}

      {gestionadaModal.open && (
        <ActualizarGestionadaModal
          open={gestionadaModal.open}
          entrega={gestionadaModal.entrega}
          onClose={() => setGestionadaModal({ open: false, entrega: null })}
          onUpdate={fetchEntregas}
        />
      )}

      {estatusModal.open && (
        <ActualizarEstatusModal
          open={estatusModal.open}
          entrega={estatusModal.entrega}
          onClose={() => setEstatusModal({ open: false, entrega: null })}
          onUpdate={fetchEntregas}
        />
      )}

      {fechaEntregaModal.open && (
        <ActualizarFechaEntregaModal
          open={fechaEntregaModal.open}
          entrega={fechaEntregaModal.entrega}
          onClose={() => setFechaEntregaModal({ open: false, entrega: null })}
          onSave={handleActualizarFechaEntrega}
        />
      )}

      {editField.open && (
        <EditFieldModal
          open={editField.open}
          label={editField.field}
          value={editField.value}
          onClose={() => setEditField({ open: false, field: null, value: "", entrega: null })}
          onSave={(newValue) => {
            setEditField(prev => ({ ...prev, value: newValue }));
            handleSaveEdit();
          }}
        />
      )}

      {editUbicacion.open && (
        <EditUbicacionModal
          open={editUbicacion.open}
          ubicacionActual={editUbicacion.entrega?.ubicacion}
          onClose={() => setEditUbicacion({ open: false, entrega: null })}
          onSave={handleSaveUbicacion}
        />
      )}
    </Container>
  );
};

export default EntregasNew;
