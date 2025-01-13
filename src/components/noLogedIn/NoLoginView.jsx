import React from 'react';
import { useAuth } from "../../context/AuthContext";

const NoLoginView = () => {
  const { signInWithGoogle } = useAuth();

  return (
    <div
      className="d-flex flex-column justify-content-center align-items-center vh-100 m-0"
      style={{
        backgroundColor: '#50745f',
        margin: 0,
        padding: 0,
      }}
    >
      {/* Logo */}
      <div className="mb-4">
        <img
          src="logo.svg"
          alt="Junglex Logo"
          className="img-fluid"
          style={{ maxWidth: '150px' }}
        />
      </div>

      {/* Slogan */}
      <h1 className="text-center text-white">Creando valor mediante criptomonedas</h1>

      {/* Optional Call to Action */}
      <p className="text-center mt-3 text-light">
        Descubre cómo estamos revolucionando el comercio digital.
      </p>

      {/* Botón de inicio de sesión */}
      <button
        onClick={signInWithGoogle}
        className="btn btn-light mt-4"
        style={{
          padding: '10px 20px',
          fontSize: '16px',
          borderRadius: '5px',
          fontWeight: 'bold',
        }}
      >
        Iniciar sesión con Google
      </button>
    </div>
  );
};

export default NoLoginView;
