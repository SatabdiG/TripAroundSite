
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
  console.log("array "+coorarr);
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
          connect.storeImages("mongodb://localhost:27017/testimages",mapversion,userid,mapname,"markerid",filenames,uploadpath,0,0,"",function(msg){
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
  connect.verifyusers('mongodb://localhost:27017/testimages','usercollection',username, password,function(results, username){
    if(results!=undefined){
      console.log("fetched results"+ results);
      if(results == 'success')
      {
        //user present entered correct password allow login
        var data={};
        data.username=username;
        data.status="success";
        return res.end(JSON.stringify(data));

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
          connect.storeImages("mongodb://localhost:27017/testimages",mapversion,userid,mapname,"markerid",filenames[i],uploadpath,0,0,"", function(msg){
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

app.post('/updateimagedescription', function (req, res) {
  console.log("In image update description");
  var filename=req.body.filename;
  var username=req.body.username;
  var mapname=req.body.mapid;
  var desc=req.body.description;
  connect.updatePictures('mongodb://localhost:27017/testimages',username,mapname,filename, desc, function (msg) {
    if(msg!= undefined)
    {
      if(msg == "done")
      {
        console.log("ImageDescription updated"+ msg);
        return res.end("yes");
      }else
        return res.end("no");
    }

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
    //create the intitial trail database
    connect.getMarkers("mongodb://localhost:27017/testimages",userid,maps,function(lat,lng,time,filename, mapid, id){
      if(lat != undefined && lng != undefined) {
        console.log("Retrived   " + lat + "  " + lng);
        socket.emit("drawmarkers", {lat: lat, lng: lng, time:time, filename:filename, map:mapid, id:id});
      }
    });

  });

  socket.on("GetTrails", function(msg){
    console.log("In get trails");
    //Get the trails
    var userid=msg.id;
    var maps=msg.mapid;

    connect.getTrails("mongodb://localhost:27017/testimages",userid,maps,function(userid,mapid,src,des, description, mode){
      console.log("In get Trails");
      if(src != undefined || des != undefined ||mode != undefined ) {
        console.log("Retrived for trails   " + src.lat + "  " + des.lon+"  "+mode);
        socket.emit("drawtrails", {src: src, des: des, map:mapid, mode:mode, description:description});
      }
    });

  });

  socket.on('ImageGall', function(msg){
    console.log("Message received"+ msg.mapid);
    connect.getPictures("mongodb://localhost:27017/testimages", msg.userid, msg.mapid,function(picname, picpath, mapid, description, facevar, smilevar){
      if(picname!=undefined && picpath!= undefined && mapid!= undefined) {
        console.log(picname + "  " + facevar + "   " + mapid);
        socket.emit("imagereturn", {picname: picname, picpath: picpath, mapid: mapid, userid:msg.userid, description:description, facevar:facevar, smilevar:smilevar});
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



