import React from 'react';
import { Modal, Button } from 'react-bootstrap';

const DetallesModal = ({ detalles, mostrar, onClose }) => {
    return (
        <Modal show={mostrar} onHide={onClose}>
            <Modal.Header closeButton>
                <Modal.Title>Detalles del Pedido</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <ul>
                    {detalles && detalles.map(({ productos, cantidad }, idx) => (
                        <li key={idx}>
                            {cantidad}x {productos.nombre} - ${productos.precio.toFixed(2)}
                        </li>
                    ))}
                </ul>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onClose}>Cerrar</Button>
            </Modal.Footer>
        </Modal>
    );
};

export default DetallesModal;
