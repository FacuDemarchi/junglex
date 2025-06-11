import React, { useState } from 'react';
import styles from './styles/Acordion.module.css';

interface Producto {
    id: string;
    nombre: string;
    precio: number;
    cantidad: number;
}

interface Comercio {
    id: string;
    nombre: string;
    categorias: {
        nombre: string;
    };
    distancia_km: number;
    productos: Producto[];
}

interface AcordionProps {
    comercios: Comercio[];
    productos: Producto[];
    incrementarCantidad: (id: string, cantidad?: number) => void;
    decrementarCantidad: (id: string) => void;
}

const Acordion: React.FC<AcordionProps> = ({
    comercios,
    productos,
    incrementarCantidad,
    decrementarCantidad
}) => {
    const [activeComercio, setActiveComercio] = useState<string | null>(null);

    const toggleComercio = (comercioId: string) => {
        setActiveComercio(activeComercio === comercioId ? null : comercioId);
    };

    return (
        <div className={styles.acordionContainer}>
            {comercios.map((comercio) => (
                <div key={comercio.id} className={styles.comercioItem}>
                    <div 
                        className={styles.comercioHeaderContainer}
                        onClick={() => toggleComercio(comercio.id)}
                    >
                        <div className={styles.comercioHeader}>
                            <img
                                src="/favicon.ico"
                                alt={`${comercio.nombre} logo`}
                                className={styles.comercioLogo}
                            />
                            <div className={styles.comercioInfo}>
                                <h3 className={styles.comercioNombre}>{comercio.nombre}</h3>
                                <p className={styles.comercioDescripcion}>{comercio.categorias.nombre}</p>
                                <p className={styles.comercioDescripcion}>{comercio.distancia_km.toFixed(1)} km</p>
                            </div>
                            <div className={`${styles.dropdownIcon} ${activeComercio === comercio.id ? styles.active : ''}`}>
                                ▼
                            </div>
                        </div>
                    </div>
                    
                    {activeComercio === comercio.id && (
                        <div className={styles.comercioProductos}>
                            {comercio.productos.map(producto => {
                                const productoEnCarrito = productos.find(p => p.id === producto.id);
                                const cantidad = productoEnCarrito?.cantidad || 0;

                                return (
                                    <div key={producto.id} className={styles.productoItem}>
                                        <h4 className={styles.productoNombre}>{producto.nombre}</h4>
                                        <div className={styles.precioYControles}>
                                            <span className={styles.productoPrecio}>${producto.precio.toFixed(2)}</span>
                                            <div className={styles.controles}>
                                                <button
                                                    onClick={() => decrementarCantidad(producto.id)}
                                                    disabled={cantidad === 0}
                                                    className={styles.cantidadButton}
                                                >
                                                    -
                                                </button>
                                                <span className={styles.cantidad}>{cantidad}</span>
                                                <button
                                                    onClick={() => incrementarCantidad(producto.id)}
                                                    className={styles.cantidadButton}
                                                >
                                                    +
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

export default Acordion; 