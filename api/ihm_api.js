// =======================
// get the packages we need ============
// =======================
var express     = require('express');
var app         = express();
var bodyParser  = require('body-parser');
var morgan      = require('morgan');
var sqlite3     = require('sqlite3');
var db = new sqlite3.Database('database.db');

var jwt    = require('jsonwebtoken'); // used to create, sign, and verify tokens
var config = require('./config'); // get our config file
// var User   = require('./models/user'); // get our mongoose

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
// mongoose.connect(config.database); // connect to database
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
// we'll get to these in a second
var apiRoutes = express.Router();

apiRoutes.get('/', function(req, res) {
  res.json({ message: 'Welcome to the coolest API on earth! Oh yeah !' });
});

apiRoutes.post('/signin', function(req, res) {
    var email = req.query.email;
    var username = req.query.username;
    var password = req.query.password;

  // find the user from email or username
  if(email){
      var queryParams = [email];
      var query = "SELECT * FROM Users WHERE email = ?";
  }
  else{
      var queryParams = [username];
      var query = "SELECT * FROM Users WHERE username = ?";
  }
  db.get(query, queryParams, function(err, data){
      if(err){
          res.status(500).json(err);
      }
      else{
          if(data == null){
              // if user is not found
              res.json({ success: false, message: 'Authentication failed. User not found.' });
          }
          else{
              if(password != data.password){
                  // if user is found and password is wrong
                  res.json({ success: false, message: 'Authentication failed. Wrong password.' });
              }
              else{
                  // if user is found and password is right
                  // create a token
                  var payload = {"email":data.email,"username":data.username,"seller":data.seller};
                  var token = jwt.sign(payload, app.get('superSecret'), {
                    expiresIn: "2 days" // expires in 24 hours
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

apiRoutes.post('/signup', function(req, res){
    var email = req.query.email;
    var username = req.query.username;
    var password = req.query.password;
    var seller = req.query.seller;

    var queryParams = [email, username, password, seller];

    var query = "INSERT INTO Users (email, username, password, seller) VALUES (?, ?, ?, ?)";
    db.run(query, queryParams, function(err){
        if(err){
             res.json({ success: false, message: 'Failed to create a new account.' });
        }
        else{
            // if user is successfully created
            // create a token
            var payload = {"email":email,"username":username,"seller":seller};
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

// route middleware to verify a token
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

apiRoutes.get('/users', function(req, res) {
    var query = "SELECT email, username, seller FROM Users";
    db.all(query, function(err, data){
        if(err){
            res.json({ success: false, message: 'Failed to retrieve users\' list.' });
        }
        else{
            res.json(data);
        }
    })
});

apiRoutes.get('/user/:emailOrUsername', function(req, res) {
    var emailOrUsername = req.params.emailOrUsername;
    var queryParams = [emailOrUsername, emailOrUsername];

    var query = "SELECT email, username, password, seller FROM Users WHERE email = ? OR username = ?";
    db.get(query, queryParams, function(err, data){
        if(err){
            res.json({ success: false, message: 'This user doesn\'t exist.' });
        }
        else{
            res.json(data);
        }
    })
});

apiRoutes.delete('/user/:emailOrUsername', function(req, res){
    var emailOrUsername = req.params.emailOrUsername;
    var password = req.query.password;

    if(emailOrUsername != req.decoded.email && emailOrUsername != req.decoded.username){
        res.json({ success: false, message: 'You need to be logged on this account to delete it.' });
    }
    else{
        var queryParams = [req.decoded.email, password];
        var query = "DELETE FROM Users WHERE email = ? AND password = ?";
        db.run(query, queryParams, function(err){
            if(err){
                res.json({ success: false, message: 'Failed to delete your account. Error.' });
            }
            else{
                if(this.changes > 0){
                    res.json({ success: true, message: 'Account deleted.' });
                }
                else{
                    res.json({ success: false, message: 'Failed to delete your account. Wrong password or account no longer exists.' });
                }
            }
        })
    }
});

apiRoutes.post('/voucher', function(req, res){
    if(req.decoded.seller == false){
        res.json({ success: false, message: 'You are not allowed to create a voucher.' });
    }
    else{
        var owner = req.decoded.email;
        var title = req.query.title;
        var shop = req.query.shop;
        var expiration = req.query.expiration;
        var value = req.query.value;
        var description = req.query.description;

        if(description){
            var queryParams = [owner, title, shop, expiration, value, description];
            var query = "INSERT INTO Vouchers (ower, title, shop, expiration, value, description) VALUES (?, ?, ?, ?, ?, ?)";
        } else {
            var queryParams = [owner, title, shop, expiration, value];
            var query = "INSERT INTO Vouchers (owner, title, shop, expiration, value) VALUES (?, ?, ?, ?, ?)";
        }

        db.run(query, queryParams, function(err){
            if(err){
                 res.json({ success: false, message: 'Failed to create a new voucher.' });
            }
            else{
                res.json({
                  success: true,
                  message: 'New voucher created.',
                  id: this.lastID
                });
            }
        })
    }
});

apiRoutes.get('/vouchers', function(req, res) {
    var query = "SELECT id, title, shop, expiration, value FROM Vouchers";

    db.all(query, function(err, data){
        if(err){
             res.json({ success: false, message: 'Failed to retrieve vouchers\' list.' });
        }
        else{
            res.json(data);
        }
    })
});

apiRoutes.get('/vouchers/:idOrTitle', function(req, res) {
    var idOrTitle = req.params.idOrTitle;
    var queryParams = [idOrTitle, idOrTitle];
console.log(idOrTitle);
    var query = "SELECT * FROM Vouchers WHERE id = ? OR title = ?";
    db.get(query, queryParams, function(err, data){
        if(err){
             res.json({ success: false, message: 'This voucher doesn\'t exist.' });
        }
        else{
            res.json(data);
        }
    })
});

apiRoutes.delete('/voucher/:idOrTitle', function(req, res){
    var idOrTitle = req.params.idOrTitle;

    var queryParams = [idOrTitle, idOrTitle, req.decoded.email];
    var query = "DELETE FROM Vouchers WHERE id = ? OR title = ? AND owner = ?";
    db.run(query, queryParams, function(err){
        if(err){
            res.json({ success: false, message: 'Failed to delete your voucher. Error.' });
        }
        else{
            if(this.changes > 0){
                res.json({ success: true, message: 'Voucher deleted.' });
            }
            else{
                res.json({ success: false, message: 'Failed to delete this voucher. Either you are not the owner of this voucher or it has already been deleted.' });
            }
        }
    })
});

app.use('/api', apiRoutes);

// =======================
// start the server ======
// =======================
app.listen(port);
console.log('Magic happens at http://localhost:' + port);
