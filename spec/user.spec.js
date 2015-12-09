var fs = require('fs');
var request = require('supertest');
var model = require('./../app/models');
var app = require('./../server');
var _userseeds = fs.readFileSync(__dirname + '/../seeds/users.json');
var _roleseeds = fs.readFileSync(__dirname + '/../seeds/roles.json');
var User = model.User;
var Role = model.Role;
// pares the data for use in the test
var _userData = JSON.parse(_userseeds);
var _roleData = JSON.parse(_roleseeds);

//describe('to validate users login and logout', function() {

 // beforeEach(function(done) {
  var newRole = new Role(_roleData[0]);
  newRole.save(function(err, role) {
   if (err) {
    console.log(err);
   }
  });

 var newUser = new User(_userData[0]);
  newUser.save(function(err, user) {
   if (err) {
    console.log(err);
   }
  });
//  done();
 //});
 //afterEach(function(done) {
//User.remove({}, function() {
 //  Role.remove({}, function() {
  //  done();
  // });
  //});
 //});
 // it("should login user on /users/login endpoint", function(done) {
 //  request(app)
 //  .post('/users/login')
 //  .send({
 //   userName: _userData[0].userName,
 //   password: _userData[0].password
 //  }).end(function(err, res) {
 //   expect(res.body).toEqual(jasmine.objectContaining({
 //    message: 'You are logged in',
 //    success: true
 //   }));
 //   expect(res.statusCode).toBe(200);
 //   expect(res.body).not.toBeUndefined();
 //   expect(res.body).not.toBeNull();
 //   expect(err).toBeUndefined();
 //   done();
 //  });
 //  });
 //});
