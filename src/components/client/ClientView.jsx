import React, { useState, useEffect } from 'react';
import Acordion from './Acordion';
import Carrito from './Carrito';
import CategoriaFiltro from './CategoriaFiltro';
import Header from '../common/Header';
import supabase from '../../supabase/supabase.config';
// import { useCoin } from '../../context/CoinContext';
import './styles/ClientView.css'; // Agregar estilos globales si es necesario
import UserLocationForm from '../common/UserLocationForm';

const ClientView = ({ user, selectedLocation, handleSelectLocation, isTemporaryView = false }) => {
    // const { currency, allCoin } = useCoin();
    const [comercios, setComercios] = useState([]);
    const [productos, setProductos] = useState([]);
    const [categoriasConTags, setCategoriasConTags] = useState([]);
    const [filteredComercios, setFilteredComercios] = useState([]);
    const [filtroSeleccionado, setFiltroSeleccionado] = useState(null);
    const [locationForm, setLocationForm] = useState(false);

    useEffect(() => {
        const userLocation = async () => {
            const { data, error } = await supabase
                .from("user_locations")
                .select("*")
                .eq("user_id", user.id);
            
            if (!data || data.length === 0 || error) {
                setLocationForm(true);
            }
        };

        userLocation();
    }, [user]);

    // Cargar datos desde Supabase
    useEffect(() => {
        const fetchData = async () => {
            if (!selectedLocation) return;

            const { data: comerciosData, error } = await supabase.rpc('obtener_comercios_cercanos', {
                latitud: selectedLocation.latitude,
                longitud: selectedLocation.longitude
            });

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
                    // Ahora los tags están dentro de cada producto
                    comercio.productos.forEach((producto) => {
                        producto.tags_producto.forEach((tagProducto) => {
                            acc[categoria].add(tagProducto.tags.nombre);
                        });
                    });
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
                    comercio_id: comercio.id, // Agregamos el ID del comercio al producto
                    comercio_nombre: comercio.nombre, // Agregamos el nombre del comercio al producto
                    distancia_km: comercio.distancia_km // Agregamos la distancia al producto
                }))
            );
            setProductos(todosLosProductos);
        };

        fetchData();
    }, [selectedLocation]);

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
                    producto.tags_producto.some((tagProducto) => 
                        tagProducto.tags.nombre === filtro
                    )
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
                isTemporaryView={isTemporaryView}
            />
            <UserLocationForm
                user={user}
                show={locationForm}
                handleClose={() => setLocationForm(false)}
                handleSave={(address, position) => {
                    handleSelectLocation({ address, ...position });
                    setLocationForm(false);
                }}
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
                    {!isTemporaryView && (
                        <button onClick={async () => {
                            try {
                                const { error } = await supabase
                                    .from('user_data')
                                    .upsert({
                                        user_id: user.id,
                                        user_type: 'comercio',
                                    });
                                if (error) {console.error('Error al registrar al comercio en tabla user_data:', error); return;}
                                
                                const {errorc} = await supabase
                                    .from('comercios')
                                    .upsert({id: user.id});
                                if (errorc) {console.log('Error al registrar el comercio en tabla comercios'); return;}

                                alert('Registro exitoso como comercio');
                                await new Promise(resolve => setTimeout(resolve, 2000));
                                window.location.reload();
                            } catch (error) {
                                console.error('Error registrando como comercio:', error);
                            }
                        }}>Registrar Mi Comercio</button>
                    )}
                </div>
                <div className="col-md-9">
                    {!selectedLocation ? (
                        <div className="alert alert-info text-center">
                            <h4>Selecciona una ubicación</h4>
                            <p>Por favor, selecciona o agrega una ubicación para ver los comercios cercanos.</p>
                        </div>
                    ) : comercios.length === 0 ? (
                        <div className="alert alert-warning text-center">
                            <h4>No hay comercios cercanos</h4>
                            <p>Lo sentimos, no encontramos comercios que entreguen en tu zona.</p>
                            <p>Puedes intentar con otra ubicación o registrarte como comercio si quieres ofrecer tus productos.</p>
                        </div>
                    ) : (
                        <Acordion
                            comercios={comerciosFiltrados}
                            productos={productos}
                            incrementarCantidad={incrementarCantidad}
                            decrementarCantidad={decrementarCantidad}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default ClientView;
