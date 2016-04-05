'use strict';

const express = require('express');
const app = express();
const port = 8080;

const sendIndex = (req, res) => { res.status(200).sendfile('dist/index.html'); };

// Serve static assets.
app.use('/dist', express.static('dist'));
app.use(express.compress());
app.use(express.urlencoded());

app.get('/', sendIndex);

// Start the server
const server = app.listen(port, () => {
  console.log('App listening at http://%s:%s', server.address().address, port);
});