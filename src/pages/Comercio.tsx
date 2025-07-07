import React, { useEffect, useState } from 'react';
import Sidebar from '../components/comercio/Sidebar';
import Header from '../components/common/Header';
import MisPedidos from '../components/comercio/MisPedidos';
import HistorialPedidos from '../components/comercio/HistorialPedidos';
import ConfigComercio from '../components/comercio/ConfigComercio';
import ConfigComercioModal from '../components/comercio/RegistrarComercio';
import Posicion from '../components/comercio/Posicion';
import supabase from '../supabase/supabase.config';
// import styles from './styles/Comercio.module.css';

interface UserLocation {
    id: string;
    address: string;
    latitude: number;
    longitude: number;
    user_id: string;
}

interface User {
    id: string;
    user_data?: {
        user_type: string;
    };
}

interface ComercioViewProps {
    user: User;
    currentView: string;
    handleComercioView: (view: string) => void;
}

const ComercioView: React.FC<ComercioViewProps> = ({ user, currentView, handleComercioView }) => {
    const [showConfigModal, setShowConfigModal] = useState<boolean>(false);
    const [selectedLocation, setSelectedLocation] = useState<UserLocation | null>(null);

    const handleSelectLocation = (location: UserLocation) => {
        setSelectedLocation(location);
    };

    const renderView = () => {
        switch (currentView) {
            case 'HistorialPedidos':
                return <HistorialPedidos user={user} />;
            case 'Config':
                return <ConfigComercio user={user} />;
            case 'PosicionarComercio':
                return <Posicion />;
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
                    .eq('id', user.id);

                if (error) {
                    console.error('Error fetching comercio data:', error);
                    return;
                }

                if (!data || data.length === 0) {
                    setShowConfigModal(true);
                }
            } catch (error) {
                console.error('Error en fetchComercioData:', error);
            }
        };

        fetchComercioData();
    }, [user]);

    return (
        <div className="min-h-screen bg-gray-100 p-2">
            <Header 
                user={user} 
                selectedLocation={selectedLocation}
                handleSelectLocation={handleSelectLocation}
                handleComercioView={handleComercioView} 
            />
            <div className="flex gap-5 mt-2.5">
                <div className="flex-none w-52 bg-gray-50 rounded-lg p-4 shadow-md">
                    <Sidebar currentView={currentView} handleComercioView={handleComercioView} />
                </div>
                <div className="flex-1 bg-white rounded-lg shadow-md">
                    <div className="min-h-[400px]">
                        {renderView()}
                    </div>
                </div>
            </div>

            <ConfigComercioModal
                show={showConfigModal}
                onHide={() => setShowConfigModal(false)}
                user={user}
            />
        </div>
    );
};

export default ComercioView;
