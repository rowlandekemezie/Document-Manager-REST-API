(function() {
 'use strict';

 var roleController = require('./../controllers/role.controller'),
  userAuth = require('./../middlewares/userAuth'),
  roleAuth = require('./../middlewares/roleAuth'),
  verifyAdmin = require('./../middlewares/verifyAdmin');

 module.exports = function(router) {

  // allow admin to create and read roles
  router.route('/roles/:userName')
  	.post(userAuth, verifyAdmin, roleController.createRole)
  	.get(userAuth, verifyAdmin, roleController.getAllRoles);

  // allow authorized role to update or delete a particular role
  router.route('/roles/update/:id')
  	.get(userAuth, roleAuth, roleController.getRoleById)
  	.put(userAuth, roleAuth, roleController.updateRole)
  	.delete(userAuth, roleAuth, roleController.deleteRole);
 };
})();