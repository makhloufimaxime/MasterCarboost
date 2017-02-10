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
            expiresIn: "2 days" // expires in 48 hours
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

// route to create a new user (POST http://localhost:8080/api/users/)
apiRoutes.post('/users', function(req, res) {
  var email = req.query.email;
  var password = req.query.password;
  var firstname = req.query.firstname;
  var lastname = req.query.lastname;
  var level = req.query.level;

  var queryParams = [email, password, firstname, lastname, level];

  var query = "INSERT INTO Users (email, password, firstname, lastname, level) VALUES (?, ?, ?, ?, ?)";
  if(req.decoded.level > 1){ // Only the admin can create a new user
    connection.query(query, queryParams, function(err){
      if(err){
        res.json({ success: false, message: 'Failed to create a new user.' });
      }
      else{
        res.json({ success: true, message: 'New user successfully created.' });
      }
    });
  }
  else{
    res.json({ success: false, message: 'You are not allowed to create a new user.' });
  }
});

// route to return all users (GET http://localhost:8080/api/users)
apiRoutes.get('/users', function(req, res) {
  var query = "SELECT email, firstname, lastname FROM users";
  connection.query(query, function (err, data, fields) {
    if (err){
      res.json({ success: false, message: 'No user found.' });
    }
    else{
      res.json(data);
    }
  });
});

// route to return an user (GET http://localhost:8080/api/users/:email)
apiRoutes.get('/users/:email', function(req, res) {
  var email = req.params.email;

  var query = "SELECT email, firstname, lastname FROM users WHERE email = ?";
  var queryParams = [email];
  connection.query(query, queryParams, function (err, data, fields) {
    if (err){
      res.json({ success: false, message: 'User not found.' });
    }
    else{
      res.json(data);
    }
  });
});

// route to update an user (PUT http://localhost:8080/api/users/:email)
apiRoutes.put('/users/:email', function(req, res) {
  var email = req.params.email;
  var password = req.query.password;
  var class_ = req.query.class;
  var level = req.query.level;
  if(level > 1) {
    level = 1;
  }
  else if (level < 0) {
    level = 0;
  }

  // We first check if the user exists
  var queryParams = [email];

  var query = "SELECT * FROM Users WHERE email = ?";
  connection.query(query, queryParams, function(err, data, fields){
    if(err){
      res.json({ success: false, message: 'Error. User not found.' });
    }
    else{
      if(data == ""){
        // if user is not found
        res.json({ success: false, message: 'User not found.' });
      }
      else{
        if (email == req.decoded.email) { // user is modifying his own account - He can only modify his password
          queryParams = [password, email];
          var query = "UPDATE Users SET password = ? WHERE email = ?";
        }
        else if (req.decoded.level > 1) { // admin is modifying the level of another user
          queryParams = [level, email];
          var query = "UPDATE Users SET level = ? WHERE email = ?";
        }
        else if (req.decoded.level > 0 && data[0].level == 0){ // teacher is modifying the class of a student
          queryParams = [class_, email];
          var query = "UPDATE Users SET class = ? WHERE email = ?";
        }
        else{
          res.json({ success: false, message: 'You are not allowed to modify this user.' });
        }

        connection.query(query, queryParams, function (err, data, fields) {
          if (err){
            res.json({ success: false, message: 'Failed to modify this user\'s information.' });
          }
          else{
            res.json({ success: true, message: 'User\'s information successfully updated.' });
          }
        });
      }
    }
  });
});

// route to delete an user (DELETE http://localhost:8080/api/users/:email)
apiRoutes.delete('/users/:email', function(req, res) {
  var email = req.params.email;

  // We first check if the user exists
  var queryParams = [email];

  var query = "SELECT * FROM Users WHERE email = ?";
  connection.query(query, queryParams, function(err, data, fields){
    if(err){
      res.json({ success: false, message: 'Error. User not found.' });
    }
    else{
      if(data == ""){
        // if user is not found
        res.json({ success: false, message: 'User not found.' });
      }
      else{
        if (req.decoded.level > 1 && email != req.decoded.email) { // only the admin can delete an account (and he can't delete his own account)
        var query = "DELETE FROM Users WHERE email = ?";
        connection.query(query, queryParams, function (err, data, fields) {
          if (err){
            res.json({ success: false, message: 'Failed to delete this user.' });
          }
          else{
            res.json({ success: true, message: 'User successfully deleted.' });
          }
        });
      }
      else{
        res.json({ success: false, message: 'You are not allowed to delete this user.' });
      }
    }
  }
});
});

//////////////////////////////// CLASSES ////////////////////////////////

