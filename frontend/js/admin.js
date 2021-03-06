$(document).ready(function(){
	renderElement();
});

function renderElement(){
	console.log("Function renderElement()");
	var email = decodeURI(location.search.substring(location.search.lastIndexOf("=")+1));
	$.ajax({
		type : 'GET',
		url : serverAddress + "/api/users/teachers/" + email + "?token=" + token(),

		success : function(data, status){
			if(data.success){
				if(getToken().level ==2)
				{
					$( '#adminBoard' ).html("");
					//$( '#adminBoard' ).append( "<h1>Test</h1>" ); //put the admin control panel here
					$( '#adminBoard' ).append( "<h1>Creer une nouvelle classe : </h1>" );
					$( '#adminBoard' ).append( "<div class=\"form-group\"><label for=\"usr\">Nom de la classe:</label><input type=\"text\" class=\"form-control\" id=\"nomClasse\"></div>" );
					$('#adminBoard').append("<button class=\"btn btn-lg btn-primary \" type=\"button\" onclick=\"creerNouvelleClasse()\">Envoyer</button>");
					$('#adminBoard').append("<hr />");
					$( '#adminBoard' ).append( "<h1>Creer une nouvelle competence : </h1>" );
					$( '#adminBoard' ).append( "<div class=\"form-group\"><label for=\"usr\">Nom de la competence:</label><input type=\"text\" class=\"form-control\" id=\"nomCompetence\"></div>" );
					$('#adminBoard').append("<button class=\"btn btn-lg btn-primary \" type=\"button\" onclick=\"creerNouvelleCompetence()\">Envoyer</button>");
					$('#adminBoard').append("<hr />");
					$('#adminBoard').append("<h1>Gestion des classes : </h1>");
					
					$.ajax({
						type : 'GET',
						url : serverAddress + "/api/classes?token=" + token(),

						success : function(dataClasses, status){
							if(dataClasses.success){
								console.log(dataClasses);
								var table = "<h2 class=\"sub-header\">Liste des classes</h2>";
								table = table + "<div class=\"table-responsive\"><table class=\"table table-striped\"><thead><tr><th>#</th><th>Name</th><th>Teacher</th><th>Options</th></tr></thead>";
								table = table + "<tbody>";
								for (var i = 0; i < dataClasses.classes.length; i++){
									table = table +  "<tr>";
									table = table + "<td>" + i + "</td>";
									table = table + "<td><a href=\"class.html?class=" + dataClasses.classes[i].id + "\">"+ dataClasses.classes[i].name + "</a></td>";
									table = table + "<td><a href=\"teacher.html?teacher=" + dataClasses.classes[i].teacher + "\">"+ dataClasses.classes[i].firstname + " " + dataClasses.classes[i].lastname + "</a></td>";
									if (dataClasses.classes[i].firstname!= null)
									{
										table = table + "<td>"+ "<button class=\"btn btn-lg btn-primary \" type=\"button\" onclick=\"supprimerProfesseur('"+dataClasses.classes[i].name+"')\">Enlever ce professeur</button>";
										table = table + "<button class=\"btn btn-lg btn-danger \" type=\"button\" onclick=\"supprimerClasse('"+dataClasses.classes[i].name+"')\">Supprimer la classe</button>" + "</td>";
									}
									else
									{
										table = table + "<td>"+ "<button class=\"btn btn-lg btn-primary \" type=\"button\" onclick=\"ajouterProfesseur('"+dataClasses.classes[i].name+"')\">Ajouter un professeur </button>";
										table = table + "<button class=\"btn btn-lg btn-danger \" type=\"button\" onclick=\"supprimerClasse('"+dataClasses.classes[i].name+"')\">Supprimer la classe</button>" + "</td>";
									}
									table = table  + "</tr>";
								}
								table = table +  "</tbody></table></div>";
								table = table + "<div id=\"profListe\"></div>"
								$('#adminBoard').append(table);
							}
							else{
								if(getToken()){
									var table = "<p>There is no class</p>";
									$('#adminBoard').append(table);
								}else {
									var table = "<p><font color=\"red\">Please Sign Up or Log In to access to the list of the classes.</font></p>";
									$('#table').html(table);
								}
								console.log(data.message);
							}
						},

						error : function(data, status, error){
							console.log("Failed to retrieve classes\' list.");
							console.log(data);
							console.log(status);
							console.log(error);
						}
					});
				}
				else
				{
					var message = "<h3>Cette page est reservee a l'administration.</h3>"
					$('#adminBoard').html(message);
				}
			}
			else{
				console.log(data.message);
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

function creerNouvelleClasse(){
	nomClasseText = $('#nomClasse').val(); //marche
	if (!nomClasseText=="")
	{
		console.log("class name = "+nomClasseText);	
		$.ajax({
			type : 'POST',
			url : serverAddress + "/api/classes?name="+nomClasseText+"&token="+token(),
			
			success : function(data,status){
				if (data.success){
					console.log("Class created successfuly");
					renderElement();
				}
				else
				{
					console.log("Class creation failed");
				}
			}
		});
	}
}

function creerNouvelleCompetence(){
	nomCompetenceText = $('#nomCompetence').val(); //marche
	if(!nomCompetenceText=="")
	{
		console.log("skill name = "+nomCompetenceText);
		$.ajax({
			type : 'POST',
			url : serverAddress + "/api/skills?name="+nomCompetenceText+"&token="+token(),
			
			success : function(data,status){
				if (data.success){
					console.log("skill created successfuly");
					renderElement();
				}
				else
				{
					console.log("skill creation failed");
				}
			}
		});
	}
}

function supprimerClasse(idClasse){
	//console.log("suppr classe");
	//console.log("suppresion classe " +idClasse);
	$.ajax({
		type : 'DELETE',
		url : serverAddress + "/api/classes/" + idClasse + "?token=" + token(),

		success : function(data,status){
			console.log(data);
			if (data.success){
				console.log("Class deletion successful");
				renderElement();
			}
			else
			{
				console.log("Class deletion failed");
			}
		}
	});
}

function supprimerProfesseur(idClasse){
	console.log("suppresion prof " +idClasse);
	$.ajax({
		type : 'PUT',
		url : serverAddress + "/api/classes/" + idClasse + "?teacher=null&token=" + token(),
		
		success : function(data,status){
			if(data.success){
				console.log("Teacher updated");
				renderElement();
			}
			else{
				console.log(data);
				console.log("Error while changing teacher");
			}
		}
	});
	$.ajax({
		
	});
}

function ajouterProfesseur(idClasse){
	console.log("ajout prof " +idClasse);
	$.ajax({
		type : 'GET',
		url : serverAddress + "/api/users/teachers?class=null&token=" + token(),

		success : function(data, status){
			if(data.success){
				console.log(data);
				var listeProfs = "";
				for (var i=0; i< data.users.length;i++)
				{
					console.log("prof #"+i+" = "+data.users[i].firstname+" "+data.users[i].lastname)
					var profName = data.users[i].firstname + " " + data.users[i].lastname;
					var emailProf = data.users[i].email;
					console.log("email = "+emailProf);
					listeProfs = listeProfs +"<button class=\"btn btn-lg btn-primary \" type=\"button\" onclick=\"choisirProfesseur('"+data.users[i].email+"','"+idClasse+"')\">"+profName+"</button>";
				}
				$('#profListe').html(listeProfs);
			}
		}
	});
}

function choisirProfesseur(emailProf, idClasse){
	$('#profListe').html("");
	console.log(emailProf +"  new prof classe " + idClasse);
	$.ajax({
		type : 'PUT',
		url : serverAddress + "/api/classes/" + idClasse + "?teacher="+emailProf+"&token=" + token(),
		
		success : function(data,status){
			if(data.success){
				console.log("Teacher updated");
				renderElement();
			}
			else{
				console.log(data);
				console.log("Error while changing teacher");
			}
		}
	});
}