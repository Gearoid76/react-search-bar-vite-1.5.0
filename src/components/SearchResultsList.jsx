import React, { useState, useEffect } from 'react';
import { SearchResult } from './SearchResult';
import { FaMinus } from 'react-icons/fa';
import '../App.css';

export const SearchResultsList = ({ results, onAddToSpotify }) => {
  const [selectedTracks, setSelectedTracks] = useState([]);
  const [playlistName, setPlaylistName] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const [showReminder, setShowReminder] = useState(false); 

  const handleAddTrack = (track) => {
    setSelectedTracks((prevTracks) => [...prevTracks, track]);
  };

  const handleRemoveTrack = (track) => {
    setSelectedTracks((prevTracks) => prevTracks.filter(t => t.id !== track.id));
  };

  const handlePushToSpotify = () => {
    if (!playlistName.trim()) {
      setShowReminder(true);
      return;
    }

    if (selectedTracks.length > 0) {
      onAddToSpotify(selectedTracks, playlistName)
        .then(() => {
          setSelectedTracks([]); 
          setPlaylistName(''); 
        })
        .catch((error) => {
          console.error('Error pushing to Spotify:', error);
        });
    } setShowPopup(true); 
  };

  useEffect(() => {
    if (showPopup) {
      const timer = setTimeout(() => setShowPopup(false), 7000); 
      return () => clearTimeout(timer);
    }
  }, [showPopup]);

  useEffect(() => {
    if (showReminder) {
      const timer = setTimeout(() => setShowReminder(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [showReminder]);

  useEffect(() => {
    if (playlistName.trim()) {
      //setShowReminder(false);
    }
  }, [playlistName]);

  return (
    <div className='results-list'>
      {results.map((result, id) => (
        <SearchResult
          key={id}
          result={result}
          onAddTrack={() => handleAddTrack(result)}
          onRemoveTrack={() => handleRemoveTrack(result)}
          isSelected={selectedTracks.some(track => track.id === result.id)}
        />
      ))}

      {/* Playlist management UI */}
      {selectedTracks.length > 0 && (
        <div className="playlist-container">
          <input
            type="text"
            value={playlistName}
            onChange={(e) => setPlaylistName(e.target.value)}
            placeholder="Enter playlist name"
          />
          {showReminder && <p className="reminder">Please enter a playlist name.</p>}
          
          <div className="playlist-tracks">
            {selectedTracks.map(track => (
              <div key={track.id} className="playlist-track">
                <div className='artistNameAndAlbum'>
                  <h3>{track.name}</h3>
                  <p>{track.artist} - {track.album}</p>
                </div>
                <FaMinus className='minus-icon' onClick={() => handleRemoveTrack(track)} />
              </div>
            ))}
          </div>
          <button className="pushToSpotifyButton" onClick={handlePushToSpotify}>
            Push to Spotify
          </button>

          {showPopup && (
            <div className="popup-notification">
              Playlist has been pushed to Spotify
            </div>
          )}
        </div>
      )}
    </div>
  );
};
