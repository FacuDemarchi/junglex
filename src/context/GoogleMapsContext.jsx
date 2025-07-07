import React, { createContext, useContext, useState, useEffect } from 'react';

const GoogleMapsContext = createContext();

export const useGoogleMaps = () => {
  const context = useContext(GoogleMapsContext);
  if (!context) {
    throw new Error('useGoogleMaps debe usarse dentro de GoogleMapsProvider');
  }
  return context;
};

export const GoogleMapsProvider = ({ children }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Si ya está cargado, no hacer nada
    if (isLoaded || isLoading) return;

    // Si ya existe window.google, marcar como cargado
    if (window.google && window.google.maps) {
      setIsLoaded(true);
      return;
    }

    setIsLoading(true);

    // Crear script solo si no existe
    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
    if (existingScript) {
      // Si ya existe un script, esperar a que cargue
      const checkGoogleMaps = () => {
        if (window.google && window.google.maps) {
          setIsLoaded(true);
          setIsLoading(false);
        } else {
          setTimeout(checkGoogleMaps, 100);
        }
      };
      checkGoogleMaps();
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      setIsLoaded(true);
      setIsLoading(false);
    };

    script.onerror = () => {
      setError('Error al cargar Google Maps');
      setIsLoading(false);
    };

    document.head.appendChild(script);

    return () => {
      // No remover el script al desmontar para evitar recargas
    };
  }, [isLoaded, isLoading]);

  const value = {
    isLoaded,
    isLoading,
    error,
    google: window.google
  };

  return (
    <GoogleMapsContext.Provider value={value}>
      {children}
    </GoogleMapsContext.Provider>
  );
}; 