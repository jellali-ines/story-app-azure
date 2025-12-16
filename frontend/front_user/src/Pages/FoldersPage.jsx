import { useNavigate } from 'react-router-dom';
import { Plus, Folder, ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { useApp } from '../hooks/useAppState';
import CreateFolderModal from '../components/modals/CreateFolderModal';
import EditFolderModal from '../components/modals/EditFolderModal';
import DeleteConfirmModal from '../components/DeleteConfirmModal';

export default function FoldersPage() {
  const navigate = useNavigate();
  const { 
    folders,
    loading,
    error,
    setShowCreateFolder,
    showCreateFolder,
    editingFolderId,
    showFolderMenu,
    setShowFolderMenu,
    editFolder,
    deleteFolder
  } = useApp();

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [folderToDelete, setFolderToDelete] = useState(null);

  const handleDeleteClick = (folderId) => {
    const folder = folders.find(f => f._id === folderId);
    setFolderToDelete(folder);
    setShowDeleteModal(true);
    setShowFolderMenu(null);
  };

  const handleConfirmDelete = async () => {
    if (folderToDelete) {
      await deleteFolder(folderToDelete._id);
      setShowDeleteModal(false);
      setFolderToDelete(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading folders...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-red-400 text-xl">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-slate-900 bg-opacity-90 backdrop-blur-sm border-b border-slate-700">
        <div className="flex items-center gap-4 p-4">
          <button 
            onClick={() => navigate('/')}
            className="w-10 h-10 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white">Playlists</h1>
            <p className="text-gray-400 text-sm">{folders.length} folders</p>
          </div>
          <button 
            onClick={() => setShowCreateFolder(true)}
            className="w-10 h-10 rounded-full bg-purple-600 hover:bg-purple-700 flex items-center justify-center text-white transition-colors"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Folders Grid */}
      <div className="p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {folders.map((folder) => (
            <div key={folder._id} className="group">
              <div 
                onClick={() => navigate(`/folder/${folder._id}`)}
                className="cursor-pointer"
              >
                <div className="relative aspect-video bg-slate-700 rounded-xl overflow-hidden mb-3">
                  {folder.image ? (
                    <>
                      <img 
                        src={folder.image} 
                        alt={folder.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-40 transition-opacity duration-300"></div>
                      <div className="absolute bottom-2 right-2 bg-black bg-opacity-90 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                        <span>{folder.playlistCount}</span>
                        <span>playlists</span>
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-700 to-slate-800">
                      <div className="text-center">
                        <Folder className="w-12 h-12 text-gray-500 mx-auto mb-2" />
                        <div className="text-gray-400 text-xs">Empty folder</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-white mb-1 group-hover:text-purple-400 transition-colors line-clamp-2">
                    {folder.name}
                  </h3>
                  
                  <p className="text-sm text-gray-400">Privée · Playlist</p>
                  <p className="text-sm text-gray-400">Mise à jour aujourd'hui</p>
                  <button 
                    onClick={() => navigate(`/folder/${folder._id}`)} 
                    className="text-sm text-purple-400 hover:text-purple-300 mt-1 transition-colors"
                  >
                    Afficher la playlist complète
                  </button>
                </div>
                
                <div className="relative">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowFolderMenu(showFolderMenu === folder._id ? null : folder._id);
                    }}
                    className="w-8 h-8 rounded-full hover:bg-slate-700 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                  >
                    ⋮
                  </button>
                  
                  {showFolderMenu === folder._id && (
                    <>
                      <div 
                        className="fixed inset-0 z-10"
                        onClick={() => setShowFolderMenu(null)}
                      ></div>
                      <div className="absolute right-0 top-10 bg-slate-800 rounded-xl shadow-2xl overflow-hidden z-20 w-48">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            editFolder(folder._id);
                          }}
                          className="w-full px-4 py-3 text-left text-white hover:bg-slate-700 flex items-center gap-3 transition-colors"
                        >
                          <span className="text-lg">✏️</span>
                          <span>Change title</span>
                        </button>
                        <div className="h-px bg-red-500"></div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteClick(folder._id);
                          }}
                          className="w-full px-4 py-3 text-left text-white hover:bg-slate-700 flex items-center gap-3 transition-colors"
                        >
                          <span className="text-lg">🗑️</span>
                          <span>Delete folder</span>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modals */}
      {showCreateFolder && <CreateFolderModal />}
      {editingFolderId && <EditFolderModal />}
      
      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setFolderToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        playlistName={folderToDelete?.name || ''}
      />
    </div>
  );
}