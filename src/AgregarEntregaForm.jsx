import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogOverlay,
  DialogContent,
  DialogTitle,
  Box,
  Grid,
  Label,
  Input,
  Button,
  Text,
} from './designSystem';

const AgregarEntregaForm = ({ open, onClose, onAdd }) => {
  const [touched, setTouched] = useState({});
  
  const getToday = () => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  };

  const getTomorrow = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')}`;
  };

  const [form, setForm] = useState({
    cliente: "",
    factura: "",
    cel: "",
    articulo: "",
    estatus: "Pendiente",
    fecha: getToday(),
    fecha_entrega: getTomorrow(),
    tipo_entrega: "TIENDA",
    gestionada: "NO GESTIONADA",
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) {
      setForm({
        cliente: "",
        factura: "",
        cel: "",
        articulo: "",
        estatus: "Pendiente",
        fecha: getToday(),
        fecha_entrega: getTomorrow(),
        tipo_entrega: "TIENDA",
        gestionada: "NO GESTIONADA",
      });
      setTouched({});
      setError("");
    }
  }, [open]);

  const handleAgregar = async () => {
    setError("");
    const camposObligatorios = [
      "cliente",
      "factura",
      "cel",
      "articulo",
      "fecha",
      "fecha_entrega",
    ];
    
    const vacios = camposObligatorios.filter((c) => !form[c]);
    if (vacios.length > 0) {
      setTouched((prev) => ({
        ...prev,
        ...Object.fromEntries(vacios.map((c) => [c, true])),
      }));
      setError("Todos los campos obligatorios deben completarse.");
      return;
    }
    
    setLoading(true);
    try {
      const ok = await onAdd(form);
      if (ok) {
        setForm({
          cliente: "",
          factura: "",
          cel: "",
          articulo: "",
          estatus: "Pendiente",
          fecha: getToday(),
          fecha_entrega: getTomorrow(),
          tipo_entrega: "TIENDA",
          gestionada: "NO GESTIONADA",
        });
        setTouched({});
        onClose();
      } else {
        setError("No se pudo guardar la entrega. Intenta de nuevo.");
      }
    } catch (e) {
      setError("Error inesperado: " + (e.message || e));
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogOverlay />
      <DialogContent css={{ maxWidth: '600px' }}>
        <DialogTitle>📦 Agregar Nueva Entrega</DialogTitle>
        
        <Box css={{ display: 'flex', flexDirection: 'column', gap: '$4', mt: '$4' }}>
          <Grid css={{ gridTemplateColumns: '1fr 1fr', gap: '$4' }}>
            <Box>
              <Label>Nombre del cliente *</Label>
              <Input 
                type="text" 
                value={form.cliente} 
                onChange={e => setForm({ ...form, cliente: e.target.value })} 
                onBlur={() => setTouched(t => ({ ...t, cliente: true }))}
                placeholder="Ingrese el nombre del cliente"
                css={{ 
                  borderColor: touched.cliente && !form.cliente ? '$red9' : undefined 
                }}
              />
            </Box>
            
            <Box>
              <Label>No. Documento *</Label>
              <Input 
                type="text" 
                value={form.factura} 
                onChange={e => setForm({ ...form, factura: e.target.value })} 
                onBlur={() => setTouched(t => ({ ...t, factura: true }))}
                placeholder="Número de factura"
                css={{ 
                  borderColor: touched.factura && !form.factura ? '$red9' : undefined 
                }}
              />
            </Box>
          </Grid>

          <Grid css={{ gridTemplateColumns: '1fr 1fr', gap: '$4' }}>
            <Box>
              <Label>Celular *</Label>
              <Input 
                type="tel" 
                value={form.cel} 
                onChange={e => setForm({ ...form, cel: e.target.value })} 
                onBlur={() => setTouched(t => ({ ...t, cel: true }))}
                pattern="[0-9]{8,15}" 
                maxLength={15}
                placeholder="Ej: 98765432"
                css={{ 
                  borderColor: touched.cel && !form.cel ? '$red9' : undefined 
                }}
              />
            </Box>
            
            <Box>
              <Label>Artículo *</Label>
              <Input 
                type="text" 
                value={form.articulo} 
                onChange={e => setForm({ ...form, articulo: e.target.value })} 
                onBlur={() => setTouched(t => ({ ...t, articulo: true }))}
                placeholder="Descripción del artículo"
                css={{ 
                  borderColor: touched.articulo && !form.articulo ? '$red9' : undefined 
                }}
              />
            </Box>
          </Grid>

          <Grid css={{ gridTemplateColumns: '1fr 1fr', gap: '$4' }}>
            <Box>
              <Label>Fecha de entrega *</Label>
              <Input 
                type="date" 
                value={form.fecha_entrega} 
                onChange={e => setForm({ ...form, fecha_entrega: e.target.value })} 
                onBlur={() => setTouched(t => ({ ...t, fecha_entrega: true }))}
                css={{ 
                  borderColor: touched.fecha_entrega && !form.fecha_entrega ? '$red9' : undefined 
                }}
              />
            </Box>
            
            <Box>
              <Label>Tipo de entrega</Label>
              <Input 
                as="select"
                value={form.tipo_entrega} 
                onChange={e => setForm({ ...form, tipo_entrega: e.target.value })}
              >
                <option value="TIENDA">🏪 Tienda</option>
                <option value="BODEGA SPS">📦 Bodega SPS</option>
                <option value="BODEGA TG">📦 Bodega TG</option>
                <option value="DOMICILIO">🏠 Domicilio</option>
              </Input>
            </Box>
          </Grid>

          <Box>
            <Label>Estado de gestión</Label>
            <Input 
              as="select"
              value={form.gestionada} 
              onChange={e => setForm({ ...form, gestionada: e.target.value })}
            >
              <option value="NO GESTIONADA">⏳ No gestionada</option>
              <option value="GESTIONADA">✅ Gestionada</option>
            </Input>
          </Box>

          {error && (
            <Box css={{ 
              p: '$3', 
              backgroundColor: '$red3', 
              borderRadius: '$2', 
              border: '1px solid $red7' 
            }}>
              <Text css={{ color: '$red11', fontSize: '$2' }}>{error}</Text>
            </Box>
          )}

          <Box css={{ display: 'flex', gap: '$3', justifyContent: 'flex-end', mt: '$4' }}>
            <Button 
              variant="secondary" 
              onClick={onClose} 
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button 
              variant="primary" 
              onClick={handleAgregar} 
              disabled={loading}
            >
              {loading ? '⏳ Guardando...' : '✅ Agregar entrega'}
            </Button>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default AgregarEntregaForm;
