/*global $, document, google, ko, theaters, ajax, setTimeout, console, alert, window, location, sessionStorage, navigator*/
/*jshint esversion: 6 */
var map;

var link = "http://localhost:3000/api/";
var curSkateSpot = {};
var curUser = JSON.parse(sessionStorage.getItem("curUser"));
var meetUpList = [];
	
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
		AjaxPatch(link + "api/skateSpots/"+ String(curSkateSpot.id) + "?access_token=" + String(curUser.key), spotPatchData ,function(data){
			
					//patches the skatespot data to include the new rating and or comment
			AjaxPatch(link + "users/"+ String(curUser.id) + "?access_token=" + String(curUser.key), curUser ,function(data){
	
				sessionStorage.setItem("curUser", JSON.stringify(curUser));

			});
		});
}

//needs skateSpot id to patch 
function UpdateComment()
{
	var newComment = "from ui text";

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
	AjaxPatch(link + "skateSpots/"+ String(curSkateSpot.id) + "?access_token=" + String(curUser.key), patchData ,function(data){
			

			
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
	}
	
	patchData = {"favoriteSpot":curUser.favoriteSpot};
	
	//patches the user with new fav skatespots
	AjaxPatch(link +"users/"+ String(curUser.id) + "?access_token=" + String(curUser.key), patchData ,function(data){
		
		sessionStorage.setItem("curUser", JSON.stringify(curUser));
	

			
		//input into ui here
	});
}

function GetMeetups()
{
	var filter = "{\"where\":{\"or\":[";
	var filterEnd = "]}}";
    var count = 0;
	var today = new Date();
	var meetupDay;

	$.each(curSkateSpot.meetups, function(i, value){
		
		filter += "{\"id\":\"" + value + "\"},";
		count++;
	});
	
	filter = filter.replace(/,\s*$/, "");
	filter += filterEnd;
	
	if(count == 1){
		filter = "{\"where\":{\"id\":\"" + curSkateSpot.meetups[0] + "\"}}";
	}
	
	if (count >= 1)
	{
		var meetUpsExpired = [];
		//for each group the user has, fetch the group information from the db
		AjaxGet(link+ "meetups?filter="+ filter + "&access_token=" + String(curUser.key), function(data){

			meetupDay = new Date(value.dayOfMeetup);
			
			$.each(data, function(i, value){
				if(today.getMonth() >=  meetupDay.getMonth())
				{
					if(today.getMonth() ===  meetupDay.getMonth())
					{
						if(today.getDate() >= meetupDay.getDate())
							meetupList.push(value);
						else
							AjaxDelete(link +"meetups/"+ String(value.id) + "?access_token=" + String(curUser.key),function(data){});	
					}
					else
					{
						meetupList.push(value);
					}
				}
				else
				{
					AjaxDelete(link+"meetups/"+ String(value.id) + "?access_token=" + String(curUser.key),function(data){});	
				}
			});
			//test to create a group status: working
		});
	}
}

function CreateMeetup()
{

	//insert data from form into here
	var data = {"dayOfMeetup":"","description":"","listOfMembers": [curUser.name]};
	
	AjaxPost(link + "meetups?access_token=" + String(curUser.key), data, function(data){
		
		meetupList.push(data);
		curSkateSpot.meetups.push(data.id);
				
		var patchData = {"meetups": curSkateSpot.meetups};
		
		//patches the user data to include the new group
		AjaxPatch(link + "skatespots/"+ String(curSkateSpot.id) + "?access_token=" + String(curUser.key), patchData ,function(data){
			
			//return data;
			
			//input into group ui list here
		});		
	});
}

//needs skateSpot id to patch 
function UpdateMeetup()
{
	var patchData = {};
	var newMember = curUser.name;

	curMeetup.members.append(newMember);
	patchData["members"] = curSkateSpot.members;

		//patches the user data to include the new group
	AjaxPatch(link + "meetups/"+ String(curMeetup.id) + "?access_token=" + String(curUser.key), patchData ,function(data){
			
			
		//input into ui here
	});
	
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


let ViewModel = function () {
    let self = this;
    
    let geocoder = new google.maps.Geocoder();
	
	var skateSpots = [];
	let markers = ko.observableArray([]);
    
    //Init infowindow
    let infoWindow = new google.maps.InfoWindow({
        maxWidth: 300
    }), //Init marker
        marker;
    
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
				    <p>` + spot.streetAddress + `</p>

                    <button id="favBtn" onclick="UpdateFavoriteSkateSpot();">Favorite</button><br>

                    <div id="comment-box"></div>
                    <button id="yayBtn" onclick ="yayRating();">Yay </button>
					<p>` + spot.rating + `</p>
                    <button id="nayBtn" onclick ="nayRating();">Nay </button>
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
                });
                markers.push(marker);
            });

			google.maps.event.addListenerOnce(map, 'bounds_changed', function() {
				let searchBox = new google.maps.places.Autocomplete(document.getElementById("places-search"));
				searchBox.setBounds(map.getBounds());
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
		
        let pinAddress = $('#places-search').val();
        let pinName = $('#pinName').val();
        if (pinAddress !== '' && pinName !== '') {
            geocoder.geocode({'address': pinAddress}, function(results, status) {
                if (status === 'OK') {
					
					var dataToPost = {"lat":results[0].geometry.location.lat(), "long":results[0].geometry.location.lng(), "spotName":pinName, "address":pinAddress, "rating":0, "comments": [], "currentMeetups": []};
					
					var filter = {"where":{"and":[{"lat":dataToPost.lat},{"long":dataToPost.long }]}};
	
					AjaxGet(link + "skatespots?filter="+ JSON.stringify(filter) +"&access_token=" + curUser.key, function(data){

					if(data.length === 0)
					{
						AjaxPost(link+"skatespots?access_token=" + String(curUser.key), dataToPost, function(data){
							curSkateSpot = data;

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
				    <h2>` + data.name + `</h2>
				    <p>` + data.streetAddress + `</p>
                    <button id="favBtn" onclick="UpdateFavoriteSkateSpot();">Favorite</button><br>
                    <div id="comment-box"></div>
                    <button id="yayBtn" onclick ="yayRating();">Yay </button>
					<p>` + data.rating + `</p>
                    <button id="nayBtn" onclick ="nayRating();">Nay </button>
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
};
