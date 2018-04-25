/*global $, document, google, ko, theaters, ajax, setTimeout, console, alert, window, location, sessionStorage, navigator*/
/*jshint esversion: 6 */
let map;


//Initiliazes  the map, using the center of WA state as the center
function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 47.6062, lng: -122.3321},
        zoom: 12,
        mapTypeControl: false, //Sticks to the classic mapType
        minZoom: 5,
        streetViewControl: false
    });
    
    
    
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
				callback();
	}).fail(function(object, textStatus, errorThrown){
				alert("Could not connect to the server! please reload browser");
	});
}


//Class to store each SkateSpot information
let SkateSpot = function (skateSpot) {
    this.name = ko.observable(skateSpot.name);
    this.lat = ko.observable(skateSpot.lat);
    this.lng = ko.observable(skateSpot.lng);
    this.id = ko.observable(skateSpot.id);
    this.streetAddress = ko.observable('');
    this.marker = ko.observable();
    this.visible = ko.observable(true);
	this.comments = ko.observableArray(skateSpot.comments);
	this.meetups = ko.observableArray(skateSpot.meetups);
	this.rating = ko.observable(skateSpot.rating);
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
    
  	var curUser = JSON.parse(sessionStorage.getItem("curUser"));
	
	if(curUser === null)
		alert("not logged in test");
	
	var skateSpots = [];
	let markers = ko.observableArray([]);
    
    //Init infowindow
    let infoWindow = new google.maps.InfoWindow({
        maxWidth: 200
    }), //Init marker
        marker;
    
	//listen for the bounds to be created and fetch the current skateSpots
    google.maps.event.addListenerOnce(map, 'bounds_changed', function() {
		  
		var bounds = map.getBounds(),
            northC  =   bounds.getNorthEast().lat(),   
            eastC   =   bounds.getNorthEast().lng(),
            southC  =   bounds.getSouthWest().lat(),   
            westC   =   bounds.getSouthWest().lng(); 
	
		var filter = {"where":{"and":[{"lat":{"between": [(southC),northC]}},{"long": {"between": [westC, eastC]}}]}};
	
		AjaxGet("http://localhost:3000/api/skatespots" +"?filter="+ JSON.stringify(filter) +"&access_token=" + curUser.key, function(data){
			
			if(data.length === 0)
				alert("there are no skateSpots in your area. Be the first to create one by hitting the create pin button!");
			else {
				
				/*$.each(data, function(i, value){
					skateSpots[i] = value;
				});	*/		
		
                data.forEach(function (spot) {
                    skateSpots.push(new SkateSpot(spot)); 
                });
                
                skateSpots.forEach(function(spot) {
                    marker = new google.maps.Marker({
                        position: new google.maps.LatLng(spot.lat(), spot.lng()),
                        map: map,
                        title: spot.name(),
                        animation: google.maps.Animation.DROP,
                        width: 20
                    });
                });
		//use markers here since Ajax uses async so if markers are used outside of this callback function it could be undefined.
		//This is due to async continuing through the rest of the code instead of waiting for the server to finish fetching data. 
			
                
				console.log(skateSpots);
				
				    self.showMarkers = function() {
        let bounds = new google.maps.LatLngBounds();
        markers().forEach(function(marker) {
            marker.setMap(map);
            bounds.extend(marker.position);
        });
        map.fitBounds(bounds);
        return true;
    };
					
					    
    self.hideMarkers = function() {
        markers().forEach(function(marker) {
           marker.setMap(null); 
        });
        return true;
    };
			}
					
		});	  
	});   

	  
    
    //Create each marker on map
   
    
        let searchBox = new google.maps.places.Autocomplete(document.getElementById("places-search"));
    searchBox.setBounds(map.getBounds());
    
    self.getLocation = function() {
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
            });
        } else {
            alert("Geolocation is not supported by this browser");
        }
    };
    
    self.setPin = function() {
        let pinAddress = $('#places-search').val();
        let pinName = $('#pinName').val();
        if (pinAddress !== '' && pinName !== '') {
            geocoder.geocode({'address': pinAddress}, function(results, status) {
                if (status === 'OK') {
					
					var data = {"lat":results[0].geometry.location.lat(), "long":results[0].geometry.location.lng(), "spotName":pinName, "address":pinAddress, "rating":0, "comments": [], "currentMeetups": []};
					
					AjaxPost("http://localhost:3000/api/skatespots?access_token=" + String(curUser.key), data, function(){
						
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
				} else {
					alert('Geocode was not successful for the following reason: ' + status);
				}						

			});
        } else if (pinName === '' && pinAddress !== '') {
            alert('Please enter a name!');
        } else if (pinName !== '' && pinAddress === '') {
            alert('Please enter an address!');
        } else {
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
