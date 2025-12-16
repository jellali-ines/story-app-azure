import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Heart, Folder, Music, Book, Star } from 'lucide-react';
import { useApp } from '../hooks/useAppState';
import Card from '../components/Card';
import Modal from '../components/Modal';
import DeleteConfirmModal from '../components/DeleteConfirmModal';

export default function AllPlaylistsPage() {
  const navigate = useNavigate();
  const { 
    folders,
    playlists,
    favoriteStoriesIds,
    favoritesIds,
    showCreateFolder,
    setShowCreateFolder,
    newFolderTitle,
    setNewFolderTitle,
    createFolder,
    editFolder,
    deleteFolder,
    deletePlaylist,
    editingFolderId,
    editFolderTitle,
    setEditFolderTitle,
    saveEditFolder,
    cancelEdit,
    stories
  } = useApp();

  // State for delete confirmation
  const [showDeletePlaylistModal, setShowDeletePlaylistModal] = useState(false);
  const [playlistToDelete, setPlaylistToDelete] = useState(null);

  const favoriteStories = stories.filter(s => favoriteStoriesIds.includes(s._id));
  const favoritePlaylists = playlists.filter(p => favoritesIds.includes(p._id));

  // Handle delete playlist click
  const handleDeletePlaylist = (playlistId) => {
    const playlist = playlists.find(p => p._id === playlistId);
    setPlaylistToDelete(playlist);
    setShowDeletePlaylistModal(true);
  };

  // Confirm delete playlist
  const handleConfirmDeletePlaylist = async () => {
    if (playlistToDelete) {
      await deletePlaylist(playlistToDelete._id);
      setShowDeletePlaylistModal(false);
      setPlaylistToDelete(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-gray-100 p-4 md:p-6">
      {/* Page Header بدون الهيدر الكبير */}
      <div className="max-w-7xl mx-auto mb-10">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">My Playlists</h1>
            <p className="text-gray-600 text-lg">
              Organize your favorite stories and playlists in beautiful collections
            </p>
          </div>
          <button 
            onClick={() => setShowCreateFolder(true)}
            className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl"
          >
            <Plus className="w-5 h-5" />
            New Playlist
          </button>
        </div>

        

        {/* Folders Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <Folder className="w-7 h-7 text-purple-600" />
                Folders
              </h2>
              <p className="text-gray-500 mt-1">Organize your playlists into folders</p>
            </div>
            {folders.length > 0 && (
              <span className="text-sm font-medium text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                {folders.length} folders
              </span>
            )}
          </div>
          
          {folders.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {folders.map(folder => (
                <div 
                  key={folder._id}
                  className="group relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-200 cursor-pointer"
                  onClick={() => navigate(`/folder/${folder._id}`)}
                >
                  <div className="aspect-video bg-gradient-to-br from-purple-100 to-pink-100 relative overflow-hidden">
                    {folder.image ? (
                      <img 
                        src={folder.image} 
                        alt={folder.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Folder className="w-16 h-16 text-gray-400" />
                      </div>
                    )}
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium">
                      {folder.playlistCount || 0} playlists
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="font-bold text-gray-900 text-lg mb-2 group-hover:text-purple-600 transition-colors">
                      {folder.name}
                    </h3>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Last updated: Today</span>
                      <div className="flex gap-2">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            editFolder(folder._id);
                          }}
                          className="text-gray-400 hover:text-purple-600 transition-colors"
                        >
                          ✏️
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteFolder(folder._id);
                          }}
                          className="text-gray-400 hover:text-red-600 transition-colors"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-white rounded-2xl border-2 border-dashed border-gray-300">
              <div className="w-20 h-20 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Plus className="w-10 h-10 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No folders yet</h3>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                Create your first folder to organize your playlists
              </p>
              <button 
                onClick={() => setShowCreateFolder(true)}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-medium hover:shadow-lg transition-all"
              >
                Create Folder
              </button>
            </div>
          )}
        </div>

        {/* Favorite Playlists */}
        {favoritePlaylists.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                  <Heart className="w-7 h-7 text-pink-600 fill-pink-600" />
                  Favorite Playlists
                </h2>
                <p className="text-gray-500 mt-1">Your most loved playlists</p>
              </div>
              <span className="text-sm font-medium text-pink-600 bg-pink-50 px-3 py-1 rounded-full">
                {favoritePlaylists.length} favorites
              </span>
            </div>
            <div className="flex gap-6 overflow-x-auto pb-6 scrollbar-hide">
              {favoritePlaylists.map(playlist => (
                <div key={playlist._id} className="flex-shrink-0 w-80">
                  <Card
                    item={playlist}
                    type="playlist"
                    isFavorite={true}
                    onClick={() => navigate(`/playlist/${playlist._id}`)}
                    onDelete={() => handleDeletePlaylist(playlist._id)}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Favorite Stories */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <Star className="w-7 h-7 text-yellow-500 fill-yellow-500" />
                Favorite Stories
              </h2>
              <p className="text-gray-500 mt-1">Stories you've marked as favorites</p>
            </div>
            {favoriteStories.length > 0 && (
              <span className="text-sm font-medium text-yellow-600 bg-yellow-50 px-3 py-1 rounded-full">
                {favoriteStories.length} favorites
              </span>
            )}
          </div>

          <div className="flex gap-6 overflow-x-auto pb-6 scrollbar-hide">
            {favoriteStories.length > 0 ? (
              favoriteStories.map(story => (
                <div key={story._id} className="flex-shrink-0 w-80">
                  <Card
                    item={story}
                    type="story"
                    onClick={() => navigate(`/story/${story._id}`)}
                  />
                </div>
              ))
            ) : (
              <div className="text-center py-16 w-full bg-gradient-to-br from-gray-50 to-white rounded-2xl border-2 border-dashed border-gray-300">
                <div className="w-20 h-20 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Heart className="w-10 h-10 text-yellow-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">No favorite stories yet</h3>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">
                  Click the heart icon on any story to add it to your favorites
                </p>
                <button 
                  onClick={() => navigate('/stories')}
                  className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-xl font-medium hover:shadow-lg transition-all"
                >
                  Browse Stories
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {showCreateFolder && (
        <Modal 
          type="input"
          title="Create New Folder"
          value={newFolderTitle}
          onChange={setNewFolderTitle}
          onSubmit={createFolder}
          onCancel={() => setShowCreateFolder(false)}
          placeholder="Enter folder name"
        />
      )}

      {editingFolderId && (
        <Modal 
          type="input"
          title="Edit Folder Name"
          value={editFolderTitle}
          onChange={setEditFolderTitle}
          onSubmit={saveEditFolder}
          onCancel={cancelEdit}
        />
      )}

      {/* Delete Playlist Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={showDeletePlaylistModal}
        onClose={() => {
          setShowDeletePlaylistModal(false);
          setPlaylistToDelete(null);
        }}
        onConfirm={handleConfirmDeletePlaylist}
        playlistName={playlistToDelete?.name || ''}
      />
    </div>
  );
}