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
				if(errorThrown === "Unprocessable Entity")
					alert("Please Enter Valid Fields");
				else
				{
						alert(errorThrown);
				}
	});
}

function SignUp(){

	var tempName = document.all[16].value + document.all[21].value;
	
	if(document.all[26].value === document.all[31].value)
		var tempEmail = document.all[26].value;
	else 
	{
		alert("Email does not match");
		return;
	}
	if(document.all[36].value === document.all[41].value)
			var tempPsw = document.all[36].value;
	else
	{
		alert("password does not match");
		return;
	}

	//Example use
	var userData = {"name": tempName,"email": tempEmail,"password": tempPsw,"adminStatus": false,"bio": "string", "groups": [], "username" : tempName};

	AjaxPost("http://localhost:3000/api/users", "POST",  "application/json",  "application/json",  "json", userData);
}