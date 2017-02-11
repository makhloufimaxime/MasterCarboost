var serverAddress = "http://localhost:8080";

$(document).ready(function(){
	renderNavBar();
});

function renderNavBar(){
	console.log("Script.js console log token : ");
	console.log(getToken());
	console.log("Function renderHeader()");
	if(getToken()){
		var navBar = "<form class=\"navbar-form navbar-right\">";
		if(getToken().level == 0){
			navBar = navBar + "<div class=\"form-group\"><label><FONT COLOR=\"#DCDCDC\"><a href=\"student.html?student=" + getToken().email + "\">" + getToken().email + " - " + getToken().firstname + " " + getToken().lastname + "</a></font></label></div>";
		}
		else if (getToken().level == 1){
			navBar = navBar + "<div class=\"form-group\"><label><FONT COLOR=\"#DCDCDC\"><a href=\"teacher.html?teacher=" + getToken().email + "\">" + getToken().email + " - " + getToken().firstname + " " + getToken().lastname + "</a></font></label></div>";
		}
		else{

		}
		navBar = navBar + "	<button type=\"button\" class=\"btn btn-success\" onclick=\"logOut()\">Log Out</button></form>";
		$('#navbar').html(navBar);
	}
	else{
		var navBar = "<form class=\"navbar-form navbar-right\">";
		navBar = navBar + "<div class=\"form-group\"><input type=\"email\" placeholder=\"Email\" class=\"form-control\" id=\"inputEmail\"></div>";
		navBar = navBar + "	<div class=\"form-group\"><input type=\"password\" placeholder=\"Password\" class=\"form-control\" id=\"inputPassword\"></div>";
		navBar = navBar + "	<button type=\"button\" class=\"btn btn-success\" onclick=\"logIn()\">Sign in</button></form>";
		$('#navbar').html(navBar);
	}
}

function token(){
	return window.localStorage.getItem("carboost-token");
}

function getToken(){
	return parseJwt(token());
}

function setToken(token){
	window.localStorage.setItem("carboost-token", token);
}

function deleteToken(){
	window.localStorage.removeItem("carboost-token");
}

function parseJwt (token) {
	if(token){
		var base64Url = token.split('.')[1];
		var base64 = base64Url.replace('-', '+').replace('_', '/');
		return JSON.parse(window.atob(base64));
	}
	else{
		return null;
	}
};

function logIn(){
	console.log("Function logIn()");
	var email = document.getElementById("inputEmail").value;
	var password = document.getElementById("inputPassword").value;
	if(email != "" && password != ""){
		$.ajax({
			type : 'POST',
			url : serverAddress + "/api/login?email=" + email + "&password=" + password,

			success : function(data, status){
				if(data.success){
					console.log(data.message);
					setToken(data.token);
					location.href="index.html";
				}
				else{
					alert(data.message);
				}
			},

			error : function(data, status, error){
				console.log("Failed to log in.");
				console.log(data);
				console.log(status);
				console.log(error);
			}
		});
	}
}

function logOut(){
	console.log("Function logOut()");
	deleteToken();
	location.href="index.html";
}
