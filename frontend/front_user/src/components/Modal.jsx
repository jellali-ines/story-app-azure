import { Plus } from 'lucide-react';

export default function Modal({ 
  // Type
  type = 'input', // 'input' | 'select'
  
  // General properties
  title,
  onCancel,
  
  // For Input Modal (Create/Edit)
  value = '',
  onChange,
  onSubmit,
  placeholder = '',
  submitText = 'Save',
  cancelText = 'Cancel',
  
  // For Select Modal (Add to folders)
  items = [],
  selectedIds = [],
  onToggleItem,
  onCreateNew,
  createNewText = 'Create new playlist'
}) {
  
  const handleSubmit = () => {
    onSubmit?.();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSubmit();
    if (e.key === 'Escape') onCancel?.();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          {title}
        </h2>
        
        {/* ===== Input Modal (Create/Edit Folder) ===== */}
        {type === 'input' && (
          <>
            <input
              type="text"
              placeholder={placeholder}
              value={value}
              onChange={(e) => onChange?.(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full bg-transparent border-b-2 border-purple-500 text-gray-900 py-3 mb-8 outline-none placeholder-gray-400 text-center text-xl"
              autoFocus
            />

            <div className="flex gap-4">
              <button 
                onClick={onCancel}
                className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl transition-colors font-medium"
              >
                {cancelText}
              </button>
              <button 
                onClick={handleSubmit}
                disabled={!value.trim()}
                className="flex-1 px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-xl transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitText}
              </button>
            </div>
          </>
        )}

        {/* ===== Select Modal (Add to Folders) ===== */}
        {type === 'select' && (
          <>
            {/* Create new button */}
            {onCreateNew && (
              <button 
                onClick={onCreateNew}
                className="w-full bg-purple-100 hover:bg-purple-200 text-purple-700 py-4 rounded-xl mb-4 flex items-center gap-3 px-4 transition-colors"
              >
                <Plus className="w-6 h-6" />
                <span className="font-semibold">{createNewText}</span>
              </button>
            )}

            {/* Items list */}
            <div className="space-y-3 mb-6 max-h-96 overflow-y-auto">
              {items.length > 0 ? (
                items.map((item) => (
                  <button
                    key={item._id}
                    onClick={() => onToggleItem?.(item._id)}
                    className="w-full bg-gray-50 hover:bg-gray-100 text-gray-800 py-4 rounded-xl flex items-center gap-3 px-4 transition-colors border border-gray-200"
                  >
                    <img 
                      src={item.image || 'https://www.readthetale.com/wp-content/uploads/2024/08/peter-pan.jpg'} 
                      alt={item.name}
                      className="w-12 h-12 rounded object-cover"
                    />
                    <span className="font-semibold flex-1 text-left text-gray-800">
                      {item.name}
                    </span>
                      
                    {/* Checkbox */}
                    <div 
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                        selectedIds.includes(item._id)
                          ? 'bg-purple-500 border-purple-500' 
                          : 'border-gray-400'
                      }`}
                    >
                      {selectedIds.includes(item._id) && (
                        <svg className="w-4 h-4 text-white" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                          <path d="M5 13l4 4L19 7"></path>
                        </svg>
                      )}
                    </div>
                  </button>
                ))
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <p>No items available</p>
                </div>
              )}
            </div>

            {/* Control buttons */}
            <button 
              onClick={onCancel}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 py-3 rounded-xl transition-colors"
            >
              {cancelText}
            </button>
            
            {selectedIds.length > 0 && (
              <button 
                onClick={handleSubmit}
                className="w-full bg-purple-500 hover:bg-purple-600 text-white py-3 rounded-xl transition-colors mt-3"
              >
                {submitText || `Add to ${selectedIds.length} playlist${selectedIds.length > 1 ? 's' : ''}`}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}