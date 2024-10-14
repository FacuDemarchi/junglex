import React, { useState, useEffect } from 'react';
import { Form, Button } from 'react-bootstrap';
import supabase from '../../supabase/supabase.config';

const ConfigComercio = ({ user }) => {
    const [comercio, setComercio] = useState({});
    const [categorias, setCategorias] = useState([]);

    useEffect(() => {
        if (user) {
            async function fetchComercioData() {
                const { data, error } = await supabase
                    .from('comercios')
                    .select(`
                        *,
                        categorias(*)
                    `)
                    .eq('id', user.id);

                console.log('comercio: ', data);
                
                if (error) {
                    console.error('Error al traer los datos del comercio:', error);
                } else {
                    setComercio(data[0]); 
                }
            }

            async function fetchCategorias() {
                const { data, error } = await supabase
                    .from('categorias')
                    .select('*');
                
                if (error) {
                    console.error('Error al traer las categorías:', error);
                } else {
                    setCategorias(data);
                }
            }

            fetchComercioData();
            fetchCategorias();
        }
    }, [user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setComercio((prevData) => ({
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
                nombre: comercio.nombre,
                direccion: comercio.direccion,
                telefono: comercio.telefono,
                categoria_id: comercio.categoria_id // Asegúrate de que el id de categoría también se envíe
            })
            .eq('id', user.id);

        if (comercioError) {
            console.error('Error al actualizar los datos del comercio:', comercioError);
        } else {
            alert('Datos actualizados exitosamente');
        }
    };

    console.log('comercio: ', comercio);
    console.log('Categorias: ', categorias);
    
    return (
        <div>
            <h2>Configuración del Comercio</h2>
            <Form onSubmit={handleSubmit}>
                <Form.Group controlId="nombre">
                    <Form.Label>Nombre</Form.Label>
                    <Form.Control
                        type="text"
                        name="nombre"
                        value={comercio.nombre || ''} // Asegúrate de que no haya error si comercio está vacío
                        onChange={handleChange}
                    />
                </Form.Group>
                <Form.Group controlId="direccion">
                    <Form.Label>Dirección</Form.Label>
                    <Form.Control
                        type="text"
                        name="direccion"
                        value={comercio.direccion || ''} // Asegúrate de que no haya error si comercio está vacío
                        onChange={handleChange}
                    />
                </Form.Group>
                <Form.Group controlId="telefono">
                    <Form.Label>Teléfono</Form.Label>
                    <Form.Control
                        type="text"
                        name="telefono"
                        value={comercio.telefono || ''} // Asegúrate de que no haya error si comercio está vacío
                        onChange={handleChange}
                    />
                </Form.Group>
                <Form.Group controlId="categoria_id">
                    <Form.Label>Categoría</Form.Label>
                    <Form.Control
                        as="select"
                        name="categoria_id"
                        value={comercio.categorias?.id || ''} // Muestra el id de la categoría actual
                        onChange={handleChange}
                    >
                        <option value="">Seleccione una categoría</option>
                        {categorias.map((categoria) => (
                            <option key={categoria.id} value={categoria.id}>
                                {categoria.nombre}
                            </option>
                        ))}
                    </Form.Control>
                </Form.Group>
                <Button variant="primary" type="submit">
                    Guardar Cambios
                </Button>
            </Form>
        </div>
    );
};

export default ConfigComercio;
