import React, { useEffect, useState } from 'react';
// Eliminar: import supabase from '../../../supabase/supabase.config';
// import styles from './styles/Recibidos.module.css'; // Eliminado

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
  user_id: string | { user_data?: { phone: string } | null };
  user_locations: UserLocation;
}

interface RecibidosProps {
  pedido: Pedido;
  onAceptar: (id: string) => void;
  onRechazar: (id: string) => void;
}

const Recibidos: React.FC<RecibidosProps> = ({ pedido, onAceptar, onRechazar }) => {
  const [ubicacion, setUbicacion] = useState<UserLocation | null>(null);
  const total = (pedido.pedido_productos.reduce((acc, prod) => acc + (prod.cantidad * prod.precio_unitario), 0)).toFixed(2);

  useEffect(() => {
    setUbicacion(pedido.user_locations);
  }, [pedido]);

  return (
    <div className="bg-gray-100 rounded-lg shadow-md mb-2 p-3 transition-colors duration-200 text-sm hover:bg-gray-200">
      <div className="flex justify-between items-center font-semibold text-blue-600 mb-1 text-base">
        <span className="text-gray-700 text-sm font-medium">{ubicacion?.address || 'Ubicación no disponible'}</span>
        <a
          href={`https://www.google.com/maps/@${ubicacion?.latitude},${ubicacion?.longitude},15z`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-blue-600 hover:underline"
        >
          Ver mapa
        </a>
      </div>
      <ul className="list-none p-0 m-0 text-xs">
        {pedido.pedido_productos.map(prod => (
          <li key={prod.id} className="flex justify-between items-center py-0.5">
            <span className="mr-1">x{prod.cantidad}</span>
            <span className="mr-auto">{prod.producto_id.nombre}</span>
            <span>${(prod.cantidad * prod.precio_unitario).toFixed(2)}</span>
          </li>
        ))}
      </ul>
      <div className="flex justify-between items-end mt-1 text-sm">
        <div className="flex gap-1">
          <button
            className="bg-red-500 text-white rounded font-semibold text-xs px-3 py-1 cursor-pointer transition-colors duration-200 hover:bg-red-600"
            onClick={() => onRechazar(pedido.id)}
          >
            Rechazar
          </button>
          <button
            className="bg-green-600 text-white rounded font-semibold text-xs px-3 py-1 cursor-pointer transition-colors duration-200 hover:bg-green-700"
            onClick={() => onAceptar(pedido.id)}
          >
            Aceptar
          </button>
          <a
            href={`https://wa.me/+549${typeof pedido.user_id === 'object' ? pedido.user_id?.user_data?.phone || '' : ''}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-blue-600 text-white rounded font-semibold text-xs px-3 py-1 flex items-center justify-center hover:bg-blue-700 transition-colors duration-200"
          >
            <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" alt="WhatsApp" className="w-4 h-4 mr-0" />
          </a>
        </div>
        <div className="flex flex-col items-end ml-4">
          <span className="font-semibold text-sm">Total:</span>
          <span className="font-bold text-sm">${total}</span>
        </div>
      </div>
    </div>
  );
};

export default Recibidos;
