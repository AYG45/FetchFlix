const JIKAN_API = 'https://api.jikan.moe/v4';
const CORS_PROXY = 'https://corsproxy.io/?';

// Transform Jikan anime data to our format
const transformAnime = (anime: any) => ({
  id: anime.mal_id,
  title: anime.title,
  poster_path: anime.images.jpg.large_image_url,
  overview: anime.synopsis,
  release_date: anime.aired?.from,
  vote_average: anime.score,
});

export const fetchPopularAnime = async () => {
  const response = await fetch(`${JIKAN_API}/top/anime?filter=airing&limit=20`);
  if (!response.ok) throw new Error('Failed to fetch anime');
  const data = await response.json();
  return { results: data.data.map(transformAnime) };
};

export const fetchTrendingAnime = async () => {
  const response = await fetch(`${JIKAN_API}/top/anime?filter=bypopularity&limit=20`);
  if (!response.ok) throw new Error('Failed to fetch anime');
  const data = await response.json();
  return { results: data.data.map(transformAnime) };
};

export const searchAnime = async (query: string) => {
  const response = await fetch(`${JIKAN_API}/anime?q=${encodeURIComponent(query)}&limit=20&order_by=popularity`);
  if (!response.ok) throw new Error('Failed to search anime');
  const data = await response.json();
  return { results: data.data.map(transformAnime) };
};

export const getTMDBIdFromMAL = async (malId: number): Promise<number | null> => {
  try {
    const response = await fetch(`${JIKAN_API}/anime/${malId}/external`);
    if (!response.ok) return null;
    
    const data = await response.json();
    const tmdbLink = data.data?.find((link: any) => link.name === 'TheMovieDB');
    
    if (tmdbLink?.url) {
      const match = tmdbLink.url.match(/\/tv\/(\d+)/);
      if (match) return parseInt(match[1]);
    }
    return null;
  } catch {
    return null;
  }
};

export const searchTMDBByTitle = async (title: string): Promise<number | null> => {
  try {
    const response = await fetch(`/api/proxy?query=${encodeURIComponent(title)}`);
    
    if (!response.ok) return null;
    
    const data = await response.json();
    if (data.results?.length > 0) {
      const animeResult = data.results.find((r: any) => 
        r.genre_ids?.includes(16) && r.original_language === 'ja'
      );
      return animeResult?.id || data.results[0].id;
    }
    
    // Try simplified title
    const simplified = title.split(':')[0].split('-')[0].replace(/[^\w\s]/g, '').trim();
    if (simplified !== title) {
      const response2 = await fetch(`/api/proxy?query=${encodeURIComponent(simplified)}`);
      
      if (response2.ok) {
        const data2 = await response2.json();
        if (data2.results?.length > 0) {
          const animeResult = data2.results.find((r: any) => 
            r.genre_ids?.includes(16) && r.original_language === 'ja'
          );
          return animeResult?.id || data2.results[0].id;
        }
      }
    }
    
    return null;
  } catch {
    return null;
  }
};
