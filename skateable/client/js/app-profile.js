/*global $, document, google, ko, theaters, ajax, setTimeout, console, alert, window*/
/*jshint esversion: 6 */

let map;
var link = "http://localhost:3000/api/";
var curUser = JSON.parse(sessionStorage.getItem("curUser"));
console.log(curUser);
	
//if null then the user is not logged in
if(curUser === null)
	location.href = 'login.html';



//Initiliazes  the map, using the center of WA state as the center

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
				alert("Could not change Password! Please try again.");
	});
}


let ViewModel = function () {
	let self = this;
	$("#name").text(curUser.name);
	$("#mail").text(curUser.email);
	$("#groups").html(String(curUser.groups.length));
	$("#spots").html(String(curUser.favoriteSpot.length));
	
	if(curUser.bio !== "")
		$("#bio").val(curUser.bio);
	
	self.changePassword = function(){
		document.getElementById("savebttn").disabled = true;
		setTimeout(function (){document.getElementById("savebttn").disabled = false;}, 5000);

		//console.log($("#oldPass").val());
		if($("#oldPass").val() !== "")
		{
			if($("#newPass").val() === $("#newPass2").val())
			{
				//put the user entered previous password and the new Password here
				var passwords = {"oldPassword": $("#oldPass").val(), "newPassword": $("#newPass").val()};
	
				//Post the password change to db if successful the alert will display
				AjaxPost(link+"users/change-password?access_token=" + curUser.key,  passwords, function(data){
						alert("password was successfully changed");
						location.href = 'profile.html';


				});	
			}
			else{
				alert("New password does not match");
			}
		}
		else{
			//display red font as error here for old password
			alert("Please enter old Password");
		}
	};
	
	self.updateUser = function(){
		

		document.getElementById("accBttn").disabled = true;
		setTimeout(function (){document.getElementById("accBttn").disabled = false;}, 5000);	
		
		var changedData = {};
		if($("#name").text() !== curUser.name && $("#name").text() !== "")
		{
			changedData["name"] = $("#name").text();
			curUser.name = changedData.name;
		}
		if($("#mail").text() !== "" && $("#mail").text().includes("@"))
		{
			if($("#mail").text().toLowerCase() !== curUser.email.toLowerCase())
			{
				changedData["email"] = $("#mail").text().toLowerCase();
				curUser.email = changedData.email;
				changedData["username"] = curUser.email;
			}
		}

		
		if(changedData["name"] !== undefined || changedData["email"] !== undefined){
			
			AjaxPatch(link+"users/"+ String(curUser.id) + "?access_token=" + String(curUser.key), changedData ,function(data){
				//store the changes to the curUser in sessionStorage
				sessionStorage.setItem("curUser", JSON.stringify(curUser));
			
				console.log(data);
				location.href = 'profile.html';
			});		
		}			
	};
	
	self.editBio = function(){
		
		document.getElementById("editProfBtn").disabled = true;
		setTimeout(function (){document.getElementById("editProfBtn").disabled = false;}, 5000);	
		
		var changedData = {};
		if($("#bio2").val() !== curUser.bio)
		{
			changedData["bio"] = $("#bio2").val();
			curUser.bio = changedData.bio;
		}
		
		if(changedData["bio"] !== undefined){
			
			AjaxPatch(link+"users/"+ String(curUser.id) + "?access_token=" + String(curUser.key), changedData ,function(data){
				//store the changes to the curUser in sessionStorage
				sessionStorage.setItem("curUser", JSON.stringify(curUser));
			
				console.log(data);
				//document.getElementById("editProfBtn").disabled = false;
				location.href = 'profile.html';
						
			});		
		}
		else{
			//document.getElementById("editProfBtn").disabled = false;
		}
			
	};


	
	
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
        if ($(window).width() <= 1000) {
            sidebar.css("width", "100%");
            setTimeout(function() { $('#side-bar a').css("visibility", "visible"); }, 200);
        } else {
            sidebar.css("width", "15%");
            setTimeout(function() { $('#side-bar a').css("visibility", "visible"); }, 200);
        }
        panelVis = true;
    };
    
    //Create a pin modal function
    
    self.openModal = function() {
        pinModal.modal('show');  
    };
	

};
ko.applyBindings(new ViewModel());