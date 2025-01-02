import React, { useState, useEffect } from 'react';
import Acordion from './Acordion';
import Carrito from './Carrito';
import CategoriaFiltro from './CategoriaFiltro';
import { Modal } from 'react-bootstrap'; 
import ComercioForm from './ComercioForm';
import supabase from '../../supabase/supabase.config';
import Header from '../common/Header';
import { useCoin } from '../../context/CoinContext';

const ClientView = ({ user, selectedLocation, handleSelectLocation }) => {
    const { currency, allCoin } = useCoin();
    const [comercios, setComercios] = useState([]);
    const [productos, setProductos] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(null);
    const [filteredComercios, setFilteredComercios] = useState([]);
    const [selectedTag, setSelectedTag] = useState(null);
    const [showForm, setShowForm] = useState(false);

    useEffect(() => {
        async function fetchData() {
            try {
                // Consulta a Supabase para traer comercios y productos
                const { data: comerciosData, error: comerciosError } = await supabase
                    .from('comercios')
                    .select(`*, categorias(*), productos(*, tags_producto(*, tags(nombre)))`);

                if (comerciosError) throw comerciosError;

                // Agregar la propiedad cantidad a cada producto
                const comerciosConProductos = comerciosData.map(comercio => ({
                    ...comercio,
                    productos: comercio.productos.map(producto => ({
                        ...producto,
                        cantidad: 0, // Inicializamos la cantidad en 0
                    })),
                }));

                setComercios(comerciosConProductos);

                // Extraer todos los productos para manipulación independiente
                const todosLosProductos = comerciosConProductos.flatMap(comercio => comercio.productos);
                setProductos(todosLosProductos);

                // Extraer categorías únicas
                const categoriasUnicas = [...new Set(comerciosData.map(comercio => comercio.categorias?.nombre))];
                setCategorias(categoriasUnicas?.filter(Boolean)); // Filtrar valores válidos
            } catch (error) {
                console.error('Error al obtener datos:', error);
            }
        }

        fetchData();
    }, []);

    useEffect(() => {
        const updateProductosPrices = () => {
            const moneda = allCoin?.find(coin => coin.id === currency.name);
            if (moneda) {
                const productosActualizados = productos.map(producto => ({
                    ...producto,
                    precioConvertido: producto.precio * moneda.current_price,
                }));
                setProductos(productosActualizados);
            }
        };

        updateProductosPrices();
    }, [currency, allCoin, productos]);

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
            cantidad: 0,
        }));
        setProductos(productosReseteados);
    };

    const handleTagSelect = (tag) => {
        setSelectedTag(tag);
        if (tag) {
            const filtered = comercios?.filter(comercio =>
                comercio.productos.some(producto =>
                    producto.tags_producto.some(t => t.tags.nombre === tag)
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
        setCategoriaSeleccionada(null);
    };

    const handleCategoriaSelect = (categoria) => {
        setCategoriaSeleccionada(categoria);
        const filtered = comercios?.filter(comercio => comercio.categorias?.nombre === categoria);
        setFilteredComercios(filtered);
        handleTagSelect(null);
    };

    const comerciosFiltrados = filteredComercios.length ? filteredComercios : comercios;

    return (
        <div className="container mt-5">
            <Header user={user} selectedLocation={selectedLocation} handleSelectLocation={handleSelectLocation} />
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
                    {/* <TagFiltroCarousel productos={productos} selectedTag={selectedTag} onTagSelect={handleTagSelect} /> */}
                    <Acordion
                        comercios={comerciosFiltrados}
                        productos={productos}
                        incrementarCantidad={incrementarCantidad}
                        decrementarCantidad={decrementarCantidad}
                    />
                </div>
            </div>
            <footer
                style={{
                    position: 'fixed',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    backgroundColor: 'white',
                    padding: '10px',
                    zIndex: 1000,
                }}
            >
                <div className="d-flex justify-content-start" style={{ paddingLeft: '10px' }}>
                    <button className="btn btn-primary" onClick={() => setShowForm(true)}>
                        Registrar mi comercio
                    </button>
                </div>
            </footer>
            {showForm && (
                <Modal show={showForm} onHide={() => setShowForm(false)}>
                    <ComercioForm user={user} onClose={() => setShowForm(false)} />
                </Modal>
            )}
        </div>
    );
};

export default ClientView;
