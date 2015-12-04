var mongoose = require('mongoose');
var Role = require('./role.model');
var User = require('./user.model');
var Document = require('./document.model');

module.exports = {
 Role: Role,
 User: User,
 Document: Document
};
