import React from 'react';
import CantidadControl from './CantidadControl';
import './styles/ProductoCard.css';

const ProductoCard = ({ producto, onIncrementar, onDecrementar }) => {
    return (
        <div className="producto-card">
            <div className="producto-header">
                {/* Solo mostrar la imagen si existe */}
                {producto.img && (
                    <div className="producto-imagen">
                        <img 
                            src={producto.img} 
                            alt={producto.nombre}
                        />
                    </div>
                )}
                <div className="producto-info">
                    <h5 className="producto-nombre">{producto.nombre}</h5>
                    <p className="producto-precio">${producto.precio}</p>
                </div>
            </div>
            <p className="producto-descripcion">
                {producto.descripcion || 'Sin descripción disponible.'}
            </p>
            <div className="producto-controles">
                <CantidadControl
                    cantidad={producto.cantidad}
                    onIncrementar={onIncrementar}
                    onDecrementar={onDecrementar}
                />
            </div>
        </div>
    );
};

export default ProductoCard;
