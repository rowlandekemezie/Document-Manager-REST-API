var db = require('./../config/database');
var models = require('./../models');
var config = require('./../config/pass');
var jwt = require('jsonwebtoken');

// instantiate
var User = models.User;
var Role = models.Role;
var Document = models.Document;


module.exports = {

 // Authentication middleware to protect routes
 Auth: function(req, res, next) {
  var token = req.body.token || req.query.token || req.headers['x-access-token'];
  if (!token) {
   res.status(403).send({
    sucsess: false,
    message: "please provide your token"
   });
   return;
  } else {
   jwt.verify(token, config.secret, function(err, decoded) {
    if (err) {
     res.status(401).json({
      success: false,
      message: "Authentication failed"
     });
    } else {
     req.decoded = decoded;
     next();
    }
   });
  }
 },

 // for user logOut
 logOut: function(req, res) {
  req.session.destroy(function(err) {
   if (err) {
    res.send(err);
   } else {
    res.json({
     success: true,
     message: "You are logged out"
    });
   }
  });
 },

 // user sign in method
 signIn: function(req, res) {
  User.findOne({
   userName: req.body.userName
  }, function(err, user) {
   if (err) {
    throw err;
   }
   if (!user) {
    res.status(401).send({
     success: false,
     message: "Invalid user"
    });
   } else if (user) {
    if (req.body.password !== user.password) {
     res.json({
      success: false,
      message: 'Invalid password'
     });
    } else {
     var token = jwt.sign(user, config.secret, {
      expiresInMinutes: 1440 // expires in 24 hrs
     });
     res.json({
      token: token,
      success: true,
      message: "Login successful"
     });
    }
   }
  });
 },
 // create User method
 createUser: function(req, res) {
  if (!req.body.role) {
   res.status(401).json({
    success: false,
    message: 'please, provide your role'
   });
  } else {
   Role.findOne({
    title: req.body.role
   }, function(role) {
    console.log(role);
    if (!role) {
     res.status(401).json({
      success: false,
      message: 'Invalid role'
     });
     return;
    } else {
     User.findOne({
      userName: req.body.userName
     }, function(err, user) {
      if (err) {
       res.send(err);

      } else if (user) {
       res.status(401).send({
        sucess: false,
        message: 'userName already exists'
       });


      } else if (!user) {
       if (!req.body.firstName && !req.body.lastName) {
        res.status(401).send({
         success: false,
         message: 'please provide your firstName and lastName'
        });

       } else if (req.body.password.length < 8 || undefined) {
        res.status(403).send({
         success: false,
         message: 'password must not be less than 8 characters'
        });


       } else if (!req.body.email) {
        res.status(403).send({
         success: false,
         message: 'please enter your email'
        });
       }

      } else {
       var newUser = new User(req.body);
       newUser.save(function(err) {
        if (err) {
         res.send(err);
        } else {
         res.status(200).json({
          success: true,
          message: 'created successfully'
         });
        }
       });
      }
     });
    }
   } );
  }
 },

 getAllUsers: function(req, res) {
  User.find({}, function(err, users) {
   if (err) {
    res.send(err);
   } else if (!users) {
    res.status(404).send({
     success: false,
     message: 'No user found'
    });
   } else {
    res.json(users);
   }
  });
 },

 getUser: function(req, res) {
  User.findById(req.params.id, function(err, user) {
   if (err) {
    res.send(err);
   } else if (!user) {
    res.status(404).send({
     success: false,
     message: 'No user found by that Id'
    });
   } else {
    res.json(user);
   }
  });
 },

 updateUser: function(req, res) {
  User.findByIdAndUpdate(req.params.id, req.body, function(err, user) {
   if (err) {
    res.send(err);
   } else {
    res.json({
     success: true,
     message: 'User details updated'
    });
   }
  });
 },

 deleteUser: function(req, res) {
  User.findByIdAndRemove(req.params.id, function(err) {
   if (err) {
    res.send(err);
   } else {
    res.json({
     success: true,
     message: 'User deleted successfully'
    });
   }
  });
 }
};
