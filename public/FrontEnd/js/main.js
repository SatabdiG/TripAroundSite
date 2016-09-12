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
var markerarray=[];
//For user markers
var userarray=[];
var loc1=[];
var nomap=0;
var map;

var name;

//From map page
var usermarkers=[];
var paths=[];
var busactive=0;
var trainactive=0;
var planeactive=0;

//For user added paths
var userpaths=[];
var usermanualmarker=[];

var deletemapid;

//Lines
var dashedline={
  path: 'M 0,-1 0,1',
  strokeOpacity: 1,
  strokeColor:'#393',
  scale: 5
};
//train line
var trainline={
  path: 'M 0,-1 0,1',
  strokeOpacity: 1,
  strokeColor:'#396',
  scale: 3
};
//Bus line
var busline={
  path: 'M 0,0,-1,-1,0, 0,1, 1',
  strokeOpacity: 1,
  strokeColor:'#393',
  scale: 2
};
var linesymbol={
  path:google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
  scale:8,
  strokeColor:'#393'
};

/*** Home page initializer **/
function homeinit(){
  //Reset Modal
  $('#myModal').on('show.bs.modal', function(){
    $('#registerusr')[0].reset();
    $('#info').text('');
  });
  name="";
  userid="";
  mapname="";
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
        var dat=JSON.parse(data);
        console.log("Browser Data"+dat.status);
        if(dat.status != "fail")
        {
          console.log("Successful Login");
          userid=username;
          name=dat.username;
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
    $('#info').text("Select a map or create a new one.");
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
              $('#myModal').modal('hide');
              $('#infofrm').text('Map is Saved');
              $('#infofrm').css('color', 'green');
              mapname=dat.name;
              var obj=document.getElementById('maps'+mapname);
              if(obj == null)
               $('#viewmapregion').append('<div class="row"><div class="col-lg-6"><div id="maps' + mapname +'"><h3>' + mapname + '</h3>' + '<p>Description: ' + dat.description + '</p>' + '<a class="btn btn-primary btn-xs" id="' + mapname + '"><i class="fa fa-check-circle fa-lg" aria-hidden="true"></i> Select map</a> ' + '<!--<button class="btn btn-default btn-xs '+mapname+'" id="editbutton'+mapname+'"><i class="fa fa-check-circle fa-lg" aria-hidden="true"></i> Edit map</button>--> <button class="btn btn-danger btn-xs '+mapname+'" id="removebutton'+mapname+'"><i class="fa fa-trash fa-lg" aria-hidden="true"></i> Delete map</button>' + '</div></div></div>');

              //return false;
            }
            else
            {
              //Close this form and launch a new popup/modal/magnific popup and proceed to save images.
              $('#infofrm').text('Map cannot be Saved. Try again later');
              $('#infofrm').css('color', 'red');
            }
          });
          $('#myModal').modal('toggle');
          return false;
        }
      });

    }

  });
   //Intialize close dialog
    var deleteflag=0;
    $('#confirmdeletion').dialog({
      resizeable:false,
      height:"auto",
      width:400,
      modal:true,
      autoOpen:false,
      buttons: [
        {
          text: "I want to delete this map",
          "class": "btn btn-danger",
          click: function() {
             console.log("Clicked"+deletemapid);
             //Send a post request to server delete all references to map and refresh page.
             var deletedata={};
             deletedata.userid=userid;
             deletedata.mapid=deletemapid;
             $.ajax({
               url:"/detelemap",
               type:"POST",
               data:JSON.stringify(deletedata),
               contentType:"application/JSON"

             }).done(function(msg){
               console.log("Message is "+msg)
               if(msg == "yes")
               {
                 console.log("Yes returned"+msg+"  "+deletemapid);
                 //Refresh the Page
                 if($('#confirmdeletion').dialog("isOpen"))
                   $('#confirmdeletion').dialog("close");

                 $('#maps'+deletemapid).remove();
               }
             });
          }
        },
        {
          text: "I want to keep this map",
          "class": 'btn btn-default',
          click: function() {
            $(this).dialog("close");
          }
        }
      ]

      });
    if($('#confirmdeletion').dialog("isOpen"))
      $('#confirmdeletion').dialog("close");
  //View Button

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
          socket.emit('getmaps', {userid:userid});
          socket.on('viewmaps', function(msg){
            console.log(msg.description);
          //Clear view map region
            var obj=document.getElementById(msg.name);
            if(obj == null) {
              $('#viewmapregion').append('<div class="row"><div class="col-lg-6"><div id="maps' + msg.name +'"><h3>' + msg.name + '</h3>' + '<p>Description: ' + msg.description + '</p>' + '<a class="btn btn-primary btn-xs" id="' + msg.name + '"><i class="fa fa-check-circle fa-lg" aria-hidden="true"></i> Select map</a> ' + '<!--<button class="btn btn-default btn-xs '+msg.name+'" id="editbutton'+msg.name+'"><i class="fa fa-check-circle fa-lg" aria-hidden="true"></i> Edit map</button>--> <button class="btn btn-danger btn-xs '+msg.name+'" id="removebutton'+msg.name+'"><i class="fa fa-trash fa-lg" aria-hidden="true"></i> Delete map</button>' + '</div></div></div>');/*
              '<div id="maps'+msg.name+'"><a id="' + msg.name + '" class="button">' + msg.name + '</a> <div id="info'+msg.info+'"> Description : '+msg.description+'</div><button class="'+msg.name+'" id="editbutton'+msg.name+'"> Edit </button><button class="'+msg.name+'" id="removebutton'+msg.name+'"> Remove Map </button></div><br>');*/
              /*
              var editbutt=document.getElementById("editbutton"+msg.name);

              editbutt.addEventListener("click", function(evt){
                console.log("Hello");
                //launch modal
                $("#DescriptionEdit").modal("show");
                $("#description").val(msg.description);
                $("#descriptionsub").on("click", function(evt){
                  evt.preventDefault();
                  console.log("Hello");
                  var data={};
                  if($('#description').val() == '')
                  {
                    $('#infodescrip').text("Please enter a description");
                    $("#infodescrip").css("color", "red");
                  }else
                  {
                    var data={};
                    data.userid=userid;
                    if(mapname == undefined) {
                      data.mapid = msg.name;
                    }else
                      data.mapid=mapname;
                    data.text=$('#description').val();
                    console.log("Data  "+data.userid+"  "+data.mapid);
                    //make a form submission
                    $.ajax({
                      url:'/mapdescriptionedit',
                      type:'POST',
                      data:JSON.stringify(data),
                      contentType:'application/JSON'
                    }).done(function(msg){
                      console.log("Returned  "+msg);
                      if(msg=="yes")
                      {
                        $("#DescriptionEdit").modal("hide");
                        $('#info'+msg.info).text("Description: "+data.text);
                      }
                    });
                  }
                });

              });*/


              var removebutt=document.getElementById("removebutton"+msg.name);
              removebutt.addEventListener("click", function(evt){
                evt.preventDefault();
                var tempid=this.id;
                var tempstr=tempid.substring(12, tempid.length);
                console.log("Remove clicked " + tempstr);
                /*
                if(mapname == undefined) {
                  deletemapid = msg.name;
                }else
                  deletemapid=mapname;*/
                deletemapid=tempstr;
                $('#confirmdeletion').dialog("open");
              });

            }
          });
        }
      });
    }


  $('#viewmapregion').on('click','a', function(event){
    console.log("Link clicked");
    console.log("Event id is"+event.target.id);
    mapname=event.target.id;
    window.location.href="#UploadImages";

  });
  /*
  $("#beforepagebutton").hover(function(){
    $("#beforepagebutton span").text("");
  }, function(){
    $("#beforepagebutton span").text("<");
  });
  $("#beforepagebutton").click(function(){
    window.location.href="#";
  });*/




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
    if(mapname == undefined)
    {
      window.location.href="#dashboard";
    }
    else
    {
      nomap=1;
    }
    Dropzone.autoDiscover=false;
    //Dropzone Code
    var myDropZone=new Dropzone("#dropzonePreview",{
      url:"/dragdrop",
      autoProcessQueue:false,

      init:function(){
        this.on('addedfile', function(file){
          console.log("Added File");
            EXIF.getData(file, function(){
              var lat=EXIF.getTag(this,"GPSLatitude");
              var lon=EXIF.getTag(this,"GPSLongitude");
              var time=EXIF.getTag(this,"DateTime");
              var latRef = EXIF.GPSLatitudeRef || "N";
              var lonRef = EXIF.GPSLongitudeRef || "W";
              if(lat == undefined || lon== undefined)
                alert("Sorry No Geo Tags present in images");
              else {
                lat = (lat[0] + lat[1] / 60 + lat[2] / 3600) * (latRef == "N" ? 1 : -1);
                lon = (lon[0] + lon[1] / 60 + lon[2] / 3600) * (lonRef == "W" ? -1 : 1);
                var date=new Date();
                var tim=time;
                console.log("Latitide : " + lat);
                console.log("Longitude : " + lon);
                socket.emit('Latitude', lat);
                socket.emit('Longitude', lon);
                markerobj.lat=lat;
                markerobj.lon=lon;
                markerobj.time=tim;
                markerobj.id=userid+tim;
                console.log("File Name"+file.name);
                markerobj.filename=file.name;

                //********* input name *****************

                markercollec.push(markerobj);
                myCenter = new google.maps.LatLng(lat, lon);
                var marker = new google.maps.Marker({
                  position: myCenter
                });
                map.setCenter(marker.getPosition());
                map.setZoom(4);
                marker.setMap(map);
                marker.addListener('click',function () {
                  var reader=new FileReader();
                  reader.onload=function (e) {
                    $('#image-container').attr("src", e.traget.results);
                  };
                  reader.readAsDataURL(file);

                });
                markers.push(marker);
              }
            });

            //Add Remove button
            var removebutton=Dropzone.createElement("<button>Remove File</button>");
            var _this=this;
            removebutton.addEventListener("click", function(e){
              e.preventDefault();
              e.stopPropagation();
              _this.removeFile(file);
            });

            file.previewElement.appendChild(removebutton);
        });

        this.on("sending",function(file,xhr,formData){
          var userobj={};
          var mapn={};
          if(userid=="guest"){
            userobj.mapname="guestmap";
            mapn.name="guestmap";
          }else
          {
            userobj.mapname=mapname;
            mapn.name=mapname;
          }
          userobj.filename=file.name;
          userobj.id=userid;
          mapn.user=userid;
          formData.append("userobj", JSON.stringify(userobj));
          formData.append("mapname",JSON.stringify(mapn));
        });

        this.on("complete", function(file){
          if(this.getUploadingFiles().length === 0 && this.getQueuedFiles().length === 0){
            //Reset Drpzone
            this.removeAllFiles(true);
          }
        });
      }
    });

    $('#savemap').click(function(evt){
      evt.preventDefault();
      myDropZone.processQueue();
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

        var userpic={};
        userpic.id=userid;
        userpic.mapname=mapname;
        var mapnameobj={};
        mapnameobj.user=userid;
        mapnameobj.name=mapname;
        userpic.filename=filename;
        form.append('mapname',JSON.stringify(mapnameobj));
        if(fileemenet.length>0)
        {
          for(var i=0;i<fileemenet.length;i++)
          {
            var filetmp=fileemenet[i];
            console.log("File name"+filetmp.name);
            form.append('uploads[]',filetmp,filetmp.name);
            filename.push(filetmp.name);
            picobj=filetmp.name;
            var time=EXIF.getTag(filetmp,"DateTime");
            console.log("Date Time"+time);
          }
        }
        console.log("Filename"+JSON.stringify(mapnameobj));
        console.log("Filename"+JSON.stringify(userpic));
        userpic.filename=filename;
        form.append('userobj',JSON.stringify(userpic));
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
            $("#uploadstatus").text("The map has been saved.");
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
            $("#uploadstatus").text("The map has not been saved.");
            $("#uploadstatus").css({"color":"red"});
          }
        });
      }
      else {
        //For registered users
        maps.name=mapname;
        maps.id=userid;
        maps.markerobj=markercollec;
        console.log("Map collection"+ markercollec);
        console.log("Map coordinates "+ markerobj);
        $.ajax({
          url:"/mapupload",
          type:'POST',
          data:JSON.stringify(maps),
          contentType:'application/json'
        }).done(function(response){
          console.log(response);
          if(response =="yes") {
            $("#uploadstatus").text("The map has been saved.");
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
            $("#uploadstatus").text("The map has not been saved.");
            $("#uploadstatus").css({"color":"red"});
          }
        });

        //Save trail data
          var trail={};
          trail.markerobj=markercollec;
          trail.username=userid;
          trail.map=mapname;
          trail.description="";
          trail.mode="bus";

          $.ajax({
              url:"/usertrailsave",
              method:'POST',
              data:JSON.stringify(trail),
              contentType:'application/JSON'
            }
          ).done(function(msg){
            console.log("Returbned message"+ msg);
          });
      }
    });
    $("#userphoto").on('change', function (event) {
      console.log("changed"+ event);
      var input=$("#userphoto").get(0).files;
      var count=0;
      for(var i=0;i<input.length;i++)
      {
        EXIF.getData(input[i], function(){
          var markerobj={};
          var lat=EXIF.getTag(this,"GPSLatitude");
          var lon=EXIF.getTag(this,"GPSLongitude");
          var tim=EXIF.getTag(this,"DateTime");
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
            markerobj.time=tim;
            markerobj.id=userid+tim;
            var filename = $('#userphoto').val().split('\\').pop();
            var fil=document.getElementById("userphoto");
            console.log("Name is"+ this.name);
            markerobj.filename=this.name;
            var fil=$("#userphoto").get(0).files[i];
            //********* input name *****************
            //markercollec.push(markerobj);
            markercollec[count++]=markerobj;
            myCenter = new google.maps.LatLng(lat, lon);
            var marker = new google.maps.Marker({
              position: myCenter
            });
            map.setCenter(marker.getPosition());
            map.setZoom(4);
            marker.setMap(map);
            marker.addListener('click',function () {
              var reader=new FileReader();
              console.log(fil);
              reader.readAsDataURL(fil);
              reader.onload=function (e) {
                $('#image-container').attr("src", e.target.result);
              };

            });
            markers.push(marker);
          }
        });
      }
    });

    /*
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
    });*/
  });

}

