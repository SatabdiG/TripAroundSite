var express =   require("express");
var app  =   express();
var multer  =   require('multer');
var multer1=require('multer');
var http=  require('http').Server(app);
var io=require('socket.io')(http);



app.use("/FrontEnd/css",express.static(__dirname+'/FrontEnd/css'));
app.use("/FrontEnd/js",express.static(__dirname+'/FrontEnd/js'));

var storage =   multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, __dirname+'/uploads');
  },
  filename: function (req, file, callback) {
    callback(null, file.fieldname + '-' + Date.now());
  }
});


var upload = multer({ storage : storage}).array('file',3);
var upload1 = multer1({ storage : storage}).array('userphoto',3);


app.get('/',function(req,res){
      res.sendFile(__dirname + "/FrontEnd/index.html");
});

app.post('/api/photo',function(req,res){
    upload(req,res,function(err) {
        if(err) {
            return res.end("Error uploading file.");
        }
        res.end("File is uploaded");
    });
    upload1(req,res,function(err) {
        if(err) {
            return res.end("Error uploading file.");
        }
        res.end("File is uploaded");
    });


});


io.on('connection', function(socket){
  console.log("A user connected");

});


http.listen(3000,function(){
    console.log("Working on port 3000");
});
