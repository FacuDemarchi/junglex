// components/HistorialPedidos.js
import React, { useState, useEffect } from 'react';
import { Alert } from 'react-bootstrap';
import supabase from '../../supabase/supabase.config';
import TablaHistorialPedidos from './TablaHistorialPedidos';
import DetallesModal from './DetallesModal';

const HistorialPedidos = ({ user }) => {
    const [historialPedidos, setHistorialPedidos] = useState([]);
    const [error, setError] = useState(null);
    const [detalles, setDetalles] = useState(null);
    const [mostrarDetalles, setMostrarDetalles] = useState(false);

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
                .eq('comercio_id', user.id)
                .in('estado', ['enviado', 'entregado', 'cancelado']);

            if (error) {
                setError('Error al intentar traer el historial de pedidos');
                console.error('Error al intentar traer el historial de pedidos del usuario:', error);
            } else {
                setHistorialPedidos(data);
            }
        };

        buscarHistorialPedidos();
    }, [user]);

    const handleDetallesClick = (pedidoDetalles) => {
        setDetalles(pedidoDetalles);
        setMostrarDetalles(true);
    };

    const handleClose = () => {
        setMostrarDetalles(false);
        setDetalles(null);
    };

    if (error) {
        return <Alert variant="danger">{error}</Alert>;
    }

    return (
        <div>
            <h3>Historial de Pedidos</h3>
            <TablaHistorialPedidos
                pedidos={historialPedidos}
                onDetallesClick={handleDetallesClick}
            />
            <DetallesModal
                detalles={detalles}
                mostrar={mostrarDetalles}
                onClose={handleClose}
            />
        </div>
    );
};

export default HistorialPedidos;