function initialize(){
  var mapProp = {
    center:new google.maps.LatLng(51.508742,-0.120850),
    zoom:5,
    mapTypeId:'terrain',
    minZoom: 2

  };

  map=new google.maps.Map(document.getElementById("googleMap"),mapProp);

  overlay = new google.maps.OverlayView();
  overlay.draw = function() {};
  overlay.setMap(map);

  // prevent panning into grey zone
  google.maps.event.addListener(map, 'center_changed', function() {
      checkBounds(map);
  });
  // If the map position is out of range, move it back
  function checkBounds(map) {

  var latNorth = map.getBounds().getNorthEast().lat();
  var latSouth = map.getBounds().getSouthWest().lat();
  var newLat;

  if(latNorth<85 && latSouth>-85)     /* in both side -> it's ok */
      return;
  else {
      if(latNorth>85 && latSouth<-85)   /* out both side -> it's ok */
          return;
      else {
          if(latNorth>85)
              newLat =  map.getCenter().lat() - (latNorth-85);   /* too north, centering */
          if(latSouth<-85)
              newLat =  map.getCenter().lat() - (latSouth+85);   /* too south, centering */
      }
  }
  if(newLat) {
      var newCenter= new google.maps.LatLng( newLat ,map.getCenter().lng() );
      map.setCenter(newCenter);
      }
  }



}

