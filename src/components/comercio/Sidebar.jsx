import React from 'react';

const Sidebar = ({ currentView, handleComercioView }) => {
    const views = [
        { name: 'Mis Pedidos', value: 'MisPedidos' },
        { name: 'Historial', value: 'HistorialPedidos' },
        { name: 'Configuración', value: 'Config' },
    ];

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
            </ul>
        </div>
    );
};

export default Sidebar;