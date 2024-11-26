//src/auth.js
import axios from 'axios'

const client_secret = import.meta.env.VITE_CLIENT_SECRET;
const client_id = import.meta.env.VITE_CLIENT_ID;
const authEndpoint = 'https://accounts.spotify.com/api/token';
const code = new URLSearchParams(window.location.search).get('code');
localStorage.setItem('auth_code', code);

export async function redirectToAuthCodeFlow(clientId) {
    const verifier = generateCodeVerifier(128);
    const challenge = await generateCodeChallenge(verifier);

    localStorage.setItem("verifier", verifier);                        
    const redirectUri = import.meta.env.VITE_REDIRECT_URI;
    console.log("redirect_uri", redirectUri);

    const params = new URLSearchParams();
    params.append("client_id", clientId);
    params.append("response_type", "code");
    params.append("redirect_uri", redirectUri); 
    params.append("scope", "user-read-private user-read-email playlist-read-private playlist-read-collaborative playlist-modify-public playlist-modify-private user-library-modify");
    params.append("code_challenge_method", "S256");
    params.append("code_challenge", challenge);

    document.location = `https://accounts.spotify.com/authorize?${params.toString()}`;
}

export function generateCodeVerifier(length) {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (let i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

export async function generateCodeChallenge(codeVerifier) {
    const data = new TextEncoder().encode(codeVerifier);
    const digest = await window.crypto.subtle.digest('SHA-256', data);
    return btoa(String.fromCharCode.apply(null, [...new Uint8Array(digest)]))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
}

export async function getAccessToken() {
    const clientId = client_id;
    const clientSecret = client_secret;
    const auth_code = localStorage.getItem('auth_code');
    const redirectUri = import.meta.env.VITE_REDIRECT_URI
    const verifier = localStorage.getItem("verifier");
     
    const params = new URLSearchParams();  
    params.append("client_id", clientId);
    params.append("client_secret",clientSecret);
    params.append("grant_type", "authorization_code");
    params.append("code", auth_code);                           
    params.append("redirect_uri", redirectUri);
    params.append("code_verifier", verifier);

    try {
        const response = await axios.post(authEndpoint, params.toString(), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            }
        });

        console.log("AccessToken", response.data.access_token);
        sessionStorage.setItem('AccessToken', response.data.access_token);
        return response.data.access_token;

        } catch (error) {
            console.error('Error fetching token:', error.response ? error.response.data : error.message);
        }
    }