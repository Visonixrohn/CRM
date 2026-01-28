import React, { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import { Container, Card, Grid, Flex, Heading, Text, Input, IconWrapper, Box, Badge } from './designSystem';
import { FaBook, FaSearch } from 'react-icons/fa';

const Razones = () => {
  const [razones, setRazones] = useState([]);
  const [search, setSearch] = useState("");
  const [filteredRazones, setFilteredRazones] = useState([]);

  useEffect(() => {
    const fetchRazones = async () => {
      const { data, error } = await supabase.from("razones").select("*");
      if (error) {
        console.error("Error fetching razones:", error);
      } else {
        setRazones(data);
        setFilteredRazones(data);
      }
    };

    fetchRazones();
  }, []);

  useEffect(() => {
    if (search.trim() === "") {
      setFilteredRazones(razones); // Mostrar todos los datos si la búsqueda está en blanco
    } else {
      const searchTerms = search
        .toLowerCase()
        .split(/\s+/) // Dividir por espacios
        .map((term) => term.trim())
        .filter((term) => term !== ""); // Eliminar términos vacíos

      const newFilteredRazones = razones.filter(
        (razon) =>
          searchTerms.some((term) => razon.codigo.toLowerCase() === term) // Comparar exactamente
      );
      setFilteredRazones(newFilteredRazones);
    }
  }, [search, razones]); // Filtrar automáticamente cuando cambia la búsqueda o los datos

  return (
    <Container>
      <Flex direction="column" gap={4} css={{ marginBottom: '$6' }}>
        <Flex align="center" gap={3}>
          <IconWrapper color="primary" size="lg"><FaBook /></IconWrapper>
          <Heading size={2}>Razones de Servicio</Heading>
        </Flex>
        <Text color="subtle">Códigos y descripciones de razones</Text>
      </Flex>

      <Box css={{ marginBottom: '$6', position: 'relative', maxWidth: '500px' }}>
        <Input
          type="text"
          placeholder="Buscar por código..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          css={{ paddingLeft: '$10' }}
        />
        <FaSearch style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
      </Box>

      <Grid columns="auto" gap={4}>
        {filteredRazones.map((razon) => (
          <Card key={razon.id}>
            <Flex justify="between" align="center">
              <Flex direction="column" gap={2}>
                <Flex align="center" gap={2}>
                  <Badge variant="primary">{razon.codigo}</Badge>
                </Flex>
                <Text>{razon.descripcion}</Text>
              </Flex>
            </Flex>
          </Card>
        ))}
      </Grid>

      {filteredRazones.length === 0 && (
        <Box css={{ textAlign: 'center', padding: '$10' }}>
          <Text color="subtle">No se encontraron razones</Text>
        </Box>
      )}
    </Container>
  );
};

export default Razones;
