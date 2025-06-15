import React, { useState, useEffect, useRef } from 'react';
import { Table } from 'react-bootstrap';
import supabase from '../../supabase/supabase.config';
import TagSelector from './TagSelector';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faToggleOn, faToggleOff } from '@fortawesome/free-solid-svg-icons';
import './styles/checkbox.css';

interface MisProductosProps {
  user: {
    id: string;
  };
}

interface Tag {
  id: number;
  nombre: string;
}

interface TagData {
  tag: {
    id: number;
    nombre: string;
  };
}

interface Producto {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  imagen: string | null;
  disponible: boolean;
  tags: Tag[];
  comercio_id: string;
}

const MisProductos: React.FC<MisProductosProps> = ({ user }) => {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const imageInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  useEffect(() => {
    if (user) {
      const loadData = async () => {
        const { data: productosData, error: productosError } = await supabase
          .from('productos')
          .select('*')
          .eq('comercio_id', user.id);

        if (productosError) {
          console.error('Error fetching productos:', productosError);
          return;
        }

        const productosConTags = await Promise.all(
          productosData.map(async (producto) => {
            const { data: tagsData, error: tagsError } = await supabase
              .from('producto_tags')
              .select('tag:tags(id, nombre)')
              .eq('producto_id', producto.id);

            if (tagsError) {
              console.error('Error fetching tags:', tagsError);
              return { ...producto, tags: [] };
            }

            const tags = (tagsData as unknown as TagData[]).map(item => item.tag);
            return {
              ...producto,
              tags
            };
          })
        );

        setProductos(productosConTags);
      };

      loadData();
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

  const handleProductoChange = (id: string, field: keyof Producto, value: any) => {
    const updatedProductos = productos.map(producto =>
      producto.id === id ? { ...producto, [field]: value } : producto
    );
    setProductos(updatedProductos);
  };

  const saveChanges = async (producto: Producto) => {
    const { id, ...fieldsToUpdate } = producto;
    const { error } = await supabase
      .from('productos')
      .update(fieldsToUpdate)
      .eq('id', id);
    if (error) {
      console.error('Error al actualizar el producto:', error);
    }
  };

  const toggleAvailability = async (producto: Producto) => {
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

  const saveTags = async (productoId: string, selectedTags: number[]) => {
    const { error: deleteError } = await supabase
      .from('producto_tags')
      .delete()
      .eq('producto_id', productoId);
    if (deleteError) {
      console.error('Error al eliminar tags existentes:', deleteError);
      return;
    }
    if (selectedTags.length > 0) {
      const tagRelations = selectedTags.map(tagId => ({
        producto_id: productoId,
        tag_id: tagId
      }));
      const { error: insertError } = await supabase
        .from('producto_tags')
        .insert(tagRelations);
      if (insertError) {
        console.error('Error al guardar los tags:', insertError);
      } else {
        setProductos(prevProductos =>
          prevProductos.map(prod =>
            prod.id === productoId
              ? { ...prod, tags: selectedTags.map(tagId => tags.find(tag => tag.id === tagId)!) }
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

  const addNewProducto = async () => {
    const newProducto = {
      comercio_id: user.id,
      nombre: 'Nuevo producto',
      descripcion: '',
      precio: 0,
      disponible: false,
      imagen: null
    };
    const { data, error } = await supabase
      .from('productos')
      .insert(newProducto)
      .select();
    if (error) {
      console.error("Error al agregar producto:", error);
      return;
    }
    setProductos(prev => [...prev, { ...data[0], tags: [] }]);
  };

  const handleProductImageChange = async (productoId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${productoId}-${Math.random()}.${fileExt}`;
        const { data, error } = await supabase.storage
          .from('productos')
          .upload(fileName, file);

        if (error) throw error;

        const { data: { publicUrl } } = supabase.storage
          .from('productos')
          .getPublicUrl(fileName);

        const { error: updateError } = await supabase
          .from('productos')
          .update({ imagen: publicUrl })
          .eq('id', productoId);

        if (updateError) throw updateError;

        setProductos(prev =>
          prev.map(prod =>
            prod.id === productoId ? { ...prod, imagen: publicUrl } : prod
          )
        );
      } catch (error) {
        console.error('Error uploading image:', error);
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
              <td>
                <span onClick={() => toggleAvailability(producto)} style={{ cursor: 'pointer' }}>
                  <FontAwesomeIcon
                    icon={producto.disponible ? faToggleOn : faToggleOff}
                    size="lg"
                    color={producto.disponible ? 'green' : 'red'}
                  />
                </span>
              </td>
              <td>
                <div>
                  <input
                    type="file"
                    ref={(el) => {
                      if (el) imageInputRefs.current[producto.id] = el;
                    }}
                    onChange={(e) => handleProductImageChange(producto.id, e)}
                    style={{ display: 'none' }}
                    accept="image/*"
                  />
                  {producto.imagen ? (
                    <img
                      src={producto.imagen}
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
              <td>
                <input
                  type="text"
                  className="form-control"
                  value={producto.nombre}
                  onChange={(e) => {
                    handleProductoChange(producto.id, 'nombre', e.target.value);
                    saveChanges({ ...producto, nombre: e.target.value });
                  }}
                />
              </td>
              <td>
                <textarea
                  className="form-control"
                  value={producto.descripcion}
                  onChange={(e) => {
                    handleProductoChange(producto.id, 'descripcion', e.target.value);
                    saveChanges({ ...producto, descripcion: e.target.value });
                  }}
                />
              </td>
              <td>
                <input
                  type="number"
                  className="form-control"
                  value={producto.precio}
                  onChange={(e) => {
                    handleProductoChange(producto.id, 'precio', parseFloat(e.target.value));
                    saveChanges({ ...producto, precio: parseFloat(e.target.value) });
                  }}
                />
              </td>
              <td>
                <TagSelector
                  tags={tags}
                  selectedTags={producto.tags.map(tag => tag.id)}
                  onChange={(selectedTags: number[]) => saveTags(producto.id, selectedTags)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      <button
        className="btn btn-primary"
        onClick={addNewProducto}
        style={{ marginTop: '1rem' }}
      >
        <FontAwesomeIcon icon={faPlus} /> Agregar Producto
      </button>
    </div>
  );
};

export default MisProductos; 