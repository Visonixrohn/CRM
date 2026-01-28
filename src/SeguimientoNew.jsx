import React, { useState, useMemo } from "react";
import { Container, Card, Grid, Flex, Box, Heading, Text, Input, Button, IconWrapper, Badge } from './designSystem';
import { FaClipboard, FaSearch, FaSync, FaWhatsapp, FaPlus, FaTimes } from "react-icons/fa";
import useSeguimiento from "./useSeguimiento";
import ModalEditarSeguimiento from "./ModalEditarSeguimiento";
import ModalAgregarSeguimiento from "./ModalAgregarSeguimiento";
import ModalAgregarSeguimientoMobile from "./ModalAgregarSeguimientoMobile";
import { supabase } from "./supabaseClient";

const ESTADOS = [
  { label: "Gestionado", color: "green" },
  { label: "Reprogramado", color: "amber" },
  { label: "Facturado", color: "blue" },
  { label: "Rechazado", color: "red" },
];

const SeguimientoNew = () => {
  const { datos, loading, error, refetch } = useSeguimiento();
  const [busqueda, setBusqueda] = useState("");
  const [filtro, setFiltro] = useState("");
  const [modal, setModal] = useState({ open: false, row: null });
  const [modalAgregar, setModalAgregar] = useState(false);
  const [loadingAgregar, setLoadingAgregar] = useState(false);
  const [copiadoId, setCopiadoId] = useState(null);
  const userId = localStorage.getItem("userId");

  const handleAgregar = async (form) => {
    setLoadingAgregar(true);
    const registro = { ...form, id_usuario: userId };
    await supabase.from("seguimiento").insert([registro]);
    setLoadingAgregar(false);
    setModalAgregar(false);
    await refetch();
  };

  const handleOpenModal = (row) => setModal({ open: true, row });
  const handleCloseModal = () => setModal({ open: false, row: null });
  const handleSaveModal = async (valores) => {
    if (!modal.row) return;
    await supabase
      .from("seguimiento")
      .update({ estado: valores.estado, fecha_de_acuerdo: valores.fecha_de_acuerdo })
      .eq("id", modal.row.id);
    await refetch();
  };

  const datosFiltrados = useMemo(() => {
    const hoy = new Date().toISOString().split('T')[0];
    const arr = (datos || [])
      .filter(row => {
        if (!userId || String(row.id_usuario) !== String(userId)) return false;
        const matchBusqueda =
          !busqueda ||
          (row.nombre_cliente && row.nombre_cliente.toLowerCase().includes(busqueda.toLowerCase())) ||
          (row.dni && row.dni.toLowerCase().includes(busqueda.toLowerCase())) ||
          (row.cel && row.cel.toLowerCase().includes(busqueda.toLowerCase())) ||
          (row.articulo && row.articulo.toLowerCase().includes(busqueda.toLowerCase()));
        const matchFiltro = !filtro || (row.estado && row.estado.toLowerCase() === filtro.toLowerCase());
        return matchBusqueda && matchFiltro;
      });
    return arr.sort((a, b) => {
      const fa = (a.fecha_de_acuerdo || '').slice(0, 10);
      const fb = (b.fecha_de_acuerdo || '').slice(0, 10);
      if (fa === hoy && fb !== hoy) return -1;
      if (fa !== hoy && fb === hoy) return 1;
      return (fb || '').localeCompare(fa || '');
    });
  }, [datos, busqueda, filtro, userId]);

  const copiarDNI = (dni, id, e) => {
    e.stopPropagation();
    if (navigator && navigator.clipboard) {
      navigator.clipboard.writeText(dni);
      setCopiadoId(id);
      setTimeout(() => setCopiadoId(null), 1200);
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
              <Text size="4" weight="medium">Cargando seguimientos...</Text>
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
              <FaTimes size={40} />
            </IconWrapper>
            <Heading size="5" css={{ color: '$red11' }}>Error</Heading>
            <Text css={{ color: '$red11' }}>{error}</Text>
          </Flex>
        </Card>
      </Container>
    );
  }

  return (
    <Container css={{ position: 'relative' }}>
      <Flex direction="column" gap="6">
        {/* Header */}
        <Flex align="center" justify="space-between" wrap="wrap" gap="3">
          <Flex align="center" gap="3">
            <IconWrapper color="blue">
              <FaClipboard size={28} />
            </IconWrapper>
            <Heading size="8">Seguimiento</Heading>
          </Flex>
        </Flex>

        {/* Filtros y búsqueda */}
        <Card>
          <Flex direction="column" gap="4">
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
                placeholder="Buscar cliente, DNI, cel, artículo..."
                value={busqueda}
                onChange={e => setBusqueda(e.target.value)}
                css={{ pl: '$10' }}
              />
            </Box>

            <Flex gap="2" wrap="wrap">
              {ESTADOS.map(e => (
                <Button
                  key={e.label}
                  variant={filtro === e.label ? e.color : "ghost"}
                  onClick={() => setFiltro(filtro === e.label ? "" : e.label)}
                >
                  {e.label}
                </Button>
              ))}
              <Button
                variant="ghost"
                onClick={() => { setFiltro(""); setBusqueda(""); refetch(); }}
              >
                Limpiar
              </Button>
            </Flex>
          </Flex>
        </Card>

        {/* Tabla de seguimientos */}
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
                  }}>Cliente</th>
                  <th style={{ 
                    padding: '12px 16px', 
                    textAlign: 'left',
                    color: 'var(--colors-slate12)',
                    fontWeight: 600,
                    fontSize: '14px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>DNI</th>
                  <th style={{ 
                    padding: '12px 16px', 
                    textAlign: 'left',
                    color: 'var(--colors-slate12)',
                    fontWeight: 600,
                    fontSize: '14px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>Cel</th>
                  <th style={{ 
                    padding: '12px 16px', 
                    textAlign: 'left',
                    color: 'var(--colors-slate12)',
                    fontWeight: 600,
                    fontSize: '14px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>Artículo</th>
                  <th style={{ 
                    padding: '12px 16px', 
                    textAlign: 'left',
                    color: 'var(--colors-slate12)',
                    fontWeight: 600,
                    fontSize: '14px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>Tipo</th>
                  <th style={{ 
                    padding: '12px 16px', 
                    textAlign: 'left',
                    color: 'var(--colors-slate12)',
                    fontWeight: 600,
                    fontSize: '14px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>Fecha de acuerdo</th>
                  <th style={{ 
                    padding: '12px 16px', 
                    textAlign: 'center',
                    color: 'var(--colors-slate12)',
                    fontWeight: 600,
                    fontSize: '14px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>Estado</th>
                </tr>
              </thead>
              <tbody>
                {datosFiltrados && datosFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ padding: '48px 16px', textAlign: 'center' }}>
                      <Text css={{ color: '$slate10' }}>Sin resultados</Text>
                    </td>
                  </tr>
                ) : (
                  datosFiltrados && datosFiltrados.map(row => (
                    <tr
                      key={row.id}
                      onClick={() => handleOpenModal(row)}
                      style={{
                        borderBottom: '1px solid var(--colors-slate6)',
                        cursor: 'pointer',
                        transition: 'background 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'var(--colors-slate2)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ padding: '16px' }}>
                        <Text weight="medium">{row.nombre_cliente}</Text>
                      </td>
                      <td style={{ padding: '16px' }}>
                        <Flex align="center" gap="2">
                          <Text css={{ color: '$slate11' }}>{row.dni}</Text>
                          <Button
                            size="small"
                            variant="ghost"
                            onClick={(e) => copiarDNI(row.dni, row.id, e)}
                            css={{ p: '$1', minWidth: 'auto' }}
                          >
                            <FaClipboard size={14} />
                          </Button>
                          {copiadoId === row.id && (
                            <Text size="1" css={{ color: '$green11' }}>¡Copiado!</Text>
                          )}
                        </Flex>
                      </td>
                      <td style={{ padding: '16px' }}>
                        <Flex align="center" gap="2">
                          <Text css={{ color: '$slate11' }}>{row.cel}</Text>
                          {row.cel && (
                            <a
                              href={`https://web.whatsapp.com/send?phone=504${row.cel.replace(/[^\d]/g, "")}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={e => e.stopPropagation()}
                              style={{ color: '#25D366', textDecoration: 'none' }}
                            >
                              <FaWhatsapp size={18} />
                            </a>
                          )}
                        </Flex>
                      </td>
                      <td style={{ padding: '16px' }}>
                        <Text css={{ color: '$slate11' }}>{row.articulo}</Text>
                      </td>
                      <td style={{ padding: '16px' }}>
                        <Text css={{ color: '$slate11' }}>{row.tipo}</Text>
                      </td>
                      <td style={{ padding: '16px' }}>
                        <Text css={{ color: '$slate11' }}>{row.fecha_de_acuerdo}</Text>
                      </td>
                      <td style={{ padding: '16px', textAlign: 'center' }}>
                        <Badge color={ESTADOS.find(e => e.label === row.estado)?.color || "slate"}>
                          {row.estado}
                        </Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </Box>
        </Card>
      </Flex>

      {/* Botón flotante para agregar (desktop) */}
      <Box 
        className="seguimiento-agregar-desktop"
        css={{ 
          '@media (max-width: 768px)': { 
            display: 'none' 
          }
        }}
      >
        <Button
          variant="primary"
          onClick={() => setModalAgregar(true)}
          css={{
            position: 'fixed',
            bottom: 32,
            right: 32,
            borderRadius: '50%',
            width: 56,
            height: 56,
            fontSize: 32,
            boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
            zIndex: 1000,
            minWidth: 'auto',
            p: 0
          }}
        >
          <FaPlus />
        </Button>
        <ModalAgregarSeguimiento
          open={modalAgregar}
          onClose={() => setModalAgregar(false)}
          onSave={handleAgregar}
          loading={loadingAgregar}
        />
      </Box>

      {/* Botón flotante para agregar (móvil) */}
      <Box 
        className="seguimiento-agregar-mobile"
        css={{ 
          '@media (min-width: 769px)': { 
            display: 'none' 
          }
        }}
      >
        <Button
          variant="primary"
          onClick={() => setModalAgregar(true)}
          css={{
            position: 'fixed',
            bottom: 120,
            right: 20,
            borderRadius: '50%',
            width: 56,
            height: 56,
            fontSize: 32,
            boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
            zIndex: 1000,
            minWidth: 'auto',
            p: 0
          }}
        >
          <FaPlus />
        </Button>
        <ModalAgregarSeguimientoMobile
          open={modalAgregar}
          onClose={() => setModalAgregar(false)}
          onSave={handleAgregar}
          loading={loadingAgregar}
        />
      </Box>

      <ModalEditarSeguimiento
        open={modal.open}
        row={modal.row}
        onClose={handleCloseModal}
        onSave={handleSaveModal}
      />

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

export default SeguimientoNew;
