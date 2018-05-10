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
		AjaxPatch(link + "skateSpots/"+ String(curSkateSpot.id) + "?access_token=" + String(curUser.key), spotPatchData ,function(data){
			
					//patches the skatespot data to include the new rating and or comment
			AjaxPatch(link+"users/"+ String(curUser.id) + "?access_token=" + String(curUser.key), curUser ,function(data){
	
				sessionStorage.setItem("curUser", JSON.stringify(curUser));
				console.log(data);
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
		AjaxPatch(link+"skateSpots/"+ String(curSkateSpot.id) + "?access_token=" + String(curUser.key), spotPatchData ,function(data){
			
					//patches the skatespot data to include the new rating and or comment
			AjaxPatch(link+"users/"+ String(curUser.id) + "?access_token=" + String(curUser.key), curUser ,function(data){
	
				sessionStorage.setItem("curUser", JSON.stringify(curUser));
				console.log(data);
			});
		});
}

//needs skateSpot id to patch 
function UpdateComment(comment)
{
	var newComment = comment;

	var patchData = {};
	if(newComment !== "" && curSkateSpot.comments.length < 10)
	{
		curSkateSpot.comments.push(newComment);
		patchData["comments"] = curSkateSpot.comments;
	}else if (curSkateSpot.comments.length >= 10)
	{
		curSkateSpot.comments.reverse();
		curSkateSpot.comments.pop();
		curSkateSpot.comments.reverse();
		curSkateSpotcomments.push(newComment);
		
	}

		//patches the skatespot data to include the new rating and or comment
	AjaxPatch(link+"skateSpots/"+ String(curSkateSpot.id) + "?access_token=" + String(curUser.key), patchData ,function(data){
			
		console.log(data);
			
		//input into ui here
	});
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
		curSkateSpot.marker.setVisible(false);
	}
	
	patchData = {"favoriteSpot":curUser.favoriteSpot};
	
	//patches the user with new fav skatespots
	AjaxPatch(link+"users/"+ String(curUser.id) + "?access_token=" + String(curUser.key), patchData ,function(data){
		
		sessionStorage.setItem("curUser", JSON.stringify(curUser));
		location.href = 'parks.html';
	});
}


let ViewModel = function () {
    //Function for sidebar animation
    self = this;
	
	var i = 0;
	
	var skateSpots = [];
	let markers = ko.observableArray([]);
	self.uiList = ko.observableArray([]);
	
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
				    <p>` + spot.streetAddress + `</p>
                    <button id="favBtn" onclick="UpdateFavoriteSkateSpot();">Favorite</button><br>
                    <div id="comment-box"></div>
  					<div class='button-wrapper'>
					<div id = "rating">
                    <button id="yayBtn" onclick ="yayRating();">Yay </button>
				    <h4></h4>
                    <button id="nayBtn" onclick ="nayRating();">Nay </button></div>
					</div>
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
};




