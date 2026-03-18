import type { Movie } from '../types';
import { MovieCard } from './MovieCard';

interface MovieGridProps {
  movies: Movie[];
  loading: boolean;
  onPlay: (movie: Movie) => void;
  onWishlist?: (movie: Movie) => void;
  isWishlisted?: (movieId: number) => boolean;
  showWishlist?: boolean;
}

export const MovieGrid = ({ movies, loading, onPlay, onWishlist, isWishlisted, showWishlist }: MovieGridProps) => {
  if (loading) return <div className="loading">Loading anime...</div>;
  if (movies.length === 0) return <div className="no-results">No anime found.</div>;

  return (
    <div className="movie-grid">
      {movies.map((movie) => (
        <MovieCard 
          key={movie.id} 
          movie={movie} 
          onPlay={onPlay}
          onWishlist={onWishlist}
          isWishlisted={isWishlisted ? isWishlisted(movie.id) : false}
          showWishlist={showWishlist}
        />
      ))}
    </div>
  );
};
