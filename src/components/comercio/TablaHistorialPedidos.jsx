import React from 'react';
import { Table, Button } from 'react-bootstrap';

const TablaHistorialPedidos = ({ pedidos, onDetallesClick }) => {
    const getRowClass = (estado) => {
        switch (estado) {
            case 'entregado':
                return 'table-success';
            case 'aceptado':
            case 'listo':
                return 'table-info';
            case 'cancelado':
            case 'rechazado':
                return 'table-danger';
            case 'enviado':
                return 'table-warning';
            default:
                return '';
        }
    };

    return (
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
                {pedidos.map(({ id, estado, user_id, user_locations, pedido_productos }) => (
                    <React.Fragment key={id}>
                        <tr className={getRowClass(estado)}>
                            <td>{id}</td>
                            <td>${pedido_productos.reduce((total, producto) => {
                                return total + producto.productos.precio * producto.cantidad;
                            }, 0).toFixed(2)}</td>
                            <td>{user_id}</td>
                            <td>{user_locations?.address || 'Sin dirección'}</td>
                            <td>{estado}</td>
                            <td>
                                <Button variant="primary" onClick={() => onDetallesClick(pedido_productos)}>
                                    Ver detalles
                                </Button>
                            </td>
                        </tr>
                    </React.Fragment>
                ))}
            </tbody>
        </Table>
    );
};

export default TablaHistorialPedidos;
