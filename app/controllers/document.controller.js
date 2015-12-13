var models = require('./../models');
var User = models.User;
var Role = models.Role;
var Document = models.Document;
module.exports = {
  /**
   * [createDocument method]
   * @param  {[JSON]} req [http request body]
   * @param  {[JSON]} res [response on request]
   * @return {[JSON]}     [status]
   */
  createDocument: function(req, res) {
    var doc = req.body;
    Role.findOne({
      title: doc.role
    }, function(err, role) {
      if (err) {
        res.send(err);
      } else {
        if (!role) {
          res.status(401).json({
            success: false,
            message: 'Invalid role'
          });
        } else if (role) {
          Document.findOne({
            title: doc.title
          }, function(err, docs) {
            if (docs) {
              res.status(403).json({
                success: false,
                message: 'Document already exist'
              });
            } else if (!docs) {
              var userId = req.decoded._id;
              req.body.ownerId = userId;
              var newDoc = new Document(doc);
              newDoc.save(function(err) {
                if (err) {
                  res.send(err);
                } else {
                  res.status(200).json({
                    success: true,
                    message: 'Document successfully created'
                  });
                }
              });
            }
          });
        }
      }
    });
  },
  /**
   * [getAllDocuments method]
   * @param  {[JSON]} req [http request to get endpoint]
   * @param  {[JSON]} res [response on request]
   * @return {[JSON]}     [Status and json documents on success]
   */
  getAllDocuments: function(req, res) {
    Document.find({}).limit(req.params.limit).exec(function(err, docs) {
      if (err) {
        res.send(err);
      } else if (!docs) {
        res.send({
          success: false,
          message: 'No document found'
        });
      } else {
        res.json(docs);
      }
    });
  },
  /**
   * [getDocumentById method]
   * @param  {[JSON]} req [request params]
   * @param  {[JSON]} res [response on request]
   * @return {[JSON]}     [status]
   */
  getDocumentById: function(req, res) {
    Document.findOne({
      _id: req.params.id
    }, function(err, doc) {
      if (err) {
        res.send(err);
      } else if (!doc) {
        res.status(404).json({
          success: false,
          message: 'No document found for the Id'
        });
      } else {
        res.json(doc);
      }
    });
  },
  /**
   * [updateDocument method]
   * @param  {[JSON]} req [request params]
   * @param  {[JSON]} res [response on request]
   * @return {[JSON]}     [status of search result]
   */
  updateDocument: function(req, res) {

    Document.findByIdAndUpdate(req.params.id, req.body, function(err, doc) {
      if (err) {
        res.send(err);
      } else if (!doc) {
        res.status(404).json({
          success: false,
          message: 'Document not available'
        });
      } else {
        res.status(200).json({
          success: true,
          message: 'Document updated successfully'
        });
      }
    });
  },

  /**
   * [deleteDocument method]
   * @param  {[JSON]} req [request params]
   * @param  {[JSON]} res [response on request]
   * @return {[JSON]}     [status]
   */
  deleteDocument: function(req, res) {
    Document.findByIdAndRemove(req.params.id, req.body, function(err, doc) {
      if (err) {
        res.send(err);
      } else if (!doc) {
        res.status(404).json({
          success: false,
          message: 'Document not available'
        });
      } else {
        res.status(200).json({
          success: true,
          message: 'Document deleted successfully'
        });
      }
    });
  },

  /**
   * [getAllDocumentsForUser method]
   * @param  {[JSON]} req [http request params]
   * @param  {[JSON]} res [http response on response]
   * @return {[JSON]}     [json status of the request]
   */
  getAllDocumentsForUser: function(req, res) {
    Document.find({
      ownerId: req.params.id
    }, function(err, docs) {
      if (err) {
        res.send(err);
      } else if (!docs) {
        res.status(404).json({
          success: false,
          message: 'User have no document'
        });
      } else {
        res.status(200).json(docs);
      }
    });
  }
};