import React from 'react';

const CantidadControl = ({ cantidad, onIncrementar, onDecrementar }) => {
    return (
        <div className="d-flex align-items-center">
            <button className="btn btn-primary me-2" onClick={onDecrementar}>-</button>
            <span className="mx-3">{cantidad}</span>
            <button className="btn btn-primary ms-2" onClick={onIncrementar}>+</button>
        </div>
    );
};

export default CantidadControl;
