"use strict";
var fs = require('fs');
var mongoose = require('mongoose');
var app = require('./../server');
var request = require('supertest')(app);
var jwt = require('jsonwebtoken');
var config = require('./../config/pass');
var model = require('./../app/models');
var _userseeds = fs.readFileSync(__dirname + '/../seeds/users.json');
var _roleseeds = fs.readFileSync(__dirname + '/../seeds/roles.json');
var User = model.User;
var Role = model.Role;

// parse the data for use in the test
var userData = JSON.parse(_userseeds);
var roleData = JSON.parse(_roleseeds);

describe('to validate users can login and logout', function() {
 beforeEach(function(done) {
  var newRole = new Role(roleData[0]);
  newRole.save();
  var newUser = new User(userData[0]);
  newUser.save();
  done();
 });
 afterEach(function(done) {
  User.remove({}, function() {
   Role.remove({}, function() {
    done();
   });
  });
 });

 it("should login user on /users/login endpoint", function(done) {
  request.post('/api/users/login').send({
   userName: userData[0].userName,
   password: userData[0].password
  }).end(function(err, res) {
   expect(res.body).toEqual(jasmine.objectContaining({
    message: 'Login successful',
    success: true
   }));
   expect(res.body.token).toBeDefined();
   expect(res.statusCode).toBe(200);
   expect(res.body).not.toBeUndefined();
   expect(res.body).not.toBeNull();
   expect(res.badRequest).toBe(false);
   expect(err).toBeNull();
   done();
  });
 });

 it("should not login user with the wrong username", function(done) {
  request.post('/api/users/login').send({
   userName: "Hacker1" || undefined,
   psssword: userData[0].password
  }).end(function(err, res) {
   expect(res.body).toEqual(jasmine.objectContaining({
    success: false,
    message: 'Invalid user'
   }));
   expect(res.unauthorized).toBe(true);
   expect(err).not.toBeUndefined();
   expect(res.status).toBe(401);
   done();
  });
 });

 it("should not login user with the wrong password", function(done) {
  request.post('/api/users/login').send({
   userName: userData[0].userName,
   password: "wrongPassword" || undefined
  }).end(function(err, res) {
   expect(res.body).toEqual(jasmine.objectContaining({
    success: false,
    message: 'Invalid password'
   }));
   expect(res.forbidden).toBe(true);
   expect(err).not.toBeUndefined();
   expect(res.status).toBe(403);
   done();
  });
 });

 it("should logout user", function(done) {
  request.post('/api/users/logout').end(function(err, res) {
   expect(res.body).toEqual(jasmine.objectContaining({
    success: true,
    message: "You are logged out"
   }));
   expect(err).toBeNull();
   done();
  });
 });
});

describe("CREATE USER POST /api/users/", function() {
 beforeEach(function(done) {
  var newRole = new Role(roleData[2]);
  var newUser = new User(userData[2]);
  newUser.save();
  newRole.save();
    done();
  });
 afterEach(function(done) {
  User.remove({}, function() {
   Role.remove({}, function() {
    done();
   });
  });
 });

 it("should create user with the right credentials", function(done) {
  var newUser = {
   userName: "Hannah6999777",
   firstName: "Manugas",
   lastName: "Gafofofrba",
   email: "manugas@gmail.com",
   role: "Librarian",
   password: "awesomecool"
  };
  request.post('/api/users/').send(newUser).expect(200).end(function(err, res) {
   expect(err).toBeNull();
   expect(res.body).toEqual(jasmine.objectContaining({
    success: true,
    message: 'User created successfully'
   }));
   done();
  });
 });

 it("should create unique users", function(done) {
  var newuser = {
   userName: userData[2].userName,
   firstName: "Akodi",
   lastName: "Gattaffer",
   email: "akodigattaffer@gmail.com",
   role: "Librarian",
   password: "awesomecool"
  };
  request.post('/api/users/')
  .send(newuser)
  .expect(401)
  .end(function(err, res) {
   expect(res.body).toEqual(jasmine.objectContaining({
    success: false,
    message: 'UserName already exist'
   }));
   expect(err).not.toBeUndefined();
   expect(err).toBeNull();
   done();
  });
 });

 it("should not create user with role a valid role", function(done) {
  var newuser = {
   userName: "Obama",
   firstName: "Akodi",
   lastName: "Gattaffer",
   email: "akodigattaffer@gmail.com",
   role: "Doesn'tExist",
   password: "awesomecool"
  };
  request.post('/api/users/')
  .send(newuser)
  .expect(401)
  .end(function(err, res) {
   expect(res.body).toEqual(jasmine.objectContaining({
    success: false,
    message: 'Invalid role'
   }));
   expect(err).not.toBeUndefined();
   expect(err).toBeNull();
   done();
  });
 });

 it("should not create user without a role", function(done) {
  var newuser = {
   userName: userData[2].userName,
   firstName: "Akodi",
   lastName: "Gattaffer",
   email: "akodigattaffer@gmail.com",
   role: undefined,
   password: "awesomecool"
  };
  request.post('/api/users/')
  .send(newuser)
  .expect(401)
  .end(function(err, res) {
   expect(res.body).toEqual(jasmine.objectContaining({
    success: false,
    message: 'Please, provide your role'
   }));
   expect(err).not.toBeUndefined();
   expect(err).toBeNull();
   done();
  });
 });

 it("should not create user without firstName and lastName", function(done) {
  var newuser = {
   userName: userData[2].userName,
   firstName: '' || undefined,
   lastName: '' || undefined,
   email: "akodigattaffer@gmail.com",
   role: "Librarian",
   password: "awesomecool"
  };
  request.post('/api/users/')
  .send(newuser)
  .expect(401)
  .end(function(err, res) {
   expect(res.body).toEqual(jasmine.objectContaining({
    success: false,
    message: 'Please, provide your firstName and lastName'
   }));
   expect(err).not.toBeUndefined();
   expect(err).toBeNull();
   done();
  });
 });
});

