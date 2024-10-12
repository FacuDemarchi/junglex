import React, { useEffect, useState } from 'react';
import supabase from '../../supabase/supabase.config';

const PedidoCardRechazado = ({ pedido, onCancelar, onListo, onEnviado }) => {
    const [phone, setPhone] = useState('');
    const [ubicacion, setUbicacion] = useState(null);
    
    const total = pedido.pedido_productos.reduce((sum, prod) => sum + prod.cantidad * prod.precio_unitario, 0);

    useEffect(() => {
        const fetchData = async () => {
            if (pedido) {
                const { data: userData, error: userError } = await supabase
                    .from('user_data')
                    .select('phone')
                    .eq('user_id', pedido.user_id)

                if (userError) {
                    console.error('Error fetching phone:', userError);
                    return;
                }
                setPhone(userData.phone);
                setUbicacion(pedido.user_locations); 
            }
        };
        
        fetchData();
    }, [pedido]);

    return (
        <div className="card mb-3">
            <div className="card-header">
                <h5>{ubicacion?.address}</h5>
                <a 
                    href={`https://www.google.com/maps/@${ubicacion?.latitude},${ubicacion?.longitude},15z`} 
                    target="_blank" 
                    rel="noopener noreferrer">
                    Ver ubicación
                </a>
            </div>
            <div className="card-body">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Producto</th>
                            <th>Cantidad</th>
                            <th>Precio</th>
                            <th>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pedido.pedido_productos.map(prod => (
                            <tr key={prod.id}>
                                <td>{prod.producto_id.nombre}</td>
                                <td>{prod.cantidad}</td>
                                <td>{prod.precio_unitario}</td>
                                <td>{prod.cantidad * prod.precio_unitario}</td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colSpan="3"><strong>Total:</strong></td>
                            <td>{total}</td>
                        </tr>
                    </tfoot>
                </table>
            </div>
            <div className="d-flex justify-content-between mt-3">
                <button className="btn btn-danger" onClick={() => onCancelar(pedido.id)}>
                    Cancelar
                </button>
                <button className="btn btn-warning" onClick={() => onListo(pedido.id)}>
                    Listo
                </button>
                <button className="btn btn-info" onClick={() => onEnviado(pedido.id)}>
                    Enviado
                </button>
                <a 
                    href={`https://wa.me/+549${phone}`} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="btn btn-primary">
                    WhatsApp
                </a>
            </div>
        </div>
    );
};

export default PedidoCardRechazado;
