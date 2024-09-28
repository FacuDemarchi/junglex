import React, { useState } from 'react';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import { Button } from 'react-bootstrap';

import AboutUs from './AboutUs';
import Updates from './Updates';
import Tutorials from './Tutorials';
import NewFeature from './NewFeature'; // Ya tienes estos componentes

const UnknownUser = ({ signInWithGoogle }) => {
    const [selectedSlide, setSelectedSlide] = useState(0); // Estado para manejar el índice del carrusel

    // Maneja el cambio de slide
    const handleSlideChange = (index) => {
        setSelectedSlide(index);
    };

    return (
        <div>
            <Button variant="outline-success" className="ml-3" onClick={signInWithGoogle}>
                Iniciar sesión con Google
            </Button>
            <Carousel
                onChange={handleSlideChange}
                showThumbs={false}
                showArrows={true}
                infiniteLoop={true}
                autoPlay={false}
            >
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
                    <NewFeature />
                </div>
            </Carousel>
        </div>
    );
};

export default UnknownUser;
