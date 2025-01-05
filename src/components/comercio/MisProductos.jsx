import React, { useState, useEffect } from 'react';
import { Table } from 'react-bootstrap';
import supabase from '../../supabase/supabase.config';
import TagSelector from './TagSelector'; // Importar el nuevo componente
import './checkbox.css';

const MisProductos = ({ user }) => {
    const [productos, setProductos] = useState([]);
    const [tags, setTags] = useState([]);

    useEffect(() => {
        if (user) {
            async function fetchTagsProductos(productos) {
                const productosConTags = await Promise.all(productos.map(async (producto) => {
                    const { data, error } = await supabase
                        .from('tags_producto')
                        .select('tag(id, nombre)')
                        .eq('producto', producto.id);

                    if (error) {
                        console.error(`Error al traer los tags para el producto ${producto.id}:`, error);
                        return producto;
                    } else {
                        // Transformar los datos de tags para que sean más manejables
                        const productTags = data.map(item => ({
                            id: item.tag.id,
                            nombre: item.tag.nombre
                        }));
                        return { ...producto, tags: productTags };
                    }
                }));

                setProductos(productosConTags);
            }

            async function fetchProductos() {
                const { data, error } = await supabase
                    .from('productos')
                    .select('*')
                    .eq('comercio_id', user.id);

                if (error) {
                    console.error('Error al traer los productos:', error);
                } else {
                    fetchTagsProductos(data);
                }
            }
            fetchProductos();
        }
    }, [user]);

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

    // Manejar cambios en los productos
    const handleProductoChange = (id, field, value) => {
        const updatedProductos = productos.map(producto =>
            producto.id === id ? { ...producto, [field]: value } : producto
        );
        setProductos(updatedProductos);
    };

    // Guardar cambios en Supabase
    const saveChanges = async (producto) => {
        const { id, ...fieldsToUpdate } = producto;
        const { error } = await supabase
            .from('productos')
            .update(fieldsToUpdate)
            .eq('id', id);

        if (error) {
            console.error('Error al actualizar el producto:', error);
        }
    };

    // Guardar tags seleccionados para un producto
    const saveTags = async (productoId, selectedTags) => {
        // Primero, eliminar todas las relaciones existentes
        const { error: deleteError } = await supabase
            .from('tags_producto')
            .delete()
            .eq('producto', productoId);

        if (deleteError) {
            console.error('Error al eliminar tags existentes:', deleteError);
            return;
        }

        // Si hay tags seleccionados, insertar nuevas relaciones
        if (selectedTags.length > 0) {
            const tagRelations = selectedTags.map(tagId => ({
                producto: productoId,
                tag: tagId
            }));

            const { error: insertError } = await supabase
                .from('tags_producto')
                .insert(tagRelations);

            if (insertError) {
                console.error('Error al guardar los tags:', insertError);
            } else {
                // Actualizar el estado local de tags para el producto
                setProductos(prevProductos => 
                    prevProductos.map(prod => 
                        prod.id === productoId 
                            ? { 
                                ...prod, 
                                tags: selectedTags.map(tagId => 
                                    tags.find(tag => tag.id === tagId)
                                ) 
                            } 
                            : prod
                    )
                );
            }
        } else {
            // Si no hay tags, actualizar el estado local sin tags
            setProductos(prevProductos => 
                prevProductos.map(prod => 
                    prod.id === productoId 
                        ? { ...prod, tags: [] } 
                        : prod
                )
            );
        }
    };

    return (
        <div>
            <Table striped bordered hover className="mt-4">
                <thead>
                    <tr>
                        <th></th>
                        <th>Nombre</th>
                        <th>Descripción</th>
                        <th>Precio en ARS</th>
                        <th>Tags</th>
                    </tr>
                </thead>
                <tbody>
                    {productos.map((producto) => (
                        <tr key={producto.id || 'new'}>
                            <td>
                                <div className="checkbox-wrapper-2">
                                    <input
                                        type="checkbox"
                                        checked={producto.disponible}
                                        onChange={(e) =>
                                            handleProductoChange(producto.id, 'disponible', e.target.checked)
                                        }
                                        onBlur={() => saveChanges(producto)}
                                    />
                                </div>
                            </td>
                            <td>
                                <input
                                    type="text"
                                    value={producto.nombre}
                                    onChange={(e) =>
                                        handleProductoChange(producto.id, 'nombre', e.target.value)
                                    }
                                    onBlur={() => saveChanges(producto)}
                                />
                            </td>
                            <td>
                                <input
                                    type="text"
                                    value={producto.description || ''}
                                    onChange={(e) =>
                                        handleProductoChange(producto.id, 'description', e.target.value)
                                    }
                                    onBlur={() => saveChanges(producto)}
                                />
                            </td>
                            <td>
                                <input
                                    type="number"
                                    value={producto.precio}
                                    onChange={(e) =>
                                        handleProductoChange(producto.id, 'precio', parseFloat(e.target.value))
                                    }
                                    onBlur={() => saveChanges(producto)}
                                />
                            </td>
                            <td>
                                <TagSelector
                                    tags={tags}
                                    selectedTags={producto.tags || []}
                                    onChange={(selectedTags) => saveTags(producto.id, selectedTags)}
                                />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </div>
    );
};

export default MisProductos;
