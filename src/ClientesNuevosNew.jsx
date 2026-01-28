import React, { useState } from "react";
import { eliminarSolicitudSupabase } from "./supabaseDeleteSolicitud";
import { Container, Card, Grid, Flex, Box, Heading, Text, Input, Button, IconWrapper, Badge } from './designSystem';
import { FaUsers, FaSearch, FaSync, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import useClientesNuevosSupabase from "./useClientesNuevosSupabase";
import ModalExito from "./ModalExito";
import SolicitudModal from "./SolicitudModal";

const ClientesNuevosNew = () => {
  const [detalle, setDetalle] = useState(null);
  const [filtro, setFiltro] = useState("todos");
  const [busqueda, setBusqueda] = useState("");
  const [exito, setExito] = useState(false);
  const { clientes, loading, error, refetch } = useClientesNuevosSupabase();

  const handleRecargarTabla = () => {
    if (typeof refetch === 'function') {
      refetch();
    }
  };

  const handleRowClick = (cliente) => {
    setDetalle(cliente);
  };

  const closeDetalle = () => {
    setDetalle(null);
  };

  const handleActualizarStatus = async (nuevoStatus) => {
    if (detalle) {
      try {
        const idSupabase = detalle.id;
        if (!idSupabase) {
          alert("Error: ID único inválido para actualizar STATUS.");
          return;
        }
        const { actualizarStatusSupabase } = await import("./supabaseUpdateSolicitud.js");
        await actualizarStatusSupabase(idSupabase, nuevoStatus);
        setExito(true);
        if (typeof refetch === 'function') {
          setTimeout(() => {
            refetch();
          }, 500);
        }
        closeDetalle();
      } catch (err) {
        alert("Error al actualizar STATUS: " + err.message);
      }
    }
  };

  const handleEliminarSolicitud = async () => {
    if (detalle) {
      try {
        const idSupabase = detalle.id;
        if (!idSupabase) {
          alert("Error: ID único inválido para eliminar.");
          return;
        }
        await eliminarSolicitudSupabase(idSupabase);
        setExito(true);
        if (typeof refetch === 'function') {
          setTimeout(() => {
            refetch();
          }, 500);
        }
        closeDetalle();
      } catch (err) {
        alert("Error al eliminar: " + err.message);
      }
    }
  };

  const clientesFiltrados = clientes.filter((cliente) => {
    if (filtro === "tomados" && cliente.STATUS !== "Tomado") return false;
    if (filtro === "sin-tomar" && cliente.STATUS === "Tomado") return false;
    if (
      busqueda &&
      !(
        cliente.Nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
        cliente["No. de Identidad"]
          ?.toLowerCase()
          .includes(busqueda.toLowerCase())
      )
    )
      return false;
    return true;
  });

  if (loading) {
    return (
      <Container>
        <Flex align="center" justify="center" css={{ minHeight: '400px' }}>
          <Card variant="elevated">
            <Flex direction="column" align="center" gap="3" css={{ p: '$5' }}>
              <IconWrapper color="blue" size="large">
                <FaSync className="spin" size={40} />
              </IconWrapper>
              <Text size="4" weight="medium">Cargando clientes...</Text>
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

  return (
    <Container>
      <Flex direction="column" gap="6">
        {exito && (
          <ModalExito mensaje="Actualización exitosa" onClose={() => setExito(false)} />
        )}

        {/* Header */}
        <Flex align="center" justify="space-between" wrap="wrap" gap="3">
          <Flex align="center" gap="3">
            <IconWrapper color="blue">
              <FaUsers size={28} />
            </IconWrapper>
            <Heading size="8">Clientes Nuevos</Heading>
          </Flex>
          <Button variant="primary" onClick={handleRecargarTabla}>
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
                {clientes.filter(c => c.STATUS === "Tomado").length}
              </Heading>
            </Flex>
          </Card>
          <Card variant="elevated">
            <Flex direction="column" gap="2">
              <Text size="2" css={{ color: '$slate11' }}>Sin tomar</Text>
              <Heading size="7" css={{ color: '$amber11' }}>
                {clientes.filter(c => c.STATUS !== "Tomado").length}
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

        {/* Tabla de clientes */}
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
                  }}>Nombre</th>
                  <th style={{ 
                    padding: '12px 16px', 
                    textAlign: 'left',
                    color: 'var(--colors-slate12)',
                    fontWeight: 600,
                    fontSize: '14px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>No. de Identidad</th>
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
                    textAlign: 'left',
                    color: 'var(--colors-slate12)',
                    fontWeight: 600,
                    fontSize: '14px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>Fecha creada</th>
                  <th style={{ 
                    padding: '12px 16px', 
                    textAlign: 'center',
                    color: 'var(--colors-slate12)',
                    fontWeight: 600,
                    fontSize: '14px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>Estatus</th>
                </tr>
              </thead>
              <tbody>
                {clientesFiltrados.map((cliente, index) => (
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
                      <Text weight="medium">{cliente.Nombre}</Text>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <Text css={{ color: '$slate11' }}>{cliente["No. de Identidad"]}</Text>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <Text css={{ color: '$slate11' }}>{cliente.Celular}</Text>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <Text css={{ color: '$slate11' }}>
                        {cliente.created_at ? new Date(cliente.created_at).toLocaleDateString() : ''}
                      </Text>
                    </td>
                    <td style={{ padding: '16px', textAlign: 'center' }}>
                      <Badge color={cliente.STATUS === "Tomado" ? "green" : "amber"}>
                        {cliente.STATUS === "Tomado" ? (
                          <><FaCheckCircle /> Tomado</>
                        ) : (
                          <><FaTimesCircle /> Sin tomar</>
                        )}
                      </Badge>
                    </td>
                  </tr>
                ))}
                {clientesFiltrados.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ padding: '48px 16px', textAlign: 'center' }}>
                      <Text css={{ color: '$slate10' }}>
                        No se encontraron clientes con los filtros aplicados.
                      </Text>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </Box>
        </Card>
      </Flex>

      {detalle && (
        <SolicitudModal
          detalle={detalle}
          onClose={closeDetalle}
          onActualizarStatus={handleActualizarStatus}
          onEliminarSolicitud={handleEliminarSolicitud}
        />
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

export default ClientesNuevosNew;
