
import React, { useEffect } from "react";
import "./EditUbicacionModal.css";
import { useGoogleMap } from "./useGoogleMap";


const apiKey = "AIzaSyDwQ_-OBFVwLjlzvj95k0NSJweSApAGZbo";

const EditUbicacionModal = ({ open, ubicacion, onSave, onClose }) => {
  // Extraer coordenadas iniciales de la ubicación si existe
  let initialCoords = { lat: 16.3832884, lng: -86.4460626 };
  if (ubicacion) {
    const match = ubicacion.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (match) {
      initialCoords = { lat: parseFloat(match[1]), lng: parseFloat(match[2]) };
    }
  }

  const { isLoaded, loadError, selectedCoords, MapComponent } = useGoogleMap(apiKey, initialCoords);

  useEffect(() => {
    // Si se abre el modal y hay ubicación previa, setearla como seleccionada
    // (esto requiere que el hook acepte initialCoords, se puede mejorar en el hook si es necesario)
  }, [open, ubicacion]);

  if (!open) return null;
  return (
    <div className="edit-ubicacion-modal-bg">
      <div className="edit-ubicacion-modal">
        <h3 className="edit-ubicacion-modal-title">Editar Ubicación</h3>
        <div className="edit-ubicacion-actions">
          <button className="edit-ubicacion-cancel" onClick={onClose}>Cancelar</button>
          <button className="edit-ubicacion-save" onClick={() => {
            const coords = selectedCoords || initialCoords;
            onSave(`https://www.google.com/maps/@${coords.lat},${coords.lng},18z`);
          }}>Guardar</button>
        </div>
        <div className="edit-ubicacion-map">
          {isLoaded ? <MapComponent /> : <div>Cargando mapa...</div>}
        </div>
        <div className="edit-ubicacion-coords">
          Lat: {selectedCoords ? selectedCoords.lat.toFixed(6) : initialCoords.lat.toFixed(6)}<br />
          Lng: {selectedCoords ? selectedCoords.lng.toFixed(6) : initialCoords.lng.toFixed(6)}
        </div>
      </div>
    </div>
  );
};

export default EditUbicacionModal;
