import React, { useState, useEffect } from 'react';
import { fetchCategories, createCategory, searchCategories } from '../services/categoryService';

const CategorySelector = ({ 
  selectedCategories = [], 
  onCategoriesChange,
  error = null,
  className = ""
}) => {
  const [categories, setCategories] = useState([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [createError, setCreateError] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // Cargar categorías al montar el componente
  useEffect(() => {
    loadCategories();
    // Asegurar que el modal esté cerrado al inicio
    setIsCreateModalOpen(false);
  }, []);

  // Buscar categorías cuando cambie el término de búsqueda
  useEffect(() => {
    if (searchTerm.trim()) {
      searchCategoriesDebounced(searchTerm);
    } else {
      loadCategories();
    }
  }, [searchTerm]);

  const loadCategories = async () => {
    try {
      setIsSearching(true);
      const data = await fetchCategories();
      setCategories(data.filter(cat => cat.isActive !== false));
    } catch (error) {
      console.error('Error cargando categorías:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const searchCategoriesDebounced = async (term) => {
    try {
      setIsSearching(true);
      const data = await searchCategories(term);
      setCategories(data.filter(cat => cat.isActive !== false));
    } catch (error) {
      console.error('Error buscando categorías:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleCategoryToggle = (categoryId) => {
    const isSelected = selectedCategories.includes(categoryId);
    let newSelected;
    
    if (isSelected) {
      newSelected = selectedCategories.filter(id => id !== categoryId);
    } else {
      newSelected = [...selectedCategories, categoryId];
    }
    
    onCategoriesChange(newSelected);
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) {
      setCreateError('El nombre es obligatorio');
      return;
    }

    try {
      setIsCreating(true);
      setCreateError('');

      // Crear categoría con valores por defecto
      const categoryData = {
        name: newCategoryName.trim(),
        description: '',
        color: '#3B82F6'
      };

      const createdCategory = await createCategory(categoryData);
      
      // Agregar la nueva categoría a la lista
      setCategories(prev => [...prev, createdCategory]);
      
      // Seleccionar automáticamente la nueva categoría
      onCategoriesChange([...selectedCategories, createdCategory._id]);
      
      // Limpiar formulario y cerrar modal
      setNewCategoryName('');
      setIsCreateModalOpen(false);
      
    } catch (error) {
      setCreateError(error.response?.data?.message || 'Error al crear categoría');
    } finally {
      setIsCreating(false);
    }
  };

  const getSelectedCategoryNames = () => {
    return categories
      .filter(cat => selectedCategories.includes(cat._id))
      .map(cat => cat.name)
      .join(', ');
  };

  return (
    <>
      <div className={`space-y-4 ${className}`}>
        {/* Campo de búsqueda */}
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar categorías..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Resumen de selección */}
        {selectedCategories.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              <span className="font-medium">{selectedCategories.length} categoría(s) seleccionada(s):</span>
              <br />
              {getSelectedCategoryNames()}
            </p>
          </div>
        )}

        {/* Lista de categorías */}
        <div className="border border-gray-300 rounded-lg max-h-64 overflow-y-auto">
          {isSearching ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Buscando...</span>
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchTerm ? 'No se encontraron categorías' : 'No hay categorías disponibles'}
            </div>
          ) : (
            <div className="p-2 space-y-1">
              {categories.map((category) => (
                <label
                  key={category._id}
                  className="flex items-center p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(category._id)}
                    onChange={() => handleCategoryToggle(category._id)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <div className="ml-3 flex items-center space-x-3 flex-1">
                    <div
                      className="w-4 h-4 rounded-full flex-shrink-0"
                      style={{ backgroundColor: category.color }}
                    ></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{category.name}</p>
                      {category.description && (
                        <p className="text-xs text-gray-500">{category.description}</p>
                      )}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Botón para crear nueva categoría */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsCreateModalOpen(true);
          }}
          className="w-full flex items-center justify-center px-4 py-2 border border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-colors"
        >
          <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Crear nueva categoría
        </button>

        {/* Error del selector */}
        {error && (
          <p className="text-red-600 text-sm">{error}</p>
        )}
      </div>

      {/* Modal para crear categoría - Fuera del contenedor principal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-[60]" onClick={(e) => e.stopPropagation()}>
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 shadow-2xl border" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Crear Nueva Categoría</h3>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsCreateModalOpen(false);
                  setCreateError('');
                  setNewCategoryName('');
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              {/* Nombre */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre de la categoría *
                </label>
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ej: Trading Avanzado"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleCreateCategory();
                    }
                  }}
                />
              </div>

              {/* Error */}
              {createError && (
                <p className="text-red-600 text-sm">{createError}</p>
              )}

              {/* Botones */}
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsCreateModalOpen(false);
                    setCreateError('');
                    setNewCategoryName('');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleCreateCategory}
                  disabled={isCreating}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {isCreating ? 'Creando...' : 'Crear'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CategorySelector; 