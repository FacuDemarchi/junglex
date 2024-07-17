import React, { useState } from 'react';
import CantidadControl from './CantidadControl';

const Accordion = ({ comercios, productos, incrementarCantidad, decrementarCantidad }) => {
    const [activeIndex, setActiveIndex] = useState(null);

    const onTitleClick = (index) => {
        setActiveIndex(index === activeIndex ? null : index);
    };

    return (
        <div className="accordion" id="accordionExample">
            {comercios.map((comercio, index) => (
                <div className="accordion-item" key={comercio.id}>
                    <h2 className="accordion-header" id={`heading${index}`}>
                        <button
                            className={`accordion-button ${index === activeIndex ? '' : 'collapsed'}`}
                            type="button"
                            onClick={() => onTitleClick(index)}
                            aria-expanded={index === activeIndex}
                            aria-controls={`collapse${index}`}
                        >
                            {comercio.nombre}, Dirección: {comercio.direccion}, Teléfono: {comercio.telefono}
                        </button>
                    </h2>
                    <div
                        id={`collapse${index}`}
                        className={`accordion-collapse collapse ${index === activeIndex ? 'show' : ''}`}
                        aria-labelledby={`heading${index}`}
                        data-bs-parent="#accordionExample"
                    >
                        <div className="accordion-body">
                            {productos.filter(producto => producto.comercio_id === comercio.id).length > 0 ? (
                                <ul>
                                    {productos
                                        .filter(producto => producto.comercio_id === comercio.id)
                                        .map(producto => (
                                            <li key={producto.id}>
                                                {producto.nombre}: ${producto.precio}{' '}
                                                <CantidadControl
                                                    cantidad={producto.cantidad}
                                                    onIncrementar={() => incrementarCantidad(producto.id)}
                                                    onDecrementar={() => decrementarCantidad(producto.id)}
                                                />
                                            </li>
                                        ))}
                                </ul>
                            ) : (
                                <p>No hay productos disponibles para este comercio.</p>
                            )}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default Accordion;
