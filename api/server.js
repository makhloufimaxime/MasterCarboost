// =======================
// get the packages we need ============
// =======================
var express     = require('express');
var app         = express();
var bodyParser  = require('body-parser');
var morgan      = require('morgan');
var mysql       = require('mysql2');
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'root',
  database : 'carboost'
});
var jwt    = require('jsonwebtoken'); // used to create, sign, and verify tokens
var config = require('./config'); // get our config file

//ALLOW CROSS DOMAIN
var allowCrossDomain = function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
}
app.use(allowCrossDomain);

// =======================
// configuration =========
// =======================
var port = process.env.PORT || 8080; // used to create, sign, and verify tokens
app.set('superSecret', config.secret); // secret variable

// use body parser so we can get info from POST and/or URL parameters
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// use morgan to log requests to the console
app.use(morgan('dev'));

// =======================
// routes ================
// =======================
// basic route
app.get('/', function(req, res) {
  res.send('Hello! The API is at http://localhost:' + port + '/api');
});

// API ROUTES -------------------

var apiRoutes = express.Router();

apiRoutes.post('/signup', function(req, res) {
  var email = req.query.email;
  var password = req.query.password;
  var firstname = req.query.firstname;
  var lastname = req.query.lastname;

  var queryParams = [email, password, firstname, lastname];

  var query = "INSERT INTO Users (email, password, firstname, lastname) VALUES (?, ?, ?, ?)";
  connection.query(query, queryParams, function(err){
    if(err){
      res.json({ success: false, message: 'Failed to create a new account.' });
    }
    else{
      // if user is successfully created
      // create a token
      var payload = {"email":email,"firstname":firstname,"lastname":lastname,"level":0,"class":null};
      var token = jwt.sign(payload, app.get('superSecret'), {
        expiresIn: "2 days" // expires in 48 hours
      });
      // return the information including token as JSON
      res.json({
        success: true,
        message: 'New account created. Authentication succeeded!',
        token: token
      });
    }
  })
});

apiRoutes.post('/login', function(req, res) {
  var email = req.query.email;
  var password = req.query.password;

  var queryParams = [email];

  var query = "SELECT * FROM Users WHERE email = ?";
  connection.query(query, queryParams, function(err, data, fields){
    if(err){
      res.json({ success: false, message: 'Authentication failed. Database error.' });
    }
    else{
      if(data == ""){
        // if user is not found
        res.json({ success: false, message: 'Authentication failed. User not found.' });
      }
      else{
        if(password != data[0].password){
          // if user is found and password is wrong
          res.json({ success: false, message: 'Authentication failed. Wrong password.' });
        }
        else{
          // if user is found and password is right
          // create a token
          var payload = {"email":data[0].email,"firstname":data[0].firstname,"lastname":data[0].lastname,"level":data[0].level,"class":data[0].class};
          var token = jwt.sign(payload, app.get('superSecret'), {
            expiresIn: "365 days" // expires in a year
          });
          // return the information including token as JSON
          res.json({
            success: true,
            message: 'Authentication succeeded!',
            token: token
          });
        }
      }
    }
  })
});

apiRoutes.use(function(req, res, next) {
  var token = req.body.token || req.query.token || req.headers['x-access-token'];

  // decode token
  if (token) {
    // verifies secret and checks exp
    jwt.verify(token, app.get('superSecret'), function(err, decoded) {
      if (err) {
        return res.json({ success: false, message: 'Failed to authenticate token.' });
      } else {
        // if everything is good, save to request for use in other routes
        req.decoded = decoded;
        next();
      }
    });
  } else {
    // if there is no token
    // return an error
    return res.status(403).send({
      success: false,
      message: 'No token provided.'
    });
  }
});

///////////////////////////////////// POST /////////////////////////////////////

///// STUDENTS /////

apiRoutes.post('/users/students/:email/skills/:name', function(req, res) {
  var email = req.params.email;
  var name = req.params.name
  var mark = req.query.mark;
  var queryParams = [email, name, mark];

  if(req.decoded.level > 0){ // A student can't create a new mark
    var query = "INSERT INTO Attributions (student, skill, mark) VALUES (?, ?, ?);";
    connection.query(query, queryParams, function(err, data, fields){
      if(err){
        res.json({ success: false, message: 'Failed to create a new mark for this student.', error: err });
      }
      else{
        res.json({ success: true, message: 'New mark attributed.' });
      }
    });
  }
  else{
    res.json({ success: false, message: 'You are not allowed to create a new mark.' });
  }
});

///// CLASSES /////

