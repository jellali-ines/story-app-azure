import { Plus } from 'lucide-react';
import { useApp } from "../../hooks/useAppState";

export default function AddToFolderModal() {
  const { 
    folders,
    selectedFolderIds,
    toggleFolderSelection,
    setShowAddToFolder,
    setShowCreateFolder,
    addStoryToFolders
  } = useApp();

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-sm p-5 shadow-2xl">
        <h2 className="text-lg font-bold text-gray-900 mb-4 text-center">Add to Playlist</h2>
        
        <button 
          onClick={() => setShowCreateFolder(true)}
          className="w-full bg-gradient-to-r from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 border-2 border-dashed border-blue-300 hover:border-blue-400 text-blue-700 py-3 rounded-lg mb-4 flex items-center gap-3 px-4 transition-all duration-200 group text-sm"
        >
          <div className="w-9 h-9 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
            <Plus className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold">Create new playlist</span>
        </button>

        <div className="space-y-2.5 mb-5 max-h-52 overflow-y-auto pr-2">
          {folders.length > 0 ? (
            folders.map((folder) => (
              <button
                key={folder._id}
                onClick={() => toggleFolderSelection(folder._id)}
                className="w-full bg-white hover:bg-gray-50 border hover:border-purple-400 text-gray-800 py-2.5 rounded-lg flex items-center gap-3 px-3 transition-all duration-200 shadow-sm text-left"
              >
                <div className="relative">
                  <img 
                    src={folder.image || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=100&auto=format&fit=crop'} 
                    alt={folder.name}
                    className="w-10 h-10 rounded-lg object-cover border border-gray-200"
                  />
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-white rounded-full border border-gray-300"></div>
                </div>
                <div className="flex-1">
                  <span className="font-semibold text-gray-900 block text-sm">{folder.name}</span>
                  <span className="text-xs text-gray-500">{folder.playlistCount || 0} stories</span>
                </div>
                <div 
                  className={`w-6 h-6 rounded-full border flex items-center justify-center transition-all duration-200 ${
                    selectedFolderIds.includes(folder._id)
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 border-transparent scale-105' 
                      : 'border-gray-400 hover:border-purple-400'
                  }`}
                >
                  {selectedFolderIds.includes(folder._id) && (
                    <svg className="w-3.5 h-3.5 text-white" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" viewBox="0 0 24 24" stroke="currentColor">
                      <path d="M5 13l4 4L19 7"></path>
                    </svg>
                  )}
                </div>
              </button>
            ))
          ) : (
            <div className="text-center py-5 text-gray-500">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Plus className="w-5 h-5 text-gray-400" />
              </div>
              <p className="text-sm text-gray-600">No playlists yet</p>
              <p className="text-xs text-gray-500 mt-1">Create a new playlist to get started</p>
            </div>
          )}
        </div>

        <div className="space-y-2.5 pt-3 border-t border-gray-200">
          <button 
            onClick={() => setShowAddToFolder(false)}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 rounded-lg transition-all duration-200 font-medium border border-gray-300 hover:border-gray-400 text-sm"
          >
            Cancel
          </button>
          
          {selectedFolderIds.length > 0 && (
            <button 
              onClick={addStoryToFolders}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-2.5 rounded-lg transition-all duration-200 font-medium shadow hover:shadow-md text-sm"
            >
              Add to {selectedFolderIds.length} playlist{selectedFolderIds.length > 1 ? 's' : ''}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}