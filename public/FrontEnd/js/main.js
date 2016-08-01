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
var userid;
var password;
var markers=[];

/*** Home page initializer **/
function homeinit(){
  userid="";
  password="";
  $(document).ready(function(){
    $('#guestlink').click(function(event){
      console.log("Guest link click");
      event.preventDefault();
      userid="guest";
      window.location.href="#UploadImages";
    });
    $('input#usersub').click(function(event) {
      event.preventDefault();
      var data = {};
      data.name = $('#usr').val();
      data.password = $('#pass').val();
      console.log(data);

      $.ajax({
        url: '/login',
        type: 'POST',
        data: JSON.stringify(data),
        contentType: 'application/json'
      }).done(function (data) {
        console.log("Browser Data"+data);
        if(data != "fail")
        {
          console.log("Successful Login");
          userid=data.name;
          password=data.password;
          window.location.href="#UploadImages";
        }
        else
        {
          console.log("Wrong cred");
          $('#usertext').text("The user id or password is wrong. Please re-enter!!");
          $('#usertext').css({'color':'red'});
          $('#usr').val('');
          $('#pass').val('');

        }
      });
    });
    /*
    $("#nextpagebutton").hover(function(){
      $("#nextpagebutton span").text("");
    }, function(){
      $("#nextpagebutton span").text(">");
    });

    $("#nextpagebutton").click(function(){
      window.location.href="#UploadImages";
    });*/

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
  var markercollec=[];
  var markerobj={};
  var markers=[];
  var picobj={};
  var maps={};
  console.log("User logged in as" + userid);
  initialize();
  $(document).ready(function(){
    //Dropzone parameter change
    var mydropzone=new Dropzone("div#someid", {url: "/dragdrop"});
    $('input#dragdropbutton').click(function(evt){
      evt.preventDefault();
      var filename=[];
      var formelement=$('input[name=file]')[0];
      console.log(formelement);
      var fileemenet=formelement.files;
      if(fileemenet.length>0)
      {
        for(var i=0;i<fileemenet.length;i++)
        {
          var filetmp=fileemenet[i];
          form.append('uploads[]',filetmp,filetmp.name);
          filename.push(filetmp.name);
          picobj=filetmp.name;
        }
      }

      $.ajax({
        url:"/dragdrop",
        type:"POST",
        data:form,
        processData:false,
        contentType:false
      }).done(function(msg){
        console.log(msg);
        if(msg == "yes") {
          $("#uploadstatus").text("File has been uploaded");
          $("#uploadstatus").css({"color":"green"});
          $("#uploadForm2")[0].reset();
        }
        else
          $("#uploadstatus").text("File has not been uploaded");
      });
    });

    $('input#submitbutton').click(function(event){
      event.preventDefault();
      if(userid == "guest") {
        var form=new FormData();
        var dragdropfrm=new FormData();
        var filename=[];
        var formelement=document.getElementById('userphoto');
        var fileemenet=formelement.files;
        if(fileemenet.length>0)
        {
          for(var i=0;i<fileemenet.length;i++)
          {
            var filetmp=fileemenet[i];
            form.append('uploads[]',filetmp,filetmp.name);
            filename.push(filetmp.name);
            picobj=filetmp.name;
          }
        }

        $.ajax({
          url:"/guestlogin",
          type:"POST",
          data:form,
          processData:false,
          contentType:false
        }).done(function(msg){
            console.log(msg);
            if(msg == "yes") {
              $("#uploadstatus").text("File has been uploaded");
              $("#uploadstatus").css({"color":"green"});
              $("#uploadForm2")[0].reset();
            }
            else
              $("#uploadstatus").text("File has not been uploaded");
        });

        console.log("Names  "+filename);
        var userpicinfo={};
        userpicinfo.userid=userid;
        userpicinfo.filename=filename;

        $.ajax({
          url:"/guestdetailssave",
          type:'POST',
          data:JSON.stringify(userpicinfo),
          contentType:'application/json'
        }).done(function(msg){
          console.log("Done!!  " +msg);
        });

        var filename=$("#userphoto").val().split('\\').pop();
        console.log("Filename   "+filename);
        socket.emit('UserData',{id:userid,file:filename});
      }
      else {
          event.preventDefault();
          //For registered users
          var data = {};
          data.file = $("#userphoto")[0].files;
          data.filename = $("#userphoto").val().split('\\').pop();
          if (userid == "guest") {
            /*
             $.ajax({
             url:'/guestlogin',
             type:'POST',
             data:JSON.stringify(data),
             contentType: false,
             processData: false,
             }).done(function(data){
             console.log(data);
             });*/
            $('#uploadForm2').attr('action', 'guestlogin');
            $('#uploadForm2').submit();
        }
      }
    });

    $('#savemap').click(function(evt){
      evt.preventDefault();
      if(userid == "guest")
      { //save the guest map

        maps.name="guestmap";
        maps.id=userid;
        console.log("Map coordinates "+ markerobj);
        maps.markerobj=markercollec;
        $.ajax({
          url:"/mapupload",
          type:'POST',
          data:JSON.stringify(maps),
          contentType:'application/json'
        }).done(function(response){
          console.log(response);
          if(response =="yes") {
            $("#uploadstatus").text("The Map has been saved");
            $("#uploadstatus").css({"color":"green"});
            //Reset Map
            if($.isEmptyObject(markers) == false) {
              for (i = 0; i < markers.length; i++) {
                markers[i].setMap(null);
              }
            }
            map.setCenter(new google.maps.LatLng(51.508742,-0.120850));
            map.setZoom(3);
          }
          else
          {
            $("#uploadstatus").text("The Map has not been saved");
            $("#uploadstatus").css({"color":"red"});
          }
        });
      }
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
            var date=new Date();
            var tim=date.getMilliseconds();
            console.log("Latitide : " + lat);
            console.log("Longitude : " + lon);
            socket.emit('Latitude', lat);
            socket.emit('Longitude', lon);
            markerobj.lat=lat;
            markerobj.lon=lon;
            markerobj.id=userid+tim;
            markerobj.filename="sea.jpg"; //fix this
            //********* input name *****************

            markercollec.push(markerobj);
            myCenter = new google.maps.LatLng(lat, lon);
            var marker = new google.maps.Marker({
              position: myCenter
            });
            map.setCenter(marker.getPosition());
            map.setZoom(4);
            marker.setMap(map);
            markers.push(marker);
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

function initialize(){
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
    //Get markers and initialize them on map

    initialize();
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

  if(userid="guest")
  {
    //request markers
    socket.emit("LoadMarker", {id:userid,mapid:"guestmap"});
    markers =[];
    var paths=[];
    socket.on("drawmarkers",function(msg){
      console.log(msg.lat+"    "+msg.lng);
      //draw markers on map
      paths.push({lat: msg.lat, lng:msg.lng});
      var myCenter = new google.maps.LatLng(msg.lat, msg.lng);
      var marker = new google.maps.Marker({
        position: myCenter
      });
      map.setCenter(marker.getPosition());
      map.setZoom(4);
      marker.setMap(map);
      markers.push(marker);
    });
    console.log("Markers  "+paths);

    //connect the markers
    var path=new google.maps.Polyline({
      path:paths,
      geodesic:true,
      strokeColor: '#FF0000',
      strokeOpacity: 1.0,
      strokeWeight: 2
    });

    path.setMap(map);
  }

  }

//Controller for Image gallery page
function imagegallerycontroller(){
  $(document).ready(function(){
    $('#image').magnificPopup({
      type:'image',
      });
    console.log("User is logged as"+ userid);
    if(userid =="guest")
    {
      var mapid="guestmap";
    }

    socket.emit("ImageGall",{userid: userid, mapid:mapid});
    socket.on("imagereturn", function(mssg){
      console.log(mssg);
      console.log(mssg.picname);
      console.log(mssg.picpath);
      if(userid=="guest"){
        var mapid="guestmap";
        var loc="uploads/"+mssg.picname;
      }
      if(mssg.picname != undefined) {
        //create an image element
        var image=document.createElement('img');
        var append=document.getElementById('image');
        append.appendChild(image);
        $('#image').attr('href', loc);
        $('#image').append('<img class="images" src="'+loc+'" height="75" width="75">');
      }
    });

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
  })

    .when('/imagegallery',{
      templateUrl:'/FrontEnd/partials/imagegallery.html',
      controller: 'imagegallerycontroller'
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

tripapp.controller('imagegallerycontroller', function($scope){
  $scope.init=imagegallerycontroller();
  $scope.message="Image rendered here";
});



