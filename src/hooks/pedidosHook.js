import { useEffect } from 'react';
import supabase from '../supabase/supabase.config';

export function pedidosHook(comercioId, setPedidos) {
  useEffect(() => {
    // Suscribirse a cambios en la tabla pedidos
    const subscription = supabase
      .channel('pedidos-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT', // 'INSERT', 'UPDATE', 'DELETE' o '*' para todos
          schema: 'public',
          table: 'pedidos',
          filter: `comercio_id=eq.${comercioId}` // filtra por el comercio
        },
        (payload) => {
          // Si el evento es un nuevo pedido, lo agregamos al listado
          if (payload.eventType === 'INSERT' && payload.new) {
            setPedidos((prev) => [...prev, payload.new]);
          }
        }
      )
      .subscribe();

    // Limpieza al desmontar
    return () => {
      supabase.removeChannel(subscription);
    };
  }, [comercioId, setPedidos]);
}
