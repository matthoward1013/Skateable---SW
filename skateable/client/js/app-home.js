/*global $, document, google, ko, theaters, ajax, setTimeout, console, alert, window, location, sessionStorage, navigator*/
/*jshint esversion: 6 */
let map;

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
            });
    } else {
        alert("Geolocation is not supported by this browser");
        map = new google.maps.Map(document.getElementById('map'), {
            center: {lat: 47.6062, lng: -122.3321},
            zoom: 12,
            mapTypeControl: false, //Sticks to the classic mapType
            minZoom: 5,
            streetViewControl: false
        });
    }
    
    
    
    ko.applyBindings(new ViewModel());
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
		console.log(data);
				callback();
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



//needs skateSpot id to patch 
function UpdateSkateSpot()
{
	var newComment = "from ui text";
	var newRating = 1;//from skateSpot window

	var patchData = {};
	if(newComment !== "")
	{
		curSkateSpot.comments.push(newComment);
		patchData["comments"] = curSkateSpot.comments;
	}
	if(newRating !== curSkateSpot.rating)
	{
		curSkateSpot.rating = curSkateSpot.rating + newRating;
		patchData["rating"] = curSkateSpot.rating;
	}

		//patches the skatespot data to include the new rating and or comment
	AjaxPatch("http://localhost:3000/api/skateSpots/"+ String(curSkateSpot.id) + "?access_token=" + String(curUser.key), patchData ,function(data){
			
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
	}
	
	patchData = {"favoriteSpot":curUser.favoriteSpot};
	
	//patches the user with new fav skatespots
	AjaxPatch("http://localhost:3000/api/users/"+ String(curUser.id) + "?access_token=" + String(curUser.key), patchData ,function(data){
		
		sessionStorage.setItem("curUser", JSON.stringify(curUser));
	
		console.log(data);
			
		//input into ui here
	});
}

function GetMeetups()
{
	var filter = "{\"where\":{\"or\":[";
	var filterEnd = "]}}";
    let count = 0;
    let meetupList = [];
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
		//for each group the user has, fetch the group information from the db
		AjaxGet("http://localhost:3000/api/meetups?filter="+ filter + "&access_token=" + String(curUser.key), function(data){
			//console.log(data);
			
			$.each(data, function(i, value){
				meetupList.push(value);
			});	
			
			//test to create a group status: working
		});
	}
}

function CreateMeetup()
{
	let meetupList = curSkateSpot.meetups;
	//insert data from form into here
	var data = {"dayOfMeetup":"","description":"","listOfMembers": [curUser.name]};
	
	AjaxPost("http://localhost:3000/api/meetups?access_token=" + String(curUser.key), data, function(data){
		
		meetupList.push(data);
		curSkateSpot.meetups.push(data.id);
				
		var patchData = {"meetups": curSkateSpot.meetups};
		
		//patches the user data to include the new group
		AjaxPatch("http://localhost:3000/api/skatespots/"+ String(curSkateSpot.id) + "?access_token=" + String(curUser.key), patchData ,function(data){
			
			return data;
			
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
	AjaxPatch("http://localhost:3000/api/meetups/"+ String(curMeetup.id) + "?access_token=" + String(curUser.key), patchData ,function(data){
			
		console.log(data);
			
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
    
    AjaxGet("http://localhost:3000/api/skatespots?access_token=" + curUser.key, function(data){
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
                    <div id="comment-box"></div>
                    <button id="yayBtn">Yay </button>
                    <button id="nayBtn">Nay </button>
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
					console.log(curSkateSpot);
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
    
	//listen for the bounds to be created and fetch the current skateSpots
    /*google.maps.event.addListenerOnce(map, 'bounds_changed', function() {
		  
		var bounds = map.getBounds(),
            northC  =   bounds.getNorthEast().lat(),   
            eastC   =   bounds.getNorthEast().lng(),
            southC  =   bounds.getSouthWest().lat(),   
            westC   =   bounds.getSouthWest().lng(); 
	
		var filter = {"where":{"and":[{"lat":{"between": [(southC),northC]}},{"long": {"between": [westC, eastC]}}]}};
		
		//below gets every skatespot in db
		//AjaxGet("http://localhost:3000/api/skatespots?access_token=" + curUser.key, function(data){});
		AjaxGet("http://localhost:3000/api/skatespots" +"?filter="+ JSON.stringify(filter) +"&access_token=" + curUser.key, function(data){
			
			if(data.length === 0)
				alert("there are no skateSpots in your area. Be the first to create one by hitting the create pin button!");
			else {
                //Sets all skatespot data to Skatespots array	
		      console.log(data[0].spotName);
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
                        infoWindow.open(map, this);
                        spot.marker.setAnimation(google.maps.Animation.BOUNCE);
                        setTimeout(function() {
                            spot.marker.setAnimation(null);
                        }, 500);
                    
                        infoWindow.setContent(contentString);
                    });
                    markers.push(marker);
                });
		//use markers here since Ajax uses async so if markers are used outside of this callback function it could be undefined.
		//This is due to async continuing through the rest of the code instead of waiting for the server to finish fetching data.
                markers().forEach(function(marker) {
                    marker.setMap(map);
                    bounds.extend(marker.position);
                });
                //map.fitBounds(bounds);
                
				console.log(skateSpots);
			}
					
		});	  
	});*/   

	  
    
    //Create each marker on map
   

	
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
	
					AjaxGet("http://localhost:3000/api/skatespots" +"?filter="+ JSON.stringify(filter) +"&access_token=" + curUser.key, function(data){
						console.log(data);
					if(data.length === 0)
					{
						AjaxPost("http://localhost:3000/api/skatespots?access_token=" + String(curUser.key), dataToPost, function(){
							
							UpdateFavoriteSkateSpot(data);
						
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
									<h2>` + pinName + `</h2>
									<p>` + pinAddress + `</p>
								</div>`;
							google.maps.event.addListener(markerPark, 'click', function() {
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
