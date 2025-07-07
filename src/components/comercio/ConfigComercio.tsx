import React, { useState, useEffect } from 'react';
import ComercioCard from './ComercioCard';
import supabase from '../../supabase/supabase.config';
import MisProductos from './MisProductos';

interface User {
  id: string;
  user_data?: {
    user_type: string;
  };
}

interface Comercio {
  id: string;
  nombre: string;
  direccion: string;
  telefono: string;
  categorias: string;
  logo: string;
  latitude: number;
  longitude: number;
  horario_apertura: string;
  horario_cierre: string;
}

interface ConfigComercioProps {
  user: User;
}

const ConfigComercio: React.FC<ConfigComercioProps> = ({ user }) => {
  const [comercio, setComercio] = useState<Comercio | null>(null);

  useEffect(() => {
    const fetchComercioData = async () => {
      if (user) {
        const { data, error } = await supabase
          .from('comercios')
          .select('*')
          .eq('id', user.id);

        if (error) {
          console.error('Error al traer los datos del comercio:', error);
        } else {
          setComercio(data && data[0] ? data[0] : null);
        }
      }
    };
    fetchComercioData();
  }, [user]);

  return (
    <div className="w-full flex flex-col gap-4 mx-4">
      {comercio && <ComercioCard comercio={comercio} onUpdate={setComercio} />}
      <MisProductos user={user} />
    </div>
  );
};

export default ConfigComercio;
