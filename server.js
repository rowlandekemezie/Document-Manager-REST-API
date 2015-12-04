var express = require('express');
var app = require('./app/config/express');

var port = process.env.PORT || 5555;

app.listen(port, function(){
 console.log("listening on port "+ port);
});
  module.exports = app;
