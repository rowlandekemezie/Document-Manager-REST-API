(function (){
	"use strict";

var express = require("express");
var morgan = require("morgan");
var mongoose = require("mongoose");
var methodOverride = require("method-override");
var bodyParser = require("body-parser");
var cookieParser = require("cookie-parser");
var session = require("express-session");
var database = require("./database");
var routes = require("./../app/routes");

// mount an instance of express router on the routes
var router = express.Router();
routes(router);

// instantiate an object instance of express
var app = express();

// connect to the database
mongoose.connect(database.db);

app.use(bodyParser.json());
app.use(session({
  secret: "I love andela",
  resave: false,
  saveUninitialized: true,
}));

app.use(methodOverride("X-HTTP-Method-Override"));
app.use(bodyParser.json({type: "application/vnd.api+json"}));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan("dev"));

// mount the router on api root directory
app.use("/api", router);

module.exports = app;
})();