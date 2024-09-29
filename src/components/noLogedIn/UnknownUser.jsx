import React from 'react';
import Slider from 'react-slick';
import { Button } from 'react-bootstrap';

import AboutUs from './AboutUs';
import Updates from './Updates';
import Tutorials from './Tutorials';

const UnknownUser = ({ signInWithGoogle }) => {
    const settings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: false
    };

    return (
        <div>
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
                    {/* <NextFeatures /> */}
                </div>
            </Slider>
        </div>
    );
};

export default UnknownUser;
