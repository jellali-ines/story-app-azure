import { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { foldersAPI, playlistsAPI, storiesAPI } from "../services/api";

const AppContext = createContext();

export function AppProvider({ children }) {
  // ===== State =====
  const [folders, setFolders] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [stories, setStories] = useState([]);
  const [currentStory, setCurrentStory] = useState(null);

  // Favorites
  const [favoriteStoriesIds, setFavoriteStoriesIds] = useState([]);
  const [favoritesIds, setFavoritesIds] = useState([]);

  // Loading & Error
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modals
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [showAddToFolder, setShowAddToFolder] = useState(false);
  const [showFolderMenu, setShowFolderMenu] = useState(null);
  const [editingFolderId, setEditingFolderId] = useState(null);

  // Forms
  const [newFolderTitle, setNewFolderTitle] = useState('');
  const [editFolderTitle, setEditFolderTitle] = useState('');
  const [selectedFolderIds, setSelectedFolderIds] = useState([]);

  // ===== Load Data from API =====
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔄 Loading initial data...');

      const [foldersRes, playlistsRes, storiesRes] = await Promise.all([
        foldersAPI.getAll().catch(err => {
          console.error('❌ Error loading folders:', err);
          return { data: [] };
        }),
        playlistsAPI.getAll().catch(err => {
          console.error('❌ Error loading playlists:', err);
          return { data: [] };
        }),
        storiesAPI.getAll().catch(err => {
          console.error('❌ Error loading stories:', err);
          return { stories: [] };
        })
      ]);

      const foldersData = foldersRes.data || foldersRes || [];
      const playlistsData = playlistsRes.data || playlistsRes || [];
      const storiesData = storiesRes.stories || storiesRes.data || storiesRes || [];

      console.log('✅ Folders loaded:', foldersData.length);
      console.log('✅ Playlists loaded:', playlistsData.length);
      console.log('✅ Stories loaded:', storiesData.length);

      setFolders(foldersData);
      setPlaylists(playlistsData);
      setStories(storiesData);

      if (storiesData.length > 0) setCurrentStory(storiesData[0]);

      // Initialize favorites
      const playlistFavorites = playlistsData
        .filter(p => p.isFavorite)
        .map(p => p._id);
      setFavoritesIds(playlistFavorites);

      const storyFavorites = storiesData
        .filter(s => s.isFavorite)
        .map(s => s._id);
      setFavoriteStoriesIds(storyFavorites);

      setLoading(false);
    } catch (err) {
      console.error('❌ Error loading data:', err);
      setError(err.message || 'Failed to load data');
      setLoading(false);
    }
  };

  // ===== Computed Values =====
  const favoritePlaylists = useMemo(() => {
    return playlists.filter(p => favoritesIds.includes(p._id));
  }, [playlists, favoritesIds]);

  const favoriteStories = useMemo(() => {
    return stories.filter(s => favoriteStoriesIds.includes(s._id));
  }, [stories, favoriteStoriesIds]);

  const isStoryFavorite = useMemo(() => {
    if (!currentStory) return false;
    return favoriteStoriesIds.includes(currentStory._id);
  }, [currentStory, favoriteStoriesIds]);

  // ===== Actions =====

  const toggleFavorite = async (playlistId) => {
    try {
      const response = await playlistsAPI.toggleFavorite(playlistId);
      const updatedPlaylist = response.data || response;
      
      setPlaylists(prev =>
        prev.map(p => p._id === playlistId ? updatedPlaylist : p)
      );
      
      setFavoritesIds(prev =>
        prev.includes(playlistId)
          ? prev.filter(id => id !== playlistId)
          : [...prev, playlistId]
      );
    } catch (err) {
      console.error('❌ Error toggling playlist favorite:', err);
    }
  };

  const handleStoryHeartClick = async () => {
    if (!currentStory) return;

    try {
      console.log('💜 Toggling story favorite for:', currentStory._id);
      const response = await storiesAPI.toggleFavorite(currentStory._id);
      const updatedStory = response.data || response;
      
      setCurrentStory(updatedStory);
      
      // Update stories list
      setStories(prev =>
        prev.map(s => s._id === currentStory._id ? updatedStory : s)
      );

      // Update favorite stories list
      setFavoriteStoriesIds(prev =>
        prev.includes(currentStory._id)
          ? prev.filter(id => id !== currentStory._id)
          : [...prev, currentStory._id]
      );

      console.log('✅ Story favorite toggled successfully');
    } catch (err) {
      console.error('❌ Error toggling story favorite:', err);
    }
  };

  const createFolder = async () => {
    if (!newFolderTitle.trim()) {
      console.warn('⚠️  Folder name is empty');
      return;
    }

    try {
      console.log('📁 Creating folder:', newFolderTitle);
      
      const response = await foldersAPI.create({
        name: newFolderTitle.trim()
        // playlistCount is set automatically by backend
      });
      
      const newFolder = response.data || response;
      console.log('✅ Folder created:', newFolder);
      
      setFolders(prev => [newFolder, ...prev]);
      setNewFolderTitle('');
      setShowCreateFolder(false);
      setShowAddToFolder(false);
      
      return newFolder._id;
    } catch (err) {
      console.error('❌ Error creating folder:', err);
      setError('Failed to create folder');
    }
  };

  const toggleFolderSelection = (folderId) => {
    setSelectedFolderIds(prev =>
      prev.includes(folderId)
        ? prev.filter(id => id !== folderId)
        : [...prev, folderId]
    );
  };

  const editFolder = (folderId) => {
    const folder = folders.find(f => f._id === folderId);
    if (folder) {
      setEditingFolderId(folderId);
      setEditFolderTitle(folder.name);
      setShowFolderMenu(null);
    }
  };

  const saveEditFolder = async () => {
    if (!editFolderTitle.trim() || !editingFolderId) return;
    
    try {
      console.log('✏️  Updating folder:', editingFolderId);
      
      const response = await foldersAPI.update(editingFolderId, { 
        name: editFolderTitle.trim() 
      });
      
      const updatedFolder = response.data || response;
      console.log('✅ Folder updated:', updatedFolder);
      
      setFolders(prev =>
        prev.map(folder => folder._id === editingFolderId ? updatedFolder : folder)
      );
      
      setEditingFolderId(null);
      setEditFolderTitle('');
    } catch (err) {
      console.error('❌ Error updating folder:', err);
    }
  };

  const cancelEdit = () => {
    setEditingFolderId(null);
    setEditFolderTitle('');
  };

  const deleteFolder = async (folderId) => {
    try {
      console.log('🗑️  Deleting folder:', folderId);
      
      await foldersAPI.delete(folderId);
      
      console.log('✅ Folder deleted');
      
      setFolders(prev => prev.filter(f => f._id !== folderId));
      setPlaylists(prev => prev.filter(p => p.folderId !== folderId));
      setShowFolderMenu(null);
    } catch (err) {
      console.error('❌ Error deleting folder:', err);
    }
  };

  const deletePlaylist = async (playlistId) => {
    try {
      console.log('🗑️  Deleting playlist:', playlistId);
      
      await playlistsAPI.delete(playlistId);
      
      // Remove from state
      setPlaylists(prev => prev.filter(p => p._id !== playlistId));
      
      // Remove from favorites
      setFavoritesIds(prev => prev.filter(id => id !== playlistId));
      
      // Update folder playlist count
      const playlist = playlists.find(p => p._id === playlistId);
      if (playlist && playlist.folderId) {
        const folder = folders.find(f => f._id === playlist.folderId);
        if (folder && folder.playlistCount > 0) {
          const response = await foldersAPI.update(playlist.folderId, { 
            playlistCount: folder.playlistCount - 1 
          });
          const updatedFolder = response.data || response;
          setFolders(prev =>
            prev.map(f => f._id === playlist.folderId ? updatedFolder : f)
          );
        }
      }
      
      console.log('✅ Playlist deleted');
    } catch (err) {
      console.error('❌ Error deleting playlist:', err);
    }
  };