function placemarker(location, src){
  var markercoor=[];
  var tempobj={};
  var filename=src.split('/');
  var actual=filename[filename.length-1];
  console.log("actua"+actual+"  "+filename);
  tempobj.filename=actual;

  console.log("In place marker"+src);
  var marker=new google.maps.Marker({
    position:location,
  });

  tempobj.lat=marker.getPosition().lat();
  tempobj.lng=marker.getPosition().lng();
  console.log("The lat object is"+ src);
  userarray.push(JSON.stringify(tempobj));
  marker.setMap(map);
  marker.addListener('click',function () {
    console.log("Image Source"+src);
   //document.getElementById("image").innerHTML='<img src="'+src+'" />';
    //$('#image-container').append('<img class="imageholder" src="'+src+'"</img>');
    $('#image-container').attr("src",src);
    $('#myModal').modal('show');

  });
  usermanualmarker.push(marker);
  markercoor.push(marker);
  $('#something').hide();

  console.log(markercoor);
}

function animateCircle(line){
  var count = 0;
  window.setInterval(function() {
    count = (count + 1) % 200;
    var icons = line.get('icons');
    console.log("Icons "+icons);
    icons[0].offset = (count / 2) + '%';
    line.set('icons', icons);
  }, 20);
}


//code for product html
$("#menu-toggle").click(function(e){
  e.preventDefault();
  $("#wrapper").toggleClass("toggled");
});

