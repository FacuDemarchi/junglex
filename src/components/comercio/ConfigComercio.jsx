import React, { useState, useEffect } from 'react';
import ComercioCard from './ComercioCard';
import supabase from '../../supabase/supabase.config';
import MisProductos from './MisProductos';

const ConfigComercio = ({ user }) => {
  const [comercio, setComercio] = useState(null);

  useEffect(() => {
    if (user) {
      async function fetchComercioData() {
        const { data, error } = await supabase
          .from('comercios')
          .select('*')
          .eq('id', user.id);

        if (error) {
          console.error('Error al traer los datos del comercio:', error);
        } else {
          setComercio(data[0]);
        }
      }

      fetchComercioData();
    }
  }, [user]);

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Configuración del Comercio</h2>
      {comercio && <ComercioCard comercio={comercio} onUpdate={setComercio} />}
      <MisProductos user={user} />
    </div>
  );
};

export default ConfigComercio;
