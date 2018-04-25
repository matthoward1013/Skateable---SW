
    ko.applyBindings(new ViewModel());


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
	//get the user entered previous password and the new Password here
	var passwords = {"oldPassword": "", "newPassword": ""};
	
	//Post the password change to db if successful the alert will display
	AjaxPost("http://localhost:3000/api/users/change-password?access_token=" + curUser.key,  passwords, function(data){
			alert("password was successfully changed");
	});
	
}

let ViewModel = function () {
	
	this should be in the main function but just to show how to get the curUser and what to check for
	  var curUser = JSON.parse(sessionStorage.getItem("curUser"));
	
	//if null then the user is not logged in
	if(curUser === null)
		location.href = 'login.html';
	
	
	
	
};

