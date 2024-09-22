import React from "react";
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, InputGroup, FormControl, Button, Row, Card } from 'react-bootstrap';
import { useState, useEffect } from "react";

const CLIENT_ID = "a68cc005665b405195de169076b6cc54";
const CLIENT_SECRET = "06f9da1c92a04ca4aab566bc9e1e3a07";

const App = () =>{
  const [searchInput, setSearchInput ] = useState("");
  const [accessToken, setAccessToken ] = useState("");
  const [ tracks, setTracks ] = useState([]);
  const [ trackInfo, setTrackInfo ] = useState([]);

  useEffect(() => {
    // API Access Token

    var authParameters = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: 'grant_type=client_credentials&client_id=' + CLIENT_ID + '&client_secret=' + CLIENT_SECRET 
    }

    fetch('https://accounts.spotify.com/api/token', authParameters)
      .then(result => result.json())
      .then(data => setAccessToken(data.access_token));
  }, [])

  var searchParameters = {
    method: 'GET',
    headers: {
      'Authorization': 'Bearer ' + accessToken
    }
  }

  // Search 
  async function search(){
    var dataArray = [];

    // Get request using search to get the Song ID
    var search = await fetch('https://api.spotify.com/v1/search?q=' + searchInput + '&type=track', searchParameters)
    .then(response => response.json())
    .then(data => setTracks(data.tracks.items));

    var idString = '';
    {tracks.map((track, i) => {
      idString = idString + track.id + ',';
    })}

    var trackRequest = fetch("https://api.spotify.com/v1/audio-features/?ids=" + idString, searchParameters)
     .then(response => response.json())
     .then(data => setTrackInfo(data.audio_features))
  }

   async function getKey(song){
    var scaleString = '';

    if (song.key === -1) {
      scaleString = 'No Key Detected';
    } else {
      const keys = ['C', 'C#/D♭', 'D', 'D#/E♭', 'E', 'F', 'F#/G♭', 'G', 'G#/A♭', 'A', 'A#/B♭', 'B'];
      scaleString = keys[song.key];
        if( song.mode==1 ){
          scaleString = scaleString + ' Major';
        }
        else if ( song.mode==0 ){
          scaleString = scaleString + ' Minor';
        }
    }
    console.log(scaleString)
    // return(scaleString)
  }

  return(
    <div className="Test">
      <Container>
        <InputGroup className="mb-3" size="lg">
          <FormControl
            placeholder="search for song to get its data"
            type="input"
            onKeyPress={event => {
              if(event.key == "Enter"){
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
            var key = 'Loading...'
            return (
            <Card onClick={event => key = getKey(trackInfo[i])}>
              <Card.Img src={track.album.images[0].url}/>
              <Card.Body>
                <Card.Title>{track.name}</Card.Title>
                <Card.Text>{track.artists[0].name} the key of the song is: {key}</Card.Text>
              </Card.Body>
            </Card>
            )
          })}

        </Row>
      </Container>
    </div>
  )
}

export default App;