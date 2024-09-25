import React, { useState, useEffect } from 'react';
import { Table } from 'react-bootstrap';
import supabase from '../../supabase/supabase.config';

const HistorialPedidos = ({ user }) => {
    const [historialPedidos, setHistorialPedidos] = useState([]);

    useEffect(() => {
        if (user) {
            async function buscarHistorialPedidos() {
                const { data, error } = await supabase
                    .from('pedidos')
                    .select('id, descripcion, estado, usuario_id, direccion_destino')
                    .eq('comercio_id', user.id)
                    .in('estado', ['enviado', 'entregado', 'cancelado']);

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
            <h3>Historial de Pedidos</h3>
            <Table striped bordered hover>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Descripción</th>
                        <th>Usuario</th>
                        <th>Dirección de Destino</th>
                        <th>Estado</th>
                    </tr>
                </thead>
                <tbody>
                    {historialPedidos.map((pedido) => (
                        <tr key={pedido.id}>
                            <td>{pedido.id}</td>
                            <td>{pedido.descripcion}</td>
                            <td>{pedido.usuario_id}</td>
                            <td>{pedido.direccion_destino}</td>
                            <td>{pedido.estado}</td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </div>
    );
};

export default HistorialPedidos;
