/*global $, document, google, ko, theaters, ajax, setTimeout, console, alert, window, location, sessionStorage, navigator*/
/*jshint esversion: 6 */
let map;
var link = "http://localhost:3000/api/";
var curUser = JSON.parse(sessionStorage.getItem("curUser"));
var curSkateSpot = {};
let self;
	
//if null then the user is not logged in
if(curUser === null)
	location.href = 'login.html';


//Initiliazes  the map, using the center of WA state as the center
function initMap() {
    let geocoder = new google.maps.Geocoder();
	
    if (navigator.geolocation) {
        let crd;
            navigator.geolocation.getCurrentPosition(function(position) {
                crd = position.coords;
                map = new google.maps.Map(document.getElementById('map'), {
                    center: {lat: crd.latitude, lng: crd.longitude},
                    zoom: 15,
                    mapTypeControl: false, //Sticks to the classic mapType
                    minZoom: 5,
                    streetViewControl: false
                });
				
				 ko.applyBindings(new ViewModel());
            },
			function(error){
				
				map = new google.maps.Map(document.getElementById('map'), {
					center: {lat: 47.6062, lng: -122.3321},
					zoom: 12,
					mapTypeControl: false, //Sticks to the classic mapType
					minZoom: 5,
					streetViewControl: false
				});
				ko.applyBindings(new ViewModel());	
			});
    } 
	else {
       alert("Geolocation is not supported by this browser");
        map = new google.maps.Map(document.getElementById('map'), {
            center: {lat: 47.6062, lng: -122.3321},
            zoom: 12,
            mapTypeControl: false, //Sticks to the classic mapType
            minZoom: 5,
            streetViewControl: false
       });
	       ko.applyBindings(new ViewModel());
    }
}

//Error handling for map

function errorHandling() {
    alert('Google maps has failed to load. Please reload the page and try again!');
}



//Class to store each SkateSpot information
let SkateSpot = function (skateSpot) {
    this.name = ko.observable();
	this.id = ko.observable();
    this.lat = ko.observable();
    this.lng = ko.observable();
    this.id = ko.observable();
    this.streetAddress = ko.observable('');
    this.marker = ko.observable();
    this.visible = ko.observable(false);
	this.comments = ko.observableArray();
	this.meetups = ko.observableArray();
	this.rating = ko.observable();
};

//function that gets data from server and sends the data to the callback function for processing 
function AjaxGet(url, callback)
{
	$.ajax({
			url:url,
			method: "GET",
			datatype: "json",
			success: function (data) {
				callback(data);
			},
			error: function(object, textStatus, errorThrown){			
				alert("Could not get SkateSpots! please reload Browser");
			}
	});
}

//function that posts json data to server
function AjaxPost(url,data, callback)
{
	$.ajax({
			url:url,
			method: "POST",
			accept: "application/json",
            contentType: "application/json",
			datatype: "json",
			data: JSON.stringify(data)
	}).done(function (data) {
		console.log(data);
				callback(data);
	}).fail(function(object, textStatus, errorThrown){
				alert("Could not connect to the server! please reload browser");
	});
}
//function that posts json data to server
function AjaxPatch(url,data, callback)
{
	$.ajax({
			url:url,
			method: "PATCH",
			accept: "application/json",
            contentType: "application/json",
			datatype: "json",
			data: JSON.stringify(data)
	}).done(function (data) {
				callback(data);
	}).fail(function(object, textStatus, errorThrown){
				alert("Could not connect to the server! please reload browser");
	});
}

