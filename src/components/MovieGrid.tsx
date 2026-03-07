import type { Movie } from '../types';
import { MovieCard } from './MovieCard';

interface MovieGridProps {
  movies: Movie[];
  loading: boolean;
  onPlay: (movie: Movie) => void;
}

export const MovieGrid = ({ movies, loading, onPlay }: MovieGridProps) => {
  if (loading) return <div className="loading">Loading anime...</div>;
  if (movies.length === 0) return <div className="no-results">No anime found.</div>;

  return (
    <div className="movie-grid">
      {movies.map((movie) => (
        <MovieCard key={movie.id} movie={movie} onPlay={onPlay} />
      ))}
    </div>
  );
};
