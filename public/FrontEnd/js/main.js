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


/*** Home page initializer **/
function homeinit(){
  $(document).ready(function(){
    $("#nextpagebutton").hover(function(){
      $("#nextpagebutton span").text("");
    }, function(){
      $("#nextpagebutton span").text(">");
    });

    $("#nextpagebutton").click(function(){
      window.location.href="#UploadImages";
    });
    $("#header").hover(function(){
      $("#header").fadeOut(500, function(){
        $(this).text("We make trips better").fadeIn(500);
        $(this).fadeOut(500,function () {
          $(this).text("TripAround").fadeIn(500);
        });

      });
    }, function(){});

  });
}

/** Image upload Controller function **/
function imagecontroller(){

  initialize();

  $(document).ready(function(){

    //Dropzone parameter change
    Dropzone.options.uploadForm ={
      paramName: "file"
    }
    $('input#submitbutton').click(function(event){
      event.preventDefault();
      var formdata=new FormData($("#uploadForm2")[0]);
      console.log(formdata);
      var data={};
      data.userid="guest";
      data.filename=$("#userphoto").val().split('\\').pop();
      data.files=$('#userphoto');
      //data.mapid="paris";
      //data.mapdataversionid="temp";
      //data.markerid="mapmarker";

      $.ajax({
        url:'/api/photo',
        type:'POST',
        data:JSON.stringify(data),
        contentType: 'application/json',
      }).done(function(data){
        console.log(data);
      });
    });

    $("#userphoto").on('change', function (event) {

      console.log("changed");
      var input=$("#userphoto").get(0).files;
      for(var i=0;i<input.length;i++)
      {
        EXIF.getData(input[0], function(){

          var lat=EXIF.getTag(this,"GPSLatitude");
          var lon=EXIF.getTag(this,"GPSLongitude");
          var latRef = EXIF.GPSLatitudeRef || "N";
          var lonRef = EXIF.GPSLongitudeRef || "W";
          if(lat == undefined || lon== undefined)
            alert("Sorry No Geo Tags present in images");
          else {
            lat = (lat[0] + lat[1] / 60 + lat[2] / 3600) * (latRef == "N" ? 1 : -1);
            lon = (lon[0] + lon[1] / 60 + lon[2] / 3600) * (lonRef == "W" ? -1 : 1);

            console.log("Latitide : " + lat);
            console.log("Longitude : " + lon);
            socket.emit('Latitude', lat);
            socket.emit('Longitude', lon);
            myCenter = new google.maps.LatLng(lat, lon);
            var marker = new google.maps.Marker({
              position: myCenter,
            });
            marker.setMap(map);
          }
        });

      }
    });


    $("#nextpagebutton").hover(function(){
      $("#nextpagebutton span").text("");
    }, function(){
      $("#nextpagebutton span").text(">");
    });

    $("#nextpagebutton").click(function(){
      window.location.href="#ViewImages";
    });

    $("#beforepagebutton").hover(function(){
      $("#beforepagebutton span").text("");
    }, function(){
      $("#beforepagebutton span").text("<");
    });

    $("#beforepagebutton").click(function(){
      window.location.href="#";
    });
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
  var markercoor=[];
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
  markercoor.push(marker);
  $('#something').hide();

  console.log(markercoor);
}

//code for product html
$("#menu-toggle").click(function(e){
  e.preventDefault();
  $("#wrapper").toggleClass("toggled");
});

/** Controller for Map Page **/
function imageupload() {

  $(document).ready(function(){
    $("#beforepagebutton").hover(function(){
      $("#beforepagebutton span").text("");
    }, function(){
      $("#beforepagebutton span").text("<");
    });
    $("#beforepagebutton").click(function(){
      window.location.href="#UploadImages";
    });
  });



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

function airplanehandler(){
  var startpos,startend;
  var path;
  console.log("In airplane loop");
  var flightPlanCoordinates = [
    {lat: 37.772, lng: -122.214},
    {lat: 21.291, lng: -157.821},
    {lat: -18.142, lng: 178.431},
    {lat: -27.467, lng: 153.027}
  ];

  map.addListener("click",function(event){
    var obj=[];
    map.setOptions({draggable: false});
    console.log(event.latLng);
    startpos=event.latLng.lat();
    startend=event.latLng.lng();
    var coors=new google.maps.LatLng(startpos,startend);
    var coorssum=new google.maps.LatLng(startpos+5,startend+5);
    map.panTo(coors);
    var tempobj= {lat: 37.772, lng: -122.214};
    obj.push(coors);
    obj.push(coorssum);
    console.log("obj"+obj);
     path=new google.maps.Polyline({
      path:obj,
      editable:true,
      map:map
    });
    if(path!=undefined) {
      path.addListener("click", function (event) {
        console.log("Dragging");
      });
    }
  });

  map.setOptions({draggable: true});

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
    .when('/viewmaps',{
      templateUrl:'/FrontEnd/partials/map.html',
      controller:'mapcontroller'
    })

    .when('/UploadImages',{
      templateUrl:'/FrontEnd/partials/imageupload.html',
      controller: 'imagecontroller'
  })

  .when('/ViewImages',{
    templateUrl:'/FrontEnd/partials/map.html',
    controller: 'mapcontroller'
  });


});


tripapp.controller('maincontroller',function($scope){
  $scope.init=homeinit();
  $scope.message="Hi there";

});

tripapp.controller('productcontroller', function($scope){
  $scope.init=initialize();
});

tripapp.controller('mapcontroller', function($scope){
  $scope.init=imageupload();

});

tripapp.controller('imagecontroller', function($scope){
$scope.init=imagecontroller();


});




