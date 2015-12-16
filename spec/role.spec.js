(function (){
  "use strict";

var fs = require("fs");
var mongoose = require("mongoose");
var app = require("./../server");
var request = require("supertest")(app);
var jwt = require("jsonwebtoken");
var config = require("./../config/pass");
var userName = require("./../config/admin").admin;
var model = require("./../app/models");

var _userseeds = fs.readFileSync(__dirname + "/../seeds/users.json");
var _roleseeds = fs.readFileSync(__dirname + "/../seeds/roles.json");

var userData = JSON.parse(_userseeds);
var roleData = JSON.parse(_roleseeds);

var User = model.User;
var Role = model.Role;

describe("ROLE TESTS", function() {
 describe("CRUD ROLE", function() {
  var adminToken, roleId;
  beforeEach(function(done) {
   var newRole = new Role({
    title: "testRole"
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

  it("should create role with the right credentials", function(done) {
   request.post("/api/roles/" + userName)
   .set("x-access-token", adminToken)
   .send(roleData[1])
   .expect(200)
   .end(function(err, res) {
    expect(err).toBeNull();
    expect(err).not.toBeUndefined();
    expect(res.body).toEqual(jasmine.objectContaining({
     success: true,
     message: "Role successfuly created"
    }));
    done();
   });
  });

  it("should deny access trying to create a SuperAdmin", function(done) {
   var hackUser;
   request.post("/api/roles/" + hackUser)
   .set("x-access-token", adminToken)
   .send({
    title: "testRole"
   }).expect(401)
   .end(function(err, res) {
    expect(err).toBeNull();
    expect(err).not.toBeUndefined();
    expect(res.body).toEqual(jasmine.objectContaining({
     success: false,
     message: "Access denied"
    }));
    done();
   });
  });

  it("should create role with unique title", function(done) {
   request.post("/api/roles/" + userName)
   .set("x-access-token", adminToken)
   .send({ title: "testRole" })
   .expect(401).end(function(err, res) {
    expect(err).toBeNull();
    expect(err).not.toBeUndefined();
    expect(res.body).toEqual(jasmine.objectContaining({
     success: false,
     message: "Role already exist"
    }));
    done();
   });
  });

  it("should return all roles created", function(done) {
   for (var i = 0, n = roleData.length; i < n; i++) {
    var newRole = new Role(roleData[i]);
    newRole.save();
   }
   request.get("/api/roles/" + userName)
   .set("x-access-token", adminToken)
   .expect(200)
   .end(function(err, res) {
    expect(err).toBeNull();
    expect(res.body[0].title).toBe("testRole");
    expect(res.body[1].title).toBe("Documentarian");
    expect(res.body[2].title).toBe("Trainer");
    expect(res.body[3].title).toBe("Librarian");
    done();
   });
  });

  it("should return a specific role ", function(done) {
   request.get("/api/roles/update/" + roleId)
   .set("x-access-token", adminToken)
   .expect(200)
   .end(function(err, res) {
    expect(err).toBeNull();
    expect(res.body).toBeDefined();
    expect(res.body.title).toBe("testRole");
    done();
   });
  });

  it("should not return role for an invalid id", function(done) {
   var invalidId = mongoose.Types.ObjectId("4edd40c86762e0fb12000003");
   request.get("/api/roles/update/" + invalidId)
   .set("x-access-token", adminToken)
   .expect(404)
   .end(function(err, res) {
    expect(err).toBeNull();
    expect(res.body).toBeDefined();
    expect(res.body).toEqual(jasmine.objectContaining({
     message: "No role found for the Id",
     success: false
    }));
    done();
   });
  });

  it("should update a role that exist", function(done) {
   request.put("/api/roles/update/" + roleId)
   .set("x-access-token", adminToken)
   .send({ title: "manager" })
   .expect(200).end(function(err, res) {
    expect(err).toBeNull();
    expect(res).toBeDefined();
    expect(res.body).toEqual(jasmine.objectContaining({
     success: true,
     message: "Role successfully updated"
    }));

    request.get("/api/roles/update/" + roleId)
    .expect(200)
    .set("x-access-token", adminToken)
    .end(function(err, res) {
     expect(err).toBeNull();
     expect(res.body.title).toBe("manager");
     done();
    });
   });
  });

  it("should not update for the invalid Id", function(done) {
   var invalidId = mongoose.Types.ObjectId("4edd40c86762e0fb12000003");
   request.put("/api/roles/update/" + invalidId)
   .set("x-access-token", adminToken)
   .send({ title: "manager" })
   .expect(404).end(function(err, res) {
    expect(err).toBeNull();
    expect(res.body).toEqual(jasmine.objectContaining({
     message: "No role found for the Id",
     success: false
    }));
    done();
   });
  });

  it("should delete role that exist", function(done) {
   request.delete("/api/roles/update/" + roleId)
   .set("x-access-token", adminToken)
   .end(function(err, res) {
    expect(res.status).toBe(200);
    expect(res.unauthorized).toBe(false);
    expect(res.body).toEqual(jasmine.objectContaining({
     success: true,
     message: "Successfully deleted"
    }));

    request.get("/api/roles/update/" + roleId)
    .set("x-access-token", adminToken)
    .expect(404).end(function(err, res) {
     expect(res.body).toEqual(jasmine.objectContaining({
      success: false,
      message: "No role found for the Id"
     }));
     done();
    });
   });
  });

  it("should not delete invalid Id", function(done) {
   var invalidId = mongoose.Types.ObjectId("4edd40c86762e0fb12000003");
   request.delete("/api/roles/update/" + invalidId)
   .set("x-access-token", adminToken)
   .expect(404)
   .end(function(err, res) {
    expect(err).toBeNull();
    expect(res.body).toEqual(jasmine.objectContaining({
     message: "Role not found",
     success: false
    }));
    done();
   });
  });
 });
});
})();