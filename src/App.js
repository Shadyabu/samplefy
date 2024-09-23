import React from "react";
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, InputGroup, FormControl, Button, Row, Card } from 'react-bootstrap';
import { useState, useEffect } from "react";

const CLIENT_ID = "a68cc005665b405195de169076b6cc54";
const CLIENT_SECRET = "06f9da1c92a04ca4aab566bc9e1e3a07";


const App = () => {
  const [searchInput, setSearchInput] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [tracks, setTracks] = useState([]);
  const [trackInfo, setTrackInfo] = useState([]);

  useEffect(() => {
    const authParameters = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: 'grant_type=client_credentials&client_id=' + CLIENT_ID + '&client_secret=' + CLIENT_SECRET 
    };
    fetch('https://accounts.spotify.com/api/token', authParameters)
      .then(result => result.json())
      .then(data => setAccessToken(data.access_token));
  }, []);

  const searchParameters = {
    method: 'GET',
    headers: {
      'Authorization': 'Bearer ' + accessToken
    }
  };

  const getKey = (song) => {
    let scaleString = '';

    if (song.key === -1) {
      scaleString = 'No Key Detected';
    } else {
      const keys = ['C', 'C#/D♭', 'D', 'D#/E♭', 'E', 'F', 'F#/G♭', 'G', 'G#/A♭', 'A', 'A#/B♭', 'B'];
      scaleString = keys[song.key];
      scaleString += song.mode === 1 ? ' Major' : ' Minor';
    }

    return scaleString;
  };

  const search = async () => {
    const searchResult = await fetch('https://api.spotify.com/v1/search?q=' + searchInput + '&type=track', searchParameters)
      .then(response => response.json())
      .then(data => data.tracks.items);

    setTracks(searchResult);

    const idString = searchResult.map(track => track.id).join(',');
    const trackRequest = await fetch("https://api.spotify.com/v1/audio-features/?ids=" + idString, searchParameters)
      .then(response => response.json())
      .then(data => data.audio_features);

    setTrackInfo(trackRequest);
  };

  return (
    <div className="Test">
      <Container>
        <InputGroup className="mb-3" size="lg">
          <FormControl
            placeholder="search for song to get its data"
            type="input"
            onKeyPress={event => {
              if (event.key === "Enter") {
                search();
              }
            }}
            onChange={event => setSearchInput(event.target.value)}
          />
          <Button onClick={search}>
            Search
          </Button>
        </InputGroup>
      </Container>
      <Container>
        <Row className="mx-2 row row-cols-4">
          {tracks.map((track, i) => {
            const trackFeature = trackInfo.find(info => info.id === track.id);
            const key = trackFeature ? getKey(trackFeature) : 'Loading...';
            const bpm = trackFeature ? Math.round(trackFeature.tempo) : 'Loading...';
            const timeSig = trackFeature ? Math.round(trackFeature.time_signature) : 'Loading...';
            return (
              <Card key={track.id}>
                <Card.Img src={track.album.images[0].url} />
                <Card.Body>
                  <Card.Title>{track.name}</Card.Title>
                  <Card.Text>{track.artists[0].name} - {key},  {bpm}bpm <br/> {timeSig}/4 Time Signature</Card.Text>
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
