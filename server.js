
var AWS = require('aws-sdk');
var Dynamo = new AWS.DynamoDB.DocumentClient();
var express = require('express');
var bodyParser = require('body-parser');

var ARGS = getCLIArgs();
var app = express();
var TABLE = ARGS.table;
var PORT = ARGS.port;

console.log('Using body-parser...');
app.use(bodyParser.json());

console.log('Using static at: ./');
app.use(express.static('./'));

console.log('Adding routes...');
app.get('/todo/', function (req, res) {
  console.log('About to run a scan...');
  Dynamo.scan({
    TableName: TABLE
  }, function (err, result) {
    if (err) {
      console.log('ERROR ON SCAN: ', err);
      res.statusCode = err.statusCode;
      res.end(JSON.stringify(err));
    } else {
      console.log('SCAN RETURNED:', result.Items);
      res.json(result.Items);
    }
  });
});

app.get('/todo/:id', function (req, res) {
  console.log('About to run a get...: ' + req.params.id);
  Dynamo.get({
    TableName: TABLE,
    Key: {
      id: req.params.id
    }
  }, function (err, result) {
    console.log('ERROR ON GET: ', err);
    if (err) {
      res.statusCode = err.statusCode;
      res.end(JSON.stringify(err));
    } else {
      console.log('GET RETURNED:', result.Item);
      res.json(result.Item);
    }
  });
});

app.put('/todo/:id', function (req, res) {
  console.log('About to run a put...: ', req.body);
  req.body.id = req.params.id;
  Dynamo.put({
    TableName: TABLE,
    Item: req.body
  }, function (err, result) {
    console.log('ERROR ON PUT: ', err);
    if (err) {
      res.statusCode = err.statusCode;
      res.end(JSON.stringify(err));
    } else {
      console.log('PUT RETURNED:', req.body);
      res.json(req.body);
    }
  });
});

app.post('/todo', function (req, res) {
  req.body.id = Date.now().toString();
  console.log('About to run a post...: ', req.body);
  Dynamo.put({
    TableName: TABLE,
    Item: req.body
  }, function (err, result) {
    console.log('ERROR ON POST: ', err);
    if (err) {
      res.statusCode = err.statusCode;
      res.end(JSON.stringify(err));
    } else {
      console.log('POST RETURNED:', req.body);
      res.json(req.body);
    }
  });
});

app.delete('/todo/:id', function (req, res) {
  console.log('About to run a delete...: ' + req.params.id);
  Dynamo.put({
    TableName: TABLE,
    Key: {
      id: req.params.id
    }
  }, function (err, result) {
    console.log('ERROR ON DELETE: ', err);
    if (err) {
      res.statusCode = err.statusCode;
      res.end('');
    } else {
      console.log('DELETE RETURNED:', 'OK');
      res.statusCode = 200;
      res.end('OK');
    }
  });
});


app.listen(PORT, function() {
  console.log('Now listening on port: ' + PORT);
});

// Helper funtion to get the command line --args as a hash.
function getCLIArgs() {
  return process.argv.reduce(function(hash, arg, idx, array) {

    var next = array[idx + 1];

    // We have identified a keyname
    if (!arg.indexOf('--')) {
      // Lookahead for non-key
      //   ? Remove leading dashes
      //   : Non-value keys are boolean
      hash[arg.substr(2).toLowerCase()] = next && next.indexOf('--') ? next : true;
    }

    return hash;

  }, {});
}
