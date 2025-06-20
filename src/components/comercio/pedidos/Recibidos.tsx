import React, { useEffect, useState } from 'react';
import supabase from '../../../supabase/supabase.config';
import styles from './styles/Recibidos.module.css';

interface PedidoProducto {
  id: string;
  cantidad: number;
  precio_unitario: number;
  producto_id: { nombre: string };
}

interface UserLocation {
  id: string;
  address: string;
  latitude: number;
  longitude: number;
  user_id: string;
}

interface Pedido {
  id: string;
  estado: string;
  pedido_productos: PedidoProducto[];
  user_id: string;
  user_locations: UserLocation;
}

interface RecibidosProps {
  pedido: Pedido;
  onAceptar: (id: string) => void;
  onRechazar: (id: string) => void;
}

const Recibidos: React.FC<RecibidosProps> = ({ pedido, onAceptar, onRechazar }) => {
  const [phone, setPhone] = useState<string>('');
  const [ubicacion, setUbicacion] = useState<UserLocation | null>(null);
  const total = (pedido.pedido_productos.reduce((acc, prod) => acc + (prod.cantidad * prod.precio_unitario), 0)).toFixed(2);

  useEffect(() => {
    const fetchData = async () => {
      if (pedido) {
        const { data: userData, error: userError } = await supabase
          .from('user_data')
          .select('phone')
          .eq('user_id', pedido.user_id)
          .single();
        if (userError) {
          console.error('Error fetching phone:', userError);
          return;
        }
        setPhone(userData?.phone || '');
        setUbicacion(pedido.user_locations);
      }
    };
    fetchData();
  }, [pedido]);

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <span className={styles.ubicacion}>{ubicacion?.address || 'Ubicación no disponible'}</span>
        <a
          href={`https://www.google.com/maps/@${ubicacion?.latitude},${ubicacion?.longitude},15z`}
          target="_blank"
          rel="noopener noreferrer"
          style={{ fontSize: '0.8rem', color: 'var(--primary-color)' }}
        >
          Ver mapa
        </a>
      </div>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.85rem' }}>
        {pedido.pedido_productos.map(prod => (
          <li key={prod.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1px 0' }}>
            <span style={{ marginRight: 2 }}>x{prod.cantidad}</span>
            <span style={{ marginRight: 'auto' }}>{prod.producto_id.nombre}</span>
            <span>${(prod.cantidad * prod.precio_unitario).toFixed(2)}</span>
          </li>
        ))}
      </ul>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 2, fontSize: '0.88rem' }}>
        <div style={{ display: 'flex', gap: 4 }}>
          <button
            style={{
              background: 'var(--danger-color)',
              color: 'var(--text-light)',
              border: 'none',
              borderRadius: 4,
              fontWeight: 600,
              fontSize: '0.8rem',
              padding: '4px 12px',
              cursor: 'pointer',
              transition: 'background 0.2s',
            }}
            onClick={() => onRechazar(pedido.id)}
          >
            Rechazar
          </button>
          <button
            style={{
              background: 'var(--success-color)',
              color: 'var(--text-light)',
              border: 'none',
              borderRadius: 4,
              fontWeight: 600,
              fontSize: '0.8rem',
              padding: '4px 12px',
              cursor: 'pointer',
              transition: 'background 0.2s',
            }}
            onClick={() => onAceptar(pedido.id)}
          >
            Aceptar
          </button>
          <a
            href={`https://wa.me/+549${phone}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              background: 'var(--primary-color)',
              color: 'var(--text-light)',
              border: 'none',
              borderRadius: 4,
              fontWeight: 600,
              fontSize: '0.8rem',
              padding: '4px 12px',
              cursor: 'pointer',
              transition: 'background 0.2s',
              textDecoration: 'none',
              alignItems: 'center',
              justifyContent: 'center',
              display: 'flex',
            }}
          >
            <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" alt="WhatsApp" style={{ width: 18, height: 18, marginRight: 0 }} />
          </a>
        </div>
        <span style={{ fontWeight: 500 }}>Total: ${total}</span>
      </div>
    </div>
  );
};

export default Recibidos;
