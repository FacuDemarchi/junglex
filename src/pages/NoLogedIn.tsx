import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import Header from '../components/common/Header';
import './styles/NoLogedIn.modal.css';

const NoLogedIn: React.FC = () => {
  const { user } = useAuth();

  if (user) {
    return <Navigate to="/client" />;
  }

  return (
    <div className="no-loged-in-container">
      <Header 
        user={null}
        selectedLocation={null}
        handleSelectLocation={() => {}}
      />
      <div className="main-content">
        <div className="auth-container">
          <div className="auth-tabs">
            <h2>Bienvenido a Junglex</h2>
            <p>Por favor, inicia sesión para continuar</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoLogedIn; 