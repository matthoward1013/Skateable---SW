/*global $, document, google, ko, theaters, ajax, setTimeout, console, alert, window*/
/*jshint esversion: 6 */
let map;



//Initiliazes  the map, using the center of WA state as the center
function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 47.6062, lng: -122.3321},
        zoom: 12,
        mapTypeControl: false //Sticks to the classic mapType
    });
    ko.applyBindings(new ViewModel());
}

//Error handling for map

function errorHandling() {
    alert('Google maps has failed to load. Please reload the page and try again!');
}

//Class to store each theater information
let Park = function (park) {
    this.title = ko.observable(park.title);
    this.lat = ko.observable(park.position.lat);
    this.lng = ko.observable(park.position.lng);
    this.id = ko.observable(park.id);
    this.streetAddress = ko.observable('');
    this.cityStateZip = ko.observable('');
    this.number = ko.observable('');
    this.url = ko.observable('');
    this.marker = ko.observable();
    this.visible = ko.observable(true);
};

let ViewModel = function () {
    let self = this;
    
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
    
    let panelVis = false,
        sidebar = $('#side-bar'),
        menuButton = $("#menu-button"),
        pinModal = $('#createPin');
    
    self.closePanel = function() {
        sidebar.css("width", "0");
        panelVis = false;
    };
    
    self.openPanel = function() {
        sidebar.css("width", "20%");
        panelVis = true;
    };
    
    self.openModal = function() {
        pinModal.modal('show');  
    };
};