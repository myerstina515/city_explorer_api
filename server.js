/* eslint-disable no-template-curly-in-string */
'use strict';

// require('dotenv').config();
// the above is the same things as:

//  const dotenv = require('dotenv');
//  dotenv.config();

// require 3rd party dependencies (npm === 3rd part)
const express = require('express');
const superagent = require('superagent');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

// setup "app" constants (constants for my server file)
const app = express();
const PORT = process.env.PORT;
const GEOCODE_API_KEY = process.env.GEOCODE_API_KEY;
app.listen(PORT, () => {
  console.log(`server up: ${PORT}`) || 3000;
  // console.log('server up: 3000');
})

// open our API for public access
app.use(cors());
app.get('/location', handleLocation);
// new route
app.get('/weather', handleWeather);

// named route handler vs. below in our examples we have unnamed (anonymous) callback functions
function handleLocation(req, res) {
  let city = req.query.city;
  let url = 'http://us1.locationiq.com/v1/search.php?key=${GEOCODE_API_KEY}&q=${city}&format=json&limit=1';
  let locations = {};
  if (locations[url]) {
    res.send(locations[url]);
  } else {
    superagent.get(url)
      .then(data => {
        const geoData =data.body[0];
        const location = new Location(city, geoData);
        locations[url] = location;

        console.log('visited locatoins:', locations);
        res.json(location);
      })
      .catch(() => {
        console.error('did not work');
      })
  }
}

function Location(city, geoData) {
  this.search_query = city;
  this.formatted_query = geoData.display_name;
  this.latitude = geoData.lat;
  this.longitude = geoData.lon;
}

// callback to the route:

// function handleWeather(request, response) {
//   try {
//     let weatherDataArray = [];
//     let tempData = require('./data/weather.json');
//     let city = request.query.city;
//     for (var i = 0; i < tempData.data.length; i++){
//       let weatherData = new Weather(city, tempData.data[i]);
//       weatherDataArray.push(weatherData);
//     }
//     response.send(weatherDataArray);
//   } catch (error){
//     console.error(error);
//   }
// }
// function Weather(city, tempData) {
//   this.search_query = city;
//   this.formatted_query = tempData.city_name;
//   this.weather = tempData.weather.description;
//   this.date = tempData.datetime;
// }

// catch all, calls everything we haven't specifically mentioned yet
app.use('*', (request, response) => {
  response.status(500).send('Sorry, not found!');
})
