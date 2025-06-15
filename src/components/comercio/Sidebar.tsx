import React from 'react';
import { useNavigate } from 'react-router-dom';

interface View {
  name: string;
  value: string;
}

interface SidebarProps {
  currentView: string;
  handleComercioView: (view: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, handleComercioView }) => {
  const navigate = useNavigate();
  
  const views: View[] = [
    { name: 'Mis Pedidos', value: 'MisPedidos' },
    { name: 'Historial', value: 'HistorialPedidos' },
    { name: 'Configuración', value: 'Config' },
  ];

  const handleComprar = () => {
    navigate('/vista-cliente');
  };

  return (
    <div className="bg-light border-right" style={{ height: '100vh', padding: '15px' }}>
      <h5>Navegación</h5>
      <ul className="nav flex-column">
        {views.map(view => (
          <li key={view.value} className="nav-item">
            <button
              className={`nav-link btn btn-link ${currentView === view.value ? 'active' : ''}`}
              onClick={() => handleComercioView(view.value)}
              style={{ cursor: 'pointer', textDecoration: 'none' }}
            >
              {view.name}
            </button>
          </li>
        ))}
        
        <li className="nav-item">
          <button
            className="nav-link btn btn-link"
            onClick={handleComprar}
            style={{ cursor: 'pointer', textDecoration: 'none' }}
          >
            Comprar como cliente
          </button>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar; 