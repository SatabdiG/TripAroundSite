Instructions to use MongoDBLib js

Prerequisite:
1. Launch terminal : cmd in windows.
2. enter -> mongodb
3. enter -> mongo ( to launch mongo shell )
4. enter -> use testimages (name of database)
5. enter -> db.storedimages.insert({"filename":"exanything", "filepath":"something"})
storedimages is the collection
common commands:
db["storedimages"].find({}) -> lists all elements
db["storedimages"].find({filename:"exanythin}) -> lists row of exanythin
db["storedimages"].remove({filename:"exanythin})-> remove row of to exanythin
db["storedimages"].update({filename:"exanythin})-> update row of to exanythin
6. In server.js ->
create variable
var connect=require('./AdditionServerSide/MongoDbLib');
Now the two methods of MongoDBLib js can be accessed

connect.establishConnection(connectionstring, databasename,queryby, queryval,function(results)
1. connection string : full connection string to database -> mongodb://localhost:27017/testimage -> where testimage is database
2. databasename -> example testimages
3. queryby -> to query with a specific value. Enter null for everything
4. queryval -> to retrive a specific value of the relevant row. Enter null to retrive entire row
5. results -> contains retrived results

connect.addvalues(connectionstring, databasename, filename, filepath, callback)
1. connectionstring same as before
2. databasename: same as before
3. filename : For database schema ({"filename":"filenamevalue", "filepath":"filepath"}) enter value of filename
4. filepath: For database schema ({"filename":"filenamevalue", "filepath":"filepath"}) enter value of filepath


on successful entry -> Record added is displayed


