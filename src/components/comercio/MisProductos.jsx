import React, { useState, useEffect, useRef } from 'react';
import { Table } from 'react-bootstrap';
import supabase from '../../supabase/supabase.config';
import TagSelector from './TagSelector'; // Componente para la selección de tags
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faToggleOn, faToggleOff } from '@fortawesome/free-solid-svg-icons';
import './checkbox.css';

const MisProductos = ({ user }) => {
  const [productos, setProductos] = useState([]);
  const [tags, setTags] = useState([]);
  // Referencias para los inputs file de imagen por producto
  const imageInputRefs = useRef({});

  useEffect(() => {
    if (user) {
      async function fetchTagsProductos(productos) {
        const productosConTags = await Promise.all(
          productos.map(async (producto) => {
            const { data, error } = await supabase
              .from('tags_producto')
              .select('tag(id, nombre)')
              .eq('producto', producto.id);
            if (error) {
              console.error(`Error al traer los tags para el producto ${producto.id}:`, error);
              return producto;
            } else {
              const productTags = data.map(item => ({
                id: item.tag.id,
                nombre: item.tag.nombre
              }));
              return { ...producto, tags: productTags };
            }
          })
        );
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

  // Actualiza un campo de un producto en el estado local
  const handleProductoChange = (id, field, value) => {
    const updatedProductos = productos.map(producto =>
      producto.id === id ? { ...producto, [field]: value } : producto
    );
    setProductos(updatedProductos);
  };

  // Guarda los cambios de un producto en Supabase
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

  // Alterna la disponibilidad del producto y actualiza la base de datos
  const toggleAvailability = async (producto) => {
    const newAvailability = !producto.disponible;
    try {
      const { error } = await supabase
        .from('productos')
        .update({ disponible: newAvailability })
        .eq('id', producto.id);
      if (error) {
        console.error('Error al actualizar la disponibilidad:', error);
      } else {
        setProductos(prevProductos =>
          prevProductos.map(prod =>
            prod.id === producto.id ? { ...prod, disponible: newAvailability } : prod
          )
        );
      }
    } catch (err) {
      console.error('Error inesperado al actualizar la disponibilidad:', err);
    }
  };

  // Guarda los tags seleccionados para un producto
  const saveTags = async (productoId, selectedTags) => {
    // Primero se eliminan las relaciones existentes
    const { error: deleteError } = await supabase
      .from('tags_producto')
      .delete()
      .eq('producto', productoId);
    if (deleteError) {
      console.error('Error al eliminar tags existentes:', deleteError);
      return;
    }
    // Insertar las nuevas relaciones si hay tags seleccionados
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
        setProductos(prevProductos =>
          prevProductos.map(prod =>
            prod.id === productoId
              ? { ...prod, tags: selectedTags.map(tagId => tags.find(tag => tag.id === tagId)) }
              : prod
          )
        );
      }
    } else {
      setProductos(prevProductos =>
        prevProductos.map(prod =>
          prod.id === productoId ? { ...prod, tags: [] } : prod
        )
      );
    }
  };

  // Agrega un nuevo producto con datos por defecto
  const addNewProducto = async () => {
    const newProducto = {
      comercio_id: user.id,
      nombre: 'Nuevo producto',
      description: '',
      precio: 0,
      disponible: false,
      img: ''
    };
    const { data, error } = await supabase
      .from('productos')
      .insert(newProducto)
      .select();
    if (error) {
      console.error("Error al agregar producto:", error);
      return;
    }
    setProductos(prev => [...prev, data[0]]);
  };

  // Maneja la carga de la imagen de un producto, almacenándola en el bucket "comercios"
  // en la ruta: <user.id>/<productoId>_img.<ext>
  // y actualiza el campo "img" en la tabla "productos"
  const handleProductImageChange = async (productoId, event) => {
    const file = event.target.files[0];
    if (file) {
      try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${productoId}_img.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;
        await supabase.storage
          .from('comercios')
          .upload(filePath, file, { upsert: true });
        const { data: { publicUrl }, error: urlError } = supabase.storage
          .from('comercios')
          .getPublicUrl(filePath);
        if (urlError) throw urlError;
        const { error } = await supabase
          .from('productos')
          .update({ img: publicUrl })
          .eq('id', productoId);
        if (error) throw error;
        setProductos(prev =>
          prev.map(prod =>
            prod.id === productoId ? { ...prod, img: publicUrl } : prod
          )
        );
      } catch (error) {
        console.error("Error al cargar la imagen del producto:", error.message);
      }
    }
  };

  return (
    <div>
      <Table striped bordered hover className="mt-4">
        <thead>
          <tr>
            <th>Disponibilidad</th>
            <th>Imagen</th>
            <th>Nombre</th>
            <th>Descripción</th>
            <th>Precio en ARS</th>
            <th>Tags</th>
          </tr>
        </thead>
        <tbody>
          {productos.map((producto) => (
            <tr key={producto.id}>
              {/* Columna de disponibilidad con ícono toggle */}
              <td>
                <span onClick={() => toggleAvailability(producto)} style={{ cursor: 'pointer' }}>
                  <FontAwesomeIcon
                    icon={producto.disponible ? faToggleOn : faToggleOff}
                    size="lg"
                    color={producto.disponible ? 'green' : 'red'}
                  />
                </span>
              </td>
              {/* Columna para la imagen del producto */}
              <td>
                <div>
                  <input
                    type="file"
                    style={{ display: 'none' }}
                    ref={el => imageInputRefs.current[producto.id] = el}
                    onChange={(e) => handleProductImageChange(producto.id, e)}
                    accept="image/*"
                  />
                  {producto.img ? (
                    <img
                      src={producto.img}
                      alt={producto.nombre}
                      style={{ width: '80px', height: '80px', objectFit: 'cover', cursor: 'pointer' }}
                      onClick={() => imageInputRefs.current[producto.id]?.click()}
                    />
                  ) : (
                    <button
                      onClick={() => imageInputRefs.current[producto.id]?.click()}
                      className="btn btn-sm btn-outline-secondary"
                    >
                      Agregar Imagen
                    </button>
                  )}
                </div>
              </td>
              {/* Columna de nombre */}
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
              {/* Columna de descripción */}
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
              {/* Columna de precio */}
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
              {/* Columna de tags */}
              <td>
                <TagSelector
                  tags={tags}
                  selectedTags={producto.tags || []}
                  onChange={(selectedTags) => saveTags(producto.id, selectedTags)}
                />
              </td>
            </tr>
          ))}
          {/* Fila para agregar un nuevo producto */}
          <tr>
            <td colSpan="6" className="text-center">
              <button className="btn btn-outline-primary" onClick={addNewProducto}>
                <FontAwesomeIcon icon={faPlus} /> Agregar nuevo producto
              </button>
            </td>
          </tr>
        </tbody>
      </Table>
    </div>
  );
};

export default MisProductos;
