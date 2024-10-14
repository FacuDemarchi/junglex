import React, { useEffect, useState } from 'react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import './TagFiltroCarousel.css'; // Asegúrate de crear este archivo para los estilos

const TagFiltroCarousel = ({ productos, selectedTag, onTagSelect }) => {
    const [tags, setTags] = useState([]);

    useEffect(() => {
        const uniqueTags = [...new Set(productos.map(producto => producto.tags.nombre))];
        setTags(uniqueTags);
    }, [productos]);

    const handleTagClick = (tag) => {
        onTagSelect(tag === selectedTag ? null : tag);
    };

    const settings = {
        dots: false,
        infinite: true,
        speed: 500,
        slidesToShow: 4,
        slidesToScroll: 1,
        responsive: [
            {
                breakpoint: 1024,
                settings: { slidesToShow: 2 },
            },
            {
                breakpoint: 600,
                settings: { slidesToShow: 1 },
            },
        ],
    };

    return (
        <div className="tag-filtro-carousel mb-3">
            <Slider {...settings}>
                {tags.map((tag, index) => (
                    <div key={index} className="text-center" style={{ padding: '10px' }}>
                        <button
                            className={`btn btn-outline-primary mx-1 ${selectedTag === tag ? 'active' : ''}`}
                            onClick={() => handleTagClick(tag)}
                            style={{ width: '100%', padding: '10px 15px', borderRadius: '5px' }}
                        >
                            {tag}
                        </button>
                    </div>
                ))}
            </Slider>
            <style jsx>{`
                .active {
                    background-color: #007bff;
                    color: white;
                }
            `}</style>
        </div>
    );
};

export default TagFiltroCarousel;
