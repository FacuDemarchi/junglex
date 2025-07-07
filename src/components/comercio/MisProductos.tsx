import React, { useState, useEffect, useRef, ChangeEvent } from 'react';
import supabase from '../../supabase/supabase.config';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faToggleOn, faToggleOff, faImage } from '@fortawesome/free-solid-svg-icons';

interface User {
  id: string;
  user_data?: {
    user_type: string;
  };
}

interface Tag {
  id: string;
  nombre: string;
}

interface Producto {
  id: string;
  comercio_id: string;
  nombre: string;
  description?: string;
  precio: number;
  disponible: boolean;
  img?: string;
  tags?: Tag[];
}

interface MisProductosProps {
  user: User;
}

// Hook para detectar click fuera de un ref
function useClickOutside(ref: React.RefObject<HTMLDivElement | null>, handler: () => void) {
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        handler();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [ref, handler]);
}

const MAX_TAGS = 5;

const TagSelector: React.FC<{
  tags: Tag[];
  selectedTags: Tag[];
  onChange: (selectedTagIds: string[]) => void;
}> = ({ tags, selectedTags, onChange }) => {
  // Debug: ver qué tags se están pasando
  console.log('TagSelector - tags disponibles:', tags);
  console.log('TagSelector - tags seleccionados:', selectedTags);

  // Convertir selectedTags a un array de IDs para facilitar la comparación
  const selectedTagIds = selectedTags.map(tag => 
    typeof tag === 'string' ? tag : tag.id
  );

  const handleTagToggle = (tagId: string) => {
    const isSelected = selectedTagIds.includes(tagId);
    if (isSelected) {
      // Si ya está seleccionado, solo lo quitamos
      onChange(selectedTagIds.filter(id => id !== tagId));
    } else if (selectedTagIds.length < MAX_TAGS) {
      // Si no está seleccionado y no se superó el máximo, lo agregamos
      onChange([...selectedTagIds, tagId]);
    }
  };

  return (
    <div className="w-full bg-white border border-gray-300 rounded-md p-3 shadow-sm">
      <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
        {tags.length === 0 ? (
          <div className="text-sm text-gray-500 py-2">
            No hay tags disponibles
          </div>
        ) : (
          tags.map((tag) => {
            const isSelected = selectedTagIds.includes(tag.id);
            return (
              <button
                key={tag.id}
                onClick={() => handleTagToggle(tag.id)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
                  isSelected
                    ? 'bg-blue-500 text-white hover:bg-blue-600 shadow-sm'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                } ${!isSelected && selectedTagIds.length >= MAX_TAGS ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={(!isSelected && selectedTagIds.length >= MAX_TAGS) || (isSelected && selectedTagIds.filter(id => id === tag.id).length > 1)}
              >
                {tag.nombre}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};

const MisProductos: React.FC<MisProductosProps> = ({ user }) => {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [editingTagsId, setEditingTagsId] = useState<string | null>(null);
  const tagSelectorRef = useRef<HTMLDivElement | null>(null);
  useClickOutside(tagSelectorRef, () => setEditingTagsId(null));
  const imageInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  useEffect(() => {
    if (user) {
      const fetchTagsProductos = async (productos: Producto[]): Promise<Producto[]> => {
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
              const productTags = (data as any[]).map(item => ({
                id: item.tag.id,
                nombre: item.tag.nombre
              }));
              return { ...producto, tags: productTags };
            }
          })
        );
        return productosConTags;
      };

      const fetchProductos = async () => {
        const { data, error } = await supabase
          .from('productos')
          .select('*')
          .eq('comercio_id', user.id);
        if (error) {
          console.error('Error al traer los productos:', error);
        } else {
          const productosConTags = await fetchTagsProductos(data as Producto[]);
          setProductos(productosConTags);
        }
      };
      fetchProductos();
    }
  }, [user]);

  useEffect(() => {
    async function fetchTags() {
      const { data, error } = await supabase.from('tags').select('*');
      if (error) {
        console.error('Error al traer los tags:', error);
      } else {
        console.log('Tags cargados:', data); // ← Debug: ver tags cargados
        setTags(data as Tag[]);
      }
    }
    fetchTags();
  }, []);

  const handleProductoChange = (id: string, field: keyof Producto, value: string | number | boolean) => {
    const updatedProductos = productos.map(producto =>
      producto.id === id ? { ...producto, [field]: value } : producto
    );
    setProductos(updatedProductos);
  };

  const saveChanges = async (producto: Producto) => {
    const { id, tags, ...fieldsToUpdate } = producto;
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

  const saveTags = async (productoId: string, selectedTags: string[]) => {
    const { error: deleteError } = await supabase
      .from('tags_producto')
      .delete()
      .eq('producto', productoId);
    if (deleteError) {
      console.error('Error al eliminar tags existentes:', deleteError);
      return;
    }
    
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
              ? { ...prod, tags: selectedTags.map(tagId => tags.find(tag => tag.id === tagId)).filter(Boolean) as Tag[] }
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
    const newProducto: Omit<Producto, 'id' | 'tags'> = {
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
    setProductos(prev => [...prev, data[0] as Producto]);
  };

  const handleProductImageChange = async (productoId: string, event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${productoId}_img.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;
        await supabase.storage
          .from('comercios')
          .upload(filePath, file, { upsert: true });
        const { data: { publicUrl } } = supabase.storage
          .from('comercios')
          .getPublicUrl(filePath);
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
      } catch (error: any) {
        console.error("Error al cargar la imagen del producto:", error.message);
      }
    }
  };

  return (
    <div className="overflow-x-auto w-full">
      <table className="min-w-full table-fixed border border-gray-200 rounded-lg bg-white text-sm">
        <thead>
          <tr className="bg-gray-100">
            <th className="w-8"></th>
            <th className="w-48 px-2 py-2 font-semibold text-gray-800 text-left">Nombre</th>
            <th className="w-24 px-0 py-2 font-semibold text-gray-800 text-left">Precio en ARS</th>
            <th className="px-0 py-2 font-semibold text-gray-800 text-center w-auto">Imagen</th>
            <th className="px-3 py-2 font-semibold text-gray-800 text-left">Descripción</th>
            <th className="px-3 py-2 font-semibold text-gray-800 text-left">Tags</th>
          </tr>
        </thead>
        <tbody>
          {productos.map((producto) => {
            return (
              <tr key={producto.id} className="border-b border-gray-100 hover:bg-blue-50 transition-all">
                <td className="text-center align-middle pr-2 w-8">
                  <button type="button" onClick={() => toggleAvailability(producto)} className="focus:outline-none">
                    <FontAwesomeIcon
                      icon={producto.disponible ? faToggleOn : faToggleOff}
                      size="lg"
                      color={producto.disponible ? 'green' : 'red'}
                    />
                  </button>
                </td>
                <td className="align-middle w-48 px-0">
                  <input
                    type="text"
                    value={producto.nombre}
                    onChange={(e) =>
                      handleProductoChange(producto.id, 'nombre', e.target.value)
                    }
                    onBlur={() => saveChanges(producto)}
                    className="w-full px-2 py-0.5 border-0 border-b border-gray-300 bg-transparent focus:border-blue-500 focus:ring-0 focus:outline-none text-sm transition-all font-medium"
                  />
                </td>
                <td className="align-middle w-24 px-0">
                  <div className="flex items-center gap-0">
                    <span className="text-gray-500 text-base">$</span>
                    <input
                      type="number"
                      value={producto.precio}
                      onChange={(e) =>
                        handleProductoChange(producto.id, 'precio', parseFloat(e.target.value))
                      }
                      onBlur={() => saveChanges(producto)}
                      className="w-full px-0.5 py-0.5 border-0 border-b border-gray-300 bg-transparent focus:border-blue-500 focus:ring-0 focus:outline-none text-left text-sm transition-all font-medium"
                    />
                  </div>
                </td>
                <td className="align-middle text-center px-0">
                  <div className="flex items-center justify-center">
                    <input
                      type="file"
                      className="hidden"
                      ref={(el: HTMLInputElement | null) => {
                        imageInputRefs.current[producto.id] = el;
                      }}
                      onChange={(e) => handleProductImageChange(producto.id, e)}
                      accept="image/*"
                    />
                    {producto.img ? (
                      <img
                        src={producto.img}
                        alt={producto.nombre}
                        className="w-10 h-10 object-cover rounded cursor-pointer border border-gray-200"
                        onClick={() => imageInputRefs.current[producto.id]?.click()}
                      />
                    ) : (
                      <button
                        onClick={() => imageInputRefs.current[producto.id]?.click()}
                        className="flex items-center gap-1 text-xs px-2 py-1 border border-gray-300 rounded bg-gray-50 hover:bg-gray-100 transition"
                      >
                        <FontAwesomeIcon icon={faImage} /> Imagen
                      </button>
                    )}
                  </div>
                </td>
                <td className="align-middle">
                  <input
                    type="text"
                    value={producto.description || ''}
                    onChange={(e) =>
                      handleProductoChange(producto.id, 'description', e.target.value)
                    }
                    onBlur={() => saveChanges(producto)}
                    className="w-full px-2 py-0.5 border-0 border-b border-gray-300 bg-transparent focus:border-blue-500 focus:ring-0 focus:outline-none text-sm transition-all font-medium"
                  />
                </td>
                <td className="align-middle">
                  {editingTagsId === producto.id ? (
                    <div ref={tagSelectorRef}>
                      {/* Debug: Renderizando TagSelector para producto: {producto.id} con tags: {tags.length} */}
                      <TagSelector
                        tags={tags}
                        selectedTags={producto.tags || []}
                        onChange={(selectedTagIds: string[]) => saveTags(producto.id, selectedTagIds)}
                      />
                    </div>
                  ) : (
                    <div
                      className="flex flex-wrap gap-1 w-full cursor-pointer hover:bg-blue-50 rounded transition p-1"
                      onClick={() => setEditingTagsId(producto.id)}
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setEditingTagsId(producto.id);
                        }
                      }}
                    >
                      {(!producto.tags || producto.tags.length === 0) ? (
                        <span className="text-xs text-gray-400 italic">Sin tags</span>
                      ) : (
                        producto.tags.map((tag) => (
                          <span
                            key={tag.id}
                            className="inline-block bg-gray-200 rounded px-2 py-0.5 text-xs text-gray-700"
                            title={tag.nombre}
                          >
                            {tag.nombre}
                          </span>
                        ))
                      )}
                    </div>
                  )}
                </td>
              </tr>
            );
          })}
          <tr>
            <td colSpan={6} className="text-center py-3">
              <button className="inline-flex items-center gap-2 px-3 py-1 border border-blue-500 text-blue-600 rounded hover:bg-blue-50 transition" onClick={addNewProducto}>
                <FontAwesomeIcon icon={faPlus} /> Agregar nuevo producto
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default MisProductos; 