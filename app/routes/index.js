var userRoute = require('./user.route');
var documentRoute = require('./document.route');

var defineRoute = function(router) {
  userRoute(router);
 // documentRoute(router);
};

module.exports = defineRoute;
