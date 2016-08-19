/**
 * Created by tasu on 07.07.16.
 */
/*** Name : MongoDB library
/*** Description: Written for node module. Needs to be included in the main node entry point code
 * Established connection. Adds files. Querys data
 * Dependencies : The database should exist. The collection should exist. The connection string should be allright
 */



var mongodb = require('mongodb').MongoClient;


module.exports= {
  establishConnection: function (connectionstring, databasename, queryby, queryval, callback) {
    var filenames = [];
    var filepaths = [];
    var results;

    mongodb.connect(connectionstring, function (err, db) {
      if (callback) {
        callback();
      }
      if (!err) {
        var cursor = db.collection(databasename).find();
        cursor.each(function (err, doc) {
          if (doc != null) {
            callback(doc.filename + "," + doc.filepath);
          }
        })
      }
      else
        console.log("Error happened");
    });
  },
  getMarkers:function(connectionstring, userid,mapid, callback){
  if(callback)
    callback();
    console.log("UserID"+userid);
    mongodb.connect(connectionstring,function(err,db){
      if(!err){
        var cursor=db.collection('markercollection').find({"userid":userid, "mapid":mapid});
        cursor.each(function(err,doc){
          if(doc!=null)
          {
            callback(doc.Lat,doc.Lng,doc.time,doc.filename, doc.mapid);
          }
        });

      }
    });
  },

  getPictures:function(connectionstring, userid,mapid, callback){
    if(callback)
      callback();
    console.log("UserID"+userid+"MapId"+mapid);
    mongodb.connect(connectionstring,function(err,db){
      if(!err){
        var cursor=db.collection('picturescollection').find({"userid":userid, "mapid":mapid});
        cursor.each(function(err,doc){
          if(doc!=null)
          {
            console.log("Document"+doc);
            callback(doc.picname,doc.picpath,doc.mapid);
          }
        });

      }
    });
  },

  getMaps:function(connectionstring, userid, callback){
    if(callback)
      callback();
    console.log("UserID"+userid);
    mongodb.connect(connectionstring,function(err,db){
      if(!err){
        var cursor=db.collection('mapcollection').find({"userid":userid});
        cursor.each(function(err,doc){
          if(doc!=null)
          {
            console.log(doc);
            callback(doc.mapname, doc.mapdescription);
          }
        });

      }
    });
  },

  verifyusers:function (connectionstring, databasename, queryby, queryval, callback) {
    mongodb.connect(connectionstring, function (err, db) {
      if (callback) {
        callback();
      }
      if (!err) {
        var cursor = db.collection(databasename).find({"userid": queryby});
            cursor.each(function (err, doc) {
              if (doc != null) {
                console.log("Password  "+doc.userpassword);
                if(doc.userpassword == queryval) {

                  return callback("success");

                }
                else {
                  return callback("fail");
                }
              }
            })
      }
      else
        console.log("Error happened");
    });

  },
  //First check to see if user is already present
  userPresent:function(connectionstring,userid, callback){
    if (callback) {
      callback();
    }

    mongodb.connect(connectionstring, function (err, db) {
      var collec = db.collection('usercollection');
       if (collec != null) {
        var tempsur = db.collection('usercollection').count({userid: userid}, function(err, count){
          if(!err){
            console.log("User present "+ count);
            if(count>0){
              return callback("present");
            }
            else
              return callback("nothing");
          }
        });

      }
    });
  },

  mapPresent:function(connectionstring,userid, callback){
    if (callback) {
      callback();
    }
    mongodb.connect(connectionstring, function (err, db) {
      var collec = db.collection('mapcollection');
      if (collec != null) {
        var tempsur = db.collection('mapcollection').count({userid: userid}, function(err, count){
          if(!err){
            console.log("User present "+ count);
            if(count>0){
              return callback("present");
            }
            else
              return callback("nothing");
          }
        });

      }
    });
  },
  //Save Maps to database
  addmaps:function (connectionstring,userid, mapname, mapdescription, callback) {

    if (callback) {
      callback();
    }

    mongodb.connect(connectionstring, function (err, db) {
      var collec = db.collection('usercollection');
      var flag=0;
      if (collec != null) {
        console.log("Flag " + flag);
        db.collection('mapcollection').insert({
          "userid": userid,
          "mapname": mapname,
          "mapdescription": mapdescription
        }, {w: 1}, function (err, records) {

          if (records != null) {
            console.log("Map record added");
            db.close();
            return callback("add");

          }
          else {

            console.log("Mapp Cannot add");
            return callback('err');
          }
        });

      }
      else {
        console.log("Database not found! error");
      }

    });
  },
  //Add users to database
  addusers: function (connectionstring,userid, username, userpassword, callback) {
  if (callback) {
    callback();
  }

  mongodb.connect(connectionstring, function (err, db) {
    var collec = db.collection('usercollection');
    var flag=0;
    if (collec != null) {
      console.log("Flag " + flag);
      db.collection('usercollection').insert({
        "userid": userid,
        "username": username,
        "userpassword": userpassword
      }, {w: 1}, function (err, records) {

        if (records != null) {
          return callback("add");
          console.log("User Record added");
          db.close();
        }
        else {

          console.log("User Cannot add");
          return callback('err');
        }
      });

      }
      else {
        console.log("Database not found! error");
      }

  });
},

  storeImages: function (connectionstring, mapdataversionid, userid,mapid, markerid,picname,picpath,callback) {
    if (callback) {
      callback();
    }
    mongodb.connect(connectionstring, function (err, db) {
      var collec = db.collection('picturescollection');
      if (collec != null) {
        db.collection('picturescollection').insert({
          "mapdataversionid": mapdataversionid,
          "mapid": mapid,
          "userid": userid,
          "markerid":markerid,
          "picname":picname,
          "picpath":picpath
        }, {w: 1}, function (err, records) {
          if (records != null) {
            console.log("Map Data Version Record added");
            callback("yes");
            db.close();
          }
          else{
            console.log("Map Data Version Cannot add");
            callback("no");
          }
        });

      }
      else {
        console.log("Database not found! error");
      }
    });
  },


addmapversion: function (connectionstring, databasename,_mapdataversionid, _userid,_mapid, callback) {


  if (callback) {
    callback();
  }
  mongodb.connect(connectionstring, function (err, db) {

    var collec = db.collection(databasename);
    if (collec != null) {
      db.collection('mapdataversioncollection').insert({
        "_mapdataversionid": _mapdataversionid,
        "mapid": _mapid,
        "userid": _userid
      }, {w: 1}, function (err, records) {

        if (records != null) {
          console.log("Map Data Version Record added");
          db.close();
        }
        else
          console.log("Map Data Version Cannot add");
      });

    }
    else {
      console.log("Database not found! error");
    }
  });
},

addmarkers: function (connectionstring,mapdataversionid,markerid,userid,mapid,Latid,Lngid,time,filename, callback) {
  if (callback) {
    callback();
  }
  mongodb.connect(connectionstring, function (err, db) {

    var collec = db.collection('markercollection');
    if (collec != null) {
      db.collection('markercollection').insert({
        "mapdataversionid": mapdataversionid,
        "markerid": markerid,
        "userid": userid,
        "mapid": mapid,
        "Lat": Latid,
        "Lng": Lngid,
        "time":time,
        "filename":filename
     }, {w: 1}, function (err, records) {

        if (records != null) {
          callback("yes");
          console.log("Marker Record added");
          db.close();
        }
        else {
          console.log("Marker Cannot add");
          callback("no");
        }
      });

    }
    else {
      console.log("Database not found! error");
    }
  });
},
addvalues: function (connectionstring,mapdataversionid, imagename, imagepath,userid,mapid,  callback) {


    if (callback) {
      callback();
    }
    mongodb.connect(connectionstring, function (err, db) {

      var collec = db.collection('storedimages');
      if (collec != null) {
        db.collection('storedimages').insert({
          "mapdataversionid": mapdataversionid,
          "imagename": imagename,
          "imagepath": imagepath,
          "userid": userid,
          "mapid": mapid
        }, {w: 1}, function (err, records) {

          if (records != null) {
            console.log("Image Record added");
            callback("yes");
            db.close();
          }
          else {
            callback("no");
            console.log("Image Cannot add");
          }
        });

      }
      else {
        console.log("Database not found! error");
      }
    });
  },
retrievevalues: function ( connectionstring, databasename, mapdataversionid, markerid,_imagename, _imagepath,_userid,_mapid, callback) {
      if (callback) {
        callback();
      }
      mongodb.connect(connectionstring, function (err, db) {

        var collec = db.collection('picturescollection');
        if (collec != null) {
          db.collection('picturescollection').find({
            "mapdataversionid": mapdataversionid,
            "markerid": markerid,
            "imagename": _imagename,
            "imagepath": _imagepath,
            "userid": _userid,
            "mapid": _mapid
          },{w:1},function(err,records){
            if(records!=null) {
              console.log("Image Record retrieved");
              db.close();
            }
            else
              console.log("Image Cannot retrieve");
          });

        }
        else {
          console.log("Database not found! error");
        }
      });
    }



}


