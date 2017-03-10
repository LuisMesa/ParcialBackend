// server/app.js
const express = require('express');
const morgan = require('morgan');
const path = require('path');
const flickr = require("flickrapi");
const fs = require("fs");
const cors = require('cors');

const app = express();
app.use(cors());

// Assumes that there are two files containing the keys
// $PROJECT_HOME/server/api_key.txt
// $PROJECT_HOME/server/api_secret.txt
function getApiKeys(callback, errorcallback) {
	fs.readFile(path.resolve(__dirname,"./api_key.txt"), "utf-8", (err, api_key) => {
		if (err) {
			errorcallback(err);
			return;
		}
		fs.readFile(path.resolve(__dirname,"./api_secret.txt"), "utf-8",(err, api_secret) => {
			if (err) {
				errorcallback(err);
				return;
			}
			callback(api_key, api_secret);
		});
	});
}

// Setup logger
app.use(morgan(':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] :response-time ms'));

// Serve static assets
app.use(express.static(path.resolve(__dirname, '..', 'build')));

// Searches Flickr for a specific query
app.get('/fotosColores/:query', function (req, res) {

  var contador=0;
  var data=[];
	console.log("Flickr call query=" + req.params['query'] );
	getApiKeys((api_key, api_secret) => {
		const Flickr = require("flickrapi"),
	    flickrOptions = {
	      api_key: api_key,
	      secret: api_secret
	    };
	    console.log(api_key);
	    console.log(api_secret);
    const colores = ['purple','blue','green','yellow','orange','red'];
    const PER_PAGE=6;
    colores.map((colorActual,i)=>{
      Flickr.tokenOnly(flickrOptions, function (error, flickr)
      {
        console.log('query: ' + req.params["query"] + ' ' + colores[i]);
        flickr.photos.search({
          api_key: flickrOptions.api_key,
          page: 1,
          per_page: PER_PAGE,
          safe: 1,
          sort: "relevance",
          text: req.params["query"] + ' ' + colores[i]
        }, (err, dataN) =>
        {
          if (err) res.send(err);
          console.log("Got flickr data sending it");
          dataN.photos.photo.map((fotoActual,i2) =>{ data[i+(i2*PER_PAGE)]=(fotoActual)});
          contador++;
          console.log(contador);
          if(contador==colores.length)
          {
            res.send(data);
          }
        });
      })});

	}, (err) => {
		console.log(err);
		res.send("Error!");
	})
});

// Always return the main index.html, so react-router render the route in the client
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, '..', 'build', 'index.html'));
});


module.exports = app;