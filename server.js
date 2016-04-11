'use strict';

const express = require('express');
const app = express();
const port = 8080;

const sendIndex = (req, res) => { res.status(200).sendfile('dist/index.html'); };
const cacher = (req, res, next) => {
  res.setHeader('Cache-Control', `public, max-age=${CACHE_TIME}`);
  next();
};

// Serve static assets.
app.use(cacher);
app.use('/dist', express.static('dist'));
app.use(express.compress());
app.use(express.urlencoded());

// Send back wind data from April 1st. For dynamic loading, you'd write some gross hook that:
// 1. Curls data from:
//   http://nomads.ncep.noaa.gov/cgi-bin/filter_gfs_1p00.pl?file=gfs.t00z.pgrb2.1p00.f000&lev_${MILLIBARS}_mb=on&var_UGRD=on&var_VGRD=on&dir=%2Fgfs.${TIMESTAMP}
//    And MILLIBARS is an integer. Continuous integers aren't supported, see: ftp://ftp.cpc.ncep.noaa.gov/wd51we/ams2010_sc/Obtaining%20data.pdf
//    Where TIMESTAMP = YYYYMMDDHH (e.g 2016040106) -- the HH field must be one of: (00, 06, 12, 18)
// 2. Converts grib2json using grib2json via a shell command.
// 3. Send back the output json.
app.get('/wind', (req, res) => {
  console.log(req.query);
  const file = require(`./data/${req.query.time}_${req.query.millibars}.json`);
  res.json(file);
});

app.get('/', sendIndex);
app.get('/*', sendIndex);

// Start the server
const server = app.listen(port, () => {
  console.log('App listening at http://%s:%s', server.address().address, port);
});