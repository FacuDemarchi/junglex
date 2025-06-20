import React from 'react';
import { useNavigate } from 'react-router-dom';

interface SidebarProps {
    currentView: string;
    handleComercioView: (view: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, handleComercioView }) => {
    const navigate = useNavigate();
    
    const views = [
        { name: 'Mis Pedidos', value: 'MisPedidos' },
        { name: 'Historial', value: 'HistorialPedidos' },
        { name: 'Configuración', value: 'Config' },
        { name: 'Posicionar mi comercio', value: 'PosicionarComercio' },
    ];

    const handleComprar = () => {
        // Redirigir a la vista de cliente
        navigate('/vista-cliente');
    };

    return (
        <aside
            className="d-flex flex-column"
            style={{
                minHeight: '100vh',
                background: 'var(--light-color)',
                borderRight: '1px solid var(--border-color)',
                padding: 'var(--spacing-md) 0 var(--spacing-md) var(--spacing-md)',
                width: 200,
                boxSizing: 'border-box',
            }}
        >
            <nav style={{ flex: 1 }}>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {views.map((view, idx) => (
                        <li key={view.value} style={{ marginBottom: 'var(--spacing-sm)' }}>
                            <button
                                onClick={() => handleComercioView(view.value)}
                                style={{
                                    width: '100%',
                                    background: currentView === view.value ? 'var(--primary-color)' : 'transparent',
                                    color: currentView === view.value ? 'var(--text-light)' : 'var(--primary-color)',
                                    border: 'none',
                                    borderRadius: 'var(--border-radius)',
                                    padding: 'var(--spacing-xs) var(--spacing-sm)',
                                    fontWeight: 'var(--font-weight-bold)',
                                    fontSize: 'var(--font-size-sm)',
                                    cursor: 'pointer',
                                    transition: 'background 0.2s',
                                    textAlign: 'left',
                                }}
                            >
                                {view.name}
                            </button>
                            {view.value === 'PosicionarComercio' && (
                                <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: 'var(--spacing-sm) 0' }} />
                            )}
                        </li>
                    ))}
                    <li style={{ marginTop: 'var(--spacing-md)' }}>
                        <button
                            onClick={handleComprar}
                            style={{
                                width: '100%',
                                background: 'transparent',
                                color: 'var(--primary-color)',
                                border: 'none',
                                borderRadius: 'var(--border-radius)',
                                padding: 'var(--spacing-xs) var(--spacing-sm)',
                                fontWeight: 'var(--font-weight-bold)',
                                fontSize: 'var(--font-size-sm)',
                                cursor: 'pointer',
                                transition: 'background 0.2s',
                                textAlign: 'left',
                            }}
                        >
                            Comprar como cliente
                        </button>
                    </li>
                </ul>
            </nav>
        </aside>
    );
};

export default Sidebar;