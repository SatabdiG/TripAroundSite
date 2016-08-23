
var express	=	require("express");
var bodyParser =	require("body-parser");
var multer	=	require('multer');
var multerdragdrop = require('multer');
var multerguest=require('multer');
var path=require('path');
var app	= express();
var fs=require('fs');
var http=require("http").Server(app);
var socket=require("socket.io")(http);
var formidable=require('formidable');
app.use(bodyParser.json());


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
    connect.addmaps("mongodb://localhost:27017/testimages", req.body.name, req.body.id, function (mssg) {
      console.log("Fetched data  " + mssg);
      if (mssg != undefined) {
        if (mssg == "true")
           flag=true;
        else
          flag=false;
      }
    });
    for(i=0;i<marker.length;i++)
    {
      var markerid=req.body.id+i+currenthours;
      console.log(marker[i]);
      connect.addmarkers("mongodb://localhost:27017/testimages","someversion",marker[i].id,req.body.id,req.body.name,marker[i].lat,marker[i].lon, marker[i].filename,function(mssg){
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
//Handler for drag and drop
app.post('/dragdrop', function(req,res){
  console.log("In drag and drop"+req.body.userid);
  var form=new formidable.IncomingForm();
  form.multiple=true;
  form.uploadDir=path.join(__dirname,'/uploads');
  form.on('file',function(field,file){
    console.log("File Name"+file.name);
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
       if(msg == 'add'){
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
        console.log("The value of object user"+JSON.parse(value));
        console.log("The value of user pictures are"+obj['id']);
        //call database and update the database
        for(var i=0;i<filenames.length;i++)
        {
          connect.storeImages("mongodb://localhost:27017/testimages",mapversion,userid,mapname,"markerid",filenames[i],uploadpath,function(msg){
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



//******** Face Smile Detection *********
//******** Face Smile Detection *********
//******** Face Smile Detection *********


const SmileFaceDetector = require('./computerVision/SmileFaceDetector');
//const detector = new SmileFaceDetector({smileScale: 1.01, smileNeighbor: 10});


const detector = new SmileFaceDetector({
  // Parameter specifying how much the image size is reduced at each image scale on face detection default: 1.05 
  faceScale: 1.01,
  // Parameter specifying how many neighbors each candidate rectangle should have to retain it on face detection default: 8 
  faceNeighbor: 2,
  // Parameter specifying how much the image size is reduced at each image scale on smile detection default: 1.7 
  smileScale: 1.01,
  // Parameter specifying how many neighbors each candidate rectangle should have to retain it on smile detection default: 22 
  smileNeighbor: 2,
  //I will adapt the parameters as the dataset grows.
});


app.post('/facesmiledetection',function(req,res){
  console.log(JSON.stringify(req.body));
  console.log(JSON.stringify(req.body.files.context.location));
  console.log(JSON.stringify(req.body.userid));
  console.log(JSON.stringify(req.body.filename));
  console.log("User id"+__userid);
  console.log(filedata);
    upload(req,res,function(err) {
      var _userid = req.body.userid;
      var _mapid= req.body.mapid;
      var _mapdataversionid =  req.body.mapdataversionid;
      var _markerid = req.body.markerid;
      var _imagename= req.body.filename;
      if(__userid == "guest")
      {
        _imagename=__dirname+'/uploads/guest';
        _mapid="guestmap";
        _mapdataversionid="guestid";
      }
      if(__userid != "guest") {
        connect.retrievevalues('mongodb://localhost:27017/testimages', 'usercollection', _mapdataversionid, _markerid,_imagename, _imagepath,_userid,_mapid, function(message){


/// start detecting faces for each image.
detector.on('error', (error) => {
  console.error(error);
});
detector.on('face', (faces, image) => {
  console.log(faces);
  faces.forEach((face) => {
    console.log("found face!")  
    facevar=1;
  });
    connect.addface('mongodb://localhost:27017/testimages','storeimages',_mapdataversionid, _markerid,_imagename,_imagepath,_userid,_mapid,facevar,function(message){
      console.log("Message"+message);
      if(message == "yes")
        return res.end("yes");
      else
        return res.end("no");
    })

});
//start detecting smiles for each image.
detector.on('smile', (smiles, face, image) => {
  console.log(smiles);
  smiles.forEach((smile) => {
    console.log("found smile!")
    smilevar[i]=1;
  });
    connect.addface('mongodb://localhost:27017/testimages','storeimages',_mapdataversionid, _markerid,_imagename,_imagepath,_userid,_mapid,smilevar[i],function(message){
      console.log("Message"+message);
      if(message == "yes")
        return res.end("yes");
      else
        return res.end("no");
    })


});
detector.load(path.join(_imagepath,_imagename)).then((image) => {
  detector.detect(image);
}).catch((e) => {
  console.error(e);
});

  }
});



})
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
    connect.getMarkers("mongodb://localhost:27017/testimages",userid,maps,function(lat,lng){
      if(lat != undefined || lng != undefined) {
        console.log("Retrived   " + lat + "  " + lng);
        socket.emit("drawmarkers", {lat: lat, lng: lng});
      }
    });

  });

  socket.on('ImageGall', function(msg){
    console.log("Message received"+msg.userid + msg.mapid);
    connect.getPictures("mongodb://localhost:27017/testimages", msg.userid, msg.mapid,function(picname, picpath, mapid){
      console.log(picname+"  "+picpath+"   "+mapid);
      socket.emit("imagereturn", {picname:picname,picpath:picpath,mapid:mapid});
    });

  });

  socket.on('getmaps', function(msg){
     console.log('Message received'+msg.userid);
    connect.getMaps('mongodb://localhost:27017/testimages', msg.userid, function(msg){
      if(msg!=undefined){
        socket.emit('viewmaps', {name:msg});
      }
    });
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











