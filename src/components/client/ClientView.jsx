// src/components/client/VistaCliente.js

import React, { useState, useEffect, useCallback } from 'react';
import Acordion from './Acordion';
import Carrito from './Carrito';
import CategoriaFiltro from './CategoriaFiltro';
import TagFiltroCarousel from './TagFiltroCarousel';
import { Modal } from 'react-bootstrap';
import ComercioForm from './ComercioForm';
import supabase from '../../supabase/supabase.config';
import HeaderClient from './HeaderClient';

const ClientView = ({ user, userComercio }) => {
    const [comercios, setComercios] = useState([]);
    const [productos, setProductos] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(null);
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [filteredComercios, setFilteredComercios] = useState([]);
    const [selectedTag, setSelectedTag] = useState(null);
    const [showForm, setShowForm] = useState(false);

    useEffect(() => {
        async function fetchData() {
            // Obtener comercios
            const { data: comerciosData } = await supabase.from('comercios').select();
            setComercios(comerciosData);

            // Obtener productos
            const { data: productosData } = await supabase.from('productos').select();
            const productosConCantidad = productosData.map(producto => ({
                ...producto,
                cantidad: 0
            }));
            setProductos(productosConCantidad);

            // Obtener categorías
            const categoriasData = [...new Set(comerciosData.map(comercio => comercio.categoria))];
            setCategorias(categoriasData);

            
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

    const handleTagSelect = (tag) => {
        setSelectedTag(tag);
        if (tag) {
            const filtered = comercios.filter(comercio =>
                productos.some(producto =>
                    producto.comercio_id === comercio.id && producto.tag.includes(tag)
                )
            );
            setFilteredComercios(filtered);
        } else {
            setFilteredComercios([]);
        }
    };

    const handleClearFilters = () => {
        setFilteredComercios([]);
        setSelectedTag(null);
    };

    const handleCategoriaSelect = (categoria) => {
        setCategoriaSeleccionada(categoria);
        setFilteredComercios([]);
        handleTagSelect(null); // Limpiar filtro de tags
    };

    const comerciosFiltrados = filteredComercios.length ? filteredComercios : comercios;

    return (
        <div className="container mt-5">
            {!userComercio && <HeaderClient user={user} onSelectLocation={handleSelectLocation} />}
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
                    <Acordion
                        comercios={comerciosFiltrados}
                        productos={productos}
                        incrementarCantidad={incrementarCantidad}
                        decrementarCantidad={decrementarCantidad}
                    />
                </div>
            </div>
            <footer>
                {!showForm ? (
                    <button className="btn btn-primary mt-3" onClick={() => setShowForm(true)}>
                        Registrar mi comercio
                    </button>
                ) : (
                    <Modal show={showForm} onHide={() => setShowForm(false)}>
                        <ComercioForm user={user} onClose={() => setShowForm(false)} />
                    </Modal>
                )}
            </footer>
        </div>
    );
};

export default ClientView;
