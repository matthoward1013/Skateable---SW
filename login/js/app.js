/*global $, document, google, ko, theaters, ajax, setTimeout, console, alert, window*/
/*jshint esversion: 6 */
let map;



//Initiliazes  the map, using the center of WA state as the center
function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 47.7511, lng: -120.7401},
        zoom: 7,
        mapTypeControl: false //Sticks to the classic mapType
    });
    ko.applyBindings(new ViewModel());
}

//Error handling for map

function errorHandling() {
    alert('Google maps has failed to load. Please reload the page!');
}

//Class to store each theater information
let Theater = function (theater) {
    this.title = ko.observable(theater.title);
    this.lat = ko.observable(theater.position.lat);
    this.lng = ko.observable(theater.position.lng);
    this.id = ko.observable(theater.id);
    this.streetAddress = ko.observable('');
    this.cityStateZip = ko.observable('');
    this.number = ko.observable('');
    this.url = ko.observable('');
    this.marker = ko.observable();
    this.visible = ko.observable(true);
};

let item = $('li');
    
    if($("#theater-search").is(":focus")) {
        $(document).keydown(function(e) {
            if (e.keycode == 40) {
                if (item === $('li:nth-child(1)')) {
                    item.focus();
                    item.hover();
                } else if (item.next() !== null) {
                    item = item.next();
                    item.focus();
                    item.hover();
                }
            }
            if (e.keycode == 38) {
                if (item.prev() !== null) {
                    item = item.prev();
                    item.focus();
                    item.hover();
                }
            }
        });       
    }

let ViewModel = function () {
    let self = this;
    
    
    this.theaterList = ko.observableArray([]);
    let markers = ko.observableArray([]);
    theaters.forEach(function (theater) {
       self.theaterList.push(new Theater(theater)); 
    });
    
    //Init infowindow
    let infoWindow = new google.maps.InfoWindow({
        maxWidth: 200
    }), //Init marker
        marker;
    
    //Create each marker on map
    self.theaterList().forEach(function (theater) {
        marker = new google.maps.Marker({
            position: new google.maps.LatLng(theater.lat(), theater.lng()),
            map: map,
            title: theater.title(),
            animation: google.maps.Animation.DROP,
            width: 20
        });
        
        theater.marker = marker;
        
        //Link to the Foursquare API using AJAX
        $.ajax({
            url: 'https://api.foursquare.com/v2/venues/' + theater.id() + '?client_id=323QBSQL3C0K45DMRUQAWST434FEIWKRYNDG1QXMTHIQYVP1&client_secret=BATV4WRDT4CQSXHIK5KNPOX5N1BKNCDHUCSHW0WPSLOPE35G&v=20170801',
            datatype: 'json',
            success: function (place) {
                
                //Put the "venue" data in variable for ease of access
                const results = place.response.venue;
                
                //Use .hasOwnProperty() to determine if Foursquare has this data stored
                let location = results.hasOwnProperty('location') ? results.location : '';
                if (location.hasOwnProperty('address')) {
                    theater.streetAddress(location.address || '');
                }
                
                let city,
                    state,
                    zip;
                
                if (location.hasOwnProperty('city')) {
                    city = (location.city || '');
                }
                
                if (location.hasOwnProperty('state')) {
                    state = (location.state || '');
                }
                
                if (location.hasOwnProperty('postalCode')) {
                    zip = (location.postalCode || '');
                }
                
                let url = results.hasOwnProperty('url') ? results.url : '';
                theater.url(url || '');
                
                theater.cityStateZip(city + ", " + state + " " + zip);
                
                let phone = results.hasOwnProperty('contact') ? results.contact : '';
                if (phone.hasOwnProperty('formattedPhone')) {
                    theater.number = phone.formattedPhone;
                }
                
                let contentString = `<div class="infoWindow">
                        <h2>` + theater.title() + `</h2>
                        <p>` + theater.streetAddress() + `</p>
                        <p>` + theater.cityStateZip() + `</p>
                        <a href='` + theater.url() +`' target="_blank"><button class='ticket-button'>Get tickets</button></a>
                        <p>` + theater.number + `</p></div>`;
                
                //On click event listener for the markers
                google.maps.event.addListener(theater.marker, 'click', function() {
                    infoWindow.open(map, this);
                    theater.marker.setAnimation(google.maps.Animation.BOUNCE);
                    setTimeout(function() {
                        theater.marker.setAnimation(null);
                    }, 500);
                    
                    infoWindow.setContent(contentString);
                });
            },
            
            //Error handling for Foursquare
            error: function (e) {
                console.log("Foursquare data couldn't be loaded");
                alert('Cannot connect to Foursquare... Try reloading the browser!');
                infoWindow.setContent('<h4>Foursquare is currently unreachable. Please try refreshing your page.</h4>');
            }
        });    
        markers().push(marker);
    });
    
    //Function for clicking a list item
    self.showInfo = function (theater) {
        google.maps.event.trigger(theater.marker, 'click');
        self.hidePanel();
    };
    
    
    self.visible = ko.observableArray();
    self.input = ko.observable('');
    //Used for 
    self.theaterList().forEach(function(theater) {
        self.visible.push(theater); 
    });
    //Filter the search results
    self.filter = function() {
      let sInput = self.input().toLowerCase();
        self.visible.removeAll();
        self.theaterList().forEach(function (theater) {
            theater.marker.setVisible(false);
            if (theater.title().toLowerCase().indexOf(sInput) !== -1) {
                self.visible.push(theater);
            }
        });
        self.visible().forEach(function (theater) {
            theater.marker.setVisible(true);
        });
    };
    
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
    
    let panelVis = true,
        list = $('.theater-list'),
        upButton = $('#arrow');
    
    self.hidePanel = function() {
        list.animate({
            height: 0,
        }, 500);
        setTimeout(function() {
            list.hide();
        }, 500);
        upButton.attr("src", "img/down-arrow.png");
        panelVis = false;
    };
    
    self.showPanel = function() {
        list.show();
        let listHeight = list.height() + 55;
        list.animate({
            height: listHeight,
        }, 500, function() {
            $(this).css('height', '');
        });
        upButton.attr("src", "img/up-arrow.png");
        panelVis = true;
    };
    
    self.arrowUtility = function() {
        if (panelVis === true) {
            this.hidePanel();
        } else {
            this.showPanel();
        }
    };
    
};