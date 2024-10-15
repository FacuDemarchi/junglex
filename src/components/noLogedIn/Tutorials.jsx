import React from 'react';
import { Accordion } from 'react-bootstrap';

const Tutorials = () => {
    return (
        <div>
            <h2>Tutoriales</h2>
            <p>
                En nuestra plataforma, creemos que el uso de criptomonedas debe ser accesible y fácil para todos. Es por eso que hemos creado este apartado de tutoriales. Sabemos que para algunos usuarios, el uso de una wallet de criptomonedas, la compra de criptomonedas o incluso el proceso de realizar un pedido y pagarlo con criptomonedas puede ser nuevo. Con estos tutoriales, aprenderás de manera sencilla cómo utilizar todas las funciones de nuestra plataforma.
            </p>

            <h3>¿Por qué es importante este apartado?</h3>
            <p>
                Las criptomonedas son una tecnología nueva para muchos, y es esencial que nuestros usuarios sepan cómo utilizarlas de manera segura y efectiva dentro de la plataforma. Aquí te enseñamos:
            </p>
            <Accordion>
                <Accordion.Item eventKey='0'>
                    <Accordion.Header><img src={`${process.env.PUBLIC_URL}/MetaMask.png`} alt="MetaMask" style={{ width: '30px', margin: '10px' }}/><strong>Cómo configurar y usar una billetera de criptomonedas</strong></Accordion.Header>
                    <Accordion.Body>
                        <p>
                            Aprende a descargar, <strong><a href='https://metamask.io/es/download/' target='blank' rel='noopener noreferrer'>instalar metamask</a></strong> y configurar una wallet compatible con nuestra plataforma.
                        </p>
                        <iframe
                            width="560"
                            height="315"
                            src="https://www.youtube.com/embed/-_xzREBS0No" 
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen>
                        </iframe>
                    </Accordion.Body>
                </Accordion.Item>
                <Accordion.Item eventKey='3'>
                    <Accordion.Header><strong>Qué son las redes de criptomonedas</strong></Accordion.Header>
                    <Accordion.Body>
                    <iframe
                            width="560"
                            height="315"
                            src="https://www.youtube.com/embed/11NAAdAd8UE" 
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen>
                        </iframe>
                    </Accordion.Body>
                </Accordion.Item>
                <Accordion.Item eventKey='1'>
                    <Accordion.Header><strong>Cómo comprar criptomonedas dentro de la plataforma</strong></Accordion.Header>
                    <Accordion.Body>
                        <p>
                            Te guiamos paso a paso en el proceso de compra de criptomonedas usando tu tarjeta de débito/crédito, para que puedas empezar a utilizar criptomonedas de forma fácil.
                        </p>
                        <iframe
                            width="560"
                            height="315"
                            src="https://www.youtube.com/embed/VIDEO_ID" // Reemplaza VIDEO_ID con el ID del video de YouTube
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen>
                        </iframe>
                    </Accordion.Body>
                </Accordion.Item>
                <Accordion.Item eventKey='2'>
                    <Accordion.Header><strong>Cómo realizar un pedido y pagar con criptomonedas</strong></Accordion.Header>
                    <Accordion.Body>
                        <p>
                            Descubre cómo seleccionar productos, realizar un pedido y finalizar el pago utilizando criptomonedas, todo dentro de nuestra plataforma.
                        </p>
                        <iframe
                            width="560"
                            height="315"
                            src="https://www.youtube.com/embed/VIDEO_ID" // Reemplaza VIDEO_ID con el ID del video de YouTube
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen>
                        </iframe>
                    </Accordion.Body>
                </Accordion.Item>
            </Accordion>
        </div>
    );
};

export default Tutorials;
