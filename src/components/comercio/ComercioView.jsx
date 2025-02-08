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
          .eq('id', user.id); // Se usa 'id' en lugar de 'user_id'

        if (error) {
          console.error('Error fetching comercio data:', error);
          return;
        }

        // Si no hay configuración del comercio, se muestra el modal
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
    <div className="container mt-4">
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
        user={user}
      />
    </div>
  );
};

export default ComercioView;
