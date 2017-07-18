var express = require('express');
var app = express();
var fs = require('fs');
var request = require('request');
var cors = require('cors');
var bodyParser = require('body-parser');

//edit the api location here
//http://164.132.110.56/app_dev.php
var apiAddress = "http://164.132.110.56";
var apiIndex = apiAddress+"/app_dev.php";

app.use(express.static('public'));
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }))
// parse application/json
app.use(bodyParser.json({limit: '50mb'}));

// Add headers
app.use(cors());

app.all('/image/*', function (req, res) {
  var reqPath = "/accounts/images"+req.url.replace("/image","");
  console.log("-- IMAGE Call --");
  console.log(req.method+" on "+apiAddress+reqPath);

    var options = {
      url : apiAddress+reqPath,
      method: req.method
    }

    req.pipe(request(options.url)).pipe(res);

      console.log("-> Status "+res.statusCode);

});

app.all('/banners/*', function (req, res) {
  var reqPath = "/accounts/banners"+req.url.replace("/banners","");
  console.log("-- IMAGE Call --");
  console.log(req.method+" on "+apiAddress+reqPath);

    var options = {
      url : apiAddress+reqPath,
      method: req.method
    }

    req.pipe(request(options.url)).pipe(res);

      console.log("-> Status "+res.statusCode);

});

app.all('/api/*', function (req, res) {
  var reqPath = req.url.replace("/api","");
  console.log("-- APi Call --");
  console.log(req.method+" on "+apiIndex+reqPath);


  var options = {
    url : apiIndex+reqPath,
    method: req.method,
    form: req.body
  }

  if(req.query.access_token){
    console.log("Authentification with token : ");
    console.log(req.query.access_token);
    options.headers = {};
    options.headers['Authorization'] = "Bearer "+req.query.access_token;
    delete req.query.access_token;
  }

  request(options,function(req,response,body){

    if(!response){
      res.status(404).send();
      return;
    }
    console.log("-> Status "+response.statusCode);
    console.log("--------------");
    console.log("Form-data");
    res.status(response.statusCode).send(body);
  })
});

app.listen(8080, function () {
  console.log('Projet2 is active on port 8080');
});
