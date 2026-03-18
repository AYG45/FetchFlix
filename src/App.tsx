import { useState, useEffect } from 'react';
import './App.css';
import { SearchBar } from './components/SearchBar';
import { MovieGrid } from './components/MovieGrid';
import { AnimePlayer } from './components/AnimePlayer';
import { Auth } from './components/Auth';
import { fetchPopularAnime, fetchTrendingAnime, searchAnime } from './api';
import { addToRecentlyWatched, getRecentlyWatched } from './utils/storage';
import { addToWishlist, removeFromWishlist, getWishlist, isInWishlist } from './utils/wishlist';
import type { Movie } from './types';

interface User {
  email: string;
  name: string;
}

function App() {
  const [anime, setAnime] = useState<Movie[]>([]);
  const [recentlyWatched, setRecentlyWatched] = useState<Movie[]>([]);
  const [wishlist, setWishlist] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAnime, setSelectedAnime] = useState<Movie | null>(null);
  const [activeTab, setActiveTab] = useState<'popular' | 'trending' | 'wishlist'>('popular');
  const [user, setUser] = useState<User | null>(null);
  const [showAuth, setShowAuth] = useState(false);

  useEffect(() => {
    // Check for existing user session
    const savedUser = localStorage.getItem('fetchflix_user');
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      setUser(userData);
      setWishlist(getWishlist(userData.email));
    }
    
    loadPopularAnime();
    setRecentlyWatched(getRecentlyWatched());
  }, []);

  const loadPopularAnime = async () => {
    setLoading(true);
    try {
      const data = await fetchPopularAnime();
      setAnime(data.results);
      setSearchQuery('');
      setActiveTab('popular');
    } catch (error) {
      console.error('Error loading anime:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTrendingAnime = async () => {
    setLoading(true);
    try {
      const data = await fetchTrendingAnime();
      setAnime(data.results);
      setSearchQuery('');
      setActiveTab('trending');
    } catch (error) {
      console.error('Error loading trending anime:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadWishlist = () => {
    if (user) {
      const userWishlist = getWishlist(user.email);
      setAnime(userWishlist);
      setSearchQuery('');
      setActiveTab('wishlist');
      setLoading(false);
    }
  };

  const handleSearch = async (query: string) => {
    setLoading(true);
    setSearchQuery(query);
    setActiveTab('popular');
    try {
      const data = await searchAnime(query);
      setAnime(data.results);
    } catch (error) {
      console.error('Error searching anime:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlayAnime = (anime: Movie) => {
    setSelectedAnime(anime);
    addToRecentlyWatched(anime);
    setRecentlyWatched(getRecentlyWatched());
  };

  const handleClosePlayer = () => {
    setSelectedAnime(null);
  };

  const handleLogin = (userData: User) => {
    setUser(userData);
    setWishlist(getWishlist(userData.email));
    setShowAuth(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('fetchflix_user');
    setUser(null);
    setWishlist([]);
    if (activeTab === 'wishlist') {
      loadPopularAnime();
    }
  };

  const handleWishlist = (movie: Movie) => {
    if (!user) return;
    
    const isCurrentlyWishlisted = isInWishlist(user.email, movie.id);
    
    if (isCurrentlyWishlisted) {
      removeFromWishlist(user.email, movie.id);
    } else {
      addToWishlist(user.email, movie);
    }
    
    const updatedWishlist = getWishlist(user.email);
    setWishlist(updatedWishlist);
    
    // If we're currently viewing the wishlist, update the displayed anime
    if (activeTab === 'wishlist') {
      setAnime(updatedWishlist);
    }
  };

  const checkIsWishlisted = (movieId: number): boolean => {
    return user ? isInWishlist(user.email, movieId) : false;
  };

  return (
    <div className="app">
      <header className="header">
        <h1 className="title" onClick={loadPopularAnime} style={{ cursor: 'pointer' }}>
          FETCHFLIX
        </h1>
        <div className="header-right">
          <SearchBar onSearch={handleSearch} />
          {user ? (
            <div className="user-menu">
              <span className="user-name">Hi, {user.name}</span>
              <button className="logout-btn" onClick={handleLogout}>Logout</button>
            </div>
          ) : (
            <button className="login-btn" onClick={() => setShowAuth(true)}>
              Sign In
            </button>
          )}
        </div>
      </header>
      
      <main className="main">
        {searchQuery && (
          <div className="search-info">
            Showing results for: <strong>{searchQuery}</strong>
          </div>
        )}

        {!searchQuery && recentlyWatched.length > 0 && (
          <section className="section">
            <h2 className="section-title">Recently Watched</h2>
            <div className="horizontal-scroll">
              {recentlyWatched.map((anime) => (
                <div key={anime.id} className="small-card" onClick={() => handlePlayAnime(anime)}>
                  <img 
                    src={anime.poster_path || ''} 
                    alt={anime.title}
                  />
                  <div className="small-card-overlay">
                    <span className="play-icon">▶</span>
                  </div>
                  {user && (
                    <button 
                      className={`wishlist-btn small ${checkIsWishlisted(anime.id) ? 'wishlisted' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleWishlist(anime);
                      }}
                      title={checkIsWishlisted(anime.id) ? 'Remove from wishlist' : 'Add to wishlist'}
                    >
                      {checkIsWishlisted(anime.id) ? '❤️' : '🤍'}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {!searchQuery && (
          <div className="tabs">
            <button 
              className={`tab ${activeTab === 'popular' ? 'active' : ''}`}
              onClick={loadPopularAnime}
            >
              Popular Anime
            </button>
            <button 
              className={`tab ${activeTab === 'trending' ? 'active' : ''}`}
              onClick={loadTrendingAnime}
            >
              Trending Anime
            </button>
            {user && (
              <button 
                className={`tab ${activeTab === 'wishlist' ? 'active' : ''}`}
                onClick={loadWishlist}
              >
                My Wishlist ({wishlist.length})
              </button>
            )}
          </div>
        )}

        <MovieGrid 
          movies={anime} 
          loading={loading} 
          onPlay={handlePlayAnime}
          onWishlist={user ? handleWishlist : undefined}
          isWishlisted={checkIsWishlisted}
          showWishlist={!!user}
        />
      </main>

      {selectedAnime && (
        <AnimePlayer
          tmdbId={selectedAnime.id}
          title={selectedAnime.title}
          onClose={handleClosePlayer}
        />
      )}

      {showAuth && (
        <Auth
          onLogin={handleLogin}
          onClose={() => setShowAuth(false)}
        />
      )}
    </div>
  );
}

export default App;
