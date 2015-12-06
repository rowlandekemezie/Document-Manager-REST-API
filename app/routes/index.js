var userRoute = require('./user.route');
var documentRoute = require('./document.route');
var roleRoute = require('./role.route');

/**
 * [defineRoute]
 * @param  {[FUNCTION]} router [Express router instance]
 * @return {[JSON]}        [returns Json Object]
 */
var defineRoute = function(router) {
  userRoute(router);
  documentRoute(router);
  roleRoute(router);
};

module.exports = defineRoute;