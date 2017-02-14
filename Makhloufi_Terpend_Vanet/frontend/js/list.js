var state = null;

$(document).ready(function(){
	isTeacher();
	renderElement();
});

function isTeacher(){
	console.log("Function isTeacher");
	var isTeacher = decodeURI(location.search.substring(location.search.lastIndexOf("=")+1));
	switch(isTeacher) {
		case "Student":
		state = 0;
		break;
		case "Teacher":
		state = 1;
		break;
		case "Class":
		state = 2;
		break;
		default:
		sate = 2;
	}
}

function renderSideBar(){
	console.log("Function renderSideBar");
	var sideBar = "<ul class=\"nav nav-sidebar\">";
	switch(state) {
		case 0:
		sideBar = sideBar + "<li class=\"active\"><a href=\"list.html?list=Student\">Student<span class=\"sr-only\">(current)</span></a></li>";
		sideBar = sideBar + "<li><a href=\"list.html?list=Teacher\">Teacher</a></li>";
		sideBar = sideBar + "<li><a href=\"list.html?list=Class\">Class</a></li>";
		break;
		case 1:
		sideBar = sideBar + "<li><a href=\"list.html?list=Student\">Students</a></li>";
		sideBar = sideBar + "<li class=\"active\"><a href=\"list.html?list=Teacher\">Teachers<span class=\"sr-only\">(current)</span></a></li>";
		sideBar = sideBar + "<li><a href=\"list.html?list=Class\">Class</a></li>";
		break;
		case 2:
		sideBar = sideBar + "<li><a href=\"list.html?list=Student\">Students</a></li>";
		sideBar = sideBar + "<li><a href=\"list.html?list=Teacher\">Teacher</a></li>";
		sideBar = sideBar + "<li class=\"active\"><a href=\"list.html?list=Class\">Class<span class=\"sr-only\">(current)</span></a></li>";
		break;
		default:
		sideBar = sideBar + "<li><a href=\"list.html?list=Student\">Students</a></li>";
		sideBar = sideBar + "<li><a href=\"list.html?list=Teacher\">Teacher</a></li>";
		sideBar = sideBar + "<li><a href=\"list.html?list=Class\">Class</a></li>";
	}
	if (getToken()){
		if(getToken().level ==2)
		{
			sideBar = sideBar + "<li><a href=\"admin.html\">Admin</a></li>";
		}
	}
	sideBar = sideBar + "</ul>";
	$('#sideBar').html(sideBar);
}

function renderElement(){
	console.log("Function renderElement()");
	renderSideBar();
	switch(state) {
		case 0:
		renderStudentList();
		break;
		case 1:
		renderTeachersList();
		break;
		case 2:
		renderClassesList();
		default:
		$('#table').html("");
	}
	if (getToken()){
		if(getToken().level ==2)
		{
			$('#dropDownMenu').append("<li role=\"separator\" class=\"divider\"></li><li><a href=\"admin.html\">Admin</a></li>");
		}
	}
}

function renderStudentList(){
	$.ajax({
		type : 'GET',
		url : serverAddress + "/api/users/students?token=" + token(),

		success : function(data, status){
			if(data.success){
				console.log(data);
				var table = "<h2 class=\"sub-header\">List of the students</h2>";
				table = table + "<div class=\"table-responsive\"><table class=\"table table-striped\"><thead><tr><th>#</th><th>First Name</th><th>Last Name</th><th>Class</th></tr></thead>";
				table = table + "<tbody>";
				for (var i = 0; i < data.users.length; i++){
					table = table +  "<tr>";
					table = table + "<td>" + i + "</td>";
					table = table + "<td><a href=\"student.html?student=" + data.users[i].email + "\">" + data.users[i].firstname + "</a></td>";
					table = table + "<td><a href=\"student.html?student=" + data.users[i].email + "\">" + data.users[i].lastname + "</a></td>";
					table = table + "<td><a href=\"class.html?class=" + data.users[i].class + "\">"+ data.users[i].class + "</a></td>";
					table = table  + "</tr>";
				}
				table = table +  "</tbody></table></div>";
				$('#table').html(table);
			}
			else{
				if(getToken()){
					var table = "<p>There is no student</p>";
					$('#table').html(table);
				}else {
					var table = "<p><font color=\"red\">Please Sign Up or Log In to access to the list of the students.</font></p>";
					$('#table').html(table);
				}
				console.log(data.message);
			}
		},

		error : function(data, status, error){
			console.log("Failed to retrieve students\' list.");
			console.log(data);
			console.log(status);
			console.log(error);
		}
	});
}

function renderTeachersList(){
	$.ajax({
		type : 'GET',
		url : serverAddress + "/api/users/teachers?token=" + token(),

		success : function(data, status){
			if(data.success){
				var table = "<h2 class=\"sub-header\">List of the teachers</h2>";
				table = table + "<div class=\"table-responsive\"><table class=\"table table-striped\"><thead><tr><th>#</th><th>First Name</th><th>Last Name</th><th>Class</th></tr></thead>";
				table = table + "<tbody>";
				for (var i = 0; i < data.users.length; i++){
					table = table +  "<tr>";
					table = table + "<td>" + i + "</td>";
					table = table + "<td><a href=\"teacher.html?teacher=" + data.users[i].email + "\">" + data.users[i].firstname + "</a></td>";
					table = table + "<td><a href=\"teacher.html?teacher=" + data.users[i].email + "\">" + data.users[i].lastname + "</a></td>";
					table = table + "<td><a href=\"class.html?class=" + data.users[i].class + "\">"+ data.users[i].class + "</a></td>";
					table = table  + "</tr>";
				}
				table = table +  "</tbody></table></div>";
				$('#table').html(table);
			}
			else{
				if(getToken()){
					var table = "<p>There is no teacher</p>";
					$('#table').html(table);
				}else {
					var table = "<p><font color=\"red\">Please Sign Up or Log In to access to the list of the teachers.</font></p>";
					$('#table').html(table);
				}
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

function renderClassesList(){
	$.ajax({
		type : 'GET',
		url : serverAddress + "/api/classes?token=" + token(),

		success : function(data, status){
			if(data.success){
				console.log(data);
				var table = "<h2 class=\"sub-header\">List of the classes</h2>";
				table = table + "<div class=\"table-responsive\"><table class=\"table table-striped\"><thead><tr><th>#</th><th>Name</th><th>Teacher</th><th>Number of students</th></tr></thead>";
				table = table + "<tbody>";
				for (var i = 0; i < data.classes.length; i++){
					table = table +  "<tr>";
					table = table + "<td>" + i + "</td>";
					table = table + "<td><a href=\"class.html?class=" + data.classes[i].name + "\">"+ data.classes[i].name + "</a></td>";
					table = table + "<td><a href=\"teacher.html?teacher=" + data.classes[i].email + "\">"+ data.classes[i].firstname + " " + data.classes[i].lastname + "</a></td>";
					table = table + "<td>"+ data.classes[i].students + "</td>";
					table = table  + "</tr>";
				}
				table = table +  "</tbody></table></div>";
				$('#table').html(table);
			}
			else{
				if(getToken()){
					var table = "<p>There is no class</p>";
					$('#table').html(table);
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
