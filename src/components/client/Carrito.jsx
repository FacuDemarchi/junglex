import React, { useEffect, useState } from 'react';
import CantidadControl from './CantidadControl';
import supabase from '../../supabase/supabase.config';
import CryptoPayment from './CryptoPayment';
import './styles/Carrito.css'

const Carrito = ({ productos, comercios, selectedLocation, incrementarCantidad, decrementarCantidad, user, resetCantidades }) => {
    const [productosEnCarrito, setProductosEnCarrito] = useState([]);

    useEffect(() => {
        const productosFiltrados = productos.filter(producto => producto.cantidad > 0);
        setProductosEnCarrito(productosFiltrados);
    }, [productos]);

    const totalCompra = productosEnCarrito.reduce((total, producto) => total + producto.precio * producto.cantidad, 0);
    const totalCompraRedondeado = totalCompra.toFixed(2);
    const actualCurrency = 'USD';

    const getNombreComercio = (comercioId) => {
        const comercio = comercios.find(comercio => comercio.id === comercioId);
        return comercio ? comercio.nombre : 'Desconocido';
    };

    const onPlaceOrder = async () => {
        if (!user || !selectedLocation) {
            alert('Por favor, asegúrate de estar logueado y de seleccionar una ubicación.');
            return;
        }

        try {
            const productosEnCarrito = productos.filter(producto => producto.cantidad > 0);
            const comerciosEnCarrito = [...new Set(productosEnCarrito.map(producto => producto.comercio_id))];

            for (const comercioId of comerciosEnCarrito) {
                const productosComercio = productosEnCarrito.filter(producto => producto.comercio_id === comercioId);

                const { data: pedido, error: pedidoError } = await supabase
                    .from('pedidos')
                    .insert([{ user_id: user.id, user_locations: selectedLocation.id, comercio_id: comercioId }])
                    .select()
                    .single();

                if (pedidoError) {
                    console.error('Error al crear el pedido:', pedidoError);
                    alert(`Error al crear el pedido: ${pedidoError.message}`);
                    return;
                }

                const productosInsert = productosComercio.map(producto => ({
                    pedido_id: pedido.id,
                    producto_id: producto.id,
                    cantidad: producto.cantidad,
                    precio_unitario: producto.precio
                }));

                const { error: pedidoProductosError } = await supabase
                    .from('pedido_productos')
                    .insert(productosInsert);

                if (pedidoProductosError) {
                    console.error('Error al agregar producto al pedido:', pedidoProductosError);
                    alert(`Error al agregar productos al pedido: ${pedidoProductosError.message}`);
                    return;
                }
            }

            alert('Pedido realizado con éxito!');
            resetCantidades();
        } catch (error) {
            console.error('Error al realizar el pedido:', error.message);
        }
    };

    // Obtener el comercio del primer producto en el carrito
    const comercioActual = productosEnCarrito.length > 0
        ? comercios.find(c => c.id === productosEnCarrito[0].comercio_id)
        : null;

    return (
        <div className="carrito mt-4">
            <h2 className="mb-3">Carrito de Compras</h2>
            {productosEnCarrito.length > 0 ? (
                <div className="list-group">
                    {productosEnCarrito.map(producto => (
                        <div
                            key={producto.id}
                            className="list-group-item d-flex justify-content-between align-items-center"
                        >
                            <div>
                                <h5 className="mb-1">{producto.nombre}</h5>
                                <p className="mb-1">Cantidad: {producto.cantidad}</p>
                                <p className="mb-1">Comercio: {getNombreComercio(producto.comercio_id)}</p>
                                <CantidadControl
                                    cantidad={producto.cantidad}
                                    onIncrementar={() => incrementarCantidad(producto.id)}
                                    onDecrementar={() => decrementarCantidad(producto.id)}
                                />
                            </div>
                            <span className="badge bg-primary rounded-pill">
                                ${(producto.precio * producto.cantidad).toFixed(2)}
                            </span>
                        </div>
                    ))}
                    <div className="list-group-item d-flex justify-content-between align-items-center">
                        <h5>Total de la compra</h5>
                        <span className="badge bg-success rounded-pill">
                            ${totalCompraRedondeado}
                        </span>
                    </div>
                    <div className="d-flex justify-content-between mt-3">
                        <CryptoPayment
                            actualCurrency={actualCurrency}
                            totalCompraRedondeado={totalCompraRedondeado}
                            comercio={comercioActual}
                        />
                        <button
                            className="btn btn-primary"
                            onClick={onPlaceOrder}
                            disabled={!user || !selectedLocation}
                        >
                            Cash pay
                        </button>
                    </div>
                </div>
            ) : (
                <p className="alert alert-info">El carrito está vacío.</p>
            )}
        </div>
    );
};

export default Carrito;
