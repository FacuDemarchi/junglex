import React, { useState, useEffect, useCallback } from 'react';
import Acordion from './components/Acordion';
import Carrito from './components/Carrito';
import CategoriaFiltro from './components/CategoriaFiltro';
import TagFiltroCarousel from './components/TagFiltroCarousel';
import supabase from './supabase/supabase.config';
import Header from './components/Header';
import { useAuth } from './context/AuthContext';

const App = () => {
    const [comercios, setComercios] = useState([]);
    const [productos, setProductos] = useState([]);
    const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(null);
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [filteredComercios, setFilteredComercios] = useState([]);
    const [selectedTag, setSelectedTag] = useState(null);
    const { user, RegisterAsComercio } = useAuth();

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

    const resetCantidades = () => {
        const productosReseteados = productos.map(producto => ({
            ...producto,
            cantidad: 0
        }));
        setProductos(productosReseteados)
    }

    const handleSelectLocation = useCallback((location) => {
        setSelectedLocation(location);
    }, []);

    const handleCategoriaSelect = (categoria) => {
        setCategoriaSeleccionada(categoria);
        setFilteredComercios([]);
        setSelectedTag(null); // Limpiar filtro de tags
    };

    const handleTagSelect = (tag) => {
        setSelectedTag(tag);
        if (tag) {
            const filtered = comercios.filter(comercio =>
                productos.some(producto =>
                    producto.comercio_id === comercio.id && producto.tag.includes(tag)
                )
            );
            setFilteredComercios(filtered);
            setCategoriaSeleccionada(null); // Limpiar filtro de categorías
        } else {
            setFilteredComercios([]);
        }
    };

    const handleClearFilters = () => {
        setCategoriaSeleccionada(null);
        setFilteredComercios([]);
        setSelectedTag(null);
    };

    const categorias = [...new Set(comercios.map(comercio => comercio.categoria))];
    const comerciosFiltrados = categoriaSeleccionada ? comercios.filter(comercio => comercio.categoria === categoriaSeleccionada) : comercios;

    return (
        <>
            {user ? (
                <div className="container mt-5">
                    <Header user={user} onSelectLocation={handleSelectLocation} />
                    <div className="row">
                        <div className="col-md-3">
                            <div className="d-flex justify-content-between align-items-center">
                                <h5>Categorías</h5>
                                {(categoriaSeleccionada || selectedTag) && (
                                    <button className="btn btn-outline-secondary btn-sm" onClick={handleClearFilters}>
                                        Borrar Filtros
                                    </button>
                                )}
                            </div>
                            <CategoriaFiltro
                                categorias={categorias}
                                categoriaSeleccionada={categoriaSeleccionada}
                                setCategoriaSeleccionada={handleCategoriaSelect}
                            />
                            <Carrito
                                productos={productos}
                                comercios={comercios}
                                selectedLocation={selectedLocation}
                                incrementarCantidad={incrementarCantidad}
                                decrementarCantidad={decrementarCantidad}
                                user={user}
                                resetCantidades={resetCantidades}
                            />
                        </div>
                        <div className="col-md-9">
                            <TagFiltroCarousel productos={productos} selectedTag={selectedTag} onTagSelect={handleTagSelect} />
                            <h1>Lista de Comercios y Productos</h1>
                            <Acordion comercios={filteredComercios.length ? filteredComercios : comerciosFiltrados} productos={productos} incrementarCantidad={incrementarCantidad} decrementarCantidad={decrementarCantidad} />
                        </div>
                    </div>
                </div>
            ) : (
                <div className="container mt-5">
                    <Header user={user} onSelectLocation={handleSelectLocation} />
                    <p>Inicie sesión para encontrar a los comercios que llegan hasta su ubicación!</p>
                    <p>Recomiende a su comercio preferido el integrarse gratis en la plataforma y un cupon de descuento para su proxima compra</p>
                    <button className="btn btn-primary mt-3" onClick={RegisterAsComercio}>
                        Registrar mi comercio
                    </button>
                </div>
            )}
        </>
    )
};

export default App;
