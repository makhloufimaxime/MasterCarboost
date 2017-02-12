$(document).ready(function(){
	renderElement();
});

function renderElement(){
	console.log("Function renderElement()");
	var id = decodeURI(location.search.substring(location.search.lastIndexOf("=")+1));
	$.ajax({
		type : 'GET',
		url : serverAddress + "/api/classes/" + id + "?token=" + token(),

		success : function(data, status){
			if(data.success){
				var table = "<h2 class=\"sub-header\">" + data.class[0].name + "</h2>";
				table = table + "<div class=\"table-responsive\"><table class=\"table table-striped\"><thead><tr><th>#</th><th>First Name</th><th>Last Name</th></tr></thead>";
				table = table + "<tbody>";
				table = table + "<tr><td>Teacher</td><td><a href=\"teacher.html?teacher=" + data.class[0].teacher + "\"><b>" + data.class[0].firstname +"</b></a></td><td><a href=\"teacher.html?teacher=" + data.class[0].teacher + "\"><b>" + data.class[0].lastname +"</b></a></td></tr>";
				
				if(getToken().level==2){
					$('#dropDownMenu').append("<li role=\"separator\" class=\"divider\"></li><li><a href=\"admin.html\">Admin</a></li>");
				}
				
				$.ajax({
					type : 'GET',
					url : serverAddress + "/api/classes/" + id +"/students?token=" + token(),

					success : function(data, status){
						if(data.success){
							for (var i = 0; i < data.users.length; i++){
								table = table +  "<tr>";
								table = table + "<td>" + i + "</td>";
								table = table + "<td><a href=\"student.html?student=" + data.users[i].email + "\">"+ data.users[i].firstname + "</a></td>";
								table = table + "<td><a href=\"student.html?student=" + data.users[i].email + "\">"+ data.users[i].lastname + "</a></td>";
								table = table  + "</tr>";
							}
							table = table +  "</tbody></table></div>";
							$('#table').html(table);
						}
						else{
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
