import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "./supabaseClient";
import { createStitches } from '@stitches/react';
import * as Dialog from '@radix-ui/react-dialog';
import * as Progress from '@radix-ui/react-progress';
import { indigo, slate, green, red, amber, blue, violet } from '@radix-ui/colors';
import { FaEdit, FaChartLine, FaDollarSign, FaCalendar, FaUsers, FaBullseye, FaTruck, FaExclamationTriangle } from 'react-icons/fa';
import useClientesNuevosSupabase from "./useClientesNuevosSupabase";
import useGestionResumen from "./useGestionResumen";
import useClientesParaHoy from "./useClientesParaHoy";
import useActualizaciones from "./useActualizaciones";

const { styled } = createStitches({
  theme: {
    colors: {
      ...indigo,
      ...slate,
      ...green,
      ...red,
      ...amber,
      ...blue,
      ...violet,
    },
  },
});

const Container = styled('div', {
  padding: '24px',
  width: '100%',
  height: '100%',
  background: '$slate1',
  minHeight: 'calc(100vh - 64px)',
  boxSizing: 'border-box',
  overflowY: 'auto',
});

const Header = styled('div', {
  marginBottom: '32px',
});

const Title = styled('h1', {
  fontSize: '28px',
  fontWeight: 700,
  color: '$indigo11',
  marginBottom: '8px',
});

const Subtitle = styled('p', {
  fontSize: '16px',
  color: '$slate11',
});

const Grid = styled('div', {
  display: 'grid',
  gap: '20px',
  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
  marginBottom: '32px',
  width: '100%',
  maxWidth: '100%',
});

const Card = styled('div', {
  background: 'white',
  borderRadius: '12px',
  padding: '20px',
  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
  transition: 'all 0.2s',
  border: '1px solid $slate4',
  '&:hover': {
    boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
    transform: 'translateY(-2px)',
  },
});

const CardHeader = styled('div', {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '16px',
});

const CardTitle = styled('h3', {
  fontSize: '14px',
  fontWeight: 600,
  color: '$slate11',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
});

const CardValue = styled('div', {
  fontSize: '32px',
  fontWeight: 700,
  color: '$indigo11',
  marginBottom: '8px',
});

const CardSubtext = styled('div', {
  fontSize: '14px',
  color: '$slate10',
});

const IconWrapper = styled('div', {
  width: '40px',
  height: '40px',
  borderRadius: '10px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '20px',
  variants: {
    color: {
      primary: { background: '$indigo3', color: '$indigo9' },
      success: { background: '$green3', color: '$green9' },
      warning: { background: '$amber3', color: '$amber9' },
      danger: { background: '$red3', color: '$red9' },
      info: { background: '$blue3', color: '$blue9' },
    },
  },
  defaultVariants: {
    color: 'primary',
  },
});

const ActionBar = styled('div', {
  display: 'flex',
  gap: '12px',
  marginBottom: '32px',
  flexWrap: 'wrap',
});

const Button = styled('button', {
  padding: '10px 16px',
  borderRadius: '8px',
  border: 'none',
  fontWeight: 600,
  fontSize: '14px',
  cursor: 'pointer',
  transition: 'all 0.2s',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  variants: {
    variant: {
      primary: {
        background: '$indigo9',
        color: 'white',
        '&:hover': { background: '$indigo10' },
      },
      secondary: {
        background: '$slate3',
        color: '$slate11',
        '&:hover': { background: '$slate4' },
      },
      success: {
        background: '$green9',
        color: 'white',
        '&:hover': { background: '$green10' },
      },
      warning: {
        background: '$amber9',
        color: 'white',
        '&:hover': { background: '$amber10' },
      },
    },
  },
  defaultVariants: {
    variant: 'primary',
  },
});

const ProgressBar = styled(Progress.Root, {
  position: 'relative',
  overflow: 'hidden',
  background: '$slate4',
  borderRadius: '99999px',
  width: '100%',
  height: '12px',
  marginTop: '8px',
});

const ProgressIndicator = styled(Progress.Indicator, {
  background: '$indigo9',
  width: '100%',
  height: '100%',
  transition: 'transform 660ms cubic-bezier(0.65, 0, 0.35, 1)',
});

const StatsGrid = styled('div', {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
  gap: '16px',
  marginTop: '24px',
  width: '100%',
  maxWidth: '100%',
});

const StatCard = styled('div', {
  background: '$slate2',
  borderRadius: '10px',
  padding: '16px',
  border: '1px solid $slate4',
});

const StatLabel = styled('div', {
  fontSize: '12px',
  color: '$slate10',
  marginBottom: '4px',
  textTransform: 'uppercase',
  fontWeight: 600,
});

const StatValue = styled('div', {
  fontSize: '20px',
  fontWeight: 700,
  color: '$indigo11',
});

const DialogOverlay = styled(Dialog.Overlay, {
  background: 'rgba(0,0,0,0.5)',
  position: 'fixed',
  inset: 0,
  zIndex: 1000,
});

const DialogContent = styled(Dialog.Content, {
  background: 'white',
  borderRadius: '12px',
  padding: '24px',
  position: 'fixed',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '90vw',
  maxWidth: '450px',
  zIndex: 1001,
  boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
});

