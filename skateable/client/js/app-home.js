/*global $, document, google, ko, theaters, ajax, setTimeout, console, alert, window, location, sessionStorage, navigator*/
/*jshint esversion: 6 */
var map;

var link = "http://localhost:3000/api/";
var curSkateSpot = {};
var curUser = JSON.parse(sessionStorage.getItem("curUser"));


	
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
//function that posts json data to server
function AjaxDelete(url, callback)
{
	$.ajax({
			url:url,
			method: "DELETE",
			accept: "application/json",
            contentType: "application/json",
			datatype: "json",
	}).done(function (data) {
				callback(data);
	}).fail(function(object, textStatus, errorThrown){
				alert("Could not connect to the server! please reload browser");
	});
}

function yayRating()
{
	
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

			});
		});
	
}

function nayRating()
{
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

			});
		});
}

//needs skateSpot id to patch 
function UpdateComment(comment)
{
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
		AjaxPatch(link + "skateSpots/"+ String(curSkateSpot.id) + "?access_token=" + String(curUser.key), patchData ,function(data){});
	}
}

function UpdateFavoriteSkateSpot()
{
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
	}
	
	patchData = {"favoriteSpot":curUser.favoriteSpot};
	
	//patches the user with new fav skatespots
	AjaxPatch(link +"users/"+ String(curUser.id) + "?access_token=" + String(curUser.key), patchData ,function(data){
		
		sessionStorage.setItem("curUser", JSON.stringify(curUser));
	

			
		//input into ui here
	});
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
			if(day === "" || time === "" || desc === "")
			{
				alert("Please enter in all fields");
			}
			else if(desc.length >=160)
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
	this.comments = [];
	this.currentMeetups = [];
	this.rating = 0;
};

//class to store each meetup at a skatespot
let meetup = function(meetup){
	this.id = ko.observable();
	this.dayofMeetup = ko.observable();
	this.description = ko.observable();
};

