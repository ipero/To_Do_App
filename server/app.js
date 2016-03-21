var express = require('express');
var app = express();
var path = require('path');
var bodyParser = require('body-parser');
var index = require('./routes/index.js')
var pg = require ('pg');

var connectString = '';
if(process.env.DATABASE_URL != undefined) {
  pg.defaults.ssl = true;
  connectString = process.env.DATABASE_URL;
} else {
  connectString = 'postgres://localhost:5432/todo';
}

pg.connect(connectString, function(err, client, done){
  if (err) {
    console.log('Error connecting to DB!', err);
  } else {
    var query = client.query('CREATE TABLE IF NOT EXISTS tasks (' +
    'id SERIAL PRIMARY KEY,' +
    'task varchar(80) NOT NULL,'+
    'description text NOT NULL,'+
    'completed BOOLEAN DEFAULT false);'
  );

  query.on('end', function(){
    console.log('Successfully ensured schema exists');
    done();
  });

  query.on('error', function() {
    console.log('Error creating schema!');
    done();
  });
}
});

var port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.use('/todo', index);

app.get('/*', function(req, res){
  var filename = req.params[0] || 'views/index.html';
  res.sendFile(path.join(__dirname, '/public/', filename));
});

app.listen(port, function(){
  console.log('Listening for requests on port ', port);
});