const addStoryToFolders = async () => {
    if (!currentStory || selectedFolderIds.length === 0) {
      console.warn('⚠️  No story or folders selected');
      return;
    }

    try {
      console.log('📝 Adding story to folders:', selectedFolderIds);
      console.log('📖 Current story:', currentStory);
      
      const playlistPromises = selectedFolderIds.map(async folderId => {
        // ✅ تأكد من أن الـ image ليس فارغاً
        const playlistImage = currentStory.image_url 
          || currentStory.image 
          || 'https://via.placeholder.com/300/9333ea/ffffff?text=Story';
        
        const newPlaylist = {
          name: currentStory.title || 'New Story',
          folderId: folderId,
          image: playlistImage,
          videos: 1,
          duration: currentStory.duration || currentStory.reading_time || '5 min',
          description: currentStory.description || 'A magical story...',
          stories: [currentStory._id]
        };
        
        console.log('📦 Creating playlist:', newPlaylist);
        
        const response = await playlistsAPI.create(newPlaylist);
        return response.data || response;
      });

      const newPlaylists = await Promise.all(playlistPromises);
      console.log('✅ Playlists created:', newPlaylists.length);

      const folderPromises = selectedFolderIds.map(async folderId => {
        const folder = folders.find(f => f._id === folderId);
        const updateData = { playlistCount: (folder.playlistCount || 0) + 1 };
        
        // Update image if folder is empty
        if (folder.playlistCount === 0 && (!folder.image || folder.image === null)) {
          updateData.image = currentStory.image_url || currentStory.image || 'https://via.placeholder.com/300/9333ea/ffffff?text=Folder';
        }
        
        const response = await foldersAPI.update(folderId, updateData);
        return response.data || response;
      });

      const updatedFolders = await Promise.all(folderPromises);
      console.log('✅ Folders updated:', updatedFolders.length);

      setPlaylists(prev => [...prev, ...newPlaylists]);
      setFolders(prev =>
        prev.map(folder => updatedFolders.find(f => f._id === folder._id) || folder)
      );

      setShowAddToFolder(false);
      setSelectedFolderIds([]);
    } catch (err) {
      console.error('❌ Error adding story to folders:', err);
      console.error('❌ Error details:', err.response?.data || err.message);
      setError('Failed to add story to folders');
    }
  };

  const value = {
    // State
    folders,
    playlists,
    stories,
    favoritesIds,
    favoriteStoriesIds,
    favoritePlaylists,
    favoriteStories,
    currentStory,
    isStoryFavorite,
    loading,
    error,

    // Setters
    setCurrentStory,
    setStories,
    setFolders,
    setPlaylists,

    // Modals
    showCreateFolder,
    setShowCreateFolder,
    showAddToFolder,
    setShowAddToFolder,
    showFolderMenu,
    setShowFolderMenu,
    editingFolderId,

    // Forms
    newFolderTitle,
    setNewFolderTitle,
    editFolderTitle,
    setEditFolderTitle,
    selectedFolderIds,
    setSelectedFolderIds,

    // Actions
    toggleFavorite,
    handleStoryHeartClick,
    createFolder,
    toggleFolderSelection,
    editFolder,
    saveEditFolder,
    cancelEdit,
    deleteFolder,
    deletePlaylist,
    addStoryToFolders,
    loadInitialData,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};