apiRoutes.post('/classes', function(req, res) {
  var name = req.query.name;
  var queryParams = [name];

  var query = "INSERT INTO Classes (name) VALUES (?);";
  if(req.decoded.level > 1){ // Only the admin can create a new class
    connection.query(query, queryParams, function(err){
      if(err){
        res.json({ success: false, message: 'Failed to create a new class.', error: err });
      }
      else{
        res.json({ success: true, message: 'New class created.' });
      }
    });
  }
  else{
    res.json({ success: false, message: 'You are not allowed to create a new class.' });
  }
});

///// SKILLS /////

apiRoutes.post('/skills', function(req, res) {
  var name = req.query.name;
  var queryParams = [name];

  var query = "INSERT INTO Skills (name) VALUES (?);";
  if(req.decoded.level > 1){ // Only the admin can create a new skill
    connection.query(query, queryParams, function(err){
      if(err){
        res.json({ success: false, message: 'Failed to create a new skill.' });
      }
      else{
        res.json({ success: true, message: 'New skill created.' });
      }
    });
  }
  else{
    res.json({ success: false, message: 'You are not allowed to create a new skill.' });
  }
});

///////////////////////////////////// GET /////////////////////////////////////

///// STUDENTS /////

apiRoutes.get('/users/students', function(req, res) {

  var query = "SELECT email, firstname, lastname, class FROM Users WHERE level = 0;";
  connection.query(query, function (err, data, fields) {
    if (err){
      res.json({ success: false, message: 'No student found.', error: err });
    }
    else{
      if(data.length){
        res.json({ success: true, users: data });
      }
      else{
        res.json({ success: false, message: 'No student found.', users: data });
      }
    }
  });
});

apiRoutes.get('/users/students/:email', function(req, res) {
  var email = req.params.email;
  var queryParams = [email];

  var query = "SELECT email, firstname, lastname, class FROM Users WHERE level = 0 AND email = ?;";
  connection.query(query, queryParams, function (err, data, fields) {
    if (err){
      res.json({ success: false, message: 'Error : Student not found.', error: err });
    }
    else{
      if(data.length){
        res.json({ success: true, user: data });
      }
      else{
        res.json({ success: false, message: 'Student not found.', user: data });
      }
    }
  });
});

apiRoutes.get('/users/students/:email/class', function(req, res) {
  var email = req.params.email;
  var queryParams = [email];

  var query = "SELECT class.name, teacher.email, teacher.firstname, teacher.lastname, COUNT(otherStudents.email) as students FROM Users student LEFT JOIN Classes class ON student.class = class.name LEFT JOIN Users teacher ON class.teacher = teacher.email LEFT JOIN Users otherStudents ON teacher.class = otherStudents.class WHERE student.level = 0 AND otherStudents.level = 0 AND student.email = ?;";
  connection.query(query, queryParams, function (err, data, fields) {
    if (err){
      res.json({ success: false, message: 'Error : Student not found.', error: err });
    }
    else{
      if(data.length){
        res.json({ success: true, class: data });
      }
      else{
        res.json({ success: false, message: 'No class found.', class: data });
      }
    }
  });
});

apiRoutes.get('/users/students/:email/teacher', function(req, res) {
  var email = req.params.email;
  var queryParams = [email];

  var query = "SELECT teacher.email, teacher.firstname, teacher.lastname, teacher.class FROM Users student LEFT JOIN Classes class ON student.class = class.name LEFT JOIN Users teacher ON class.teacher = teacher.email WHERE student.level = 0 AND teacher.level = 1 AND student.email = ?;";
  connection.query(query, queryParams, function (err, data, fields) {
    if (err){
      res.json({ success: false, message: 'Error : Student not found.', error: err });
    }
    else{
      if(data.length){
        res.json({ success: true, user: data });
      }
      else{
        res.json({ success: false, message: 'No teacher found.', user: data });
      }
    }
  });
});

apiRoutes.get('/users/students/:email/skills', function(req, res) {
  var email = req.params.email;
  var queryParams = [email];

  var query = "SELECT skill, mark FROM Attributions WHERE student = ?;";
  connection.query(query, queryParams, function (err, data, fields) {
    if (err){
      res.json({ success: false, message: 'Error. No skill found.', error: err });
    }
    else{
      if(data.length){
        res.json({ success: true, skills: data });
      }
      else{
        res.json({ success: false, message: 'No skill found.', skills: data });
      }
    }
  });
});

///// TEACHERS /////

apiRoutes.get('/users/teachers', function(req, res) {

  var query = "SELECT email, firstname, lastname, class FROM Users WHERE level = 1;";
  connection.query(query, function (err, data, fields) {
    if (err){
      res.json({ success: false, message: 'Error. No teacher found.', error: err });
    }
    else{
      if(data.length){
        res.json({ success: true, users: data });
      }
      else{
        res.json({ success: false, message: 'No teacher found.', users: data });
      }
    }
  });
});

