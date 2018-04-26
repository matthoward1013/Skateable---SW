/*global $, location, alert, document*/
/*jshint esversion: 6*/

//JQuery ajax POST 
function AjaxPost(url, method, accept, contentType, datatype, data)
{
	$.ajax({
			url:url,
			method: method,
			accept: accept,
            contentType: contentType,
			datatype: datatype,
			data: JSON.stringify(data)
	}).done(function (data) {
				location.href='login.html';
	}).fail(function(object, textStatus, errorThrown){
				if(errorThrown === "Unprocessable Entity"){
					alert("Please Enter Valid Fields");
                }
                
				else
				{
						alert(errorThrown);
				}
	});
}

function signUp(){

	var tempName = document.all[16].value +" "+ document.all[21].value;
	
	if(document.all[26].value === document.all[31].value)
		var tempEmail = document.all[26].value;
	else 
	{
        let errorMsg = $("<p class='error'></p>").text("Email does not match");
        $("#emailTwo").before(errorMsg);
		return;
	}
	if(document.all[36].value === document.all[41].value)
			var tempPsw = document.all[36].value;
	else
	{
        let errorMsg = $("<p class='error'></p>").text("Password does not match");
        $("#passTwo").before(errorMsg);
		return;
	}

	//Example use
	var userData = {"name": tempName,"email": tempEmail,"password": tempPsw,"adminStatus": false,"bio": "", "groups": [], "favoriteSpot":[], "username" : tempEmail};

	AjaxPost("http://localhost:3000/api/users", "POST",  "application/json",  "application/json",  "json", userData);
}