// route to create a new class (POST http://localhost:8080/api/classes/)
apiRoutes.post('/classes', function(req, res) {
  var name = req.query.name;
  var teacher = req.query.teacher;

  var queryParams = [name, teacher];

  var query = "INSERT INTO Classes (name, teacher) VALUES (?, ?)";
  if(req.decoded.level > 1){ // Only the admin can create a new class
    connection.query(query, queryParams, function(err){
      if(err){
        res.json({ success: false, message: 'Failed to create a new class.' });
      }
      else{
        res.json({ success: true, message: 'New class successfully created.' });
      }
    });
  }
  else{
    res.json({ success: false, message: 'You are not allowed to create a new class.' });
  }
});

// route to return all classes (GET http://localhost:8080/api/classes)
apiRoutes.get('/classes', function(req, res) {
  var query = "SELECT * FROM Classes";
  connection.query(query, function (err, data, fields) {
    if (err){
      res.json({ success: false, message: 'No class found.' });
    }
    else{
      res.json(data);
    }
  });
});

// route to return a class (GET http://localhost:8080/api/classes/:id)
apiRoutes.get('/classes/:id', function(req, res) {
  var id = req.params.id;

  var query = "SELECT * FROM Classes WHERE id = ?";
  var queryParams = [id];
  connection.query(query, queryParams, function (err, data, fields) {
    if (err){
      res.json({ success: false, message: 'Class not found.' });
    }
    else{
      res.json(data);
    }
  });
});

// route to update a class (PUT http://localhost:8080/api/classes/:id)
apiRoutes.put('/classes/:id', function(req, res) {
  var id = req.params.id;
  var teacher = req.query.teacher;

  // We first check if the class exists
  var queryParams = [id];

  var query = "SELECT * FROM Classes WHERE id = ?";
  connection.query(query, queryParams, function(err, data, fields){
    if(err){
      res.json({ success: false, message: 'Error. Class not found.' });
    }
    else{
      if(data == ""){
        // if class is not found
        res.json({ success: false, message: 'Class not found.' });
      }
      else{
        if (req.decoded.level > 1) { // Only the admin can modify a class
          queryParams = [teacher, id];
          var query = "UPDATE Classes SET teacher = ? WHERE id = ?";
        }
        else{
          res.json({ success: false, message: 'You are not allowed to modify this class.' });
        }

        connection.query(query, queryParams, function (err, data, fields) {
          if (err){
            res.json({ success: false, message: 'Failed to modify this class\'s teacher.' });
          }
          else{
            res.json({ success: true, message: 'Class successfully updated.' });
          }
        });
      }
    }
  });
});

// route to delete a class (DELETE http://localhost:8080/api/classes/:id)
apiRoutes.delete('/classes/:id', function(req, res) {
  var id = req.params.id;

  // We first check if the user exists
  var queryParams = [id];

  var query = "SELECT * FROM Classes WHERE id = ?";
  connection.query(query, queryParams, function(err, data, fields){
    if(err){
      res.json({ success: false, message: 'Error. Class not found.' });
    }
    else{
      if(data == ""){
        // if user is not found
        res.json({ success: false, message: 'Class not found.' });
      }
      else{
        if (req.decoded.level > 1) { // only the admin can delete a class
          var query = "DELETE FROM Classes WHERE id = ?";
          connection.query(query, queryParams, function (err, data, fields) {
            if (err){
              res.json({ success: false, message: 'Failed to delete this class.' });
            }
            else{
              res.json({ success: false, message: 'Class successfully deleted.' });
            }
          });
        }
        else{
          res.json({ success: false, message: 'You are not allowed to delete this class.' });
        }
      }
    }
  });
});

//////////////////////////////// SKILLS ////////////////////////////////

// route to create a new skill (POST http://localhost:8080/api/classes/)
apiRoutes.post('/skills', function(req, res) {
  var name = req.query.name;

  var queryParams = [name];

  var query = "INSERT INTO Classes (name) VALUES (?, ?)";
  if(req.decoded.level > 1){ // Only the admin can create a new skill
    connection.query(query, queryParams, function(err){
      if(err){
        res.json({ success: false, message: 'Failed to create a new skill.' });
      }
      else{
        res.json({ success: true, message: 'New skill successfully created.' });
      }
    });
  }
  else{
    res.json({ success: false, message: 'You are not allowed to create a new skill.' });
  }
});

// route to return all skills (GET http://localhost:8080/api/skills)
apiRoutes.get('/skills', function(req, res) {
  var query = "SELECT * FROM Skills";
  connection.query(query, function (err, data, fields) {
    if (err){
      res.json({ success: false, message: 'No skill found.' });
    }
    else{
      res.json(data);
    }
  });
});

