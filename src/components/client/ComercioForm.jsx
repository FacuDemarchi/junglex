import React, { useState } from 'react';
import supabase from '../../supabase/supabase.config';
import { Modal, Button } from 'react-bootstrap';

const ComercioForm = ({ user, show, onClose }) => {
    const [comercioData, setComercioData] = useState({
        nombre: '',
        direccion: '',
        telefono: '',
        categoria: '',
    });

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setComercioData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleFormSubmit = async (event) => {
        event.preventDefault();

        const { nombre, direccion, telefono, categoria } = comercioData;

        const { data, error } = await supabase
            .from('comercios')
            .insert([{ 
                id: user.id,
                nombre,
                direccion,
                telefono,
                categoria
            }]);

        if (error) {
            console.error('Error inserting data:', error);
        } else {
            console.log('Data inserted successfully:', data);
            onClose(); // Cierra el formulario después de enviar
        }
        alert('Comercio registrado')
    };

    return (
        <>
            <Modal.Header closeButton>
                <Modal.Title>Registrar Comercio</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <form onSubmit={handleFormSubmit} className="mt-3">
                    <div className="form-group">
                        <label htmlFor="nombre">Nombre</label>
                        <input
                            type="text"
                            id="nombre"
                            name="nombre"
                            className="form-control"
                            value={comercioData.nombre}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="direccion">Dirección</label>
                        <input
                            type="text"
                            id="direccion"
                            name="direccion"
                            className="form-control"
                            value={comercioData.direccion}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="telefono">Teléfono</label>
                        <input
                            type="tel"
                            id="telefono"
                            name="telefono"
                            className="form-control"
                            value={comercioData.telefono}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="categoria">Categoría</label>
                        <input
                            type="text"
                            id="categoria"
                            name="categoria"
                            className="form-control"
                            value={comercioData.categoria}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <Button type="submit" className="btn btn-primary mt-3">
                        Registrar
                    </Button>
                    <Button type="button" className="btn btn-secondary mt-3 ml-2" onClick={onClose}>
                        Cancelar
                    </Button>
                </form>
            </Modal.Body>
        </>
    );
};

export default ComercioForm;
