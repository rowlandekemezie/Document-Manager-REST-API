var app = require('./config/express');

var port = process.env.PORT || 5555;

app.listen(port, function(){
 console.log("listening on port "+ port);
});

// expose the  server to app
module.exports = app;
