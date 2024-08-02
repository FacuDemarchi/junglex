import React from 'react';
import { Navbar, Nav, Dropdown } from 'react-bootstrap';
import { BsPersonFill } from "react-icons/bs";
import { useAuth } from '../../context/AuthContext';

const HeaderComercio = ({ user, onViewChange }) => {
    const { signOut } = useAuth();

    return (
        <Navbar bg="light" expand="lg">
            <Navbar.Brand href="#home" className="mr-3">Junglex</Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
                <Nav className="mr-auto">
                    {/* Puedes agregar elementos específicos para comercios aquí */}
                </Nav>
                <Dropdown className="ml-3">
                    <Dropdown.Toggle variant="success" id="dropdown-basic">
                        <BsPersonFill />
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                        <Dropdown.Item disabled>{user.email}</Dropdown.Item>
                        <Dropdown.Item onClick={() => onViewChange('Comprar')}>Comprar</Dropdown.Item>
                        <Dropdown.Item onClick={() => onViewChange('Pedidos')}>Pedidos Pendientes</Dropdown.Item> {/* Default page */}
                        <Dropdown.Item onClick={() => onViewChange('HistorialPedidos')}>Historial de pedidos</Dropdown.Item>
                        <Dropdown.Item onClick={() => onViewChange('Config')}>Configuración del comercio</Dropdown.Item>
                        <Dropdown.Item onClick={() => onViewChange('Products')}>Productos</Dropdown.Item>
                        <Dropdown.Item onClick={signOut}>Cerrar sesión</Dropdown.Item>
                    </Dropdown.Menu>
                </Dropdown>
            </Navbar.Collapse>
        </Navbar>
    );
};

export default HeaderComercio;
