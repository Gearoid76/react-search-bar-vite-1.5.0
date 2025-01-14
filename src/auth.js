import axios from 'axios';

const client_secret = import.meta.env.VITE_CLIENT_SECRET;
const client_id = import.meta.env.VITE_CLIENT_ID;
const authEndpoint = 'https://accounts.spotify.com/api/token';
const tokenEndPoint = 'https://accounts.spotify.com/api/token';
const code = new URLSearchParams(window.location.search).get('code');
localStorage.setItem('auth_code', code);

let accessToken = sessionStorage.getItem('AccessToken');

export async function redirectToAuthCodeFlow(clientId) {
    const verifier = generateCodeVerifier(128);
    const challenge = await generateCodeChallenge(verifier);

    localStorage.setItem('verifier', verifier);
    const redirectUri = import.meta.env.VITE_REDIRECT_URI;

    const params = new URLSearchParams();
    params.append('client_id', clientId);
    params.append('response_type', 'code');
    params.append('redirect_uri', redirectUri);
    params.append('scope', 'user-read-private user-read-email playlist-read-private playlist-read-collaborative playlist-modify-public playlist-modify-private user-library-modify');
    params.append('code_challenge_method', 'S256');
    params.append('code_challenge', challenge);

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

// Fetch the access token
export async function getAccessToken() {
    const auth_code = localStorage.getItem('auth_code');
    const redirectUri = import.meta.env.VITE_REDIRECT_URI;
    const verifier = localStorage.getItem('verifier');

    if (!auth_code) {
        console.error('Authorization code is missing.');
        return null;
    }

    if (accessToken) {
        console.log('Using cached access token:', accessToken);
        return accessToken;
    }

    const params = new URLSearchParams();
    params.append('client_id', client_id);
    params.append('client_secret', client_secret);
    params.append('grant_type', 'authorization_code');
    params.append('code', auth_code);
    params.append('redirect_uri', redirectUri);
    params.append('code_verifier', verifier);

    try {
        const response = await axios.post(tokenEndPoint, params.toString(), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });

        accessToken = response.data.access_token;
        const refreshToken = response.data.refresh_token;

        sessionStorage.setItem('AccessToken', accessToken);
        localStorage.setItem('RefreshToken', refreshToken);

        console.log('Access token set:', accessToken);
        return accessToken;
    } catch (error) {
        console.error('Error fetching access token:', error.response?.data || error.message);
        return null;
    }
}

// Refresh the access token
export async function refreshAccessToken() {
    const refreshToken = localStorage.getItem('RefreshToken');

    if (!refreshToken) {
        console.error('Refresh token is missing.');
        return null;
    }

    const params = new URLSearchParams();
    params.append('grant_type', 'refresh_token');
    params.append('refresh_token', refreshToken);
    params.append('client_id', client_id);
    params.append('client_secret', client_secret);

    try {
        const response = await axios.post(tokenEndPoint, params.toString(), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });

        accessToken = response.data.access_token;
        sessionStorage.setItem('AccessToken', accessToken);

        console.log('Access token refreshed:', accessToken);
        return accessToken;
    } catch (error) {
        console.error('Error refreshing token:', error.response?.data || error.message);
        return null;
    }
}

