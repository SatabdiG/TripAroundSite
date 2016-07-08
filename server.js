
var express	=	require("express");
var bodyParser =	require("body-parser");
var multer	=	require('multer');
var multerdragdrop = require('multer');
var filepath="./uploads";
var app	=	express();
var http=require("http").Server(app);
var socket=require("socket.io")(http);
app.use(bodyParser.json());

//Path for loading static files
app.use("/FrontEnd/css",express.static(__dirname+'/public/FrontEnd/css'));
app.use("/FrontEnd/js",express.static(__dirname+'/public/FrontEnd/js'));
var connect=require('./AdditionServerSide/MongoDbLib');

var storage =   multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, __dirname+'/uploads');
  },
  filename: function (req, file, callback) {
    callback(null, file.fieldname + '-' + Date.now());
  }
});

var upload = multer({ storage : storage }).array('userPhoto',8);
var uploaddragdrop=multerdragdrop({ storage : storage }).array('file',8);

app.get('/',function(req,res){
    res.sendFile(__dirname + "/public/index.html");
});

app.post('/api/photo',function(req,res){
    upload(req,res,function(err) {
        //console.log(req.body);
        //console.log( req.files);
        console.log( req.files[0].filename);
        console.log( req.files[0].path);
        connect.addvalues('mongodb://localhost:27017/testimages','storedimages',req.files[0].filename,req.files[0].path);

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
        return res.end("Error Uploadindg file");
      }else
        return res.end("Success");

  });

})
//******** Socket Function to receive data *********

socket.on('connection',function(socket){
  console.log("A user has connected");
  socket.on('disconnect', function(){
    console.log("A user has disconnected");
  });

  socket.on('Latitude', function(msg){

    console.log("Latitude"+ msg);
  });

  socket.on('Longitude', function(msg){
    console.log("Longittude"+msg);
  });

});

http.listen(3000,function(){
    console.log("Working on port 3000");
});





