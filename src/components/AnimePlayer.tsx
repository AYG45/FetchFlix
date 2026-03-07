import { useEffect, useState } from 'react';
import '../player.css';
import { getTMDBIdFromMAL, searchTMDBByTitle } from '../api';

interface AnimePlayerProps {
  tmdbId: number; // Actually MAL ID
  title: string;
  onClose: () => void;
}

const EMBED_SOURCES = [
  { name: 'VsEmbed', url: (tmdb: number, s: number, e: number) => `https://vsembed.ru/embed/tv/${tmdb}/${s}/${e}` },
  { name: 'VsEmbed Alt', url: (tmdb: number, s: number, e: number) => `https://vsembed.su/embed/tv/${tmdb}/${s}/${e}` },
  { name: 'VidSrc CC', url: (tmdb: number, s: number, e: number) => `https://vidsrc.cc/v2/embed/tv/${tmdb}/${s}/${e}` },
  { name: 'Embed.su', url: (tmdb: number, s: number, e: number) => `https://embed.su/embed/tv/${tmdb}/${s}/${e}` },
  { name: '2Embed', url: (tmdb: number, s: number, e: number) => `https://www.2embed.cc/embedtv/${tmdb}&s=${s}&e=${e}` },
];

export const AnimePlayer = ({ tmdbId: malId, title, onClose }: AnimePlayerProps) => {
  const [episodes, setEpisodes] = useState<any[]>([]);
  const [seasons, setSeasons] = useState<any[]>([]);
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [selectedEpisode, setSelectedEpisode] = useState('');
  const [streamUrl, setStreamUrl] = useState('');
  const [selectedSource, setSelectedSource] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tmdbId, setTmdbId] = useState<number | null>(null);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    initializePlayer();
    return () => { document.body.style.overflow = 'unset'; };
  }, [malId]);

  const initializePlayer = async () => {
    setLoading(true);
    
    // Get TMDB ID
    let tmdbIdResult = await getTMDBIdFromMAL(malId);
    if (!tmdbIdResult) {
      await new Promise(resolve => setTimeout(resolve, 500));
      tmdbIdResult = await searchTMDBByTitle(title);
    }
    
    setTmdbId(tmdbIdResult);
    await fetchAnimeData(tmdbIdResult);
  };

  const fetchAnimeData = async (tmdbIdValue: number | null) => {
    try {
      const response = await fetch(`https://api.jikan.moe/v4/anime/${malId}/full`);
      const { data: anime } = await response.json();
      
      const seasonsData = [{
        season_number: 1,
        episode_count: anime.episodes || 24,
        name: anime.title,
        mal_id: malId
      }];
      
      // Find sequels
      if (anime.relations) {
        const sequels = anime.relations
          .filter((rel: any) => rel.relation === 'Sequel')
          .flatMap((rel: any) => rel.entry)
          .filter((entry: any) => entry.type === 'anime');
        
        for (const [index, sequel] of sequels.entries()) {
          await new Promise(resolve => setTimeout(resolve, 1000));
          try {
            const res = await fetch(`https://api.jikan.moe/v4/anime/${sequel.mal_id}`);
            const { data } = await res.json();
            seasonsData.push({
              season_number: index + 2,
              episode_count: data.episodes || 12,
              name: data.title,
              mal_id: sequel.mal_id
            });
          } catch {}
        }
      }
      
      setSeasons(seasonsData);
      loadEpisodes(1, seasonsData[0].episode_count, tmdbIdValue);
    } catch {
      setError('Failed to load anime.');
      setLoading(false);
    }
  };

  const loadEpisodes = (seasonNum: number, count: number, tmdbIdValue: number | null) => {
    const episodeList = Array.from({ length: count }, (_, i) => ({
      id: `${malId}-${seasonNum}-${i + 1}`,
      number: i + 1,
      season: seasonNum,
    }));
    
    setEpisodes(episodeList);
    setSelectedEpisode(episodeList[0].id);
    loadStream(seasonNum, 1, tmdbIdValue);
  };

  const loadStream = (season: number, episode: number, tmdbIdValue: number | null) => {
    if (!tmdbIdValue) {
      setError('This anime is not available. Try popular anime like "Demon Slayer" or "Attack on Titan".');
      setLoading(false);
      return;
    }
    
    setStreamUrl(EMBED_SOURCES[selectedSource].url(tmdbIdValue, season, episode));
    setLoading(false);
  };

  const handleSeasonChange = (seasonNum: number) => {
    setSelectedSeason(seasonNum);
    const season = seasons.find(s => s.season_number === seasonNum);
    if (season && tmdbId) loadEpisodes(seasonNum, season.episode_count, tmdbId);
  };

  const handleSourceChange = (index: number) => {
    setSelectedSource(index);
    if (tmdbId) {
      const parts = selectedEpisode.split('-');
      setStreamUrl(EMBED_SOURCES[index].url(tmdbId, parseInt(parts[1]), parseInt(parts[2])));
    }
  };

  const handleEpisodeChange = (episodeId: string) => {
    setSelectedEpisode(episodeId);
    const [, season, episode] = episodeId.split('-').map(Number);
    if (tmdbId) loadStream(season, episode, tmdbId);
  };

  return (
    <div className="video-modal" onClick={onClose}>
      <div className="video-modal-content anime-player" onClick={(e) => e.stopPropagation()}>
        <div className="video-header">
          <h2>{title}</h2>
          <div className="header-controls">
            {seasons.length > 1 && (
              <div className="season-selector">
                <label>Season:</label>
                <select value={selectedSeason} onChange={(e) => handleSeasonChange(Number(e.target.value))}>
                  {seasons.map((s) => (
                    <option key={s.season_number} value={s.season_number}>Season {s.season_number}</option>
                  ))}
                </select>
              </div>
            )}
            <div className="season-selector">
              <label>Source:</label>
              <select value={selectedSource} onChange={(e) => handleSourceChange(Number(e.target.value))}>
                {EMBED_SOURCES.map((source, i) => (
                  <option key={i} value={i}>{source.name}</option>
                ))}
              </select>
            </div>
          </div>
          <button className="close-button" onClick={onClose}>✕</button>
        </div>
        
        <div className="player-container">
          {episodes.length > 0 && (
            <div className="episodes-sidebar">
              <h3>Episodes ({episodes.length})</h3>
              <div className="episodes-list">
                {episodes.map((ep) => (
                  <button
                    key={ep.id}
                    className={`episode-btn ${selectedEpisode === ep.id ? 'active' : ''}`}
                    onClick={() => handleEpisodeChange(ep.id)}
                  >
                    EP {ep.number}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="video-container">
            {loading ? (
              <div className="player-loading">Loading...</div>
            ) : error ? (
              <div className="player-error">{error}</div>
            ) : streamUrl ? (
              <div className="video-wrapper">
                <iframe
                  src={streamUrl}
                  className="anime-video"
                  allowFullScreen
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                  referrerPolicy="origin"
                  sandbox="allow-scripts allow-same-origin allow-presentation"
                />
              </div>
            ) : (
              <div className="player-error">Unable to load video</div>
            )}
          </div>
        </div>

        <div className="video-info">
          <p>Powered by embed players • Multiple sources available</p>
        </div>
      </div>
    </div>
  );
};
