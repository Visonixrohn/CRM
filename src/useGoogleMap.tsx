import { useCallback, useState } from 'react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '100%',
  minHeight: 180,
  maxWidth: 350,
  maxHeight: 400,
};


const centerInicial = {
  lat: 16.316667,
  lng: -86.5,
};

export function useGoogleMap(
  apiKey,
  initialCoords,
  mapType = "satellite",
  zoom = 13,
  onSelect
) {
  const [selectedCoords, setSelectedCoords] = useState(initialCoords || centerInicial);
  const [currentZoom, setCurrentZoom] = useState(zoom);
  const [currentMapType, setCurrentMapType] = useState(mapType);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: apiKey,
  });

  const onMapClick = useCallback((e) => {
    if (e.latLng) {
      const coords = {
        lat: e.latLng.lat(),
        lng: e.latLng.lng(),
      };
      setSelectedCoords(coords);
      if (onSelect) onSelect(coords, currentZoom);
    }
  }, [onSelect, currentZoom]);


  const MapComponent = (props) => (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={selectedCoords}
      zoom={props.zoom || currentZoom}
      mapTypeId={props.mapType || currentMapType}
      onClick={onMapClick}
      options={{ gestureHandling: "greedy" }}
    >
      <Marker position={selectedCoords} draggable={true} onDragEnd={onMapClick} />
    </GoogleMap>
  );

  return {
    isLoaded,
    loadError,
    selectedCoords,
    currentZoom,
    currentMapType,
    MapComponent,
  };
}