describe("GET USERS GET /api/users", function() {
 var id, userToken;
 beforeEach(function(done) {
  var newUser = new User(userData[1]);
  var newRole = new Role(roleData[1]);
  newRole.save();
  newUser.save();
  id = newUser._id;
  userToken = jwt.sign(newUser, config.secret, {
   expiresIn: 86400 // expires in 24hrs
  });
  done();
 });
 afterEach(function(done) {
  User.remove({}, function() {
   Role.remove({}, function() {
    done();
   });
  });
 });

 it("should get a specific user by his id", function(done) {
  request.get('/api/users/' + id).set('x-access-token', userToken).expect(200).end(function(err, res) {
   expect(res.body).toEqual(jasmine.objectContaining({
    userName: "Godson",
    name: {
     firstName: "Goddy",
     lastName: "Ukpere"
    },
    role: "Trainer",
    email: "godsonukpere@gmail.com"
   }));
   done();
  });
 });

 it("should return no user with any invalid id", function(done) {
  var invalidId = mongoose.Types.ObjectId('4edd40c86762e0fb12000003');
  request.get('/api/users/' + invalidId).set('x-access-token', userToken).expect(401).end(function(err, res) {
   expect(res.body).toEqual(jasmine.objectContaining({
    success: false,
    message: 'No user found by that Id'
   }));
   done();
  });
 });

 it("should not return a user unless the viewer is authenticated", function(done) {
  request.get('/api/users/' + id)
  .expect(403)
  .end(function(err, res) {
   expect(res.body).toEqual(jasmine.objectContaining({
    success: false,
    message: 'Please provide your token'
   }));
   done();
  });
 });

 it("should return all users created", function(done) {
  var newUser = new User(userData[2]);
  var newRole = new Role(roleData[2]);
  newUser.save();
  newRole.save();
  request.get('/api/users/')
  .set('x-access-token', userToken)
  .expect(200)
  .end(function(err, res) {
   expect(res.body.length).toEqual(2);
   expect(res.body[1]).toEqual(jasmine.objectContaining({
    userName: 'Ify',
    name: {
     firstName: 'Ifeanyi',
     lastName: 'Oraeolosi'
    },
    email: 'ifeanyioraeolosi@gmail.com',
    role: 'Librarian'
   }));
   expect(res.body[0]).toEqual(jasmine.objectContaining({
    userName: 'Godson',
    name: {
     firstName: 'Goddy',
     lastName: 'Ukpere'
    },
    email: 'godsonukpere@gmail.com',
    role: 'Trainer'
   }));
   done();
  });
 });
});

