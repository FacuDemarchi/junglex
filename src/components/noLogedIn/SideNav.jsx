import React from 'react';
import { Nav } from 'react-bootstrap';

const SideNav = () => {
  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <Nav className="flex-column bg-light p-3 rounded sticky-top" style={{ top: '20px' }}>
      <Nav.Link 
        className="text-success" 
        onClick={() => scrollToSection('about')}
      >
        Sobre Nosotros
      </Nav.Link>
      <Nav.Link 
        className="text-success" 
        onClick={() => scrollToSection('tutorials')}
      >
        Tutoriales
      </Nav.Link>
      <Nav.Link 
        className="text-success" 
        onClick={() => scrollToSection('coming-soon')}
      >
        Próximamente
      </Nav.Link>
    </Nav>
  );
};

export default SideNav;