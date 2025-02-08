import React, { useEffect, useState, useCallback } from "react";
import { useAuth } from '../../context/AuthContext';
import supabase  from '../../supabase/supabase.config';

const TestComponent = () => {
    const {user} = useAuth();
    const [imagenes, setImagenes] = useState([]);
    const [selectedFile, setSelectedFile] = useState(null);

    // Nueva función para manejar la carga de archivos
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setSelectedFile(file);
    };

    // Nueva función para subir un archivo seleccionado
    const handleFileUpload = async (e) => {
        e.preventDefault();
        
        if (!selectedFile) {
            alert('Por favor, selecciona un archivo');
            return;
        }

        try {
            const { data, error } = await supabase
                .storage
                .from('comercios')
                .upload(selectedFile.name, selectedFile, {
                    cacheControl: '3600',
                    upsert: true
                });

            if (error) {
                console.error("Error al subir la imagen:", error);
                alert('Error al subir la imagen');
                return;
            }

            console.log("Imagen subida con éxito:", data);
            alert('Imagen subida con éxito');
            
            // Actualizar la lista de imágenes
            await obtenerImagenes();
        } catch (catchError) {
            console.error("Error inesperado al subir la imagen:", catchError);
            alert('Error inesperado al subir la imagen');
        }
    };

    const obtenerImagenes = useCallback(async () => {
        if (!user) return;

        try {
            const { data, error } = await supabase
                .storage
                .from('comercios')
                .list(null, { limit: 100 });

            if (error) {
                console.error("Error al obtener las imágenes:", error);
                return;
            }

            const imagenesUrls = data.map(file => 
                supabase.storage.from('comercios').getPublicUrl(file.name).data.publicUrl
            );

            setImagenes(imagenesUrls);
        } catch (catchError) {
            console.error("Error general al obtener imágenes:", catchError);
        }
    }, [user]);

    useEffect(() => {
        if (!user) return;
        obtenerImagenes();
    }, [user, obtenerImagenes]);

    return (
        <div>
            <h2>Imágenes del bucket "comercios"</h2>
            
            {/* Formulario de carga de archivos */}
            <form onSubmit={handleFileUpload} style={{ marginBottom: '20px' }}>
                <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleFileChange} 
                />
                <button type="submit">Subir Imagen</button>
            </form>

            {/* Galería de imágenes */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {imagenes.map((url, index) => (
                    <img 
                        key={index} 
                        src={url} 
                        alt={`Imagen ${index}`} 
                        style={{ width: '150px', height: '150px', objectFit: 'cover' }} 
                    />
                ))}
            </div>
        </div>
    );
};

export default TestComponent;
