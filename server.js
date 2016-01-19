
var AWS = require('AWS');
var Dynamo = new AWS.DynamoDB.DocumentClient();
var express = require('express');
var bodyParser = require('body-parser');

var ARGS = getCLIArgs();
var app = express();
var TABLE = ARGS.table;
var PORT = ARGS.port;

app.listen(PORT);

app.use(bodyParser.json());

app.use(express.static('./'));

app.get('/todo/', function (req, res) {
  Dynamo.scan({
    TableName: TABLE
  }, function (err, result) {
    if (err) {
      res.statusCode = err.statusCode;
      res.end();
    } else {
      res.json(result.Items);
    }
  });
});

app.get('/todo/:id', function (req, res) {
  Dynamo.get({
    TableName: TABLE,
    Key: {
      id: req.params.id
    }
  }, function (err, result) {
    if (err) {
      res.statusCode = err.statusCode;
      res.end();
    } else {
      res.json(result.Item);
    }
  });
});

app.put('/todo/:id', function (req, res) {
  req.body.id = req.params.id;
  Dynamo.put({
    TableName: TABLE,
    Item: req.body
  }, function (err, result) {
    if (err) {
      res.statusCode = err.statusCode;
      res.end();
    } else {
      res.json(req.body);
    }
  });
});

app.post('/todo', function (req, res) {
  req.body.id = Date.now().toString();
  Dynamo.put({
    TableName: TABLE,
    Item: req.body
  }, function (err, result) {
    if (err) {
      res.statusCode = err.statusCode;
      res.end();
    } else {
      res.json(req.body);
    }
  });
});

app.delete('/todo/:id', function (req, res) {
  Dynamo.put({
    TableName: TABLE,
    Key: {
      id: req.params.id
    }
  }, function (err, result) {
    if (err) {
      res.statusCode = err.statusCode;
      res.end();
    } else {
      res.statusCode = 200;
      res.end();
    }
  });
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