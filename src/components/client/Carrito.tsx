import React, { useEffect, useState } from 'react';
import supabase from '../../supabase/supabase.config';
import styles from './styles/Carrito.module.css';

interface User {
    id: string;
}

interface UserLocation {
    id: string;
    address: string;
    latitude: number;
    longitude: number;
    user_id: string;
}

interface Producto {
    id: string;
    nombre: string;
    precio: number;
    cantidad: number;
    comercio_id: string;
}

interface Comercio {
    id: string;
    nombre: string;
}

interface CarritoProps {
    productos: Producto[];
    comercios: Comercio[];
    selectedLocation: UserLocation | null;
    incrementarCantidad: (id: string, cantidad?: number) => void;
    decrementarCantidad: (id: string) => void;
    user: User;
    resetCantidades: () => void;
}

const Carrito: React.FC<CarritoProps> = ({
    productos,
    comercios,
    selectedLocation,
    incrementarCantidad,
    decrementarCantidad,
    user,
    resetCantidades
}) => {
    const [productosEnCarrito, setProductosEnCarrito] = useState<Producto[]>([]);
    const [productosPorComercio, setProductosPorComercio] = useState<{ [key: string]: Producto[] }>({});
    const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);

    // Cargar productos del localStorage al iniciar
    useEffect(() => {
        const productosGuardados = localStorage.getItem('carritoProductos');
        if (productosGuardados) {
            const productosParseados: Producto[] = JSON.parse(productosGuardados);
            // Actualizar las cantidades en el estado global
            productosParseados.forEach(producto => {
                const productoOriginal = productos.find(p => p.id === producto.id);
                if (productoOriginal && producto.cantidad > 0) {
                    incrementarCantidad(producto.id, producto.cantidad);
                }
            });
        }
    }, []);

    // Guardar productos en localStorage cuando cambien
    useEffect(() => {
        const productosFiltrados = productos.filter(producto => producto.cantidad > 0);
        setProductosEnCarrito(productosFiltrados);

        // Guardar en localStorage
        localStorage.setItem('carritoProductos', JSON.stringify(productosFiltrados));

        // Agrupar productos por comercio
        const agrupados = productosFiltrados.reduce((acc: { [key: string]: Producto[] }, producto) => {
            const comercioId = producto.comercio_id;
            if (!acc[comercioId]) {
                acc[comercioId] = [];
            }
            acc[comercioId].push(producto);
            return acc;
        }, {});
        setProductosPorComercio(agrupados);
    }, [productos]);

    const totalCompra = productosEnCarrito.reduce((total, producto) => total + producto.precio * producto.cantidad, 0);
    const totalCompraRedondeado = totalCompra.toFixed(2);

    const getNombreComercio = (comercioId: string): string => {
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
            const comerciosEnCarrito = Array.from(new Set(productosEnCarrito.map(producto => producto.comercio_id)));

            for (const comercioId of comerciosEnCarrito) {
                const productosComercio = productosEnCarrito.filter(producto => producto.comercio_id === comercioId);

                const { data: pedido, error: pedidoError } = await supabase
                    .from('pedidos')
                    .insert([{ user_id: user.id, user_locations: selectedLocation.id, comercio_id: comercioId }])
                    .select()
                    .single();

                if (pedidoError) throw pedidoError;

                const pedidoProductos = productosComercio.map(producto => ({
                    pedido_id: pedido.id,
                    producto_id: producto.id,
                    cantidad: producto.cantidad,
                    precio_unitario: producto.precio
                }));

                const { error: pedidoProductosError } = await supabase
                    .from('pedido_productos')
                    .insert(pedidoProductos);

                if (pedidoProductosError) throw pedidoProductosError;
            }

            setShowSuccessAnimation(true);
            setTimeout(() => {
                setShowSuccessAnimation(false);
            }, 3000);

            resetCantidades();
            localStorage.removeItem('carritoProductos');
        } catch (error) {
            console.error('Error al realizar el pedido:', error);
            alert('Error al realizar el pedido. Por favor, intenta nuevamente.');
        }
    };

    return (
        <div className={styles.carrito}>
            {/* <h2 className={styles.title}>Carrito de Compras</h2> */}
            {productosEnCarrito.length > 0 ? (
                <div className={styles.listGroup}>
                    {Object.entries(productosPorComercio).map(([comercioId, productos]) => (
                        <div key={comercioId} className={styles.comercioSection}>
                            <h3 className={styles.comercioTitulo}>{getNombreComercio(comercioId)}</h3>
                            <div className={styles.productosList}>
                                {productos.map(producto => (
                                    <div key={producto.id} className={styles.productoItem}>
                                        <div className={styles.productoInfo}>
                                            <h5 className={styles.productoNombre}>{producto.nombre}</h5>
                                            <p className={styles.productoPrecio}>${producto.precio.toFixed(2)}</p>
                                        </div>
                                        <div className={styles.cantidadControls}>
                                            <button
                                                className={styles.cantidadButton}
                                                onClick={() => decrementarCantidad(producto.id)}
                                                disabled={producto.cantidad === 0}
                                            >
                                                -
                                            </button>
                                            <span className={styles.cantidad}>{producto.cantidad}</span>
                                            <button
                                                className={styles.cantidadButton}
                                                onClick={() => incrementarCantidad(producto.id)}
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                    <div className={styles.total}>
                        <span>Total</span>
                        <span className={styles.badge}>
                            ${totalCompraRedondeado}
                        </span>
                    </div>
                    <div className={styles.buttonContainer}>
                        <button
                            className={styles.button}
                            onClick={onPlaceOrder}
                            disabled={!user || !selectedLocation}
                        >
                            Pagar en efectivo
                        </button>
                    </div>
                </div>
            ) : (
                <p className={styles.alert}>El carrito está vacío.</p>
            )}

            {showSuccessAnimation && (
                <div className={styles.successAnimation}>
                    <span>¡Pedido realizado con éxito! 🎉</span>
                </div>
            )}
        </div>
    );
};

export default Carrito; 