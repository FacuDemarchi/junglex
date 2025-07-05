// components/HistorialPedidos.js
import React, { useState, useEffect } from 'react';
import supabase from '../../supabase/supabase.config';
import DetallesModal from './DetallesModal';

// Tipos auxiliares
interface User {
    id: string;
    user_data?: {
        user_type: string;
    };
}

interface Producto {
    nombre: string;
    precio: number;
}

interface PedidoProducto {
    cantidad: number;
    productos: Producto;
}

interface UserLocation {
    address: string;
}

interface Pedido {
    id: string;
    estado: string;
    user_id: string;
    user_locations?: UserLocation;
    pedido_productos: PedidoProducto[];
}

interface HistorialPedidosProps {
    user: User;
}

const estadoColor: Record<string, string> = {
    entregado: 'bg-success/20 text-success-700',
    aceptado: 'bg-info/20 text-info-700',
    listo: 'bg-info/20 text-info-700',
    cancelado: 'bg-danger/20 text-danger-700',
    rechazado: 'bg-danger/20 text-danger-700',
    enviado: 'bg-warning/20 text-warning-700',
};

const HistorialPedidos: React.FC<HistorialPedidosProps> = ({ user }) => {
    const [historialPedidos, setHistorialPedidos] = useState<Pedido[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [detalles, setDetalles] = useState<PedidoProducto[] | null>(null);
    const [mostrarDetalles, setMostrarDetalles] = useState<boolean>(false);

    useEffect(() => {
        const buscarHistorialPedidos = async () => {
            if (!user) return;

            const { data, error } = await supabase
                .from('pedidos')
                .select(`
                    id,
                    estado,
                    user_id,
                    user_locations(address),
                    pedido_productos(cantidad, productos(precio, nombre))
                `)
                .eq('comercio_id', user.id);

            if (error) {
                setError('Error al intentar traer el historial de pedidos');
                console.error('Error al intentar traer el historial de pedidos del usuario:', error);
            } else {
                // Adaptar el formato de los datos para que user_locations sea un objeto y no un array
                const pedidosAdaptados = (data as any[]).map((pedido) => ({
                    ...pedido,
                    user_locations: Array.isArray(pedido.user_locations) ? pedido.user_locations[0] : pedido.user_locations,
                })) as Pedido[];
                setHistorialPedidos(pedidosAdaptados);
            }
        };

        buscarHistorialPedidos();
    }, [user]);

    const handleDetallesClick = (pedido_productos: PedidoProducto[]) => {
        setDetalles(pedido_productos);
        setMostrarDetalles(true);
    };

    const handleClose = () => {
        setMostrarDetalles(false);
        setDetalles(null);
    };

    const getRowClass = (estado: string) => {
        return estadoColor[estado] || '';
    };

    // Mapear colores de estado a clases Tailwind
    const estadoBadge: Record<string, string> = {
        entregado: 'bg-success text-white',
        aceptado: 'bg-info text-white',
        listo: 'bg-info text-white',
        cancelado: 'bg-danger text-white',
        rechazado: 'bg-danger text-white',
        enviado: 'bg-warning text-dark',
    };

    return (
        <div className="w-full p-0">
            <h3 className="text-2xl font-bold mb-6 text-primary">Historial de Pedidos</h3>
            {error && (
                <div className="mb-4 p-3 rounded bg-danger/10 text-danger-700 border border-danger-200">
                    {error}
                </div>
            )}
            <div className="overflow-x-auto">
                <table className="w-full text-xs bg-white divide-y divide-light">
                    <thead>
                        <tr className="bg-primary-light text-white">
                            <th className="py-3 px-4 text-left font-semibold tracking-wide">Total del Pedido</th>
                            <th className="py-3 px-4 text-left font-semibold tracking-wide">Dirección de Destino</th>
                            <th className="py-3 px-4 text-left font-semibold tracking-wide">Estado</th>
                            <th className="py-3 px-4 text-left font-semibold tracking-wide">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-light">
                        {[...historialPedidos]
                            .sort((a, b) => (b.id > a.id ? 1 : b.id < a.id ? -1 : 0))
                            .map(({ id, estado, user_locations, pedido_productos }) => (
                                <tr key={id} className={getRowClass(estado) + ' transition hover:bg-primary/10'}>
                                    <td className="py-3 px-4 font-semibold text-primary-dark">
                                        ${pedido_productos.reduce((total, producto) => {
                                            return total + producto.productos.precio * producto.cantidad;
                                        }, 0).toFixed(2)}
                                    </td>
                                    <td className="py-3 px-4 text-dark/80">{user_locations?.address || 'Sin dirección'}</td>
                                    <td className="py-3 px-4 capitalize">
                                        <span className={`inline-block px-2 py-1 rounded font-semibold text-xs border border-light/80 ${estadoBadge[estado] || 'bg-light text-dark/80'}`}>
                                            {estado}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4">
                                        <button
                                            className="bg-accent hover:bg-accent/90 text-white font-semibold py-1.5 px-4 rounded-lg shadow-md transition focus:outline-none focus:ring-2 focus:ring-accent/50"
                                            onClick={() => handleDetallesClick(pedido_productos)}
                                        >
                                            Ver detalles
                                        </button>
                                    </td>
                                </tr>
                            ))}
                    </tbody>
                </table>
            </div>
            <DetallesModal
                detalles={detalles}
                mostrar={mostrarDetalles}
                onClose={handleClose}
            />
        </div>
    );
};

export default HistorialPedidos;
