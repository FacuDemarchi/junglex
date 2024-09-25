import React, { useEffect, useState } from 'react';
import { Card } from 'react-bootstrap';
import supabase from '../../supabase/supabase.config';

const PedidoCard = ({ user, pedido, productos }) => {
    const [address, setAddress] = useState('');

    useEffect(() => {
        if (user && pedido) {
            async function BuscarDireccion() {
                const { data, error } = await supabase
                    .from('user_locations')
                    .select('address')
                    .eq('id', pedido.user_location);

                if (error) {
                    console.error('Error fetching address:', error);
                    return;
                }

                if (data) {
                    setAddress(data);
                } else {
                    setAddress('Dirección no disponible');
                }
            }

            BuscarDireccion();
        }
    }, [user, pedido]);

    return (
        <Card className="mb-3">
            <Card.Body>
                <Card.Title>Pedido ID: {pedido.id}</Card.Title>
                <Card.Subtitle className="mb-2 text-muted">Usuario: {pedido.usuario_id}</Card.Subtitle>
                <Card.Text>
                    <strong>Descripción:</strong> {pedido.descripcion} <br />
                    <strong>Dirección de Destino:</strong> {address}
                </Card.Text>
                <Card.Text>
                    <strong>Productos:</strong>
                    {productos.map(producto => (
                        <div key={producto.producto_id}>
                            Producto ID: {producto.producto_id}, Cantidad: {producto.cantidad}, Precio Unitario: {producto.precio_unitario}
                        </div>
                    ))}
                </Card.Text>
            </Card.Body>
        </Card>
    );
};

export default PedidoCard;
