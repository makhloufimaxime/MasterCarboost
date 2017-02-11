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

				$.ajax({
					type : 'GET',
					url : serverAddress + "/api/users/students/" + email + "/skills?token=" + token(),

					success : function(data, status){
						if(data.success){
							for (var i = 0; i < data.skills.length; i++){
								progress = progress + "<div class=\"col-xs-6 col-sm-3 placeholder\">";
								progress = progress + "<span class=\"text-muted\">" + data.skills[i].mark + "/5</span>";
								progress = progress + "<div class=\"progress\">"
								progress = progress + progressBar(data.skills[i].mark);
								progress = progress + "</div>";
								progress = progress + "<h4>" + data.skills[i].name + "</h4>";
								// Check si le mec est prof de la classe ou non
								if(getToken().level > 0)
								progress = progress + "<p><br/><a id=\"sign\" class=\"btn btn-primary\" role=\"button\" onclick=\"edit(" + data.skills[0].id + ")\">Edit</a></p>";
								progress = progress + "</div>";
							}
							$('#progressBar').html(progress);
						}
						else{
							progress = progress + "<h3>No skills have been found.</h3>";
							$('#progressBar').html(progress);
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

function edit(id){
	location.href="edit.html?id=" + id;
}
