
'use strict';
const opencv = require('opencv');
const EventEmitter = require('events');
const path = require('path');

const greenColor = [0, 255, 0];
const blueColor = [255, 0, 0];
const redColor = [0, 0, 255];
const rectThickness = 2;
const faceClassifier = new opencv.CascadeClassifier(opencv.FACE_CASCADE);
const smileClassifier = new opencv.CascadeClassifier(path.join(__dirname, './data/haarcascade_smile.xml'));
const eyeClassifier = new opencv.CascadeClassifier(path.join(__dirname, './data/haarcascade_eye.xml'));
const kissClassifier = new opencv.CascadeClassifier(path.join(__dirname, './data/kiss_cascade.xml'));
const lefteyeClassifier = new opencv.CascadeClassifier(path.join(__dirname, './data/haarcascade_lefteye_2splits.xml'));
const righteyeClassifier = new opencv.CascadeClassifier(path.join(__dirname, './data/haarcascade_righteye_2splits.xml'));


const defaultFaceScale = 1.05;
const defaultFaceNeighbor = 8;
const defaultSmileScale = 1.7;
const defaultSmileNeighbor = 22;
const defaulteyeScale = 1.7;
const defaulteyeNeighbor = 22;
const defaultlefteyeScale = 1.7;
const defaultlefteyeNeighbor = 22;
const defaultrighteyeScale = 1.7;
const defaultrighteyeNeighbor = 22;


const defaultkissScale = 1.7;
const defaultkissNeighbor = 22;

this.lefteyeScale, this.lefteyeNeighbor
class SmileFaceDetector extends EventEmitter {

  constructor(obj) {
    super();
    if (!obj) obj = {};
    this.faceScale = obj.faceScale || defaultFaceScale;
    this.faceNeighbor = obj.faceNeighbor || defaultFaceNeighbor;
    this.smileScale = obj.smileScale || defaultSmileScale;
    this.smileNeighbor = obj.smileNeighbor || defaultSmileNeighbor;

    this.eyeScale = obj.eyeScale || defaulteyeScale;
    this.eyeNeighbor = obj.eyeNeighbor || defaulteyeNeighbor;

    this.lefteyeScale = obj.lefteyeScale || defaultlefteyeScale;
    this.lefteyeNeighbor = obj.lefteyeNeighbor || defaultlefteyeNeighbor;
    this.righteyeScale = obj.righteyeScale || defaultrighteyeScale;
    this.righteyeNeighbor = obj.righteyeNeighbor || defaultrighteyeNeighbor;

    this.kissScale = obj.kissScale || defaultkissScale;
    this.kissNeighbor = obj.kissNeighbor || defaultkissNeighbor;



  }

  load(image) {
    return new Promise((resolve, reject) => {
      opencv.readImage(image, (err, image) => {
        if (image.width() < 1 || image.height() < 1) throw new Error('Image has no size');
	image.resize(600, 500, function(err, image){
		if (err) throw err;
	});
        if (err) return reject(err);
        resolve(image);
      });
    });
  }

detect(image){
  image.detectObject(opencv.FACE_CASCADE, {}, function(err, faces){
  //image.detectObject("./data/haarcascade_frontalface_alt.xml", {}, function(err, faces){
    if (err) {
            this.emit('error', err);
          }
             // for (var i = 0; i < faces.length; i++){
   //   var face = faces[i];
        faces.forEach((face, faceIndex) => {
        	const halfHeight = parseInt(face.height / 2);
        	const faceImage = image.roi(face.x, face.y + halfHeight, face.width, halfHeight);	
		var facenum = faces.length
	
        	if (faces && faces.length) {
        		  this.emit('faceNum', facesnum, image);
        	}
  smileClassifier.detectMultiScale(faceImage, (err, smiles) => {
     if (err) {
            this.emit('error', err);
          }
	var smilesnum = smiles.length
        if (smiles && smiles.length) {
            this.emit('smileNum', smilesnum, face, image);
          }
        }, this.smileScale, this.smileNeighbor, face.width/4, face.height/4);

/*
 eyeClassifier.detectMultiScale(faceImage, (err, eyes) => {
     if (err) {
            this.emit('error', err);
          }
	var eyesnum = eyes.length
        if (eyes && eyes.length) {
            this.emit('eyeNum', eyesnum, face, image);
          }
        }, this.eyeScale, this.eyeNeighbor, face.width/4, face.height/4);

 lefteyeClassifier.detectMultiScale(faceImage, (err, lefteyes) => {
     if (err) {
            this.emit('error', err);
          }
	var lefteyesnum = lefteyes.length
        if (lefteyes && lefteyes.length) {
            this.emit('lefteyeNum', lefteyesnum, face, image);
          }
        }, this.lefteyeScale, this.lefteyeNeighbor, face.width/4, face.height/4);


 righteyeClassifier.detectMultiScale(faceImage, (err, righteyes) => {
     if (err) {
            this.emit('error', err);
          }
	var righteyesnum = righteyes.length
        if (righteyes && righteyes.length) {
            this.emit('righteyeNum', righteyesnum, face, image);
          }
        }, this.righteyeScale, this.righteyeNeighbor, face.width/4, face.height/4);
    }, this.faceScale, this.faceNeighbor);

  image.detectObject("./data/kiss_cascade.xml", {}, function(err, kisses){
    if (err) {
            this.emit('error', err);
          }
		var kissnum = kisss.length
        	if (kisss && kisss.length) {
        		  this.emit('kissNum', kisssnum, image);
        	}
    }, this.kissScale, this.kissNeighbor);
*/

}

/*
  detect(image) {
    faceClassifier.detectMultiScale(image, (err, faces) => {
      if (err) this.emit('error', err);
      faces.forEach((face, faceIndex) => {
        const halfHeight = parseInt(face.height / 2);
        const faceImage = image.roi(face.x, face.y + halfHeight, face.width, halfHeight);
        faceImage.convertGrayscale();
        faceImage.equalizeHist();
        if (faces && faces.length) {
          this.emit('face', faces, image);
        }
        smileClassifier.detectMultiScale(faceImage, (err, smiles) => {
          if (err) {
            this.emit('error', err);
          }
          if (smiles && smiles.length) {
            this.emit('smile', smiles, face, image);
          }
        }, this.smileScale, this.smileNeighbor, face.width/4, face.height/4);
      });
    }, this.faceScale, this.faceNeighbor);
  }
*/

  drawRectangle(rects, color) {
    const rectangles = !Array.isArray(rects) ? [rects] : rects;
    rectangles.forEach((rect) => {
      image.rectangle([rect.x, rect.y], [rect.width, rect.height], color, rectThickness);
    });
  }

  getImage() {
    return image;
  }
}

SmileFaceDetector.red = redColor;
SmileFaceDetector.green = greenColor;
SmileFaceDetector.blue = blueColor;

module.exports = SmileFaceDetector;

