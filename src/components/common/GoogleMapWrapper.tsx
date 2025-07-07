import React from 'react';
import GoogleMapReact from 'google-map-react';
import { useGoogleMaps } from '../../context/GoogleMapsContext';

interface GoogleMapWrapperProps {
  center: { lat: number; lng: number };
  defaultZoom?: number;
  onChange?: (map: any) => void;
  children?: React.ReactNode;
}

const GoogleMapWrapper: React.FC<GoogleMapWrapperProps> = ({ 
  center, 
  defaultZoom = 17, 
  onChange, 
  children 
}) => {
  const { isLoaded } = useGoogleMaps();

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-full text-xs text-gray-400">
        Cargando mapa...
      </div>
    );
  }

  return (
    <GoogleMapReact
      bootstrapURLKeys={{
        key: process.env.REACT_APP_GOOGLE_MAPS_API_KEY as string,
        libraries: ['places']
      }}
      center={center}
      defaultZoom={defaultZoom}
      onChange={onChange}
    >
      {children}
    </GoogleMapReact>
  );
};

export default GoogleMapWrapper; 