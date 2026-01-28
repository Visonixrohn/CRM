import React, { useState } from "react";
import { Dialog, DialogOverlay, DialogContent, DialogTitle, Button, Flex, Box } from './designSystem';

const motivos = [
  { key: "no_contestan", label: "No contesta", color: "amber" },
  { key: "no_quiere", label: "No quiere", color: "red" },
  { key: "si_quiere", label: "Sí quiere", color: "green" },
];

export default function ModalSeleccionMotivo({ open, onClose, onSave, loading }) {
  const [motivo, setMotivo] = useState(null);
  
  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogOverlay />
      <DialogContent>
        <DialogTitle>Selecciona el motivo</DialogTitle>
        <Flex direction="column" gap="4" css={{ mt: '$4' }}>
          <Flex direction="column" gap="3">
            {motivos.map(m => (
              <Button
                key={m.key}
                variant={motivo === m.key ? m.color : "ghost"}
                onClick={() => setMotivo(m.key)}
                css={{
                  height: 'auto',
                  py: '$3',
                  fontSize: '$4',
                  border: motivo === m.key ? '2px solid currentColor' : '1px solid $colors$slate7'
                }}
              >
                {m.label}
              </Button>
            ))}
          </Flex>

          <Flex gap="3" justify="end">
            <Button variant="ghost" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={() => motivo && onSave(motivo)}
              disabled={!motivo || loading}
            >
              {loading ? 'Guardando...' : 'Guardar'}
            </Button>
          </Flex>
        </Flex>
      </DialogContent>
    </Dialog>
  );
}
