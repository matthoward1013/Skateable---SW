/*global $, document, google, ko, theaters, ajax, setTimeout, console, alert, window, location, sessionStorage, navigator*/
/*jshint esversion: 6 */


var curUser = JSON.parse(sessionStorage.getItem("curUser"));
	
//if null then the user is not logged in
if(curUser === null)
	location.href = 'login.html';

function AjaxGet(url, callback)
{
	$.ajax({
			url:url,
			method: "GET",
			datatype: "json",
			success: function (data) {
				callback(data);
			},
			error: function(object, textStatus, errorThrown){
				alert("Could not connect to the server! please reload Browser");
			}
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

//creates a new group
function createGroup(groupList)
{
	//insert data from form into here
	//groupId is how other members can join the group so we need to display this as well so users can send to their friends
	//groupId is different then the id of the group in mongo
	var data = {"groupName":"","groupID":123,"members": [curUser.name]};
	
	AjaxPost("http://localhost:3000/api/groups?access_token=" + String(curUser.key), data, function(data){
		
		groupList.push(data);
		curUser.groups.push(data.id);
				
		var patchData = {"groups": curUser.groups};
		
		//patches the user data to include the new group
		AjaxPatch("http://localhost:3000/api/users/"+ String(curUser.id) + "?access_token=" + String(curUser.key), patchData ,function(data){
			
			sessionStorage.setItem("curUser", JSON.stringify(curUser));
			//console.log(data);
			
			//input into group ui list here
		});		
	});
}

//adds a preexisting group
function AddGroup(groupList)
{
	//insert data from form into here
	//user enters in groupId and from that it will query the db
	var groupId = {"where": {"groupID":""}};
	
	AjaxGet("http://localhost:3000/api/groups?filter="+ JSON.stringify(groupId) + "&access_token=" + String(curUser.key), function(data){
		//console.log(data);
		
		groupList.push(data);
		
		var groupPatchData = groupList[groupList.length - 1].members;
		groupPatchData.push(curUser.name);

		AjaxPatch("http://localhost:3000/api/groups/"+ String(groupList[groupList.length - 1].id) + "?access_token=" + String(curUser.key), groupPatchData, function(data){
		
			curUser.groups.push(data.id);
			
			//patches the user data to include the new group
			var userPatchData = {"groups": curUser.groups};
			AjaxPatch("http://localhost:3000/api/users/"+ String(curUser.id) + "?access_token=" + String(curUser.key), userPatchData ,function(data){
				sessionStorage.setItem("curUser", JSON.stringify(curUser));

				//console.log(data);
				//input into group ui here
			});		
		
		});	
	});
}

//group is the currently selected group when the user hits the leave group button
function leaveGroup(groupList, group)
{
	var groupPatchData;
	for (var i = 0; i < groupList.length; i++)
	{
		if(groupList[i].id !== group.id)
			groupPatchData.slice(i,1);
	}
	AjaxPatch("http://localhost:3000/api/groups?access_token=" + String(curUser.key), groupPatchData, function(data){
		//console.log("test");
		
		curUser.groups.push(data.id);
		
		//patches the user data to include the new group
		var userPatchData = {"groups": curUser.groups};
		AjaxPatch("http://localhost:3000/api/users/"+ String(curUser.id) + "?access_token=" + String(curUser.key), userPatchData ,function(data){
			
			sessionStorage.setItem("curUser", JSON.stringify(curUser));
			//console.log(data);
			//input into group ui here
		});		
	});		
}


let ViewModel = function () {
    let self = this;
	
	var groupList = [];
	var count = 0;
    
    //Function for sidebar animation
    
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
        sidebar.css("width", "15%");
        setTimeout(function() { $('#side-bar a').css("visibility", "visible"); }, 200);       
        panelVis = true;
    };
	
	var filter = "{\"where\":{\"or\":[";
	var filterEnd = "]}}";
	$.each(curUser.groups, function(i, value){
		
		filter += "{\"id\":\"" + value + "\"},";
		count++;
	});
	
	filter = filter.replace(/,\s*$/, "");
	filter += filterEnd;
	
	if(count == 1) {
		filter = "{\"where\":{\"id\":\"" + curUser.groups[0] + "\"}}";
	}
	
	if (count >= 1)
	{
		//for each group the user has, fetch the group information from the db
		AjaxGet("http://localhost:3000/api/groups?filter="+ filter + "&access_token=" + String(curUser.key), function(data){
			console.log(data);
			
			$.each(data, function(i, value){
				groupList.push(value);
			});	
			
			//input into group ui list here
			
            groupList.forEach(function(group) {
                let name = group.name,
                    id = group.id;
            });
            
			//test to create a group status: working
			//createGroup(curUser,groupList);
		});
	}
	
};

ko.applyBindings(new ViewModel());