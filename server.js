'use strict';

// enviroment variables
require('dotenv').config();

// Application dependencies
const express = require('express');
const cors = require('cors');
const superagent = require('superagent');
const pg = require ('pg');

// database set up
const client = new pg.Client(process.env.DATABASE_URL);
client.connect();
client.on('error', err => console.error(err));

// Application set up
const app = express();
const PORT = process.env.PORT || 4000;
app.use(cors());


// get location

// routes 
app.get('/location', handleLocation);
app.get('/weather', handleWeather);
// app.get('/events', handleEvents);

// internal modules
const getLocation = require('./modules/locations.js');
const getForecasts = require('./modules/weather.js');
// const getEvents = require('./modules/events');


// route handlers
function handleLocation(req, res) {
  // console.log('handleLocation', req.query.data);
  getLocation(req.query.data, client, superagent)
    .then(location => res.send(location))
    .catch(error => handleError(error, res));
}

function handleWeather(req, res) {
  console.log('************* handle weather', req.query.data);

  getForecasts(req.query.data.latitude, req.query.data.longitude, req.query.data.id, client, superagent)
    .then(forecasts => {
      // console.log('=====================', forecasts);
      return res.send(forecasts);
    })
    .catch(error => handleError(error, res));
}

// function handleEvents(req, res) {

//   // getEvents(req.query)
//   //   .then(data => res.send(data))
//   //   .catch(error => handleError(error))


//   getEvents(req.query.data.formatted_query, client, superagent)
//     .then(events => res.send(events))
//     .catch(error => handleError(error, res));
// }

function handleError(error, response) {
  console.error(error);
  response.status(500).send('ERROR');
}

app.listen(PORT, () => console.log(`App is listening on ${PORT}`));
