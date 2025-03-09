exports.handler = async (event) => {
    const { playlistId, uris, accessToken } = JSON.parse(event.body);
    const tracks = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
        method: 'POST',
        headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        },
        body: JSON.stringify({
        uris: uris,
        }),
    })
        .then(response => response.json())
        .then(() => {
        return Promise.resolve();
        });
    return {
        statusCode: 200,
        body: JSON.stringify(tracks),
    };
    }