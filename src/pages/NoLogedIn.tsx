import React, { useEffect } from 'react';
import { useAuth } from "../context/AuthContext";
import supabase from '../supabase/supabase.config';
import styles from './styles/NoLogedIn.module.css';

interface UserData {
  user_id: string;
  user_type: 'cliente' | 'comercio';
}

const Index: React.FC = () => {
  const { user, signInWithGoogle } = useAuth();

  useEffect(() => {
    if (user) {
      const setNewUser = async (): Promise<void> => {
        const userData: UserData = {
          user_id: user.id,
          user_type: 'cliente'
        };

        const { error } = await supabase
          .from('user_data')
          .upsert(userData);

        if (error) {
          console.error('Error al guardar el usuario', error);
        }
      };

      setNewUser();
    }
  }, [user]);

  return (
    <div className={styles.container}>
      <div>
        <img
          src="https://afuwvuyeqclmmqbryjwr.supabase.co/storage/v1/object/public/comercios//Logo.svg"
          alt="Junglex Logo"
          className={styles.logo}
        />
      </div>

      <h1 className={styles.slogan}>Creando valor mediante criptomonedas</h1>

      <p className={styles.subtitle}>
        Descubre cómo estamos revolucionando el comercio digital.
      </p>

      <div className={styles.buttonContainer}>
        <button
          onClick={signInWithGoogle}
          className={styles.buttonPrimary}
          type="button"
        >
          Iniciar sesión con Google
        </button>
      </div>
    </div>
  );
};

export default Index; 