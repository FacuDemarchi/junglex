import React, { useState, useEffect } from 'react';
import { Form, Button, Table } from 'react-bootstrap';
import supabase from '../../supabase/supabase.config';

const MisProductos = ({ user }) => {
    const [productos, setProductos] = useState([]);
    const [editableProductoId, setEditableProductoId] = useState(null);
    const [tags, setTags] = useState([]); // Tags globales disponibles

    useEffect(() => {
        if (user) {
            async function fetchProductos() {
                const { data, error } = await supabase
                    .from('productos')
                    .select(`
                        *,
                        tags_producto(*, tags(*))
                    `)
                    .eq('comercio_id', user.id);

                if (error) {
                    console.error('Error al traer los productos del comercio:', error);
                } else {
                    setProductos(data);
                }
                console.log('productos: ', data);
            }
            fetchProductos();
        }
    }, [user]);

    // Traer todos los tags disponibles
    useEffect(() => {
        async function fetchTags() {
            const { data, error } = await supabase.from('tags').select('*');
            if (error) {
                console.error('Error al traer los tags:', error);
            } else {
                setTags(data);
            }
        }
        fetchTags();
    }, []);

    const handleChange = (e, id) => {
        const { name, value, type, checked } = e.target;
        setProductos((prevProductos) =>
            prevProductos.map((producto) =>
                producto.id === id ? { ...producto, [name]: type === 'checkbox' ? checked : value } : producto
            )
        );
    };

    // Manejar la selección de tags
    const handleTagCheckboxChange = (productoId, tagId) => {
        setProductos((prevProductos) =>
            prevProductos.map((producto) => {
                if (producto.id === productoId) {
                    const tagsSeleccionados = producto.tagsProductoSeleccionados || producto.tags_producto.map(tp => tp.tags.id);
                    const updatedTags = tagsSeleccionados.includes(tagId)
                        ? tagsSeleccionados.filter((id) => id !== tagId) // Deseleccionar
                        : [...tagsSeleccionados, tagId]; // Seleccionar
                    return { ...producto, tagsProductoSeleccionados: updatedTags };
                }
                return producto;
            })
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
                // Guardar tags del producto
                await supabase
                    .from('tags_producto')
                    .delete() // Eliminar los tags actuales del producto
                    .eq('producto', id);

                const tagsToInsert = producto.tagsProductoSeleccionados.map((tagId) => ({
                    producto: id,
                    tag: tagId
                }));

                await supabase
                    .from('tags_producto')
                    .insert(tagsToInsert);

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
                comercio_id: user.id,
                tagsProductoSeleccionados: []
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
                        <th></th>
                        <th>Nombre</th>
                        <th>Description</th>
                        <th>Precio</th>
                        <th>Disponible</th>
                        <th>Tags</th> 
                    </tr>
                </thead>
                <tbody>
                    {productos.map((producto) => (
                        <tr key={producto.id || 'new'}>
                            {editableProductoId === producto.id || producto.id === null ? (
                                <>
                                    <td>
                                        <Button variant="success" onClick={() => handleSave(producto.id) }>
                                            Guardar
                                        </Button>
                                        <Button variant="warning" onClick={handleCancel}>
                                            Cancelar
                                        </Button>
                                    </td>
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
                                        {tags.map((tag) => (
                                            <Form.Check 
                                                key={tag.id}
                                                type="checkbox"
                                                label={tag.nombre}
                                                checked={producto.tagsProductoSeleccionados?.includes(tag.id) || producto.tags_producto.some(tagProd => tagProd.tags.id === tag.id)}
                                                onChange={() => handleTagCheckboxChange(producto.id, tag.id)}
                                            />
                                        ))}
                                    </td>
                                </>
                            ) : (
                                <>
                                    <td>
                                        <Button variant="secondary" onClick={() => handleEdit(producto.id)}>
                                            Editar
                                        </Button>
                                    </td>
                                    <td>{producto.nombre}</td>
                                    <td>{producto.description}</td>
                                    <td>{producto.precio}</td>
                                    <td>{producto.disponible ? 'Sí' : 'No'}</td>
                                    <td>
                                        {/* Mostrar los tags asociados al producto */}
                                        {producto.tags_producto.map(tagProducto => tagProducto.tags.nombre).join(', ')}
                                    </td>
                                </>
                            )}
                        </tr>
                    ))}
                    <tr>
                        <td colSpan="6">
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
