$(document).ready(function(){
	renderElement();
});

function renderElement(){
	console.log("Function renderElement()")
	var studentName = decodeURI(location.search.substring(location.search.lastIndexOf("=")+1));
	$('#student').html(studentName);
	var progress = "";
	for (var i = 1; i <= 10; i++){
		progress = progress + "<div class=\"col-xs-6 col-sm-3 placeholder\">";
		progress = progress + "<div class=\"progress\">"
		progress = progress + progressBar(Math.random() * (5 - 0 + 1));
		progress = progress + "</div>";
		progress = progress + "<h4>Skill's name " + i + "</h4>";
		progress = progress + "<span class=\"text-muted\">Comments  fehKKqhekjfehKKqhekj fehKKqhekj fehKKqhekj " + i + "</span>";
		// Check si le mec est prof de la classe ou non
		progress = progress + "<p><br/><a id=\"sign\" class=\"btn btn-primary\" role=\"button\" onclick=\"edit()\">Edit</a></p>";
		progress = progress + "</div>";
	}
	$('#progressBar').html(progress);
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

function edit(){
	location.href="edit.html";
}
