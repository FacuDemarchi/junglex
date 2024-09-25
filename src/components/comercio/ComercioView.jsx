import React, { useState } from 'react';
import HeaderComercio from './HeaderComercio';
import MisPedidos from './MisPedidos';
import MisProductos from './MisProductos';
import HistorialPedidos from './HistorialPedidos';
import ConfigComercio from './ConfigComercio';
import ClientView from '../client/ClientView';

const ComercioView = ({ user }) => {
    const [currentView, setCurrentView] = useState('Pedidos');
    
    const handleViewChange = (view) => {
        setCurrentView(view);
    };

    const renderView = () => {
        switch (currentView) {
            case 'Comprar':
                return <ClientView user={user} userComercio={'userComercio'}/>;
            case 'HistorialPedidos':
                return <HistorialPedidos user={user} />;
            case 'Config':
                return <ConfigComercio user={user} />;
            case 'Products':
                return <MisProductos user={user} />;
            default:
                return <MisPedidos user={user} />;
        }
    };

    return (
        <div className='container mt-4'>
            <HeaderComercio user={user} onViewChange={handleViewChange} />
            {renderView()}
        </div>
    );
};

export default ComercioView;
