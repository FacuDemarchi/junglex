import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Acordion from './Acordion';
import Carrito from './Carrito';
import CategoriaFiltro from './CategoriaFiltro';
import Header from '../common/Header';
import supabase from '../../supabase/supabase.config';
import UserLocationForm from '../common/UserLocationForm';
import styles from './styles/ClientView.module.css';

interface UserLocation {
    id: string;
    address: string;
    latitude: number;
    longitude: number;
    user_id: string;
}

interface User {
    id: string;
}

interface Tag {
    nombre: string;
}

interface TagProducto {
    tags: Tag;
}

interface Producto {
    id: string;
    nombre: string;
    precio: number;
    cantidad: number;
    tags_producto: TagProducto[];
    comercio_id: string;
    comercio_nombre: string;
    distancia_km: number;
}

interface Categoria {
    nombre: string;
}

interface Comercio {
    id: string;
    nombre: string;
    categorias: Categoria;
    productos: Producto[];
    distancia_km: number;
}

interface CategoriaConTags {
    categoria: string;
    tags: string[];
}

interface FiltroSeleccionado {
    tipo: 'categoría' | 'tag';
    valor: string;
}

interface ClientViewProps {
    user: User;
    selectedLocation: UserLocation | null;
    handleSelectLocation: (location: UserLocation) => void;
    handleComercioView: (comercio: Comercio) => void;
    isTemporaryView?: boolean;
}

const ClientView: React.FC<ClientViewProps> = ({ 
    user, 
    selectedLocation, 
    handleSelectLocation,
    handleComercioView,
    isTemporaryView = false 
}) => {
    const navigate = useNavigate();
    const [comercios, setComercios] = useState<Comercio[]>([]);
    const [productos, setProductos] = useState<Producto[]>([]);
    const [categoriasConTags, setCategoriasConTags] = useState<CategoriaConTags[]>([]);
    const [filteredComercios, setFilteredComercios] = useState<Comercio[]>([]);
    const [filtroSeleccionado, setFiltroSeleccionado] = useState<FiltroSeleccionado | null>(null);
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

            const categoriasAgrupadas = comerciosData.reduce((acc: { [key: string]: Set<string> }, comercio: Comercio) => {
                const categoria = comercio.categorias?.nombre;
                if (categoria) {
                    if (!acc[categoria]) acc[categoria] = new Set();
                    comercio.productos.forEach((producto: Producto) => {
                        producto.tags_producto.forEach((tagProducto: TagProducto) => {
                            acc[categoria].add(tagProducto.tags.nombre);
                        });
                    });
                }
                return acc;
            }, {});

            const categoriasConTags: CategoriaConTags[] = Object.entries(categoriasAgrupadas).map(
                ([categoria, tagsSet]) => ({
                    categoria,
                    tags: Array.from(tagsSet as Set<string>),
                })
            );

            setCategoriasConTags(categoriasConTags);

            const todosLosProductos = comerciosData.flatMap((comercio: Comercio) =>
                comercio.productos.map((producto: Producto) => ({
                    ...producto,
                    cantidad: 0,
                    comercio_id: comercio.id,
                    comercio_nombre: comercio.nombre,
                    distancia_km: comercio.distancia_km
                }))
            );

            const productosGuardados = localStorage.getItem('carritoProductos');
            if (productosGuardados) {
                const productosParseados: Producto[] = JSON.parse(productosGuardados);
                const productosActualizados = todosLosProductos.map((producto: Producto) => {
                    const productoGuardado = productosParseados.find((p: Producto) => p.id === producto.id);
                    return productoGuardado ? { ...producto, cantidad: productoGuardado.cantidad } : producto;
                });
                setProductos(productosActualizados);
            } else {
                setProductos(todosLosProductos);
            }
        };

        fetchData();
    }, [selectedLocation]);

    useEffect(() => {
        const productosFiltrados = productos.filter(producto => producto.cantidad > 0);
        localStorage.setItem('carritoProductos', JSON.stringify(productosFiltrados));
    }, [productos]);

    const incrementarCantidad = (productoId: string, cantidad: number = 1) => {
        const productosActualizados = productos.map((producto) =>
            producto.id === productoId
                ? { ...producto, cantidad: producto.cantidad + cantidad }
                : producto
        );
        setProductos(productosActualizados);
    };

    const decrementarCantidad = (productoId: string) => {
        const productosActualizados = productos.map((producto) =>
            producto.id === productoId
                ? { ...producto, cantidad: Math.max(producto.cantidad - 1, 0) }
                : producto
        );
        setProductos(productosActualizados);
    };

    const handleFilterSelect = (filtro: string, tipo: 'categoría' | 'tag') => {
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

    const handleLocationSelect = async (location: { latitude: number; longitude: number; address: string }) => {
        try {
            const { data: newLocation, error } = await supabase
                .from('locations')
                .insert({
                    latitude: location.latitude,
                    longitude: location.longitude,
                    address: location.address,
                    user_id: user.id
                })
                .select()
                .single();

            if (error) throw error;
            if (newLocation) {
                handleSelectLocation(newLocation);
            }
        } catch (error) {
            console.error('Error al guardar la ubicación:', error);
        }
    };

    return (
        <div className={styles.container}>
            <Header
                user={user}
                selectedLocation={selectedLocation}
                handleSelectLocation={handleSelectLocation}
                handleComercioView={handleComercioView}
                isTemporaryView={isTemporaryView}
            />
            <UserLocationForm
                user={user}
                show={locationForm}
                handleClose={() => setLocationForm(false)}
                handleSave={(address: string, position: { latitude: number; longitude: number }) => {
                    handleLocationSelect({ address, ...position });
                    setLocationForm(false);
                }}
            />
            <div className={styles.row}>
                <div className={styles.columnLeft}>
                    <CategoriaFiltro
                        categoriasConTags={categoriasConTags}
                        filtroSeleccionado={filtroSeleccionado}
                        onFilterSelect={handleFilterSelect}
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
                        <button 
                            className={styles.registerButton}
                            onClick={() => navigate('/registro-comercio')}
                        >
                            Registrar Mi Comercio
                        </button>
                    )}
                </div>
                <div className={styles.columnRight}>
                    {!selectedLocation ? (
                        <div className={`${styles.alert} ${styles.alertInfo}`}>
                            <h4 className={styles.alertTitle}>Selecciona una ubicación</h4>
                            <p className={styles.alertText}>Por favor, selecciona o agrega una ubicación para ver los comercios cercanos.</p>
                        </div>
                    ) : comercios.length === 0 ? (
                        <div className={`${styles.alert} ${styles.alertWarning}`}>
                            <h4 className={styles.alertTitle}>No hay comercios cercanos</h4>
                            <p className={styles.alertText}>Lo sentimos, no encontramos comercios que entreguen en tu zona.</p>
                            <p className={styles.alertText}>Puedes intentar con otra ubicación o registrarte como comercio si quieres ofrecer tus productos.</p>
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