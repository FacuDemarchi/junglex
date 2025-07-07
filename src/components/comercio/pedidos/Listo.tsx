import React, { useEffect, useState } from 'react';
// import styles from './styles/Listo.module.css'; // Eliminado

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

interface ListoProps {
  pedido: Pedido;
  onEnviado: (id: string) => void;
}

const Listo: React.FC<ListoProps> = ({ pedido, onEnviado }) => {
  const [ubicacion, setUbicacion] = useState<UserLocation | null>(null);
  const total = (pedido.pedido_productos.reduce((acc, prod) => acc + (prod.cantidad * prod.precio_unitario), 0)).toFixed(2);

  useEffect(() => {
    setUbicacion(pedido.user_locations);
  }, [pedido]);

  return (
    <div className="bg-gray-100 rounded-lg shadow-md mb-2 p-3 transition-colors duration-200 text-sm hover:bg-gray-200">
      <div className="flex justify-between items-center font-semibold text-blue-500 mb-1 text-base">
        <span className="text-gray-700 text-sm font-medium">{ubicacion?.address || 'Ubicación no disponible'}</span>
        <a
          href={`https://www.google.com/maps/@${ubicacion?.latitude},${ubicacion?.longitude},15z`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-blue-500 hover:underline"
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
      <div className="flex justify-between items-center mt-1 text-sm">
        <div className="flex gap-1">
          <button
            className="bg-blue-500 text-white rounded font-semibold text-xs px-3 py-1 cursor-pointer transition-colors duration-200 hover:bg-blue-600"
            onClick={() => onEnviado(pedido.id)}
          >
            Enviar
          </button>
          <a
            href={`https://wa.me/+549${typeof pedido.user_id === 'object' ? pedido.user_id?.user_data?.phone || '' : ''}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-green-600 text-white rounded font-semibold text-xs px-3 py-1 flex items-center justify-center hover:bg-green-700 transition-colors duration-200"
          >
            <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" alt="WhatsApp" className="w-4 h-4 mr-0" />
          </a>
        </div>
        <span className="font-medium">Total: ${total}</span>
      </div>
    </div>
  );
};

export default Listo;
