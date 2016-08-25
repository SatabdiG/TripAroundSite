var path=require('path');
var connect=require('./AdditionServerSide/MongoDbLib');


//******** Detection *********

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



/// start detecting faces for each image.
detector.on('error', (error) => {
  console.error(error);
});




detector.on('faceNum', (facesNum, image) => {
  console.log(facesNum);
	if (facesNum > 0){
    console.log("found face!")  
   facevar=1; 
}

/*
detector.on('face', (faces, image) => {
  console.log(faces);
  faces.forEach((face) => {
    console.log("found face!")  
    facevar=1;
  });
*/
    connect.addface('mongodb://localhost:27017/testimages','storeimages',_mapdataversionid, _markerid,_imagename,_imagepath,_userid,_mapid,facevar,function(message){
      console.log("Message"+message);
      if(message == "yes")
        return res.end("yes");
      else
        return res.end("no");
    })

});

//start detecting smiles for each image.
detector.on('smileNum', (smilesnum, image) => {
  console.log(smilesnum);
	if (smilesnum > 0){
    console.log("found smile!")  
   smilevar=1; 
}

/*
detector.on('smile', (smiles, face, image) => {
  console.log(smiles);
  smiles.forEach((smile) => {
    console.log("found smile!")
    smilevar=1;
  });
*/
    connect.addface('mongodb://localhost:27017/testimages','storeimages',_mapdataversionid, _markerid,_imagename,_imagepath,_userid,_mapid,smilevar,function(message){
      console.log("Message"+message);
      if(message == "yes")
        return res.end("yes");
      else
        return res.end("no");
    })


});

//start detecting smiles for each image.
detector.on('smileNum', (smilesnum, image) => {
  console.log(smilesnum);
	if (smilesnum > 0){
    console.log("found smile!")  
   smilevar=1; 
}

/*
detector.on('smile', (smiles, face, image) => {
  console.log(smiles);
  smiles.forEach((smile) => {
    console.log("found smile!")
    smilevar=1;
  });
*/
    connect.addface('mongodb://localhost:27017/testimages','storeimages',_mapdataversionid, _markerid,_imagename,_imagepath,_userid,_mapid,smilevar,function(message){
      console.log("Message"+message);
      if(message == "yes")
        return res.end("yes");
      else
        return res.end("no");
    })


});
//start detecting smiles for each image.
detector.on('smileNum', (smilesnum, image) => {
  console.log(smilesnum);
	if (smilesnum > 0){
    console.log("found smile!")  
   smilevar=1; 
}

/*
detector.on('smile', (smiles, face, image) => {
  console.log(smiles);
  smiles.forEach((smile) => {
    console.log("found smile!")
    smilevar=1;
  });
*/
    connect.addface('mongodb://localhost:27017/testimages','storeimages',_mapdataversionid, _markerid,_imagename,_imagepath,_userid,_mapid,smilevar,function(message){
      console.log("Message"+message);
      if(message == "yes")
        return res.end("yes");
      else
        return res.end("no");
    })


});
//start detecting smiles for each image.
detector.on('smileNum', (smilesnum, image) => {
  console.log(smilesnum);
	if (smilesnum > 0){
    console.log("found smile!")  
   smilevar=1; 
}

/*
detector.on('smile', (smiles, face, image) => {
  console.log(smiles);
  smiles.forEach((smile) => {
    console.log("found smile!")
    smilevar=1;
  });
*/
    connect.addface('mongodb://localhost:27017/testimages','storeimages',_mapdataversionid, _markerid,_imagename,_imagepath,_userid,_mapid,smilevar,function(message){
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


