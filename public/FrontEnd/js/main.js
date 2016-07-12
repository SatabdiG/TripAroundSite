/**
 * Created by tasu on 04.07.16.
 * Description :  Code for interactive maps
 *
 */
var map;
var myCenter=new google.maps.LatLng(51.508742,-0.120850);
var marker;
var socket=io();
var renderlist=[];

//google.maps.event.addDomListener(window, 'load', initialize);
window.onload = function() {

  //Dropzone parameter change
  Dropzone.options.uploadForm ={
    paramName: "file"
  }

  $("#userphotoid").on('change', function (event) {

    console.log("changed");
    var input=$("#userphotoid").get(0).files;
    for(var i=0;i<input.length;i++)
    {
        EXIF.getData(input[0], function(){

        var lat=EXIF.getTag(this,"GPSLatitude");
        var lon=EXIF.getTag(this,"GPSLongitude");
        var latRef = EXIF.GPSLatitudeRef || "N";
        var lonRef = EXIF.GPSLongitudeRef || "W";
        lat = (lat[0] + lat[1]/60 + lat[2]/3600) * (latRef == "N" ? 1 : -1);
        lon = (lon[0] + lon[1]/60 + lon[2]/3600) * (lonRef == "W" ? -1 : 1);
        console.log("Latitide : "+lat);
        console.log("Longitude : "+ lon);
        socket.emit('Latitude', lat);
        socket.emit('Longitude',lon);
        myCenter=new google.maps.LatLng(lat,lon);
        var marker=new google.maps.Marker({
          position:myCenter,
        });

        marker.setMap(map);

      });

    }

  });

}


function initialize()
{
  var mapProp = {
    center:new google.maps.LatLng(51.508742,-0.120850),
    zoom:5,
    mapTypeId:google.maps.MapTypeId.ROADMAP
  };

  map=new google.maps.Map(document.getElementById("googleMap"),mapProp);

  overlay = new google.maps.OverlayView();
  overlay.draw = function() {};
  overlay.setMap(map);

}



//code for product html

$("#menu-toggle").click(function(e){
  e.preventDefault();
  $("#wrapper").toggleClass("toggled");
});


function imageupload() {
//Fetch images from Server using socketio
  socket.emit("LoadImage", "yes");

  var list=socket.on('ImageUploads',function(msg){
    var firstbreak=msg.split(",");
    var filename=firstbreak[0];
    var filepath=firstbreak[1];
    var currentdir=firstbreak[2];
    var locations=filepath.substr(currentdir.length,filepath.length);
    $("#imagethumb ul").append('<li><img src="'+locations+'/'+filename+'"class="img-thumbnail" alt="Cinque Terre" class="drag"></li>');
  });
   initialize();
  $("#drag").ready(function(){
    console.log("Ready");
    });

  $("#imagethumb ul li").on("click",function(){
    console.log("Works");
  });

 }


//end of the code for product html





//Angular js and Routing

var tripapp= angular.module('tripapp', ['ngRoute']);

tripapp.config(function($routeProvider) {
  $routeProvider
  .when('/', {
    templateUrl: '/FrontEnd/partials/home.html',
    controller: 'maincontroller'
  })

   .when('/uploadphotos', {
     templateUrl: '/FrontEnd/partials/imageupload.html',
    controller: 'productcontroller'
  })

    .when('/viewmaps',{
      templateUrl:'/FrontEnd/partials/map.html',
      controller:'mapcontroller'
    });


});


tripapp.controller('maincontroller',function($scope){
  $scope.message="Hi there";

})

tripapp.controller('productcontroller', function($scope){
  $scope.init=initialize();
})

tripapp.controller('mapcontroller', function($scope){
  $scope.init=imageupload();
})




