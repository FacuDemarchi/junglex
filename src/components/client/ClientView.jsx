import React, { useState, useEffect } from 'react';
import Acordion from './Acordion';
import Carrito from './Carrito';
import CategoriaFiltro from './CategoriaFiltro';
import Header from '../common/Header';
import supabase from '../../supabase/supabase.config';
// import { useCoin } from '../../context/CoinContext';
import './styles/ClientView.css'; // Agregar estilos globales si es necesario

const ClientView = ({ user, selectedLocation, handleSelectLocation }) => {
    // const { currency, allCoin } = useCoin();
    const [comercios, setComercios] = useState([]);
    const [productos, setProductos] = useState([]);
    const [categoriasConTags, setCategoriasConTags] = useState([]);
    const [filteredComercios, setFilteredComercios] = useState([]);
    const [filtroSeleccionado, setFiltroSeleccionado] = useState(null);

    // Cargar datos desde Supabase
    useEffect(() => {
        const fetchData = async () => {
            const { data: comerciosData, error } = await supabase
                .from('comercios')
                .select(`*, categorias(*), productos(*, tags_producto(*, tags(nombre)))`);

            if (error) {
                console.error('Error fetching comercios:', error);
                return;
            }

            setComercios(comerciosData);

            // Organizar categorías y tags
            const categoriasAgrupadas = comerciosData.reduce((acc, comercio) => {
                const categoria = comercio.categorias?.nombre;
                if (categoria) {
                    if (!acc[categoria]) acc[categoria] = new Set();
                    comercio.productos.forEach((producto) =>
                        producto.tags_producto.forEach((tag) => acc[categoria].add(tag.tags.nombre))
                    );
                }
                return acc;
            }, {});

            const categoriasConTags = Object.entries(categoriasAgrupadas).map(
                ([categoria, tagsSet]) => ({
                    categoria,
                    tags: [...tagsSet],
                })
            );

            setCategoriasConTags(categoriasConTags);

            // Inicializar productos con cantidades en 0
            const todosLosProductos = comerciosData.flatMap((comercio) =>
                comercio.productos.map((producto) => ({
                    ...producto,
                    cantidad: 0,
                }))
            );
            setProductos(todosLosProductos);
        };

        fetchData();
    }, []);

    // Manejar incremento de cantidad
    const incrementarCantidad = (productoId) => {
        const productosActualizados = productos.map((producto) =>
            producto.id === productoId
                ? { ...producto, cantidad: producto.cantidad + 1 }
                : producto
        );
        setProductos(productosActualizados);
    };

    // Manejar decremento de cantidad
    const decrementarCantidad = (productoId) => {
        const productosActualizados = productos.map((producto) =>
            producto.id === productoId
                ? { ...producto, cantidad: Math.max(producto.cantidad - 1, 0) }
                : producto
        );
        setProductos(productosActualizados);
    };

    // Manejar selección de filtros
    const handleFilterSelect = (filtro, tipo) => {
        setFiltroSeleccionado({ tipo, valor: filtro });
        const filtered = comercios.filter((comercio) => {
            if (tipo === 'categoría') {
                return comercio.categorias?.nombre === filtro;
            }
            if (tipo === 'tag') {
                return comercio.productos.some((producto) =>
                    producto.tags_producto.some((tag) => tag.tags.nombre === filtro)
                );
            }
            return true;
        });
        setFilteredComercios(filtered);
    };

    // Resetear filtros
    const handleClearFilters = () => {
        setFiltroSeleccionado(null);
        setFilteredComercios([]);
    };

    const comerciosFiltrados = filteredComercios.length ? filteredComercios : comercios;

    const resetCantidades = () => {
        const productosReiniciados = productos.map(producto => ({
            ...producto,
            cantidad: 0
        }));
        setProductos(productosReiniciados);
    };

    return (
        <div className="container mt-5">
            <Header
                user={user}
                selectedLocation={selectedLocation}
                handleSelectLocation={handleSelectLocation}
            />
            <div className="row">
                <div className="col-md-3">
                    <CategoriaFiltro
                        categoriasConTags={categoriasConTags}
                        filtroSeleccionado={filtroSeleccionado}
                        onFilterSelect={handleFilterSelect}
                        onClearFilters={handleClearFilters}
                    />
                    <Carrito
                        productos={productos}
                        comercios={comerciosFiltrados}
                        incrementarCantidad={incrementarCantidad}
                        decrementarCantidad={decrementarCantidad}
                        selectedLocation={selectedLocation}
                        user={user}
                        resetCantidades={resetCantidades}
                    />
                </div>
                <div className="col-md-9">
                    <Acordion
                        comercios={comerciosFiltrados}
                        productos={productos}
                        incrementarCantidad={incrementarCantidad}
                        decrementarCantidad={decrementarCantidad}
                    />
                </div>
            </div>
        </div>
    );
};

export default ClientView;
