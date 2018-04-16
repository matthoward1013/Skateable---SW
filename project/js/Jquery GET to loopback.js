/*global $, document, google, ko, theaters, ajax, setTimeout, console, alert, window*/
/*jshint esversion: 6 */
// JQuery ajax get function

function AjaxGet(url, method, datatype, callback)
{
	$.ajax({
			url:url,
			method: method,
			datatype: datatype,
			success: function (data) {
				callback(data);
			},
			error: function(object, textStatus, errorThrown){
				alert("Could not connect to the server! please reload Browser");
			}
	});
}