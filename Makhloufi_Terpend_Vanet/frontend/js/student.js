$(document).ready(function(){
	if(getToken().level==2){
	$('#dropDownMenu').append("<li role=\"separator\" class=\"divider\"></li><li><a href=\"admin.html\">Admin</a></li>");
	}
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
				$('#student').html(data.user[0].firstname + " " + data.user[0].lastname + " - <a href=\"class.html?class=" + data.user[0].class + "\">" + data.user[0].class + "</a>");
				var progress = "";
				if(getToken().level==2){
				$('#upgradeButton').html("<button class=\"btn btn-lg btn-primary \" type=\"button\" onclick=\"upgradeToTeacher()\">Upgrade to teacher</button>");
				var studentClass = "<h1>Classe : ";
				$.ajax({
					type : 'GET',
					url : serverAddress + "/api/users/students/"+email+"/class?token="+token(),

					success : function(dataClass,status)
					{
						if (dataClass.success)
						{
							console.log("Chargement de la classe effectué : ");
							console.log(dataClass.class[0]);
							if (dataClass.class[0].name != null)
							{
								console.log(dataClass.class[0].name);
								studentClass = studentClass + dataClass.class[0].name + "</h1>";
								studentClass = studentClass + "<button class=\"btn btn-lg btn-danger \" type=\"button\" onclick=\"supprimerClasse()\">Exclure de la classe</button>" + "</td>";
							}
							else
							{
								studentClass = studentClass + "Aucune Classe" + "</h1>";
								studentClass = studentClass + "<button class=\"btn btn-lg btn-primary \" type=\"button\" onclick=\"ajouterClasse()\">Ajouter a une classe</button>" + "</td>";
							}
							$('#StudentClass').html(studentClass);
						}
					}
				});


				}
				loadMarkedSkills(progress);
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
	//console.log("Function progressBar()")
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

function loadMarkedSkills(progress){
	var email = decodeURI(location.search.substring(location.search.lastIndexOf("=")+1));
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
					progress = progress + "<h4>" + data2.skills[i].skill + "</h4>";
					progress = progress + "<div id='edit"+data2.skills[i].skill+"'></div>"
					skillsName.push(data2.skills[i].skill);
					//console.log("i="+i);
					// Check si le mec est prof de la classe ou non
					progress = progress + "</div>";
					//console.log(progress);
				}
				console.log(skillsName);
				loadUnmarkedSkills(skillsName,progress);
				//$('#progressBar').html(progress);
			}
			else{
				if(getToken().level > 0)
				{
					progress = progress + "<h3>No skills have been found.</h3>";
					var skillsName = [];
					//loadUnmarkedSkills(skillsName,progress);
				}
				else{
					progress = progress + "<h3>No skills have been found.</h3>";
					$('#progressBar').html(progress);
				}
				console.log(data2.message);
				var skillsName = [];
				loadUnmarkedSkills(skillsName,progress);
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

function loadUnmarkedSkills(skillsName,progress){
	var adding ="";
	$.ajax({
		type : 'GET',
		url : serverAddress + "/api/skills?token="+token(),

		success:function(data){
			if (getToken().level > 0)
			{
				for (var i = 0; i < data.skills.length; i++){
					if (!contains(skillsName,data.skills[i].name)) //si le nom n'est pas dans les skills deja présent
					{
						adding = adding + "<div class=\"col-xs-6 col-sm-3 placeholder\">";
						adding = adding + "<span class=\"text-muted\">-</span>";
						adding = adding + "<div class=\"progress\">"
						adding = adding + progressBar(0);
						adding = adding + "</div>";
						adding = adding + "<h4>" + data.skills[i].name + "</h4>";
						adding = adding + "<div id='edit"+data.skills[i].name+"'></div>"
						adding = adding + "</div>";
						//console.log(adding);
						skillsName.push(data.skills[i].name);
					}
				}
			}
			
			progress = progress+adding;
			//console.log(skillsName);
			loadEditFunctions(skillsName);
			$('#progressBar').html(progress);
			
		}
	})
}

function loadEditFunctions(skillsNames)
{
	var email = decodeURI(location.search.substring(location.search.lastIndexOf("=")+1));
	// Check si le mec est prof de la classe ou non
	$.ajax({
		type : 'GET',
		url : serverAddress + "/api/users/students/" + email + "/teacher?token=" + token(),

		success : function(data3, status){
			console.log(data3);
			var userEmail = "";
			if(data3.success!=false)
			{
				userEmail=data3.user[0].email;
			}
			if((getToken().level > 0  && userEmail == getToken().email )||(getToken().level == 2)){
				console.log("Prof ou admin!");
				for (var i = 0 ; i<skillsNames.length;i++)
				{
					//console.log(skillsNames[i]);	
					var divName = '#edit'+skillsNames[i];
					//console.log(divName);
					//console.log("#input"+skillsNames[i]);
					$(divName).html("<p><br/><a id=\"sign\" class=\"btn btn-primary\" role=\"button\" onclick=\"edit('"+skillsNames[i]+"')\">Edit</a></p>");
					//$(divName).append("<input id='slider"+skillsNames[i]+"' type=\"text\"/");
					$(divName).append("<input id='input"+skillsNames[i]+"' type=\"number\" min=\"-1\" max=\"5\"/>")
					//console.log($(divName));
				}
			}
		},
		error : function(data3, status, error){
			console.log("You are not the teacher of this class.");
			console.log(data3);
			console.log(status);
			console.log(error);
		}
	});
}

function edit(c){
	var email = decodeURI(location.search.substring(location.search.lastIndexOf("=")+1));
	console.log(c);
	var nomInput = "#input"+c;
	//console.log(nomInput);
	//console.log($(nomInput).val());
	var nouvelleNote = $(nomInput).val();
	//console.log(nouvelleNote);
	//console.log(serverAddress + "/api/users/"+email+"/skills/"+c+"?mark="+nouvelleNote+"&token="+token());
	if(nouvelleNote >=0 && nouvelleNote <=5)
	{
		console.log("ok");
		$.ajax({
			type: 'POST',
			url : serverAddress + "/api/users/students/"+email+"/skills/"+c+"?mark="+nouvelleNote+"&token="+token(),
			
			success:function(data,status){
				if (data.success)
				{
					console.log("mark changed");
					renderElement();
				}
				else
				{
					console.log("error while changing mark");
					console.log(data.error.code);
					console.log(status);
					if (data.error.code=="ER_DUP_ENTRY")
					{
						$.ajax({
							type: 'PUT',
							url : serverAddress + "/api/users/students/"+email+"/skills/"+c+"?mark="+nouvelleNote+"&token="+token(),
							
							success:function(data,status){
								if (data.success)
								{
									console.log("mark changed");
									renderElement();
								}
								else
								{
									console.log("error while changing mark");
									console.log(data.error.code);
									console.log(status);
									//console.log(error);
								}
							}
						})
					}
					//console.log(error);
				}
			}
		})
	}
	else if(nouvelleNote==-1)
	{
		console.log("deletion requested");
		$.ajax({
			type: 'DELETE',
			url : serverAddress + "/api/users/students/"+email+"/skills/"+c+"?mark="+nouvelleNote+"&token="+token(),
			
			success:function(data,status){
				if (data.success)
				{
					console.log("mark deleted");
					renderElement();
				}
				else
				{
					console.log("error while changing mark");
					console.log(data.error.code);
					console.log(status);
					//console.log(error);
				}
			}
		})
	}
	//console.log(document.getElementById(c).value);
}

function supprimerClasse(){
	console.log("tentative de suppression de classe d'un eleve");
	var email = decodeURI(location.search.substring(location.search.lastIndexOf("=")+1));
	//todo : update l'élève pour changer sa classe
	console.log(serverAddress + "/api/users/"+email+"?class=&token="+token());
	$.ajax({
		type : 'PUT',
		url : serverAddress + "/api/users/"+email+"?class=null&token="+token(),

		success:function(data,status){
			console.log(data);
			if(data.success)
			{
				console.log("Class deleted");
				renderElement();
			}
			else{
				console.log("Error while deleting class");
			}
		}
	});
}

function ajouterClasse(){
	console.log("tentative d'ajout de classe d'un eleve");
	$('#StudentClass').html("");
	$.ajax({
		type : 'GET',
		url : serverAddress + "/api/classes?token=" + token(),
		success : function(data, status){
			if(data.success){
				console.log(data);
				var listeClasses = "";
				for (var i=0; i< data.classes.length;i++)
				{
					console.log(data.classes[i]);
					var className = data.classes[i].name;/*data.users[i].firstname + " " + data.users[i].lastname;*/
					console.log("classe #"+i+ " : ")
					console.log(className);
					listeClasses = listeClasses +"<button class=\"btn btn-lg btn-primary \" type=\"button\" onclick=\"choisirClasse('"+className+"')\">"+className+"</button>";
				}
				$('#ClassList').html(listeClasses);
			}
		}
	});
}

function choisirClasse(className){
		var email = decodeURI(location.search.substring(location.search.lastIndexOf("=")+1));
		//todo : update l'élève pour changer sa classe
		$.ajax({
		type : 'PUT',
		url : serverAddress + "/api/users/"+email+"?class="+className+"&token="+token(),

		success:function(data,status){
			if(data.success)
			{
				console.log("Class updated");
				$('#ClassList').html("");
				renderElement();
			}
			else{
				console.log("Error while updating class");
			}
		}
	});
}
