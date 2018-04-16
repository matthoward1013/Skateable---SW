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
        
        //Link to the Foursquare API using AJAX
    /*$.ajax({
        url: 'https://api.foursquare.com/v2/venues/' + theater.id() + '?client_id=323QBSQL3C0K45DMRUQAWST434FEIWKRYNDG1QXMTHIQYVP1&client_secret=BATV4WRDT4CQSXHIK5KNPOX5N1BKNCDHUCSHW0WPSLOPE35G&v=20170801',
        datatype: 'json',
        success: function (place) {
                
        },
            
            //Error handling for Foursquare
        error: function (e) {
            console.log("Foursquare data couldn't be loaded");
            alert('Cannot connect to Foursquare... Try reloading the browser!');
            infoWindow.setContent('<h4>Foursquare is currently unreachable. Please try refreshing your page.</h4>');
        }
    });*/    
};
