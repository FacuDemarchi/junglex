import React from 'react';
import CantidadControl from './CantidadControl';
import './styles/ProductoCard.css';

const ProductoCard = ({ producto, onIncrementar, onDecrementar }) => {
    return (
        <div className="producto-card">
            <div className="producto-info">
                <h5 className="producto-nombre">{producto.nombre}</h5>
                <p className="producto-precio">Precio: ${producto.precio}</p>
                <p className="producto-descripcion">
                    {producto.descripcion || 'Sin descripción disponible.'}
                </p>
            </div>
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
