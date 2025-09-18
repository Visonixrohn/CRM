import { useCallback, useState } from 'react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '100vh',
};

const centerInicial = {
  lat: 16.316667,
  lng: -86.5, // Islas de la Bahía
};

export function useGoogleMap(apiKey, initialCoords) {
  const [selectedCoords, setSelectedCoords] = useState(initialCoords || null);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: apiKey,
  });

  const onMapClick = useCallback((e) => {
    if (e.latLng) {
      setSelectedCoords({
        lat: e.latLng.lat(),
        lng: e.latLng.lng(),
      });
    }
  }, []);

  const MapComponent = () => (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={selectedCoords || initialCoords || centerInicial}
      zoom={12}
      mapTypeId="satellite"
      onClick={onMapClick}
      options={{ gestureHandling: "greedy" }}
    >
      {(selectedCoords || initialCoords || centerInicial) && (
        <Marker position={selectedCoords || initialCoords || centerInicial} />
      )}
    </GoogleMap>
  );

  return {
    isLoaded,
    loadError,
    selectedCoords,
    MapComponent,
  };
}
