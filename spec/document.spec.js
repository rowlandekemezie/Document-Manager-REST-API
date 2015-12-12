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
var _documentseeds = fs.readFileSync(__dirname + '/../seeds/documents.json');
var userData = JSON.parse(_userseeds);
var roleData = JSON.parse(_roleseeds);
var docData = JSON.parse(_documentseeds);
var User = model.User;
var Role = model.Role;
var Document = model.Document;

describe("DOCUMENT TESTS", function() {
 describe("CREATE DOCUMENT POST /api/documents/", function() {
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
  it("should create document for user with valid credentials", function(done) {
   request.post('/api/documents/').set('x-access-token', userToken).send({
    title: docData[0].title,
    content: docData[0].content,
    role: docData[0].role,
    ownerId: id
   }).expect(200).end(function(err, res) {
    expect(err).not.toBeUndefined();
    expect(res.body).toEqual(jasmine.objectContaining({
     success: true,
     message: 'Document successfully created'
    }));
    done();
   });
  });
  it("should create document with unique title", function(done) {
   var doctest = docData[0];
   doctest.ownerId = id;
   var newDoc = new Document(doctest);
   newDoc.save();
   request.post('/api/documents/')
   .set('x-access-token', userToken)
   .send(docData[0])
   .expect(403)
   .end(function(err, res) {
    expect(err).toBeDefined();
    expect(err).toBeNull();
    expect(res.body).toEqual(jasmine.objectContaining({
     success: false,
     message: 'Document already exist'
    }));
    done();
   });
  });
  it("should not create a document without the user authenticated", function(done) {
   request.post('/api/documents/')
   .send(docData[1])
   .expect(403)
   .end(function(err, res) {
    expect(err).not.toBeUndefined();
    expect(res.body).toEqual(jasmine.objectContaining({
     success: false,
     message: 'Please provide your token'
    }));
    done();
   });
  });
  it("should not create a document without a valid role", function(done) {
   request.post('/api/documents')
   .set('x-access-token', userToken)
   .expect(403)
   .send({
    title: docData[0].title,
    content: docData[0].content,
    role: 'DoesntExist' || undefined
   }).end(function(err, res) {
    expect(err).toBeDefined();
    expect(err).not.toBeNull();
    expect(res.body).toEqual(jasmine.objectContaining({
     success: false,
     message: 'Invalid role'
    }));
    done();
   });
  });
 });
 describe("GET, UPDATE, DELETE DOCUMENTS on /api/documents/", function() {
  var docId, userToken;
  beforeEach(function(done) {
   var newRole = new Role(roleData[0]);
   var newUser = new User(userData[0]);
   newRole.save();
   newUser.save();
   var docTest = docData[0];
   docTest.ownerId = newUser._id;
   var newDoc = new Document(docTest);
   newDoc.save();

   // assign newDoc._id to a global varaible to be used in this suite
   docId = newDoc._id;
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
  it("it should return all documents", function(done) {
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
   .expect(200)
   .end(function(err, res) {
    expect(err).toBeNull();
    expect(res.body.length).toBe(3);
    expect(res.body[0]).toEqual(jasmine.objectContaining({
     title: 'The regalia',
     role: 'Documentarian',
     content: 'Kings and people of royal heritage are known for their great outward look at all times as a demonstration of their royalty'
    }));
    expect(res.body[1]).toEqual(jasmine.objectContaining({
     title: 'The quest for dividends of democracy',
     role: 'Trainer',
     content: 'Democracy without dividend is arnachy in disguise. Every through democratic institution must plan to deliver to the citizens they represent'
    }));
    expect(res.body[2]).toEqual(jasmine.objectContaining({
     title: 'The beautiful ones are not yet born',
     role: 'Librarian',
     content: 'It makes more sense when people understand the essence of existence rather outward beauty that fades away and is no more'
    }));
    done();
   });
  });
  it("should return all documents for a specific user on GET /api/users/:id/documents/", function(done) {
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
   .expect(200)
   .end(function(err, res) {
    expect(res.body.length).toBe(2);
    expect(res.body[0]).toEqual(jasmine.objectContaining({
     title: 'The quest for dividends of democracy',
     role: 'Trainer',
     content: 'Democracy without dividend is arnachy in disguise. Every through democratic institution must plan to deliver to the citizens they represent'
    }));
    expect(res.body[1]).toEqual(jasmine.objectContaining({
     title: 'The beautiful ones are not yet born',
     role: 'Librarian',
     content: 'It makes more sense when people understand the essence of existence rather outward beauty that fades away and is no more'
    }));
    done();
   });
  });
  it("should not return document for an invalid user Id", function(done) {
   var invalidId = mongoose.Types.ObjectId('4edd40c86762e0fb12000003');
   request.delete('/api/documents/' + invalidId)
   .set('x-access-token', userToken)
   .expect(404)
   .end(function(err, res) {
    expect(res).not.toBeNull();
    expect(res.body).toEqual(jasmine.objectContaining({
     success: false,
     message: 'Document not available'
    }));
    done();
   });
  });
  it("should return document for an id", function(done) {
   request.get('/api/documents/' + docId)
   .set('x-access-token', userToken)
   .expect(200)
   .end(function(err, res) {
    expect(res).not.toBeNull();
    expect(res.body).toEqual(jasmine.objectContaining({
     title: 'The regalia',
     role: 'Documentarian',
     content: 'Kings and people of royal heritage are known for their great outward look at all times as a demonstration of their royalty'
    }));
    done();
   });
  });
  it("should not return any document for invalid id", function(done) {
   var invalidId = mongoose.Types.ObjectId('4edd40c86762e0fb12000003');
   request.get('/api/documents/' + invalidId)
   .set('x-access-token', userToken)
   .expect(404)
   .end(function(err, res) {
    expect(res).not.toBeNull();
    expect(res.body).toEqual(jasmine.objectContaining({
     success: false,
     message: 'No document found for the Id'
    }));
    done();
   });
  });
  it("should update document by id", function(done) {
   request.put('/api/documents/' + docId)
   .set('x-access-token', userToken)
   .expect(200)
   .send({
    title: 'Testing update route',
    content: 'Nice practicing and doing TDD'
   }).end(function(err, res) {
    expect(res.body).toEqual(jasmine.objectContaining({
     success: true,
     message: 'Document updated successfully'
    }));
    request.get('/api/documents/' + docId)
    .set('x-access-token', userToken)
    .expect(404)
    .end(function(err, res) {
     expect(res.body).toEqual(jasmine.objectContaining({
      title: 'Testing update route',
      content: 'Nice practicing and doing TDD'
     }));
     done();
    });
   });
  });
  it("should delete document by id", function(done) {
   request.delete('/api/documents/' + docId).expect(200)
   .set('x-access-token', userToken)
   .end(function(err, res) {
    expect(res.body).toEqual(jasmine.objectContaining({
     success: true,
     message: 'Document deleted successfully'
    }));
    request.get('/api/documents/' + docId)
    .expect(404)
    .set('x-access-token', userToken)
    .end(function(err, res) {
     expect(res.body).toEqual(jasmine.objectContaining({
      success: false,
      message: 'No document found for the Id'
     }));
     done();
    });
   });
  });
  it("should not delete  any document by an invalid id", function(done) {
   var invalidId = mongoose.Types.ObjectId('4edd40c86762e0fb12000003');
   request.delete('/api/documents/' + invalidId)
   .set('x-access-token', userToken)
   .expect(404)
   .end(function(err, res) {
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