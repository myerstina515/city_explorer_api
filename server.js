/* eslint-disable no-template-curly-in-string */
'use strict';

// require 3rd party dependencies (npm === 3rd part)
const express = require('express');
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

// open our API for public access
app.use(cors());
app.get('/location', handleLocation);
app.get('/weather', handleWeather);
app.get('/trails', handleTrails);
app.listen(PORT, () => {
  console.log(`server up on ${PORT}`);
})

// named route handler vs. below in our examples we have unnamed (anonymous) callback functions
function handleLocation(req, res) {
  console.log('location');
  let city = req.query.city;
  console.log('city');
  let url = `http://us1.locationiq.com/v1/search.php?key=${GEOCODE_API_KEY}&q=${city}&format=json&limit=1`;
  let locations = {};
  superagent.get(url)
    .then(data => {
      const geoData =data.body[0];
      const location = new Location(city, geoData);
      locations[url] = location;

      console.log('visited locations:', locations);
      res.send(location);
    })
    .catch(() => {
      console.error('did not work');
    })
}

function Location(city, geoData) {
  this.search_query = city;
  this.formatted_query = geoData.display_name;
  this.latitude = geoData.lat;
  this.longitude = geoData.lon;
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

function Weather(entry){
  this.city_name = entry.city_name;
  this.temp = entry.temp;
  this.forecast = entry.weather.description;
  this.time = entry.datetime;
}

function handleTrails(req, res) {
  console.log('/trails');
  const queryParams = {
    lat: req.query.latitude,
    lon: req.query.longitude
  }
  console.log(queryParams); 
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

function Trails(trails) {
  this.name = trails.name;
  this.length = trails.length;
  this.summary = trails.summary;
}

// catch all, calls everything we haven't specifically mentioned yet
app.use('*', (req, res) => {
  res.status(404).send('Sorry, not found!');
})
