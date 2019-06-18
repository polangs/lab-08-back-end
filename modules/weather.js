function getForecasts(latitude, longitude, locationId, client, superagent) {

  return getFromCache(client, locationId)
    .then(forecasts => {
      console.log('forecasts', forecasts)

      if (forecasts.length === 0) {
        return getFromAPI(latitude, longitude, locationId, client, superagent);
      } else {
        return forecasts;
      }
    })

}

function getFromCache(client, locationId) {
  console.log('in get chache');

  return client.query('SELECT * FROM weathers WHERE location_id=' + locationId)
    .then(result => {
      console.log('result', result.rows)
      return result.rows;
    })

}

function getFromAPI(latitude, longitude, locationId, client, superagent) {

  const URL = `https://api.darksky.net/forecast/${process.env.WEATHER_API_KEY}/${latitude},${longitude}`
  console.log('url', URL);

  return superagent
    .get(URL)
    .then(response => response.body.daily.data)
    .then(days => days.map(day => new Weather(day)))
    .then(dayInstances => cacheForecasts(dayInstances, locationId, client))

}

function cacheForecasts(dayInstances, locationId, client) {

  dayInstances.forEach(day => {

    const SQL = `
      INSERT INTO weathers (forecast, time, location_id) 
      VALUES (${day.foreacast}, ${day.time}, ${locationId});`;

    client.query(SQL); // (insertSQL)

  });
}

function Weather(dayData) {
  this.forecast = dayData.summary;
  this.time = new Date(dayData.time * 1000).toString().slice(0, 15);
}

module.exports = getForecasts;