/** Controller for Map Page **/
function imageupload() {
  $(document).ready(function(){

    if(mapname == undefined)
      window.location.href="#UploadImages";
    else
      nomap=1;
    //Get markers and initialize them on map
    console.log("User logged in as "+userid);
    initialize();

    var input = document.getElementById('searchbox');
    var searchBox = new google.maps.places.SearchBox(input);

    map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

    // Bias the SearchBox results towards current map's viewport.
    map.addListener('bounds_changed', function() {
      searchBox.setBounds(map.getBounds());
    });

    var markers = [];
    // Listen for the event fired when the user selects a prediction and retrieve
    // more details for that place.
    searchBox.addListener('places_changed', function() {
      var places = searchBox.getPlaces();

      if (places.length == 0) {
        return;
      }

      // Clear out the old markers.
      markers.forEach(function(marker) {
        marker.setMap(null);
      });
      markers = [];

      // For each place, get the icon, name and location.
      var bounds = new google.maps.LatLngBounds();
      places.forEach(function(place) {
        if (!place.geometry) {
          console.log("Returned place contains no geometry");
          return;
        }
        var icon = {
          url: place.icon,
          size: new google.maps.Size(71, 71),
          origin: new google.maps.Point(0, 0),
          anchor: new google.maps.Point(17, 34),
          scaledSize: new google.maps.Size(25, 25)
        };

        // Create a marker for each place.
        userarray.push(markers);
        markers.push(new google.maps.Marker({
          map: map,
          title: place.name,
          position: place.geometry.location
        }));

        if (place.geometry.viewport) {
          // Only geocodes have viewport.
          bounds.union(place.geometry.viewport);
        } else {
          bounds.extend(place.geometry.location);
        }
      });
       map.fitBounds(bounds);
    });


    $('#something').hide();
    //Fetch images from Server using socketio


    socket.emit("ImageGall",{userid: userid, mapid:mapname});
    socket.on("imagereturn", function(mssg) {
      console.log("Thumbanils "+mssg.picname);
      var loc;
      if (userid == "guest") {
        var mapid = "guestmap";
        loc = "uploads/" + mssg.picname;
      }
      else
      {
        var mapid=mapname;
        loc=mssg.picpath+"/"+mssg.picname;
      }
      console.log("Locations "+loc);
      //if($("#thumbnail li").length === 0)
      var pic=document.getElementById(mssg.picname);
      if(pic == undefined)
        $("#thumbnail").append('<div class="col-xs-4 col-sm-2 col-md-1"><img class="img-responsive img-thumbnail" src="' + loc + '" alt="' + mssg.picname + '" id="'+mssg.picname+'"></div>');
    });
    $("#thumbnail").tooltip({
      content:"Click here for Draggable Marker"
    });
    var clickname;
    var temp=document.getElementById("thumbnail");
    $('#thumbnail').on('click','img',function(event){
      console.log("Clicked"+event);
      console.log($(this).attr('src'));
      clickname=$(this).attr('src');

      if($('#something').is(':visible'))
        $('#something').hide();
      else
        $('#something').show();

       });
    $('#something').draggable({
      revert: true
    });

    $('#something').on('dragstop',function(evt,ui){
      var mOffset=$(map.getDiv()).offset();
      var point=new google.maps.Point( ui.offset.left-mOffset.left+(ui.helper.width()/2),ui.offset.top-mOffset.top+(ui.helper.height()));
      var ll=overlay.getProjection().fromContainerPixelToLatLng(point);
      placemarker(ll, clickname);

    });
    if(userid =="guest")
    {
      //request markers
      socket.emit("LoadMarker", {id:userid, mapid:"guestmap"});
      socket.on("drawmarkers",function(msg){
        paths=[];
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
        marker.addListener('click',function () {
          console.log("Image Source"+src);
          $('#image-container').append('<img class="imageholder" src="uploads/'+userid+'/'+msg.filename+'"</img>');
          $('#myModal').modal('show');
          $("#imagedescriptionsub").on("click", function(evt){
            var content=$('#imageinfo').val();
            if(content != "")
            {
              var imgdesdata={};
              imgdesdata.filename=msg.filename;
              imgdesdata.username=userid;
              imgdesdata.mapid=mapname;
            }
          });
        });
        markerarray.push(marker);
        var linesymbol={
          path:google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
          scale:8,
          strokeColor:'#393'
        };
        var path=new google.maps.Polyline({
          path:paths,
          icons:[
            {
              icon:linesymbol,
              offset:'100%'
            }
          ],
          geodesic:true,
          strokeColor: '#FF0000',
          strokeOpacity: 1.0,
          strokeWeight: 2
        });
        path.setMap(map);
        animateCircle(path);
      });
    }
    else
    {
      //registered users
      //airplane line


      socket.emit("GetTrails", {id:userid, mapid:mapname});
      socket.on("drawtrails", function(msg){
        console.log("Draw Trails gives"+msg.src+"  "+msg.des);
        var src=msg.src;
        var des=msg.des;
        var paths=[];
        if(src.length > 1)
        {
          console.log("fetched more than one src objs");
          var srcarr=[];
          for(var i=0;i<src.length;i++)
          {
            var latt=parseFloat(src[i].lat);
            var lont=parseFloat(src[i].lon);
            console.log("Src"+src[i].lat+"  "+src[i].lon);
            var srctemp={lat: latt, lng:lont};
            srcarr.push(srctemp);
          }
          if(des.lat != undefined || des.lon != undefined)
            srcarr.push({lat: parseFloat(des.lat), lng:parseFloat(des.lon)});
          console.log(srctemp);
          paths=srcarr;
        }else {

          var srctemp = {lat: msg.src.lat, lng: msg.src.lon};
          var finaltemp = {lat: msg.des.lat, lng: msg.des.lon};

          paths.push(srctemp);
          paths.push(finaltemp);
        }
        console.log("Final Paths"+paths);
          var description = msg.description;
          var vehicle = msg.mode;
          var path = new google.maps.Polyline({
            path: paths,
            geodesic: true,
            strokeColor: '#FF0000',
            strokeOpacity: 1.0,
            strokeWeight: 2
          });
          if (vehicle == "airplane") {
            path.setOptions({
              icons: [{
                icon: dashedline,
                offset: '0',
                repeat: '90px'
              }],
              strokeColor: '#ffc433',
            });
          } else if (vehicle = "bus") {
            path.setOptions({
              icons: [{
                icon: busline,
                offset: '0',
                repeat: '50px'
              }],
              strokeColor: '#9ba3f3',
            });
          } else if (vehicle == "train") {
            path.setOptions({
              icons: [{
                icon: trainline,
                offset: '0',
                repeat: '50px'
              }],
              strokeColor: '#9ba3f4',
            });
          }
          //animateCircle(path);
          path.setMap(map);
          path.addListener("click", function (event) {
            this.descr = description;
            if (description == "") {
              $('#infotxt').text("You don't have a description for this trail yet. Please click edit description to get a description");
            }
            else {
              $('#infotxt').text(description);
            }

            var latitude = event.latLng.lat();
            var longitude = event.latLng.lng();

            //call a function that brings up the modular
            $('#optionsmodal').modal('show');

            $('#airplane').on('click', function (evt) {
              path.setOptions({
                icons: [{
                  icon: dashedline,
                  offset: '0',
                  repeat: '90px'
                }],
                strokeColor: '#ffc433',
              });
              vehicle = "airplane";
            });
            $('#bus').on('click', function (evt) {
              path.setOptions({
                icons: [{
                  icon: busline,
                  offset: '0',
                  repeat: '50px'
                }],
                strokeColor: '#9ba3f3',
              });
              vehicle = "bus";
            });
            $('#train').on('click', function (evt) {
              path.setOptions({
                icons: [{
                  icon: trainline,
                  offset: '0',
                  repeat: '50px'
                }],
                strokeColor: '#9ba3f4',
              });
              vehicle = "train";
            });
            $('#trailsub').on("click", function (event) {
              //Save the Map details
              var desc = $('#traildescription').val();
              if (desc == "") {
                console.log("Trail Description is empty");
                $('#traildescription').text("Please enter a valid Trail Description");
              } else {
                var trail = {};
                trail.name = userid;
                trail.map = mapname;
                console.log("Trail description is present");
                trail.pathobj = path.getPath().getArray().toString();
                trail.description = desc;
                if (vehicle == "") {
                  $('#traildescription').text("Please choose Bus or Airplane");
                  trail.mode = "";
                } else {
                  trail.mode = vehicle;
                }
                console.log("Created Object" + JSON.stringify(trail) + latitude + longitude);
                $.ajax({
                  url: '/traildescription',
                  method: 'POST',
                  data: JSON.stringify(trail),
                  contentType: 'application/JSON'
                }).done(function (msg) {
                  console.log("Returend message" + msg);
                  if (msg == "yes") {
                    //close the modal
                    $("#optionsmodal").modal("hide");
                    var divhtml = $('#traildescription').html();
                    var temphtml = $('<div id="infotxt"></div>');
                    temphtml.val(divhtml);
                    $('#traildescription').replaceWith(temphtml);
                    description = desc;
                    $("#infotxt").text(description);
                  }
                });

              }
            });
            $('#editdes').on('click', function (evt) {
              //Replace the infotxt with an editable textare
              var divhtml = $('#infotxt').html();
              var editabletext = $("<textarea id='traildescription'/>");
              editabletext.val(divhtml);
              $('#infotxt').replaceWith(editabletext);
              editabletext.focus();
            });

          });


      });

      socket.emit("LoadMarker", {id:userid, mapid:mapname});
      socket.on("drawmarkers",function data(msg){
        //draw markers on map
        console.log("Fetched data"+msg.lat+"  "+msg.lng+"  "+msg.id);
        var temp={lat: msg.lat, lng:msg.lng};
        paths.push(temp);

        var myCenter = new google.maps.LatLng(msg.lat, msg.lng);
        var marker = new google.maps.Marker({
          position: myCenter
        });
        usermarkers.push(marker);
        map.setCenter(marker.getPosition());
        map.setZoom(2);
        marker.setMap(map);
        markerarray.push(marker);
        marker.addListener('click',function () {
          //var tempimg=$("#image-container .imageholder").html();
         // if(tempimg!= undefined) {

            //$("#image-container .imageholder").attr("src", str);

          //}
          var str="uploads/"+userid+"/"+msg.map+"/"+msg.filename;
          $('#image-container').attr("src",str);
          /*
          else {
             $('#image-container').append('<img class="imageholder" src="uploads/'+userid+'/'+msg.map+'/'+msg.filename+'">');
          }*/


          $("#imagedescriptionsub").on("click", function(evt){
            console.log("Image description clicked");
            var content=$('#imageinfo').val();
            if(content != "")
            {
              var imgdesdata={};
              imgdesdata.filename=msg.filename;
              imgdesdata.username=userid;
              imgdesdata.mapid = mapname;
              imgdesdata.description=content;

              $.ajax({
                url:'/updateimagedescription',
                method:'POST',
                data:JSON.stringify(imgdesdata),
                contentType:'application/JSON'
              }).done(function(msg){
                console.log("Return msg"+msg);
                if(msg == "yes")
                {
                  $('#image-des').text(content);

                }
              });
            }
          });

          $('#myModal').modal('show');
        });
        });

    }
  });
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
     //Launch Filters modal

    $('#filters').on("click", function(evt){
      console.log("Filters modal opened");
      //display the filters
      $('#filtermodal').modal("show");
      //smile check function
      /*
      $('#facecheck').on("click", function (evt) {
        $('#facecheck').attr("checked", true);
        console.log("Smile checked clicked");
        //call the server function
        var data={};
        data.userid=userid;
        data.mapid=mapname;


        socket.emit("ImageGall",{userid: userid, mapid:mapid});
        socket.on("imagereturn", function(mssg) {
          //Check if the image is  present if it is remove
          var facevar=mssg.facevar;
          var smilevar=mssg.smilevar;
          var tempimg = document.getElementById("div"+mssg.picname);
          console.log("Data  "+facevar+"  "+mssg.picname);
          if(tempimg!= undefined) {
            if (facevar == 0) {
              tempimg.remove();
            }
          }
        });

      });
      */
      //Smile check  function
      $('#smilecheck').on("click", function(evt){
        $('#smilecheck').attr("checked", true);
        console.log("Smile checked clicked");

        socket.emit("ImageGall",{userid: userid, mapid:mapid});
        socket.on("imagereturn", function(mssg) {
          //Check if the image is  present if it is remove
          var facevar=mssg.facevar;
          var smilevar=mssg.smilevar;
          var tempimg = document.getElementById("div"+mssg.picname);
          console.log("Data  "+facevar+"  "+mssg.picname);
          if(tempimg!=undefined) {
            if (smilevar == 0) {
              tempimg.remove();
            }
          }
        });
      });

    });

    $('#dispall').on("click", function (evt) {
        $('#dispall').attr("checked", true);
        console.log("Display all checked clicked");
        socket.emit("ImageGall",{userid: userid, mapid:mapid});
        socket.on("imagereturn", function(mssg) {
          //Check if the image is  present if it is remove
          var facevar=mssg.facevar;
          var tempimg = document.getElementById("div"+mssg.picname);
          console.log("Data  "+facevar+"  "+mssg.picname);
          if(userid=="guest"){
            var mapid="guestmap";
            var loc="uploads/"+mssg.picname;
          }
          else
          {
            var loc=mssg.picpath+"/"+mssg.picname;
          }
          if(tempimg == undefined)
          {
            var text=mssg.description;
            if(text == "")
              text="No description yet";
            $('#imagegall').append('<div class="col-xs-6 col-sm-4 col-md-3 col-lg-2" id="div'+mssg.picname+'"><a href="' + loc + '" class="thumbnail"><img class="img-responsive" src="' + loc + '" alt="' + mssg.picname + '" id="'+mssg.picname+'"><div class="caption"><p id="cap'+mssg.picname+'">' +text+'</p></div></a></div>');
          }

        });


    });

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
      console.log(mssg.description);
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
      if(mssg.picname != undefined && mssg.picpath!=undefined) {
        console.log("loc"+loc);
        loc1.push(loc);
        var temp=document.getElementById(mssg.picname);
        if(temp == undefined)
        {
          var text=mssg.description;
          if(text == "")
            text="No description yet";

          $('#imagegall').append('<div class="col-xs-6 col-sm-4 col-md-3 col-lg-2" id="div'+mssg.picname+'"><a href="' + loc + '" class="thumbnail"><img class="img-responsive" src="' + loc + '" alt="' + mssg.picname + '" id="'+mssg.picname+'"><div class="caption"><p id="cap'+mssg.picname+'">' +text+'</p></div></a></div>');
        }



      }
    });

  });
}


