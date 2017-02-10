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
		default:
			sideBar = sideBar + "<li><a href=\"list.html?list=Student\">Students</a></li>";
			sideBar = sideBar + "<li><a href=\"list.html?list=Teacher\">Teacher</a></li>";
			sideBar = sideBar + "<li class=\"active\"><a href=\"list.html?list=Class\">Class<span class=\"sr-only\">(current)</span></a></li>";
	}
	sideBar = sideBar + "</ul>";
	$('#sideBar').html(sideBar);
}

function renderElement(){
	console.log("Function renderElement()");
	renderSideBar();
	switch(state) {
		case 0:
			var table = "<h2 class=\"sub-header\">List of the students</h2>";
			table = table + "<div class=\"table-responsive\"><table class=\"table table-striped\"><thead><tr><th>#</th><th>Last Name</th><th>First Name</th><th>Class</th></tr></thead>";
			table = table + "<tbody>";
			for (var i = 1; i <= 150; i++){
				table = table +  "<tr>";
				table = table + "<td>" + i + "</td>";
				table = table + "<td><a href=\"student.html?student=LastName" + i + "\">Last Name"+ i + "</a></td>";
				table = table + "<td><a href=\"student.html?student=LastName" + i + "\">First Name"+ i + "</a></td>";
				table = table + "<td><a href=\"class.html?class=Class" + i + "\">Class"+ i + "</a></td>";
				table = table  + "</tr>";
			}
			table = table +  "</tbody></table></div>";
			break;
		case 1:
			var table = "<h2 class=\"sub-header\">List of the teachers</h2>";
			table = table + "<div class=\"table-responsive\"><table class=\"table table-striped\"><thead><tr><th>#</th><th>First Name</th><th>Last Name</th><th>Class</th></tr></thead>";
			table = table + "<tbody>";
			for (var i = 1; i <= 5; i++){
				table = table +  "<tr>";
				table = table + "<td>" + i + "</td>";
				table = table + "<td><a href=\"teacher.html?teacher=LastName" + i + "\">Last Name"+ i + "</a></td>";
				table = table + "<td><a href=\"teacher.html?teacher=LastName" + i + "\">First Name"+ i + "</a></td>";
				table = table + "<td><a href=\"class.html?class=Class" + i + "\">Class"+ i + "</a></td>";
				table = table  + "</tr>";
			}
			table = table +  "</tbody></table></div>";
			break;
		default:
			var table = "<h2 class=\"sub-header\">List of the classes</h2>";
			table = table + "<div class=\"table-responsive\"><table class=\"table table-striped\"><thead><tr><th>#</th><th>Name</th><th>Teacher</th><th>Number of students</th></tr></thead>";
			table = table + "<tbody>";
			for (var i = 1; i <= 5; i++){
				table = table +  "<tr>";
				table = table + "<td>" + i + "</td>";
				table = table + "<td><a href=\"class.html?class=Class" + i + "\">Class"+ i + "</a></td>";
				table = table + "<td><a href=\"teacher.html?teacher=LastName" + i + "\">Teacher"+ i + "</a></td>";
				table = table + "<td>"+ 30 + "</td>";
				table = table  + "</tr>";
			}
			table = table +  "</tbody></table></div>";
	} 
	$('#table').html(table);
}        
           