import React, { useEffect, useState } from 'react';
import supabase from '../../supabase/supabase.config';

const PedidoCardAceptado = ({ pedido, onCancelar, onListo }) => {
    const [phone, setPhone] = useState('');
    const [ubicacion, setUbicacion] = useState(null);
    const total = (pedido.pedido_productos.reduce((acc, prod) => acc + (prod.cantidad * prod.precio_unitario), 0)).toFixed(2);
    
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
        <div className="card border-success mb-3">
            <div className="card-header">
                <h5 className='text-success'>{ubicacion?.address}</h5>
                <a 
                    href={`https://www.google.com/maps/@${ubicacion?.latitude},${ubicacion?.longitude},15z`} 
                    target="_blank" 
                    rel="noopener noreferrer">
                    Ver ubicación
                </a>
            </div>
            <div className="card-body text-success">
                <table className="table">
                    <thead>
                        <tr>
                            <th className='text-success'>Producto</th>
                            <th className='text-success'>Cantidad</th>
                            <th className='text-success'>Precio</th>
                            <th className='text-success'>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pedido.pedido_productos.map(prod => (
                            <tr key={prod.id}>
                                <td className='text-success'>{prod.producto_id.nombre}</td>
                                <td className='text-success'>{prod.cantidad}</td>
                                <td className='text-success'>{prod.precio_unitario}</td>
                                <td className='text-success'>{(prod.cantidad * prod.precio_unitario.toFixed(2))}</td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td className='text-success' colSpan="3"><strong>Total:</strong></td>
                            <td className='text-success'>{total}</td>
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

export default PedidoCardAceptado;
