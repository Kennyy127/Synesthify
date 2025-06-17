const client_id = process.env.REACT_APP_SPOTIFY_CLIENT_ID;
const redirect_uri = process.env.REACT_APP_SPOTIFY_REDIRECT_URI;

const scopes = [
  "user-read-private",
  "user-read-email",
  "user-read-playback-state",
  "user-modify-playback-state",
];

export const getSpotifyAuthURL = () => {
  return (
    "https://accounts.spotify.com/authorize?" +
    new URLSearchParams({
      client_id,
      response_type: "token",  // ✅ THIS MUST BE 'token'
      redirect_uri,
      scope: scopes.join(" "),
      show_dialog: "true",
    }).toString()
  );
};
