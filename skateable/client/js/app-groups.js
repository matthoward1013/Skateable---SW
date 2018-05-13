/*global $, document, google, ko, theaters, ajax, setTimeout, console, alert, window, location, sessionStorage, navigator*/
/*jshint esversion: 6 */

var link = "http://localhost:3000/api/";
var curUser = JSON.parse(sessionStorage.getItem("curUser"));
var curGroup = {};
var groupList = [];

	
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
				alert("Could not connect to the server! Reloading Browser");
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
				alert("Could not connect to the server! Reloading Browser");
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
	})
}



function AjaxPUT(url,data, callback)
{
	$.ajax({
			url:url,
			method: "PUT",
			accept: "application/json",
            contentType: "application/json",
			datatype: "json",
			data: JSON.stringify(data)
	}).done(function (data) {
				callback(data);
	}).fail(function(object, textStatus, errorThrown){
				//alert("Could not connect to the server! please reload browser");
	});
}

function AjaxPUT(url,data, callback)
{
	$.ajax({
			url:url,
			method: "PUT",
			accept: "application/json",
            contentType: "application/json",
			datatype: "json",
			data: JSON.stringify(data)
	}).done(function (data) {
				callback(data);
	}).fail(function(object, textStatus, errorThrown){
				alert("Could not connect to the server! Reloading Browser");
	});
}


function postMessage()
{
	//insert data from form into here
	//user enters in messages and from that it will query the db
	var message = $("#message").val();


	
	if(message != "")
	{
			curGroup.messages.push(curUser.name + ": " + message);
			var prevMes = document.getElementById("chatBox").innerHTML; 
			document.getElementById("chatBox").innerHTML = prevMes + curGroup.messages[curGroup.messages.length - 1] + '<br>';
			
	
			var groupPatchData = {"messages": curGroup.messages};

			// http://localhost:3000/api/groups/5af4b92f4365dcb3c4f53360?access_token=Ouz0cE8CfEpTlBbPFBeTFROIHGCkOROuM4Ln4OH7poApl44zctz9obJZ7t2B6ZLZ

			AjaxPatch(link+"groups/"+ String(curGroup.id) + "?access_token=" + String(curUser.key), groupPatchData, function(groupData){
				  document.getElementById("chatBox").scrollTop = document.getElementById("chatBox").scrollHeight;
			});			

	}
	else{
		alert("Please enter a message");
	}
}


//creates a new group
function createGroup()
{
	//insert data from form into here
	//groupId is how other members can join the group so we need to display this as well so users can send to their friends
	//groupId is different then the id of the group in mongo
	document.getElementById("makeButton").disabled = true;
	setTimeout(function (){document.getElementById("makeButton").disabled = false;}, 2000);	
	
	var groupIdTemp = $("#cGroupID").val();
	var groupNTemp = $("#cGroupName").val();
	if(groupNTemp != "" && groupIdTemp != "")
	{
		var data = {"groupName":groupNTemp,"groupID":groupIdTemp,"members": [curUser.name], "messages":[]};
	
		AjaxPost(link+"groups?access_token=" + String(curUser.key), data, function(data){
		
			groupList.push(data);
			curUser.groups.push(data.id);
					
			var patchData = {"groups": curUser.groups};
		
			//patches the user data to include the new group
			AjaxPatch(link+"users/"+ String(curUser.id) + "?access_token=" + String(curUser.key), patchData ,function(data){
			
				sessionStorage.setItem("curUser", JSON.stringify(curUser));
				location.href = 'groups.html';
			
				//input into group ui list here
			});		
		});
	}
}

//adds a preexisting group
function addGroup()
{
	//insert data from form into here
	//user enters in groupId and from that it will query the db
	document.getElementById("addexistingButton").disabled = true;
	setTimeout(function (){document.getElementById("addexistingButton").disabled = false;}, 2000);	
	
	var groupTemp = $("#aGroupID").val();
	var tempMembers = [];
	if(groupTemp != "Ex:123" && groupTemp != "")
	{
		var groupId = {"where": {"groupID":groupTemp}};
	
		AjaxGet(link+"groups?filter="+ JSON.stringify(groupId) + "&access_token=" + String(curUser.key), function(data){
			//console.log(data);
			
		if(data.length > 0)
		{
				
			if(data[0].members.indexOf(curUser.name) == -1)
			{
				tempMembers = data[0].members;
				if(tempMembers.length == 1 && tempMembers.indexOf("") != -1)
				{
					tempMembers.pop();
				}
				tempMembers.push(curUser.name);
				var groupPatchData = {"members": tempMembers};
		

				AjaxPatch(link+"groups/"+ String(data[0].id) + "?access_token=" + String(curUser.key), groupPatchData, function(groupData){
		
					curUser.groups.push(groupData.id);
			
					//patches the user data to include the new group
					var userPatchData = {"groups": curUser.groups};
					AjaxPatch(link+"users/"+ String(curUser.id) + "?access_token=" + String(curUser.key), userPatchData ,function(UserData){
						sessionStorage.setItem("curUser", JSON.stringify(curUser));
						location.href = 'groups.html';
	
					});		
		
				});	
			}
			else{
				alert("You are already in this group");
			}
		}
		else{
			alert("Group does not exist!");
		}
		});
	}
	else{
		alert("Please enter a valid GroupID");
	}
}


let ViewModel = function () {
    let self = this;
	var count = 0;
	
	self.uiList = ko.observableArray([]);
    
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
		AjaxGet(link+"groups?filter="+ filter + "&access_token=" + String(curUser.key), function(data){
			console.log(data);
			
			groupList = data;
			
			$.each(data, function(i, value){
				
				self.uiList.push(value);
			});	
			
			//input into group ui list here
            
		});
	}
	
	//group is the currently selected group when the user hits the leave group button
	self.leaveGroup = function (group)
	{
		for (var i = 0; i < document.getElementsByClassName("leave").length; i++)
		{
			document.getElementsByClassName("leave")[i].disabled = true;
			
		}
		var groupPatchData;
	
		var groupTemp = [];
		
		for(var i = 0; i < group.members.length; i++){
			
			if(group.members[i] != curUser.name)
				groupTemp.push(group.members[i]);
		}
		
		if(groupTemp.length == 0)
			groupTemp.push("");
		
	
		groupPatchData= {"members":groupTemp};

		AjaxPatch(link+"groups/" + String(group.id)+ "?access_token=" + String(curUser.key), groupPatchData, function(data){
		
			curUser.groups.splice(curUser.groups.indexOf(data.id),1);
		
			//patches the user data to include the new group
			var userPatchData = {"groups": curUser.groups};
			AjaxPatch(link+"users/"+ String(curUser.id) + "?access_token=" + String(curUser.key), userPatchData ,function(data){
			
				sessionStorage.setItem("curUser", JSON.stringify(curUser));
				location.href = 'groups.html';

			});		
		});		
	};
	self.ConnectChat = function (group)
	{
		document.getElementById("chatBox").innerHTML = ""; 
		curGroup = group;
		document.getElementById("msgButton").disabled = false;
		
		document.getElementById("chatHeader").innerHTML = curGroup.groupName + " Chat";

		// populate chatbox with the messages
		for(var j = 0; j < curGroup.messages.length; j++)
		{
			document.getElementById("chatBox").innerHTML += curGroup.messages[j] + '<br>';
		}

	}

};

ko.applyBindings(new ViewModel());