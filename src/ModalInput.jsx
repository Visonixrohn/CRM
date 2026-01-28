import React from "react";
import { Dialog, DialogOverlay, DialogContent, DialogTitle, Button, Flex, Input, Label } from './designSystem';

const ModalInput = ({ open, label, value, onClose, onSave, isMoney }) => {
  const [inputValue, setInputValue] = React.useState(value);

  React.useEffect(() => {
    setInputValue(value);
  }, [value, open]);

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogOverlay />
      <DialogContent>
        <DialogTitle>{label}</DialogTitle>
        <Flex direction="column" gap="4" css={{ mt: '$4' }}>
          <Input
            type="number"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            autoFocus
          />
          <Flex gap="3" justify="end">
            <Button variant="ghost" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={() => onSave(isMoney ? Number(inputValue) : inputValue)}
            >
              Guardar
            </Button>
          </Flex>
        </Flex>
      </DialogContent>
    </Dialog>
  );
};

export default ModalInput;
