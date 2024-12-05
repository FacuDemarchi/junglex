import React from 'react';
import Sidebar from './Sidebar';
import Header from '../common/Header';
import MisPedidos from './MisPedidos';
import MisProductos from './MisProductos';
import HistorialPedidos from './HistorialPedidos';
import ConfigComercio from './ConfigComercio';

const ComercioView = ({ user, currentView, handleComercioView, monedas, selectedMoneda, handleMoneda }) => {

    const renderView = () => {
        switch (currentView) {
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
            <Header user={user} handleComercioView={handleComercioView} monedas={monedas} selectedMoneda={selectedMoneda} handleMoneda={handleMoneda}/>
            <div className="row">
                <div className="col-md-2">
                    <Sidebar currentView={currentView} handleComercioView={handleComercioView} />
                </div>
                <div className="col-md-10">
                    {renderView()}
                </div>
            </div>
        </div>
    );
};

export default ComercioView;
