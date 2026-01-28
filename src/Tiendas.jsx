import React, { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import { Container, Card, Grid, Flex, Heading, Text, Input, Button, IconWrapper, Box, Badge } from './designSystem';
import { FaStore, FaSearch, FaEdit } from 'react-icons/fa';
import * as Dialog from '@radix-ui/react-dialog';
import { DialogOverlay, DialogContent, DialogTitle, Label } from './designSystem';

const Tiendas = () => {
  const [tiendas, setTiendas] = useState([]);
  const [search, setSearch] = useState("");
  const [searchNombre, setSearchNombre] = useState("");
  const [filteredTiendas, setFilteredTiendas] = useState([]);
  const [tiendaEditando, setTiendaEditando] = useState(null);

  useEffect(() => {
    const fetchTiendas = async () => {
      const { data, error } = await supabase.from("tiendas").select("*"); // Obtener todas las tiendas sin filtrar por usuario

      if (error) {
        console.error("Error fetching tiendas:", error);
      } else {
        setTiendas(data);
        setFilteredTiendas(data);
      }
    };

    fetchTiendas();
  }, []);

  useEffect(() => {
    let result = tiendas;
    // Filtrar por número de tienda si hay búsqueda
    if (search.trim() !== "") {
      const searchTerms = search
        .toLowerCase()
        .split(/\s+/)
        .map((term) => term.trim())
        .filter((term) => term !== "");
      result = result.filter((tienda) =>
        searchTerms.some(
          (term) => tienda.numero_tienda.toLowerCase() === term
        )
      );
    }
    // Filtrar por nombre de tienda si hay búsqueda
    if (searchNombre.trim() !== "") {
      const nombreTerm = searchNombre.toLowerCase();
      result = result.filter((tienda) =>
        tienda.tienda && tienda.tienda.toLowerCase().includes(nombreTerm)
      );
    }
    setFilteredTiendas(result);
  }, [search, searchNombre, tiendas]);

  // Conteos para la barra lateral
  const conteoTipos = {
    Todos: tiendas.length,
  };

  const [filtroSidebar, setFiltroSidebar] = useState("Todos");

  // Filtrado combinado (search + sidebar)
  useEffect(() => {
    let result = tiendas;
    // aplicar búsqueda por número
    if (search.trim() !== "") {
      const searchTerms = search
        .toLowerCase()
        .split(/\s+/)
        .map((term) => term.trim())
        .filter((term) => term !== "");
      result = result.filter((tienda) =>
        searchTerms.some((term) => tienda.numero_tienda.toLowerCase() === term)
      );
    }
    // aplicar búsqueda por nombre
    if (searchNombre.trim() !== "") {
      const nombreTerm = searchNombre.toLowerCase();
      result = result.filter((tienda) =>
        tienda.tienda && tienda.tienda.toLowerCase().includes(nombreTerm)
      );
    }
    // aplicar filtro lateral (actualmente solo "Todos")
    // Aquí se pueden agregar más filtros cuando haya más datos disponibles

    setFilteredTiendas(result);
  }, [search, searchNombre, tiendas, filtroSidebar]);

  const handleEditar = (tienda) => {
    setTiendaEditando(tienda);
  };

  const handleGuardarEdicion = async (tiendaId, datosActualizados) => {
    try {
      const { error } = await supabase
        .from("tiendas")
        .update(datosActualizados)
        .eq("id", tiendaId);

      if (error) {
        console.error("Error al actualizar tienda:", error);
        alert("Error al actualizar la tienda");
        return;
      }

      // Actualizar el estado local
      setTiendas((prev) =>
        prev.map((t) => (t.id === tiendaId ? { ...t, ...datosActualizados } : t))
      );
      setTiendaEditando(null);
      alert("Tienda actualizada exitosamente");
    } catch (err) {
      console.error("Error:", err);
      alert("Error al guardar los cambios");
    }
  };

  return (
    <Container>
      <Flex direction="column" gap={4} css={{ marginBottom: '$6' }}>
        <Flex align="center" gap={3}>
          <IconWrapper color="primary" size="lg"><FaStore /></IconWrapper>
          <Heading size={2}>Tiendas</Heading>
        </Flex>
        <Text color="subtle">Gestión de tiendas del sistema</Text>
      </Flex>

      <Flex gap={4} css={{ marginBottom: '$6', flexWrap: 'wrap' }}>
        <Card css={{ flex: 1, minWidth: '200px' }}>
          <Text color="subtle" css={{ marginBottom: '$2' }}>Total de Tiendas</Text>
          <Text size={6} weight="bold">{conteoTipos.Todos}</Text>
        </Card>
        <Card css={{ flex: 1, minWidth: '200px' }}>
          <Text color="subtle" css={{ marginBottom: '$2' }}>Mostrando</Text>
          <Text size={6} weight="bold">{filteredTiendas.length}</Text>
        </Card>
      </Flex>

      <Flex gap={3} css={{ marginBottom: '$6', flexWrap: 'wrap' }}>
        <Box css={{ position: 'relative', flex: 1, minWidth: '250px' }}>
          <Input
            type="text"
            placeholder="Buscar Nº tienda..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            css={{ paddingLeft: '$10' }}
          />
          <FaSearch style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
        </Box>
        <Box css={{ position: 'relative', flex: 1, minWidth: '250px' }}>
          <Input
            type="text"
            placeholder="Buscar por nombre..."
            value={searchNombre}
            onChange={(e) => setSearchNombre(e.target.value)}
            css={{ paddingLeft: '$10' }}
          />
          <FaSearch style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
        </Box>
      </Flex>

      <Grid columns="auto" gap={4}>
        {filteredTiendas.map((tienda) => (
          <Card key={tienda.id}>
            <Flex justify="between" align="center">
              <Flex direction="column" gap={2}>
                <Flex align="center" gap={2}>
                  <Badge variant="primary">{tienda.numero_tienda}</Badge>
                  <Text weight="semibold">{tienda.tienda}</Text>
                </Flex>
              </Flex>
              <Button variant="primary" size="sm" onClick={() => handleEditar(tienda)}>
                <FaEdit /> Editar
              </Button>
            </Flex>
          </Card>
        ))}
      </Grid>

      {filteredTiendas.length === 0 && (
        <Box css={{ textAlign: 'center', padding: '$10' }}>
          <Text color="subtle">No se encontraron tiendas</Text>
        </Box>
      )}

      <Dialog.Root open={!!tiendaEditando} onOpenChange={(open) => !open && setTiendaEditando(null)}>
        <Dialog.Portal>
          <DialogOverlay />
          <DialogContent>
            <DialogTitle>Editar Tienda</DialogTitle>
            {tiendaEditando && (
              <Flex direction="column" gap={4}>
                <Box>
                  <Label>Número de Tienda</Label>
                  <Input
                    type="text"
                    value={tiendaEditando.numero_tienda}
                    onChange={(e) => setTiendaEditando({ ...tiendaEditando, numero_tienda: e.target.value })}
                  />
                </Box>
                <Box>
                  <Label>Nombre de Tienda</Label>
                  <Input
                    type="text"
                    value={tiendaEditando.tienda || ''}
                    onChange={(e) => setTiendaEditando({ ...tiendaEditando, tienda: e.target.value })}
                  />
                </Box>
                <Flex gap={3} justify="end">
                  <Button variant="secondary" onClick={() => setTiendaEditando(null)}>Cancelar</Button>
                  <Button variant="primary" onClick={() => handleGuardarEdicion(tiendaEditando.id, { numero_tienda: tiendaEditando.numero_tienda, tienda: tiendaEditando.tienda })}>Guardar</Button>
                </Flex>
              </Flex>
            )}
          </DialogContent>
        </Dialog.Portal>
      </Dialog.Root>
    </Container>
  );
};

export default Tiendas;
