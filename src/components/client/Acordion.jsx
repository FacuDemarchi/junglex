import React, { useState } from 'react';
import ProductoCard from './ProductoCard';
import './styles/Acordion.css'; // Asegúrate de importar el archivo CSS correctamente

const Accordion = ({ comercios, productos, incrementarCantidad, decrementarCantidad }) => {
    const [activeIndex, setActiveIndex] = useState(null);

    const onTitleClick = (index) => {
        setActiveIndex(index === activeIndex ? null : index);
    };

    return (
        <div className="accordion" id="accordionExample">
            {comercios.map((comercio, index) => {
                // Los productos ya vienen dentro del comercio
                const productosDelComercio = comercio.productos || [];

                // Si no hay productos para este comercio, no lo renderices
                if (productosDelComercio.length === 0) {
                    return null;
                }

                return (
                    <div className="accordion-item" key={comercio.id}>
                        <h2 className="accordion-header comercio-header-container" id={`heading${index}`}>
                            <button
                                className={`accordion-button comercio-button ${index === activeIndex ? 'active' : 'collapsed'}`}
                                type="button"
                                onClick={() => onTitleClick(index)}
                                aria-expanded={index === activeIndex}
                                aria-controls={`collapse${index}`}
                            >
                                <div className="comercio-header">
                                    <img
                                        src={comercio.logo || "https://afuwvuyeqclmmqbryjwr.supabase.co/storage/v1/object/public/comercios//default_comerce.jpeg"}
                                        alt={`${comercio.nombre} logo`}
                                        className="comercio-logo"
                                    />
                                    <div className="comercio-info">
                                        <h3 className="comercio-nombre">{comercio.nombre}</h3>
                                        <p className="comercio-direccion">Dirección: {comercio.direccion}</p>
                                        <p className="comercio-telefono">Teléfono: {comercio.telefono}</p>
                                        <p className="comercio-distancia">Distancia: {comercio.distancia_km.toFixed(2)} km</p>
                                        <p className="comercio-categoria">Categoría: {comercio.categorias?.nombre}</p>
                                    </div>
                                </div>
                            </button>
                        </h2>
                        <div
                            id={`collapse${index}`}
                            className={`accordion-collapse collapse ${index === activeIndex ? 'show' : ''}`}
                            aria-labelledby={`heading${index}`}
                            data-bs-parent="#accordionExample"
                        >
                            <div className="accordion-body">
                                {productosDelComercio.length > 0 ? (
                                    <div className="producto-grid">
                                        {productosDelComercio.map((producto) => (
                                            <ProductoCard
                                                key={producto.id}
                                                producto={{
                                                    ...producto,
                                                    comercio_id: comercio.id,
                                                    comercio_nombre: comercio.nombre,
                                                    distancia_km: comercio.distancia_km
                                                }}
                                                onIncrementar={() => incrementarCantidad(producto.id)}
                                                onDecrementar={() => decrementarCantidad(producto.id)}
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    <p>No hay productos disponibles para este comercio.</p>
                                )}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default Accordion;
