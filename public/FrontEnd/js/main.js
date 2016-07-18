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
var overlay;
var src;




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

function placemarker(location){
  console.log("In place marker"+location);
  var marker=new google.maps.Marker({
    position:location,
  });
  marker.setMap(map);
  marker.addListener('click',function () {
    console.log(src);
    $('#image-container').append('<img class="imageholder" src="'+src+'"</img>');
    $('#myModal').modal('show');

  });
  $('#something').hide();
}

//code for product html

$("#menu-toggle").click(function(e){
  e.preventDefault();
  $("#wrapper").toggleClass("toggled");
});


function imageupload() {

  $('#something').hide();

  //Fetch images from Server using socketio
  socket.emit("LoadImage", "yes");

  var list=socket.on('ImageUploads',function(msg){
    var firstbreak=msg.split(",");
    var filename=firstbreak[0];
    var filepath=firstbreak[1];
    var currentdir=firstbreak[2];
    var locations=filepath.substr(currentdir.length,filepath.length);
    src=locations+'/'+filename;
    if($("#thumbnail li").length == 0)
      $("#thumbnail").append('<li><img src="'+locations+'/'+filename+'"class="img-thumbnail" alt="Cinque Terre" ></li>');

    //$("#thumbnail").append('<li id="dragged">Hell There</li>')
    });
    initialize();
    var temp=document.getElementById("thumbnail");
    $('#thumbnail').on('click','li',function(){
       console.log("Clicked");
      if($('#something').is(':visible'))
       $('#something').hide();
      else
        $('#something').show();

    });
    $('#something').draggable({
      revert: true
    });

    $('#something').on('dragstop',function(evt,ui){
      console.log(ui);
      var mOffset=$(map.getDiv()).offset();
      var point=new google.maps.Point( ui.offset.left-mOffset.left+(ui.helper.width()/2),ui.offset.top-mOffset.top+(ui.helper.height()));
      var ll=overlay.getProjection().fromContainerPixelToLatLng(point);
      console.log("ll:"+ll);
      placemarker(ll);
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
    })

    .when('/UploadImages',{
      templateUrl:'/FrontEnd/partials/imageupload.html',
      controller: 'productcontroller'
  })

  .when('/ViewImages',{
    templateUrl:'/FrontEnd/partials/map.html',
    controller: 'mapcontroller'
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




