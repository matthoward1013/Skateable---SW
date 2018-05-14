/*global $, location, alert, document*/
/*jshint esversion: 6*/

var link = "http://localhost:3000/api/";
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
							document.getElementById("signupbtn").disabled = false;
                }
                
				else
				{
						alert(errorThrown);
				}
	});
}

function signUp(){
	
		document.getElementById("signupbtn").disabled = true;
			setTimeout(function (){document.getElementById("signupbtn").disabled = false;}, 3000);	
	var tempName = $("#firstN").val() +" "+$("#lastN").val();
	
	if($("#emailOne").val() ===$("#emailTwo").val() && $("#emailOne").val().includes("@") )
		var tempEmail = $("#emailOne").val().toLowerCase();
	else 
	{
        let errorMsg = $("<p class='error'></p>").text("Email does not match or is not a valid email");
        $("#emailTwo").before(errorMsg);
		return;
	}
	if($("#pass").val()  ===$("#passTwo").val() )
			var tempPsw = $("#pass").val();
	else
	{
        let errorMsg = $("<p class='error'></p>").text("Password does not match");
        $("#passTwo").before(errorMsg);
		return;
	}

	//Example use
	var userData = {"name": tempName,"email": tempEmail,"password": tempPsw,"adminStatus": false,"bio": "", "groups": [], "favoriteSpot":[], "likeSpot":[],"username" : tempEmail};

	AjaxPost(link+"users", "POST",  "application/json",  "application/json",  "json", userData);
}