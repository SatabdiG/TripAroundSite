
var express	=	require("express");
var bodyParser =	require("body-parser");
var multer	=	require('multer');
var multerdragdrop = require('multer');
var multerguest=require('multer');
var path=require('path');
var app	=	express();
var fs=require('fs');
var http=require("http").Server(app);
var socket=require("socket.io")(http);
var formidable=require('formidable');
var mv= require('mv');
app.use(bodyParser.json());

//Computer Vision Middlewares//

//Blurred Detection middlewares.
var Canvas = require('canvas'),
    Filters = require('canvasfilters').Filters,
    image;
//Detection
var cv = require('opencv');


var userid;
var filename;
const mkdirp = require('mkdirp');


//Path for loading static files
app.use(bodyParser.json());
app.use("/FrontEnd/css",express.static(__dirname+'/public/FrontEnd/css'));
app.use("/FrontEnd/js",express.static(__dirname+'/public/FrontEnd/js'));
app.use("/FrontEnd/partials",express.static(__dirname+'/public/FrontEnd/partials'));
app.use("/uploads",express.static(__dirname+'/uploads'));
app.use("/FrontEnd/Pictures",express.static(__dirname+'/public/FrontEnd/Pictures'));
var connect=require('./AdditionServerSide/MongoDbLib');
var trail=require('./AdditionServerSide/Classes');

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

