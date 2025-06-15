import React from 'react';
import { Nav } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import './styles/Sidebar.modal.css';

interface SidebarProps {
  currentView: string;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView }) => {
  return (
    <div className="sidebar">
      <Nav className="flex-column">
        <Nav.Link 
          as={Link} 
          to="/client/pedidos" 
          className={currentView === 'pedidos' ? 'active' : ''}
        >
          Mis Pedidos
        </Nav.Link>
        <Nav.Link 
          as={Link} 
          to="/client/historial" 
          className={currentView === 'historial' ? 'active' : ''}
        >
          Historial
        </Nav.Link>
        <Nav.Link 
          as={Link} 
          to="/client/direcciones" 
          className={currentView === 'direcciones' ? 'active' : ''}
        >
          Mis Direcciones
        </Nav.Link>
      </Nav>
    </div>
  );
};

export default Sidebar; 