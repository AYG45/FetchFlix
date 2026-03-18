import type { Movie } from '../types';

interface MovieCardProps {
  movie: Movie;
  onPlay: (movie: Movie) => void;
  onWishlist?: (movie: Movie) => void;
  isWishlisted?: boolean;
  showWishlist?: boolean;
}

export const MovieCard = ({ movie, onPlay, onWishlist, isWishlisted, showWishlist }: MovieCardProps) => (
  <div className="movie-card">
    <div className="movie-poster">
      {movie.poster_path ? (
        <img src={movie.poster_path} alt={movie.title} />
      ) : (
        <div className="no-poster">No Image</div>
      )}
      <div className="play-overlay" onClick={() => onPlay(movie)}>
        <div className="play-button">▶</div>
      </div>
      {showWishlist && onWishlist && (
        <button 
          className={`wishlist-btn ${isWishlisted ? 'wishlisted' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            onWishlist(movie);
          }}
          title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          {isWishlisted ? '❤️' : '🤍'}
        </button>
      )}
    </div>
    <div className="movie-info">
      <h3 className="movie-title">{movie.title}</h3>
      <div className="movie-meta">
        <span className="movie-year">
          {movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A'}
        </span>
        <span className="movie-rating">
          ★ {movie.vote_average > 0 ? movie.vote_average.toFixed(1) : 'N/A'}
        </span>
      </div>
      <p className="movie-overview">{movie.overview || 'No description available.'}</p>
    </div>
  </div>
);
