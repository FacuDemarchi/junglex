import React, { useState, useEffect } from 'react';
import Carousel from 'react-bootstrap/Carousel';
import 'bootstrap/dist/css/bootstrap.min.css';

const TagFiltroCarousel = ({ productos, selectedTag, onTagSelect }) => {
    const [tagsPerPage, setTagsPerPage] = useState(3); // Inicialmente mostramos 3 tags por página

    useEffect(() => {
        const calculateTagsPerPage = () => {
            const containerWidth = document.querySelector('.tag-filtro-carousel')?.offsetWidth;
            const buttonWidth = 110; // Ancho aproximado de un botón de tag (ajustar según tu diseño)
            if (containerWidth && buttonWidth > 0) {
                const newTagsPerPage = Math.floor(containerWidth / buttonWidth);
                setTagsPerPage(newTagsPerPage > 0 ? newTagsPerPage : 1);
            }
        };

        calculateTagsPerPage();

        window.addEventListener('resize', calculateTagsPerPage);
        return () => window.removeEventListener('resize', calculateTagsPerPage);
    }, []);

    const tags = [...new Set(productos.flatMap(producto => producto.tag))];

    const handleTagClick = (tag) => {
        onTagSelect(tag === selectedTag ? null : tag); // Toggle selección de tag
    };

    const renderTags = () => {
        const tagPages = [];
        for (let i = 0; i < tags.length; i += tagsPerPage) {
            const tagsChunk = tags.slice(i, i + tagsPerPage);
            tagPages.push(
                <Carousel.Item key={i}>
                    <div className="d-flex justify-content-center">
                        {tagsChunk.map((tag, index) => (
                            <button
                                key={index}
                                className={`btn btn-outline-primary mx-1 ${selectedTag === tag ? 'active' : ''}`}
                                onClick={() => handleTagClick(tag)}
                            >
                                {tag}
                            </button>
                        ))}
                    </div>
                </Carousel.Item>
            );
        }
        return tagPages;
    };

    return (
        <div className="tag-filtro-carousel mb-3">
            <Carousel>
                {renderTags()}
            </Carousel>
        </div>
    );
};

export default TagFiltroCarousel;
