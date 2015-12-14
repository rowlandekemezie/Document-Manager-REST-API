"use strict";
var mongoose = require('mongoose');
var Role = require('./role.model');
var User = require('./user.model');

//var Schema = mongoose.Shema;
var documentSchema = new mongoose.Schema({
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    Ref: 'User',
    required: true
  },

  title: {
    type: String,
    required: true
  },

  content: {
    type: String,
    required: true,
    validate: /[a-zA-Z\^w]/
  },

  role: {
    type: String,
    Ref: 'Role'
  },

  dateCreated: {
    type: String
  },

  lastModified: {
    type: String
  }
});

//set dateCreated and lastmodified to current date before saving a document
documentSchema.pre('save', function(next) {

  var doc = this;
  var datetime = new Date();

  // format the output
  var month = datetime.getMonth() + 1;
  var day = datetime.getDate();
  var year = datetime.getFullYear();
  var hour = datetime.getHours();
  if (hour < 10) hour = "0" + hour;
  var min = datetime.getMinutes();
  if (min < 10) min = "0" + min;
  var sec = datetime.getSeconds();
  if (sec < 10) sec = "0" + sec;

  // put it all togeter
  var dateTimeString = year + '-' + month + '-' + day + ' ' + hour + ':' + min + ':' + sec;
  doc.dateCreated = dateTimeString;
  doc.lastModified = dateTimeString;

  next();
});

// The mongoose API requires the model name and schema to create the model
module.exports = mongoose.model("Document", documentSchema);