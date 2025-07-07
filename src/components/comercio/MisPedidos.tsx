import React, { useState, useEffect, useCallback } from 'react';
import Recibidos from './pedidos/Recibidos';
import Aceptado from './pedidos/Aceptado';
import Listo from './pedidos/Listo';
import supabase from '../../supabase/supabase.config';
// import styles from './styles/MisPedidos.module.css'; // Eliminado

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
  // otros campos relevantes...
}

interface User {
  id: string;
  user_data?: {
    user_type: string;
  };
}

interface MisPedidosProps {
  user: User;
}

const MisPedidos: React.FC<MisPedidosProps> = ({ user }) => {
  const [pedidosPendientes, setPedidosPendientes] = useState<Pedido[]>([]);
  const [pedidosAceptados, setPedidosAceptados] = useState<Pedido[]>([]);
  const [pedidosListos, setPedidosListos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPedidos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: pedidosCompletos, error } = await supabase
        .from('pedidos')
        .select(`
          *,
          pedido_productos(
            *,
            producto_id(*)
          ),
          user_locations(*),
          user_data(phone)
        `)
        .eq('comercio_id', user.id)
        .in('estado', ['pendiente', 'aceptado', 'listo']);

      if (error) {
        setError('Error fetching pedidos');
        console.error('Error fetching pedidos:', error);
        return;
      }

      const pendientes = pedidosCompletos.filter((pedido: Pedido) => pedido.estado === 'pendiente');
      const aceptados = pedidosCompletos.filter((pedido: Pedido) => pedido.estado === 'aceptado');
      const listos = pedidosCompletos.filter((pedido: Pedido) => pedido.estado === 'listo');

      setPedidosPendientes(pendientes);
      setPedidosAceptados(aceptados);
      setPedidosListos(listos);
    } catch (err) {
      setError('Error in fetchPedidos');
      console.error('Error in fetchPedidos:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchPedidos();
      const pedidosSubscription = supabase
        .channel('pedidos_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'pedidos',
            filter: `comercio_id=eq.${user.id}`
          },
          async (payload: any) => {
            if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
              const { data: pedidoCompleto, error } = await supabase
                .from('pedidos')
                .select(`
                  *,
                  pedido_productos(
                    *,
                    producto_id(*)
                  ),
                  user_locations(*),
                  user_id(user_data(phone))
                `)
                .eq('id', payload.new.id)
                .single();
              if (error) {
                console.error('Error al obtener pedido actualizado:', error);
                return;
              }
              if (pedidoCompleto.estado === 'pendiente') {
                setPedidosPendientes(prev => {
                  const exists = prev.some(p => p.id === pedidoCompleto.id);
                  if (!exists) return [...prev, pedidoCompleto];
                  return prev;
                });
              } else if (pedidoCompleto.estado === 'aceptado') {
                setPedidosAceptados(prev => {
                  const exists = prev.some(p => p.id === pedidoCompleto.id);
                  if (!exists) return [...prev, pedidoCompleto];
                  return prev;
                });
                setPedidosPendientes(prev => prev.filter(p => p.id !== pedidoCompleto.id));
              } else if (pedidoCompleto.estado === 'listo') {
                setPedidosListos(prev => {
                  const exists = prev.some(p => p.id === pedidoCompleto.id);
                  if (!exists) return [...prev, pedidoCompleto];
                  return prev;
                });
                setPedidosAceptados(prev => prev.filter(p => p.id !== pedidoCompleto.id));
              } else {
                setPedidosPendientes(prev => prev.filter(p => p.id !== pedidoCompleto.id));
                setPedidosAceptados(prev => prev.filter(p => p.id !== pedidoCompleto.id));
                setPedidosListos(prev => prev.filter(p => p.id !== pedidoCompleto.id));
              }
            } else if (payload.eventType === 'DELETE') {
              setPedidosPendientes(prev => prev.filter(p => p.id !== payload.old.id));
              setPedidosAceptados(prev => prev.filter(p => p.id !== payload.old.id));
              setPedidosListos(prev => prev.filter(p => p.id !== payload.old.id));
            }
          }
        )
        .subscribe();
      return () => {
        pedidosSubscription.unsubscribe();
      };
    }
  }, [user, fetchPedidos]);

  const onAceptar = async (pedidoId: string) => {
    try {
      const { error } = await supabase
        .from('pedidos')
        .update({ estado: 'aceptado' })
        .eq('id', pedidoId);
      if (error) {
        console.error('Error al aceptar el pedido:', error);
        setError('No se pudo aceptar el pedido.');
      }
    } catch (err) {
      console.error('Error al aceptar el pedido:', err);
      setError('Error inesperado al aceptar el pedido.');
    }
  };

  const onRechazar = async (pedidoId: string) => {
    try {
      const { error } = await supabase
        .from('pedidos')
        .update({ estado: 'rechazado' })
        .eq('id', pedidoId);
      if (error) {
        console.error('Error al rechazar el pedido:', error);
        setError('No se pudo rechazar el pedido.');
      }
    } catch (err) {
      console.error('Error al rechazar el pedido:', err);
      setError('Error inesperado al rechazar el pedido.');
    }
  };

  const onCancelar = async (pedidoId: string) => {
    try {
      const { error } = await supabase
        .from('pedidos')
        .update({ estado: 'cancelado' })
        .eq('id', pedidoId);
      if (error) {
        console.error('Error al cancelar el pedido:', error);
        setError('No se pudo cancelar el pedido.');
      }
    } catch (err) {
      console.error('Error al cancelar el pedido:', err);
      setError('Error inesperado al cancelar el pedido.');
    }
  };

  const onListo = async (pedidoId: string) => {
    try {
      const { error } = await supabase
        .from('pedidos')
        .update({ estado: 'listo' })
        .eq('id', pedidoId);
      if (error) {
        console.error('Error al marcar como listo:', error);
        setError('No se pudo marcar el pedido como listo.');
      }
    } catch (err) {
      console.error('Error al marcar como listo:', err);
      setError('Error inesperado al marcar como listo.');
    }
  };

  const onEnviado = async (pedidoId: string) => {
    try {
      const { error } = await supabase
        .from('pedidos')
        .update({ estado: 'enviado' })
        .eq('id', pedidoId);
      if (error) {
        console.error('Error al marcar como enviado:', error);
        setError('No se pudo marcar como enviado.');
      }
    } catch (err) {
      console.error('Error al marcar como enviado:', err);
      setError('Error inesperado al marcar como enviado.');
    }
  };

  if (loading) return <p>Cargando pedidos...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
      <div className="bg-transparent p-0">
        <h3 className="text-lg font-bold text-blue-600 mb-2">Pedidos Pendientes</h3>
        {pedidosPendientes.length === 0 ? (
          <p>No hay pedidos pendientes.</p>
        ) : (
          pedidosPendientes.map(pedido => (
            <Recibidos
              key={pedido.id}
              pedido={pedido}
              onAceptar={() => onAceptar(pedido.id)}
              onRechazar={() => onRechazar(pedido.id)}
            />
          ))
        )}
      </div>
      <div className="bg-transparent p-0">
        <h3 className="text-lg font-bold text-blue-600 mb-2">Pedidos Aceptados</h3>
        {pedidosAceptados.length === 0 ? (
          <p>No hay pedidos aceptados.</p>
        ) : (
          pedidosAceptados.map(pedido => (
            <Aceptado
              key={pedido.id}
              pedido={pedido}
              onCancelar={() => onCancelar(pedido.id)}
              onListo={() => onListo(pedido.id)}
            />
          ))
        )}
      </div>
      <div className="bg-transparent p-0">
        <h3 className="text-lg font-bold text-blue-600 mb-2">Pedidos Listos</h3>
        {pedidosListos.length === 0 ? (
          <p>No hay pedidos listos.</p>
        ) : (
          pedidosListos.map(pedido => (
            <Listo
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
