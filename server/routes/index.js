
var router = require('express').Router();
var path = require('path');
var pg = require('pg');

var connectString = '';
if(process.env.DATABASE_URL != undefined) {
  pg.defaults.ssl = true;
  connectString = process.env.DATABASE_URL;
} else {
  connectString = 'postgres://localhost:5432/todo';
}

router.post('/', function (req, res) {
  console.log('recieved req body: ', req.body)
  pg.connect(connectString, function(err, client, done) {
    if (err) {
      console.log('error connecting to DB:', err);
      res.status(500).send(err);
      done();
      return;
    }else{

      // we have successfully connected, try to query
      var query = client.query('INSERT INTO tasks (task, description) VALUES ($1, $2)' +
                               'RETURNING id, task',
                               [req.body.task, req.body.description]);

      query.on('end', function() {
        res.status(200).send();
        done();
      });

      // handle any errors during query
      query.on('error', function(error) {
        console.log('error querying DB:', error);
        res.status(500).send(error);
        done();
      });
    }
  });
});

router.get('/', function(req, res) {
  pg.connect(connectString, function(err, client, done) {
    if (err) {
      console.log('error connecting to DB:', err);
      res.status(500).send(err);
      done();
      return;
    }else{
      var result = [];
      // sord table by uncompleted task
      var query = client.query('SELECT * FROM tasks ORDER BY completed ASC;');

      query.on('row', function(row) {
        result.push(row);
      });

      query.on('end', function() {
        res.send(result);
        done();
      });

      query.on('error', function(error) {
        console.log('error querying DB:', error);
        res.status(500).send(error);
        done();
      });
    }
  });
});

router.put('/', function (req, res){
  pg.connect(connectString, function(err, client, done){
    if(err){
      done();
      console.log('Error connecting to DB ', err);
      res.status(500).send(err);
    }else{
      // use condition statement to chage from False to True and vise versa
      var query = client.query('UPDATE tasks SET completed = '+
      'CASE '+
        'WHEN completed=true '+
        'THEN false '+
        'ELSE true '+
      'END '+
      'WHERE id = '+req.body.id+';');

      query.on('end', function() {
        done();
        res.status(200).send();
      });

      query.on('error', function(error) {
        console.log('Error running query:', error);
        done();
        res.status(500).send(error);
      });
    }
  });
});

router.delete('/', function (req, res) {
  pg.connect(connectString, function(err, client, done){
    if(err){
      console.log('error connecting to DB:', err);
      res.status(500).send(err);
      done();
      return;
    }else{
      // delete row from DB
      var query = client.query('DELETE FROM tasks WHERE id = '+ req.body.id +';');

      query.on('end', function() {
        res.status(200).send();
        done();
      });

      // handle any errors during query
      query.on('error', function(error) {
        console.log('error querying DB:', error);
        res.status(500).send(error);
        done();
      });
    }

  })
});


// export the router object
module.exports = router;
