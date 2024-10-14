import React, { useState, useEffect } from 'react';
import { Table, Alert, Button, Collapse } from 'react-bootstrap';
import supabase from '../../supabase/supabase.config';
import './HistorialPedidos.css';

const HistorialPedidos = ({ user }) => {
    const [historialPedidos, setHistorialPedidos] = useState([]);
    const [error, setError] = useState(null);
    const [detallesVisibles, setDetallesVisibles] = useState({});

    useEffect(() => {
        if (!user) return;

        const buscarHistorialPedidos = async () => {
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

    // Calcular el total del pedido
    const calcularTotal = (pedido_productos) => {
        return pedido_productos.reduce((total, producto) => {
            return total + producto.productos.precio * producto.cantidad;
        }, 0);
    };

    // Mostrar/ocultar detalles del pedido
    const toggleDetalles = (id) => {
        setDetallesVisibles((prev) => ({
            ...prev,
            [id]: !prev[id], // Alternar entre visible o no visible
        }));
    };

    const getRowClass = (estado) => {
        switch (estado) {
            case 'enviado':
                return 'tr-enviado';
            case 'entregado':
                return 'tr-entregado';
            case 'cancelado':
                return 'tr-cancelado';
            default:
                return '';
        }
    };

    if (error) {
        return <Alert variant="danger">{error}</Alert>;
    }

    return (
        <div>
            <h3>Historial de Pedidos</h3>
            {historialPedidos.length > 0 ? (
                <Table striped bordered hover>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Total del Pedido</th>
                            <th>Usuario</th>
                            <th>Dirección de Destino</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {historialPedidos.map(({ id, estado, user_id, user_locations, pedido_productos }) => (
                            <React.Fragment key={id}>
                                <tr className={getRowClass(estado)} onClick={() => toggleDetalles(id)}>
                                    <td>{id}</td>
                                    <td>${calcularTotal(pedido_productos).toFixed(2)}</td>
                                    <td>{user_id}</td>
                                    <td>{user_locations?.address || 'Sin dirección'}</td>
                                    <td>{estado}</td>
                                    <td>
                                        <Button variant="primary" onClick={() => toggleDetalles(id)}>
                                            {detallesVisibles[id] ? 'Ocultar detalles' : 'Ver detalles'}
                                        </Button>
                                    </td>
                                </tr>
                                <tr>
                                    <td colSpan="6" className="p-0">
                                        <Collapse in={detallesVisibles[id]}>
                                            <div className="detalles-pedido p-3">
                                                <h5>Detalles del pedido:</h5>
                                                <ul>
                                                    {pedido_productos.map(({ productos, cantidad }, idx) => (
                                                        <li key={idx}>
                                                            {cantidad}x {productos.nombre} - ${productos.precio.toFixed(2)}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </Collapse>
                                    </td>
                                </tr>
                            </React.Fragment>
                        ))}
                    </tbody>
                </Table>
            ) : (
                <p>No hay pedidos en el historial.</p>
            )}
        </div>
    );
};

export default HistorialPedidos;
    