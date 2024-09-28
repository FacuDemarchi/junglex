import React from 'react';
import { Accordion, Card, Button } from 'react-bootstrap';

const NextFeatures = () => {
    return (
        <Accordion>
            <Card>
                <Card.Header>
                    <Accordion.Toggle as={Button} variant="link" eventKey="0">
                        Característica 1: Integración de Criptomonedas Estables
                    </Accordion.Toggle>
                </Card.Header>
                <Accordion.Collapse eventKey="0">
                    <Card.Body>
                        Esta característica permitirá a los usuarios utilizar monedas estables (como USDT o DAI) para realizar pagos. Esto reducirá la volatilidad del valor de las criptomonedas y ofrecerá una experiencia más segura tanto para los clientes como para los comercios.
                    </Card.Body>
                </Accordion.Collapse>
            </Card>

            <Card>
                <Card.Header>
                    <Accordion.Toggle as={Button} variant="link" eventKey="1">
                        Característica 2: Recompensas por Transacciones
                    </Accordion.Toggle>
                </Card.Header>
                <Accordion.Collapse eventKey="1">
                    <Card.Body>
                        Los usuarios recibirán recompensas en criptomonedas por cada transacción realizada en la plataforma. Esto incentivará un uso recurrente de la plataforma y fomentará la adopción de criptomonedas en el comercio diario.
                    </Card.Body>
                </Accordion.Collapse>
            </Card>

            <Card>
                <Card.Header>
                    <Accordion.Toggle as={Button} variant="link" eventKey="2">
                        Característica 3: Pago por Escaneo de Código QR
                    </Accordion.Toggle>
                </Card.Header>
                <Accordion.Collapse eventKey="2">
                    <Card.Body>
                        Esta característica permitirá a los usuarios realizar pagos simplemente escaneando un código QR en el comercio. Esto simplificará el proceso de pago, haciéndolo rápido y seguro, ideal para pequeños comercios y transacciones rápidas.
                    </Card.Body>
                </Accordion.Collapse>
            </Card>

            <Card>
                <Card.Header>
                    <Accordion.Toggle as={Button} variant="link" eventKey="4">
                        Característica 4: Compra de criptomonedas mediante tarjeta de débito/crédito
                    </Accordion.Toggle>
                </Card.Header>
                <Accordion.Collapse eventKey="4">
                    <Card.Body>
                        <strong>Descripción:</strong> Esta funcionalidad permitirá a los usuarios adquirir criptomonedas directamente desde la plataforma utilizando tarjetas de débito o crédito. Esto abrirá la puerta a una audiencia más amplia, permitiendo que usuarios sin experiencia previa en criptomonedas puedan realizar compras de forma sencilla y segura.
                        <br /><br />
                        <strong>Funcionamiento:</strong> La plataforma se integrará con proveedores de servicios de pago que permiten transacciones con tarjetas de débito/crédito. Al seleccionar la opción de compra de criptomonedas, los usuarios podrán ingresar los detalles de su tarjeta, elegir la criptomoneda y la cantidad que desean comprar. Una vez realizada la transacción, las criptomonedas se depositarán directamente en la billetera vinculada del usuario. La plataforma también implementará medidas de seguridad avanzadas como la autenticación 3D Secure para proteger las transacciones.
                    </Card.Body>
                </Accordion.Collapse>
            </Card>

            <Card>
                <Card.Header>
                    <Accordion.Toggle as={Button} variant="link" eventKey="5">
                        Característica 5: Integración con plataformas que ofrecen el servicio de cadetería
                    </Accordion.Toggle>
                </Card.Header>
                <Accordion.Collapse eventKey="5">
                    <Card.Body>
                        <strong>Descripción:</strong> Este servicio estará disponible para aquellos comercios que no cuenten con sus propios medios de entrega. Al integrar la plataforma con servicios de cadetería externos, los comercios podrán delegar la logística de envío a empresas especializadas, permitiendo una experiencia más fluida tanto para el comercio como para el cliente.
                        <br /><br />
                        <strong>Funcionamiento:</strong> Al confirmar un pedido, los comercios podrán seleccionar una opción de entrega con cadetería. Automáticamente, se notificará a la empresa asociada que se encargará de recoger y entregar el pedido al cliente. El estado del envío se actualizará en tiempo real en la plataforma, permitiendo que tanto el comercio como el cliente puedan hacer seguimiento del pedido hasta su entrega.
                    </Card.Body>
                </Accordion.Collapse>
            </Card>

            

            {/* <Card>
                <Card.Header>
                    <Accordion.Toggle as={Button} variant="link" eventKey="2">
                        Característica N: Titulo del feature
                    </Accordion.Toggle>
                </Card.Header>
                <Accordion.Collapse eventKey="2">
                    <Card.Body>
                        Descripción del Feature a crear
                    </Card.Body>
                </Accordion.Collapse>
            </Card> */}
        </Accordion>
    );
};

export default NextFeatures;
