var documentController = require('./../controllers/document.controller');
var userController = require('./../controllers/user.controller');
module.exports = function(router) {

  // endpoints to create and documents
  router.route('/documents')
  	.post(userController.Auth, documentController.createDocument)
  	.get(userController.Auth, documentController.getAllDocuments);

  // endpoints to update  and delete document
  router.route('/documents/:id')
  	.get(userController.Auth, documentController.getDocumentById)
  	.put(userController.Auth, documentController.updateDocument)
  	.delete(userController.Auth, documentController.deleteDocument);

 // endpoint for user documents
 router.route('/users/:id/documents')
 	.get(userController.Auth, documentController.getAllDocumentsForUser);
};