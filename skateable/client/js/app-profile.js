/*global $, document, google, ko, theaters, ajax, setTimeout, console, alert, window*/
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

function UpdateUser(curUser)
{	
	
	//enter in changed name and or bio here where the curUser.name and bio is
	var changedData = {"name": curUser.name, "bio": curUser.bio, "email":curUser.email}

	curUser.name = changedData.name;
	curUser.bio = changedData.bio;
	//json to store the new information
	var userPatchData = {"bio":curUser.name,"name":curUser.bio};
	
	AjaxPatch("http://localhost:3000/api/users/"+ String(curUser.id) + "?access_token=" + String(curUser.key), userPatchData ,function(data){
		//store the changes to the curUser in sessionStorage
		sessionStorage.setItem("curUser", JSON.stringify(curUser));
				//console.log(data);
				//input into group ui here
			});		
	
}

function ChangePassword(curUser)
{
	//put the user entered previous password and the new Password here
	var passwords = {"oldPassword": "", "newPassword": ""};
	
	//Post the password change to db if successful the alert will display
	AjaxPost("http://localhost:3000/api/users/change-password?access_token=" + curUser.key,  passwords, function(data){
			alert("password was successfully changed");
	});
	
}

let ViewModel = function () {
	
	  var curUser = JSON.parse(sessionStorage.getItem("curUser"));
	
	//if null then the user is not logged in
	if(curUser === null)
		location.href = 'login.html';
	
	document.getElementById("name").innerHTML = curUser.name;
	document.getElementById("mail").innerHTML = "<label>Email: &nbsp</label>" + curUser.email;
	
	if(curUser.groups.length !== 0)
		document.getElementById("groups").innerHTML = "<label>Number of Groups: &nbsp</label>" + String(curUser.groups.length);
	
	if(curUser.favSpots.length !== 0)
		document.getElementById("spots").innerHTML = "<label>Number of Favorite Spots: &nbsp</label>" + String(curUser.favSpots.length);
	
	if(curUser.bio !== "")
		document.getElementById("bio").value = curUser.bio;

	
	
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

    ko.applyBindings(new ViewModel());


