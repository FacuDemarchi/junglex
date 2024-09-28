import React, { useState } from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import { TextField, Button } from '@mui/material';

const containerStyle = {
  width: '400px',
  height: '400px'
};

function GMap() {
  const [center, setCenter] = useState({ lat: -34.397, lng: 150.644 });
  const [address, setAddress] = useState('');

  const handleAddressChange = (event) => {
    setAddress(event.target.value);
  };

  const handleSearch = () => {
    // Aquí realizarías la lógica para buscar la dirección
    // y actualizar el centro del mapa con las coordenadas obtenidas.
    // Por ejemplo, podrías usar la API de Geocoding de Google Maps.
  };

  const handleSave = () => {
    // Aquí realizarías la lógica para guardar los datos de la ubicación.
    console.log('Ubicación guardada:', center);
  };

  return (
    <div>
      <TextField label="Dirección" value={address} onChange={handleAddressChange} />
      <Button variant="contained" onClick={handleSearch}>Buscar</Button>

      <LoadScript googleMapsApiKey="YOUR_API_KEY">
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={center}
          zoom={10}
        >
          <Marker position={center} />
        </GoogleMap>
      </LoadScript>

      <Button variant="contained" onClick={handleSave}>Guardar</Button>
    </div>
  );
}

export default GMap;