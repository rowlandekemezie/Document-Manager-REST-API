(function() {
  'use strict';

  var env = process.env.NODE_ENV || 'development';
  if (env === 'development') {
    require('dotenv').load();
  }

  var database = require('./config/database')[env],
    mongoose = require('mongoose'),
    app = require('./config/express'),
    port = process.env.PORT || 5555;

  mongoose.connect(database.url);

  app.listen(port, function() {
    console.log('listening on port ' + port);
  });

  // expose the  server to app
  module.exports = app;
})();