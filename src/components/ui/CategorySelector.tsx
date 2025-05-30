import React, { useState, useEffect } from 'react';
import { CategoryOption } from '../../types';
import { categoryService } from '../../api';

interface CategorySelectorProps {
  onCategorySelect: (category: CategoryOption) => void;
  selectedCategoryId?: string;
}

const CategorySelector: React.FC<CategorySelectorProps> = ({ 
  onCategorySelect, 
  selectedCategoryId 
}) => {
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch categories from the API
  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      try {
        const response = await categoryService.getAllCategories();
        const categoryOptions: CategoryOption[] = response.map(cat => ({
          id: cat._id,
          name: cat.name,
          color: cat.color || undefined
        }));
        setCategories(categoryOptions);
      } catch (error) {
        console.error('Error fetching categories:', error);
        // Fallback to default categories if API fails
        setCategories([
          { id: 'chess', name: 'Chess', color: '#4f46e5' },
          { id: 'pingpong', name: 'Ping Pong', color: '#0ea5e9' },
          { id: 'pong', name: 'Pong', color: '#ef4444' }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // When categories are loaded and we have a selectedCategoryId, make sure it's selected
  useEffect(() => {
    if (selectedCategoryId && categories.length > 0) {
      const selectedCategory = categories.find(cat => cat.id === selectedCategoryId);
      if (selectedCategory) {
        // Only call onCategorySelect if the category exists and isn't already selected
        // This prevents infinite loops
        const isAlreadySelected = selectedCategory.id === selectedCategoryId;
        if (!isAlreadySelected) {
          onCategorySelect(selectedCategory);
        }
      }
    }
  }, [selectedCategoryId, categories]);  // Removed onCategorySelect from dependencies

  const handleCategorySelect = (category: CategoryOption) => {
    onCategorySelect(category);
  };

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="text-lg font-semibold">Select Category</h3>
      </div>
      <div className="card-body">
        {loading ? (
          <div className="flex justify-center py-4">
            <svg className="animate-spin h-6 w-6 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => handleCategorySelect(category)}
                className={`p-4 rounded-lg border-2 transition-all ${
                  selectedCategoryId === category.id
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
                }`}
                style={{
                  borderLeftColor: category.color || '#4f46e5',
                  borderLeftWidth: '4px'
                }}
              >
                <div className="font-medium">{category.name}</div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CategorySelector;