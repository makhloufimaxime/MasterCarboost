var mysql       = require('mysql');
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'root',
  database : 'ws_project'
});

connection.connect();

var query = "SELECT * FROM users WHERE email = ?";
var queryParams = ["dali.mersel@telecom-st-etienne.fr"];
connection.query(query, queryParams, function (err, data, fields) {
  if (err){
    console.log(err);
  }
  else{
    console.log(data);
  }
});

connection.end();
