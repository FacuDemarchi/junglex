import supabase from '../supabase/supabase.config';

const crearPedido = async (productosEnCarrito, selectedLocation, user) => {
    if (!user || !selectedLocation) {
        throw new Error('Usuario o ubicación no válidos para crear el pedido.');
    }

    try {
        // Iniciar transacción con Supabase para garantizar la atomicidad
        const { error } = await supabase.rpc('crear_pedido', {
            user_id: user.id,
            user_locations: selectedLocation.id,
            productos: productosEnCarrito.map(producto => ({
                producto_id: producto.id,
                cantidad: producto.cantidad,
                precio_unitario: producto.precio
            })),
            total: calcularTotalCompra(productosEnCarrito)
        });

        if (error) {
            console.error('Error al llamar al procedimiento almacenado crear_pedido:', error.message);
            return false;
        }

        return true; // Pedido creado exitosamente
    } catch (error) {
        console.error('Error al crear el pedido:', error.message);
        throw error;
    }
};

const calcularTotalCompra = (productosEnCarrito) => {
    return productosEnCarrito.reduce((total, producto) => {
        return total + producto.precio * producto.cantidad;
    }, 0);
};

export const usePedidoService = () => {
    return {
        crearPedido
    };
};
