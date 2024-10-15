import React from 'react';
import Slider from 'react-slick';
import { Button } from 'react-bootstrap';

import AboutUs from './AboutUs';
import Updates from './Updates';
import Tutorials from './Tutorials';
import Proximamente from './Proximamente';

// Componentes personalizados para los botones laterales
const NextArrow = (props) => {
    const { onClick } = props;
    return (
        <Button 
            variant="outline-primary" 
            className="slick-next" 
            style={{ 
                position: 'absolute', 
                top: '50%', 
                right: '-40px',
                zIndex: '1', 
                transform: 'translateY(-50%)' 
            }} 
            onClick={onClick}>
        </Button>
    );
};

const PrevArrow = (props) => {
    const { onClick } = props;
    return (
        <Button 
            variant="outline-primary" 
            className="slick-prev" 
            style={{ 
                position: 'absolute', 
                top: '50%', 
                left: '-40px',
                zIndex: '1', 
                transform: 'translateY(-50%)' 
            }} 
            onClick={onClick}>
        </Button>
    );
};

const UnknownUser = ({ signInWithGoogle }) => {
    const settings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: false,
        nextArrow: <NextArrow />, // Botón siguiente
        prevArrow: <PrevArrow />  // Botón anterior
    };

    return (
        <div className='container'>
            <Button variant="outline-success" className="ml-3" onClick={signInWithGoogle}>
                Iniciar sesión con Google
            </Button>
            <Slider {...settings}>
                <div>
                    <AboutUs />
                </div>
                <div>
                    <Updates />
                </div>
                <div>
                    <Tutorials />
                </div>
                <div>
                    <Proximamente />
                </div>
            </Slider>
        </div>
    );
};

export default UnknownUser;