//Multer Storage
var storage =   multer.diskStorage({
  guest: function (req, file, callback) {
    callback(null, file._guest);
  },
  destination: function (req, file, callback) {
    if (userid=="guest"){
      callback(null, __dirname + '/uploads' + '/guest');
  }else{
      _userid = files[0].userid;
      _mapid= files[0].mapid;
      const dir = __dirname +'/uploads' + _userid+'/'+_mapid+'/version_1';
      fs.exists(dir, function(exists) {
        var uploadedFileName;
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

var gueststore =   multerguest.diskStorage({
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
//Image Upload form
app.post('/api/photo',function(req,res){
  console.log("In server");
  console.log(JSON.stringify(req.body));
  console.log(JSON.stringify(req.body.files.context.location));
  console.log(JSON.stringify(req.body.userid));
  console.log(JSON.stringify(req.body.filename));
  console.log("User id"+__userid);
  console.log(filedata);
    upload(req,res,function(err) {
        //console.log(req.body);
        //console.log( req.files[0].destination);
        //console.log( req.files[0].filename);
        //console.log( req.files[0].path);
        _userid = req.body.userid;
      // _userpassword = req.files[0].userpassword;
     // _username = req.files[0].username;
      _mapid= req.body.mapid;
      _mapdataversionid =  req.body.mapdataversionid;
      _markerid = req.body.markerid;
      //_Latid = req.files[0].Latid;
      //_Lngid = req.files[0].Lngid;
      _imagename= req.body.filename;
      //_imagepath = req.files[0].destination;
      if(__userid == "guest")
      {
        _imagename=__dirname+'/uploads/guest';
        _mapid="guestmap";
        _mapdataversionid="guestid";
      }
      if(__userid != "guest") {
        connect.addusers('mongodb://localhost:27017/testimages', 'usercollection', _userid, _username, _userpassword);
        connect.addmaps('mongodb://localhost:27017/testimages', 'mapcollection', _mapid, _userid);
        connect.addmapversion('mongodb://localhost:27017/testimages', 'mapdataversioncollection', _mapdataversionid, _mapid, _userid);
        connect.addmarkers('mongodb://localhost:27017/testimages', 'markercollection', _mapdataversionid, _markerid, _userid, _mapid, _Latid, _Lngid);
        connect.addvalues('mongodb://localhost:27017/testimages', 'storedimages', _mapdataversionid, _markerid, _imagename, _imagepath, _userid, _mapid);
      }
      else
      {
          console.log("In here");
      }
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
        return res.end("Success");
      }
  });
});

var uploadguest= multer({dest:__dirname+'/uploads'});
/* Guest Log in */
app.post('/guestlogin', function(req,res){
  console.log("In guest handler");
  var form=new formidable.IncomingForm();
  form.multiple=true;
  form.uploadDir=path.join(__dirname,'/uploads');
  form.on('file',function(field,file){
    //fs.rename(file.path,path.join(form.uploadDir,file.name));
    mv(file.path,join(form.uploadDir,file.name), function(err){
      if(!err)
      {
        console.log("File uploaded");
      }else
        console.log("Error occurs"+err);
    });
  });
  form.on('error',function(err){
    console.log("Error has ocurred");
    return res.end("no");
  });
  form.on('end',function(){
    res.send("yes");
  });

  form.parse(req);

});


//Register New users
app.post('/registeruser', function(req,res){
  var userid=req.body.username;
  var username=req.body.name;
  var password=req.body.password;
  var email=req.body.email;
  console.log("Email  "+ email);

  //Access Mongodb See is user is there
  connect.userPresent('mongodb://localhost:27017/testimages', userid, function(msg){
    if(msg!=undefined){
      console.log("Returned data"+msg);
      if(msg =='present'){
        return res.end(msg);
      }
      else
      {
          connect.addusers('mongodb://localhost:27017/testimages', userid, username, password, function (mssg) {
            if (mssg != undefined) {
              console.log("Returned data" + mssg);
              return res.end(mssg);
            }
          });

      }
    }

  });

});

app.post('/guestdetailssave',function(req,res){
  var filename=req.body.filename;
  console.log("In guest details handler");
  console.log(req.body);
  console.log("User id "+req.body.userid);
  for(var i=0;i<filename.length;i++)
  {
    if(req.body.userid == 'guest') {
      var mapid = 'guestmap';
      var pathid='/uploads';
      var mapversionid="something";
    }
    connect.storeImages('mongodb://localhost:27017/testimages',mapversionid,req.body.userid,mapid,"markerid",filename[i],pathid,function(message){
      console.log("Message"+message);
      if(message == "yes")
        return res.end("yes");
      else
        return res.end("no");
    })
  }
});

//User created markers save

app.post('/usermarkersave', function(req, res){
  var userid=req.body.userid;
  var mapid=req.body.mapname;
  var filename=req.body.filename;
  var lat=req.body.lat;
  var lon=req.body.lon;
  var date=new Date();
  var currenthours=date.getMinutes();
  var markerid=req.body.userid+currenthours;

  connect.addmarkers("mongodb://localhost:27017/testimages","someversion",markerid,userid,mapid,lat,lon, currenthours,filename,function(mssg){
    if(mssg!=undefined)
    {
      console.log("Retrived mssg"+mssg);
      if(mssg == "yes")
        return res.end("yes");
      else
        return res.end("no");
    }
  });


});

app.post('/traildescription', function (req,res) {
  //Trail description
  var username=req.body.name;
  var mapid=req.body.map;
  var trails=req.body.pathobj;
  var mode=req.body.mode;
  var coorarr=[];
  var temparr=trails.split(',');
  var src={};
  var des={};
  var descr=req.body.description;
  console.log("trails"+trails);
  for(var i=0;i<temparr.length;i++)
  {

    if(temparr[i].indexOf("(")>=0)
    {
      var tempstr=temparr[i].replace('(','');
      coorarr.push(parseFloat(tempstr));
    }else if(temparr[i].indexOf(')')>0)
    {
      var tempstr=temparr[i].replace(')','');
      coorarr.push(parseFloat(tempstr));
    }else
    {
      coorarr.push(parseFloat(temparr[i]));
    }

  }
  console.log(coorarr);
  var count=0;

  src.lon=coorarr[count];
  count=count+1;
  src.lat=coorarr[count];
  count=count+1;
  des.lon=coorarr[count];
  count=count+1;
  des.lat=coorarr[count];

  console.log(src.lat+"  "+src.lon);
  connect.updatetrail('mongodb://localhost:27017/testimages',username, mapid, src, des,descr,mode, function(msg){
    console.log("Returned "+msg);
    if(msg!=undefined)
    {
      if(msg == "done")
        return res.end("yes");
      else
        return res.end("no");
    }
  });
});

//Save trails for user's manual trails on the map page
app.post('/usertrailmanual', function(req, res){
  console.log("User trail manual Save");
  var username=req.body.userid;
  var mapid=req.body.mapname;
  var mode=req.body.mode;
  var paths=[];
  var path=req.body.path;
  var coorarr=[];
  var temparr=path.split(',');
  var desc=req.body.des;
  for(var i=0;i<temparr.length;i++)
  {

    if(temparr[i].indexOf("(")>=0)
    {
      var tempstr=temparr[i].replace('(','');
      coorarr.push(tempstr);
    }else if(temparr[i].indexOf(')')>0)
    {
      var tempstr=temparr[i].replace(')','');
      coorarr.push(tempstr);
    }else
    {
      coorarr.push(temparr[i]);
    }

  }




  //Create the trail array
  var finalarr=[];
  for(var i=0;i<coorarr.length;i=i+2)
  {
    var obj={};
    obj.lat=coorarr[i];
    obj.lon=coorarr[i+1];
    console.log("obj is"+obj);
    finalarr.push(obj);

  }
  var src = [];
  var dest = {};
  for(var i=0;i<finalarr.length;i++) {
    if (i == finalarr[i].length - 1) {
      dest.lon = finalarr[i].lon;
      dest.lat = finalarr[i].lat;
    } else {
      var tempsrc = {};
      tempsrc.lon = finalarr[i].lon;
      tempsrc.lat = finalarr[i].lat;
      src.push(tempsrc);
    }
  }


    connect.addtrails('mongodb://localhost:27017/testimages', username, mapid, src, dest,desc, mode, function (msg) {
      console.log("The msg is" + msg);
      if (msg != undefined) {
        if (msg == "yes")
          return res.end("yes");
        else
          return res.end("no");
      }
    });


});

app.post('/usertrailsave', function(req, res){
  console.log("In user trail Save");
  var marker=[];
  (req.body.markerobj).forEach(function(eve){
    console.log(eve);
    marker.push(eve);
  });
  var username=req.body.username;
  var mapname=req.body.map;
  var descp=req.body.description;
  var mode=req.body.mode;
  if(marker.length >1) {
    for (var i = 0; i < marker.length; i++) {
      console.log("I is" + i);
      var src = {};
      src.lon = marker[i].lon;
      src.lat = marker[i].lat;
      var dest = {};

      if((i+1)>= marker.length) {
        dest.lon = marker[i].lon;
        dest.lat = marker[i].lat;
      }else {
        dest.lon = marker[i + 1].lon;
        dest.lat = marker[i + 1].lat;
      }
      connect.addtrails('mongodb://localhost:27017/testimages', username, mapname, src, dest,descp,mode, function (msg) {
        console.log("The msg is" + msg);
        if (msg != undefined) {
          if (msg == "yes")
            return res.end("yes");
          else
            return res.end("no");
        }
      });
    }
  }else
  {
    return res.end("no");
  }

});


//** upload and save map coordinates
app.post('/mapupload', function(req,res){
  var flag=true;
  var date=new Date();
  var marker=[];
  var currenthours=date.getMinutes();
  (req.body.markerobj).forEach(function(eve){
    console.log(eve);
    marker.push(eve);
  });

  if(marker.length>0) {

    for(i=0;i<marker.length;i++)
    {
      var markerid=req.body.id+i+currenthours;
      console.log(marker[i]);
      connect.addmarkers("mongodb://localhost:27017/testimages","someversion",marker[i].id,req.body.id,req.body.name,marker[i].lat,marker[i].lon, marker[i].time,marker[i].filename,function(mssg){
      console.log(mssg);
        if(mssg!=undefined) {
          if (mssg == "yes")
            flag = true;
          else
            flag = false;
        }
      });
    }
    console.log("flag    "+flag);
    if(flag == true)
    {
      return res.end("yes");
    }
    else
      return res.end("no");
  }
  else {
    console.log("Empty");
    return res.end("no");
  }

});

//Handler for Map description edit
app.post('/mapdescriptionedit', function(req, res){
  console.log(req.body);
  var username=req.body.userid;
  var mapid=req.body.mapid;
  var newdes=req.body.text;
  console.log("In map description edit"+username+"  "+mapid);
  //Call MongoDb server
  connect.updateDescription("mongodb://localhost:27017/testimages",username, mapid,newdes,function(msg){
    if(msg!=undefined)
    {
      console.log("Retrived Message"+msg);
      if(msg == "done")
        return res.end("yes");
      else
        return res.end("no");
    }
  });

});

//Delete Map
app.post("/detelemap", function(req, res){

  var username=req.body.userid;
  var delmap=req.body.mapid;

  //Call mongodb delete all referneces to mongodb
  connect.deleteallmap("mongodb://localhost:27017/testimages", username, delmap, function(msg){
    if(msg!=undefined) {
      console.log("Retrived message" + msg);
      if(msg =="done")
      {
        return res.end("yes");
      }
      else
        return res.end("no");
    }
  });


});

//Handler for drag and drop
app.post('/dragdrop', function(req,res){
  console.log("In drag and drop"+userid);
  var form=new formidable.IncomingForm();
  form.multiple=true;
  form.uploadDir=path.join(__dirname,'/uploads');
  form.on('file',function(field,file){
    console.log("File Name"+file.name);
    fs.rename(file.path,path.join(form.uploadDir,file.name));
  });
  form.on('field', function(name,value){
    console.log("In Drag and Drop"+ name +"  "+ value);

    if(name == "mapname") {
      var obj=JSON.parse(value);
      console.log(obj['name']);
      var dir = __dirname + '/uploads/'+obj['user'];
      var actual=__dirname+'/uploads/'+obj['user']+'/'+obj['name'];
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
        if(!fs.existsSync(actual)){
          fs.mkdirSync(actual);
        }
      }
      else
      {
        if(!fs.existsSync(actual)){
          fs.mkdirSync(actual);
        }
      }
      //form.uploadDir=path.join(__dirname,'/uploads');
      form.uploadDir = actual;
    }else
    {
      if(name=="userobj"){
        //call data base to update mappings
        var obj=JSON.parse(value);
        var filenames=obj['filename'];
        var mapname=obj['mapname'];
        var userid=obj['id'];
        var uploadpath='/uploads/'+userid+'/' + mapname;
        var mapversion="something";
        console.log("The value of object user"+JSON.parse(value));
        console.log("The value of user pictures are"+obj['id']);
        //call database and update the database
          connect.storeImages("mongodb://localhost:27017/testimages",mapversion,userid,mapname,"markerid",filenames,uploadpath,0,0,function(msg){
            if(msg!=undefined)
            {
              if(msg == "yes"){
                console.log("Yay "+msg);
              }else
              {
                console.log("Could add to user database. Check");
              }
            }
          });
        }

    }

  });
  form.on('error',function(err){
    console.log("Error has ocurred");
    return res.end("no");
  });
  form.on('end',function(){
    res.send("yes");
  });

  form.parse(req);


});

app.post('/login',function(req,res){
  var username=req.body.name;
  var password=req.body.password;
  //Access MongoDB - see if user is authorized
  connect.verifyusers('mongodb://localhost:27017/testimages','usercollection',username, password,function(results){
    if(results!=undefined){
      console.log("fetched results"+ results);
      if(results == 'success')
      {
        //user present entered correct password allow login
        return res.end("success");

      }
      else
      {
        //Either username or password id incorrect disallow login
        return res.end("fail");

      }
    }
    else
      console.log("Fetched results were undefined");
  });

});



app.post('/mapsave', function(req, res){
  var mapname=req.body.name;
  var description=req.body.description;
  console.log("Name is  "+ mapname);
  var user=req.body.userid;
  //Call mongodb function and save the map
  connect.addmaps('mongodb://localhost:27017/testimages',user, mapname, description,function(msg){
    if(msg!=undefined){
      console.log("Map returned "+msg);
       if(msg == "add"){
         return res.end('yes');
       }
      else
         return res.end('no');
    }

  });
});

app.post('/viewmap', function(req,res){
  var userid=req.body.name;
  //call database and return
  connect.mapPresent('mongodb://localhost:27017/testimages',userid, function(msg){
    if(msg!=undefined){
      if(msg=="nothing"){
        return res.end("no");
      }
       else
      {
        return res.end("yes");
      }

    }
  });
});

//Save Images of registered users

app.post('/userimageupload', function(req,res){
  console.log("In registered user handler");
  var form=new formidable.IncomingForm();
  var mapname;
  var dir;
  var filenames;
  var uploaddir;
  form.multiple=true;
  form.on('field',function(name,value){
    console.log("Response  "+name+":"+value);
    if(name == "mapname") {
      var obj=JSON.parse(value);
      console.log(obj['name']);
      var dir = __dirname + '/uploads/'+obj['user'];
      var actual=__dirname+'/uploads/'+obj['user']+'/'+obj['name'];
      if (!fs.existsSync(dir)) {
       fs.mkdirSync(dir);
        if(!fs.existsSync(actual)){
          fs.mkdirSync(actual);
        }
      }
      else
      {
        if(!fs.existsSync(actual)){
          fs.mkdirSync(actual);
        }
      }
      //form.uploadDir=path.join(__dirname,'/uploads');
      form.uploadDir = actual;
    }else
    {
      if(name=="userobj"){
        //call data base to update mappings
        var obj=JSON.parse(value);
        var filenames=obj['filename'];
        var mapname=obj['mapname'];
        var userid=obj['id'];
        var uploadpath='/uploads/'+userid+'/' + mapname;
        var mapversion="something";

        //call database and update the database
        for(var i=0;i<filenames.length;i++)
        {
          console.log("The filename is"+filenames[i]);
          connect.storeImages("mongodb://localhost:27017/testimages",mapversion,userid,mapname,"markerid",filenames[i],uploadpath,0,0,function(msg){
            if(msg!=undefined)
            {
              if(msg == "yes"){
                console.log("Yay "+msg);
              }else
              {
                console.log("Could add to user database. Check");
              }
            }
          });
        }
      }
    }

  });

  form.on('file',function(field,file){
    console.log("File name"+file.path+"  "+path.join(form.uploadDir,file.name));
    fs.rename(file.path,path.join(form.uploadDir,file.name));
  });
  form.on('error',function(err){
    console.log("Error has ocurred");
    return res.end("no");
  });

  form.on('end',function(){
    res.send("yes");
  });

  form.parse(req);
});
//Save registered user details
app.post('/userdetailssave', function(req, res){
  console.log("Resgistered user details"+req.body);
  return res.end("yes");

});



//////*******************************START COMPUTER VISION*********************************************//////
//////*******************************START COMPUTER VISION*********************************************//////
//////*******************************START COMPUTER VISION*********************************************//////
//////*******************************START COMPUTER VISION*********************************************//////


//const detector = new SmileFaceDetector({smileScale: 1.01, smileNeighbor: 10});
//const detector = new SmileFaceDetector({smileScale: 1.01, smileNeighbor: 30});
  // Parameter specifying how much the image size is reduced at each image scale on face detection default: 1.05
  var faceScale=1.01;
  // Parameter specifying how many neighbors each candidate rectangle should have to retain it on face detection default: 8
  var faceNeighbor= 2;
  // Parameter specifying how much the image size is reduced at each image scale on smile detection default: 1.7
  var smileScale=1.01;
  // Parameter specifying how many neighbors each candidate rectangle should have to retain it on smile detection default: 22
  var smileNeighbor=2;
  //I will adapt the parameters as the dataset grows.

var COLOR = new Array();
COLOR['green']=[0, 255, 0];
COLOR['red']=[0,0,255];
COLOR['blue']=[255,0,0];

var thickness = 2; // default 1

var optsface= {scale:1.05, neighbors:8};
var optssmile= {scale:1.7, neighbors:22};
var optseye= {scale:1.5, neighbors:10};
var cv = require('opencv');

//const faceClassifier = new cv.CascadeClassifier(cv.FACE_CASCADE);
//const smileClassifier = new cv.CascadeClassifier('./node_modules/opencv/data/haarcascade_smile.xml');

app.post('/facesmiledetection',function(req,res){
    upload(req,res,function(err) {
      var userid = req.body.userid;
      var mapid= req.body.mapid;
      var mapdataversionid =  req.body.mapdataversionid;
      var markerid = req.body.markerid;
      var imagename= req.body.filename;
      var facevar=0;
      var smilevar=0;
      if(userid == "guest")
      {
         imagename=__dirname+'/uploads/guest';
         mapid="guestmap";
         mapdataversionid="guestid";
      };
      if(userid != "guest") {
      connect.getPictures('mongodb://localhost:27017/testimages',userid,mapid, function(imagename, imagepath,mapid){
        if(imagename!= undefined || imagepath!= undefined) {
          var imagename = imagename;
          var imagepath = path.join(__dirname,imagepath);
          console.log("Path is"+imagepath);


//Read Image
	cv.readImage(path.join(imagepath,imagename), function(err, im){
	  if (err) throw err;
	  if (im.width() < 1 || im.height() < 1) throw new Error('Image has no size');

//Detect Face
	  im.detectObject("./computerVision/data/haarcascade_frontalface_alt2.xml", {}, function(err,faces){
	    if (err) throw err;
		console.log(faces.length);
		if (faces.length>0){
	     console.log("found face!");
             var facevar = 1;

             connect.addface('mongodb://localhost:27017/testimages', imagename, userid,mapid,facevar,function(message){
             console.log("Message"+message);
             if(message == "yes")
             return res.end("yes");
             else
             return res.end("no");
             });

	};
    	for (var i = 0; i < faces.length; i++) {
   		face = faces[i];
      console.log(face);
      		im.rectangle([face.x, face.y], [face.width, face.height], COLOR['green'], 4);
			    im.save(path.join(imagepath,imagename)+'face-detection.png');
     		//im.save(path.join(imagepath, imagename)+'face-detection.png');
      		const halfHeight = parseInt(face.height / 2);
   //const faceImage = im.roi(face.x, face.y, face.width, face.height);
         const faceImage = im.crop(face.x, face.y, face.width, face.height);
//	faceImage.save(path.join(imagepath,imagename)+'image-detection.png');
      //	  img_gray.convertGrayscale();

//Detect Smile
		faceImage.detectObject("./computerVision/data/haarcascade_smile.xml",optssmile, function(err, smiles){
			if (err) throw err;
			for (var i = 0; i < smiles.length; i++) {
		        smile = smiles[i];
			//const smileImage = faceImage.crop(smile.x, smile.y,smile.width, smile.height);
			//smileImage.save('smile-detection.png');
                        im.rectangle([smile.x + face.x, smile.y+face.y], [smile.width, smile.height], COLOR['red'], 4);
		    im.save(path.join(imagepath,imagename)+'face-detection.png');
			  //  im.save(path.join(imagepath, imagename)+'face-detection.png');
		//faceImage.rectangle([smile.x,smile.y], [smile.width, smile.height], COLOR['red'], 4);
		//	    faceImage.save('image-detection.png');
			};
		console.log(smiles.length);

			if (smiles.length>0){
				console.log("found smiles!");
			             var smilevar = 1;
/*
			             connect.addface('mongodb://localhost:27017/testimages', imagename, userid,mapid,smilevar,function(message){
			             console.log("Message"+message);
			             if(message == "yes")
			             return res.end("yes");
			             else
			             return res.end("no");
			             })
*/
			};
    		});

// Detect Open Eyes
		faceImage.detectObject("./computerVision/data/haarcascade_eye.xml",optseye, function(err, eyes){
			if (err) throw err;
			for (var i = 0; i < eyes.length; i++) {
		        eye = eyes[i];
			//const eyeImage = faceImage.crop(eye.x, eye.y,eye.width, eye.height);

			//eyeImage.save('eye-detection.png');
                           im.rectangle([eye.x + face.x, eye.y+face.y], [eye.width, eye.height], COLOR['blue'], 4);
			//faceImage.rectangle([eye.x,eye.y], [eye.width, eye.height], COLOR['blue'], 4);
			   // im.save(path.join(imagepath,imagename)+'face-detection.png');
			 //   faceImage.save('image-detection.png');

			}
		console.log(eyes.length);
			if (eyes.length>1){
				console.log("found open eyes!");
			             var openeyesvar= 1;
/*
			             connect.addopeneyes('mongodb://localhost:27017/testimages', imagename, userid,mapid,openeyesvar,function(message){
			             console.log("Message"+message);
			             if(message == "yes")
			             return res.end("yes");
			             else
			             return res.end("no");
			             })
*/
			};
		});
		};
    console.log('Image saved to face-detection.png');
			});
		});


//Detect Kissing

var exec = require('child_process').exec, child;

child = exec('./kissdetector ' +path.join(imagepath,imagename) + ' ./computerVision/data/haarcascade_kiss.xml',
    function (error, stdout, stderr) {
        console.log('stdout: ' + stdout);
        console.log('stderr: ' + stderr);
	if (stdout>0) {
    console.log("found kiss!");
    var kissvar = 1;
    /*
     connect.addface('mongodb://localhost:27017/testimages', imagename, userid,mapid,kissvar,function(message){
     console.log("Message"+message);
     if(message == "yes")
     return res.end("yes");
     else
     return res.end("no");
     })
     */

    if (error !== null) {
      console.log('exec error: ' + error);
    }
    }
    });

//Blurred Detection


fs.readFile(path.join(imagepath,imagename), createImage);

function detectEdges(imageData) {
    var greyscaled, sobelKernel;

    if (imageData.width >= 360) {
        greyscaled = Filters.luminance(Filters.gaussianBlur(imageData, 5.0));
    } else {
        greyscaled = Filters.luminance(imageData);
    }
    sobelKernel = Filters.getFloat32Array(
        [1, 0, -1,
            2, 0, -2,
            1, 0, -1]);
    return Filters.convolve(greyscaled, sobelKernel, true);
}

// Reduce imageData from RGBA to only one channel (Y/luminance after conversion to greyscale)
// since RGB all have the same values and Alpha was ignored.
function reducedPixels(imageData) {
    var i, x, y, row,
        pixels = imageData.data,
        rowLen = imageData.width * 4,
        rows = [];

    for (y = 0; y < pixels.length; y += rowLen) {
        row = new Uint8ClampedArray(imageData.width);
        x = 0;
        for (i = y; i < y + rowLen; i += 4) {
            row[x] = pixels[i];
            x += 1;
        }
        rows.push(row);
    }
    return rows;
}

// pixels = Array of Uint8ClampedArrays (row in original image)
function detectBlur(pixels) {
    var x, y, value, oldValue, edgeStart, edgeWidth, bm, percWidth,
        width = pixels[0].length,
        height = pixels.length,
        numEdges = 0,
        sumEdgeWidths = 0,
        edgeIntensThresh = 20;

    for (y = 0; y < height; y += 1) {
        // Reset edge marker, none found yet
        edgeStart = -1;
        for (x = 0; x < width; x += 1) {
            value = pixels[y][x];
            // Edge is still open
            if (edgeStart >= 0 && x > edgeStart) {
                oldValue = pixels[y][x - 1];
                // Value stopped increasing => edge ended
                if (value < oldValue) {
                    // Only count edges that reach a certain intensity
                    if (oldValue >= edgeIntensThresh) {
                        edgeWidth = x - edgeStart - 1;
                        numEdges += 1;
                        sumEdgeWidths += edgeWidth;
                    }
                    edgeStart = -1; // Reset edge marker
                }
            }
            // Edge starts
            if (value == 0) {
                edgeStart = x;
            }
        }
    }

    if (numEdges === 0) {
        bm = 0;
        percWidth = 0;
    } else {
        bm = sumEdgeWidths / numEdges;
        percWidth = bm / width * 100;
    }

    return {
        width: width,
        height: height,
        num_edges: numEdges,
        avg_edge_width: bm,
        avg_edge_width_perc: percWidth
    };
}


function createImage(error, data) {
    if (error) {
        console.error('Unable to read image file!');
        throw error;
    }
    image = new Canvas.Image;
    image.onload = drawImageOnCanvas;
    image.src = data;
}

function drawImageOnCanvas() {
    var canvas = new Canvas(),
        context;

    canvas.width = image.width;
    canvas.height = image.height;
    context = canvas.getContext('2d');
    context.drawImage(image, 0, 0);

    showBlurScore(context.getImageData(0, 0, canvas.width, canvas.height));
}

function showBlurScore(imageData) {
    stats = detectBlur(reducedPixels(detectEdges(imageData)));
    console.log('Blur score:', Number((stats.avg_edge_width_perc).toFixed(2)));
    console.log(stats);
	var THRESHOLD = 0.85;
	if (Number((stats.avg_edge_width_perc).toFixed(2)) > THRESHOLD){
		console.log('Blurred Image!');
		var blurredvar=1;
/*
			             connect.addblurred('mongodb://localhost:27017/testimages', imagename, userid,mapid,blurredvar,function(message){
			             console.log("Message"+message);
			             if(message == "yes")
			             return res.end("yes");
			             else
			             return res.end("no");
			             })
*/

}

}
/////////////////////////End of Blurred Detection////////////////////////////////

//Dissimiliarity Detection
DISSIMTHRESH=25;
if (cv.ImageSimilarity === undefined) {
  console.log('port Features2d.cc to OpenCV 3!')
  process.exit(0);
}

cv.readImage("./testImages/car3.jpg", function(err, car1) {
  if (err) throw err;

  cv.readImage("./testImages/car3rotatedright.jpg", function(err, car2) {
    if (err) throw err;

    cv.ImageSimilarity(car1, car2, function (err, dissimilarity) {
      if (err) throw err;

      console.log('Dissimilarity: ', dissimilarity);
	if (dissimilarity < DISSIMTHRESH){
		console.log('Similar Images');
		var similarvar=1;
/*
			             connect.addblurred('mongodb://localhost:27017/testimages', imagename, userid,mapid,similarvar,function(message){
			             console.log("Message"+message);
			             if(message == "yes")
			             return res.end("yes");
			             else
			             return res.end("no");
			             })
*/
	};
    });

  });

});



//Nudity Detection


NUDTHRESHOLD=30;
var PythonShell = require('python-shell');

var options = {
args: [path.join(imagepath,imagename),NUDTHRESHOLD]
};

PythonShell.run('pornscanner.py',options, function (err, results) {
  if (err) throw err;
  console.log('results: %j', results);

if (results[2] == "False"){
console.log('Image is SFW')
}
else{
console.log('Image is NSFW')

var nudvar=1;
/*
			             connect.addnudity('mongodb://localhost:27017/testimages', imagename, userid,mapid,nudvar,function(message){
			             console.log("Message"+message);
			             if(message == "yes")
			             return res.end("yes");
			             else
			             return res.end("no");
			             })
*/

}
});

///////////////////

 		if(err) {
	        	    return res.end("Error uploading file.");
	        	};
		};

		});
	};
 });

});

//////*******************************END COMPUTER VISION*********************************************//////
//////*******************************END COMPUTER VISION*********************************************//////
//////*******************************END COMPUTER VISION*********************************************//////
//////*******************************END COMPUTER VISION*********************************************//////



//******** Socket Function to receive data *********

socket.on('connection',function(socket){
  socket.on('disconnect', function(){
   console.log("A user has disconnected");
  });

  socket.on('Latitude', function(msg){
    _Latid = msg;
    console.log("Latitude"+ msg);
  });

  socket.on('Longitude', function(msg){
    _Lngid = msg
   console.log("Longittude"+msg);
  });



  socket.on('UserData',function(msg){
    console.log("In user data function");
    user=msg.id;
    map=msg.mapid;
    console.log("The user is"+user+"  "+map);

  });

  /****outdated Function***/
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


  socket.on("LoadMarker",function(msg){
  //Access database and retrive markers
    var userid=msg.id;
    var maps=msg.mapid;
    //create the intitial trail database
    connect.getMarkers("mongodb://localhost:27017/testimages",userid,maps,function(lat,lng,time,filename, mapid){
      if(lat != undefined && lng != undefined) {
        console.log("Retrived   " + lat + "  " + lng);
        socket.emit("drawmarkers", {lat: lat, lng: lng, time:time, filename:filename, map:mapid});
      }
    });

  });

  socket.on("GetTrails", function(msg){
    console.log("In get trails");
    //Get the trails
    var userid=msg.id;
    var maps=msg.mapid;

    connect.getTrails("mongodb://localhost:27017/testimages",userid,maps,function(userid,mapid,src,des, description, mode){
      if(src != undefined && des != undefined) {
        console.log("Retrived for trails   " + src + "  " + des);
        socket.emit("drawtrails", {src: src, des: des, map:mapid});
      }
    });

  });

  socket.on('ImageGall', function(msg){
    console.log("Message received"+ msg.mapid);
    connect.getPictures("mongodb://localhost:27017/testimages", msg.userid, msg.mapid,function(picname, picpath, mapid){
      if(picname!=undefined && picpath!= undefined && mapid!= undefined) {
        console.log(picname + "  " + picpath + "   " + mapid);
        socket.emit("imagereturn", {picname: picname, picpath: picpath, mapid: mapid, userid:msg.userid});
      }
    });

  });

  socket.on('getmaps', function(msg){
     console.log('Message received'+msg.userid);
    connect.getMaps('mongodb://localhost:27017/testimages', msg.userid, function(mapname, mapdescription){
      if(mapname!=undefined && mapdescription!=undefined){
        console.log("Map description"+mapdescription);
        socket.emit('viewmaps', {name:mapname, description:mapdescription});
      }
    });
  });

});

http.listen(3030,function(){
  console.log("Working on port 3030");
});

//For Node to exit gracefully
process.on('SIGTERM', function(){
  http.close(function(){
    process.exit(0);
  });
});



