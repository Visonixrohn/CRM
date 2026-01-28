import React, { useState } from "react";
import { Container, Card, Grid, Flex, Box, Heading, Text, Input, Button, IconWrapper, Badge, Dialog, DialogOverlay, DialogContent, DialogTitle } from './designSystem';
import { FaSync, FaSearch, FaCheckCircle, FaTimesCircle, FaTrash } from "react-icons/fa";
import useActualizaciones from "./useActualizaciones";
import { createClient } from '@supabase/supabase-js';
import ModalExito from "./ModalExito";

// Cliente exclusivo para actualizacion_datos
const actualizacionesUrl = 'https://ydowdpcladycccauvmob.supabase.co';
const actualizacionesKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlkb3dkcGNsYWR5Y2NjYXV2bW9iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg2NTgxMTksImV4cCI6MjA3NDIzNDExOX0.W9FLueZVyuPXmEg7cx4qs4qWf8QspvdeO9Q9k97UALM';
const supabaseActualizaciones = createClient(actualizacionesUrl, actualizacionesKey);

function ModalError({ mensaje, onClose }) {
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogOverlay />
      <DialogContent>
        <DialogTitle>Error</DialogTitle>
        <Flex direction="column" gap="4" css={{ mt: '$4' }}>
          <Box css={{ 
            p: '$4', 
            background: '$red3', 
            border: '1px solid $red6',
            borderRadius: '$2'
          }}>
            <Text css={{ color: '$red11' }}>{mensaje}</Text>
          </Box>
          <Button variant="danger" onClick={onClose}>
            Cerrar
          </Button>
        </Flex>
      </DialogContent>
    </Dialog>
  );
}

