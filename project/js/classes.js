//Classes to be used in JS files

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
let Meetup = function(meetup){
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
let Group = function(group){
	this.id = ko.observable();
	this.name = ko.observable();
	this.members= ko.observableArray();
}
