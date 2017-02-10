$(document).ready(function(){
	renderElement();
});

function renderElement(){
	console.log("Function renderElement()");
	var teacherName = decodeURI(location.search.substring(location.search.lastIndexOf("=")+1));
	var table = "<h2 class=\"sub-header\">" + teacherName + "'s students</h2>";
	table = table + "<div class=\"table-responsive\"><table class=\"table table-striped\"><thead><tr><th>#</th><th>Last Name</th><th>First Name</th></tr></thead>";
	table = table + "<tbody>";
	for (var i = 2; i <= 30; i++){
		table = table +  "<tr>";
		table = table + "<td>" + i + "</td>";
		table = table + "<td><a href=\"student.html?student=LastName" + i + "\">Last Name"+ i + "</a></td>";
		table = table + "<td><a href=\"student.html?student=LastName" + i + "\">First Name"+ i + "</a></td>";
		table = table  + "</tr>";
	}
	table = table +  "</tbody></table></div>";
	$('#table').html(table);
}  