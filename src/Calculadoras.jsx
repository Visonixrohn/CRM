import React, { useState } from "react";
import * as Tabs from '@radix-ui/react-tabs';
import { Container, Card, Grid, Flex, Heading, Text, Input, Label, Button, IconWrapper, Box } from './designSystem';
import { FaCalculator, FaPercentage, FaMoneyBillWave, FaShieldAlt } from 'react-icons/fa';

const Calculadoras = () => {
  const [activeCalculator, setActiveCalculator] = useState("descuento");
  const [inputs, setInputs] = useState({
    precioNormal: "",
    precioConDescuento: "",
    totalACobrar: "",
    precioDeseado: "",
    precioNuestro: "",
    precioCompetencia: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setInputs({ ...inputs, [name]: value });
  };

  return (
    <Container>
      <Flex direction="column" gap={4} css={{ marginBottom: '$6' }}>
        <Flex align="center" gap={3}>
          <IconWrapper color="primary" size="lg"><FaCalculator /></IconWrapper>
          <Heading size={2}>Calculadoras Financieras</Heading>
        </Flex>
        <Text color="subtle">Herramientas para calcular descuentos, extrafinanciamientos y garantías de precio</Text>
      </Flex>

      <Tabs.Root value={activeCalculator} onValueChange={setActiveCalculator}>
        <Tabs.List style={{ display: 'flex', gap: '8px', marginBottom: '24px', borderBottom: '1px solid #e5e7eb', paddingBottom: '8px' }}>
          <Tabs.Trigger value="descuento" style={{ padding: '10px 16px', border: 'none', background: activeCalculator === 'descuento' ? '#6366f1' : 'transparent', color: activeCalculator === 'descuento' ? 'white' : '#374151', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
            <FaPercentage style={{ marginRight: '8px' }} />Descuento
          </Tabs.Trigger>
          <Tabs.Trigger value="extrafinanciamiento" style={{ padding: '10px 16px', border: 'none', background: activeCalculator === 'extrafinanciamiento' ? '#6366f1' : 'transparent', color: activeCalculator === 'extrafinanciamiento' ? 'white' : '#374151', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
            <FaMoneyBillWave style={{ marginRight: '8px' }} />Extrafinanciamiento
          </Tabs.Trigger>
          <Tabs.Trigger value="garantia" style={{ padding: '10px 16px', border: 'none', background: activeCalculator === 'garantia' ? '#6366f1' : 'transparent', color: activeCalculator === 'garantia' ? 'white' : '#374151', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
            <FaShieldAlt style={{ marginRight: '8px' }} />Garantía de Precio
          </Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content value="descuento">
          <Grid columns={2} gap={4}>
            <Card>
              <Flex direction="column" gap={3}>
                <Text size={4} weight="bold">Inputs</Text>
                <Box>
                  <Label>Precio Normal (L)</Label>
                  <Input type="number" name="precioNormal" value={inputs.precioNormal} onChange={handleInputChange} placeholder="0.00" />
                </Box>
                <Box>
                  <Label>Precio Deseado (L)</Label>
                  <Input type="number" name="precioDeseado" value={inputs.precioDeseado} onChange={handleInputChange} placeholder="0.00" />
                </Box>
              </Flex>
            </Card>
            <Card css={{ background: '$primaryLight', border: '2px solid $primary' }}>
              <Flex direction="column" gap={3}>
                <Text size={4} weight="bold" color="primary">Resultado</Text>
                <Flex direction="column" gap={2}>
                  <Text color="subtle">Porcentaje a Solicitar</Text>
                  <Text size={8} weight="bold" color="primary">
                    {(((parseFloat(inputs.precioNormal) - parseFloat(inputs.precioDeseado)) / parseFloat(inputs.precioNormal)) * 100 || 0).toFixed(2)}%
                  </Text>
                </Flex>
              </Flex>
            </Card>
          </Grid>
        </Tabs.Content>

        <Tabs.Content value="extrafinanciamiento">
          <Grid columns={2} gap={4}>
            <Card>
              <Flex direction="column" gap={3}>
                <Text size={4} weight="bold">Inputs</Text>
                <Box>
                  <Label>Precio Normal (L)</Label>
                  <Input type="number" name="precioNormal" value={inputs.precioNormal} onChange={handleInputChange} placeholder="0.00" />
                </Box>
                <Box>
                  <Label>Precio con Descuento (L)</Label>
                  <Input type="number" name="precioConDescuento" value={inputs.precioConDescuento} onChange={handleInputChange} placeholder="0.00" />
                </Box>
              </Flex>
            </Card>
            <Card css={{ background: '$successLight', border: '2px solid $success' }}>
              <Flex direction="column" gap={3}>
                <Text size={4} weight="bold" color="success">Resultados</Text>
                {(() => {
                  const precioConDescuento = parseFloat(inputs.precioConDescuento) || 0;
                  const precioNormal = parseFloat(inputs.precioNormal) || 0;
                  const porcentaje = precioConDescuento / 0.9 >= precioNormal ? precioNormal : precioConDescuento / 0.9;
                  const totalACobrar = porcentaje;
                  const comisionExtra = precioNormal - totalACobrar;
                  const porcentajeSolicitar = comisionExtra / precioNormal <= 0 ? 0 : comisionExtra / precioNormal;
                  return (
                    <>
                      <Flex justify="between"><Text>Total a Cobrar:</Text><Text weight="bold">L{totalACobrar.toFixed(2)}</Text></Flex>
                      <Flex justify="between"><Text>Comisión Extra:</Text><Text weight="bold">L{comisionExtra.toFixed(2)}</Text></Flex>
                      <Flex justify="between"><Text>% a Solicitar:</Text><Text weight="bold" size={5} color="success">{(porcentajeSolicitar * 100).toFixed(2)}%</Text></Flex>
                    </>
                  );
                })()}
              </Flex>
            </Card>
          </Grid>
        </Tabs.Content>

        <Tabs.Content value="garantia">
          <Grid columns={2} gap={4}>
            <Card>
              <Flex direction="column" gap={3}>
                <Text size={4} weight="bold">Inputs</Text>
                <Box>
                  <Label>Precio Normal (L)</Label>
                  <Input type="number" name="precioNormal" value={inputs.precioNormal} onChange={handleInputChange} placeholder="0.00" />
                </Box>
                <Box>
                  <Label>Precio Nuestro (L)</Label>
                  <Input type="number" name="precioNuestro" value={inputs.precioNuestro} onChange={handleInputChange} placeholder="0.00" />
                </Box>
                <Box>
                  <Label>Precio de Competencia (L)</Label>
                  <Input type="number" name="precioCompetencia" value={inputs.precioCompetencia} onChange={handleInputChange} placeholder="0.00" />
                </Box>
              </Flex>
            </Card>
            <Card css={{ background: '$infoLight', border: '2px solid $info' }}>
              <Flex direction="column" gap={3}>
                <Text size={4} weight="bold" color="info">Resultados</Text>
                {(() => {
                  const precioNormal = parseFloat(inputs.precioNormal) || 0;
                  const precioNuestro = parseFloat(inputs.precioNuestro) || 0;
                  const precioCompetencia = parseFloat(inputs.precioCompetencia) || 0;
                  const totalOfrecer = precioCompetencia - (precioNuestro - precioCompetencia) * 0.1;
                  const porcentajeDescuento = (precioNormal - totalOfrecer) / precioNormal;
                  return (
                    <>
                      <Flex justify="between"><Text>Total a Ofrecer:</Text><Text weight="bold">L{totalOfrecer.toFixed(2)}</Text></Flex>
                      <Flex justify="between"><Text>% de Descuento:</Text><Text weight="bold" size={5} color="info">{(porcentajeDescuento * 100).toFixed(2)}%</Text></Flex>
                    </>
                  );
                })()}
              </Flex>
            </Card>
          </Grid>
        </Tabs.Content>
      </Tabs.Root>
    </Container>
  );
};

export default Calculadoras;
