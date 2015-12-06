'use scrict';

var roleController = require('./../controllers/role.controller');
var userController = require('./../controllers/user.controller');

module.exports = function(router){

  // allow admin to create and read roles
  router.route('/SuperAdmin/:userName')
    .post(userController.Auth, roleController.verifyAdmin, roleController.createRole)
    .get(userController.Auth, roleController.verifyAdmin, roleController.getAllRoles);

  // allow superAdmin to update or delete a particular role
  // TODO: A middleware to authorize user to delete or update role

  router.route('/SuperAdmin/:id')
    .put(userController.Auth, roleController.updateRole)
    .delete(userController.Auth, roleController.deleteRole);

};
