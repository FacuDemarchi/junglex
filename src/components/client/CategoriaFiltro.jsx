import React from 'react';
import './styles/CategoriaFiltro.css'; // Importa los estilos

const CategoriaFiltro = ({ categoriasConTags, filtroSeleccionado, onFilterSelect, onClearFilters }) => {
    const { tipo, valor } = filtroSeleccionado || {};

    return (
        <div className="categoria-filtro-container position-relative">
            {/* Botón de borrar filtros */}
            {filtroSeleccionado && (
                <button
                    className="btn btn-sm btn-outline-danger clear-filters-btn"
                    onClick={onClearFilters}
                >
                    Borrar Filtros
                </button>
            )}
            <ul className="categoria-filtro-list">
                {categoriasConTags.map(({ categoria, tags }) => (
                    <li key={categoria} className="categoria-filtro-item">
                        {/* Categoría */}
                        <button
                            className={`categoria-button ${
                                tipo === 'categoría' && valor === categoria ? 'active' : ''
                            }`}
                            onClick={() => onFilterSelect(categoria, 'categoría')}
                        >
                            {categoria}
                        </button>
                        {/* Tags */}
                        <ul className="tag-list">
                            {tags.map((tag) => (
                                <li key={tag} className="tag-item">
                                    <button
                                        className={`tag-button ${
                                            tipo === 'tag' && valor === tag ? 'active' : ''
                                        }`}
                                        onClick={() => onFilterSelect(tag, 'tag')}
                                    >
                                        {tag}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default CategoriaFiltro;
