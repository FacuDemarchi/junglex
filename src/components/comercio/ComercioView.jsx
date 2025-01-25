import React, { useEffect, useState } from 'react';
import Sidebar from './Sidebar';
import Header from '../common/Header';
import MisPedidos from './MisPedidos';
import HistorialPedidos from './HistorialPedidos';
import ConfigComercio from './ConfigComercio';
import ConfigComercioModal from './ConfigComercioModal';
import supabase from '../../supabase/supabase.config';

const ComercioView = ({ user, currentView, handleComercioView }) => {
    const [showConfigModal, setShowConfigModal] = useState(false);

    const renderView = () => {
        switch (currentView) {
            case 'HistorialPedidos':
                return <HistorialPedidos user={user} />;
            case 'Config':
                return <ConfigComercio user={user} />;
            default:
                return <MisPedidos user={user} />;
        }
    };

    useEffect(() => {
        const fetchComercioData = async () => {
            try {
                const { data, error } = await supabase
                    .from('comercios')
                    .select('*')
                    .eq('user_id', user.id)

                // Si no hay datos, muestra el modal de configuración
                if (error.code === '42703') {
                    setShowConfigModal(true)
                } else if (error) {
                    console.error('Error fetching comercio data:', error);
                    return;
                }
                
            } catch (error) {
                console.error('Error en fetchComercioData:', error);
            }
        };

        fetchComercioData();
    }, [user]);

    const handleConfigSubmit = async (formData) => {
        try {
            const { error } = await supabase
                .from('comercio')
                .insert({
                    user_id: user.id,
                    nombre: formData.nombre,
                    telefono: formData.telefono,
                    logo_url: formData.logo_url,
                    direccion: formData.direccion,
                    latitude: formData.latitude,
                    longitude: formData.longitude,
                });

            if (error) {
                console.error('Error guardando configuración:', error);
                return;
            }

            // Cierra el modal después de guardar la configuración
            setShowConfigModal(false);
        } catch (error) {
            console.error('Error en handleConfigSubmit:', error);
        }
    };

    return (
        <div className='container mt-4'>
            <Header user={user} handleComercioView={handleComercioView} />
            <div className="row">
                <div className="col-md-2">
                    <Sidebar currentView={currentView} handleComercioView={handleComercioView} />
                </div>
                <div className="col-md-10">
                    {renderView()}
                </div>
            </div>

            <ConfigComercioModal
                show={showConfigModal}
                onHide={() => setShowConfigModal(false)}
                onSubmit={handleConfigSubmit}
                user={user}
            />
        </div>
    );
};

export default ComercioView;
