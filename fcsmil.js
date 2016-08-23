
var path=require('path');

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
      var facevar[i]=0;
      var smilevar[i]=0;	
    }

detector.on('error', (error) => {
  console.error(error);
});
detector.on('face', (faces, image) => {
  console.log(faces);
  //facevar=0;
  faces.forEach((face) => {
    // write rectangle
    //image.rectangle([face.x, face.y], [face.width, face.height], SmileFaceDetector.green, 2);
    console.log("found face!")  //put a variabl here
    facevar[i]=1;
  });
    connect.addface('mongodb://localhost:27017/testimages','storeimages',mapversionid,filename[i],pathid,req.body.userid,mapid,facevar[i],function(message){
      console.log("Message"+message);
      if(message == "yes")
        return res.end("yes");
      else
        return res.end("no");
    })

});
detector.on('smile', (smiles, face, image) => {
  console.log(smiles);
  //smilevar[i]=0;
  smiles.forEach((smile) => {
    //image.rectangle([smile.x + face.x, smile.y + face.height/2 + face.y], [smile.width, smile.height], SmileFaceDetector.blue, 2);
    console.log("found smile!") // put a variable here
    smilevar[i]=1;
  });
    connect.addface('mongodb://localhost:27017/testimages','storeimages',mapversionid,filename[i],pathid,req.body.userid,mapid,smilevar[i],function(message){
      console.log("Message"+message);
      if(message == "yes")
        return res.end("yes");
      else
        return res.end("no");
    })

//  image.save('/home/majid/gitReps/TripAroundSite/uploads/Lenna_r.png');
});
detector.load(path.join(pathid,filename[i])).then((image) => {
  detector.detect(image);
}).catch((e) => {
  console.error(e);
});

  }
});






/*

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


detector.on('error', (error) => {
  console.error(error);
});
detector.on('face', (faces, image) => {
  console.log(faces);
  faces.forEach((face) => {
    // write rectangle
    image.rectangle([face.x, face.y], [face.width, face.height], SmileFaceDetector.green, 2);
	console.log("found face!")
  });
});
detector.on('smile', (smiles, face, image) => {
  console.log(smiles);
  smiles.forEach((smile) => {
    //image.rectangle([smile.x + face.x, smile.y + face.height/2 + face.y], [smile.width, smile.height], SmileFaceDetector.blue, 2);
	console.log("found smile!")
  });
  image.save('/home/majid/gitReps/TripAroundSite/uploads/Lenna_r.png');
});
detector.load('/home/majid/gitReps/TripAroundSite/uploads/Lenna.png').then((image) => {
  detector.detect(image);
}).catch((e) => {
  console.error(e);
});

*/
