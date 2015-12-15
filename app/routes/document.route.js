"use strict";
var documentController = require('./../controllers/document.controller');
var userController = require('./../controllers/user.controller');
var userAuth = require('./../middlewares/userAuth');
module.exports = function(router) {

  // endpoints to create and documents
  router.route('/documents')
  	.post(userAuth, documentController.createDocument)
  	.get(userAuth, documentController.getAllDocuments);

  // endpoint for getting all document by limit
  router.route('/documents/limit/:limit')
  	.get(userAuth, documentController.getAllDocuments);

  // endpoints to update  and delete document
  router.route('/documents/:id')
  	.get(userAuth, documentController.getDocumentById)
  	.put(userAuth, documentController.updateDocument)
  	.delete(userAuth, documentController.deleteDocument);

 // endpoint for user documents
 router.route('/users/:id/documents')
 	.get(userAuth, documentController.getAllDocumentsForUser);

 // endpoint for documents accessible to a role
 router.route('/documents/role/:title/:limit')
 	.get(userAuth, documentController.getAllDocumentsForRole);

 // endpoint for documents  created on a specific date
 router.route('/documents/date/:date/:limit')
 	.get(userAuth, documentController.getDocumentByDate);
};
