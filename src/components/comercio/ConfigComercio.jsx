import React, { useState, useEffect } from 'react';
import { Form, Button } from 'react-bootstrap';
import supabase from '../../supabase/supabase.config';

const ConfigComercio = ({ user }) => {
    const [comercioData, setComercioData] = useState({
        nombre: '',
        direccion: ''
    });

    useEffect(() => {
        if (user) {
            async function fetchComercioData() {
                const { data, error } = await supabase
                    .from('comercios')
                    .select()
                    .eq('id', user.id)
                    .single();

                if (error) {
                    console.error('Error al traer los datos del comercio:', error);
                } else {
                    setComercioData(data);
                }
            }
            fetchComercioData();
        }
    }, [user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setComercioData((prevData) => ({
            ...prevData,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Actualizar los datos del comercio
        const { error: comercioError } = await supabase
            .from('comercios')
            .update({
                nombre: comercioData.nombre,
                direccion: comercioData.direccion
            })
            .eq('id', user.id);

        if (comercioError) {
            console.error('Error al actualizar los datos del comercio:', comercioError);
        } else {
            alert('Datos actualizados exitosamente');
        }
    };

    return (
        <div>
            <h2>Configuración del Comercio</h2>
            <Form onSubmit={handleSubmit}>
                <Form.Group controlId="nombre">
                    <Form.Label>Nombre</Form.Label>
                    <Form.Control
                        type="text"
                        name="nombre"
                        value={comercioData.nombre}
                        onChange={handleChange}
                    />
                </Form.Group>
                <Form.Group controlId="direccion">
                    <Form.Label>Dirección</Form.Label>
                    <Form.Control
                        type="text"
                        name="direccion"
                        value={comercioData.direccion}
                        onChange={handleChange}
                    />
                </Form.Group>
                <Button variant="primary" type="submit">
                    Guardar Cambios
                </Button>
            </Form>
        </div>
    );
};

export default ConfigComercio;
