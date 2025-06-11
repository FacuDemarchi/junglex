import React, { useState, useEffect } from 'react';
import styles from './styles/CategoriaFiltro.module.css';

interface Tag {
    nombre: string;
}

interface CategoriaConTags {
    categoria: string;
    tags: string[];
}

interface FiltroSeleccionado {
    tipo: 'categoría' | 'tag';
    valor: string;
}

interface CategoriaFiltroProps {
    categoriasConTags: CategoriaConTags[];
    filtroSeleccionado: FiltroSeleccionado | null;
    onFilterSelect: (filtro: string, tipo: 'categoría' | 'tag') => void;
    onClearFilters?: () => void;
}

const CategoriaFiltro: React.FC<CategoriaFiltroProps> = ({
    categoriasConTags,
    filtroSeleccionado,
    onFilterSelect,
    onClearFilters
}) => {
    const [categoriaExpandida, setCategoriaExpandida] = useState<string | null>(null);

    useEffect(() => {
        if (categoriasConTags.length > 0 && !categoriaExpandida) {
            setCategoriaExpandida(categoriasConTags[0].categoria);
        }
    }, [categoriasConTags, categoriaExpandida]);

    const toggleCategoria = (categoria: string) => {
        setCategoriaExpandida(categoriaExpandida === categoria ? null : categoria);
    };

    const handleTagClick = (categoria: string, tag: string) => {
        if (filtroSeleccionado?.tipo === 'tag' && filtroSeleccionado?.valor === tag) {
            onFilterSelect('', 'tag');
        } else {
            onFilterSelect(tag, 'tag');
        }
    };

    const handleCategoriaClick = (categoria: string) => {
        toggleCategoria(categoria);
        if (filtroSeleccionado?.tipo === 'categoría' && filtroSeleccionado?.valor === categoria) {
            onFilterSelect('', 'categoría');
        } else {
            onFilterSelect(categoria, 'categoría');
        }
    };

    return (
        <div className={styles.categoriaFiltroContainer}>
            <div className={styles.categoriaFiltroHeader}>
                {/* <h3 className={styles.categoriaFiltroTitle}>Categorías</h3> */}
                {filtroSeleccionado && onClearFilters && (
                    <button 
                        className={styles.clearFiltersButton}
                        onClick={onClearFilters}
                    >
                        Limpiar filtros
                    </button>
                )}
            </div>
            <ul className={styles.categoriaFiltroList}>
                {categoriasConTags.map(({ categoria, tags }) => (
                    <li key={categoria} className={styles.categoriaFiltroItem}>
                        <button
                            className={`${styles.categoriaFiltroButton} ${
                                filtroSeleccionado?.tipo === 'categoría' && 
                                filtroSeleccionado?.valor === categoria ? styles.active : ''
                            }`}
                            onClick={() => handleCategoriaClick(categoria)}
                        >
                            {categoria}
                            <span className={`${styles.dropdownIcon} ${categoriaExpandida === categoria ? styles.active : ''}`}>
                                ▼
                            </span>
                        </button>
                        <div className={`${styles.categoriaFiltroTags} ${categoriaExpandida === categoria ? styles.expanded : ''}`}>
                            {tags.map((tag) => (
                                <button
                                    key={tag}
                                    className={`${styles.categoriaFiltroTag} ${
                                        filtroSeleccionado?.tipo === 'tag' &&
                                        filtroSeleccionado?.valor === tag
                                            ? styles.active
                                            : ''
                                    }`}
                                    onClick={() => handleTagClick(categoria, tag)}
                                >
                                    {tag}
                                </button>
                            ))}
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default CategoriaFiltro; 