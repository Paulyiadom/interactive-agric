const express = require('express');
const ejs = require('ejs');
const bodyParser = require('body-parser');
const agric = require('./router/agricRoute');
const app = express();
const path = require('path');
const fs = require('fs');
// const ejsLint = require('ejs-lint');

// ejs
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static('public')); 
// app.use(express.static('public')); 
app.use(bodyParser.json());
app.use('/data', express.static('data'));
// app.use('/data', express.static(path.join(__dirname, 'data')));


app.use('/',agric);


// Route to get product data
app.get('/api/products', (req, res) => {
  fs.readFile(path.join(__dirname, 'products.json'), 'utf8', (err, data) => {
      if (err) {
          return res.status(500).json({ error: 'Error reading product data' });
      }
      res.json(JSON.parse(data)); // Send the JSON data
  });
});


app.get('/ghana-geojson', (req, res) => {
  const geojsonPath = path.join(__dirname, 'data', 'ghana.geojson');
  const geojsonData = fs.readFileSync(geojsonPath, 'utf8');
  res.json(JSON.parse(geojsonData));
});

app.get('/region-data', (req, res) => {
  const regionDataPath = path.join(__dirname, 'data', 'region.json');
  const regionData = fs.readFileSync(regionDataPath, 'utf8');
  res.json(JSON.parse(regionData));
});


app.get('/data/ghana.geojson', (req, res) => {
  res.sendFile(__dirname + '/data/ghana.geojson');
});


app.get('/populationData', (req, res) => {
  fs.readFile(path.join(__dirname, 'data', 'populationData.json'), 'utf8', (err, data) => {
      if (err) {
          return res.status(500).send('Error reading data file');
      }
      res.json(JSON.parse(data)); // Send JSON data
  });
});

/*
app.post('/message', (req, res) => {
    const message = req.body.message;
    console.log('Received message: from another Port:', message);
    res.send('Message received');
  });
app.post('/msg', (req, res) => {
    const message = req.body;
    console.log('Received message: from another Port', message);
    res.send(message);
  });

  
//  // Serve GeoJSON file

*/


const port = 4500;
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});