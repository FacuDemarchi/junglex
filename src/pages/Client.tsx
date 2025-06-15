import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import Header from '../components/common/Header';
import Sidebar from '../components/client/Sidebar';
import './styles/Client.modal.css';

interface UserLocation {
  id: string;
  address: string;
  latitude: number;
  longitude: number;
  user_id: string;
}

interface ClientProps {
  currentView: string;
}

const Client: React.FC<ClientProps> = ({ currentView }) => {
  const { user } = useAuth();
  const [selectedLocation, setSelectedLocation] = useState<UserLocation | null>(null);

  const handleSelectLocation = (location: UserLocation) => {
    setSelectedLocation(location);
  };

  if (!user) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="client-container">
      <Header 
        user={user}
        selectedLocation={selectedLocation}
        handleSelectLocation={handleSelectLocation}
      />
      <div className="main-content">
        <Sidebar 
          currentView={currentView}
        />
        <div className="view-container">
          {/* Aquí irá el contenido de la vista actual */}
        </div>
      </div>
    </div>
  );
};

export default Client; 