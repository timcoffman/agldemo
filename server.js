// server.js
// where your node app starts

// init project
var express = require('express'),
    bodyParser = require('body-parser'),
    xml2js = require('xml2js'),
    exphbs = require('express-handlebars')
    ;
var app = express();

app.use( bodyParser.json() );
app.use( bodyParser.urlencoded() );


var hbs = exphbs.create({
  defaultLayout: 'single',
  helpers: {
    toJSON: function(object) { return JSON.stringify(object); }
  }
});

// app.set("views", __dirname + '/views/' );
app.engine('handlebars', hbs.engine ) ;
app.set("view engine", "handlebars") ;

// we've started you off with Express, 
// but feel free to use whatever libs or frameworks you'd like through `package.json`.

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (request, response) {
  response.sendFile(__dirname + '/views/hyperspace.html');
});

app.post("/log", function (request, response) {
  console.log( request.headers.referer ) ;
  console.log( request.body ) ;
  response.status(200).json({ "success": "logged"});
});

app.get("/launch", function (request, response) {
  var iss = request.query.iss ;
  var launch = request.query.launch ;
  response.render( 'launch', { iss: iss, launch: launch, layout: 'launch' } ) ;
});

app.get("/redirect", function(request, response) {
  console.info( "redirected here with code: " + request.query.code ) ;
  response.status(200).json({ "code": request.query.code } );
});

app.get("/:view", function (request, response) {
  var viewFile = request.params.view ;
  response.render( viewFile );
});

app.post("/:view", function (request, response) {
  var viewFile = request.params.view ;
  
  var data = { } ;
  for ( var name in request.body ) {
    if ( name == 'EpicQuery' ) {
      xml2js.parseString(request.body[name], { explicitArray: false, attrkey: '$attrs', charkey: '_text'}, function( err, result ) {
        if ( result.search.param ) {
          result.search.paramsByType = result.search.param.reduce( function(acc,obj) {
            acc[ obj['$attrs'].type ] = obj['_text'] ;
            return acc ;
          }, {}) ;
          delete result.search.param ;
        }
        data[name] = result ;
      }) ;
    } else {
      data[name] = request.body[name] ;
    }
    console.log( name + " = " + data[name] ) ;
  }
  
  for ( var name in data )
    console.log( name + " = " + data[name] ) ;
  response.render( viewFile, data );
});

// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
