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
    var temp;
    var results;

    mongodb.connect(connectionstring, function (err, db) {
      if (callback) {
        callback();
      }


      if (!err) {

        if (queryby == null)
          var cursor = db.collection(databasename).find({});
        else
          var cursor = db.collection(databasename).find(queryby);

        cursor.each(function (err, doc) {

          if (queryval == null) {
            if (doc != null) {
              results=doc;
            }
          }
          else {
            if (doc != null) {
              results=doc.filename;
            }
          }
          callback(results);

        });


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
        db.collection('storedimages').insert({"filename":filename,"filepath":filepath},{w:1},function(err,records){

          if(records!=null) {
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


  }
}


