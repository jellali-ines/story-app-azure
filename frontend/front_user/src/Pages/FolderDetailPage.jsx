import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Folder, Play, Book } from 'lucide-react';
import { useState } from 'react';
import { useApp } from '../hooks/useAppState';
import DeleteConfirmModal from '../components/DeleteConfirmModal';

export default function FolderDetailPage() {
  const navigate = useNavigate();
  const { folderId } = useParams();
  const { folders, playlists, favoritesIds, deletePlaylist } = useApp();

  // State for delete confirmation
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [playlistToDelete, setPlaylistToDelete] = useState(null);

  // Find folder and its playlists
  const folder = folders.find(f => f._id === folderId);
  const filteredPlaylists = playlists.filter(p => p.folderId === folderId);

  // Handle playlist click - Open first story directly
  const handlePlaylistClick = (playlist) => {
    console.log('📖 Opening playlist:', playlist);
    console.log('📚 Stories in playlist:', playlist.stories);
    
    // If playlist has stories, open the first one
    if (playlist.stories && playlist.stories.length > 0) {
      const firstStoryId = playlist.stories[0];
      console.log('🎯 First story ID:', firstStoryId);
      console.log('🎯 Story ID type:', typeof firstStoryId);
      console.log('🚀 Navigating to /story/' + firstStoryId);
      navigate(`/story/${firstStoryId}`);
    } else {
      console.warn('⚠️  Playlist has no stories');
      alert('Cette playlist ne contient pas encore d\'histoires.');
    }
  };

  // Handle delete click
  const handleDeleteClick = (playlistId) => {
    const playlist = playlists.find(p => p._id === playlistId);
    setPlaylistToDelete(playlist);
    setShowDeleteModal(true);
  };

  // Confirm delete
  const handleConfirmDelete = async () => {
    if (playlistToDelete) {
      await deletePlaylist(playlistToDelete._id);
      setShowDeleteModal(false);
      setPlaylistToDelete(null);
    }
  };

  if (!folder) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white via-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-center text-gray-900 max-w-md mx-auto p-6">
          <Folder className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-4">Folder not found</h1>
          <p className="text-gray-600 mb-6">This folder may have been deleted or doesn't exist.</p>
          <button 
            onClick={() => navigate('/playlists')}
            className="px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-full transition-colors shadow-lg"
          >
            Back to Playlists
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-purple-50 to-blue-50">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white bg-opacity-95 backdrop-blur-sm border-b border-gray-200 shadow-sm">
        <div className="flex items-center gap-4 p-4">
          <button 
            onClick={() => navigate('/playlists')}
            className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-800 hover:bg-gray-200 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">{folder.name}</h1>
            <p className="text-gray-600 text-sm">{filteredPlaylists.length} playlists</p>
          </div>
        </div>
      </div>

      {/* Playlists Grid */}
      <div className="p-6">
        {filteredPlaylists.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredPlaylists.map((playlist) => (
              <div key={playlist._id} className="group">
                {/* Card Container */}
                <div className="relative">
                  {/* Clickable Story Card */}
                  <div 
                    onClick={() => handlePlaylistClick(playlist)}
                    className="cursor-pointer relative"
                  >
                    <div className="relative aspect-video bg-gray-100 rounded-2xl overflow-hidden mb-4 shadow-lg border border-gray-200 transition-all duration-300 group-hover:shadow-2xl group-hover:scale-[1.02]">
                      {/* Image */}
                      {playlist.image ? (
                        <img 
                          src={playlist.image}
                          alt={playlist.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-100 to-pink-100">
                          <Book className="w-16 h-16 text-gray-400" />
                        </div>
                      )}
                      
                      {/* Dark overlay on hover */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300" />
                      
                      {/* Stories count badge */}
                      <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm text-gray-800 text-xs font-semibold px-3 py-1.5 rounded-full shadow-md">
                        {playlist.videos || 0} stories
                      </div>

                      {/* Play button on hover */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                        <div className="w-16 h-16 rounded-full bg-white/95 backdrop-blur-sm flex items-center justify-center shadow-2xl transform scale-90 group-hover:scale-100 transition-all duration-300">
                          <Play className="w-8 h-8 text-purple-600 ml-1" fill="currentColor" />
                        </div>
                      </div>

                      {/* Favorite indicator */}
                      {favoritesIds.includes(playlist._id) && (
                        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg">
                          <span className="text-yellow-400 text-xl">⭐</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Delete button */}
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteClick(playlist._id);
                    }}
                    className="absolute top-3 right-3 w-10 h-10 rounded-full bg-red-500/90 backdrop-blur-sm hover:bg-red-600 flex items-center justify-center text-white transition-all duration-300 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 z-20 shadow-lg"
                    aria-label="Delete playlist"
                  >
                    🗑️
                  </button>
                </div>
                
                {/* Title */}
                <div className="px-1">
                  <h3 
                    onClick={() => handlePlaylistClick(playlist)}
                    className="font-bold text-gray-900 text-lg line-clamp-2 mb-1 group-hover:text-purple-600 transition-colors cursor-pointer"
                  >
                    {playlist.name}
                  </h3>
                  
                  {playlist.duration && (
                    <p className="text-sm text-gray-500">
                      ⏱️ {playlist.duration}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-600 py-20">
            <Folder className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-xl font-semibold mb-2">No playlists in this folder</p>
            <p className="text-sm">Add stories to create playlists in this folder</p>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setPlaylistToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        playlistName={playlistToDelete?.name || ''}
      />
    </div>
  );
}