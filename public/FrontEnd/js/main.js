/**
 * Created by tasu on 04.07.16.
 * Description :  Code for interactive maps
 *
 */
var map;
var myCenter=new google.maps.LatLng(51.508742,-0.120850);
var marker;
var socket=io();

google.maps.event.addDomListener(window, 'load', initialize);
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

  var marker=new google.maps.Marker({
    position:myCenter,
  });

  marker.setMap(map);

}


//code for product html

$("#menu-toggle").click(function(e){
  e.preventDefault();
  $("#wrapper").toggleClass("toggled");
});



//end of the code for product html





//Angular js and Routing

var tripapp= angular.module('tripapp', ['ngRoute']);
var product=angular.module('product', ['ngRoute']);
tripapp.config(function($routeProvider) {
  $routeProvider
  .when('/', {
    templateUrl: '/FrontEnd/partials/home.html',
    controller: 'maincontroller'
  })
    .when('/product',{
      templateUrl:'/FrontEnd/partials/product.html',
      controller: 'productcontroller'
    })
  .when('/uploadphotos',{
    templateUrl:'/FrontEnd/partials/imageupload.html',
    controller:'productcontroller'
  })

});

product.config(function($routeProvider){
  $routeProvider
    .when('/',{
      templateUrl:'/FrontEnd/partials/product.html',
      controller:'productcontroller'
    })
});

tripapp.controller('maincontroller',function($scope){
  $scope.message="Hi there";
})

product.controller('productcontroller', function($scope){
  $scope.message="Working";
})




