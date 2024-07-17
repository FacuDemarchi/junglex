import React, { useCallback, useState, useEffect } from 'react';
import Acordion from './components/Acordion';
import Carrito from './components/Carrito';
import supabase from './supabase/supabase.config';
import Header from './components/Header';
import { useAuth } from './context/AuthContext';

const App = () => {
    const [comercios, setComercios] = useState([]);
    const [productos, setProductos] = useState([]);
    const [selectedLocation, setSelectedLocation] = useState(null);
    const { user } = useAuth();

    useEffect(() => {
        async function fetchData() {
            const { data: comerciosData } = await supabase.from('comercios').select();
            setComercios(comerciosData);

            const { data: productosData } = await supabase.from('productos').select();
            const productosConCantidad = productosData.map(producto => ({
                ...producto,
                cantidad: 0
            }));
            setProductos(productosConCantidad);
        }

        fetchData();
    }, []);

    const incrementarCantidad = (productoId) => {
        const updatedProductos = productos.map(producto =>
            producto.id === productoId ? { ...producto, cantidad: producto.cantidad + 1 } : producto
        );
        setProductos(updatedProductos);
    };

    const decrementarCantidad = (productoId) => {
        const updatedProductos = productos.map(producto =>
            producto.id === productoId ? { ...producto, cantidad: Math.max(producto.cantidad - 1, 0) } : producto
        );
        setProductos(updatedProductos);
    };

    const handleSelectLocation = useCallback((location) => {
        setSelectedLocation(location);
    }, []);

    return (
        <div className="container mt-5">
            <Header user={user} onSelectLocation={handleSelectLocation} />
            <h1>Lista de Comercios y Productos</h1>
            <Acordion 
                comercios={comercios} 
                productos={productos} 
                incrementarCantidad={incrementarCantidad} 
                decrementarCantidad={decrementarCantidad} 
            />
            <Carrito 
                productos={productos} 
                comercios={comercios} 
                selectedLocation={selectedLocation}
                incrementarCantidad={incrementarCantidad}
                decrementarCantidad={decrementarCantidad}
                user={user}
            />
        </div>
    );
};

export default App;
