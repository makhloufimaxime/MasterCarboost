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

// get an instance of the router for api routes
var apiRoutes = express.Router();

// route to sign up as a new user (POST http://localhost:8080/api/signup)
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
      var payload = {"email":email,"firstname":firstname,"lastname":lastname,"level":0};
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

// route to authenticate a user (POST http://localhost:8080/api/login)
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
          var payload = {"email":data[0].email,"firstname":data[0].firstname,"lastname":data[0].lastname,"level":data[0].level};
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

apiRoutes.get('/checkToken/:token', function(req, res) {
  var token = req.params.token
  if (token) {
    // verifies secret and checks exp
    jwt.verify(token, app.get('superSecret'), function(err, decoded) {
      if (err) {
        return res.json({ success: false, message: 'Failed to authenticate token.' });
      } else {
        return res.json({ success: true, message: 'This token is valid.' });
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


// TODO: route middleware to verify a token
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


//////////////////////////////// USERS ////////////////////////////////

// Returns the students' list
// user_email, user_firstname, user_lastname, class_id, class_name
apiRoutes.get('/users/students', function(req, res) {
  var query = "SELECT email, firstname, lastname, id, name FROM Users, Classes WHERE level = 0 AND Users.class = Classes.id";
  connection.query(query, function (err, data, fields) {
    if (err){
      res.json({ success: false, message: 'No student found.' });
    }
    else{
      if(data.length){
        res.json({ success: true, users: data });
      }
      else{
        res.json({ success: false, message: 'No student found.' });
      }
    }
  });
});

// Returns the teachers' list
// user_email, user_firstname, user_lastname, class_id, class_name
apiRoutes.get('/users/teachers', function(req, res) {
  var query = "SELECT email, firstname, lastname, id, name FROM Users, Classes WHERE level = 1 AND Users.email = Classes.teacher";
  connection.query(query, function (err, data, fields) {
    if (err){
      res.json({ success: false, message: 'No teacher found.' });
    }
    else{
      if(data.length){
        res.json({ success: true, users: data });
      }
      else{
        res.json({ success: false, message: 'No teacher found.' });
      }
    }
  });
});

// Returns a student
// user_email, user_firstname, user_lastname, class_id, class_name
apiRoutes.get('/users/students/:email', function(req, res) {
  var email = req.params.email;

  var query = "SELECT email, firstname, lastname, id, name FROM Users, Classes WHERE level = 0 AND Users.class = Classes.id AND Users.email = ?";
  var queryParams = [email];
  connection.query(query, queryParams, function (err, data, fields) {
    if (err){
      res.json({ success: false, message: 'Student not found.' });
    }
    else{
      if(data.length){
        res.json({ success: true, user: data });
      }
      else{
        res.json({ success: false, message: 'Student not found.' });
      }
    }
  });
});

// Returns the skills of a student
// attribution_id, skill_name, attribution_mark
apiRoutes.get('/users/students/:email/skills', function(req, res) {
  var email = req.params.email;

  var query = "SELECT Attributions.id, Skills.name, Attributions.mark FROM Skills, Attributions, Users WHERE Skills.id = Attributions.skill AND Users.email = Attributions.student AND email = ?";
  var queryParams = [email];
  connection.query(query, queryParams, function (err, data, fields) {
    if (err){
      res.json({ success: false, message: 'No skill found.' });
    }
    else{
      if(data.length){
        res.json({ success: true, skills: data });
      }
      else{
        res.json({ success: false, message: 'No skill found.' });
      }
    }
  });
});

// Returns a teacher
// user_email, user_firstname, user_lastname, class_id, class_name
apiRoutes.get('/users/teachers/:email', function(req, res) {
  var email = req.params.email;

  var query = "SELECT email, firstname, lastname, id, name FROM Users, Classes WHERE level = 1 AND Users.email = Classes.teacher AND Users.email = ?";
  var queryParams = [email];
  connection.query(query, queryParams, function (err, data, fields) {
    if (err){
      res.json({ success: false, message: 'Teacher not found.' });
    }
    else{
      if(data.length){
        res.json({ success: true, user: data });
      }
      else{
        res.json({ success: false, message: 'Teacher not found.' });
      }
    }
  });
});

// Returns the students of a teacher
// class_id, class_name, teacher_email, teacher_firstname, teacher_lastname, count(students)
apiRoutes.get('/users/teachers/:email/students', function(req, res) {
  var email = req.params.email;

  var query = "SELECT email, firstname, lastname, id, name FROM Users, Classes WHERE class = id AND teacher = ?";
  var queryParams = [email];
  connection.query(query, queryParams, function (err, data, fields) {
    if (err){
      res.json({ success: false, message: 'No student found.' });
    }
    else{
      if(data.length){
        res.json({ success: true, users: data });
      }
      else{
        res.json({ success: false, message: 'No student found.' });
      }
    }
  });
});

apiRoutes.put('/users/:email', function(req, res) {
  var email = req.params.email;
  var level = req.query.level;

  // We first check if the user exists
  var queryParams = [email];
  var query = "SELECT * FROM Users WHERE email = ?";
  connection.query(query, queryParams, function(err, data, fields){
    if(err){
      res.json({ success: false, message: 'Error. User not found.' });
    }
    else{
      if(data == ""){
        // if skill is not found
        res.json({ success: false, message: 'User not found.' });
      }
      else{
        if (req.decoded.level > 1) { // Only the admin can modify the level of an user
          queryParams = [level, email];
          var query = "UPDATE Users SET level = ? WHERE email = ?";
          connection.query(query, queryParams, function (err, data, fields) {
            if (err){
              res.json({ success: false, message: 'Failed to modify this user\'s level.' });
            }
            else{
              res.json({ success: true, message: 'User successfully updated.' });
            }
          });
        }
        else{
          res.json({ success: false, message: 'You are not allowed to modify this user.' });
        }
      }
    }
  });
});

//////////////////////////////// CLASSES ////////////////////////////////

// Returns the classes' list
// class_id, class_name, teacher_email, teacher_firstname, teacher_lastname, count(students)
apiRoutes.get('/classes', function(req, res) {
  var query = "SELECT a.id, a.name, a.teacher, b.firstname, b.lastname, count(c.email) as students FROM Classes a, Users b, Users c WHERE a.teacher = b.email AND c.class = a.id GROUP BY a.id";
  connection.query(query, function (err, data, fields) {
    if (err){
      res.json({ success: false, message: 'No class found.' });
    }
    else{
      if(data.length){
        res.json({ success: true, classes: data });
      }
      else{
        res.json({ success: false, message: 'No class found.' });
      }
    }
  });
});

// Returns a class
// class_id, class_name, teacher_email, teacher_firstname, teacher_lastname, count(students)
apiRoutes.get('/classes/:id', function(req, res) {
  var id = req.params.id;

  var query = "SELECT a.id, a.name, a.teacher, b.firstname, b.lastname, count(c.email) as students FROM Classes a, Users b, Users c WHERE a.teacher = b.email AND c.class = a.id AND a.id = ?";
  var queryParams = [id];
  connection.query(query, queryParams, function (err, data, fields) {
    if (err){
      res.json({ success: false, message: 'Class not found.' });
    }
    else{
      if(data.length){
        res.json({ success: true, class: data });
      }
      else{
        res.json({ success: false, message: 'Class not found.' });
      }
    }
  });
});

// Returns the students of a class
// class_id, class_name, teacher_email, teacher_firstname, teacher_lastname, count(students)
apiRoutes.get('/classes/:id/students', function(req, res) {
  var id = req.params.id;

  var query = "SELECT email, firstname, lastname, id, name FROM Users, Classes WHERE class = id AND class = ?";
  var queryParams = [id];
  connection.query(query, queryParams, function (err, data, fields) {
    if (err){
      res.json({ success: false, message: 'No student found.' });
    }
    else{
      if(data.length){
        res.json({ success: true, users: data });
      }
      else{
        res.json({ success: false, message: 'No student found.' });
      }
    }
  });
});

//////////////////////////////// SKILLS ////////////////////////////////

// Returns the skills' list
// skill_id, skill_name
apiRoutes.get('/skills', function(req, res) {
  var query = "SELECT * FROM Skills";
  connection.query(query, function (err, data, fields) {
    if (err){
      res.json({ success: false, message: 'No skill found.' });
    }
    else{
      res.json({ success: true, skills: data });
    }
  });
});

// apply the routes to our application with the prefix /api
app.use('/api', apiRoutes);

// =======================
// start the server ======
// =======================
app.listen(port);
console.log('Magic happens at http://localhost:' + port);
