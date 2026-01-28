import React from "react";
import { Dialog, DialogOverlay, DialogContent, DialogTitle, Button, Flex, IconWrapper } from './designSystem';
import { FaCheckCircle } from "react-icons/fa";

const ModalExito = ({ mensaje = "Actualización exitosa", onClose }) => {
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogOverlay />
      <DialogContent css={{ maxWidth: '400px' }}>
        <Flex direction="column" align="center" gap="4" css={{ py: '$4' }}>
          <IconWrapper color="green" size="large">
            <FaCheckCircle size={48} />
          </IconWrapper>
          <DialogTitle css={{ textAlign: 'center' }}>{mensaje}</DialogTitle>
          <Button variant="success" onClick={onClose} css={{ width: '100%' }}>
            Cerrar
          </Button>
        </Flex>
      </DialogContent>
    </Dialog>
  );
};

export default ModalExito;
