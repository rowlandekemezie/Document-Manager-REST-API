(function (){
  'use strict';

  var mongoose = require('mongoose'),
    app = require('./../server'),
    request = require('supertest')(app),
    jwt = require('jsonwebtoken'),
    config = require('./../config/pass'),
    userName = require('./../config/admin').admin,
    model = require('./../app/models'),

    userData = require('./../seeds/users.json'),
    roleData = require('./../seeds/roles.json'),

    User = model.User,
    Role = model.Role;

  describe('ROLE TESTS', function() {
   describe('CRUD ROLE', function() {
    var adminToken, roleId;
    beforeEach(function(done) {
     var newRole = new Role({
      title: 'testRole'
     });
     var newUser = new User(userData[0]);
     newRole.save();
     newUser.save();
     roleId = newRole._id;
     adminToken = jwt.sign(newUser, config.secret, {
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

    it('should create role with the right credentials', function(done) {
     request.post('/api/roles/' + userName)
     .set('x-access-token', adminToken)
     .send(roleData[1])
     .end(function(err, res) {
      expect(res.status).toBe(200);
      expect(err).toBeNull();
      expect(err).not.toBeUndefined();
      expect(res.body).toEqual(jasmine.objectContaining({
       success: true,
       message: 'Role successfuly created'
      }));
      done();
     });
    });

    it('should deny access trying to create a SuperAdmin', function(done) {
     var hackUser;
     request.post('/api/roles/' + hackUser)
     .set('x-access-token', adminToken)
     .send({
      title: 'testRole'
     })
     .end(function(err, res) {
      expect(res.status).toBe(401);
      expect(err).toBeNull();
      expect(err).not.toBeUndefined();
      expect(res.body).toEqual(jasmine.objectContaining({
       success: false,
       message: 'Access denied'
      }));
      done();
     });
    });

    it('should create role with unique title', function(done) {
     request.post('/api/roles/' + userName)
     .set('x-access-token', adminToken)
     .send({ title: 'testRole' })
     .end(function(err, res) {
      expect(res.status).toBe(409);
      expect(err).toBeNull();
      expect(err).not.toBeUndefined();
      expect(res.body).toEqual(jasmine.objectContaining({
       success: false,
       message: 'Role already exist'
      }));
      done();
     });
    });

    it('should return all roles created', function(done) {
     for (var i = 0, n = roleData.length; i < n; i++) {
      var newRole = new Role(roleData[i]);
      newRole.save();
     }
     request.get('/api/roles/' + userName)
     .set('x-access-token', adminToken)
     .end(function(err, res) {
      expect(res.status).toBe(200);
      expect(err).toBeNull();
      expect(res.body[0].title).toBe('testRole');
      expect(res.body[1].title).toBe('Documentarian');
      expect(res.body[2].title).toBe('Trainer');
      expect(res.body[3].title).toBe('Librarian');
      done();
     });
    });

    it('should return a specific role ', function(done) {
     request.get('/api/roles/update/' + roleId)
     .set('x-access-token', adminToken)
     .end(function(err, res) {
      expect(res.status).toBe(200);
      expect(err).toBeNull();
      expect(res.body).toBeDefined();
      expect(res.body.title).toBe('testRole');
      done();
     });
    });

    it('should not return role for an invalid id', function(done) {
     var invalidId = mongoose.Types.ObjectId('4edd40c86762e0fb12000003');
     request.get('/api/roles/update/' + invalidId)
     .set('x-access-token', adminToken)
     .end(function(err, res) {
      expect(res.status).toBe(404);
      expect(err).toBeNull();
      expect(res.body).toBeDefined();
      expect(res.body).toEqual(jasmine.objectContaining({
       message: 'No role found for the Id',
       success: false
      }));
      done();
     });
    });

    it('should update a role that exist', function(done) {
     request.put('/api/roles/update/' + roleId)
     .set('x-access-token', adminToken)
     .send({ title: 'manager' })
     .end(function(err, res) {
      expect(res.status).toBe(200);
      expect(err).toBeNull();
      expect(res).toBeDefined();
      expect(res.body).toEqual(jasmine.objectContaining({
       success: true,
       message: 'Role successfully updated'
      }));

      request.get('/api/roles/update/' + roleId)
      .set('x-access-token', adminToken)
      .end(function(err, res) {
       expect(res.status).toBe(200);
       expect(err).toBeNull();
       expect(res.body.title).toBe('manager');
       done();
      });
     });
    });

    it('should not update for the invalid Id', function(done) {
     var invalidId = mongoose.Types.ObjectId('4edd40c86762e0fb12000003');
     request.put('/api/roles/update/' + invalidId)
     .set('x-access-token', adminToken)
     .send({ title: 'manager' })
     .end(function(err, res) {
      expect(res.status).toBe(404);
      expect(err).toBeNull();
      expect(res.body).toEqual(jasmine.objectContaining({
       message: 'No role found for the Id',
       success: false
      }));
      done();
     });
    });

    it('should delete role that exist', function(done) {
     request.delete('/api/roles/update/' + roleId)
     .set('x-access-token', adminToken)
     .end(function(err, res) {
      expect(res.status).toBe(200);
      expect(res.unauthorized).toBe(false);
      expect(res.body).toEqual(jasmine.objectContaining({
       success: true,
       message: 'Successfully deleted'
      }));

      request.get('/api/roles/update/' + roleId)
      .set('x-access-token', adminToken)
      .end(function(err, res) {
       expect(res.status).toBe(404);
       expect(res.body).toEqual(jasmine.objectContaining({
        success: false,
        message: 'No role found for the Id'
       }));
       done();
      });
     });
    });

    it('should not delete invalid Id', function(done) {
     var invalidId = mongoose.Types.ObjectId('4edd40c86762e0fb12000003');
     request.delete('/api/roles/update/' + invalidId)
     .set('x-access-token', adminToken)
     .end(function(err, res) {
      expect(res.status).toBe(404);
      expect(err).toBeNull();
      expect(res.body).toEqual(jasmine.objectContaining({
       message: 'Role not found',
       success: false
      }));
      done();
     });
    });
   });
  });
})();