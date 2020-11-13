/* eslint-disable no-template-curly-in-string */
'use strict';

// require 3rd party dependencies (npm === 3rd part)
const express = require('express');
const pg = require('pg');
const superagent = require('superagent');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

// setup "app" constants (constants for my server file)
const app = express();
const PORT = process.env.PORT || 3000;
const GEOCODE_API_KEY = process.env.GEOCODE_API_KEY;
const WEATHER_API_KEY = process.env.WEATHER_API_KEY;
const TRAILS_API_KEY = process.env.TRAILS_API_KEY;
const MOVIES_API_KEY = process.env.MOVIES_API_KEY;
const YELP_API_KEY = process.env.YELP_API_KEY;
const client = new pg.Client(process.env.DATABASE_URL);

app.get('/add', (req, res) => {
  let citySelected = req.query.city;
  let SQL = 'SELECT * FROM locationTwo WHERE search_query=$1';
  let values = [citySelected];

  client.query(SQL, values)
    .then( results => {
      if (results.rowCount){
        res.status(201).json(results.rows[0])
      } else {
        let citySelected = req.query.city;
        let url = `http://us1.locationiq.com/v1/search.php?key=${GEOCODE_API_KEY}&q=${citySelected}&format=json&limit=1`;
        let locations = {};
        superagent.get(url)
          .then(data => {
            const geoData =data.body[0];
            const location = new Location(citySelected, geoData);
            locations[url] = location;
            let search_query = location.search_query;
            let formatted_query = location.formatted_query;
            let latitude = location.latitude;
            let longitude = location.longitude;
            let SQL = 'INSERT INTO locationTwo(search_query, formatted_query, latitude, longitude) VALUES($1, $2, $3, $4)';
            let values = [search_query, formatted_query, latitude, longitude];
            client.query(SQL, values)
            res.send(location);
          })
      }
    })
    .catch( err => {
      res.status(500).send(err);
    })
})

app.get('/locationTwo', (req, res) => {
  let SQL = 'SELECT * FROM location';
  // does the record exist in the database? If so, .then show up in the table
  client.query(SQL)
    .then(data => {
      res.json(data.rows);
    })
    .catch(err => console.error(err));
})
//
client.connect()
  .then(() => {
    app.listen(PORT, () =>{
    })
  })
  .catch(err => console.log(err));
// open our API for public access
app.use(cors());
app.get('/location', handleLocation);
app.get('/weather', handleWeather);
app.get('/trails', handleTrails);
app.get('/movies', handleMovies);
app.get('/yelp', handleYelp);


// named route handler vs. below in our examples we have unnamed (anonymous) callback functions
function handleLocation(req, res) {
  let city = req.query.city;
  let url = `http://us1.locationiq.com/v1/search.php?key=${GEOCODE_API_KEY}&q=${city}&format=json&limit=1`;
  let locations = {};
  superagent.get(url)
    .then(data => {
      const geoData =data.body[0];
      const location = new Location(city, geoData);
      locations[url] = location;
      res.send(location);
    })
    .catch((error) => {
      console.error('did not work', error);
    })
}

function handleWeather(req, res){
  const queryParams = {
    lat: req.query.latitude,
    lon: req.query.longitude
  }
  const url = `http://api.weatherbit.io/v2.0/forecast/daily?key=${WEATHER_API_KEY}&lat=${queryParams.lat}&lon=${queryParams.lon}`;
  superagent.get(url)
    .then(data => {
      const results = data.body;
      let items = results.data.map(item => {
        return new Weather(item);
      })
      res.send(items);
    })
    .catch(() => {
      console.error('did not work');
    })
}

function handleTrails(req, res) {
  const queryParams = {
    lat: req.query.latitude,
    lon: req.query.longitude
  }
  const url = `https://www.hikingproject.com/data/get-trails?lat=${queryParams.lat}&lon=${queryParams.lon}&key=${TRAILS_API_KEY}`;
  superagent.get(url)
    .then(data => {
      console.log(data.body);
      const results = data.body;
      let items = results.trails.map(item => {
        return new Trails(item);
      })
      res.send(items);
    })
    .catch(() => {
      console.error('did not work');
    })
}

function handleMovies(req, res) {
  let city = req.query.search_query;
  const url = `https://api.themoviedb.org/3/search/movie?api_key=${MOVIES_API_KEY}&query=${city}`;
  superagent.get(url)
    .then(data => {
      const movieList = data.body;
      let items = movieList.results.map(item => {
        return new Movie(item)
      })
      res.send(items).status(200);
    })
    .catch((error) => {
      console.error('did not work', error);
    })
}

function handleYelp(req, res) {
  let city = req.query.search_query;
  const url = `https://api.yelp.com/v3/businesses/search?location=${city}`
  superagent.get(url)
    .set('Authorization', `Bearer ${YELP_API_KEY}`)
    .then(data => {
      const yelpData = data.body;
      let items = yelpData.businesses.map(item => {
        return new Yelp(item)
      })
      res.send(items).status(200);
    })
    .catch((error) => {
      console.error('did not work', error);
    })
}

function Location(city, geoData) {
  this.search_query = city;
  this.formatted_query = geoData.display_name;
  this.latitude = geoData.lat;
  this.longitude = geoData.lon;
}

function Weather(entry){
  this.city_name = entry.city_name;
  this.temp = entry.temp;
  this.forecast = entry.weather.description;
  this.time = entry.datetime;
}

function Trails(trails) {
  this.name = trails.name;
  this.length = trails.length;
  this.summary = trails.summary;
}

function Movie(results) {
  this.title = results.title;
  this.overview = results.overview;
  this.average_votes = results.vote_average;
  this.total_votes = results.vote_count;
  this.image_url = `https://image.tmdb.org/t/p/w500/${results.poster_path}`;
  this.popularity = results.popularity;
  this.released_on = results.release_date;
}

function Yelp(item) {
  this.name = item.name;
  this.image_url = item.image_url;
  this.price = item.price;
  this.rating = item.rating;
  this.url = item.url;
}

// catch all, calls everything we haven't specifically mentioned yet
app.use('*', (req, res) => {
  res.status(404).send('Sorry, not found!');
})


