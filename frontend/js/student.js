$(document).ready(function(){
	renderElement();
});

function renderElement(){
	console.log("Function renderElement()")
	var email = decodeURI(location.search.substring(location.search.lastIndexOf("=")+1));
	$.ajax({
		type : 'GET',
		url : serverAddress + "/api/users/students/" + email + "?token=" + token(),

		success : function(data, status){
			if(data.success){
				$('#student').html(data.user[0].firstname + " " + data.user[0].lastname + " - <a href=\"class.html?class=" + data.user[0].id + "\">" + data.user[0].name + "</a>");
				var progress = "";
				if(getToken().level==2){
				$('#upgradeButton').html("<button class=\"btn btn-lg btn-primary \" type=\"button\" onclick=\"upgradeToTeacher()\">Upgrade to teacher</button>");
				$('#dropDownMenu').append("<li role=\"separator\" class=\"divider\"></li><li><a href=\"admin.html\">Admin</a></li>");
				}
				$.ajax({
					type : 'GET',
					url : serverAddress + "/api/users/students/" + email + "/skills?token=" + token(),

					success : function(data2, status){
						if(data2.success){
							var skillsName = [];
							for (var i = 0; i < data2.skills.length; i++){
								progress = progress + "<div class=\"col-xs-6 col-sm-3 placeholder\">";
								progress = progress + "<span class=\"text-muted\">" + data2.skills[i].mark + "/5</span>";
								progress = progress + "<div class=\"progress\">"
								progress = progress + progressBar(data2.skills[i].mark);
								progress = progress + "</div>";
								progress = progress + "<h4>" + data2.skills[i].name + "</h4>";
								skillsName.push(data2.skills[i].name);
								// Check si le mec est prof de la classe ou non
								// $.ajax({
								// 	type : 'GET',
								// 	url : serverAddress + "/api/users/students/" + email + "/teacher?token=" + token(),
								//
								// 	success : function(data3, status){
								// 		//
								// 		if(getToken().level > 0  && data3.user[0].teacher == getToken().email ){
								// 			progress = progress + "<p><br/><a id=\"sign\" class=\"btn btn-primary\" role=\"button\" onclick=\"edit(" + data2.skills[0].id + ")\">Edit</a></p>";
								// 			progress = progress + "</div>";
								// 		}
								// 	},
								// 	error : function(data3, status, error){
								// 		console.log("Failed to retrieve teachers\' list.");
								// 		console.log(data3);
								// 		console.log(status);
								// 		console.log(error);
								// 	}
								// };
								if(getToken().level > 0 /* && data.user[0].name == getToken() */)
								// progress = progress +  "<br/><input id=\"newNote\" input type=\"range\" value=\"" + data2.skills[i].mark + "\" max=\"5\" min=\"0\" step=\"1\">";
								progress + progress + "<input type=\"range\" id=\"myRange\" value=\"90\">";
								console.log("test : " + 	document.getElementById("myRange").value);
								progress = progress + "<p><br/><a id=\"sign\" class=\"btn btn-primary\" role=\"button\" onclick=\"edit()\">Edit</a></p>";
								progress = progress + "</div>";
							}
							console.log(skillsName);
							//on a les noms de tous les skills de l'élève
							if(getToken().level > 0)
							loadUnmarkedSkills(skillsName,progress);
							else
							$('#progressBar').html(progress);
						}
						else{
							if(getToken().level > 0)
							{
								progress = progress + "<h3>No skills have been found.</h3>";
								var skillsName = [];
								loadUnmarkedSkills(skillsName,progress);
							}
							else{
								progress = progress + "<h3>No skills have been found.</h3>";
								$('#progressBar').html(progress);
							}
							console.log(data2.message);
						}
					},

					error : function(data2, status, error){
						console.log("Failed to retrieve teachers\' list.");
						console.log(data2);
						console.log(status);
						console.log(error);
					}
				});
			}
			else{
				console.log(data2.message);
				location.href="index.html";
			}
		},

		error : function(data, status, error){
			console.log("Failed to retrieve teachers\' list.");
			console.log(data);
			console.log(status);
			console.log(error);
		}
	});
}

function progressBar(val){
	console.log("Function progressBar()")
	var html;
	if(val < 2){
		html = "<div class=\"progress-bar progress-bar-danger\" role=\"progressbar\" aria-valuenow=\" " + val + "\" aria-valuemin=\"0\" aria-valuemax=\"5\" style=\"width: " + val*20 + "%\"><span class=\"sr-only\">" + val*20 + "% Complete (success)</span></div>";
	}
	else{
		if (val > 3){
		html = "<div class=\"progress-bar progress-bar-success\" role=\"progressbar\" aria-valuenow=\" " + val + "\" aria-valuemin=\"0\" aria-valuemax=\"5\" style=\"width: " + val*20 + "%\"><span class=\"sr-only\">" + val*20 + "% Complete (success)</span></div>";
	}
	else{
		html = "<div class=\"progress-bar progress-bar-warning\" role=\"progressbar\" aria-valuenow=\" " + val + "\" aria-valuemin=\"0\" aria-valuemax=\"5\" style=\"width: " + val*20 + "%\"><span class=\"sr-only\">" + val*20 + "% Complete (success)</span></div>";
	}
	}
	return html;
}

// function edit(param){
// 	console.log(document.getElementById(param));
// 	// var n = document.getElementById(param).value;
// 	// console.log(param + ":" + n);
// }

function upgradeToTeacher(){
	console.log("Upgrading request clicked");
	var email = decodeURI(location.search.substring(location.search.lastIndexOf("=")+1));
	console.log(serverAddress + "/api/users/" + email + "?token="+token()+"&level=1");
	$.ajax({
		type : 'PUT',
		url : serverAddress + "/api/users/" + email + "?token="+token()+"&level=1",

		success:function(data){
			console.log("Level updated");
			location.href="teacher.html?teacher="+ decodeURI(location.search.substring(location.search.lastIndexOf("=")+1));
		}
	})
}

// function used to check if an array contains an element
function contains(a, obj) {
    for (var i = 0; i < a.length; i++) {
        if (a[i] === obj) {
            return true;
        }
    }
    return false;
}

function loadUnmarkedSkills(skillsName,progress){
	var adding ="";
	$.ajax({
		type : 'GET',
		url : serverAddress + "/api/skills?token="+token(),

		success:function(data){
			for (var i = 0; i < data.skills.length; i++){
				if (!contains(skillsName,data.skills[i].name)) //si le nom n'est pas dans les skills deja présent
				{
					adding = adding + "<div class=\"col-xs-6 col-sm-3 placeholder\">";
					adding = adding + "<span class=\"text-muted\">-</span>";
					adding = adding + "<div class=\"progress\">"
					adding = adding + progressBar(0);
					adding = adding + "</div>";
					adding = adding + "<h4>" + data.skills[i].name + "</h4>";
					if(getToken().level > 0)
					adding = adding + "<p><br/><a id=\"sign\" class=\"btn btn-primary\" role=\"button\" onclick=\"edit(" + data.skills[0].id + ")\">Edit</a></p>";
					adding = adding + "</div>";
				}
			}
			progress = progress+adding;
			$('#progressBar').html(progress);
		}
	})
}