function airplanehandler(){
    planeactive= 1;
    if(busactive != 1 && trainactive != 1) {
      var startpos, startend;
      var path;

      console.log("In airplane loop");
      map.addListener("click", function (event) {
        var objplane = [];
        if(objplane.count>0)
        {
          for(var i in objplane)
          {
            var index=objplane.indexOf(i);
            objplane.pop();
          }
        }
        console.log("0obj"+objplane);
        map.setOptions({draggable: false});

        console.log("ZZZ"+event.latLng+"  "+objplane);
        startpos = event.latLng.lat();
        startend = event.latLng.lng();

        var coors = new google.maps.LatLng(startpos, startend);
        var coorssum = new google.maps.LatLng(startpos + 5, startend + 5);
        map.panTo(coors);
        objplane.push(coors);
        objplane.push(coorssum);
        console.log("obj" + objplane);
        var path1 = new google.maps.Polyline({
          path: objplane,
          editable: true,
          map: map,
          icons: [{
            icon: dashedline,
            offset: '0',
            repeat: '50px'
          }],
          strokeColor: '#ffc433',
        });
        if (path1 != undefined) {
           path1.addListener("click", function (event) {
            path1.setMap(null);
          });
        }
        var data = {};
        data.mode = "airplane";
        data.path = path1;
        bushandler.userpath = path1;
        userpaths.push(data);
      });
      map.setOptions({draggable: true});
      planeactive = 0;
    }

}

