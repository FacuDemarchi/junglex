import React, { useState, useEffect } from 'react';
import { Table } from 'react-bootstrap';
import supabase from '../../supabase/supabase.config';

const MisPedidos = ({ user }) => {
    const [pedidosPendientes, setPedidosPendientes] = useState([]);
    const [pedidosAceptados, setPedidosAceptados] = useState([]);

    useEffect(() => {
        if (user) {
            async function buscarPedidos() {
                const { data, error } = await supabase
                    .from('pedidos')
                    .select('id, descripcion, estado, usuario_id, direccion_destino')
                    .eq('comercio_id', user.id)
                    .in('estado', ['pendiente', 'aceptado']);

                if (error) {
                    console.error('Error al intentar traer los pedidos del usuario:', error);
                } else {
                    const pendientes = data.filter(pedido => pedido.estado === 'pendiente');
                    const aceptados = data.filter(pedido => pedido.estado === 'aceptado');
                    setPedidosPendientes(pendientes);
                    setPedidosAceptados(aceptados);
                }
            }
            buscarPedidos();
        }
    }, [user]);

    return (
        <div>
            <div className="row">
                <div className="col-md-6">
                    <h3>Pedidos Pendientes</h3>
                    <Table striped bordered hover>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Descripción</th>
                                <th>Usuario</th>
                                <th>Dirección de Destino</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pedidosPendientes.map((pedido) => (
                                <tr key={pedido.id}>
                                    <td>{pedido.id}</td>
                                    <td>{pedido.descripcion}</td>
                                    <td>{pedido.usuario_id}</td>
                                    <td>{pedido.direccion_destino}</td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </div>
                <div className="col-md-6">
                    <h3>Pedidos Aceptados</h3>
                    <Table striped bordered hover>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Descripción</th>
                                <th>Usuario</th>
                                <th>Dirección de Destino</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pedidosAceptados.map((pedido) => (
                                <tr key={pedido.id}>
                                    <td>{pedido.id}</td>
                                    <td>{pedido.descripcion}</td>
                                    <td>{pedido.usuario_id}</td>
                                    <td>{pedido.direccion_destino}</td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </div>
            </div>
        </div>
    );
};

export default MisPedidos;
