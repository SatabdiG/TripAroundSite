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
    var filenames=[];
    var filepaths=[];
    var results;

    mongodb.connect(connectionstring, function (err, db) {
      if (callback) {
        callback();
      }
      if (!err) {
          var cursor=db.collection(databasename).find();
          cursor.each(function(err,doc){
            if(doc!=null) {
              callback(doc.filename+","+doc.filepath);
            }
          })
      }
      else
        console.log("Error happened");
    });
  },
  addvalues: function (connectionstring, databasename, filename, filepath, callback) {
    if (callback) {
      callback();
    }
    mongodb.connect(connectionstring, function (err, db) {

      var collec = db.collection(databasename);
      if (collec != null) {
        db.collection('storedimages').insert({
          "filename": filename,
          "filepath": filepath
        }, {w: 1}, function (err, records) {

          if (records != null) {
            console.log("Record added");
            db.close();
          }
          else
            console.log("Cannot add");
        });

      }
      else {
        console.log("Database not found! error");
      }
    });
  },

    retrievevalues: function ( connectionstring, databasename, filename, filepath, callback) {
      if (callback) {
        callback();
      }
      mongodb.connect(connectionstring, function (err, db) {

        var collec = db.collection(databasename);
        if (collec != null) {
          db.collection('storedimages').find({"filename":filename,"filepath":filepath},{w:1},function(err,records){
            if(records!=null) {
              console.log("Record retrieved");
              db.close();
            }
            else
              console.log("Cannot retrieve");
          });

        }
        else {
          console.log("Database not found! error");
        }
      });
    }
}


