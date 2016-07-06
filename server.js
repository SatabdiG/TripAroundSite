'use strict';

var express = require('express'),
  http = require('http'),
  app = express(),
  sys = require('sys'),
  fs = require('fs'),
  path = require('path'),
  bytes = require('bytes'),
  //
  qs = require('querystring'),
  url = require('url'),
  mongodb = require('mongodb'),
  //


parseFile = function(file, req) {
    var parsedFile = path.parse(file),
      fullUrl = req.protocol + '://' + req.get('host') + '/uploads/';

    return {
      name: parsedFile.name,
      base: parsedFile.base,
      extension: parsedFile.ext.substring(1),
      url: fullUrl + parsedFile.base,
      size: bytes(fs.statSync(file).size)
    };
  };
var multer = require('multer');
var storage =   multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, __dirname+'/uploads');
  },
  filename: function (req, file, callback) {
    callback(null, file.fieldname + '-' + Date.now());
  }
});


app.set('port', process.env.PORT || 3000);
app.use(express.static(__dirname + '/public'));
app.use(express.bodyParser({ keepExtensions: true, uploadDir: __dirname + '/uploads' })); // required for accessing req.files object


app.use("/FrontEnd/css",express.static(__dirname+'/FrontEnd/css'));
app.use("/FrontEnd/js",express.static(__dirname+'/FrontEnd/js'));

app.post('/uploadFiles', function (req, res) {
  var newPath = null,
    uploadedFileNames = [],
    uploadedImages,
    uploadedImagesCounter = 0;

  if(req.files && req.files.uploadedImages) {
    uploadedImages = Array.isArray(req.files.uploadedImages) ? req.files.uploadedImages : [req.files.uploadedImages];

    uploadedImages.forEach(function (value) {
      newPath = __dirname + "/public/uploads/" + path.parse(value.path).base;
      fs.renameSync(value.path, newPath);

      uploadedFileNames.push(parseFile(newPath, req));
    });

    res.type('application/json');
    res.send(JSON.parse(JSON.stringify({"uploadedFileNames": uploadedFileNames})));

  }



});
var upload = multer({ storage : storage}).array('file',3);
app.post('/api/photos', function(req, res){
  upload(req,res,function(err) {
    if(err) {
      return res.end("Error uploading file.");
    }
    res.end("File is uploaded");
  });

});
app.get('/files', function (req, res) {
  var dirPath = path.normalize('./public/uploads/');

  fs.readdir(dirPath, function (err, files) {
    if (err) {
      throw err;
      res.send(500, {})
    }

    var uploadedFiles = files.filter(function (file) {
      return file !== '.gitignore';
    }).map(function (file) {
      return path.join(dirPath, file);
    }).filter(function (file) {
      return fs.statSync(file).isFile();
    }).map(function (file) {
      return parseFile(file, req);
    });

    res.type('application/json');
    res.send(uploadedFiles);
  });

});

http.createServer(app).listen(app.get('port'), function () {
  console.log("\n\nNode version: " + process.versions.node);
  console.log("Express server listening on port " + app.get('port') + "\n\n");
});

/*
// Retrieve
var MongoClient = require('mongodb').MongoClient;

// Connect to the db
MongoClient.connect("mongodb://localhost:27017/path", function(err, db) {
  if(!err) {
    console.log("We are connected");
  }
});

*/

// Adding MongoDB

db = new mongodb.Db('test', new mongodb.Server('localhost', 27017, {}), {});

//var db = require('mongo-lite').connect('mongodb://localhost:1526')

db.addListener("error", function(error) {
  console.log("Error connecting to mongo -- perhaps it isn't running?");
});


db.open(function(error, client) {
  db.collection('guestbook', function(err, collection) {
    guestbookCollection = collection;

    http.createServer(function (req, res) {
      if (req.url.indexOf('/api/') == 0) {
        handleAPI(req, res);
      }
      else if (req.method == 'GET') {
        handleStatic(req, res);
      }
    }).listen(1526, 'localhost');

    console.log('Server running at http://localhost:1526/');
  });
});

