//Jquery Login to loopback

function AjaxLogin(url, method, accept, contentType, datatype, data, callback)
{
	$.ajax({
			url:url,
			method: method,
			accept: accept,
            	contentType: contentType,
			datatype: datatype,
			data: JSON.stringify(data),
			success: function (data) {
				callback(data);
			},
			error: function(object, textStatus, errorThrown){
				alert("Login Failed! Please reenter your email and password");
			}
	});
}

function AjaxGet(url, method, datatype, callback)
{
	$.ajax({
			url:url,
			method: method,
			datatype: datatype,
			success: function (data) {
				callback(data);
			},
			error: function(textStatus, errorThrown){
				alert("Could not connect to the server! please reload Browser");
			}
	});
}

//example
			let login = {
  "email": "ab@a.com",
  "password": "123",
};
			//Login POST request to loopback. returns a access key and the userID. 
			AjaxLogin("http://localhost:3000/api/users/login", "POST",  "application/json",  "application/json",  "json", login, function(data){
				self.curUser.id(data.userId);
				self.curUser.key(data.id);
				
				//GET request to loopback based on the userId from the login
				AjaxGet(("http://localhost:3000/api/users/" + String(self.curUser.id())), "GET",   "json", function(data){
				self.curUser.name = data.name;
				self.curUser.email = data.email;
				self.curUser.bio = data.bio;
				$.each(data.groups, function(i, value){
					self.curUser.groups[i] = value;
				});
			});
				console.log(self.curUser);
		});