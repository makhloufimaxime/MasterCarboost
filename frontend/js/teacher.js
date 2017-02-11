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
				var table = "<h1 class=\"sub-header\">Students of " + data.user[0].firstname + " " + data.user[0].lastname + " - <a href=\"class.html?class=" + data.user[0].id + "\">" + data.user[0].name + "</a></h1>";
				table = table + "<div class=\"table-responsive\"><table class=\"table table-striped\"><thead><tr><th>#</th><th>First Name</th><th>Last Name</th></tr></thead>";
				table = table + "<tbody>";

				$.ajax({
					type : 'GET',
					url : serverAddress + "/api/users/teachers/" + email + "/students?token=" + token(),

					success : function(data, status){
						if(data.success){
							for (var i = 0; i < data.users.length; i++){
								table = table +  "<tr>";
								table = table + "<td>" + i + "</td>";
								table = table + "<td><a href=\"student.html?student=" + data.users[i].email + "\">" + data.users[i].firstname + "</a></td>";
								table = table + "<td><a href=\"student.html?student=" + data.users[i].email + "\">" + data.users[i].lastname + "</a></td>";
								table = table  + "</tr>";
							}
							table = table +  "</tbody></table></div>";
							$('#table').html(table);
							if(getToken().level==2){
								$('#downgradeButton').html("<button class=\"btn btn-lg btn-primary \" type=\"button\" onclick=\"downgradeToStudent()\">Downgrade to Student</button>");						
							}
						}
						else{
							table = table + "<h3>No students have been found.</h3>";
							table = table +  "</tbody></table></div>";
							$('#table').html(table);
							console.log(data.message);
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

function downgradeToStudent(){
	console.log("Downgrading request clicked");
	var email = decodeURI(location.search.substring(location.search.lastIndexOf("=")+1));
	console.log(serverAddress + "/api/users/" + email + "?token="+token()+"&level=0");
	$.ajax({
		type : 'PUT',
		url : serverAddress + "/api/users/" + email + "?token="+token()+"&level=0",
		
		success:function(data){
			console.log("Level updated");
		}
	})
}