function trainhandler(){
  trainactive=1;
  if(planeactive != 1 && busactive !=1)
  {

    var startpos, startend;
    var path;

    console.log("In airplane loop");
    map.addListener("click", function (event) {
      var objtrain = [];
      map.setOptions({draggable: false});
      console.log(event.latLng);
      startpos = event.latLng.lat();
      startend = event.latLng.lng();
      var coors = new google.maps.LatLng(startpos, startend);
      var coorssum = new google.maps.LatLng(startpos + 5, startend + 5);
      map.panTo(coors);
      var src = {lat: startpos, lng: startend};
      var des={lat: startpos+5, lng: startend+5};
      objtrain.push(src);
      objtrain.push(des);
      console.log("obj" + objtrain);
      var path2 = new google.maps.Polyline({
        path: objtrain,
        editable: true,
        map: map,
        icons: [{
          icon: trainline,
          offset: '0',
          repeat: '30px'
        }],
        strokeColor: '#9ba3f4',
      });

      if (path2 != undefined) {
        path2.addListener("click", function (event) {
          console.log("Dragging");
          path2.setMap(null);
        });
      }
      trainhandler.userpath = path2;
      var data = {};
      data.mode = "train";
      data.path = path2;
      bushandler.userpath = path2;
      userpaths.push(data);
    });

    map.setOptions({draggable: true});
   trainactive=0;
  }


}