// route to return a skill (GET http://localhost:8080/api/skills/:id)
apiRoutes.get('/skills/:id', function(req, res) {
  var id = req.params.id;

  var query = "SELECT * FROM Skills WHERE id = ?";
  var queryParams = [id];
  connection.query(query, queryParams, function (err, data, fields) {
    if (err){
      res.json({ success: false, message: 'Skill not found.' });
    }
    else{
      res.json(data);
    }
  });
});

// route to update a skill (PUT http://localhost:8080/api/skills/:id)
apiRoutes.put('/skills/:id', function(req, res) {
  var id = req.params.id;
  var name = req.query.name;

  // We first check if the skill exists
  var queryParams = [id];

  var query = "SELECT * FROM Skills WHERE id = ?";
  connection.query(query, queryParams, function(err, data, fields){
    if(err){
      res.json({ success: false, message: 'Error. Skill not found.' });
    }
    else{
      if(data == ""){
        // if skill is not found
        res.json({ success: false, message: 'Skill not found.' });
      }
      else{
        if (req.decoded.level > 0) { // Only the teachers or the admin can modify a skill
          queryParams = [name, id];
          var query = "UPDATE Skills SET name = ? WHERE id = ?";
        }
        else{
          res.json({ success: false, message: 'You are not allowed to modify this skill.' });
        }

        connection.query(query, queryParams, function (err, data, fields) {
          if (err){
            res.json({ success: false, message: 'Failed to modify this skill\'s name.' });
          }
          else{
            res.json({ success: true, message: 'Skill successfully updated.' });
          }
        });
      }
    }
  });
});

// route to delete a skill (DELETE http://localhost:8080/api/skills/:id)
apiRoutes.delete('/skills/:id', function(req, res) {
  var id = req.params.id;

  // We first check if the user exists
  var queryParams = [id];

  var query = "SELECT * FROM Skills WHERE id = ?";
  connection.query(query, queryParams, function(err, data, fields){
    if(err){
      res.json({ success: false, message: 'Error. Skill not found.' });
    }
    else{
      if(data == ""){
        // if user is not found
        res.json({ success: false, message: 'Skill not found.' });
      }
      else{
        if (req.decoded.level > 0) { // only the teachers and the admin can delete a skill
          var query = "DELETE FROM Classes WHERE id = ?";
          connection.query(query, queryParams, function (err, data, fields) {
            if (err){
              res.json({ success: false, message: 'Failed to delete this skill.' });
            }
            else{
              res.json({ success: false, message: 'Skill successfully deleted.' });
            }
          });
        }
        else{
          res.json({ success: false, message: 'You are not allowed to delete this skill.' });
        }
      }
    }
  });
});

//////////////////////////////// ATTRIBUTIONS ////////////////////////////////

// route to create a new attribution (POST http://localhost:8080/api/attributions/)
apiRoutes.post('/attributions', function(req, res) {
  var student = req.query.student;
  var skill = req.query.skill;
  var mark = req.query.mark;

  var queryParams = [student, skill, mark];

  var query = "INSERT INTO Attributions (student, skill, mark) VALUES (?, ?, ?)";
  if(req.decoded.level > 0){ // Only the teachers and the admin can create a new attribution
    connection.query(query, queryParams, function(err){
      if(err){
        res.json({ success: false, message: 'Failed to create a new attribution.' });
      }
      else{
        res.json({ success: true, message: 'New attribution successfully created.' });
      }
    });
  }
  else{
    res.json({ success: false, message: 'You are not allowed to create a new attribution.' });
  }
});

// route to return all attributions (GET http://localhost:8080/api/attributions)
apiRoutes.get('/attributions', function(req, res) {
  var query = "SELECT * FROM Attributions";
  connection.query(query, function (err, data, fields) {
    if (err){
      res.json({ success: false, message: 'No attribution found.' });
    }
    else{
      res.json(data);
    }
  });
});

// route to return an attribution (GET http://localhost:8080/api/attributions/:id)
apiRoutes.get('/attributions/:id', function(req, res) {
  var id = req.params.id;

  var query = "SELECT * FROM Attributions WHERE id = ?";
  var queryParams = [id];
  connection.query(query, queryParams, function (err, data, fields) {
    if (err){
      res.json({ success: false, message: 'Attribution not found.' });
    }
    else{
      res.json(data);
    }
  });
});

