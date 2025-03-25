import React, { useEffect, useState } from 'react';
import supabase from '../../supabase/supabase.config';
import { useAuth } from '../../context/AuthContext';

const TestComponent = () => {
  const { user } = useAuth();
  const [userLocations, setUserLocations] = useState([]);
  const [comercios, setComercios] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) return;

    const fetchLocations = async () => {
      const { data, error } = await supabase
        .from('user_locations')
        .select('*')
        .eq('user_id', user.id);

      if (error) setError(error.message);
      else setUserLocations(data);
    };

    fetchLocations();
  }, [user]);

  const fetchComercios = async (lat, lng) => {
    const { data, error } = await supabase.rpc('obtener_comercios_cercanos', {
      latitud: lat,
      longitud: lng,
    });

    if (error) setError(error.message);
    else setComercios(data);
  };

  if (!user) return <p>Cargando usuario...</p>;

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Ubicaciones del Usuario</h2>

      {userLocations.length === 0 ? (
        <p>No hay ubicaciones guardadas.</p>
      ) : (
        <ul>
          {userLocations.map((loc) => (
            <li
              key={loc.id}
              style={{ cursor: 'pointer', marginBottom: '0.5rem' }}
              onClick={() => fetchComercios(loc.latitude, loc.longitude)}
            >
              📍 {loc.address} — ({loc.latitude}, {loc.longitude})
            </li>
          ))}
        </ul>
      )}

      <hr />

      <h3>Comercios Cercanos</h3>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {comercios.length === 0 ? (
        <p>No hay comercios para mostrar.</p>
      ) : (
        <ul>
          {comercios.map((c) => (
            <li key={c.id}>
              🏪 {c.nombre} — {c.direccion} — {c.telefono} — {c.distancia_km.toFixed(2)} km
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TestComponent;