function SaveData(){
  console.log("In save data "+userarray.length);
  if(userarray.length<1)
  {
    $("#mapinfosec").text("Please click a picture to get a draggable marker");

  }else
  {
    //the user has created some markers save the markers
    for(var i=0;i<userarray.length;i++)
    {
      var obj=JSON.parse(userarray[i]);
      var sendobj={};
      sendobj.userid=userid;
      sendobj.mapname=mapname;
      sendobj.filename=obj.filename;
      sendobj.lat=obj.lat;
      sendobj.lon=obj.lng;
      console.log("Built send obg"+sendobj.filename);

      $.ajax({
        url:('/usermarkersave'),
        method:'POST',
        data:JSON.stringify(sendobj),
        contentType:'application/JSON'
      }).done(function(msg){
        console.log("Returned message"+msg);
        if(msg == "yes")
        {
          $('#mapinfosec').text("Your Map data was saved");
          $('#mapinfosec').css("color", "green");
        }
        else
        {
          $('#mapinfosec').text("Your Map data was not saved");
          $('#mapinfosec').css("color", "red");
        }
      });
    }
  }
  if(userpaths.length<1)
  {
    $("#mapinfosec").text("Please click either airplane,bus,train handler");

  }else {
    for (var i = 0; i < userpaths.length; i++) {
      var obj=userpaths[i].path;

      var path=obj.getPath().getArray().toString();
      console.log("Obj is"+path);

      var sendobj={};
      sendobj.userid=userid;
      sendobj.mapname=mapname;
      sendobj.path=path;
      sendobj.des="";
      sendobj.mode=userpaths[i].mode;
     // sendobj.lat=obj.lat;
    //  sendobj.lon=obj.lng;
     console.log("Built send obj"+sendobj.path);

      $.ajax({
        url:('/usertrailmanual'),
        method:'POST',
        data:JSON.stringify(sendobj),
        contentType:'application/JSON'
      }).done(function(msg){
        console.log("Returned message"+msg);
        if(msg == "yes")
        {
          console.log("Yes returned");
          userpaths=[];
        }else
        {
          console.log("No returned");
          userpaths=[];
        }
      });
    }

  }

}