// route to update an attribution (PUT http://localhost:8080/api/attributions/:id)
apiRoutes.put('/attributions/:id', function(req, res) {
  var id = req.params.id;
  var mark = req.query.mark;

  // We first check if the attribution exists
  var queryParams = [id];

  var query = "SELECT * FROM Attributions WHERE id = ?";
  connection.query(query, queryParams, function(err, data, fields){
    if(err){
      res.json({ success: false, message: 'Error. Attribution not found.' });
    }
    else{
      if(data == ""){
        // if skill is not found
        res.json({ success: false, message: 'Attribution not found.' });
      }
      else{
        if (req.decoded.level > 0) { // Only the teachers or the admin can modify an attribution
          queryParams = [name, id];
          var query = "UPDATE Attributions SET mark = ? WHERE id = ?";
        }
        else{
          res.json({ success: false, message: 'You are not allowed to modify this attribution.' });
        }

        connection.query(query, queryParams, function (err, data, fields) {
          if (err){
            res.json({ success: false, message: 'Failed to modify this attribution\'s mark.' });
          }
          else{
            res.json({ success: true, message: 'Attribution successfully updated.' });
          }
        });
      }
    }
  });
});

// route to delete an attribution (DELETE http://localhost:8080/api/attributions/:id)
apiRoutes.delete('/attributions/:id', function(req, res) {
  var id = req.params.id;

  // We first check if the user exists
  var queryParams = [id];

  var query = "SELECT * FROM Attributions WHERE id = ?";
  connection.query(query, queryParams, function(err, data, fields){
    if(err){
      res.json({ success: false, message: 'Error. Attribution not found.' });
    }
    else{
      if(data == ""){
        // if user is not found
        res.json({ success: false, message: 'Attribution not found.' });
      }
      else{
        if (req.decoded.level > 0) { // only the teachers and the admin can delete an attribution
          var query = "DELETE FROM Attributions WHERE id = ?";
          connection.query(query, queryParams, function (err, data, fields) {
            if (err){
              res.json({ success: false, message: 'Failed to delete this attribution.' });
            }
            else{
              res.json({ success: false, message: 'Attribution successfully deleted.' });
            }
          });
        }
        else{
          res.json({ success: false, message: 'You are not allowed to delete this attribution.' });
        }
      }
    }
  });
});

///////////////// OTHER ROUTES ///////////////////

// route to return the class of an user (GET http://localhost:8080/api/users/:email/class)
apiRoutes.get('/users/:email/class', function(req, res) {
  var email = req.params.email;

  var query = "SELECT * FROM Users WHERE email = ?";
  var queryParams = [email];
  connection.query(query, queryParams, function (err, data, fields) {
    if (err){
        res.json({ success: false, message: 'Error. User not found.' });
    }
    else{
      if(data == ""){
        // if user is not found
        res.json({ success: false, message: 'User not found.' });
      }
      else{
        queryParams = data[0].class;
        query = "SELECT * FROM Classes WHERE id = ?";
        connection.query(query, queryParams, function (err, data, fields) {
          if (err){
            res.json({ success: false, message: 'Class not found.' });
          }
          else{
            res.json(data);
          }
        });
      }
    }
  });
});

// route to return the teacher of a class (GET http://localhost:8080/api/classes/:id/teacher)
apiRoutes.get('/classes/:id/teacher', function(req, res) {
  var id = req.params.id;

  var query = "SELECT * FROM Classes WHERE id = ?";
  var queryParams = [id];
  connection.query(query, queryParams, function (err, data, fields) {
    if (err){
        res.json({ success: false, message: 'Error. Class not found.' });
    }
    else{
      if(data == ""){
        // if user is not found
        res.json({ success: false, message: 'Class not found.' });
      }
      else{
        queryParams = data[0].teacher;
        query = "SELECT email, firstname, lastname FROM Users WHERE email = ?";
        connection.query(query, queryParams, function (err, data, fields) {
          if (err){
            res.json({ success: false, message: 'Teacher not found.' });
          }
          else{
            res.json(data);
          }
        });
      }
    }
  });
});

// route to return the attributions of an user (GET http://localhost:8080/api/users/:email/attributions)
apiRoutes.get('/users/:email/attributions', function(req, res) {
  var email = req.params.email;

  var query = "SELECT * FROM Users WHERE email = ?";
  var queryParams = [email];
  connection.query(query, queryParams, function (err, data, fields) {
    if (err){
        res.json({ success: false, message: 'Error. User not found.' });
    }
    else{
      if(data == ""){
        // if user is not found
        res.json({ success: false, message: 'User not found.' });
      }
      else{
        query = "SELECT * FROM Attributions WHERE student = ?";
        connection.query(query, queryParams, function (err, data, fields) {
          if (err){
            res.json({ success: false, message: 'No attribution found' });
          }
          else{
            res.json(data);
          }
        });
      }
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
