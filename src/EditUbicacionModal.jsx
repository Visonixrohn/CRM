import React, { useRef, useEffect, useState } from "react";
import "./EditUbicacionModal.css";

const EditUbicacionModal = ({ open, ubicacion, onSave, onClose }) => {
  const mapRef = useRef(null);
  const [latLng, setLatLng] = useState({ lat: 16.3832884, lng: -86.4460626 });
  const [mapLoaded, setMapLoaded] = useState(false);
  const [marker, setMarker] = useState(null);

  useEffect(() => {
    if (!open) return;
    // Extraer lat/lng de la ubicación actual si existe
    let lat = 16.3832884, lng = -86.4460626;
    if (ubicacion) {
      const match = ubicacion.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
      if (match) {
        lat = parseFloat(match[1]);
        lng = parseFloat(match[2]);
      }
    }
    setLatLng({ lat, lng });
  }, [ubicacion, open]);

  useEffect(() => {
    if (!open || !window.google?.maps || !mapRef.current) return;
    let map = new window.google.maps.Map(mapRef.current, {
      center: latLng,
      zoom: 13,
      mapTypeId: "satellite",
      gestureHandling: "greedy"
    });
    let localMarker = new window.google.maps.Marker({
      position: latLng,
      map,
      draggable: true,
      icon: {
        url: "http://maps.google.com/mapfiles/ms/icons/red-dot.png",
        scaledSize: new window.google.maps.Size(40, 40),
      },
    });
    setMarker(localMarker);
    // Click en el mapa
    const clickListener = map.addListener("click", (e) => {
      localMarker.setPosition(e.latLng);
      setLatLng({ lat: e.latLng.lat(), lng: e.latLng.lng() });
    });
    // Drag marker
    const dragListener = localMarker.addListener("dragend", (e) => {
      setLatLng({ lat: e.latLng.lat(), lng: e.latLng.lng() });
    });
    setMapLoaded(true);
    return () => {
      window.google.maps.event.removeListener(clickListener);
      window.google.maps.event.removeListener(dragListener);
      if (localMarker) localMarker.setMap(null);
    };
    // eslint-disable-next-line
  }, [open, latLng.lat, latLng.lng]);

  if (!open) return null;
  return (
    <div className="edit-ubicacion-modal-bg">
      <div className="edit-ubicacion-modal">
        <h3 className="edit-ubicacion-modal-title">Editar Ubicación</h3>
        <div ref={mapRef} className="edit-ubicacion-map"></div>
        <div className="edit-ubicacion-coords">
          Lat: {latLng.lat.toFixed(6)}<br />Lng: {latLng.lng.toFixed(6)}
        </div>
        <div className="edit-ubicacion-actions">
          <button className="edit-ubicacion-cancel" onClick={onClose}>Cancelar</button>
          <button className="edit-ubicacion-save" onClick={() => onSave(`https://www.google.com/maps/@${latLng.lat},${latLng.lng},18z`)}>Guardar</button>
        </div>
      </div>
    </div>
  );
};

export default EditUbicacionModal;
