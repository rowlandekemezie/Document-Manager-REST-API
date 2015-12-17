(function() {
 'use strict';

 var mongoose = require('mongoose'),
  app = require('./../server'),
  request = require('supertest')(app),
  jwt = require('jsonwebtoken'),
  config = require('./../config/pass'),
  model = require('./../app/models'),
  date = require('./../seeds/dateHelper')(),
  userData = require('./../seeds/users.json'),
  roleData = require('./../seeds/roles.json'),
  docData = require('./../seeds/documents.json'),

  User = model.User,
  Role = model.Role,
  Document = model.Document;

 describe('DOCUMENT TESTS', function() {
  describe('CREATE DOCUMENT POST /api/documents/', function() {
   var id, userToken;
   beforeEach(function(done) {
    var newUser = new User(userData[0]);
    var newRole = new Role(roleData[0]);
    newUser.save();
    newRole.save();
    id = newUser._id;
    userToken = jwt.sign(newUser, config.secret, {
     expiresIn: 86400 // expires in 24 hrs
    });
    done();
   });
   afterEach(function(done) {
    Document.remove({}, function() {
     User.remove({}, function() {
      Role.remove({}, function() {
       done();
      });
     });
    });
   });

   it('should create document for user with valid credentials', function(done) {
    request.post('/api/documents/')
    .set('x-access-token', userToken)
    .send({
     title: docData[0].title,
     content: docData[0].content,
     role: docData[0].role,
     ownerId: id
    })
    .end(function(err, res) {
     expect(res.status).toBe(200);
     expect(err).not.toBeUndefined();
     expect(res.body).toEqual(jasmine.objectContaining({
      success: true,
      message: 'Document successfully created'
     }));
     done();
    });
   });

   it('should create document with unique title', function(done) {
    var doctest = docData[0];
    doctest.ownerId = id;
    var newDoc = new Document(doctest);
    newDoc.save();
    request.post('/api/documents/')
    .set('x-access-token', userToken)
    .send(docData[0])
    .end(function(err, res) {
     expect(res.status).toBe(409);
     expect(err).toBeDefined();
     expect(err).toBeNull();
     expect(res.body).toEqual(jasmine.objectContaining({
      success: false,
      message: 'Document already exist'
     }));
     done();
    });
   });

   it('should not create document for authenticated user', function(done) {
    request.post('/api/documents/')
    .send(docData[1])
    .end(function(err, res) {
     expect(res.status).toBe(403);
     expect(err).not.toBeUndefined();
     expect(res.body).toEqual(jasmine.objectContaining({
      success: false,
      message: 'Please provide your token'
     }));
     done();
    });
   });

   it('should not create a document without a valid role', function(done) {
    request.post('/api/documents')
    .set('x-access-token', userToken)
    .send({
     title: docData[0].title,
     content: docData[0].content,
     role: 'DoesntExist' || undefined
    })
    .end(function(err, res) {
     expect(res.status).toBe(406);
     expect(err).toBeDefined();
     expect(err).toBeNull();
     expect(res.body).toEqual(jasmine.objectContaining({
      success: false,
      message: 'Invalid role'
     }));
     done();
    });
   });
  });

  describe('GET, UPDATE, DELETE DOCUMENTS on /api/documents/', function() {
   var docId, roleTitle, userToken, limit = 1;
   beforeEach(function(done) {
    var newRole = new Role(roleData[0]);
    var newUser = new User(userData[0]);
    newRole.save();
    newUser.save();
    var docTest = docData[0];
    docTest.ownerId = newUser._id;
    roleTitle = docTest.role;
    var newDoc = new Document(docTest);
    newDoc.save();
    // assign newDoc._id to a global varaible to be used in this suite
    docId = newDoc._id;
    date = newDoc.dateCreated;
    userToken = jwt.sign(newUser, config.secret, {
     expiresIn: 86400 // expires in 24 hrs
    });
    done();
   });
   afterEach(function(done) {
    Document.remove({}, function() {
     User.remove({}, function() {
      Role.remove({}, function() {
       done();
      });
     });
    });
   });

   it('it should return all documents', function(done) {
    for (var i = 1, n = docData.length; i < n; i++) {
     var newRole = new Role(roleData[i]);
     var newUser = new User(userData[i]);
     newRole.save();
     newUser.save();
     var docDetail = docData[i];
     docDetail.ownerId = newUser._id;
     var newDoc = new Document(docDetail);
     newDoc.save();
    }
    request.get('/api/documents/')
    .set('x-access-token', userToken)
    .end(function(err, res) {
     expect(res.status).toBe(200);
     expect(err).toBeNull();
     expect(res.body.length).toBe(3);
     expect(res.body[0]).toEqual(jasmine.objectContaining({
      title: 'The regalia',
      role: 'Documentarian',
      content: 'Kings and people of royal heritage are known for their ' +
      'great outward look at all times as a demonstration of their royalty'
     }));
     expect(res.body[1]).toEqual(jasmine.objectContaining({
      title: 'The quest for dividends of democracy',
      role: 'Trainer',
      content: 'Democracy without dividend is arnachy in disguise. ' +
      'Every through democratic institution must plan to deliver ' +
      'to the citizens they represent'
     }));
     expect(res.body[2]).toEqual(jasmine.objectContaining({
      title: 'The beautiful ones are not yet born',
      role: 'Librarian',
      content: 'It makes more sense when people understand the essence of ' +
      'existence rather outward beauty that fades away and is no more'
     }));
     done();
    });
   });

   it('should return all documents limited by a limit value', function(done) {
    request.get('/api/documents/limit/' + limit)
    .set('x-access-token', userToken)
    .end(function(err, res) {
     expect(res.status).toBe(200);
     expect(res.body.length).toBe(1);
     expect(res.body[0]).toEqual(jasmine.objectContaining({
      title: 'The regalia',
      role: 'Documentarian',
      content: 'Kings and people of royal heritage are known for their ' +
      'great outward look at all times as a demonstration of their royalty'
     }));
     done();
    });
   });

   it('should return all documents for a user on', function(done) {
    var user1 = new User(userData[1]);
    user1.save();
    var doc1 = docData[1];
    var doc2 = docData[2];
    doc1.ownerId = user1._id;
    doc2.ownerId = user1._id;
    var newDoc1 = new Document(doc1);
    var newDoc2 = new Document(doc2);
    newDoc1.save();
    newDoc2.save();
    request.get('/api/users/' + user1._id + '/documents')
    .set('x-access-token', userToken)
    .end(function(err, res) {
     expect(res.status).toBe(200);
     expect(res.body.length).toBe(2);
     expect(res.body[0]).toEqual(jasmine.objectContaining({
      title: 'The quest for dividends of democracy',
      role: 'Trainer',
      content: 'Democracy without dividend is arnachy in disguise. ' +
      'Every through democratic institution must plan to ' +
      'deliver to the citizens they represent'
     }));
     expect(res.body[1]).toEqual(jasmine.objectContaining({
      title: 'The beautiful ones are not yet born',
      role: 'Librarian',
      content: 'It makes more sense when people understand the essence ' +
      'of existence rather outward beauty that fades away and is no more'
     }));
     done();
    });
   });

   it('should return documents for a specfic role', function(done) {
    request.get('/api/documents/role/' + roleTitle + '/' + limit)
    .set('x-access-token', userToken).end(function(err, res) {
     expect(res.status).toBe(200);
     expect(res.body.length).toEqual(1);
     expect(res.body[0]).toEqual(jasmine.objectContaining({
      title: 'The regalia',
      content: 'Kings and people of royal heritage are known for their ' +
      'great outward look at all times as a demonstration of their royalty',
      role: 'Documentarian'
     }));
     done();
    });
   });

   it('should return documents for a specfic date', function(done) {
    request.get('/api/documents/date/' + date + '/' + limit)
    .set('x-access-token', userToken).end(function(err, res) {
     expect(res.status).toBe(200);
     expect(res.body.length).toEqual(1);
     expect(res.body[0]).toEqual(jasmine.objectContaining({
      title: 'The regalia',
      content: 'Kings and people of royal heritage are known for their ' +
      'great outward look at all times as a demonstration of their royalty',
      role: 'Documentarian'
     }));
     done();
    });
   });

   it('should not return document for an invalid user Id', function(done) {
    var invalidId = mongoose.Types.ObjectId('4edd40c86762e0fb12000003');
    request.delete('/api/documents/' + invalidId)
    .set('x-access-token', userToken)
    .end(function(err, res) {
     expect(res.status).toBe(404);
     expect(res).not.toBeNull();
     expect(res.body).toEqual(jasmine.objectContaining({
      success: false,
      message: 'Document not available'
     }));
     done();
    });
   });

   it('should return document for an id', function(done) {
    request.get('/api/documents/' + docId)
    .set('x-access-token', userToken)
    .end(function(err, res) {
     expect(res.status).toBe(200);
     expect(res).not.toBeNull();
     expect(res.body).toEqual(jasmine.objectContaining({
      title: 'The regalia',
      role: 'Documentarian',
      content: 'Kings and people of royal heritage are known for their great ' +
      'outward look at all times as a demonstration of their royalty'
     }));
     done();
    });
   });

   it('should not return any document for invalid id', function(done) {
    var invalidId = mongoose.Types.ObjectId('4edd40c86762e0fb12000003');
    request.get('/api/documents/' + invalidId)
    .set('x-access-token', userToken)
    .end(function(err, res) {
     expect(res.status).toBe(404);
     expect(res).not.toBeNull();
     expect(res.body).toEqual(jasmine.objectContaining({
      success: false,
      message: 'No document found for the Id'
     }));
     done();
    });
   });

   it('should update document by id', function(done) {
    request.put('/api/documents/' + docId)
    .set('x-access-token', userToken)
    .send({
     title: 'Testing update route',
     content: 'Nice practicing and doing TDD'
    })
    .end(function(err, res) {
     expect(res.status).toBe(200);
     expect(res.body).toEqual(jasmine.objectContaining({
      success: true,
      message: 'Document updated successfully'
     }));
     request.get('/api/documents/' + docId)
     .set('x-access-token', userToken)
     .end(function(err, res) {
      expect(res.status).toBe(200);
      expect(res.body).toEqual(jasmine.objectContaining({
       title: 'Testing update route',
       content: 'Nice practicing and doing TDD'
      }));
      done();
     });
    });
   });

   it('should delete document by id', function(done) {
    request.delete('/api/documents/' + docId)
    .set('x-access-token', userToken)
    .end(function(err, res) {
     expect(res.status).toBe(200);
     expect(res.body).toEqual(jasmine.objectContaining({
      success: true,
      message: 'Document deleted successfully'
     }));
     request.get('/api/documents/' + docId)
     .set('x-access-token', userToken)
     .end(function(err, res) {
      expect(res.status).toBe(404);
      expect(res.body).toEqual(jasmine.objectContaining({
       success: false,
       message: 'No document found for the Id'
      }));
      done();
     });
    });
   });

   it('should not delete  any document by an invalid id', function(done) {
    var invalidId = mongoose.Types.ObjectId('4edd40c86762e0fb12000003');
    request.delete('/api/documents/' + invalidId)
    .set('x-access-token', userToken)
    .end(function(err, res) {
     expect(res.status).toBe(404);
     expect(res).not.toBeNull();
     expect(res.body).toEqual(jasmine.objectContaining({
      success: false,
      message: 'Document not available'
     }));
     done();
    });
   });
  });
 });
})();