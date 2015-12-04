var mongoose = require('mongoose');
var Role = require('./role.model');
var User = require('./user.model');
//var Schema = mongoose.Shema;
var documentSchema = new mongoose.Schema({

 ownerId: {
  type: mongoose.Schema.Types.ObjectId,
  Ref: 'User'
 },
 title: {
  type: String,
 },
 content: {
  type: String,
  require: true,
  validate: /[a-zA-Z\^w]/
 },

 role: {
  type: mongoose.Schema.Types.ObjectId,
  Ref: {$circular : 'Role'}
 },
 dateCreated: {
  type: Date,
  default: Date.now
 },
 lastModified: {
  type: Date,
  default: Date.now
 }
});

// before saving, do this:
documentSchema.pre('save', function(next) {
 now = new Date();
 this.lastModified = now;
 if (!this.dateCreated) {
  this.dateCreated = now;
 }
 next();
});

// The mongoose API requires the model name and schema to create the model
module.exports = mongoose.model("Document", documentSchema);