apiRoutes.get('/users/teachers/:email', function(req, res) {
  var email = req.params.email;
  var queryParams = [email];

  var query = "SELECT email, firstname, lastname, class FROM Users WHERE level = 1 AND email = ?;";
  connection.query(query, queryParams, function (err, data, fields) {
    if (err){
      res.json({ success: false, message: 'Error. Teacher not found.', error: err });
    }
    else{
      if(data.length){
        res.json({ success: true, user: data });
      }
      else{
        res.json({ success: false, message: 'Teacher not found.', user: data });
      }
    }
  });
});

apiRoutes.get('/users/teachers/:email/class', function(req, res) {
  var email = req.params.email;
  var queryParams = [email];

  var query = "SELECT class.name, teacher.email, teacher.firstname, teacher.lastname, COUNT(nbStudents.email) as students FROM Users teacher LEFT JOIN Classes class ON teacher.class = class.name LEFT JOIN Users nbStudents ON class.name = nbStudents.class WHERE teacher.level = 1 AND nbStudents.level = 0 AND teacher.email = ?;";
  connection.query(query, queryParams, function (err, data, fields) {
    if (err){
      res.json({ success: false, message: 'Error : Teacher not found.', error: err });
    }
    else{
      if(data.length){
        res.json({ success: true, class: data });
      }
      else{
        res.json({ success: false, message: 'No class found.', class: data });
      }
    }
  });
});

apiRoutes.get('/users/teachers/:email/students', function(req, res) {
  var email = req.params.email;
  var queryParams = [email];

  var query = "SELECT student.email, student.firstname, student.lastname, student.class FROM Users teacher LEFT JOIN Classes class ON teacher.class = class.name LEFT JOIN Users student ON class.name = student.class WHERE teacher.level = 1 AND student.level = 0 AND teacher.email = ?;";
  connection.query(query, queryParams, function (err, data, fields) {
    if (err){
      res.json({ success: false, message: 'Error. No student found.', error: err });
    }
    else{
      if(data.length){
        res.json({ success: true, users: data });
      }
      else{
        res.json({ success: false, message: 'No student found.', users: data });
      }
    }
  });
});

///// CLASSES /////

apiRoutes.get('/classes', function(req, res) {

  var query = "SELECT class.name, teacher.email, teacher.firstname, teacher.lastname, COUNT(nbStudents.email) as students FROM Classes class LEFT JOIN Users teacher ON class.teacher = teacher.email LEFT JOIN Users nbStudents ON class.name = nbStudents.class WHERE teacher.level = 1 AND nbStudents.level = 0 GROUP BY class.name;";
  connection.query(query, function (err, data, fields) {
    if (err){
      res.json({ success: false, message: 'Error. No class found.', error: err });
    }
    else{
      if(data.length){
        res.json({ success: true, classes: data });
      }
      else{
        res.json({ success: false, message: 'No class found.', classes: data });
      }
    }
  });
});

apiRoutes.get('/classes/:name', function(req, res) {
  var name = req.params.name;
  var queryParams = [name];

  var query = "SELECT class.name, teacher.email, teacher.firstname, teacher.lastname, COUNT(nbStudents.email) as students FROM Classes class LEFT JOIN Users teacher ON class.teacher = teacher.email LEFT JOIN Users nbStudents ON class.name = nbStudents.class WHERE teacher.level = 1 AND nbStudents.level = 0 AND class.name = ?;";
  connection.query(query, queryParams, function (err, data, fields) {
    if (err){
      res.json({ success: false, message: 'Error. Class not found.', error: err });
    }
    else{
      if(data.length){
        res.json({ success: true, class: data });
      }
      else{
        res.json({ success: false, message: 'Class not found.', class: data });
      }
    }
  });
});

apiRoutes.get('/classes/:name/students', function(req, res) {
  var name = req.params.name;
  var queryParams = [name];

  var query = "SELECT email, firstname, lastname, class FROM Users WHERE level = 0 AND class = ?;";
  connection.query(query, queryParams, function (err, data, fields) {
    if (err){
      res.json({ success: false, message: 'Error. Class not found.', error: err });
    }
    else{
      if(data.length){
        res.json({ success: true, users: data });
      }
      else{
        res.json({ success: false, message: 'No student found.', users: data });
      }
    }
  });
});

///// SKILLS /////

apiRoutes.get('/skills', function(req, res) {

  var query = "SELECT name FROM Skills;";
  connection.query(query, function (err, data, fields) {
    if (err){
      res.json({ success: false, message: 'Error. No skill found.', error: err });
    }
    else{
      res.json({ success: true, skills: data });
    }
  });
});

///////////////////////////////////// PUT /////////////////////////////////////

///// USERS (STUDENTS & TEACHERS) /////

