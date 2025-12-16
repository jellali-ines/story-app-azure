import { Folder, Star, MoreVertical, Trash2, Book } from 'lucide-react';
import { useState } from 'react';

export default function Card({ 
  item,
  type = 'playlist',  // item type: 'playlist' | 'folder' | 'story'
  isFavorite = false,
  onClick,
  onEdit,
  onDelete 
}) {
  const [showMenu, setShowMenu] = useState(false);

  // Check type
  const isFolder = type === 'folder';
  const isStory = type === 'story';
  const isPlaylist = type === 'playlist';

  // ===== Displayed data =====
  const title = item.name || item.title || 'Untitled';
  
  // Subtitle based on type
  let subtitle = '';
  if (isFolder) {
    subtitle = `${item.playlistCount || 0} playlists`;
  } else if (isStory) {
    subtitle = item.duration || 'Story';
  } else { // playlist
    subtitle = `${item.videos || 0} stories`;
  }

  // ===== Event handlers =====
  const handleCardClick = () => {
    if (onClick) onClick();
  };

  const handleMenuClick = (e) => {
    e.stopPropagation();
    setShowMenu(!showMenu);
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    if (onEdit) onEdit(item._id);
    setShowMenu(false);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    if (onDelete) onDelete(item._id);
    setShowMenu(false);
  };

  // ===== Helper function to display image =====
  const renderImage = () => {
    if (item.image) {
      return (
        <img 
          src={item.image} 
          alt={title} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
        />
      );
    }
    
    // Icon based on type if no image
    return (
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        {isFolder ? (
          <Folder className="w-16 h-16 text-gray-400" />
        ) : isStory ? (
          <Book className="w-16 h-16 text-gray-400" />
        ) : (
          <Folder className="w-16 h-16 text-gray-400" />
        )}
      </div>
    );
  };

  // ===== Main interface =====
  return (
    <div className="flex-shrink-0 w-64 group" role="article">
      <div className="relative">
        {/* Clickable area (image) */}
        <div 
          onClick={handleCardClick}
          className="cursor-pointer"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && handleCardClick()}
        >
          <div className="relative aspect-video bg-gray-100 rounded-2xl overflow-hidden mb-4 shadow-lg border border-gray-200">
            {/* Image or icon */}
            {renderImage()}
            
            {/* Darkening effect on hover */}
            <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
            
            {/* Favorite star (for playlists and stories) */}
            {!isFolder && isFavorite && (
              <Star 
                className="absolute top-4 right-4 w-6 h-6 fill-yellow-400 text-yellow-400 drop-shadow-lg"
                aria-label="Favorite"
              />
            )}
            
            {/* Subtitle (number of playlists/stories/duration) */}
            <div className="absolute bottom-3 left-3 bg-white bg-opacity-90 text-gray-800 text-xs px-2 py-1 rounded shadow-md">
              {subtitle}
            </div>
          </div>
        </div>

        {/* Delete button for playlists only */}
        {isPlaylist && onDelete && (
          <button 
            onClick={handleDelete}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center text-white transition-all opacity-0 group-hover:opacity-100 z-10 shadow-lg"
            aria-label="Delete playlist"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}

        {/* Options menu for folders only */}
        {isFolder && (onEdit || onDelete) && (
          <>
            <button 
              onClick={handleMenuClick}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white bg-opacity-90 hover:bg-opacity-100 flex items-center justify-center text-gray-800 transition-all opacity-0 group-hover:opacity-100 z-10 shadow-md"
              aria-label="More options"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
            
            {/* Popup menu */}
            {showMenu && (
              <>
                {/* Transparent overlay to close menu */}
                <div 
                  className="fixed inset-0 z-20" 
                  onClick={() => setShowMenu(false)} 
                  aria-hidden="true"
                />
                
                {/* Menu itself */}
                <div className="absolute top-12 right-3 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-30 w-48">
                  {onEdit && (
                    <button 
                      onClick={handleEdit}
                      className="w-full px-4 py-3 text-left text-gray-800 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                    >
                      <span role="img" aria-label="Edit">✏️</span>
                      <span>Change title</span>
                    </button>
                  )}
                  
                  {onEdit && onDelete && (
                    <div className="h-px bg-gray-200"></div>
                  )}
                  
                  {onDelete && (
                    <button 
                      onClick={handleDelete}
                      className="w-full px-4 py-3 text-left text-red-600 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                    >
                      <span role="img" aria-label="Delete">🗑️</span>
                      <span>Delete</span>
                    </button>
                  )}
                </div>
              </>
            )}
          </>
        )}
      </div>
      
      {/* Title only (without description) */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h3 
            onClick={handleCardClick}
            className="font-bold text-gray-900 text-lg line-clamp-2 mb-2 group-hover:text-purple-600 transition-colors cursor-pointer"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && handleCardClick()}
          >
            {title}
          </h3>
          {/* Description line removed here */}
        </div>
      </div>
    </div>
  );
}