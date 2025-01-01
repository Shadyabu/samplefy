import React from "react";
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, InputGroup, FormControl, Button, Row, Card } from 'react-bootstrap';
import { useState, useEffect } from "react";

const CLIENT_ID = "af6edef54fc4489aada2ed3b6784108e";
const CLIENT_SECRET = "a9af3010609848d4882b72610e4f7af0";

const App = () => {
  const [searchInput, setSearchInput] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [tracks, setTracks] = useState([]);
  const [trackInfo, setTrackInfo] = useState([]);

  useEffect(() => {
    const authParameters = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `grant_type=client_credentials&client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}`,
    };

    fetch('https://accounts.spotify.com/api/token', authParameters)
      .then(result => result.json())
      .then(data => setAccessToken(data.access_token));
  }, []);

  const searchParameters = {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  };

  const getKey = (song) => {
    if (!song) return 'No Key Detected';
    const keys = ['C', 'C#/D♭', 'D', 'D#/E♭', 'E', 'F', 'F#/G♭', 'G', 'G#/A♭', 'A', 'A#/B♭', 'B'];
    const key = keys[song.key] || 'Unknown Key';
    return `${key} ${song.mode === 1 ? 'Major' : 'Minor'}`;
  };

  const search = async () => {
    try {
      const searchResult = await fetch(
        `https://api.spotify.com/v1/search?q=${encodeURIComponent(searchInput)}&type=track`,
        searchParameters
      )
        .then(response => {
          if (!response.ok) {
            throw new Error(`Search API Error: ${response.status}`);
          }
          return response.json();
        })
        .then(data => data.tracks.items);
  
      setTracks(searchResult);
  
      const idString = searchResult.map(track => track.id).join(',');
      const trackRequest = await fetch(
        `https://api.spotify.com/v1/audio-features/?ids=${idString}`,
        searchParameters
      );
  
      if (!trackRequest.ok) {
        const errorText = await trackRequest.text();
        console.error('Audio Features API Error:', errorText);
        throw new Error(`Spotify API returned status ${trackRequest.status}`);
      }
  
      const data = await trackRequest.json();
      setTrackInfo(data.audio_features || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };
  

  return (
    <div className="Test">
      <Container>
        Due to an Update to the Spotify API advanced audio features used in this application are now deprecated (ie. no longer supported by the API) <br/><br/><br/>
        <InputGroup className="mb-3" size="lg">
          <FormControl
            placeholder="Search song to get key, BPM, and time signature"
            type="input"
            onKeyPress={(event) => {
              if (event.key === "Enter") {
                search();
              }
            }}
            onChange={(event) => setSearchInput(event.target.value)}
          />
          <Button onClick={search}>Search</Button>
        </InputGroup>
      </Container>
      <Container>
        <Row className="mx-2 row row-cols-1 row-cols-sm-2 row-cols-md-4">
          {tracks.map((track) => {
            const trackFeature = trackInfo?.find((info) => info?.id === track.id);
            const key = trackFeature ? getKey(trackFeature) : 'Loading...';
            const bpm = trackFeature ? Math.round(trackFeature.tempo) : 'Loading...';
            const timeSig = trackFeature ? Math.round(trackFeature.time_signature) : 'Loading...';

            return (
              <Card key={track.id}>
                <Card.Img src={track.album.images[0].url} />
                <Card.Body>
                  <Card.Title>{track.name}</Card.Title>
                  <Card.Text>
                    {track.artists[0].name} - {key}, {bpm} BPM <br /> {timeSig}/4 Time Signature
                  </Card.Text>
                </Card.Body>
              </Card>
            );
          })}
        </Row>
      </Container>
    </div>
  );
};

export default App;
