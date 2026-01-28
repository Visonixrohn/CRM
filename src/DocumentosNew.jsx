import React, { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";
import { Container, Card, Grid, Flex, Box, Heading, Text, Input, Label, Button, IconWrapper, Dialog, DialogOverlay, DialogContent, DialogTitle } from './designSystem';
import { FaFileAlt, FaPlus, FaEye, FaUpload } from "react-icons/fa";
import PdfPreviewModal from "./PdfPreviewModal";

const DocumentosNew = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [nombre, setNombre] = useState("");
  const [archivo, setArchivo] = useState(null);
  const [error, setError] = useState("");
  const [documentos, setDocumentos] = useState([]);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [pdfUrl, setPdfUrl] = useState("");

  useEffect(() => {
    const fetchDocumentos = async () => {
      try {
        const { data, error } = await supabase
          .from("documentos")
          .select("id, nombre, archivo");
        if (error) throw error;
        setDocumentos(data);
      } catch (error) {
        console.error("Error al obtener los documentos:", error);
      }
    };

    fetchDocumentos();
  }, []);

  const handleGuardar = async () => {
    if (!nombre.trim() || !archivo) {
      setError("Por favor, completa todos los campos.");
      return;
    }

    try {
      const userId = localStorage.getItem("userId");
      if (!userId) {
        throw new Error("No se pudo obtener el usuario autenticado.");
      }

      const uniqueFileName = `${Date.now()}_${archivo.name}`;

      const { data: archivoSubido, error: errorArchivo } =
        await supabase.storage
          .from("documentos")
          .upload(`public/${uniqueFileName}`, archivo);

      if (errorArchivo) {
        console.error("Error al subir el archivo al bucket:", errorArchivo);
        throw errorArchivo;
      }

      const { data: documento, error: errorDB } = await supabase
        .from("documentos")
        .insert({
          nombre,
          archivo: archivoSubido.path,
          user_id: userId,
        })
        .select("id");

      if (errorDB) {
        console.error(
          "Error al insertar los datos en la tabla documentos:",
          errorDB
        );
        throw errorDB;
      }

      // Actualizar la lista de documentos
      const { data: updatedDocs } = await supabase
        .from("documentos")
        .select("id, nombre, archivo");
      setDocumentos(updatedDocs || []);

      setNombre("");
      setArchivo(null);
      setIsModalOpen(false);
      setError("");
      alert("Documento guardado exitosamente.");
    } catch (error) {
      console.error("Error al guardar el documento:", error);
      setError("Hubo un error al guardar el documento.");
    }
  };

  const handleOpenPdfModal = async (id) => {
    try {
      const { data, error } = await supabase
        .from("documentos")
        .select("archivo")
        .eq("id", id)
        .single();

      if (error || !data) {
        console.error(
          "El archivo no existe o hubo un error al buscarlo:",
          error
        );
        alert("El documento no está disponible.");
        return;
      }

      const url = `https://caqukltkvvsfairqphjf.supabase.co/storage/v1/object/public/documentos/${data.archivo}`;
      setPdfUrl(url);
      setIsPdfModalOpen(true);
    } catch (err) {
      console.error("Error al verificar el archivo en Supabase:", err);
      alert("Hubo un problema al verificar el documento.");
    }
  };

  const handleClosePdfModal = () => {
    setIsPdfModalOpen(false);
    setPdfUrl("");
  };

  // Obtener usuario de localStorage
  let user = null;
  try {
    user = JSON.parse(localStorage.getItem("user"));
  } catch {}

  const canAddDocument = user && (user.rol === 'admin' || user.rol === 'superadmin');

  return (
    <Container>
      <Flex direction="column" gap="6">
        {/* Header */}
        <Flex align="center" justify="space-between" wrap="wrap" gap="3">
          <Flex align="center" gap="3">
            <IconWrapper color="blue">
              <FaFileAlt size={28} />
            </IconWrapper>
            <Heading size="8">Documentos</Heading>
          </Flex>
          {canAddDocument && (
            <Button variant="primary" onClick={() => setIsModalOpen(true)}>
              <FaPlus />
              Agregar Documento
            </Button>
          )}
        </Flex>

        {/* Grid de documentos */}
        {documentos.length === 0 ? (
          <Card variant="elevated">
            <Flex direction="column" align="center" justify="center" gap="3" css={{ py: '$8' }}>
              <IconWrapper color="slate" size="large">
                <FaFileAlt size={48} />
              </IconWrapper>
              <Heading size="4" css={{ color: '$slate11' }}>
                No hay documentos
              </Heading>
              <Text css={{ color: '$slate10' }}>
                {canAddDocument 
                  ? 'Agrega tu primer documento para comenzar' 
                  : 'No se encontraron documentos disponibles'}
              </Text>
            </Flex>
          </Card>
        ) : (
          <Grid columns={{ '@initial': '1', '@mobile': '2', '@tablet': '3', '@laptop': '4' }} gap="4">
            {documentos.map((doc) => (
              <Card key={doc.id} variant="interactive">
                <Flex direction="column" gap="3">
                  <Flex align="center" justify="center" css={{ py: '$4' }}>
                    <IconWrapper color="blue" size="large">
                      <FaFileAlt size={40} />
                    </IconWrapper>
                  </Flex>
                  <Box>
                    <Text 
                      size="3" 
                      weight="medium" 
                      css={{ 
                        color: '$slate12', 
                        textAlign: 'center',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical'
                      }}
                    >
                      {doc.nombre}
                    </Text>
                  </Box>
                  <Button
                    variant="secondary"
                    onClick={() => handleOpenPdfModal(doc.id)}
                    css={{ width: '100%' }}
                  >
                    <FaEye />
                    Ver Documento
                  </Button>
                </Flex>
              </Card>
            ))}
          </Grid>
        )}
      </Flex>

      {/* Modal para agregar documento */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogOverlay />
        <DialogContent>
          <DialogTitle>Agregar Documento</DialogTitle>
          <Flex direction="column" gap="4" css={{ mt: '$4' }}>
            {error && (
              <Box css={{ 
                p: '$3', 
                background: '$red3', 
                border: '1px solid $red6',
                borderRadius: '$2'
              }}>
                <Text css={{ color: '$red11' }}>{error}</Text>
              </Box>
            )}

            <Box>
              <Label htmlFor="nombreDocumento">Nombre del Documento</Label>
              <Input
                id="nombreDocumento"
                type="text"
                placeholder="Ej: Manual de usuario, Contrato, etc."
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
              />
            </Box>

            <Box>
              <Label htmlFor="archivoPDF">Subir PDF</Label>
              <Box 
                css={{ 
                  position: 'relative',
                  border: '2px dashed $colors$slate7',
                  borderRadius: '$2',
                  p: '$4',
                  textAlign: 'center',
                  background: '$slate2',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': {
                    borderColor: '$blue8',
                    background: '$blue2'
                  }
                }}
              >
                <input
                  id="archivoPDF"
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => setArchivo(e.target.files[0])}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    opacity: 0,
                    cursor: 'pointer'
                  }}
                />
                <Flex direction="column" align="center" gap="2">
                  <IconWrapper color="blue">
                    <FaUpload size={24} />
                  </IconWrapper>
                  <Text size="2" css={{ color: '$slate11' }}>
                    {archivo ? archivo.name : 'Haz clic o arrastra un archivo PDF'}
                  </Text>
                </Flex>
              </Box>
            </Box>

            <Flex gap="3" justify="end">
              <Button
                variant="ghost"
                onClick={() => {
                  setIsModalOpen(false);
                  setNombre("");
                  setArchivo(null);
                  setError("");
                }}
              >
                Cancelar
              </Button>
              <Button
                variant="primary"
                onClick={handleGuardar}
              >
                Guardar
              </Button>
            </Flex>
          </Flex>
        </DialogContent>
      </Dialog>

      {/* Modal para ver PDF */}
      <PdfPreviewModal
        isOpen={isPdfModalOpen}
        onRequestClose={handleClosePdfModal}
        pdfUrl={pdfUrl}
      />
    </Container>
  );
};

export default DocumentosNew;
