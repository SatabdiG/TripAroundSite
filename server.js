
var express	=	require("express");
var bodyParser =	require("body-parser");
var multer	=	require('multer');
var multerdragdrop = require('multer');
var app	=	express();
var http=require("http").Server(app);
var socket=require("socket.io")(http);
app.use(bodyParser.json());

const mkdirp = require('mkdirp')

//Path for loading static files
app.use("/FrontEnd/css",express.static(__dirname+'/public/FrontEnd/css'));
app.use("/FrontEnd/js",express.static(__dirname+'/public/FrontEnd/js'));
app.use("/FrontEnd/partials",express.static(__dirname+'/public/FrontEnd/partials'));
app.use("/uploads",express.static(__dirname+'/uploads'));
app.use("/FrontEnd/Pictures",express.static(__dirname+'/public/FrontEnd/Pictures'));
var connect=require('./AdditionServerSide/MongoDbLib');



/*
//Json Data Extraction
var extractionjsondata =   multer.diskStorage({
  guest: function (req, file, callback) {
      callback(null, __dirname +'/uploads' + _userid+'/'+_mapid+'/version_1');
  },
  userid: function (req, file, callback) {
    callback(null, file.fieldname + '-' + Date.now());
  },
  username: function (req, file, callback) {
    callback(null, file.fieldname + '-' + Date.now());
  },
  userpassword: function (req, file, callback) {
    callback(null, file.fieldname + '-' + Date.now());
  },
  mapid: function (req, file, callback) {
    callback(null, file.fieldname + '-' + Date.now());
  },
  mapdataversionid: function (req, file, callback) {
    callback(null, file.fieldname + '-' + Date.now());
  },
  markerid: function (req, file, callback) {
    callback(null, file.fieldname + '-' + Date.now());
  },
  Latid: function (req, file, callback) {
    callback(null, file.fieldname + '-' + Date.now());
  },
  Lngid: function (req, file, callback) {
    callback(null, file.fieldname + '-' + Date.now());
  },
});

var extractiondata = multer({ extractionjsondata : extractionjsondata}).array('userPhoto',8);
_guest= req.files[0].guest;
_userid = req.files[0].userid;
_userpassword = req.files[0].userpassword;
_username = req.files[0].username;
_mapid= req.files[0].mapid;
_mapdataversionid =  req.files[0].mapdataversionid;
_markerid = req.files[0].markerid;
//_Latid = req.files[0].latid;
//_Lngid = req.files[0].lngid;
*/
//Multer Storeage
var storage =   multer.diskStorage({
  guest: function (req, file, callback) {
    callback(null, file._guest);
  },
  destination: function (req, file, callback) {
    if (file[0].guest()){
      callback(null, __dirname + '/uploads' + '/guest');
  }else{
      _userid = files[0].userid;
      _mapid= files[0].mapid;
      const dir = __dirname +'/uploads' + _userid+'/'+_mapid+'/version_1';
      fs.exists(dir, function(exists) {
        let uploadedFileName;
        if (exists) {
          callback(null, __dirname +'/uploads' + _userid+'/'+_mapid+'/version_1');
        } else {
          fs.mkdir(dir, err => cb(err, dir))
          callback(null, __dirname +'/uploads' + _userid+'/'+_mapid+'/version_1');
        }
      });
    }
  },
  filename: function (req, file, callback) {
    var filename = file.originalname;
    var fileExtension = filename.split(".")[1];
    cb(null, filename+ "." + Date.now() + "." + fileExtension);
    //callback(null, file.fieldname + '-' + Date.now()+ '.jpg'); //Appending .jpg
    console.log(file.mimetype); //Will return something like: image/jpeg
  },
  userid: function (req, file, callback) {
    callback(null, file._userid);
  },
  username: function (req, file, callback) {
    callback(null, file._username);
  },
  userpassword: function (req, file, callback) {
    callback(null, file._userpassword);
  },
  mapid: function (req, file, callback) {
    callback(null, file._mapid);
  },
  mapdataversionid: function (req, file, callback) {
    callback(null, file._mapdataversionid);
  },
  markerid: function (req, file, callback) {
    callback(null, file._markerid);
  }//,
  /*
   Latid: function (req, file, callback) {
   callback(null, file._Latid);
   },
   Lngid: function (req, file, callback) {
   callback(null, file._Lngid);
   }
  */

});

var upload = multer({ storage : storage }).array('userPhoto',8);
var uploaddragdrop=multerdragdrop({ storage : storage }).array('file',8);

app.get('/',function(req,res){
    res.sendFile(__dirname + "/public/index.html");
});
//Image Upload form
app.post('/api/photo',function(req,res){
    upload(req,res,function(err) {
        //console.log(req.body);
        //console.log( req.files[0].destination);
        //console.log( req.files[0].filename);
        //console.log( req.files[0].path);
      _userid = req.files[0].userid;
      _userpassword = req.files[0].userpassword;
      _username = req.files[0].username;
      _mapid= req.files[0].mapid;
      _mapdataversionid =  req.files[0].mapdataversionid;
      _markerid = req.files[0].markerid;
      //_Latid = req.files[0].Latid;
      //_Lngid = req.files[0].Lngid;
      _imagename= req.files[0].filename;
      _imagepath = req.files[0].destination;
      connect.addusers('mongodb://localhost:27017/testimages','usercollection', _userid, _username, _userpassword);
      connect.addmaps('mongodb://localhost:27017/testimages','mapcollection', _mapid, _userid);
      connect.addmapversion('mongodb://localhost:27017/testimages','mapdataversioncollection', _mapdataversionid, _mapid, _userid);
      connect.addmarkers('mongodb://localhost:27017/testimages','markercollection', _mapdataversionid, _markerid, _userid, _mapid, _Latid, _Lngid);
      connect.addvalues('mongodb://localhost:27017/testimages','storedimages', _mapdataversionid, _markerid , _imagename, _imagepath, _userid, _mapid);

        if(err) {
            return res.end("Error uploading file.");
        }
        res.end("File is uploaded");

    });
});
//Drag and Drop Form Control
app.post('/photos',function(req,res){
  uploaddragdrop(req,res,function(err){

      if(err){

        return res.end("Error Uploading file");
      }else {
        //console.log(req.files[0].originalname);

       //connect.addvalues('mongodb://localhost:27017/testimages','storedimages',req.files[0].originalname,req.files[0].path);
        return res.end("Success");
      }

  });

});
//******** Socket Function to receive data *********

socket.on('connection',function(socket){
  socket.on('disconnect', function(){
   console.log("A user has disconnected");
  });

  socket.on('Latitude', function(msg){
    _Latid = msg[0].latitude;
    console.log("Latitude"+ msg);
  });

  socket.on('Longitude', function(msg){
    _Lngid = msg[0].longitude;
   console.log("Longittude"+msg);
  });

  //Request from page to load images
  socket.on("LoadImage",function(msg){
    //Connect to data base and extract images
    connect.establishConnection("mongodb://localhost:27017/testimages","storedimages",null,null,function(results){
      if(results!=undefined) {
       if(msg.toUpperCase()=="YES"){
          socket.emit("ImageUploads", results+','+__dirname);
        }
      }
    })


  });
});

http.listen(3000,function(){
  console.log("Working on port 3000");
});

//For Node to exit gracefully
process.on('SIGTERM', function(){
  http.close(function(){
    process.exit(0);
  });
});





