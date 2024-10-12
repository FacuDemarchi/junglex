import React, { useState, useEffect } from 'react';
import PedidoCardAceptado from './PedidoCardAceptado';
import PedidoCardRechazado from './PedidoCardRechazado';
import supabase from '../../supabase/supabase.config';

const MisPedidos = ({ user }) => {
    const [pedidosPendientes, setPedidosPendientes] = useState([]);
    const [pedidosAceptados, setPedidosAceptados] = useState([]);
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
                    .in('estado', ['pendiente', 'aceptado']);

                if (error) {
                    setError('Error fetching pedidos');
                    console.error('Error fetching pedidos:', error);
                    return;
                }

                const pendientes = pedidosCompletos.filter(pedido => pedido.estado === 'pendiente');
                const aceptados = pedidosCompletos.filter(pedido => pedido.estado === 'aceptado');

                setPedidosPendientes(pendientes);
                setPedidosAceptados(aceptados);
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

    // Funciones para manejar cambios de estado en los pedidos
    const onAceptar = async (pedidoId) => {
        try {
            const { error } = await supabase
                .from('pedidos')
                .update({ estado: 'aceptado' })
                .eq('id', pedidoId);
            if (error) throw error;
            setPedidosPendientes(pedidosPendientes.filter(pedido => pedido.id !== pedidoId));
            const pedidoAceptado = pedidosPendientes.find(pedido => pedido.id === pedidoId);
            setPedidosAceptados([...pedidosAceptados, pedidoAceptado]);
        } catch (err) {
            console.error('Error accepting pedido:', err);
        }
    };

    const onRechazar = async (pedidoId) => {
        try {
            const { error } = await supabase
                .from('pedidos')
                .update({ estado: 'rechazado' })
                .eq('id', pedidoId);
            if (error) throw error;
            setPedidosPendientes(pedidosPendientes.filter(pedido => pedido.id !== pedidoId));
        } catch (err) {
            console.error('Error rejecting pedido:', err);
        }
    };

    const onCancelar = async (pedidoId) => {
        try {
            const { error } = await supabase
                .from('pedidos')
                .update({ estado: 'cancelado' })
                .eq('id', pedidoId);
            if (error) throw error;
            setPedidosAceptados(pedidosAceptados.filter(pedido => pedido.id !== pedidoId));
        } catch (err) {
            console.error('Error canceling pedido:', err);
        }
    };

    const onListo = async (pedidoId) => {
        try {
            const { error } = await supabase
                .from('pedidos')
                .update({ estado: 'listo' })
                .eq('id', pedidoId);
            if (error) throw error;
            // const pedidoListo = pedidosAceptados.find(pedido => pedido.id === pedidoId);
            // Aquí podrías hacer algo con el pedido que está listo
        } catch (err) {
            console.error('Error marking pedido as listo:', err);
        }
    };

    const onEnviado = async (pedidoId) => {
        try {
            const { error } = await supabase
                .from('pedidos')
                .update({ estado: 'enviado' })
                .eq('id', pedidoId);
            if (error) throw error;
            setPedidosAceptados(pedidosAceptados.filter(pedido => pedido.id !== pedidoId));
        } catch (err) {
            console.error('Error marking pedido as enviado:', err);
        }
    };

    // console.log('pedidos pendientes: ', pedidosPendientes);
    // console.log('pedidos aceptados: ', pedidosAceptados);

    if (loading) return <p>Cargando pedidos...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div>
            <div className="row">
                <div className="col-md-6">
                    <h3>Pedidos Pendientes</h3>
                    {pedidosPendientes.length === 0 ? (
                        <p>No hay pedidos pendientes.</p>
                    ) : (
                        pedidosPendientes.map(pedido => (
                            <PedidoCardAceptado 
                                key={pedido.id}  
                                pedido={pedido}
                                onAceptar={() => onAceptar(pedido.id)}
                                onRechazar={() => onRechazar(pedido.id)}
                            />
                        ))
                    )}
                </div>
                <div className="col-md-6">
                    <h3>Pedidos Aceptados</h3>
                    {pedidosAceptados.length === 0 ? (
                        <p>No hay pedidos aceptados.</p>
                    ) : (
                        pedidosAceptados.map(pedido => (
                            <PedidoCardRechazado
                                key={pedido.id}
                                pedido={pedido}
                                onCancelar={() => onCancelar(pedido.id)}
                                onListo={() => onListo(pedido.id)}
                                onEnviado={() => onEnviado(pedido.id)}
                            />
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default MisPedidos;
