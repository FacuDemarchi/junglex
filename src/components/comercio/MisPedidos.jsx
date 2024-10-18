import React, { useState, useEffect } from 'react';
import PedidoCardAceptado from './PedidoCardAceptado';
import PedidoCardRecibido from './PedidoCardRecibido';
import PedidoCardListo from './PedidoCardListo';
import supabase from '../../supabase/supabase.config';

const MisPedidos = ({ user }) => {
    const [pedidosPendientes, setPedidosPendientes] = useState([]);
    const [pedidosAceptados, setPedidosAceptados] = useState([]);
    const [pedidosListos, setPedidosListos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPedidos = async () => {
            setLoading(true);
            setError(null);
            try {
                const { data: pedidosCompletos, error } = await supabase
                    .from('pedidos')
                    .select(`
                        *,
                        pedido_productos(
                            *,
                            producto_id(nombre)
                        ),
                        user_locations(*)
                    `)
                    .eq('comercio_id', user.id)
                    .in('estado', ['pendiente', 'aceptado', 'listo']);

                if (error) {
                    setError('Error fetching pedidos');
                    console.error('Error fetching pedidos:', error);
                    return;
                }

                const pendientes = pedidosCompletos.filter(pedido => pedido.estado === 'pendiente');
                const aceptados = pedidosCompletos.filter(pedido => pedido.estado === 'aceptado');
                const listos = pedidosCompletos.filter(pedido => pedido.estado === 'listo');

                setPedidosPendientes(pendientes);
                setPedidosAceptados(aceptados);
                setPedidosListos(listos);
            } catch (err) {
                setError('Error in fetchPedidos');
                console.error('Error in fetchPedidos:', err);
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchPedidos();
        }
    }, [user]);

    const onAceptar = async (pedidoId) => {
        // Maneja la aceptación de un pedido
    };

    const onRechazar = async (pedidoId) => {
        // Maneja el rechazo de un pedido
    };

    const onCancelar = async (pedidoId) => {
        // Maneja la cancelación de un pedido
    };

    const onListo = async (pedidoId) => {
        // Maneja el cambio de estado a "listo"
    };

    const onEnviado = async (pedidoId) => {
        // Maneja el cambio de estado a "enviado"
    };

    if (loading) return <p>Cargando pedidos...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div className="row">
            <div className="col-md-4">
                <h3>Pedidos Pendientes</h3>
                {pedidosPendientes.length === 0 ? (
                    <p>No hay pedidos pendientes.</p>
                ) : (
                    pedidosPendientes.map(pedido => (
                        <PedidoCardRecibido
                            key={pedido.id}
                            pedido={pedido}
                            onAceptar={() => onAceptar(pedido.id)}
                            onRechazar={() => onRechazar(pedido.id)}
                        />
                    ))
                )}
            </div>
            <div className="col-md-4">
                <h3>Pedidos Aceptados</h3>
                {pedidosAceptados.length === 0 ? (
                    <p>No hay pedidos aceptados.</p>
                ) : (
                    pedidosAceptados.map(pedido => (
                        <PedidoCardAceptado
                            key={pedido.id}
                            pedido={pedido}
                            onCancelar={() => onCancelar(pedido.id)}
                            onListo={() => onListo(pedido.id)}
                        />
                    ))
                )}
            </div>
            <div className="col-md-4">
                <h3>Pedidos Listos</h3>
                {pedidosListos.length === 0 ? (
                    <p>No hay pedidos listos.</p>
                ) : (
                    pedidosListos.map(pedido => (
                        <PedidoCardListo
                            key={pedido.id}
                            pedido={pedido}
                            onEnviado={() => onEnviado(pedido.id)}
                        />
                    ))
                )}
            </div>
        </div>
    );
};

export default MisPedidos;
