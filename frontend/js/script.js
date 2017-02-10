var serverAddress = "http://localhost:8080";

$(document).ready(function(){
	renderNavBar();
});

function renderNavBar(){
	console.log(getToken());
	console.log("Function renderHeader()");
	if(getToken()){
		var navBar = "<form class=\"navbar-form navbar-right\">";
		navBar = navBar + "<div class=\"form-group\"><label><FONT COLOR=\"#DCDCDC\">" + getToken().email + " - " + getToken().firstname + " " + getToken().lastname + "</font></label></div>";
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

function getToken(){
	return parseJwt(window.localStorage.getItem("carboost-token"));
}

function setToken(token){
	window.localStorage.setItem("carboost-token", token);
}

function deleteToken(){

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
					console.log(data.message)
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
