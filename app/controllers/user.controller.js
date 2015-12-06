var models = require('./../models');
var config = require('./../config/pass');
var jwt = require('jsonwebtoken');

/**
 * Models instancies
 * @type {[Objects]}
 */
var User = models.User;
var Role = models.Role;
var Document = models.Document;

module.exports = {

  /**
   * [Authenthication middleware to protect certain routes]
   * @param {[http request]}   req  [description]
   * @param {[http response]}   res  [description]
   * @param {Function} next [description]
   */
  Auth: function(req, res, next) {
    var token = req.body.token || req.query.token || req.headers['x-access-token'];
    if (!token) {
      res.status(403).send({
        sucsess: false,
        message: "Please provide your token"
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

  /**
   * [logOut method]
   * @param  {[type]} req [description]
   * @param  {[type]} res [description]
   * @return {[type]}     [description]
   */
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

  /**
   * [signIn method]
   * @param  {[type]} req [description]
   * @param  {[type]} res [description]
   * @return {[type]}     [description]
   */
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
        var isValid = user.comparePassword(req.body.password);
        if (!isValid) {
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

  /**
   * [createUser method]
   * @param  {[type]} req [description]
   * @param  {[type]} res [description]
   * @return {[type]}     [description]
   */
  createUser: function(req, res) {
    var userData = req.body;
    console.log(userData.role);
    if (!userData.role) {
      res.status(401).json({
        success: false,
        message: 'Please, provide your role'
      });
    } else if (!(userData.firstName && userData.lastName)) {
      res.status(401).json({
        success: false,
        message: 'Please, provide your firstName and lastName'
      });
    } else if ((userData.password).length < 8 || undefined) {
      res.status(403).send({
        success: false,
        message: 'Password must not be less than 8 characters'
      });
    } else if (!userData.email || !userData.userName) {
      res.status(403).send({
        success: false,
        message: 'Please enter your userName and email'
      });
    } else {
      Role.findOne({
        title: userData.role
      }, function(err, roles) {
        if (!roles) {
          res.status(401).send({
            success: false,
            message: 'Invalid role'
          });
        } else {
          User.findOne({
            userName: userData.userName
          }, function(err, users) {
            if (users) {
              res.status(401).send({
                success: false,
                message: 'UserName already exists'
              });
            } else {
              var newUser = new User(userData);
              newUser.save(function(err) {
                if (err) {
                  res.send(err);
                } else {
                  res.status(200).json({
                    success: true,
                    message: 'User created successfully'
                  });
                }
              });
            }
          });
        }
      });
    }
  },

  /**
   * [getAllUsers method]
   * @param  {[type]} req [description]
   * @param  {[type]} res [description]
   * @return {[type]}     [description]
   */
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

  /**
   * [getUser method]
   * @param  {[type]} req [description]
   * @param  {[type]} res [description]
   * @return {[type]}     [description]
   */
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

  /**
   * [updateUser method]
   * @param  {[type]} req [description]
   * @param  {[type]} res [description]
   * @return {[type]}     [description]
   */
  updateUser: function(req, res) {

    User.findByIdAndUpdate(req.params.id, req.body, function(err, user) {
      if (err) {
        res.send(err);
      } else if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not available'
        });
      } else {
        res.json({
          success: true,
          message: 'User details updated'
        });
      }
    });
  },

  /**
   * [deleteUser method]
   * @param  {[type]} req [description]
   * @param  {[type]} res [description]
   * @return {[type]}     [description]
   */
  deleteUser: function(req, res) {

    User.findByIdAndRemove(req.params.id, function(err, user) {
      if (err) {
        res.send(err);
      } else if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not available'
        });
      } else {
        res.status(200).json({
          success: true,
          message: 'User deleted successfully'
        });
      }
    });
  },
};