const ActualizacionesNew = () => {
  const [detalle, setDetalle] = useState(null);
  const [filtro, setFiltro] = useState("todos");
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(false);
  const [exito, setExito] = useState(false);
  const [errorModal, setErrorModal] = useState("");
  const { datos: clientes, loading, error, refetch } = useActualizaciones();

  const handleRowClick = (cliente) => {
    setDetalle(cliente);
  };

  const closeDetalle = () => {
    setDetalle(null);
  };

  const clientesFiltrados = clientes.filter((cliente) => {
    const nombre = cliente["Nombre del Cliente"]?.toLowerCase() || cliente.nombre_cliente?.toLowerCase() || "";
    const numeroIdentidad = cliente["Número de Identidad"]?.toLowerCase() || cliente.numero_identidad?.toLowerCase() || "";
    const busquedaLower = busqueda.toLowerCase();
    if (filtro === "tomados" && cliente.STATUS !== "Tomado" && cliente.status !== "Tomado") return false;
    if (filtro === "sin-tomar" && (cliente.STATUS === "Tomado" || cliente.status === "Tomado")) return false;
    if (
      busqueda &&
      !(
        nombre.includes(busquedaLower) ||
        numeroIdentidad.includes(busquedaLower)
      )
    ) {
      return false;
    }
    return true;
  });

  const actualizarStatus = async (id, status) => {
    if (!id || !status) {
      setErrorModal("Faltan parámetros: id o status");
      return;
    }
    setCargando(true);
    try {
      const { error } = await supabaseActualizaciones
        .from('actualizacion_datos')
        .update({ status })
        .eq('id', id);
      if (!error) {
        setExito(true);
        if (typeof refetch === 'function') {
          setTimeout(() => {
            refetch();
          }, 500);
        }
      } else {
        setErrorModal('Error al actualizar el status: ' + error.message);
      }
      setDetalle(null);
    } catch (error) {
      console.error(error);
      setErrorModal("Error al actualizar el status");
    } finally {
      setCargando(false);
    }
  };

  const eliminarCliente = async (id) => {
    try {
      const { error } = await supabaseActualizaciones
        .from('actualizacion_datos')
        .delete()
        .eq('id', id);
      if (!error) {
        setDetalle(null);
        if (typeof refetch === 'function') refetch();
      } else {
        setErrorModal('Error al eliminar: ' + error.message);
      }
    } catch (err) {
      setErrorModal('Error al eliminar');
    }
  };

  if (loading) {
    return (
      <Container>
        <Flex align="center" justify="center" css={{ minHeight: '400px' }}>
          <Card variant="elevated">
            <Flex direction="column" align="center" gap="3" css={{ p: '$5' }}>
              <IconWrapper color="blue" size="large">
                <FaSync className="spin" size={40} />
              </IconWrapper>
              <Text size="4" weight="medium">Cargando actualizaciones...</Text>
            </Flex>
          </Card>
        </Flex>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Card variant="elevated" css={{ background: '$red3', border: '1px solid $red6' }}>
          <Flex direction="column" align="center" gap="3" css={{ p: '$5' }}>
            <IconWrapper color="red" size="large">
              <FaTimesCircle size={40} />
            </IconWrapper>
            <Heading size="5" css={{ color: '$red11' }}>Error</Heading>
            <Text css={{ color: '$red11' }}>{error}</Text>
          </Flex>
        </Card>
      </Container>
    );
  }

  const status = detalle?.STATUS || detalle?.status;

  return (
    <Container>
      <Flex direction="column" gap="6">
        {exito && (
          <ModalExito mensaje="Actualización exitosa" onClose={() => setExito(false)} />
        )}
        {errorModal && (
          <ModalError mensaje={errorModal} onClose={() => setErrorModal("")} />
        )}

        {/* Header */}
        <Flex align="center" justify="space-between" wrap="wrap" gap="3">
          <Flex align="center" gap="3">
            <IconWrapper color="blue">
              <FaSync size={28} />
            </IconWrapper>
            <Heading size="8">Actualizaciones</Heading>
          </Flex>
          <Button variant="primary" onClick={() => refetch && refetch()}>
            <FaSync />
            Recargar tabla
          </Button>
        </Flex>

        {/* Resumen de totales */}
        <Grid columns={{ '@initial': '1', '@tablet': '3' }} gap="4">
          <Card variant="elevated">
            <Flex direction="column" gap="2">
              <Text size="2" css={{ color: '$slate11' }}>Total</Text>
              <Heading size="7" css={{ color: '$blue11' }}>{clientes.length}</Heading>
            </Flex>
          </Card>
          <Card variant="elevated">
            <Flex direction="column" gap="2">
              <Text size="2" css={{ color: '$slate11' }}>Tomados</Text>
              <Heading size="7" css={{ color: '$green11' }}>
                {clientes.filter(c => c.STATUS === "Tomado" || c.status === "Tomado").length}
              </Heading>
            </Flex>
          </Card>
          <Card variant="elevated">
            <Flex direction="column" gap="2">
              <Text size="2" css={{ color: '$slate11' }}>Sin tomar</Text>
              <Heading size="7" css={{ color: '$amber11' }}>
                {clientes.filter(c => c.STATUS !== "Tomado" && c.status !== "Tomado").length}
              </Heading>
            </Flex>
          </Card>
        </Grid>

        {/* Filtros y búsqueda */}
        <Card>
          <Flex direction="column" gap="4">
            <Flex gap="2" wrap="wrap">
              <Button
                variant={filtro === "todos" ? "primary" : "ghost"}
                onClick={() => setFiltro("todos")}
              >
                Todos
              </Button>
              <Button
                variant={filtro === "tomados" ? "success" : "ghost"}
                onClick={() => setFiltro("tomados")}
              >
                Tomados
              </Button>
              <Button
                variant={filtro === "sin-tomar" ? "warning" : "ghost"}
                onClick={() => setFiltro("sin-tomar")}
              >
                Sin Tomar
              </Button>
            </Flex>

            <Box css={{ position: 'relative' }}>
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
                placeholder="Buscar por nombre o No. de Identidad"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                css={{ pl: '$10' }}
              />
            </Box>
          </Flex>
        </Card>

        {/* Tabla de actualizaciones */}
        <Card>
          <Box css={{ overflowX: 'auto' }}>
            <table style={{ 
              width: '100%', 
              borderCollapse: 'collapse',
              borderSpacing: 0
            }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--colors-slate6)' }}>
                  <th style={{ 
                    padding: '12px 16px', 
                    textAlign: 'left',
                    color: 'var(--colors-slate12)',
                    fontWeight: 600,
                    fontSize: '14px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>Nombre del Cliente</th>
                  <th style={{ 
                    padding: '12px 16px', 
                    textAlign: 'left',
                    color: 'var(--colors-slate12)',
                    fontWeight: 600,
                    fontSize: '14px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>Celular</th>
                  <th style={{ 
                    padding: '12px 16px', 
                    textAlign: 'center',
                    color: 'var(--colors-slate12)',
                    fontWeight: 600,
                    fontSize: '14px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {clientesFiltrados.map((cliente, index) => {
                  const clienteStatus = cliente.status || cliente.STATUS;
                  return (
                    <tr
                      key={index}
                      onClick={() => handleRowClick(cliente)}
                      style={{
                        borderBottom: '1px solid var(--colors-slate6)',
                        cursor: 'pointer',
                        transition: 'background 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'var(--colors-slate2)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ padding: '16px' }}>
                        <Text weight="medium">{cliente.nombre_cliente || cliente["Nombre del Cliente"]}</Text>
                      </td>
                      <td style={{ padding: '16px' }}>
                        <Text css={{ color: '$slate11' }}>{cliente.celular || cliente.Celular}</Text>
                      </td>
                      <td style={{ padding: '16px', textAlign: 'center' }}>
                        <Badge color={clienteStatus === "Tomado" ? "green" : "amber"}>
                          {clienteStatus === "Tomado" ? (
                            <><FaCheckCircle /> Tomado</>
                          ) : (
                            <><FaTimesCircle /> Sin tomar</>
                          )}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
                {clientesFiltrados.length === 0 && (
                  <tr>
                    <td colSpan={3} style={{ padding: '48px 16px', textAlign: 'center' }}>
                      <Text css={{ color: '$slate10' }}>
                        No se encontraron registros con los filtros aplicados.
                      </Text>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </Box>
        </Card>
      </Flex>

      {/* Modal de detalle */}
      {detalle && (
        <Dialog open={true} onOpenChange={closeDetalle}>
          <DialogOverlay />
          <DialogContent css={{ maxWidth: '500px' }}>
            <DialogTitle>Detalle del Cliente</DialogTitle>
            <Flex direction="column" gap="4" css={{ mt: '$4' }}>
              {/* Información del cliente */}
              <Flex direction="column" gap="3">
                {Object.entries(detalle)
                  .filter(([key]) => {
                    const k = key.toLowerCase();
                    return k !== 'usuario' && k !== 'id' && k !== 'usuario_id';
                  })
                  .map(([key, value]) => (
                    <Box 
                      key={key} 
                      css={{ 
                        background: '$slate2',
                        borderRadius: '$2',
                        p: '$3',
                        border: '1px solid $slate6'
                      }}
                    >
                      <Text size="1" weight="medium" css={{ color: '$blue11', textTransform: 'uppercase', letterSpacing: '0.5px', mb: '$1' }}>
                        {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </Text>
                      <Text size="3" css={{ color: '$slate12' }}>{value || 'N/A'}</Text>
                    </Box>
                  ))}
              </Flex>

              {/* Botones de acción */}
              <Flex direction="column" gap="2">
                {status !== "Tomado" && (
                  <Button
                    variant="primary"
                    onClick={() => actualizarStatus(detalle.id, "Tomado")}
                    disabled={cargando}
                  >
                    <FaCheckCircle />
                    Actualizar a Tomado
                  </Button>
                )}
                <Button
                  variant="danger"
                  onClick={() => eliminarCliente(detalle.id)}
                >
                  <FaTrash />
                  Eliminar cliente
                </Button>
              </Flex>
            </Flex>
          </DialogContent>
        </Dialog>
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </Container>
  );
};

export default ActualizacionesNew;