function yayRating()
{
	document.getElementsByClassName("yayBtn")[0].disabled = true;
	var spotPatchData = {};	
	if(curUser.likeSpot.indexOf(curSkateSpot.id + "yay") !== -1)
	{
		curSkateSpot.rating = curSkateSpot.rating - 1;
		curUser.likeSpot.splice(curUser.likeSpot.indexOf(curSkateSpot.id + "yay"),1);
			
	}
	else if (curUser.likeSpot.indexOf(curSkateSpot.id + "nay") !== -1)
	{
		curSkateSpot.rating = curSkateSpot.rating + 2;
		
		curUser.likeSpot.splice(curUser.likeSpot.indexOf(curSkateSpot.id + "nay"),1);	
		curUser.likeSpot.push(curSkateSpot.id + "yay");			
	}
	else if ((curUser.likeSpot.indexOf(curSkateSpot.id + "nay") === -1) && (curUser.likeSpot.indexOf(curSkateSpot.id + "yay") === -1))
	{
		curSkateSpot.rating = curSkateSpot.rating + 1;
		curUser.likeSpot.push(curSkateSpot.id + "yay");
	}
	
		spotPatchData["rating"] = curSkateSpot.rating;

		//patches the skatespot data to include the new rating and or comment
		AjaxPatch(link +"skateSpots/"+ String(curSkateSpot.id) + "?access_token=" + String(curUser.key), spotPatchData ,function(data){
			
					//patches the skatespot data to include the new rating and or comment
			AjaxPatch(link + "users/"+ String(curUser.id) + "?access_token=" + String(curUser.key), curUser ,function(data){
	
				sessionStorage.setItem("curUser", JSON.stringify(curUser));
				document.getElementsByClassName("yayBtn")[0].disabled = false;

			});
		});
	
}

function nayRating()
{
	document.getElementsByClassName("nayBtn")[0].disabled = true;
	var spotPatchData = {};	
	if(curUser.likeSpot.indexOf(curSkateSpot.id + "yay") !== -1)
	{
			curSkateSpot.rating = curSkateSpot.rating - 2;
			curUser.likeSpot.splice(curUser.likeSpot.indexOf(curSkateSpot.id + "yay"),1);
			curUser.likeSpot.push(curSkateSpot.id + "nay");
			
	}
	else if (curUser.likeSpot.indexOf(curSkateSpot.id + "nay") !== -1)
	{
			curSkateSpot.rating = curSkateSpot.rating + 1;
			curUser.likeSpot.splice(curUser.likeSpot.indexOf(curSkateSpot.id + "nay"),1);		
	}
	else if ((curUser.likeSpot.indexOf(curSkateSpot.id + "nay") === -1) && (curUser.likeSpot.indexOf(curSkateSpot.id + "yay") === -1))
	{
		curSkateSpot.rating = curSkateSpot.rating - 1;
		curUser.likeSpot.push(curSkateSpot.id + "nay");
	}
	
		spotPatchData["rating"] = curSkateSpot.rating;

		//patches the skatespot data to include the new rating and or comment
		AjaxPatch(link + "skateSpots/"+ String(curSkateSpot.id) + "?access_token=" + String(curUser.key), spotPatchData ,function(data){
			
					//patches the skatespot data to include the new rating and or comment
			AjaxPatch(link + "users/"+ String(curUser.id) + "?access_token=" + String(curUser.key), curUser ,function(data){
	
				sessionStorage.setItem("curUser", JSON.stringify(curUser));
				document.getElementsByClassName("nayBtn")[0].disabled = false;

			});
		});
}

//needs skateSpot id to patch 
function UpdateComment(comment)
{
	document.getElementById("makeComment").disabled = true;
	var newComment = comment;

	var patchData = {};
	if(newComment !== "")
	{
		if(curSkateSpot.comments.length < 10)
		{
			curSkateSpot.comments.push(newComment);
			patchData["comments"] = curSkateSpot.comments;
		}
		else if (curSkateSpot.comments.length >= 10)
		{
			curSkateSpot.comments.reverse();
			curSkateSpot.comments.pop();
			curSkateSpot.comments.reverse();
			curSkateSpot.comments.push(newComment);
			
		}
			//patches the skatespot data to include the new rating and or comment
		AjaxPatch(link + "skateSpots/"+ String(curSkateSpot.id) + "?access_token=" + String(curUser.key), patchData ,function(data){
			
			document.getElementById("makeComment").disabled = false;
		});
	}
}


