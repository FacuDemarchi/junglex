import React from 'react';

const CategoriaFiltro = ({ categorias, categoriaSeleccionada, setCategoriaSeleccionada, onClearFilters }) => {
    const handleCategoriaClick = (categoria) => {
        setCategoriaSeleccionada(categoria);
    };

    return (
        <div className="list-group">
            {categorias.map((categoria) => (
                <button
                    key={categoria}
                    className={`list-group-item list-group-item-action ${categoriaSeleccionada === categoria ? 'active' : ''}`}
                    onClick={() => handleCategoriaClick(categoria)}
                >
                    {categoria}
                </button>
            ))}
        </div>
    );
};

export default CategoriaFiltro;
