import React, { useState, useEffect } from 'react';
import { Form, Button, Table } from 'react-bootstrap';
import supabase from '../../supabase/supabase.config';

const MisProductos = ({ user }) => {
    const [productos, setProductos] = useState([]);
    const [editableProductoId, setEditableProductoId] = useState(null);

    useEffect(() => {
        if (user) {
            async function fetchProductos() {
                const { data, error } = await supabase
                    .from('productos')
                    .select()
                    .eq('comercio_id', user.id);

                if (error) {
                    console.error('Error al traer los productos del comercio:', error);
                } else {
                    setProductos(data);
                }
            }
            fetchProductos();
        }
    }, [user]);

    const handleChange = (e, id) => {
        const { name, value, type, checked } = e.target;
        setProductos((prevProductos) =>
            prevProductos.map((producto) =>
                producto.id === id ? { ...producto, [name]: type === 'checkbox' ? checked : value } : producto
            )
        );
    };

    const handleSave = async (id) => {
        const producto = productos.find((producto) => producto.id === id);
        if (id === null) {
            // Crear nuevo producto
            const { data, error } = await supabase
                .from('productos')
                .insert([{
                    nombre: producto.nombre,
                    description: producto.description,
                    precio: producto.precio,
                    disponible: producto.disponible,
                    comercio_id: user.id
                }]);

            if (error) {
                console.error('Error al crear el producto:', error);
            } else {
                alert('Producto creado exitosamente');
                if (data && data.length > 0) {
                    setProductos((prevProductos) =>
                        prevProductos.map((p) => p.id === null ? data[0] : p)
                    );
                }
                
                setEditableProductoId(null);
            }
        } else {
            // Actualizar producto existente
            const { error } = await supabase
                .from('productos')
                .update({
                    nombre: producto.nombre,
                    description: producto.description,
                    precio: producto.precio,
                    disponible: producto.disponible
                })
                .eq('id', id);

            if (error) {
                console.error('Error al actualizar el producto:', error);
            } else {
                alert('Producto actualizado exitosamente');
                setEditableProductoId(null);
            }
        }
    };

    const handleEdit = (id) => {
        setEditableProductoId(id);
    };

    const handleCancel = () => {
        setEditableProductoId(null);
    };

    const handleAddRow = () => {
        setProductos((prevProductos) => [
            ...prevProductos,
            {
                id: null,
                nombre: '',
                description: '',
                precio: '',
                disponible: false,
                comercio_id: user.id
            }
        ]);
        setEditableProductoId(null);
    };

    return (
        <div>
            <h2>Mis Productos</h2>
            <Table striped bordered hover className="mt-4">
                <thead>
                    <tr>
                        <th>Nombre</th>
                        <th>Description</th>
                        <th>Precio</th>
                        <th>Disponible</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {productos.map((producto) => (
                        <tr key={producto.id || 'new'}>
                            {editableProductoId === producto.id || producto.id === null ? (
                                <>
                                    <td>
                                        <Form.Control
                                            type="text"
                                            name="nombre"
                                            value={producto.nombre}
                                            onChange={(e) => handleChange(e, producto.id)}
                                        />
                                    </td>
                                    <td>
                                        <Form.Control
                                            type="text"
                                            name="description"
                                            value={producto.description}
                                            onChange={(e) => handleChange(e, producto.id)}
                                        />
                                    </td>
                                    <td>
                                        <Form.Control
                                            type="number"
                                            name="precio"
                                            value={producto.precio}
                                            onChange={(e) => handleChange(e, producto.id)}
                                        />
                                    </td>
                                    <td>
                                        <Form.Check
                                            type="checkbox"
                                            name="disponible"
                                            checked={producto.disponible}
                                            onChange={(e) => handleChange(e, producto.id)}
                                        />
                                    </td>
                                    <td>
                                        <Button variant="success" onClick={() => handleSave(producto.id)}>
                                            Guardar
                                        </Button>
                                        <Button variant="secondary" onClick={handleCancel}>
                                            Cancelar
                                        </Button>
                                    </td>
                                </>
                            ) : (
                                <>
                                    <td>{producto.nombre}</td>
                                    <td>{producto.description}</td>
                                    <td>{producto.precio}</td>
                                    <td>{producto.disponible ? 'Sí' : 'No'}</td>
                                    <td>
                                        <Button variant="warning" onClick={() => handleEdit(producto.id)}>
                                            Editar
                                        </Button>
                                    </td>
                                </>
                            )}
                        </tr>
                    ))}
                    <tr>
                        <td colSpan="5">
                            <Button variant="primary" onClick={handleAddRow}>
                                +
                            </Button>
                        </td>
                    </tr>
                </tbody>
            </Table>
        </div>
    );
};

export default MisProductos;
