/*global $, document, google, ko, theaters, ajax, setTimeout, console, alert, window, self*/
/*jshint esversion: 6 */
//Jquery Login to loopback



function AjaxLogin(url, method, accept, contentType, datatype, data, callback)
{
	$.ajax({
			url:url,
			method: method,
			accept: accept,
            contentType: contentType,
			datatype: datatype,
			data: JSON.stringify(data)
	}).done(function (newData) {
		callback(newData);
	}).fail(function(textStatus, errorThrown){
		alert("Login Failed! Please reenter your email and password");
	});
}

function AjaxGet(url, method, datatype, callback)
{
	$.ajax({
			url:url,
			method: method,
			datatype: datatype
	}).done(function (newData) {
				callback(newData);
	}).fail(function(textStatus, errorThrown){
				alert("Could not connect to the server! please reload Browser");
	});
}

//function that posts json data to server
function AjaxPost(url, callback)
{
	$.ajax({
			url:url,
			method: "POST",
			accept: "application/json",
            contentType: "application/json",
			datatype: "json"
	}).done(function (data) {
				callback(data);
	}).fail(function(object, textStatus, errorThrown){
				alert("Could not connect to the server! please reload browser");
	});
}


var curUser = JSON.parse(sessionStorage.getItem("curUser"));
	
//if not null then the user wnats to log out
if(curUser !== null){
			//Post the password change to db if successful the alert will display
	AjaxPost("http://localhost:3000/api/users/logout?access_token=" + curUser.key, function(data){
				sessionStorage.removeItem("curUser");
	});
}



function Login(){
	
//example
	var login = {"email": document.all[12].value,"password": document.all[15].value};
	var curUser = {"email": "","id": "","key": "","name": "","bio": "", "groups": {}, "favoriteSpot": {}};

			//Login POST request to loopback. returns a access key and the userID. 
			AjaxLogin("http://localhost:3000/api/users/login", "POST",  "application/json",  "application/json",  "json", login, function(data){
				var temp = data;
				
				console.log(temp);
				
				curUser.id = temp.userId;
				curUser.key = temp.id;
				
				var url = "http://localhost:3000/api/users/" + String(curUser.id) + "?access_token=" + String(curUser.key);
				//GET request to loopback based on the userId from the login
				AjaxGet(url, "GET",   "json", function(newData){
					var tempUser = newData;
					curUser.name = tempUser.name;
					curUser.email = tempUser.email;
					curUser.bio = tempUser.bio;
					curUser.groups = tempUser.groups;
					curUser.favSpots = tempUser.favSpots;
					
					if(curUser.key !== "")
					{							
							sessionStorage.setItem("curUser", JSON.stringify(curUser));
							location.href = 'index.html';
					}	
				});
		});
}
	

