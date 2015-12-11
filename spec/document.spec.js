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
 describe("CREATE DOCUMENT POST /api/documents/", function() {
  it("should create document for user with valid credentials", function(done) {
   request.post('/api/documents/').set('x-access-token', userToken).send(docData[0]).expect(200).end(function(err, res) {
    expect(err).not.toBeUndefined();
    expect(res.body).toEqual(jasmine.objectContaining({
     success: true,
     message: 'Document successfully created'
    }));
    done();
   });
  });
  it("should not create a document without the user authenticated", function(done) {
   request.post('/api/documents/').send(docData[1]).expect(403).end(function(err, res) {
    expect(err).not.toBeUndefined();
    expect(res.body).toEqual(jasmine.objectContaining({
     success: false,
     message: 'Please provide your token'
    }));
    done();
   });
  });
  it("should not create a document without a valid role", function(done) {
   request.post('/api/documents').set('x-access-token', userToken).expect(403).send({
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
  xit("should create document with unique title", function(done) {
   request.post('/api/documents').set('x-access-token', userToken).send(docData[0]).expect(403).end(function(err, res) {
    expect(err).toBeDefined();
    expect(err).not.toBeNull();
    expect(res.body).toEqual(jasmine.objectContaining({
     success: false,
     message: 'Document exists'
    }));
   });
  });
 });
 describe("GET DOCUMENTS GET /api/documents/", function() {
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
   for (var i = 0, n = docData.length; i < n; i++) {
    var newRole = new Role(roleData[i]);
    var newUser = new User(userData[i]);
    var docDetail = docData[i];
    docDetail.ownerId = newUser._id;
    var newDoc = new Document(docDetail);
    newUser.save();
    newRole.save();
    newDoc.save();
   }
   request.get('/api/documents/').set('x-access-token', userToken).expect(200).end(function(err, res) {
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
   });
   done();
  });
 });
});