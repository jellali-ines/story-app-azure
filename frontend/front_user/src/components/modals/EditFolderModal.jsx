import { useApp } from "../../hooks/useAppState";

export default function EditFolderModal() {
  const { 
    editFolderTitle, 
    setEditFolderTitle, 
    saveEditFolder, 
    cancelEdit 
  } = useApp();

  const handleSubmit = () => {
    saveEditFolder();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-2xl w-full max-w-md p-6">
        <h2 className="text-2xl font-bold text-white mb-6 text-center">Edit Playlist Title</h2>
        
        <input
          type="text"
          value={editFolderTitle}
          onChange={(e) => setEditFolderTitle(e.target.value)}
          className="w-full bg-transparent border-b-2 border-purple-500 text-white py-3 mb-8 outline-none placeholder-gray-400 text-center text-xl"
          autoFocus
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSubmit();
            if (e.key === 'Escape') cancelEdit();
          }}
        />

        <div className="flex gap-4 justify-stretch">
          <button 
            onClick={cancelEdit}
            className="flex-1 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl transition-colors font-medium"
          >
            Cancel
          </button>
          <button 
            onClick={handleSubmit}
            className="flex-1 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition-colors font-medium"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}