apiRoutes.put('/users/:email', function(req, res) {
  var email = req.params.email;
  var level = req.query.level;
  var class_ = req.query.class;

  if(level){
    var queryParams = [level, email];
    var query = "UPDATE Users SET level = ? WHERE email = ?;";
  }
  else{
    var queryParams = [class_, email];
    var query = "UPDATE Users SET class = ? WHERE email = ?;";
  }

  if(req.decoded.level > 1){ // Only the admin can modify an user
    connection.query(query, queryParams, function (err, data, fields) {
      if (err){
        res.json({ success: false, message: 'Error. User not found.', error: err });
      }
      else{
        res.json({ success: true, message: 'User updated.' });
      }
    });
  }
  else{
    res.json({ success: false, message: 'You are not allowed to modify this user.' });
  }
});

///// STUDENTS /////

apiRoutes.put('/users/students/:email/skills/:name', function(req, res) {
  var email = req.params.email;
  var name = req.params.name;
  var mark = req.query.mark;
  var queryParams = [mark, email, name];

  var query = "UPDATE Attributions SET mark = ? WHERE student = ? AND skill = ?;";
  if(req.decoded.level > 0){ // A student can't modify the mark of a student
    connection.query(query, queryParams, function (err, data, fields) {
      if (err){
        res.json({ success: false, message: 'Error. User not found.', error: err });
      }
      else{
        res.json({ success: true, message: 'Mark updated.' });
      }
    });
  }
  else{
    res.json({ success: false, message: 'You are not allowed to modify this mark.' });
  }
});

///// CLASSES /////

apiRoutes.put('/classes/:name', function(req, res) {
  var name = req.params.name;
  var teacher = req.query.teacher;
  var queryParams = [teacher, name];

  var query = "UPDATE Classes SET teacher = ? WHERE name = ?;";
  if(req.decoded.level > 1){ // Only the admin can modify a class
    connection.query(query, queryParams, function(err, data, fields){
      if(err){
        res.json({ success: false, message: 'Error. Class not found.', error: err });
      }
      else{
        res.json({ success: true, message: 'Class updated.' });
      }
    });
  }
  else{
    res.json({ success: false, message: 'You are not allowed to modify this class.' });
  }
});

//////////////////////////////////// DELETE ////////////////////////////////////

///// USERS (STUDENTS & TEACHERS) /////

apiRoutes.delete('/users/:email', function(req, res) {
  var email = req.params.email;
  var queryParams = [email];

  var query = "DELETE FROM Users WHERE email = ?;";
  if(req.decoded.level > 1){ // Only the admin can delete an user
    connection.query(query, queryParams, function(err, data, fields){
      if(err){
        res.json({ success: false, message: 'Error. User not found.', error: err });
      }
      else{
        res.json({ success: true, message: 'User deleted.' });
      }
    });
  }
  else{
    res.json({ success: false, message: 'You are not allowed to delete this user.' });
  }
});

///// STUDENTS /////

apiRoutes.delete('/users/students/:email/skills/:name', function(req, res) {
  var email = req.params.email;
  var name = req.params.name;
  var queryParams = [email, name];

  var query = "DELETE FROM Attributions WHERE student = ? AND skill = ?;";
  if(req.decoded.level > 0){ // A student can't delete a mark
    connection.query(query, queryParams, function(err, data, fields){
      if(err){
        res.json({ success: false, message: 'Error. User not found.', error: err });
      }
      else{
        res.json({ success: true, message: 'Mark deleted.' });
      }
    });
  }
  else{
    res.json({ success: false, message: 'You are not allowed to delete this mark.' });
  }
});

///// CLASSES /////

apiRoutes.delete('/classes/:name', function(req, res) {
  var name = req.params.name;
  var queryParams = [name];

  var query = "DELETE FROM Classes WHERE name = ?;";
  if(req.decoded.level > 1){ // Only the admin can delete a class
    connection.query(query, queryParams, function(err, data, fields){
      if(err){
        res.json({ success: false, message: 'Error. Class not found.', error: err });
      }
      else{
        res.json({ success: true, message: 'Class deleted.' });
      }
    });
  }
  else{
    res.json({ success: false, message: 'You are not allowed to delete this class.' });
  }
});

///// SKILLS /////

apiRoutes.delete('/skills/:name', function(req, res) {
  var name = req.params.name;
  var queryParams = [name];

  var query = "DELETE FROM Skills WHERE name = ?;";
  if(req.decoded.level > 1){ // Only the admin can delete a skill
    connection.query(query, queryParams, function(err, data, fields){
      if(err){
        res.json({ success: false, message: 'Error. Skill not found.', error: err });
      }
      else{
        res.json({ success: true, message: 'Skill deleted.' });
      }
    });
  }
  else{
    res.json({ success: false, message: 'You are not allowed to delete this skill.' });
  }
});

// apply the routes to our application with the prefix /api
app.use('/api', apiRoutes);

// =======================
// start the server ======
// =======================
app.listen(port);
console.log('Magic happens at http://localhost:' + port);
