// src/components/SearchResult.jsx
import React from 'react';
import { FaPlus, FaMinus } from 'react-icons/fa';
import '../App.css';

export const SearchResult = ({ result, onAddTrack, onRemoveTrack, isSelected }) => {
  return (
    <div className='search-result'>
      <img src={result.imageUrl} alt={result.name} style={{ width: '50px', height: '50px' }} />
      <div className="artistNameAndAlbum">
        <h3>{result.name}</h3>
        <p>{result.artist} - {result.album}</p> 
      </div>
      <div className="track-icon" onClick={isSelected ? onRemoveTrack : onAddTrack}>
        {isSelected ? <FaMinus className='minus-icon' /> : <FaPlus className='add-icon' />}
      </div>
    </div>
  );
};
