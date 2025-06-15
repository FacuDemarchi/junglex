import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import supabase from '../supabase/supabase.config';
import Sidebar from '../components/comercio/Sidebar';
import Header from '../components/common/Header';
import MisPedidos from '../components/comercio/MisPedidos';
import HistorialPedidos from '../components/comercio/HistorialPedidos';
import ConfigComercio from '../components/comercio/ConfigComercio';
import ConfigComercioModal from '../components/comercio/ConfigComercioModal';
import './styles/Comercio.modal.css';

interface ComercioProps {
  currentView: string;
}

interface User {
  id: string;
  email: string;
  user_metadata: {
    nombre: string;
    apellido: string;
  };
}

interface Location {
  id: string;
  latitude: number;
  longitude: number;
  user_id: string;
  address: string;
}

const Comercio: React.FC<ComercioProps> = ({ currentView }) => {
  const { user } = useAuth();
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);

  useEffect(() => {
    const checkComercioConfig = async () => {
      if (user) {
        const { data, error } = await supabase
          .from('comercios')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error || !data) {
          setShowConfigModal(true);
        }
      }
    };

    checkComercioConfig();
  }, [user]);

  if (!user) {
    return <Navigate to="/login" />;
  }

  const handleSelectLocation = (location: Location) => {
    setSelectedLocation(location);
  };

  const handleComercioView = (view: string) => {
    // Implementar lógica de cambio de vista si es necesario
  };

  const renderView = () => {
    switch (currentView) {
      case 'pedidos':
        return <MisPedidos user={user} />;
      case 'historial':
        return <HistorialPedidos user={user} />;
      case 'config':
        return <ConfigComercio user={user} />;
      default:
        return <MisPedidos user={user} />;
    }
  };

  return (
    <div className="comercio-container">
      <Header 
        user={user}
        selectedLocation={selectedLocation}
        handleSelectLocation={handleSelectLocation}
      />
      <div className="main-content">
        <Sidebar 
          currentView={currentView}
          handleComercioView={handleComercioView}
        />
        <div className="view-container">
          {renderView()}
        </div>
      </div>
      {showConfigModal && (
        <ConfigComercioModal
          show={showConfigModal}
          onHide={() => setShowConfigModal(false)}
          user={user}
        />
      )}
    </div>
  );
};

export default Comercio; 