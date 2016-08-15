/**
 * Created by tasu on 04.07.16.
 * Description :  Code for interactive maps
 *
 */
var mapname;
var myCenter=new google.maps.LatLng(51.508742,-0.120850);
var socket=io();
var overlay;
var src;
var userid;
var password;
var markers=[];
var loc1=[];
var nomap=0;

/*** Home page initializer **/
function homeinit(){
  //Reset Modal
  $('#myModal').on('show.bs.modal', function(){
    $('#registerusr')[0].reset();
    $('#info').text('');
  });

  userid="";
  password="";
  $(document).ready(function(){
    $('#guestlink').click(function(event){
      console.log("Guest link click");
      event.preventDefault();
      userid="guest";
      window.location.href="#dashboard";
    });
    $('input#usersub').click(function(event) {
      event.preventDefault();
      var data = {};
      data.name = $('#usr').val();
      data.password = $('#pass').val();
      console.log(data);
      username= $('#usr').val();
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
          userid=username;
          password=data.password;
          window.location.href="#dashboard";
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

    $('#register').on('click',function(){
      var clientobj={};
      if($('#username').val() != '' || $('#password').val() != '' || $('#email').val() != ''){
        clientobj.username=$('#username').val();
        clientobj.password=$("#password").val();
        clientobj.email=$('#email').val();
        clientobj.name=$('#name').val();
        console.log(clientobj);

        $.ajax({
          url:'registeruser',
          type:'POST',
          data:JSON.stringify(clientobj),
          contentType:'application/json'
        }).done(function(msg){
          console.log("Returned message "+msg);
          if(msg == 'present'){
            //already present
            $('#info').text('User Id is already present. Please choose another');
            $('#info').css('color', 'red');
            //Reset All fields
            $('#registerusr')[0].reset();

          }
          else if(msg =='add'){
            //Added Successfully
            $('#myModal').modal('hide');
            $('#usertext').text("User added. Please Login");
            $('#usertext').css('color','green');

          }else
          {
            //Error Happed
            $('#myModal').modal('hide');
            $('#usertext').text("Error happened. Please try again later");
            $('#usertext').css('color','red');

          }

        });
      }
      else
      {
        $('usertext').text("Please enter value of Username/Password/Email");
      }

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

/** User's Dashboard **/
function dashboardfunction(){
  $(document).ready(function(){
  $('#viewmapregion').empty();
  console.log("User logged in as "+userid);
  //Initialize the custom dialogue boxes
  //1. The user is guest
  $("#dialog").dialog({
    autoOpen:false,
    show:{
      effect:"blind",
      duration:100
    },
    hide:{
      effect:'explode',
      duration:1000
    },
    modal:true
  });
  //User has selected no maps
  if(nomap==0)
  {
    $('#info').text("Please select a Map. Or create a new One");
    $('#info').css('color', 'green');
  }
  //Save maps user

  $('#formcontainer').dialog({
    autoOpen:false,
    show:{
      effect:"blind",
      duration:1000
    },
    hide:{
      effect:'explode',
      duration:1000
    },
    modal:true
  });


  $('#savebutt').on('click', function(){
    console.log("Clicked on savebutton option");
    //Launch form
    if(userid =="guest"){
      $('#dialog').dialog("open");

    }else
    {
      //Launch form
     $('#myModal').modal('show');

      $("#submit").on('click', function(){
        console.log("User clicked submit!");
        if($('#mapname').val()=='')
        {
          $('#infofrm').text('please enter some map name to start');
          $('#infofrm').css('color', 'red');
          return;
        }
        else {
          //Create ajax data and send it to the server to save the map
          var dat={};
          dat.name=$('#mapname').val();
          dat.description=$('#descriptiontext').val();
          dat.userid=userid;

          $.ajax({
            url:'/mapsave',
            method:'POST',
            data:JSON.stringify(dat),
            contentType:'application/JSON'
          }).done(function(msg){
            console.log('Done');
            if(msg == 'yes') {
              $('#infofrm').text('Map is Saved');
              $('#infofrm').css('color', 'green');
              mapname=dat.name;
              window.location.href="#UploadImages";
            }
            else
            {
              $('#infofrm').text('Map cannot be Saved. Try again later');
              $('#infofrm').css('color', 'red');
            }
            //Close this form and launch a new popup/modal/magnific popup and proceed to save images.
            $('#myModal').modal('hide');
          });

        }
      });

    }

  });
  //View Button
  $('#viewbutt').on('click', function(){
    console.log("Clicked on the view saved button options");
    if(userid =="guest"){
      $('#dialog').dialog("open");

    }else
    {
      //get map data from serverjs and store in div region : viewmapregion
      var getmap={};
      getmap.name=userid;
      $.ajax({
        url:'/viewmap',
        method:'POST',
        data:JSON.stringify(getmap),
        contentType:'application/JSON'
      }).done(function(msg){
        console.log("Returned message is "+msg);
        if(msg =="no"){
          $('#viewmapregion').text('You Have No Saved Maps. Please create one to start');
          $('#viewmapregion').css('color','green');
        }
        else
        {
          //call socket function
          console.log("In yes function");
          socket.emit('getmaps', {userid:userid});
          socket.on('viewmaps', function(msg){
          console.log(msg.name);
          $('#viewmapregion').append('<div maps><a id="'+msg.name+'" class="button">'+msg.name+'</a></div>');
          $('#viewmapregion').css('color','green');
          });

        }
      });
    }
    $('#viewmapregion').empty();

  });

  $('#viewmapregion').on('click','a', function(event){
    console.log("Link clicked");
    console.log("Event id is"+event.target.id);
    mapname=event.target.id;
    window.location.href="#UploadImages";

  });

  $("#beforepagebutton").hover(function(){
    $("#beforepagebutton span").text("");
  }, function(){
    $("#beforepagebutton span").text("<");
  });
  $("#beforepagebutton").click(function(){
    window.location.href="#";
  });


  $("#nextpagebutton").hover(function(){
    $("#nextpagebutton span").text("");
  }, function(){
    $("#nextpagebutton span").text(">");
  });
  $("#nextpagebutton").click(function(){
    window.location.href="#UploadImages";
  });

  });
  //document ready function concludes
} //dashboard function finishes

/** Image upload Controller function **/
function imagecontroller(){
  var markercollec=[];
  var markerobj={};
  var markers=[];
  var picobj={};
  var maps={};
  console.log("User logged in as" + userid);
  console.log("The map id is as"+ mapname);
  initialize();
  $(document).ready(function(){
    Dropzone.autoDiscover=false;
    $('#dropzonePreview').dropzone({
      url:"/dragdrop"
    });

    /*
    var mydropzone=new Dropzone("div#someid", {url: "/dragdrop"});
    $('input#dragdropbutton').click(function(evt){
      evt.preventDefault();
      var filename=[];
      var fileemenet=$('input[name=file]')[0].files;
      console.log(fileemenet);
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
    });*/

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
              $('#dropzonePreview').on('complete',function(file){
                console.log("Finally!!");
                $('#dropzonePreview').removeAllFiles(true);
              });
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
        socket.emit('UserData',{id:userid,file:filename, mapid:"guestmap"});
      }
      else {
        //For registered users
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
        var userpic={};
        userpic.filename=filename;
        userpic.id=userid;
        userpic.mapname=mapname;
        var mapnameobj={};
        mapnameobj.user=userid;
        mapnameobj.name=mapname;
        form.append('userobj',JSON.stringify(userpic));
        form.append('mapname',JSON.stringify(mapnameobj));
        console.log("Map name"+mapname);
        $.ajax({
          url:"/userimageupload",
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
            $('#dropzonePreview').on('complete',function(file){
              console.log("Finally!!");
              $('#dropzonePreview').removeAllFiles(true);
            });
          }
          else
            $("#uploadstatus").text("File has not been uploaded");
        });

        console.log("Names  "+filename);
        var filename=$("#userphoto").val().split('\\').pop();
        console.log("Filename   "+filename);
        //Socket was here

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
      else {
        //For registered users
        maps.name=mapname;
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
      window.location.href="#dashboard";
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
  markers.push(marker);
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
    console.log("Markers  "+markers);
    //Get markers and initialize them on map
    console.log("User logged in as "+userid);
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
  if(userid =="guest")
  {
    var mapid="guestmap";
  }
  {
    if(mapname==0)
    {
      window.location.href="#UploadImage";
    }
    else
    {
      mapname=1;
    }
    var mapid=mapname;
  }

  socket.emit("ImageGall",{userid: userid, mapid:mapid});
  socket.on("imagereturn", function(mssg) {
    console.log(mssg);
    console.log(mssg.picname);
    console.log(mssg.picpath);
    if (userid == "guest") {
      var mapid = "guestmap";
      var loc = "uploads/" + mssg.picname;
    }
    else
    {
      var mapid=mapname;
      var loc="uploads/" + mssg.picname;
    }
    console.log("Location  "+loc);
    if($("#thumbnail li").length == 0)
      $("#thumbnail").append('<li><img src="uploads/'+mssg.picname+'" class="img-thumbnail" alt="Cinque Terre" ></li>');
  });
  //socket.emit("LoadImage", "yes");

  /*
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
    });*/

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
      map.setZoom(2);
      marker.setMap(map);
      markers.push(marker);
      var path=new google.maps.Polyline({
        path:paths,
        geodesic:true,
        strokeColor: '#FF0000',
        strokeOpacity: 1.0,
        strokeWeight: 2
      });
      path.setMap(map);
    });
  }
  else
  {
    //registered users
    socket.emit("LoadMarker", {id:userid,mapid:mapname});

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
      map.setZoom(2);
      marker.setMap(map);
      markers.push(marker);
      var path=new google.maps.Polyline({
        path:paths,
        geodesic:true,
        strokeColor: '#FF0000',
        strokeOpacity: 1.0,
        strokeWeight: 2
      });
      path.setMap(map);
    });
  }
  }

//Controller for Image gallery page
function imagegallerycontroller(){
  if(mapname == undefined){
    //User has not chosen a map
    window.location.href="#dashboard";
  }
  else
    nomap=1;
  $(document).ready(function(){
     $('#imagegall').magnificPopup({
        delegate:'a',
        type:'image',
        image:{
          verticalFit:true
        },
       gallery:{
         enabled:true
       },
       callbacks:{
         open:function(){

         },
         beforeClose:function (){
         }
       }
      });

    //$('.blueberry').blueberry();

    console.log("User is logged as"+ userid);
    if(userid =="guest")
    {
      var mapid="guestmap";
    }
    else {
      var mapid=mapname;
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
      else
      {
        var loc=mssg.picpath+"/"+mssg.picname;
      }
      if(mssg.picname != undefined || mssg.picpath!=undefined) {
        console.log("loc"+loc);
        loc1.push(loc);
       //create an image element
       // var image=document.createElement('img');
      //  var append=document.getElementById('image');
     //   append.appendChild(image);
      //  $('#image').attr('href', loc);
      //  $('#image').append('<img class="images" src="'+loc+'" height="75" width="75">')
        $('#imagegall').append('<a href="'+loc+'" id="image"><img class="images" src="'+loc+'" height="75" width="75"></a>');
       // $('#slides').append('<li><img src="'+loc+'"/></li>');

      }
    });
    console.log("Loc  "+loc1);
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
  })

  .when('/dashboard',{
    templateUrl:'/FrontEnd/partials/dashboard.html',
    controller:'dashboardcontroller'
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
  $scope.username=userid;
  $scope.mapname=mapname;
  $scope.init=imageupload();

});

tripapp.controller('imagecontroller', function($scope){
  $scope.username=userid;
  $scope.map=mapname;
  $scope.init=imagecontroller();

});

tripapp.controller('imagegallerycontroller', function($scope){
  $scope.username=userid;
  $scope.map=mapname;
  $scope.init=imagegallerycontroller();

});

tripapp.controller('dashboardcontroller', function($scope){
  $scope.userid=userid;
  $scope.init=dashboardfunction();

});