function createMeetup()
{
	var day = $("#meetupDay").val();
	var time = $("#meetupTime").val();
	var desc = $("#description").val();
	var date = new Date(day + " " + time);
	var today = new Date();
	
	if(day !== "" && time !== "" && desc !== "" && desc.length <=30 && today < date)
	{
		//insert data from form into here
		var data = {"dayOfMeetup":date,"description":desc, "listOfMembers":["string"]};
	
		AjaxPost(link + "meetups?access_token=" + String(curUser.key), data, function(data){
		
			curSkateSpot.currentMeetups.push(data.id);
				
			var patchData = {"currentMeetups": curSkateSpot.currentMeetups};
			
			//patches the user data to include the new group
			AjaxPatch(link + "skatespots/"+ String(curSkateSpot.id) + "?access_token=" + String(curUser.key), patchData ,function(data){
			
				$('#meetModal').modal('hide');
			
				//input into group ui list here
			});		
		});
	}
	else
	{
			if(day === "" && time === "" && desc === "")
			{
				alert("Please enter in all fields");
			}
			else if(desc.length >=30)
			{
				alert("Description cannot be more that 30 characters");
				
			}
			else if(today > date)
			{
				alert("The Meetup cannot be in the past!");
			}
		
		
	}
	
}

function getMeetups (callback)
{
	var filter = "{\"where\":{\"or\":[";
	var filterEnd = "]}}";
    var count = 0;
	var today = new Date();
	var meetupDay;
	var meetupList = [];
	



	$.each(curSkateSpot.currentMeetups, function(i, value){
		
		filter += "{\"id\":\"" + value + "\"},";
		count++;
	});
	
	filter = filter.replace(/,\s*$/, "");
	filter += filterEnd;
	
	if(count == 1){
		filter = "{\"where\":{\"id\":\"" + curSkateSpot.currentMeetups[0] + "\"}}";
	}
	
	if (count >= 1)
	{
		var meetUpsExpired = [];
		var value;
		//for each group the user has, fetch the group information from the db
		AjaxGet(link+ "meetups?filter="+ filter + "&access_token=" + String(curUser.key), function(data){
			
			for(var i = 0; i < data.length; i++)
			{
				value = data[i];
				meetupDay = new Date(value.dayOfMeetup);
				if(today.getMonth() <=  meetupDay.getMonth())
				{
					if(today.getMonth() ===  meetupDay.getMonth())
					{
						if(today.getDate() <= meetupDay.getDate())
						{
							meetupList.push(value);
						}
						//else
							//AjaxDelete(link +"meetups/"+ String(value.id) + "?access_token=" + String(curUser.key),function(data){});	
					}
					else
					{
						meetupList.push(value);
					}
				}
				else
				{
					//AjaxDelete(link+"meetups/"+ String(value.id) + "?access_token=" + String(curUser.key),function(data){});	
				}
			}
			//test to create a group status: working
			callback(meetupList);
		});
	}
	else{
		
		callback(-1);
		
	}

}

function UpdateFavoriteSkateSpot()
{
	document.getElementById("favBtn").disabled = true;
	var patchData = {};
	
	var index = curUser.favoriteSpot.indexOf(curSkateSpot.id);
	
	//if the current skatespot is not in the curuser favorite spot array
	if(index === -1)
	{
		curUser.favoriteSpot.push(curSkateSpot.id);
	}
	//else if the user wants to unfavorite the spot
	else{
		curUser.favoriteSpot.splice(index,1);
		curSkateSpot.marker.setVisible(false);
	}
	
	patchData = {"favoriteSpot":curUser.favoriteSpot};
	
	//patches the user with new fav skatespots
	AjaxPatch(link+"users/"+ String(curUser.id) + "?access_token=" + String(curUser.key), patchData ,function(data){
		
		sessionStorage.setItem("curUser", JSON.stringify(curUser));
		location.href = 'parks.html';
	});
}

