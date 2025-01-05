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
        try {
            const { error } = await supabase
                .from('pedidos')
                .update({ estado: 'aceptado' })
                .eq('id', pedidoId);
    
            if (error) {
                console.error('Error al aceptar el pedido:', error);
                setError('No se pudo aceptar el pedido.');
                return;
            }
    
            // Actualizar el estado localmente
            setPedidosPendientes(pedidosPendientes.filter(pedido => pedido.id !== pedidoId));
            const pedidoAceptado = pedidosPendientes.find(pedido => pedido.id === pedidoId);
            setPedidosAceptados([...pedidosAceptados, { ...pedidoAceptado, estado: 'aceptado' }]);
        } catch (err) {
            console.error('Error al aceptar el pedido:', err);
            setError('Error inesperado al aceptar el pedido.');
        }
    };
    
    const onRechazar = async (pedidoId) => {
        try {
            const { error } = await supabase
                .from('pedidos')
                .update({ estado: 'rechazado' })
                .eq('id', pedidoId);
    
            if (error) {
                console.error('Error al rechazar el pedido:', error);
                setError('No se pudo rechazar el pedido.');
                return;
            }
    
            // Actualizar el estado localmente
            setPedidosPendientes(pedidosPendientes.filter(pedido => pedido.id !== pedidoId));
        } catch (err) {
            console.error('Error al rechazar el pedido:', err);
            setError('Error inesperado al rechazar el pedido.');
        }
    };
    
    const onCancelar = async (pedidoId) => {
        try {
            const { error } = await supabase
                .from('pedidos')
                .update({ estado: 'cancelado' })
                .eq('id', pedidoId);
    
            if (error) {
                console.error('Error al cancelar el pedido:', error);
                setError('No se pudo cancelar el pedido.');
                return;
            }
    
            // Actualizar el estado localmente
            setPedidosAceptados(pedidosAceptados.filter(pedido => pedido.id !== pedidoId));
        } catch (err) {
            console.error('Error al cancelar el pedido:', err);
            setError('Error inesperado al cancelar el pedido.');
        }
    };
    
    const onListo = async (pedidoId) => {
        try {
            const { error } = await supabase
                .from('pedidos')
                .update({ estado: 'listo' })
                .eq('id', pedidoId);
    
            if (error) {
                console.error('Error al marcar como listo:', error);
                setError('No se pudo marcar el pedido como listo.');
                return;
            }
    
            // Actualizar el estado localmente
            setPedidosAceptados(pedidosAceptados.filter(pedido => pedido.id !== pedidoId));
            const pedidoListo = pedidosAceptados.find(pedido => pedido.id === pedidoId);
            setPedidosListos([...pedidosListos, { ...pedidoListo, estado: 'listo' }]);
        } catch (err) {
            console.error('Error al marcar como listo:', err);
            setError('Error inesperado al marcar como listo.');
        }
    };
    
    const onEnviado = async (pedidoId) => {
        try {
            const { error } = await supabase
                .from('pedidos')
                .update({ estado: 'enviado' })
                .eq('id', pedidoId);
    
            if (error) {
                console.error('Error al marcar como enviado:', error);
                setError('No se pudo marcar el pedido como enviado.');
                return;
            }
    
            // Actualizar el estado localmente
            setPedidosListos(pedidosListos.filter(pedido => pedido.id !== pedidoId));
        } catch (err) {
            console.error('Error al marcar como enviado:', err);
            setError('Error inesperado al marcar como enviado.');
        }
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
