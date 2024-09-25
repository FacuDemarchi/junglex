import React, { useState, useEffect } from 'react';
import PedidoCard from './PedidoCard';
import supabase from '../../supabase/supabase.config';

const MisPedidos = ({ user }) => {
    const [pedidosPendientes, setPedidosPendientes] = useState([]);
    const [pedidosAceptados, setPedidosAceptados] = useState([]);
    const [productosPedidos, setProductosPedidos] = useState({});

    useEffect(() => {
        if (user) {
            async function buscarPedidos() {
                const { data, error } = await supabase
                    .from('pedidos')
                    .select()
                    .eq('comercio_id', user.id)
                    .in('estado', ['pendiente', 'aceptado']);

                if (error) {
                    console.error('Error al intentar traer los pedidos del usuario:', error);
                } else {
                    const pendientes = data.filter(pedido => pedido.estado === 'pendiente');
                    const aceptados = data.filter(pedido => pedido.estado === 'aceptado');
                    setPedidosPendientes(pendientes);
                    setPedidosAceptados(aceptados);
                    
                    // Buscar productos para todos los pedidos
                    const pedidoIds = data.map(pedido => pedido.id);
                    if (pedidoIds.length > 0) {
                        const { data: productosData, error: productosError } = await supabase
                            .from('pedido_productos')
                            .select()
                            .in('pedido_id', pedidoIds);

                        if (productosError) {
                            console.error('Error al intentar traer los productos de los pedidos:', productosError);
                        } else {
                            const productosPorPedido = productosData.reduce((acc, producto) => {
                                if (!acc[producto.pedido_id]) {
                                    acc[producto.pedido_id] = [];
                                }
                                acc[producto.pedido_id].push(producto);
                                return acc;
                            }, {});
                            setProductosPedidos(productosPorPedido);
                        }
                    }
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
                    {pedidosPendientes.map(pedido => (
                        <PedidoCard 
                            key={pedido.id}  
                            user={user}
                            pedido={pedido} 
                            productos={productosPedidos[pedido.id] || []} 
                        />
                    ))}
                </div>
                <div className="col-md-6">
                    <h3>Pedidos Aceptados</h3>
                    {pedidosAceptados.map(pedido => (
                        <PedidoCard 
                            key={pedido.id} 
                            user={user}
                            pedido={pedido} 
                            productos={productosPedidos[pedido.id] || []} 
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default MisPedidos;
