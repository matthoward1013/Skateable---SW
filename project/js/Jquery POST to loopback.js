//JQuery ajax POST 
function AjaxPost(url, method, accept, contentType, datatype, data)
{
	$.ajax({
			url:url,
			method: method,
			accept: accept,
            	contentType: contentType,
			datatype: datatype,
			data: JSON.stringify(data),
			success: function (data) {
				console.log(data);
			},
			error: function(object, textStatus, errorThrown){
				if(errorThrown === "Unprocessable Entity")
					alert("Email already exists");
				else
				{
						alert(errorThrown);
				}
			}
	});
}

//Example use
var userData = {
  "name": "hedds",
  "email": "a5@a.com",
  "password": "123",
  "adminStatus": false,
  "bio": "string",
  "groups": []
};

AjaxPost("http://localhost:3000/api/users", "POST",  "application/json",  "application/json",  "json", userData);