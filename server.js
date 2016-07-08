
var express	=	require("express");
var bodyParser =	require("body-parser");
var multer	=	require('multer');

var app	=	express();
app.use(bodyParser.json());

var connect=require('./AdditionServerSide/MongoDbLib');

//var db=connect.establishConnection('mongodb://localhost:27017/testimage', 'testimage',null, 'filename',function(results)
//{
    //results contain the results of database connection
    //console.log(results)

//});

/*
var mongo = require('mongodb');
var MongoClient = require('mongodb').MongoClient
var db;
MongoClient.connect('mongodb://localhost:27017/local', function(err, Db) {
    if (err) {
        console.log('Unable to connect to the mongoDB server. Error:', err);
    } else {
        console.log('CONNECTED TO MONGODB');
        db = Db;

        var collection = db.collection('players');
        collection.insertOne([{"imgUrl":"a"}], (err, res) => {
            if (err) {
                console.log('Error:', err);
            } else {
                console.log('OK');
            }
        });

    }
});

*/

var storage	=	multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, './uploads');
    },
    filename: function (req, file, callback) {
        callback(null, file.fieldname + '-' + Date.now());
    }
});
var upload = multer({ storage : storage }).array('userPhoto',8);


app.get('/',function(req,res){
    res.sendFile(__dirname + "/public/index.html");
});

app.post('/api/photo',function(req,res){
   upload(req,res,function(err) {
        //console.log(req.body);
        //console.log( req.files);
       console.log( req.files[0].filename);
       console.log( req.files[0].path);
       connect.addvalues('mongodb://localhost:27017/testimages','testimages',req.files[0].filename,req.files[0].path);

       if(err) {
            return res.end("Error uploading file.");
        }
        res.end("File is uploaded");

    });
});

app.listen(3000,function(){
    console.log("Working on port 3000");
});





