import React from 'react';
import './Index.css';
import { useAuth } from "../../context/AuthContext";

const Index = () => {
  const { signInWithGoogle } = useAuth();

  return (
    <div className="index-container">
      {/* Logo */}
      <div>
        <img
          src="https://afuwvuyeqclmmqbryjwr.supabase.co/storage/v1/object/public/comercios//Logo.svg"
          alt="Junglex Logo"
          className="index-logo"
        />
      </div>

      {/* Slogan */}
      <h1 className="index-slogan">Creando valor mediante criptomonedas</h1>

      {/* Optional Call to Action */}
      <p className="index-subtitle">
        Descubre cómo estamos revolucionando el comercio digital.
      </p>

      {/* Contenedor de botones */}
      <div className="index-button-container">
        <button
          onClick={signInWithGoogle}
          className="index-button index-button-primary"
        >
          Iniciar sesión con Google
        </button>
      </div>
    </div>
  );
};

export default Index;
