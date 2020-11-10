'use strict';

require('dotenv').config();
// the above is the same things as:

//  const dotenv = require('dotenv');
//  dotenv.config();

// require 3rd party dependencies (npm === 3rd part)
const express = require('express');
const cors = require('cors');

// setup "app" constants (constants for my server file)
const app = express();
const PORT = process.env.PORT;
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
function handleLocation(request, response) {
  try {
    let geoData = require('./data/location.json');
    // this is extra info in the form of a querystring (key/val pair) in the url
    let city = request.query.city;
    //format a url with qs like this: http://localhost:3000/location?city=seattle&county=king

    //create an object that only contrains location data we care about - this should be an instance of the type of data we are looking for
    let locationData = new Location(city, geoData);
    response.send(locationData);
  } catch (error) {
    console.error(error);
  }
}

function Location(city, geoData) {
  this.search_query = city;
  this.formatted_query = geoData[0].display_name;
  this.latitude = geoData[0].lat;
  this.longitude = geoData[0].lon;
}
// callback to the route:

function handleWeather(request, response) {
  try {
    let weatherDataArray = [];
    let tempData = require('./data/weather.json');
    let city = request.query.city;
    for (var i = 0; i < tempData.data.length; i++){
      let weatherData = new Weather(city, tempData.data[i]);
      weatherDataArray.push(weatherData);
    }
    response.send(weatherDataArray);
  } catch (error){
    console.error(error);
  }
}
function Weather(city, tempData) {
  this.search_query = city;
  this.formatted_query = tempData.city_name;
  this.weather = tempData.weather.description;
  this.date = tempData.datetime;
}