function rightArrowScroll () {
        let currentCmt = jQuery.inArray($('#comment').text(), curSkateSpot.comments);
        if (currentCmt === 0) {
            return;
        } else {
            let nextCmt = currentCmt - 1;
            $('#comment').text(curSkateSpot.comments[nextCmt]);
        }
}
    
function leftArrowScroll() {
        let currentCmt = jQuery.inArray($('#comment').text(), curSkateSpot.comments);
        if (currentCmt === curSkateSpot.comments.length - 1) {
            console.log("No more");
            return;
        } else {
            let previousCmt = currentCmt + 1;
            console.log(previousCmt);
            $('#comment').text(curSkateSpot.comments[previousCmt]);
            if (previousCmt === 1) {
                $('#comment').text(curSkateSpot.comments[1]);
            }
        }
}

function addComment () {
        console.log("works");
        let comment = $('#commentText').val();
        UpdateComment(comment);
        $('#commentModal').modal('hide');
        $('#comment').text(curSkateSpot.comments[curSkateSpot.comments.length - 1]);
}

let ViewModel = function () {
    //Function for sidebar animation
    self = this;
	
	var i = 0;
	
	var skateSpots = [];
	let markers = ko.observableArray([]);
	self.uiList = ko.observableArray([]);
	self.uiMeetupList = ko.observableArray([]);
	
	    //Init infowindow
    let infoWindow = new google.maps.InfoWindow({
        maxWidth: 450
    }), //Init marker
        marker;
    

	
	
	var filter = "{\"where\":{\"or\":[";
	var filterEnd = "]}}";
	
	for (i = 0; i < curUser.favoriteSpot.length; i++)
	{
		filter += "{\"id\":\"" + curUser.favoriteSpot[i] + "\"},";	
	}
	
	filter = filter.replace(/,\s*$/, "");
	filter += filterEnd;
	
	if(curUser.favoriteSpot.length == 1){
		filter = "{\"where\":{\"id\":\"" + curUser.favoriteSpot[0] + "\"}}";
	}
	
	if (curUser.favoriteSpot.length >= 1)
	{
		//for each group the user has, fetch the group information from the db
		AjaxGet(link+"skateSpots?filter="+ filter + "&access_token=" + String(curUser.key), function(data){
			//console.log(data);
			
		if (data !== null) {
            data.forEach(function (spot) {
                let temp = new SkateSpot();
                temp.name = spot.spotName;
				temp.id = spot.id;
                temp.lat = spot.lat;
                temp.lng = spot.long;
                temp.streetAddress = spot.address;
                temp.comments = spot.comments;
                temp.rating = spot.rating;
				temp.currentMeetups = spot.currentMeetups;
                skateSpots.push(temp);
            });
        //sets the InfoWindow and Marker for each skatespot
            skateSpots.forEach(function(spot) {
                 let contentString = 
                    `<div id="content-info-window">
				    <h2>` + spot.name + `</h2>
				    <h4>` + spot.streetAddress + `</h4>
                    <button id="favBtn" onclick="UpdateFavoriteSkateSpot();">Favorite</button><br>
					<button id="meetupBtn" data-toggle="modal" data-target="#meetModal">Make Meetup</button><br>
					<button id="viewmeetupBtn"  data-toggle="modal" data-target="#vmeetModal" data-bind = "click: getMeetups">View Current Meetups</button><br>
                    <div id="comment-box"><button id="commentButton" data-toggle="modal" data-target="#commentModal"><i class="fa fa-plus-square"></i></button><span id="comment">` + spot.comments[spot.comments.length - 1] + `</span><div id="arrowDiv"><button type=button id="leftArrowCmt" class="arrowBtn"><i class="fa fa-arrow-left" onclick="leftArrowScroll()"></button></i><button type=button id="rightArrowCmt" class="arrowBtn"><i class="fa fa-arrow-right" onclick="rightArrowScroll()"></i></button></div></div>
                    <div id="buttons">
                        <div class="box-third"><button class="yayBtn" onclick ="yayRating()">Yay </button></div>
					   <div class="box-third"><h3>` + spot.rating + `</h3></div>
                        <div class="box-third"><button class="nayBtn" onclick ="nayRating()">Nay </button></div></div>
                        <div style="clear: both;"></div>
                    </div>`;
                marker = new google.maps.Marker({
                    position: new google.maps.LatLng(spot.lat, spot.lng),
                    map: map,
                    title: spot.name,
                    animation: google.maps.Animation.DROP,
                    width: 20
                });
				
				self.uiList.push(spot);
				
                spot.marker = marker;
                //On click event listener for the markers
                google.maps.event.addListener(spot.marker, 'click', function() {
					curSkateSpot = spot;
					//UpdateFavoriteSkateSpot(spot); used at test
                    infoWindow.open(map, this);
                    spot.marker.setAnimation(google.maps.Animation.BOUNCE);
                    setTimeout(function() {
                        spot.marker.setAnimation(null);
                    }, 500);
                
                    infoWindow.setContent(contentString);
					$('#meetUpSpotName').text(curSkateSpot.name);
                    $('#meetUpSpotAddress').text(curSkateSpot.streetAddress);
                    if (spot.comments.length === 0) {
                        $('#comment').text("No comments yet available!");
                    } 
                });
                markers.push(marker);		  

            });		
        }
		});
	}
	
	self.openSpot = function(spot) {
		map.setCenter({lat:spot.lat,lng:spot.lng});
		map.setZoom(15);
		google.maps.event.trigger(spot.marker, 'click', {});
		
		
	};
	
	    let panelVis = false,
        sidebar = $('#side-bar'),
        menuButton = $("#menu-button"),
        pinModal = $('#createPin');
    
    self.closePanel = function() {
        sidebar.css("width", "0");
        setTimeout(function() { 
            $('#side-bar .list').css("visibility", "hidden"); 
        }, 200);
        panelVis = false;
    };
    
    self.openPanel = function() {
        sidebar.css("width", "15%");
        setTimeout(function() { $('#side-bar a').css("visibility", "visible"); }, 200);       
        panelVis = true;
    };
	
	   self.openModal = function() {
        pinModal.modal('show');  
    };
	
		$( "#vmeetModal" ).on('shown.bs.modal', function(){
		getMeetups( function(temp){
	
			var ul = document.getElementById("parentListMeetup");
			while(ul.firstChild) ul.removeChild(ul.firstChild);
			self.uiMeetupList([]);
			
			var tempList = temp;
			var tempDate;
			var tmpMinString;
			var TmpHourString;
			var amOrPm;
			
			if(temp != -1)
			{
				for(var i = 0;  i < tempList.length; i++)
				{
					tempDate = new Date(temp[i].dayOfMeetup);
					if(tempDate.getMinutes() < 10)
					{
						tmpMinString = "0" + String(tempDate.getMinutes());
					}
					else
					{
						tmpMinString = String(tempDate.getMinutes());
					}
					
					if(tempDate.getHours() > 12)
					{
						tmpHourString = String(tempDate.getHours() - 12);
						amOrPm = "PM";
					}
					else
					{
						if(tempDate.getHours() == 0)
						{
							tmpHourString = "12";
						}
						else{
							tmpHourString = String(tempDate.getHours());
						}
						amOrPm = "AM";
					}
				
					tempList[i].dayOfMeetup =  tempDate.toDateString() + " @ " + tmpHourString + ":" + tmpMinString + " " + amOrPm;
					self.uiMeetupList.push(tempList[i]);
				}
			}
		});			
	});
};