function bushandler()
{
      busactive=1;
      console.log(airplanehandler.active +"  "+trainhandler.active);
      if(planeactive != 1 && trainactive != 1) {

      var startpos, startend;
      var path;

      console.log("In airplane loop");

      map.addListener("click", function (event) {

        var objbus = [];
        map.setOptions({draggable: false});
        console.log(event.latLng);
        startpos = event.latLng.lat();
        startend = event.latLng.lng();
        var coors = new google.maps.LatLng(startpos, startend);
        var coorssum = new google.maps.LatLng(startpos + 5, startend + 5);
        map.panTo(coors);
        objbus.push(coors);
        objbus.push(coorssum);
        console.log("obj" + objbus);
        var path = new google.maps.Polyline({
          path: objbus,
          editable: true,
          map: map,
          icons: [{
            icon: busline,
            offset: '0',
            repeat: '30px'
          }],
          strokeColor: '#9ba3f3',
        });
        if (path != undefined) {
          path.addListener("click", function (event) {
            console.log("Dragging");
            path.setMap(null);
          });
        }
        var data = {};
        data.mode = "bus";
        data.path = path;
        bushandler.userpath = path;
        userpaths.push(data);
      });

      map.setOptions({draggable: true});
      busactive=0;

    }

}
//end of the code for product html

function ResetAll()
{

  for( var i=0; i< userpaths.length;i++)
  {
    userpaths[i].path.setMap(null);
  }

  usermanualmarker.forEach(function(marker) {
    marker.setMap(null);
  });



}
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
  $scope.userid=name;
  $scope.mapname=mapname;
  $scope.init=imageupload();

});

tripapp.controller('imagecontroller', function($scope){
  $scope.userid=name;
  $scope.map=mapname;
  $scope.init=imagecontroller();

});

tripapp.controller('imagegallerycontroller', function($scope){
  $scope.userid=name;
  $scope.map=mapname;
  $scope.init=imagegallerycontroller();

});

tripapp.controller('dashboardcontroller', function($scope){
  $scope.userid=name;
  $scope.init=dashboardfunction();

});



