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

//Class to store each SkateSpot information
let SkateSpot = function (skateSpot) {
	this.id = ko.observable(skateSpot.name);
    this.name = ko.observable(skateSpot.name);
    this.lat = ko.observable(skateSpot.position.lat);
    this.lng = ko.observable(skateSpot.position.lng);
    this.id = ko.observable(skateSpot.id);
    this.streetAddress = ko.observable('');
    this.marker = ko.observable();
    this.visible = ko.observable(true);
	this.comments = ko.observableArray();
	this.rating = ko.observable();
};

//class to store each meetup at a skatespot
let meetup = function(meetup){
	this.id = ko.observable();
	this.dayofMeetup = ko.observable();
	this.description = ko.observable();
};
//class to store the user
let User = function(user){
	this.id = ko.observable();
	this.key = ko.observable();
	this.name = ko.observable();
	this.email = ko.observabe();
	this.password = ko.observable();
	this.bio = ko.observable();
};
//to store each group
let group = function(group){
	this.id = ko.observable();
	this.name = ko.observable();
	this.members= ko.observableArray();
	//this.chat = ko
};


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
				alert("Could not connect to the server! please reload Browser");
			}
	});
}

function GetSkateSpots(curUser)
{
	northC  =   map.getBounds().getNorthEast().lat();   
    eastC   =   map.getBounds().getNorthEast().lng();
    southC  =   map.getBounds().getSouthWest().lat();   
    westC   =   map.getBounds().getSouthWest().lng(); 
	
	//var filter = {"where":{"and":[{"lat":{"between": [0,0]}},{"long": {"between": [0, 0]}}]}};
	
	
	//AjaxGet("http://localhost:3000/api/skatespots" + "?filter" + filter + "&access_token=" + String(curUser.key), function(data){
	//	alert("hi");
	//});
	
	
}

function AjaxPost(url,data)
{
	$.ajax({
			url:url,
			method: "POST",
			accept: "application/json",
            contentType: "application/json",
			datatype: "json",
			data: JSON.stringify(data)
	}).done(function (data) {
				alert("Successfully Posted new Pin!");
	}).fail(function(object, textStatus, errorThrown){
				alert("Could not connect to the server! please reload browser");
	});
}

function PostSkateSpot(userKey, data)
{
	AjaxPost("http://localhost:3000/api/skatespots?access_token=" + String(userKey), data);
	
}

let ViewModel = function () {
    let self = this;
    
    let geocoder = new google.maps.Geocoder();
    
  	var curUser = JSON.parse(sessionStorage.getItem("curUser"));
	
	if(curUser === null)
		alert("not logged in test");
    
    //Search box methods
        
    
    let markers = ko.observableArray([]);
    
    //Init infowindow
    let infoWindow = new google.maps.InfoWindow({
        maxWidth: 200
    }), //Init marker
        marker;
    
    //Create each marker on map
    
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