describe("UPDATE USER PUT /api/users/", function() {
 var id, userToken;
 beforeEach(function(done) {
  var newRole = new Role(roleData[0]);
  var newUser = new User(userData[0]);
  newUser.save();
  newRole.save();
  id = newUser._id;
  userToken = jwt.sign(newUser, config.secret, {
   expiresIn: 86400 // expires in 24hrs
  });
  done();
 });
 afterEach(function(done) {
  User.remove({}, function() {
   Role.remove({}, function() {
    done();
   });
  });
 });

 it("should update a specific user with a valid id", function(done) {
  request.put('/api/users/' + id)
  .set('x-access-token', userToken)
  .send({
   userName: 'Haski',
   name: {
    firstName: 'Lamboni',
    lastName: 'Ruskima',
   },
   email: 'lamboniruskina@gmail.com',
   password: 'PythonPhpJavascript',
   role: 'Documentarian'
  }).expect(200).end(function(err, res) {
   expect(res.body).toEqual(jasmine.objectContaining({
    message: 'User details updated',
    success: true
   }));
   expect(err).toBeDefined();
   expect(err).toBeNull();
   done();
  });
 });

 it("should not update user with an invalid role", function(done) {
  request.put('/api/users/' + id)
  .set('x-access-token', userToken)
  .send({
   userName: 'Haski',
   name: {
    firstName: 'Lamboni',
    lastName: 'Ruskima',
   },
   email: 'lamboniruskina@gmail.com',
   password: 'PythonPhpJavascript',
   role: '' || undefined
  })
  .expect(404)
  .end(function(err, res) {
   expect(res.body).toEqual(jasmine.objectContaining({
    message: 'Please provide your role',
    success: false
   }));
   expect(err).toBeDefined();
   expect(err).toBeNull();
   done();
  });
 });

 it("should not update invalid id", function(done) {
  var invalidId = mongoose.Types.ObjectId('4edd40c86762e0fb12000003');
  request.put('/api/users/' + invalidId)
  .set('x-access-token', userToken)
  .send({
   userName: 'Haski',
   name: {
    firstName: 'Lamboni',
    lastName: 'Ruskima',
   },
   email: 'lamboniruskina@gmail.com',
   password: 'PythonPhpJavascript',
   role: "Documentarian"
  }).expect(404).end(function(err, res) {
   expect(res.body).toEqual(jasmine.objectContaining({
    message: 'User not available',
    success: false
   }));
   expect(err).toBeDefined();
   expect(err).toBeNull();
   done();
  });
 });

 it("should be authenticated before user can update", function(done) {
  request.put('/api/users/' + id)
  .send({
   userName: 'Haski',
   name: {
    firstName: 'Lamboni',
    lastName: 'Ruskima',
   },
   email: 'lamboniruskina@gmail.com',
   password: 'PythonPhpJavascript',
   role: "Documentarian"
  }).expect(403).end(function(err, res) {
   expect(res.body).toEqual(jasmine.objectContaining({
    message: 'Please provide your token',
    success: false
   }));
   expect(err).toBeDefined();
   expect(err).toBeNull();
   done();
  });
 });
});

describe("DELETE USER DELETE /api/users/", function() {
 var id, userToken;
 beforeEach(function(done) {
  var newRole = new Role(roleData[2]);
  var newUser = new User(userData[2]);
  newUser.save();
  newRole.save();
  id = newUser._id;
  userToken = jwt.sign(newUser, config.secret, {
   expiresIn: 86400 // expires in 24hrs
  });
  done();
 });
 afterEach(function(done) {
  User.remove({}, function() {
   Role.remove({}, function() {
    done();
   });
  });
 });

 it("should delete user with a specific id", function(done) {
  request.delete('/api/users/' + id)
  .set('x-access-token', userToken)
  .expect(200)
  .end(function(err, res) {
   expect(res.body).toEqual(jasmine.objectContaining({
    message: 'User deleted successfully',
    success: true
   }));
   expect(err).toBeDefined();
   expect(err).toBeNull();
   done();
  });
 });

 it("should not delete user if not authenticated", function(done) {
  request.delete('/api/users/' + id)
  .expect(403)
  .end(function(err, res) {
   expect(res.body).toEqual(jasmine.objectContaining({
    message: 'Please provide your token',
    success: false
   }));
   expect(err).toBeDefined();
   expect(err).toBeNull();
   done();
  });
 });

 it("should not delete user with invalid id", function(done) {
  var invalidId = mongoose.Types.ObjectId('4edd40c86762e0fb12000003');
  request.delete('/api/users/' + invalidId)
  .set('x-access-token', userToken)
  .expect(404)
  .end(function(err, res) {
   expect(res.body).toEqual(jasmine.objectContaining({
    message: 'User not available',
    success: false
   }));
   expect(err).toBeDefined();
   expect(err).toBeNull();
   done();
  });
 });
});