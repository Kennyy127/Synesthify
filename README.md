# Synesthify

Synesthify is a mood-based music recommendation web app that analyzes the mood of a selected song based on its audio features (like valence, energy, danceability) and recommends similar tracks. The app allows song search, mood visualization, and Spotify playback support.

Features:
- Search for any song by title or Spotify URL
- Visualize song mood traits like valence, energy, and danceability
- Play preview directly via Spotify Web Playback SDK
- Get Recommendations based on audio feature similarity

Getting Started
To use this app, you'll need to set up your own Spotify credentials and environment variables. Here's how:
1. Clone the Repository
git clone https://github.com/Kenny127/synesthify.git
cd synesthify

2. Create a .env File
Create a .env file in the root of your project directory:
touch .env

Then add your Spotify credentials in the following format:
REACT_APP_SPOTIFY_CLIENT_ID=your_spotify_client_id
REACT_APP_SPOTIFY_REDIRECT_URI=http://localhost:3000/callback
REACT_APP_SPOTIFY_SCOPES=user-read-private user-read-email streaming user-read-playback-state user-modify-playback-state

⚠️ Note: Replace http://localhost:3000/callback with your actual redirect URI from the Spotify Developer Dashboard. This URI must match the one registered on your Spotify app settings.

Where to Get Spotify Credentials:
- Go to the Spotify Developer Dashboard
- Log in and create a new application
- Copy the Client ID
- Add a Redirect URI (e.g., http://localhost:3000/callback)
- Use this Client ID and Redirect URI in your .env file as shown above

Running the App
Install dependencies and start the development server:
npm install
npm start

This will launch the app on http://localhost:3000.

Known Limitations:
Token expires after 1 hour; refresh token logic is not implemented
Web Playback requires a premium Spotify account
Mood visualization might not work if the track lacks certain audio features

