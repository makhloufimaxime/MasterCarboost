$(document).ready(function(){
	renderElement();
});

function renderElement(){
	console.log("Function showEvent()");
	if (getToken()){
		document.getElementById("sign").style.display = "none";
	}
}

function goToSignUp(){
	if(!getToken()){
		location.href="signup.html";
	}
}

function goToStudent(){
	console.log("Function goToStudent()");
	location.href="list.html?list=Student";
}

function goToTeacher(){
	console.log("Function goToTeacher()")
	location.href="list.html?list=Teacher";
}

function goToClass(){
	console.log("Function goToClass()")
	location.href="list.html?list=Class";
}
