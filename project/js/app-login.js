/*global $, document, google, ko, theaters, ajax, setTimeout, console, alert, window*/
/*jshint esversion: 6 */

//class to store the user
let User = function(user) {
	this.id = ko.observable();
	this.key = ko.observable();
	this.name = ko.observable();
	this.email = ko.observabe();
	this.password = ko.observable();
	this.bio = ko.observable();
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
    
    /*$.ajax({
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
        
        let contentString = <div class="infoWindow">
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
    });*/
};
