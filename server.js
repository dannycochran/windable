'use strict';

const express = require('express');
const app = express();

app.set('port', (process.env.PORT || 5000));

// Serve static assets.
app.use('/examples', express.static('examples'));
app.use('/dist', express.static('dist'));
app.use(express.compress());
app.use(express.urlencoded());

const sendConfigurable = (req, res) => {
  res.status(200).sendfile('./examples/googleMaps/configurable.html');
};

app.get('/google_basic', (req, res) => {
  res.status(200).sendfile('./examples/googleMaps/basic.html');
});

app.get('/google_configurable', sendConfigurable);

app.get('/', sendConfigurable);

// Start the server
const server = app.listen(app.get('port'), () => {
  console.log('App listening at http://%s:%s', server.address().address, app.get('port'));
});