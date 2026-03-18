import type { Movie } from '../types';

const WISHLIST_KEY = 'fetchflix_wishlist';

export const getWishlist = (userEmail: string): Movie[] => {
  try {
    const wishlistData = localStorage.getItem(`${WISHLIST_KEY}_${userEmail}`);
    return wishlistData ? JSON.parse(wishlistData) : [];
  } catch {
    return [];
  }
};

export const addToWishlist = (userEmail: string, movie: Movie): void => {
  try {
    const wishlist = getWishlist(userEmail);
    const exists = wishlist.find(item => item.id === movie.id);
    
    if (!exists) {
      const updatedWishlist = [movie, ...wishlist];
      localStorage.setItem(`${WISHLIST_KEY}_${userEmail}`, JSON.stringify(updatedWishlist));
    }
  } catch (error) {
    console.error('Error adding to wishlist:', error);
  }
};

export const removeFromWishlist = (userEmail: string, movieId: number): void => {
  try {
    const wishlist = getWishlist(userEmail);
    const updatedWishlist = wishlist.filter(item => item.id !== movieId);
    localStorage.setItem(`${WISHLIST_KEY}_${userEmail}`, JSON.stringify(updatedWishlist));
  } catch (error) {
    console.error('Error removing from wishlist:', error);
  }
};

export const isInWishlist = (userEmail: string, movieId: number): boolean => {
  try {
    const wishlist = getWishlist(userEmail);
    return wishlist.some(item => item.id === movieId);
  } catch {
    return false;
  }
};