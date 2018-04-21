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

function Login(){
	
//example
	var login = {"email": document.all[12].value,"password": document.all[15].value};
	var curUser = {"email": "","id": "","key": "","name": "","bio": "", "groups": {}, "favSpots": {}};

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
					$.each(tempUser.groups, function(i, value){
						curUser.groups[i] = value;
					});
					$.each(tempUser.favSpots, function(i, value){
						curUser.favSpots[i] = value;
					});
					
					if(curUser.key !== "")
					{							
							sessionStorage.setItem("curUser", JSON.stringify(curUser));
							location.href = 'index.html';
					}	
				});
		});
}
	

