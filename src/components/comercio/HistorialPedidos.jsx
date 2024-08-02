import React, { useState, useEffect } from 'react';
import supabase from '../../supabase/supabase.config';

const HistorialPedidos = ({ user }) => {
    const [historialPedidos, setHistorialPedidos] = useState([]);

    useEffect(() => {
        if (user) {
            async function buscarHistorialPedidos() {
                const { data, error } = await supabase
                    .from('pedidos')
                    .select()
                    .eq('comercio_id', user.id)
                    .in('estado', ['enviado', 'entregado', 'cancelado']); // Filtra pedidos por estado

                if (error) {
                    console.error('Error al intentar traer el historial de pedidos del usuario:', error);
                } else {
                    setHistorialPedidos(data);
                }
            }
            buscarHistorialPedidos();
        }
    }, [user]);

    return (
        <div>
            <p>Historial de pedidos en estado enviado, entregado o cancelado</p>
            <ul>
                {historialPedidos.map((pedido) => (
                    <li key={pedido.id}>{pedido.descripcion}</li> // Ajusta el campo de descripción según la estructura de tus datos
                ))}
            </ul>
        </div>
    );
};

export default HistorialPedidos;