const DialogTitle = styled(Dialog.Title, {
  fontSize: '20px',
  fontWeight: 700,
  marginBottom: '16px',
  color: '$indigo11',
});

const Input = styled('input', {
  width: '100%',
  padding: '12px',
  borderRadius: '8px',
  border: '1px solid $slate6',
  fontSize: '16px',
  marginBottom: '16px',
  '&:focus': {
    outline: 'none',
    borderColor: '$indigo9',
  },
});

const ButtonGroup = styled('div', {
  display: 'flex',
  gap: '12px',
  justifyContent: 'flex-end',
});

function getDiasRestantesMes() {
  const hoy = new Date();
  const ultimoDia = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);
  return ultimoDia.getDate() - hoy.getDate();
}

const Comisiones = ({ setPage }) => {
  const navigate = useNavigate();
  const [update, setUpdate] = useState(0);
  const { total, gestionadosHoy } = useGestionResumen(update);
  const pendientes = total - gestionadosHoy;
  const { cantidad: clientesParaHoy } = useClientesParaHoy();

  const [entregasPendientesAtrasadas, setEntregasPendientesAtrasadas] = useState(0);
  const [entregasParaHoy, setEntregasParaHoy] = useState(0);
  const [entregasNoGestionadas, setEntregasNoGestionadas] = useState(0);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState('');
  const [inputValue, setInputValue] = useState('');

  const [meta, setMeta] = useState(0);
  const [comisionObtenida, setComisionObtenida] = useState(0);
  const [gastoMensual, setGastoMensual] = useState(0);
  const [loading, setLoading] = useState(true);
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    async function fetchEntregasPendientes() {
      let userId = localStorage.getItem("userId");
      if (!userId) return;
      try {
        const { data, error } = await supabase
          .from("entregas_pendientes")
          .select("id, fecha_entrega, estatus, gestionada")
          .eq("usuario_id", userId);
        if (error) return;
        
        const hoy = new Date();
        const yyyy = hoy.getFullYear();
        const mm = String(hoy.getMonth() + 1).padStart(2, '0');
        const dd = String(hoy.getDate()).padStart(2, '0');
        const hoyStr = `${yyyy}-${mm}-${dd}`;
        
        setEntregasPendientesAtrasadas(
          data.filter(e => {
            const estatus = String(e.estatus).toLowerCase();
            return (
              e.fecha_entrega < hoyStr &&
              (estatus === 'pendiente' || estatus === 'reprogramada')
            );
          }).length
        );
        setEntregasParaHoy(data.filter(e => e.fecha_entrega === hoyStr && String(e.estatus).toLowerCase() !== 'entregado').length);
        setEntregasNoGestionadas(data.filter(e => (e.gestionada || '').toLowerCase() === 'no gestionada' && String(e.estatus).toLowerCase() !== 'entregado').length);
      } catch (e) {}
    }
    fetchEntregasPendientes();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        let userId = localStorage.getItem("userId");
        if (!userId) return;
        
        setUsuario(userId);

        const { data: gastos, error: errorGastos } = await supabase
          .from("gastos_mensuales")
          .select("valor")
          .eq("usuario_id", userId);
        
        let totalGastos = 0;
        if (!errorGastos && Array.isArray(gastos)) {
          totalGastos = gastos.reduce((sum, g) => sum + Number(g.valor), 0);
        }
        setGastoMensual(totalGastos);

        const { data } = await supabase
          .from("comisiones")
          .select("meta, comision_obtenida")
          .eq("usuario", userId)
          .single();
        
        if (data) {
          setMeta(data.meta);
          setComisionObtenida(data.comision_obtenida);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const diasRestantes = getDiasRestantesMes();
  const diferenciaMeta = meta - comisionObtenida;
  const metaHoy = diasRestantes > 0 ? diferenciaMeta / diasRestantes : 0;
  const porcentajeAvance = meta > 0 ? (comisionObtenida / meta) * 100 : 0;

  const { clientes: clientesNuevos = [] } = useClientesNuevosSupabase();
  const { datos: actualizaciones = [] } = useActualizaciones();
  const clientesNuevosSinTomar = clientesNuevos.filter(c => c.STATUS !== "Tomado").length;
  const actualizacionesSinTomar = actualizaciones.filter(a => !a.status || a.status === "" || a.status === "Sin tomar").length;

  const openDialog = (type) => {
    setDialogType(type);
    setInputValue('');
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    const value = Number(inputValue);
    if (value < 0) return;

    try {
      if (dialogType === 'meta') {
        await supabase.from("comisiones").update({ meta: value }).eq("usuario", usuario);
        setMeta(value);
      } else if (dialogType === 'comision') {
        await supabase.from("comisiones").update({ comision_obtenida: value }).eq("usuario", usuario);
        setComisionObtenida(value);
      }
    } catch (err) {
      console.error(err);
    }
    setIsDialogOpen(false);
  };

  const getSaludo = () => {
    const hora = new Date().getHours();
    if (hora >= 5 && hora < 12) return "Buenos días";
    if (hora >= 12 && hora < 19) return "Buenas tardes";
    return "Buenas noches";
  };

  const nombre = localStorage.getItem("nombre") || usuario;

  if (loading) {
    return <Container><Title>Cargando datos...</Title></Container>;
  }

  return (
    <Container>
      <Header>
        <Title>{getSaludo()}{nombre ? `, ${nombre}` : ''}</Title>
        <Subtitle>Aquí está el resumen de tu rendimiento financiero</Subtitle>
      </Header>

      <ActionBar>
        <Button variant="primary" onClick={() => openDialog('meta')}>
          <FaEdit /> Actualizar Meta
        </Button>
        <Button variant="primary" onClick={() => openDialog('comision')}>
          <FaDollarSign /> Actualizar Comisión
        </Button>
        <Button variant="secondary" onClick={() => navigate('/mis-gastos')}>
          💳 Mis Gastos
        </Button>
        {clientesNuevosSinTomar > 0 && (
          <Button variant="success" onClick={() => navigate('/clientes-nuevos')}>
            <FaUsers /> Clientes nuevos: {clientesNuevosSinTomar}
          </Button>
        )}
        {actualizacionesSinTomar > 0 && (
          <Button variant="warning" onClick={() => navigate('/actualizaciones')}>
            <FaChartLine /> Actualizaciones: {actualizacionesSinTomar}
          </Button>
        )}
      </ActionBar>

      <Grid>
        <Card>
          <CardHeader>
            <CardTitle>Meta Mensual</CardTitle>
            <IconWrapper color="primary"><FaBullseye /></IconWrapper>
          </CardHeader>
          <CardValue>L{meta.toLocaleString('en-US', { minimumFractionDigits: 2 })}</CardValue>
          <ProgressBar value={porcentajeAvance}>
            <ProgressIndicator style={{ transform: `translateX(-${100 - porcentajeAvance}%)` }} />
          </ProgressBar>
          <CardSubtext>{porcentajeAvance.toFixed(1)}% completado</CardSubtext>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Comisión Obtenida</CardTitle>
            <IconWrapper color="success"><FaDollarSign /></IconWrapper>
          </CardHeader>
          <CardValue>L{comisionObtenida.toLocaleString('en-US', { minimumFractionDigits: 2 })}</CardValue>
          <CardSubtext>Meta diaria: L{metaHoy.toFixed(2)}</CardSubtext>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Diferencia a Meta</CardTitle>
            <IconWrapper color={diferenciaMeta > 0 ? 'warning' : 'success'}><FaChartLine /></IconWrapper>
          </CardHeader>
          <CardValue>L{diferenciaMeta.toLocaleString('en-US', { minimumFractionDigits: 2 })}</CardValue>
          <CardSubtext>Días restantes: {diasRestantes}</CardSubtext>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Gasto Mensual</CardTitle>
            <IconWrapper color="info"><FaDollarSign /></IconWrapper>
          </CardHeader>
          <CardValue>L{gastoMensual.toLocaleString('en-US', { minimumFractionDigits: 2 })}</CardValue>
          <CardSubtext>Total de gastos registrados</CardSubtext>
        </Card>
      </Grid>

      <StatsGrid>
        <StatCard>
          <StatLabel>Clientes Gestionados</StatLabel>
          <StatValue>{gestionadosHoy}</StatValue>
        </StatCard>
        <StatCard>
          <StatLabel>Clientes Pendientes</StatLabel>
          <StatValue>{pendientes}</StatValue>
        </StatCard>
        <StatCard>
          <StatLabel>Clientes para Hoy</StatLabel>
          <StatValue>{clientesParaHoy}</StatValue>
        </StatCard>
        {entregasPendientesAtrasadas > 0 && (
          <StatCard>
            <StatLabel>Entregas Atrasadas</StatLabel>
            <StatValue style={{ color: red.red9 }}>{entregasPendientesAtrasadas}</StatValue>
          </StatCard>
        )}
        {entregasParaHoy > 0 && (
          <StatCard>
            <StatLabel>Entregas para Hoy</StatLabel>
            <StatValue>{entregasParaHoy}</StatValue>
          </StatCard>
        )}
        {entregasNoGestionadas > 0 && (
          <StatCard>
            <StatLabel>Entregas No Gestionadas</StatLabel>
            <StatValue style={{ color: amber.amber9 }}>{entregasNoGestionadas}</StatValue>
          </StatCard>
        )}
      </StatsGrid>

      <Dialog.Root open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <Dialog.Portal>
          <DialogOverlay />
          <DialogContent>
            <DialogTitle>
              {dialogType === 'meta' ? 'Actualizar Meta' : 'Actualizar Comisión Obtenida'}
            </DialogTitle>
            <Input
              type="number"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ingrese el valor"
              step="0.01"
            />
            <ButtonGroup>
              <Button variant="secondary" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button variant="primary" onClick={handleSave}>
                Guardar
              </Button>
            </ButtonGroup>
          </DialogContent>
        </Dialog.Portal>
      </Dialog.Root>
    </Container>
  );
};

export default Comisiones;
