$(document).ready(function(){
	 renderElement();
});

function renderElement(){
	if(getToken()){
		location.href="index.html";
	}
}


function signUp(){
	console.log("Function signUp()");
	var email = document.getElementById("inputMail").value;
	var firstname = document.getElementById("inputFirstName").value;
	var lastname = document.getElementById("inputLastName").value;
	var password = document.getElementById("inputPass").value;
	console.log(email + firstname + lastname + password);
	if(email != "" && firstname != "" && lastname != "" && password != ""){
		$.ajax({
			type : 'POST',
			url : serverAddress + "/api/signup?email=" + email + "&password=" + password + "&firstname=" + firstname + "&lastname=" + lastname,

			success : function(data, status){
				if(data.success){
					console.log(data.message);
					setToken(data.token);
				}
				else{
					console.log(data.message);
				}
			},

			error : function(data, status, error){
				console.log("Failed to sign up.");
				console.log(data);
				console.log(status);
				console.log(error);
			}
		});
	}
}
