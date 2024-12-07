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

    console.log('allcoins:  ', allCoin);


    useEffect(() => {
        async function fetchData() {
            const { data: comerciosData, error: comerciosError } = await supabase
                .from('comercios')
                .select(`*, categorias(*)`);

            if (comerciosError) {
                console.error('Error al obtener comercios:', comerciosError);
                return;
            }

            setComercios(comerciosData);

            const { data: productosData, error: productosError } = await supabase
                .from('productos')
                .select(`*, tags(*)`);

            if (productosError) {
                console.error('Error al obtener productos:', productosError);
                return;
            }

            const productosConCantidad = productosData.map(producto => ({
                ...producto,
                cantidad: 0
            }));
            setProductos(productosConCantidad);

            const categoriasUnicas = [...new Set(comerciosData.map(comercio => comercio.categorias?.nombre))];
            setCategorias(categoriasUnicas);
        }

        fetchData();
    }, []);

    useEffect(()=>{
        const updateProductosPrices = ()=>{}

        updateProductosPrices();
    },[currency]);

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
        setProductos(productosReseteados);
    };

    const handleTagSelect = (tag) => {
        setSelectedTag(tag);
        if (tag) {
            const filtered = comercios.filter(comercio =>
                productos.some(producto =>
                    producto.comercio_id === comercio.id && producto.tag && producto.tag.includes(tag) 
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
        setFilteredComercios([]);
        handleTagSelect(null); 
    };

    const comerciosFiltrados = filteredComercios.length ? filteredComercios : comercios;

    const convertirPrecios = (productos) => {
        return productos.map(producto => {
            const moneda = allCoin ? allCoin.find(coin => coin.id === currency.name) : null;
            const precioConvertido = moneda ? producto.precio * moneda.current_price : producto.precio;
            return { ...producto, precio: precioConvertido };
        });
    };

    const productosConvertidos = convertirPrecios(productos);

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
                        productos={productosConvertidos}
                        comercios={comercios}
                        selectedLocation={selectedLocation}
                        incrementarCantidad={incrementarCantidad}
                        decrementarCantidad={decrementarCantidad}
                        user={user}
                        resetCantidades={resetCantidades}
                    />
                </div>
                <div className="col-md-9">
                    {/*<TagFiltroCarousel productos={productos} selectedTag={selectedTag} onTagSelect={handleTagSelect} />*/}
                    <Acordion
                        comercios={comerciosFiltrados}
                        productos={productos}
                        setProductos={setProductos}
                        incrementarCantidad={incrementarCantidad}
                        decrementarCantidad={decrementarCantidad}
                    />
                </div>
            </div>
            <footer style={{ position: 'fixed', bottom: 0, left: 0, right: 0, backgroundColor: 'white', padding: '10px', zIndex: 1000 }}>
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
