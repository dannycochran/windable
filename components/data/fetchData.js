const windData = require('./gfs.json');

// Eventually this should be used to asynchronously fetch data at
// different altitudes, and to cache data until new data from NOAA becomes
// available.
export function fetchData() {
  return Promise.resolve(windData);
};