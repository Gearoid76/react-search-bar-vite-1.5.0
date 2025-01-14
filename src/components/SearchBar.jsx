import React, { useState, useEffect } from 'react';
import { getAccessToken, redirectToAuthCodeFlow } from '../auth';
import { FaSearch } from 'react-icons/fa';
import '../App.css';
export const SearchBar = ({ setResults }) => {
  const [input, setInput] = useState("");
  const [accessToken, setAccessToken] = useState(null);

  useEffect(() => {
    console.log('Input at value:', input);
      const fetchToken = async () => {
        const client_id = import.meta.env.VITE_CLIENT_ID;
          let token = await getAccessToken();
          if (!token) {
              console.error('Token retrieval failed. Redirecting to login.');
              await redirectToAuthCodeFlow(client_id); // Redirect to reauthorize if token fails
          } else {
              setAccessToken(token);
          }
      };
  
      fetchToken();
  }, []);
  
  const fetchData = async (value) => {
    console.log("Fetching data for:", value); 
    if (!accessToken) {
      console.error("No access token available");
      return;
    }
   
    const query = encodeURIComponent(value);
    fetch(`https://api.spotify.com/v1/search?q=${query}&type=track&limit=10`, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("spotify API response", data);
        if (data.tracks) {
          const results = data.tracks.items.map((track) => ({
            id: track.id,
            name: track.name,
            artist: track.artists[0].name,
            album: track.album.name,
            imageUrl: track.album.images[0]?.url,
            externalUrl: track.external_urls.spotify,
            spotifyUri: track.uri
          }));
          setResults(results);
        }
      })
      .catch((error) => console.error("Error fetching data from Spotify:", error));
  };

  const handleChange = (value) => {
    console.log('input changed:', value);
    setInput(value);
    if (value && accessToken) { 
      fetchData(value);
    } else {
      setResults([]);
    }
  };

  return (
    <div className='input-wrapper'>
      <input
        placeholder='Type to search..'
        value={input}
        onChange={(e) => handleChange(e.target.value)}
        disabled={!accessToken} // Disable input if no access token is available
      />
      <FaSearch id="search-icon" />
    </div>
  );
};