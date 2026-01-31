import React, { useState, useEffect } from "react";
import { Container, Card, Grid, Flex, Box, Heading, Text, Input, Label, Button, IconWrapper } from './designSystem';
import { FaChartBar, FaCalculator, FaCoins, FaPlus, FaTrashAlt } from "react-icons/fa";

const PromediosNew = () => {
  const [meses, setMeses] = useState(() => Number(localStorage.getItem("promedios-meses")) || 1);
  const [porcentaje, setPorcentaje] = useState(() => Number(localStorage.getItem("promedios-porcentaje")) || 0);
  const [ingresos, setIngresos] = useState(() => {
    try {
      const val = localStorage.getItem("promedios-ingresos");
      return val ? JSON.parse(val) : [];
    } catch { return []; }
  });
  const [nuevoIngreso, setNuevoIngreso] = useState("");
  const [cuotaUtilizada, setCuotaUtilizada] = useState(() => localStorage.getItem("promedios-cuotaUtilizada") || "");

  // Calcular promedio: suma total de ingresos entre los meses
  const sumaIngresos = ingresos.reduce((acc, val) => acc + parseFloat(val || 0), 0);
  const promedio = meses > 0 ? sumaIngresos / meses : 0;
  const cuotaCalculada = promedio * (porcentaje / 100);
  const cuotaUtilizadaNum = parseFloat(cuotaUtilizada) || 0;
  const cuotaRestante = Math.max((promedio * (porcentaje / 100)) - (parseFloat(cuotaUtilizada) || 0), 0);

  // Guardar en localStorage cada vez que cambian los datos
  useEffect(() => {
    localStorage.setItem("promedios-meses", meses);
  }, [meses]);

  useEffect(() => {
    localStorage.setItem("promedios-porcentaje", porcentaje);
  }, [porcentaje]);

  useEffect(() => {
    localStorage.setItem("promedios-ingresos", JSON.stringify(ingresos));
  }, [ingresos]);

  useEffect(() => {
    localStorage.setItem("promedios-cuotaUtilizada", cuotaUtilizada);
  }, [cuotaUtilizada]);

  // Formateador de miles con comas
  const formatNumber = (num) => {
    return num.toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  // Handler para agregar ingreso
  const agregarIngreso = () => {
    if (nuevoIngreso !== "" && !isNaN(nuevoIngreso)) {
      setIngresos([...ingresos, parseFloat(nuevoIngreso)]);
      setNuevoIngreso("");
    }
  };

  // Handler para editar ingreso
  const editarIngreso = (idx, valor) => {
    const nuevos = [...ingresos];
    nuevos[idx] = parseFloat(valor) || 0;
    setIngresos(nuevos);
  };

  // Handler para eliminar ingreso
  const eliminarIngreso = (idx) => {
    setIngresos(ingresos.filter((_, i) => i !== idx));
  };

  const limpiarTodo = () => {
    setIngresos([]);
    setMeses(1);
    setPorcentaje(0);
    setNuevoIngreso("");
    setCuotaUtilizada("");
    localStorage.removeItem("promedios-meses");
    localStorage.removeItem("promedios-porcentaje");
    localStorage.removeItem("promedios-ingresos");
    localStorage.removeItem("promedios-cuotaUtilizada");
  };

  return (
    <Container>
      <Flex direction="column" gap="6">
        {/* Título */}
        <Flex align="center" justify="center" gap="3">
          <IconWrapper color="blue">
            <FaChartBar size={28} />
          </IconWrapper>
          <Heading size="8">Promedios</Heading>
        </Flex>

        {/* Cards de métricas - 3 en una fila */}
        <Grid columns="3" gap="4" css={{ 
          '@initial': { gridTemplateColumns: '1fr' },
          '@mobile': { gridTemplateColumns: 'repeat(3, 1fr)' }
        }}>
          <Card variant="elevated" css={{ 
            background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
            p: '$5',
            borderLeft: '4px solid $blue9',
            transition: 'all 0.3s',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: '0 12px 24px rgba(59, 130, 246, 0.2)'
            }
          }}>
            <Flex direction="column" align="center" gap="3">
              <Box css={{
                width: '64px',
                height: '64px',
                borderRadius: '$round',
                background: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.15)'
              }}>
                <FaCalculator size={28} color="#3b82f6" />
              </Box>
              <Flex direction="column" align="center" gap="1">
                <Text size="2" weight="bold" css={{ color: '$blue11', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  Promedio
                </Text>
                <Heading size="7" css={{ color: '$blue12', fontWeight: '900' }}>
                  L {formatNumber(promedio)}
                </Heading>
              </Flex>
            </Flex>
          </Card>

          <Card variant="elevated" css={{ 
            background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
            p: '$5',
            borderLeft: '4px solid $amber9',
            transition: 'all 0.3s',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: '0 12px 24px rgba(245, 158, 11, 0.2)'
            }
          }}>
            <Flex direction="column" align="center" gap="3">
              <Box css={{
                width: '64px',
                height: '64px',
                borderRadius: '$round',
                background: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(245, 158, 11, 0.15)'
              }}>
                <FaCoins size={28} color="#f59e0b" />
              </Box>
              <Flex direction="column" align="center" gap="1">
                <Text size="2" weight="bold" css={{ color: '$amber11', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  Cuota calculada
                </Text>
                <Heading size="7" css={{ color: '$amber12', fontWeight: '900' }}>
                  L {formatNumber(cuotaCalculada)}
                </Heading>
              </Flex>
            </Flex>
          </Card>

          <Card variant="elevated" css={{ 
            background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
            p: '$5',
            borderLeft: '4px solid $green9',
            transition: 'all 0.3s',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: '0 12px 24px rgba(34, 197, 94, 0.2)'
            }
          }}>
            <Flex direction="column" align="center" gap="3">
              <Box css={{
                width: '64px',
                height: '64px',
                borderRadius: '$round',
                background: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(34, 197, 94, 0.15)'
              }}>
                <FaCoins size={28} color="#22c55e" />
              </Box>
              <Flex direction="column" align="center" gap="1">
                <Text size="2" weight="bold" css={{ color: '$green11', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  Cuota restante
                </Text>
                <Heading size="7" css={{ color: '$green12', fontWeight: '900' }}>
                  L {formatNumber(cuotaRestante)}
                </Heading>
              </Flex>
            </Flex>
          </Card>
        </Grid>

        {/* Formularios de entrada */}
        <Grid columns={{ '@initial': '1', '@tablet': '2' }} gap="4">
          <Card>
            <Flex direction="column" gap="4">
              <Box>
                <Label>Meses</Label>
                <Input
                  type="number"
                  min={1}
                  value={meses}
                  onChange={e => setMeses(Number(e.target.value))}
                />
              </Box>

              <Box>
                <Label>Porcentaje</Label>
                <Box css={{ position: 'relative' }}>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={porcentaje}
                    onChange={e => setPorcentaje(Number(e.target.value))}
                  />
                  <Text 
                    size="3" 
                    weight="medium" 
                    css={{ 
                      position: 'absolute', 
                      right: '$3', 
                      top: '50%', 
                      transform: 'translateY(-50%)',
                      color: '$slate11',
                      pointerEvents: 'none'
                    }}
                  >
                    %
                  </Text>
                </Box>
              </Box>

              <Box>
                <Label htmlFor="cuota-utilizada">Cuota utilizada</Label>
                <Input
                  id="cuota-utilizada"
                  type="number"
                  value={cuotaUtilizada}
                  onChange={e => setCuotaUtilizada(e.target.value)}
                  placeholder="Ingrese la cuota"
                />
              </Box>
            </Flex>
          </Card>

          <Card>
            <Flex direction="column" gap="4">
              <Box>
                <Label>Nuevo ingreso</Label>
                <Flex gap="2">
                  <Input
                    type="number"
                    placeholder="Nuevo ingreso"
                    value={nuevoIngreso}
                    onChange={e => setNuevoIngreso(e.target.value)}
                    css={{ flex: 1 }}
                    onKeyPress={e => {
                      if (e.key === 'Enter') agregarIngreso();
                    }}
                  />
                  <Button onClick={agregarIngreso} variant="primary">
                    <FaPlus />
                    Agregar
                  </Button>
                </Flex>
              </Box>

              <Button
                onClick={limpiarTodo}
                variant="danger"
                css={{ marginTop: 'auto' }}
              >
                <FaTrashAlt />
                Limpiar todo
              </Button>
            </Flex>
          </Card>
        </Grid>

        {/* Tabla de ingresos */}
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
                    textAlign: 'center',
                    color: 'var(--colors-slate12)',
                    fontWeight: 600,
                    fontSize: '14px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>#</th>
                  <th style={{ 
                    padding: '12px 16px', 
                    textAlign: 'left',
                    color: 'var(--colors-slate12)',
                    fontWeight: 600,
                    fontSize: '14px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>Ingreso</th>
                  <th style={{ 
                    padding: '12px 16px', 
                    textAlign: 'center',
                    color: 'var(--colors-slate12)',
                    fontWeight: 600,
                    fontSize: '14px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {ingresos.map((valor, idx) => (
                  <tr key={idx} style={{ 
                    borderBottom: '1px solid var(--colors-slate6)',
                    transition: 'background 0.2s'
                  }}>
                    <td style={{ 
                      padding: '16px', 
                      textAlign: 'center',
                      fontWeight: 600,
                      color: 'var(--colors-blue11)'
                    }}>
                      {idx + 1}
                    </td>
                    <td style={{ padding: '16px' }}>
                      <Flex gap="3" align="center">
                        <Input
                          type="number"
                          value={valor}
                          onChange={e => editarIngreso(idx, e.target.value)}
                          css={{ width: 140 }}
                        />
                        <Text weight="medium" css={{ color: '$blue11', fontSize: '16px' }}>
                          {formatNumber(valor)}
                        </Text>
                      </Flex>
                    </td>
                    <td style={{ padding: '16px', textAlign: 'center' }}>
                      <Button 
                        onClick={() => eliminarIngreso(idx)} 
                        variant="danger"
                        size="small"
                      >
                        <FaTrashAlt />
                        Eliminar
                      </Button>
                    </td>
                  </tr>
                ))}
                {ingresos.length === 0 && (
                  <tr>
                    <td colSpan={3} style={{ padding: '48px 16px', textAlign: 'center' }}>
                      <Text css={{ color: '$slate10', fontSize: '15px' }}>
                        No hay ingresos agregados. Agrega uno para comenzar.
                      </Text>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </Box>
        </Card>
      </Flex>
    </Container>
  );
};

export default PromediosNew;
