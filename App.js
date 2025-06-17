import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function App() {
  const [token, setToken] = useState("");
  const [query, setQuery] = useState("");
  const [track, setTrack] = useState(null);
  const [features, setFeatures] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [recFeatures, setRecFeatures] = useState([]);
  const [deviceId, setDeviceId] = useState(null);
  const [player, setPlayer] = useState(null);

  useEffect(() => {
    setToken("INSERT YOU TOKEN HERE");

    window.onSpotifyWebPlaybackSDKReady = () => {
      const _player = new window.Spotify.Player({
        name: "Synesthify Player",
        getOAuthToken: cb => cb(token),
        volume: 0.5,
      });

      _player.addListener("ready", ({ device_id }) => {
        console.log("Player ready with device ID", device_id);
        setDeviceId(device_id);
      });

      _player.connect();
      setPlayer(_player);
    };

    const script = document.createElement("script");
    script.src = "https://sdk.scdn.co/spotify-player.js";
    script.async = true;
    document.body.appendChild(script);
  }, [token]);

  const safeJson = async (res) => {
    if (!res.ok) {
      const text = await res.text();
      console.error("Fetch error:", res.status, res.statusText, text);
      return null;
    }
    try {
      return await res.json();
    } catch (err) {
      console.error("Failed to parse JSON:", err);
      return null;
    }
  };

  const handleSearch = async () => {
    setTrack(null);
    setFeatures(null);
    setRecommendations([]);
    setRecFeatures([]);

    const searchRes = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=1`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const searchData = await safeJson(searchRes);
    if (!searchData?.tracks?.items?.length) {
      alert("No track found.");
      return;
    }

    const selected = searchData.tracks.items[0];
    setTrack(selected);

    const fRes = await fetch(`https://api.spotify.com/v1/audio-features/${selected.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const fData = await safeJson(fRes);
    if (fData) setFeatures(fData);
    console.log("Audio features:", fData);

    const recRes = await fetch(
      `https://api.spotify.com/v1/recommendations?seed_tracks=${selected.id}&limit=5`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    const recData = await safeJson(recRes);
    if (!recData?.tracks?.length) return;

    const filtered = recData.tracks.filter((t) => t.id !== selected.id).slice(0, 3);
    setRecommendations(filtered);

    const feats = await Promise.all(
      filtered.map(async (rec) => {
        const r = await fetch(`https://api.spotify.com/v1/audio-features/${rec.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        return await safeJson(r);
      })
    );

    setRecFeatures(feats.filter(Boolean));
  };

  const handlePlay = (uri) => {
    if (!deviceId) {
      alert("Web Playback SDK not ready");
      return;
    }

    fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ uris: [uri] }),
    });
  };

  const renderChart = (title, f) => {
    const tempoNormalized = f.tempo ? f.tempo / 250 : 0;
    return (
      <div style={{ maxWidth: 500, marginTop: "1rem" }}>
        <h4 style={{ fontWeight: "bold" }}>{title}</h4>
        <Bar
          data={{
            labels: ["Valence", "Energy", "Danceability", "Tempo (scaled)"],
            datasets: [{
              label: "Mood Traits",
              backgroundColor: ["#6a5acd", "#ff7f50", "#20b2aa", "#f0c420"],
              data: [f.valence, f.energy, f.danceability, tempoNormalized],
            }],
          }}
          options={{
            responsive: true,
            scales: {
              y: {
                min: 0,
                max: 1,
                title: {
                  display: true,
                  text: "Normalized Scale (0–1)"
                }
              }
            }
          }}
        />
      </div>
    );
  };

  return (
    <div style={{
      fontFamily: "'Inter', sans-serif",
      backgroundColor: "#f9f9f9",
      minHeight: "100vh",
      padding: "2rem",
      maxWidth: "800px",
      margin: "0 auto",
      color: "#222"
    }}>
      <h1>Synesthify</h1>
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "2rem" }}>
        <input
          placeholder='What do you want to find?'
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{
            flex: 1,
            padding: "0.75rem 1rem",
            fontSize: "1rem",
            border: "1px solid #ccc",
            borderRadius: "6px",
            outline: "none"
          }}
        />
        <button
          onClick={handleSearch}
          disabled={!token || !query}
          style={{
            backgroundColor: "#1DB954",
            color: "white",
            border: "none",
            padding: "0.75rem 1.2rem",
            borderRadius: "6px",
            fontWeight: "bold",
            cursor: "pointer"
          }}
        >
          Search
        </button>
      </div>

      {track && (
        <div style={{
          background: "#fff",
          borderRadius: "10px",
          padding: "1.5rem",
          boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
          marginBottom: "2rem"
        }}>
          <h2>🎵 Your Song</h2>
          <p style={{ fontSize: "1.1rem" }}>
            <strong>{track.name}</strong> by {track.artists[0].name}
          </p>
          <button
            onClick={() => handlePlay(track.uri)}
            style={{
              marginTop: "0.75rem",
              padding: "0.5rem 1rem",
              border: "none",
              background: "#1DB954",
              color: "white",
              fontWeight: "bold",
              borderRadius: "6px",
              cursor: "pointer"
            }}
          >
            ▶ Play with SDK
          </button>
          {features && renderChart("Your Song Mood", features)}
        </div>
      )}

      {recommendations.length > 0 && (
        <div style={{ marginTop: "3rem" }}>
          <h2>🎯 Recommendations</h2>
          {recommendations.map((rec, i) => (
            <div key={rec.id} style={{ marginBottom: "2rem" }}>
              <p><strong>{rec.name}</strong> by {rec.artists[0].name}</p>
              <button
                onClick={() => handlePlay(rec.uri)}
                style={{
                  marginTop: "0.5rem",
                  padding: "0.5rem 1rem",
                  border: "none",
                  background: "#1DB954",
                  color: "white",
                  fontWeight: "bold",
                  borderRadius: "6px",
                  cursor: "pointer"
                }}
              >
                ▶ Play
              </button>
              {recFeatures[i] && renderChart("Mood", recFeatures[i])}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;