//to store each group
let group = function(group){
	this.id = ko.observable();
	this.name = ko.observable();
	this.members= ko.observableArray();
};

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
    let self = this;
    
    let geocoder = new google.maps.Geocoder();
	
	var skateSpots = [];
	let markers = ko.observableArray([]);
	self.uiList = ko.observableArray([]);


    
    //Init infowindow
    let infoWindow = new google.maps.InfoWindow({
        maxWidth: 400
    }), //Init marker
        marker;
    let searchBox = new google.maps.places.Autocomplete(document.getElementById("places-search"));
    searchBox.setBounds(map.getBounds());
    
    AjaxGet(link + "skatespots?access_token=" + curUser.key, function(data){
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
                
                spot.marker = marker;
                //On click event listener for the markers
                google.maps.event.addListener(spot.marker, 'click', function() {
					curSkateSpot = spot;
                    
					//UpdateFavoriteSkateSpot(spot); //used as test
                    infoWindow.open(map, this);
                    map.panTo(this.getPosition());
                    setTimeout(function() {
                        spot.marker.setAnimation(null);
                    }, 500);
                
                    infoWindow.setContent(contentString);
                    $('#meetUpSpotName').text(curSkateSpot.name);
                    $('#meetUpSpotAddress').text(curSkateSpot.streetAddress);
                    if (spot.comments.length === 0) {
                        $('#comment').text("No comments yet available!");
                    } 
                    //Code to change Favorite button color if already favorite
                    /*if (jQuery.inArray(curSkateSpot.id, curUser.favoriteSpot !== -1)) {
                        $('#favBtn').css("background-color", "yellow");
                    } else {
                        $('#favBtn').css("background-color", "white");
                    }
                    console.log(jQuery.inArray(curSkateSpot.id, curUser.favoriteSpot));*/
                    
                });
                markers.push(marker);
            });
		
        }
    });
	
    self.getLocation = function() {
		
		document.getElementById("current-location").disabled = true;
		
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function(position) {
                let crd = position.coords;
                let latlng = { lat: crd.latitude, lng: crd.longitude }; 
                geocoder.geocode({location: latlng}, function(results, status) {
                    if (status === "OK") {
                        if (results[0])
                            $('#places-search').val(results[0].formatted_address);
                    }
                });
                
                console.log('Your current position is:');
                console.log(`Latitude : ${crd.latitude}`);
                console.log(`Longitude: ${crd.longitude}`);
                console.log(`More or less ${crd.accuracy} meters.`);
				
				document.getElementById("current-location").disabled = false;
            });
        } else {
            alert("Geolocation is not supported by this browser");
        }
    };
    
    self.setPin = function() {
		document.getElementById("yesButton").disabled = true;
		
        var pinAddress = $('#places-search').val();
        var pinName = $('#pinName').val();
        if (pinAddress !== '' && pinName !== '') {
            geocoder.geocode({'address': pinAddress}, function(results, status) {
                if (status === 'OK') {
					
					var dataToPost = {"lat":results[0].geometry.location.lat(), "long":results[0].geometry.location.lng(), "spotName": pinName, "address": pinAddress, "rating":0, "comments": [$('#commentInput').val()], "currentMeetups": []};
					
					var filter = {"where":{"and":[{"lat":dataToPost.lat},{"long":dataToPost.long }]}};
	
					AjaxGet(link + "skatespots?filter="+ JSON.stringify(filter) +"&access_token=" + curUser.key, function(data){

					if(data.length === 0)
					{
						AjaxPost(link+"skatespots?access_token=" + String(curUser.key), dataToPost, function(newSpot){
							curSkateSpot = newSpot;

							UpdateFavoriteSkateSpot(curSkateSpot);
						
							document.getElementById("yesButton").disabled = false;
							//if this runs then the pin was successfully created in db
							map.setCenter(results[0].geometry.location);
							map.setZoom(15);
							let markerPark = new google.maps.Marker({
								map: map,
								position: results[0].geometry.location,
								title: pinName
							});
							let contentString = 
                    `<div id="content-info-window">
				    <h2>` + curSkateSpot.spotName + `</h2>
				    <h4>` + pinAddress + `</h4>
                    <button id="favBtn" onclick="UpdateFavoriteSkateSpot();">Favorite</button><br>
					<button id="meetupBtn" data-toggle="modal" data-target="#meetModal">Make Meetup</button><br>
					<button id="viewmeetupBtn"  data-toggle="modal" data-target="#vmeetModal" data-bind = "click: getMeetups">View Current Meetups</button><br>
                    <div id="comment-box"><button id="commentButton" data-toggle="modal" data-target="#commentModal"><i class="fa fa-plus-square"></i></button><span id="comment">` + curSkateSpot.comments[curSkateSpot.comments.length - 1] + `</span><div id="arrowDiv"><button type=button id="leftArrowCmt" class="arrowBtn"><i class="fa fa-arrow-left" onclick="leftArrowScroll()"></button></i><button type=button id="rightArrowCmt" class="arrowBtn"><i class="fa fa-arrow-right" onclick="rightArrowScroll()"></i></button></div></div>
                    <div id="buttons">
                        <div class="box-third"><button class="yayBtn" onclick ="yayRating()">Yay </button></div>
					   <div class="box-third"><h3>` + curSkateSpot.rating + `</h3></div>
                        <div class="box-third"><button class="nayBtn" onclick ="nayRating()">Nay </button></div></div>
                        <div style="clear: both;"></div>
                    </div>`;
							google.maps.event.addListener(markerPark, 'click', function() {
								curSkateSpot = data;
								infoWindow.open(map, this);
								infoWindow.setContent(contentString);
								
							});
						
							$('#createPin').modal('hide');
						});
					}
					else
					{
						document.getElementById("yesButton").disabled = false;
						alert("Skatespot already exists");
					}
					});
				} else {
					document.getElementById("yesButton").disabled = false;
					alert('Geocode was not successful for the following reason: ' + status);
				}						
			});
        } else if (pinName === '' && pinAddress !== '') {
			document.getElementById("yesButton").disabled = false;
            alert('Please enter a name!');
        } else if (pinName !== '' && pinAddress === '') {
			document.getElementById("yesButton").disabled = false;
            alert('Please enter an address!');
        } else {
			document.getElementById("yesButton").disabled = false;
            alert('Please enter a name and address!');
        }
    };
	
    
    
    //Function for sidebar animation
    
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
    
    //Create a pin modal function
    
    self.openModal = function() {
        pinModal.modal('show');  
    };
	
	$( "#vmeetModal" ).on('shown.bs.modal', function(){
		getMeetups( function(temp){
	
			var ul = document.getElementById("parentList");
			while(ul.firstChild) ul.removeChild(ul.firstChild);
			self.uiList([]);
			
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
					self.uiList.push(tempList[i]);
				}
			}
		});			
	});
		


};
